@echo off
echo ===================================================
echo   RESTARTING ADILECTUS (FULL STACK)
echo ===================================================
echo.

echo 1. Killing stale processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM electron.exe /T 2>nul

echo.
echo 2. Clearing cache...
del /f /q "%APPDATA%\Adilectus\Cache\*.*" 2>nul

echo.
echo 3. Starting Backend Server (in new window)...
start "Adilectus Backend" cmd /k "cd server && npm start"

echo.
echo 4. Waiting for server to initialize...
timeout /t 5 /nobreak >nul

echo.
echo 5. Starting Electron App...
npm start

echo.
echo Done!
