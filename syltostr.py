import fitz  # PyMuPDF
from openai import OpenAI
import json
from ics import Calendar, Event
import os
from datetime import datetime

# Set your OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# Step 1: Extract text from PDF
def extract_pdf_text(path):
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# Step 2: Send prompt to GPT-4o
def query_gpt_for_events(syllabus_text):
    prompt = (
        "Extract all assignments, exams, projects, or anything important with due dates from "
        "the following syllabus text. Return the result as a JSON array with this format:\n\n"
        "[\n"
        "  { \"date\": \"YYYY-MM-DD\", \"description\": \"...\", \"type\": \"assignment\" },\n"
        "  { \"date\": \"YYYY-MM-DD\", \"description\": \"...\", \"type\": \"project\" }\n"
        "]\n\n"
        "Only return valid JSON and use ISO date format. Here is the syllabus:\n\n"
        + syllabus_text
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
    
    # Try to parse the JSON portion
    try:
        first_bracket = content.find("[")
        last_bracket = content.rfind("]") + 1
        json_data = json.loads(content[first_bracket:last_bracket])
        return json_data
    except Exception as e:
        print("❌ Failed to parse JSON from GPT response.")
        print(content)
        raise e

# Step 3: Save to JSON
def save_json(events, filename="course_events.json"):
    with open(filename, "w") as f:
        json.dump(events, f, indent=4)

# Step 4: Save to ICS calendar
def save_ics(events, filename="course_events.ics"):
    cal = Calendar()
    for e in events:
        try:
            date = datetime.fromisoformat(e["date"])
            event = Event()
            event.name = e["description"]
            event.begin = date
            cal.events.add(event)
        except Exception as err:
            print(f"⚠️ Skipping event due to error: {err}")
            continue
    with open(filename, "w") as f:
        f.writelines(cal)
        
# Step 2.5: Validate event "type" field
VALID_TYPES = {
    "assignment", "draft", "project", "exam", "presentation",
    "reading", "reflection", "workshop", "other"
}

def validate_event_types(events):
    for event in events:
        raw_type = event.get("type", "").lower().strip()
        if raw_type in VALID_TYPES:
            event["type"] = raw_type
        else:
            print(f"⚠️ Warning: Invalid or missing type for event on {event['date']} — defaulting to 'other'")
            event["type"] = "other"
    return events


# ---- Main Flow ----
if __name__ == "__main__":
    pdf_path = "schvan345162spring2025.pdf"
    text = extract_pdf_text(pdf_path)
    print("📄 PDF text extracted.")

    events = query_gpt_for_events(text)
    print(f"✅ Extracted {len(events)} events from GPT.")

    events = validate_event_types(events)

    save_json(events)
    save_ics(events)
    print("📁 Saved course_events.json and course_events.ics")
