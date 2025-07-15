import openai
import pdfplumber
import json
import re
import strtojson as str_to_json  # Assuming you have custom logic here
import jsontocal as json_to_cal  # Assuming this pushes to Google Calendar

# === CONFIGURATION ===
PDF_FILE = "sadewum327879fall2024.pdf"
MODEL_NAME = "llama3"
OLLAMA_URL = "http://localhost:11434/v1"
DUMMY_API_KEY = "ollama"  # Not used by Ollama but required by openai lib

# === PDF TEXT EXTRACTION ===
def extract_text_from_pdf(file_path):
    full_text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
    return full_text

# === LLaMA OUTPUT CLEANING ===
def clean_llama_json(text):
    # Remove markdown ```json ... ``` if present
    text = re.sub(r"^```json|```$", "", text.strip(), flags=re.IGNORECASE)
    text = text.strip("`\n ")
    return text

# === INITIALIZE OLLAMA CLIENT ===
client = openai.OpenAI(
    base_url=OLLAMA_URL,
    api_key=DUMMY_API_KEY
)

# === LOAD AND PREPARE SYLLABUS ===
syllabus_text = extract_text_from_pdf(PDF_FILE) 
syllabus_text = syllabus_text[:150000]  # Truncate for model limits

# print("\n📄 Syllabus Text Loaded:\n")
# print(syllabus_text)

# === PROMPT TO LLaMA ===
prompt = (
    "Extract all important deadlines for assignments, exams, and quizzes from the syllabus text below.\n\n"
    "⚠️ OUTPUT ONLY A VALID JSON ARRAY. NO BULLET POINTS. NO EXPLANATIONS. NO MARKDOWN. NO NATURAL LANGUAGE.\n\n"
    "Each item must use this format:\n"
    '[\n'
    '  {\n'
    '    "title": "string",\n'
    '    "date": "YYYY-MM-DD" or "as written if no year",\n'
    '    "time": "optional",\n'
    '    "description": "brief summary of what is due or happening"\n'
    '  }\n'
    ']\n\n'
    "EXAMPLE:\n"
    '[\n'
    '  {\n'
    '    "title": "Final Draft: Landmark Analysis",\n'
    '    "date": "2024-09-20",\n'
    '    "time": "",\n'
    '    "description": "Final version of the Landmark Analysis paper is due."\n'
    '  }\n'
    ']\n\n'
    "ONLY OUTPUT A JSON ARRAY.\n\n"
    f"Syllabus:\n{syllabus_text}"
)


response = client.chat.completions.create(
    model=MODEL_NAME,
    messages=[
        {"role": "system", "content": "You are a strict JSON formatter. You return ONLY JSON arrays, never any explanation."},
        {"role": "user", "content": prompt}
    ],
    temperature=0
)


# === PARSE AND CLEAN RESPONSE ===
raw_output = response.choices[0].message.content
print("\n🧪 Raw Output:\n", raw_output)

try:
    cleaned_output = clean_llama_json(raw_output)
    parsed_events = json.loads(cleaned_output)
    
    print("\n🔍 Extracted Events JSON:\n")
    print(json.dumps(parsed_events, indent=2))

    # Optional: Process events (convert/add to calendar)
    json_to_cal.send_to_calendar(parsed_events)
    print("\n✅ Events processed and added to Google Calendar.")

except Exception as e:
    print("\n❌ Failed to parse model output as JSON.")
    print(f"Error: {e}")
