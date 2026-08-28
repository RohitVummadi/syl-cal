# Syl-Cal backend

The Flask API extracts dated syllabus events with Gemini and returns a private ICS calendar for the signed-in Firebase user.

## Local setup

From the project root, create and use the supported Python environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Copy `.env.example` to `.env`, set `GEMINI_API_KEY`, and set `FIREBASE_SERVICE_ACCOUNT_PATH` to an absolute path for a Firebase Admin service-account JSON file. Keep that JSON file outside Git.

Start the API:

```bash
cd backend
python app.py
```

It runs at `http://127.0.0.1:5000`. The public health check is `GET /api/health`; uploads and downloads require a Firebase ID token in `Authorization: Bearer <token>`.

For production, keep `FLASK_DEBUG=0` and run from the project root with:

```bash
gunicorn --chdir backend --bind 0.0.0.0:5000 app:app
```

Generated calendars are private to their creator and expire after 24 hours.
