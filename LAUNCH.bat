@echo off
setlocal EnableDelayedExpansion

for /f "delims=" %%a in ('powershell -noprofile -command "[char]27"') do set ESC=%%a
set C1=%ESC%[31m
set C2=%ESC%[33m
set C3=%ESC%[32m
set RESET=%ESC%[0m

echo %C3%====================================================%RESET%
echo %C2%      Starte MemeForge-AI Desktop...%RESET%
echo %C3%====================================================%RESET%

call npm run electron:dev
