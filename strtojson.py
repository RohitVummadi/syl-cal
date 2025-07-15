import json
import re


def strtojson(content):
    # Prepare the JSON list
    events = []

    # Regex to match lines like "* 8/21: Event description"
    pattern = re.compile(r"\* (\d{1,2}/\d{1,2}(?:-\d{1,2})?): (.+)")

    # Iterate over each line and extract data
    for line in content.splitlines():
        match = pattern.match(line.strip())
        if match:
            date = match.group(1).strip()
            description = match.group(2).strip()
            events.append({
                "date": date,
                "description": description
            })

    # Output the final JSON
    json_output = json.dumps(events, indent=2)
    print(json_output)
