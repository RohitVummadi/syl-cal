import fitz  # PyMuPDF
from openai import OpenAI
from ics import Calendar, Event
import json
import os
from datetime import datetime
from datetime import datetime

# --- SETUP ---
# add front screen

# Load OpenAI key
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

VALID_TYPES = {"assignment", "draft", "project", "exam", "presentation", "reading", "reflection", "workshop", "other"}

# --- GPT & PDF ---

def extract_pdf_text(file):
    doc = fitz.open(stream=file.read(), filetype="pdf")
    return "".join(page.get_text() for page in doc)

def query_gpt_for_events(syllabus_text):
    current_year = datetime.now().year
    prompt = (
        f"Extract all assignments, exams, projects, or anything important with due dates from the syllabus. "
        f"For each item, include the class name and professor if available. "
        f"Return as JSON array like: "
        f"[{{\"date\": \"YYYY-MM-DD\", \"description\": \"Final Exam for BIO 101 with Dr. Smith\", \"type\": \"exam\"}}]. "
        f"Use ISO date format. "
        f"If the year is not explicitly stated, assume the year is {current_year}. "
        f"Here is the syllabus:\n\n{syllabus_text}"
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


