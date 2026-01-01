from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sys
import os
import io
from datetime import datetime

# Add parent directory to path to import python modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python'))

from syltostr import extract_pdf_text, query_gpt_for_events, validate_event_types, save_ics

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/process-syllabi', methods=['POST'])
def process_syllabi():
    try:
        # Check if files were uploaded
        if not request.files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        all_events = []
        files_processed = 0
        
        # Process each uploaded file
        for key in request.files:
            file = request.files[key]
            
            if file.filename == '':
                continue
                
            if not file.filename.endswith('.pdf'):
                continue
            
            try:
                # Extract text from PDF
                pdf_text = extract_pdf_text(file)
                
                # Get events from GPT
                events = query_gpt_for_events(pdf_text)
                
                # Validate event types
                events = validate_event_types(events)
                
                # Add to all events
                all_events.extend(events)
                files_processed += 1
                
            except Exception as e:
                print(f"Error processing {file.filename}: {str(e)}")
                continue
        
        if files_processed == 0:
            return jsonify({'error': 'No valid PDF files were processed'}), 400
        
        # Create ICS calendar
        calendar = save_ics(all_events)
        
        # Save calendar to file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        ics_filename = f'syllabi_calendar_{timestamp}.ics'
        ics_filepath = os.path.join(UPLOAD_FOLDER, ics_filename)
        
        with open(ics_filepath, 'w') as f:
            f.write(str(calendar))
        
        # Return success response
        return jsonify({
            'success': True,
            'eventCount': len(all_events),
            'filesProcessed': files_processed,
            'calendarUrl': f'/api/download/{ics_filename}',
            'events': all_events
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_calendar(filename):
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            filepath,
            mimetype='text/calendar',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})

if __name__ == '__main__':
    # Check if OpenAI API key is set
    if not os.getenv('OPENAI_API_KEY'):
        print("WARNING: OPENAI_API_KEY environment variable is not set!")
    
    print("Starting Syl-Cal backend server...")
    print("Make sure OPENAI_API_KEY is set in your environment")
    app.run(debug=True, port=5000)
