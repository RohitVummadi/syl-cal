# Syl-Cal

Syl-Cal turns syllabus PDFs into calendar files. The React frontend uses Firebase email-link authentication; the Flask API uses the authenticated user token to protect Gemini processing and private calendar downloads.

## Run locally

1. Copy `.env.example` to `.env`; set the Gemini key and Firebase Admin credential path.
2. Copy `webpage/.env.example` to `webpage/.env`; set Firebase web configuration values.
3. Create the supported root Python environment and install backend packages:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```

4. In one terminal, start the backend:

   ```bash
   cd backend
   ../.venv/bin/python app.py
   ```

5. In a second terminal, start the frontend:

   ```bash
   cd webpage
   npm install
   npm run dev
   ```

Or, after completing setup, start both services from the project root:

```bash
./start-dev.sh
```

The Vite dev server proxies `/api` to Flask. For deployment, set `VITE_API_BASE_URL` to the API origin and set `CORS_ORIGINS` on the backend to the frontend origin.
