@echo off
rem MiraOS — wylaczenie autostartu
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v MiraOS /f >nul 2>&1
exit /b 0
