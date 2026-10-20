@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Graph Coloring - CPU Register Allocation in Compilers
color 0B

echo =====================================================================
echo    GRAPH COLORING FOR CPU REGISTER ALLOCATION IN COMPILERS
echo    Interactive Educational Web Application
echo =====================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if errorlevel 1 goto :NO_NODE

:: 2. Check node_modules
if not exist "node_modules" goto :INSTALL_DEPS

:START_APP
echo [1/2] Launching your web browser...
start http://localhost:5173/

echo [2/2] Starting local application server on port 5173...
echo.
echo ---------------------------------------------------------------------
echo   Application is running! You can view it in your browser.
echo   Press Ctrl+C in this command window to stop the server.
echo ---------------------------------------------------------------------
echo.

call npm.cmd run dev -- --port 5173

echo.
echo Server stopped.
pause
exit /b 0

:INSTALL_DEPS
echo [INFO] node_modules not found. Installing dependencies first...
call npm.cmd install
if errorlevel 1 goto :INSTALL_ERROR
goto :START_APP

:NO_NODE
color 0C
echo [ERROR] Node.js was not found in your PATH.
echo Please download and install Node.js from: https://nodejs.org
echo.
pause
exit /b 1

:INSTALL_ERROR
color 0C
echo [ERROR] npm install failed. Please check your internet connection.
echo.
pause
exit /b 1
