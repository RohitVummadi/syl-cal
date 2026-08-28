# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

College and university students who need to turn course syllabi into a calendar they can rely on. They upload one or more syllabus PDFs at the start of a term and want their important academic dates captured without manually transcribing them.

## Product Purpose

Syl-Cal extracts deadlines, assignments, exams, projects, readings, and other important dated events from uploaded syllabus PDFs, then produces a calendar file students can use to organize their academic term.

## Positioning

The product turns unstructured syllabus documents into calendar events through AI-assisted date extraction, with a path to connect the resulting events to Google Calendar, Apple Calendar, and other calendar applications.

## Operating Context

Students collect syllabi at the beginning of a course or term, upload multiple PDFs, review the extraction result, and download or connect the generated calendar. The web app uses Firebase authentication and a Flask API processes PDFs and creates ICS calendar files.

## Capabilities and Constraints

- Upload and process multiple PDF syllabi.
- Extract dated academic events with AI.
- Validate event categories and generate downloadable ICS files.
- Existing calendar interoperability uses ICS downloads.
- Direct connections to Google Calendar, Apple Calendar, and other calendar applications are a product direction, not yet implemented.
- The product must not assume a visual brand system has been chosen.

## Evidence on Hand

- Existing React/Vite web app in `webpage/`.
- Existing Flask backend in `backend/`.
- Existing PDF extraction and ICS generation logic in `python/`.
- No approved customer testimonials, benchmarks, pricing, or visual brand assets are on hand; future work must not invent them.

## Product Principles

- Remove the manual burden of transferring syllabus deadlines into a calendar.
- Keep extracted academic events understandable and useful to students.
- Work with the calendar tools students already use.
- Preserve user trust when handling course documents and derived schedules.

