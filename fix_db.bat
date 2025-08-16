@echo off
echo Fixing Database Structure...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Install bcrypt if not already installed
echo Installing bcrypt...
pip install bcrypt

REM Run the database fix script
echo.
echo Running database fix script...
python fix_db.py

pause
