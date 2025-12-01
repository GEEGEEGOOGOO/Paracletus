@echo off
echo ========================================
echo Testing Gemini API with Terminal ENV
echo ========================================
echo.
echo Setting API key in PowerShell environment...
echo.

powershell -Command "$env:GEMINI_API_KEY='AIzaSyAOuUxhdPejckfbwr5wkJ_xpNhuatyi2c8'; node test-terminal-env.js"

echo.
echo ========================================
echo Test Complete
echo ========================================
pause
