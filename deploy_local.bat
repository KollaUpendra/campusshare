@echo off
echo HOST: %COMPUTERNAME%
echo USER: %USERNAME%
echo ==============================================
echo   CampusShare Platform - Local Dev Launcher
echo ==============================================

echo [1/2] Installing/Updating dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Starting Development Server...
echo The app will start at http://localhost:3000
echo Changes will be reflected immediately.
echo Press Ctrl+C to stop.
echo.
call npm run dev
pause
