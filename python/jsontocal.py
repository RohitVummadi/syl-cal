import os
import json
import datetime


def main(json_data):
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