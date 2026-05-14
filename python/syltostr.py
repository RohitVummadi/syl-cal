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

def extract_pdf_text(pdf_obj, start_date=None, custom_instructions=None):
    # If it's a file path string, open directly. If it's a file stream (from Flask), pass the stream
    if isinstance(pdf_obj, str):
        doc = fitz.open(pdf_obj)
    else:
        doc = fitz.open(stream=pdf_obj.read(), filetype="pdf")
    syllabus_text = "".join(str(page.get_text()) for page in doc)
    return query_gpt_for_events(syllabus_text, start_date, custom_instructions)

def query_gpt_for_events(syllabus_text, start_date, custom_instructions):
    current_year = datetime.now().year
    
    date_instruction = ""
    if start_date:
        date_instruction = f"The semester starts on: {start_date}. If an event only lists a relative week (e.g. 'Week 2'), calculate its date by adding the appropriate number of weeks to the start date, and set the field 'estimated' to true. Otherwise, set 'estimated' to false. "

    custom_text = ""
    if custom_instructions and str(custom_instructions).strip():
        custom_text = f"\nEXTRA USER INSTRUCTIONS (CRITICAL):\n{custom_instructions}\n\n"

    prompt = (
        f"Extract all assignments, exams, projects, or anything important with due dates or weekly schedules from the syllabus. "
        f"For each item, include the class name and professor if available. "
        f"{date_instruction}"
        f"{custom_text}"
        f"Return as JSON array like: "
        f"[{{\"date\": \"YYYY-MM-DD\", \"time\": \"14:30\", \"description\": \"Final Exam for BIO 101 with Dr. Smith\", \"type\": \"exam\", \"estimated\": false}}]. "
        f"If a specific time is mentioned, include it in 24-hour HH:MM format in the 'time' field. If no time is mentioned, set 'time' to null. "
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
        if content:
            start = content.find("[")
            end = content.rfind("]") + 1
            return json.loads(content[start:end])
        else:
            raise ValueError("Empty response from GPT")
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
            date_str = e["date"]
            time_str = e.get("time")
            event = Event()
            
            # Apply asterisk indicator for estimates
            if e.get("estimated"):
                event.name = f"{e['description']}*"
                event.description = "⚠️ WARNING: The date for this event was roughly estimated based on the week number in the syllabus, so it may not occur on this exact day."
            else:
                event.name = e["description"]
            
            if time_str:
                if len(time_str) == 5:
                    time_str += ":00"
                event.begin = datetime.fromisoformat(f"{date_str}T{time_str}")
            else:
                event.begin = datetime.fromisoformat(date_str)
                event.make_all_day()
                
            cal.events.add(event)
        except Exception as ex:
            print(f"Failed to parse event {e}: {ex}")
            continue
    return cal


def export_events_to_files(events, json_path="events.json", ics_path="events.ics"):
    # Save JSON File
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=4)
    print(f"Saved {len(events)} events to {json_path}")
    
    # Save ICS File
    cal = save_ics(events)
    with open(ics_path, "w", encoding="utf-8") as f:
        f.writelines(cal.serialize_iter())
    print(f"Saved calendar to {ics_path}")

def main():
    pdf_path = "C:\\Users\\rohit\\OneDrive\\Desktop\\coding-crap\\syl-cal\\pdfs\\schvan345162spring2025.pdf"
    
    # 1. Extract Events
    print("Extracting events from PDF...")
    events = extract_pdf_text(pdf_path)
    
    # 2. Validate Events
    events = validate_event_types(events)
    
    # 3. Export to Files
    export_events_to_files(events)

if __name__ == "__main__":
    main()

