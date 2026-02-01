@echo off
setlocal

REM Run from the directory where this .bat lives
cd /d %~dp0

REM Create venv if missing
if not exist ".venv\Scripts\python.exe" (
  echo [INFO] Creating virtual environment at .venv
  python -m venv .venv
  if errorlevel 1 (
    echo [ERROR] Failed to create venv. Make sure Python is installed and on PATH.
    exit /b 1
  )
)

REM Activate venv
call ".venv\Scripts\activate.bat"
if errorlevel 1 (
  echo [ERROR] Failed to activate venv.
  exit /b 1
)

REM Install deps
echo [INFO] Installing requirements...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo [ERROR] pip install failed.
  exit /b 1
)

REM Run server
echo [INFO] Starting Django dev server...
python manage.py runserver 0.0.0.0:8000

endlocal
