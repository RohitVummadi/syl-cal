# ========================================
# Syl-Cal Backend Server Startup
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Syl-Cal Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if OPENAI_API_KEY is set
if (-not $env:OPENAI_API_KEY) {
    Write-Host "[WARNING] OPENAI_API_KEY environment variable is not set!" -ForegroundColor Yellow
    Write-Host "Please set it with: `$env:OPENAI_API_KEY = 'your-key-here'" -ForegroundColor Yellow
    Write-Host ""
    
    $key = Read-Host "Enter your OpenAI API key (or press Enter to continue without it)"
    if ($key) {
        $env:OPENAI_API_KEY = $key
        Write-Host "API key set for this session" -ForegroundColor Green
    }
}

Write-Host "Starting Flask server on http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python app.py
