@echo off
echo HOST: %COMPUTERNAME%
echo USER: %USERNAME%
echo ==============================================
echo   CampusShare Platform - Local Deployer
echo ==============================================

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Setting up database...
call npx prisma generate
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Database setup failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Starting production server...
echo The app will start at http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call npm start
pause
