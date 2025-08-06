import os
import json
import datetime
import hashlib

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

def get_token_filename(email):
    hashed_email = hashlib.sha256(email.encode()).hexdigest()
    return f"token_{hashed_email}.json"

def authenticate_user():
    creds = None
    email = input("Enter your Google account email: ").strip()
    token_file = get_token_filename(email)

    if os.path.exists(token_file):
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)

            # Save token under unique file
            with open(token_file, "w") as token:
                token.write(creds.to_json())

    return creds

def main(json_data):
    try:
        creds = authenticate_user()
        service = build("calendar", "v3", credentials=creds)

        for event_data in json_data:
            event = {
                "summary": event_data.get("description", ""),
                "start": {
                    "date": event_data.get("date"),
                    "timeZone": "UTC",
                },
                "end": {
                    "date": event_data.get("date"),
                    "timeZone": "UTC",
                },
            }

            result = service.events().insert(calendarId="primary", body=event).execute()
            print(f'✅ Event created: {result.get("htmlLink")}')

    except HttpError as error:
        print(f"❌ An error occurred: {error}")

if __name__ == "__main__":
    try:
        with open("course_events.json", "r") as f:
            json_data = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load JSON file: {e}")
        exit(1)

    try:
        main(json_data)
    except Exception as e:
        print(f"❌ Failed to run Google Calendar integration: {e}")
