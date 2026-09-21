@echo off
rem MiraOS — zaokraglone, "szklane" okna w calem systemie
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0round-on.ps1" >nul 2>&1
exit /b 0
