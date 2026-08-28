import io
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import app  # noqa: E402


class ApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.original_upload_folder = app.UPLOAD_FOLDER
        app.UPLOAD_FOLDER = Path(self.temp_dir.name)
        self.client = app.app.test_client()
        self.auth_patch = patch('auth.verify_bearer_token', return_value=({'uid': 'student-a'}, None))
        self.auth_patch.start()

    def tearDown(self):
        self.auth_patch.stop()
        app.UPLOAD_FOLDER = self.original_upload_folder
        self.temp_dir.cleanup()

    def test_health_check_is_public(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)

    def test_upload_requires_authentication(self):
        self.auth_patch.stop()
        response = self.client.post('/api/process-syllabi')
        self.auth_patch.start()
        self.assertEqual(response.status_code, 401)

    def test_invalid_pdf_returns_actionable_error(self):
        response = self.client.post(
            '/api/process-syllabi',
            data={'file': (io.BytesIO(b'not a pdf'), 'notes.txt')},
            content_type='multipart/form-data',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('fileErrors', response.get_json())

    @patch.object(app, 'query_gemini_for_events', return_value=[{'date': '2026-09-01', 'description': 'First class', 'type': 'other'}])
    @patch.object(app, 'extract_pdf_text', return_value='Syllabus text')
    def test_calendar_is_private_to_owner(self, _extract, _query):
        response = self.client.post(
            '/api/process-syllabi',
            data={'file': (io.BytesIO(b'%PDF-1.7 sample'), 'course.PDF')},
            content_type='multipart/form-data',
        )
        self.assertEqual(response.status_code, 200)
        calendar_id = response.get_json()['calendarId']

        response = self.client.get(f'/api/download/{calendar_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, 'text/calendar')
        response.close()

        with patch('auth.verify_bearer_token', return_value=({'uid': 'student-b'}, None)):
            response = self.client.get(f'/api/download/{calendar_id}')
        self.assertEqual(response.status_code, 403)

    def test_event_validation_drops_invalid_model_output(self):
        events = app.validate_event_types([
            {'date': '2026-09-01', 'startTime': None, 'endTime': None, 'description': 'Exam', 'type': 'exam'},
            {'date': 'not-a-date', 'description': 'Broken', 'type': 'exam'},
            {'date': '2026-09-02', 'description': '', 'type': 'assignment'},
        ])
        self.assertEqual(events, [{
            'date': '2026-09-01',
            'startTime': None,
            'endTime': None,
            'description': 'Exam',
            'type': 'exam',
        }])

    def test_calendar_uses_all_day_dates_and_browser_timezone(self):
        calendar = app.save_ics([
            {'date': '2026-09-10', 'startTime': None, 'endTime': None, 'description': 'HW1 Due', 'type': 'assignment'},
            {'date': '2026-12-10', 'startTime': '19:00', 'endTime': '21:30', 'description': 'Final Exam', 'type': 'exam'},
        ], 'America/Los_Angeles')
        serialized = calendar.serialize()
        self.assertIn('DTSTART;VALUE=DATE:20260910', serialized)
        self.assertIn('DTSTART:20261211T030000Z', serialized)
        self.assertIn('DTEND:20261211T053000Z', serialized)

    def test_invalid_browser_timezone_uses_default(self):
        self.assertEqual(app.resolve_calendar_timezone('not/a-timezone'), app.DEFAULT_CALENDAR_TIMEZONE)

    @patch.object(app, 'query_gemini_for_events', return_value=[])
    def test_real_pdf_upload_does_not_depend_on_form_field_name(self, _query):
        document = pymupdf.open()
        page = document.new_page()
        page.insert_text((72, 72), 'BIO 101 — Exam on September 1, 2026')
        pdf_bytes = document.tobytes()
        document.close()

        response = self.client.post(
            '/api/process-syllabi',
            data={'file0': (io.BytesIO(pdf_bytes), 'biology.pdf')},
            content_type='multipart/form-data',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['filesProcessed'], 1)
