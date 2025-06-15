@echo off
echo Starting Math Function Explorer...
echo Please wait for the server to start...
echo.
start /min python -m http.server 8000
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.x first.
    pause
    exit
)
timeout /t 3 /nobreak >nul
echo Opening browser...
start http://localhost:8000
echo.
echo Server is running at http://localhost:8000
echo Press any key to stop the server...
pause >nul
taskkill /f /im python.exe /fi "WINDOWTITLE eq *http.server*" >nul 2>&1