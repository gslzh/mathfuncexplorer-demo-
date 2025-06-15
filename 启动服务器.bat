@echo off
chcp 65001 >nul
echo Starting Math Function Explorer...
echo.
echo Please make sure Python 3.x is installed
echo.
echo Starting server...
echo.
start /min python -m http.server 8000
if errorlevel 1 (
    echo.
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.x first
    pause
    exit
)
echo Waiting for server to start...
timeout /t 3 /nobreak >nul
echo.
echo Opening browser automatically...
start http://localhost:8000
echo.
echo Server is running at: http://localhost:8000
echo Press any key to stop the server...
pause >nul
echo Stopping server...
taskkill /f /im python.exe /fi "WINDOWTITLE eq *http.server*" >nul 2>&1
echo Server stopped.