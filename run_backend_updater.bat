@echo off
echo Starting Backend Updater...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if requirements are installed
echo Installing/updating Python requirements...
pip install -r requirements.txt

REM Run the backend updater
echo.
echo Running Backend Updater...
python backend_updater.py

pause
