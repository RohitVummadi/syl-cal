# Syl-Cal Backend API

Backend server for processing syllabus PDFs and extracting calendar events.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set your OpenAI API key:**
   
   **Windows (PowerShell):**
   ```powershell
   $env:OPENAI_API_KEY = "your-api-key-here"
   ```
   
   **Mac/Linux:**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Run the server:**
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/process-syllabi
Upload and process PDF syllabi files.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Multiple PDF files

**Response:**
```json
{
  "success": true,
  "eventCount": 15,
  "filesProcessed": 3,
  "calendarUrl": "/api/download/syllabi_calendar_20231231_120000.ics",
  "events": [...]
}
```

### GET /api/download/:filename
Download the generated calendar file.

### GET /api/health
Health check endpoint.

## Troubleshooting

- Make sure `OPENAI_API_KEY` is set in your environment
- Ensure the `python` folder with `syltostr.py` is in the parent directory
- Check that all dependencies are installed: `pip install -r requirements.txt`
