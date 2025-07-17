import pdfplumber
import re
import dateparser
import json
from collections import defaultdict

# 1. define your date‑regexes
DATE_PATTERNS = [
    r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',
    r'\b(January|February|Mar|Apr|…|Dec)\s+\d{1,2},\s+\d{4}\b',
    # add ISO, “2025-07-20”, etc.
]

# 2. helper to extract all dates from text
def extract_dates(text):
    matches = []
    for pat in DATE_PATTERNS:
        for m in re.finditer(pat, text, flags=re.IGNORECASE):
            raw = m.group(0)
            dt = dateparser.parse(raw)
            if dt:
                # grab a snippet around the match
                start, end = m.span()
                context = text[max(0, start-30):end+30]
                matches.append((raw, dt.date().isoformat(), context))
    return matches

# 3. process a folder of PDFs
def process_pdfs(pdf_paths):
    results = defaultdict(list)
    for path in pdf_paths:
        with pdfplumber.open(path) as pdf:
            full = "\n".join(page.extract_text() or "" for page in pdf.pages)
        for raw, iso, ctx in extract_dates(full):
            # simple keyword filter
            if any(k in ctx.lower() for k in ("due","deadline","exam","presentation")):
                results[path].append({"raw": raw, "date": iso, "context": ctx})
    return results

if __name__=="__main__":
    import glob
    pdfs = glob.glob("pdfs/*.pdf")
    data = process_pdfs(pdfs)
    print(data)
    print(json.dumps(data, indent=2))
