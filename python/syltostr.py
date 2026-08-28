import pymupdf
import pymupdf4llm
from google import genai
from google.genai import types
from ics import Calendar, Event
import json
import os
from datetime import date, datetime, time
from zoneinfo import ZoneInfo

model = "gemini-3.6-flash"
temperature = 0.2

VALID_TYPES = {"assignment", "draft", "project", "exam", "presentation", "reading", "reflection", "workshop", "other"}
DEFAULT_CALENDAR_TIMEZONE = os.getenv('CALENDAR_TIMEZONE', 'America/New_York')

def extract_pdf_text(file):
    """Extract text from a Flask upload without relying on a temporary filename."""
    stream = getattr(file, 'stream', file)
    stream.seek(0)
    pdf_bytes = stream.read()
    stream.seek(0)
    if not pdf_bytes:
        raise ValueError('The uploaded PDF is empty.')

    document = pymupdf.open(stream=pdf_bytes, filetype='pdf')
    try:
        return pymupdf4llm.to_markdown(document, show_progress=False)
    finally:
        document.close()

def query_gemini_for_events(syllabus_text):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set")

    client = genai.Client(api_key=api_key)
    current_year = datetime.now().year
    prompt = (
        f"Extract all assignments, exams, projects, or anything important with due dates from the syllabus. "
        f"For each item, include the class name and professor if available. "
        f"Return as JSON array like: "
        f"[{{\"date\": \"YYYY-MM-DD\", \"startTime\": \"HH:MM\" or null, \"endTime\": \"HH:MM\" or null, \"description\": \"Final Exam for BIO 101 with Dr. Smith\", \"type\": \"exam\"}}]. "
        f"Use ISO dates and 24-hour local times. Include startTime and endTime only when the syllabus explicitly gives a time; never invent times. "
        f"If the year is not explicitly stated, assume the year is {current_year}. "
        f"Here is the syllabus:\n\n{syllabus_text}"
    )
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction="You are a helpful assistant that extracts academic events from syllabi.",
            temperature=temperature,
            response_mime_type="application/json",
        ),
    )
    try:
        events = json.loads(response.text or '[]')
    except json.JSONDecodeError as error:
        raise ValueError('Gemini returned an invalid event list.') from error
    if not isinstance(events, list):
        raise ValueError('Gemini returned an invalid event list.')
    return events


# Backwards-compatible name for older callers.
query_gpt_for_events = query_gemini_for_events

def validate_event_types(events):
    valid_events = []
    for e in events:
        if not isinstance(e, dict):
            continue
        description = str(e.get('description', '')).strip()
        raw_date = str(e.get('date', '')).strip()
        if not description:
            continue
        try:
            date.fromisoformat(raw_date)
        except ValueError:
            continue
        start_time = e.get('startTime')
        end_time = e.get('endTime')
        if start_time is not None:
            try:
                datetime.strptime(str(start_time), '%H:%M')
            except ValueError:
                start_time = None
        if end_time is not None:
            try:
                datetime.strptime(str(end_time), '%H:%M')
            except ValueError:
                end_time = None
        if start_time is None:
            end_time = None
        raw = str(e.get("type", "")).lower().strip()
        valid_events.append({
            'date': raw_date,
            'startTime': start_time,
            'endTime': end_time,
            'description': description,
            'type': raw if raw in VALID_TYPES else 'other',
        })
    return valid_events

def save_ics(events, calendar_timezone=DEFAULT_CALENDAR_TIMEZONE):
    cal = Calendar()
    for event_data in events:
        event = Event()
        event.name = event_data['description']
        event_date = date.fromisoformat(event_data['date'])
        start_time = event_data.get('startTime')
        if start_time:
            start = time.fromisoformat(start_time)
            event.begin = datetime.combine(event_date, start, tzinfo=ZoneInfo(calendar_timezone))
            if event_data.get('endTime'):
                end = time.fromisoformat(event_data['endTime'])
                event.end = datetime.combine(event_date, end, tzinfo=ZoneInfo(calendar_timezone))
        else:
            event.begin = event_date
            event.make_all_day()
        cal.events.add(event)
    return cal
