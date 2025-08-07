import streamlit as st
import fitz  # PyMuPDF
from openai import OpenAI
from ics import Calendar, Event
import json
import os
from datetime import datetime
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

# --- SETUP ---
st.set_page_config(page_title="Syllabus Calendar Extractor", layout="centered")

# Load OpenAI key
api_key = st.secrets["openai"]["api_key"]
client = OpenAI(api_key=api_key)
with open("client_secret_key.json", "r") as f:
    client_secret = json.load(f)

VALID_TYPES = {"assignment", "draft", "project", "exam", "presentation", "reading", "reflection", "workshop", "other"}

# --- GOOGLE AUTH ---

def get_auth_flow():
    return Flow.from_client_config(
        st.secrets["google"]["client_secret"],
        scopes=["https://www.googleapis.com/auth/calendar.events"],
        redirect_uri="https://syllabuscalendar.streamlit.app/"  # adjust for production
    )

def creds_to_dict(creds):
    return {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes
    }

def get_calendar_service():
    creds_data = st.session_state.get("credentials")
    if not creds_data:
        return None
    creds = Credentials(**creds_data)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        st.session_state["credentials"] = creds_to_dict(creds)
    return build("calendar", "v3", credentials=creds)

# --- GPT & PDF ---

def extract_pdf_text(file):
    doc = fitz.open(stream=file.read(), filetype="pdf")
    return "".join(page.get_text() for page in doc)

def query_gpt_for_events(syllabus_text):
    prompt = (
        "Extract all assignments, exams, projects, or anything important with due dates from the syllabus. "
        "For each item, include the class name and professor if available. "
        "Return as JSON array like: [{\"date\": \"YYYY-MM-DD\", \"description\": \"Final Exam for BIO 101 with Dr. Smith\", \"type\": \"exam\"}]. "
        "Use ISO date format. Here is the syllabus:\n\n" + syllabus_text
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that extracts academic events from syllabi."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    content = response.choices[0].message.content
    try:
        start = content.find("[")
        end = content.rfind("]") + 1
        return json.loads(content[start:end])
    except Exception as e:
        st.error("❌ Failed to parse JSON from GPT response.")
        st.text(content)
        raise e

def validate_event_types(events):
    for e in events:
        raw = e.get("type", "").lower().strip()
        e["type"] = raw if raw in VALID_TYPES else "other"
    return events

def save_ics(events):
    cal = Calendar()
    for e in events:
        try:
            date = datetime.fromisoformat(e["date"])
            event = Event()
            event.name = e["description"]
            event.begin = date
            cal.events.add(event)
        except:
            continue
    return cal

# --- MAIN UI ---

st.title("📅 Syllabus to Calendar Extractor")

query_params = st.query_params
auth_code = query_params.get("code")
if auth_code:
    if isinstance(auth_code, list):
        auth_code = auth_code[0]
    flow = get_auth_flow()
    try:
        flow.fetch_token(code=auth_code)
        creds = flow.credentials
        st.session_state["credentials"] = creds_to_dict(creds)
        query_params.pop("code", None)
        st.query_params.update(query_params)
        st.success("✅ Logged into Google Calendar successfully!")
    except Exception as e:
        st.error(f"❌ Authentication failed: {e}")
        st.stop()

if "credentials" not in st.session_state:
    flow = get_auth_flow()
    auth_url, _ = flow.authorization_url(prompt='consent')
    st.markdown(f"[🔐 Click here to log in to Google Calendar]({auth_url})")
    st.stop()

st.write("Upload one or more syllabus PDFs. The app will extract important dates and let you add them to your Google Calendar.")

uploaded_files = st.file_uploader("Upload syllabus PDF(s)", type=["pdf"], accept_multiple_files=True)

if uploaded_files:
    all_events = []
    for f in uploaded_files:
        with st.spinner(f"Extracting text from {f.name}..."):
            text = extract_pdf_text(f)
        st.success(f"Text extracted from {f.name}.")

        with st.spinner("Using GPT to find events..."):
            events = query_gpt_for_events(text)
        st.success(f"Found {len(events)} events.")

        events = validate_event_types(events)
        for e in events:
            e["source_file"] = f.name
        all_events.extend(events)

    st.subheader("📋 Extracted Events")
    st.json(all_events)

    json_bytes = json.dumps(all_events, indent=4).encode("utf-8")
    st.download_button("⬇️ Download JSON", json_bytes, file_name="course_events.json", mime="application/json")

    cal = save_ics(all_events)
    st.download_button("⬇️ Download ICS", str(cal), file_name="course_events.ics", mime="text/calendar")

    service = get_calendar_service()
    if service and st.button("📤 Add Events to Google Calendar"):
        for e in all_events:
            body = {
                "summary": e["description"],
                "start": {"date": e["date"], "timeZone": "UTC"},
                "end": {"date": e["date"], "timeZone": "UTC"},
            }
            service.events().insert(calendarId="primary", body=body).execute()
        st.success("✅ Events added to your Google Calendar.")
