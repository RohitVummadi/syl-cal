@echo off
echo ========================================
echo Starting Syl-Cal Backend Server
echo ========================================
echo.

REM Check if OPENAI_API_KEY is set
if "%OPENAI_API_KEY%"=="" (
    echo [WARNING] OPENAI_API_KEY environment variable is not set!
    echo Please set it with: set OPENAI_API_KEY=your-key-here
    echo.
    pause
)

echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python app.py
