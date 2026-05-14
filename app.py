from flask import Flask, render_template, request, jsonify
import sys
import os
import io

# Add the python directory to sys.path so we can import syltostr
sys.path.append(os.path.join(os.path.dirname(__file__), 'python'))
import syltostr

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'files' not in request.files:
        # Fallback to single file if that's what was sent for backward compatibility
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        files = [request.files['file']]
    else:
        files = request.files.getlist('files')

    if not files or files[0].filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    start_date = request.form.get('startDate')
    custom_instructions = request.form.get('customInstructions')
    
    try:
        all_events = []
        for file in files:
            if file and file.filename.endswith('.pdf'):
                # Pass the file stream, start date, and custom instructions to the extractor
                events = syltostr.extract_pdf_text(file, start_date, custom_instructions)
                all_events.extend(events)
        
        validated_events = syltostr.validate_event_types(all_events)
        
        # Generate the ICS calendar
        cal = syltostr.save_ics(validated_events)
        
        # Convert calendar to string
        ics_str = "".join(cal.serialize_iter())
        
        return jsonify({
            'events': validated_events,
            'ics': ics_str
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate_ics', methods=['POST'])
def generate_ics():
    events = request.json.get('events', [])
    try:
        cal = syltostr.save_ics(events)
        ics_str = "".join(cal.serialize_iter())
        return jsonify({'ics': ics_str})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
