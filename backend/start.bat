@echo off
echo ========================================
echo Starting Syl-Cal Backend Server
echo ========================================
echo.

REM Check if GEMINI_API_KEY is set
if "%GEMINI_API_KEY%"=="" (
    echo [WARNING] GEMINI_API_KEY environment variable is not set!
    echo Please set it with: set GEMINI_API_KEY=your-key-here
    echo.
    pause
)

if "%FIREBASE_SERVICE_ACCOUNT_PATH%"=="" (
    echo [WARNING] FIREBASE_SERVICE_ACCOUNT_PATH is not set. Protected API endpoints will return 503.
)

echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python app.py
