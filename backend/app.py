from flask import Flask, g, jsonify, request, send_file
from flask_cors import CORS
import sys
import os
import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import uuid4
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from dotenv import load_dotenv
from werkzeug.exceptions import RequestEntityTooLarge

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
load_dotenv(PROJECT_DIR / '.env')

# Add parent directory to path to import python modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python'))

from syltostr import extract_pdf_text, query_gemini_for_events, validate_event_types, save_ics
from auth import require_auth

app = Flask(__name__)
allowed_origins = [
    origin.strip()
    for origin in os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
    if origin.strip()
]
CORS(app, origins=allowed_origins)

UPLOAD_FOLDER = BASE_DIR / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)
MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024
MAX_REQUEST_SIZE_BYTES = 100 * 1024 * 1024
app.config['MAX_CONTENT_LENGTH'] = MAX_REQUEST_SIZE_BYTES
CALENDAR_RETENTION = timedelta(hours=24)
DEFAULT_CALENDAR_TIMEZONE = os.getenv('CALENDAR_TIMEZONE', 'America/New_York')


def cleanup_expired_calendars() -> None:
    cutoff = datetime.now(UTC) - CALENDAR_RETENTION
    for metadata_path in UPLOAD_FOLDER.glob('*.json'):
        try:
            metadata = json.loads(metadata_path.read_text())
            created_at = datetime.fromisoformat(metadata['createdAt'])
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=UTC)
            if created_at < cutoff:
                calendar_path = UPLOAD_FOLDER / metadata['filename']
                calendar_path.unlink(missing_ok=True)
                metadata_path.unlink(missing_ok=True)
        except (KeyError, OSError, ValueError, json.JSONDecodeError):
            # An incomplete metadata file cannot be trusted or served.
            metadata_path.unlink(missing_ok=True)


def is_valid_pdf(file) -> bool:
    filename = file.filename or ''
    if not filename.lower().endswith('.pdf'):
        return False

    stream = file.stream
    try:
        stream.seek(0, os.SEEK_END)
        if stream.tell() > MAX_PDF_SIZE_BYTES:
            return False
        stream.seek(0)
        return stream.read(5) == b'%PDF-'
    finally:
        stream.seek(0)


def save_user_calendar(calendar, user_id: str) -> tuple[str, str]:
    calendar_id = uuid4().hex
    filename = f'{calendar_id}.ics'
    metadata_filename = f'{calendar_id}.json'
    (UPLOAD_FOLDER / filename).write_text(calendar.serialize(), encoding='utf-8')
    (UPLOAD_FOLDER / metadata_filename).write_text(
        json.dumps(
            {
                'ownerUid': user_id,
                'filename': filename,
                'createdAt': datetime.now(UTC).isoformat(),
            }
        ),
        encoding='utf-8',
    )
    return calendar_id, filename


def resolve_calendar_timezone(timezone_name: str | None) -> str:
    """Use the browser's IANA timezone when valid, with a configured fallback."""
    try:
        return ZoneInfo(timezone_name or DEFAULT_CALENDAR_TIMEZONE).key
    except ZoneInfoNotFoundError:
        return DEFAULT_CALENDAR_TIMEZONE


@app.errorhandler(RequestEntityTooLarge)
def request_too_large(_error):
    return jsonify({'error': 'Uploads may total at most 100 MB, with a 20 MB limit per PDF.'}), 413

@app.route('/api/process-syllabi', methods=['POST'])
@require_auth
def process_syllabi():
    try:
        cleanup_expired_calendars()
        if not request.files:
            return jsonify({'error': 'No files uploaded'}), 400

        calendar_timezone = resolve_calendar_timezone(request.form.get('timeZone'))

        all_events = []
        files_processed = 0
        file_errors = []

        for key in request.files:
            file = request.files[key]
            if file.filename == '':
                continue

            if not is_valid_pdf(file):
                file_errors.append({
                    'filename': file.filename,
                    'error': 'Upload a valid PDF no larger than 20 MB.',
                })
                continue

            try:
                pdf_text = extract_pdf_text(file)
                events = query_gemini_for_events(pdf_text)
                events = validate_event_types(events)
                all_events.extend(events)
                files_processed += 1
            except Exception as e:
                app.logger.exception('Unable to process %s', file.filename)
                file_errors.append({'filename': file.filename, 'error': str(e)})

        if files_processed == 0:
            return jsonify({
                'error': 'No files could be processed.',
                'fileErrors': file_errors,
            }), 400

        calendar = save_ics(all_events, calendar_timezone)
        calendar_id, _ = save_user_calendar(calendar, g.user_id)
        return jsonify({
            'success': True,
            'eventCount': len(all_events),
            'filesProcessed': files_processed,
            'fileErrors': file_errors,
            'calendarId': calendar_id,
            'calendarUrl': f'/api/download/{calendar_id}',
            'timeZone': calendar_timezone,
            'events': all_events
        })
    except Exception as e:
        app.logger.exception('Unable to create calendar')
        return jsonify({'error': 'We could not create your calendar. Please try again.'}), 500

@app.route('/api/download/<calendar_id>', methods=['GET'])
@require_auth
def download_calendar(calendar_id):
    try:
        cleanup_expired_calendars()
        if len(calendar_id) != 32 or any(character not in '0123456789abcdef' for character in calendar_id):
            return jsonify({'error': 'File not found'}), 404
        metadata_path = UPLOAD_FOLDER / f'{calendar_id}.json'
        if not metadata_path.is_file():
            return jsonify({'error': 'File not found'}), 404
        metadata = json.loads(metadata_path.read_text(encoding='utf-8'))
        if metadata.get('ownerUid') != g.user_id:
            return jsonify({'error': 'You do not have access to this calendar.'}), 403
        filepath = UPLOAD_FOLDER / metadata['filename']
        if not filepath.is_file():
            return jsonify({'error': 'File not found'}), 404
        return send_file(
            filepath,
            mimetype='text/calendar',
            as_attachment=True,
            download_name='syl-cal-calendar.ics',
        )
    except (OSError, KeyError, json.JSONDecodeError):
        app.logger.exception('Unable to retrieve calendar')
        return jsonify({'error': 'Calendar could not be retrieved.'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})

if __name__ == '__main__':
    if not os.getenv('GEMINI_API_KEY'):
        print("WARNING: GEMINI_API_KEY environment variable is not set!")
    print("Starting Syl-Cal backend server...")
    print("Make sure GEMINI_API_KEY and FIREBASE_SERVICE_ACCOUNT_PATH are set")
    app.run(debug=os.getenv('FLASK_DEBUG') == '1', port=5000)
