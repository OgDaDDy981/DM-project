@echo off
setlocal
cd /d "%~dp0"
title Graph Coloring - CPU Register Allocation

color 0B
cls
echo =====================================================================
echo    GRAPH COLORING FOR CPU REGISTER ALLOCATION IN COMPILERS
echo    Interactive Scientific Visualization and Educational Web App
echo =====================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    color 0C
    echo [ERROR] Node.js was not found in your system PATH.
    echo Please download and install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] First-time setup: Installing dependencies...
    echo This may take a minute. Please wait...
    echo.
    call npm.cmd install
    if errorlevel 1 (
        color 0C
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed successfully.
    echo.
)

:: 3. Check if server is already running on port 5173
netstat -ano | findstr ":5173 " >nul 2>nul
if not errorlevel 1 (
    echo [INFO] Server is already active on port 5173.
    echo [INFO] Opening your browser to: http://localhost:5173/DM-project/
    start "" "http://localhost:5173/DM-project/"
    echo.
    echo ---------------------------------------------------------------------
    echo   The application is live in your browser.
    echo   You can close this window at any time.
    echo ---------------------------------------------------------------------
    echo.
    pause
    exit /b 0
)

:: 4. Launch browser after a short delay to ensure Vite is ready
echo [1/2] Launching browser to http://localhost:5173/DM-project/ ...
start /b "" cmd /c "timeout /t 2 >nul & start "" "http://localhost:5173/DM-project/""

echo [2/2] Starting local Vite web server...
echo.
echo ---------------------------------------------------------------------
echo   Application URL: http://localhost:5173/DM-project/
echo.
echo   Keep this window open while exploring the application.
echo   To stop the server, press Ctrl+C or close this window.
echo ---------------------------------------------------------------------
echo.

call npm.cmd run dev -- --port 5173

echo.
echo Server stopped.
pause
exit /b 0
