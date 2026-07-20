@echo off
setlocal EnableDelayedExpansion

:: Enable ANSI Colors in Windows CMD
for /f "delims=" %%a in ('powershell -noprofile -command "[char]27"') do set ESC=%%a

:: Rainbow Colors
set C1=%ESC%[31m
set C2=%ESC%[33m
set C3=%ESC%[32m
set C4=%ESC%[36m
set C5=%ESC%[34m
set C6=%ESC%[35m
set RESET=%ESC%[0m

echo %C1%====================================================%RESET%
echo %C2%      MemeForge-AI Desktop Installer%RESET%
echo %C3%      Copyright (c) 2026 Dinottinjs%RESET%
echo %C4%====================================================%RESET%
echo.
echo %C5%[*] Starte Installation der MemeForge-AI App...%RESET%

echo %C6%[+] Installiere Abhaengigkeiten (npm install)...%RESET%
call npm install --no-audit --no-fund --loglevel=error --prefer-offline

echo.
echo %C3%====================================================%RESET%
echo %C4%      Installation erfolgreich abgeschlossen!%RESET%
echo %C5%      Nutze 'launch.bat' um das Programm zu starten.%RESET%
echo %C6%====================================================%RESET%
pause
