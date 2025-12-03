@echo off
cd /d "D:\PROJECT_101"

:: 1. Kill existing processes silently
taskkill /F /IM electron.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

:: 2. Set Network Fixes
set NODE_OPTIONS=--dns-result-order=ipv4first --no-warnings

:: 3. Start Server (Background, same window)
:: We use start /b to keep it in this hidden console
start /b cmd /c "cd server && node start.js"

:: 4. Wait for server to initialize
timeout /t 5 /nobreak >nul

:: 5. Start Electron App (Background, same window)
:: Electron will open its GUI window, but this console remains hidden
start /b npm start
