@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title FJK CNC Dashboard - Windows Electron Builder

cls
echo ======================================================================
echo           FJK CNC DASHBOARD - WINDOWS .EXE INSTALLER BUILDER         
echo ======================================================================
echo.
echo Dieses Skript erstellt eine native Windows-Anwendung (.exe)
echo auf Basis von Electron für das FJK CNC Dashboard.
echo.

:: 1. Prüfen ob Node.js installiert ist
echo [1/5] Überprüfe Node.js Installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ======================================================================
    echo [FEHLER] Node.js ist auf diesem Computer nicht installiert!
    echo.
    echo Bitte laden Sie die aktuelle LTS-Version von Node.js herunter:
    echo https://nodejs.org
    echo.
    echo Nach der Installation starten Sie diese Datei einfach erneut.
    echo ======================================================================
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  -> Node.js gefunden: %NODE_VER%
echo.

:: 2. Prüfen ob npm vorhanden ist
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] npm Paketmanager wurde nicht gefunden!
    pause
    exit /b 1
)

:: 3. Abhängigkeiten prüfen & installieren
echo [2/5] Überprüfe Projekt-Abhängigkeiten...
if not exist "node_modules\" (
    echo  -> Abhängigkeiten werden zum ersten Mal installiert...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [FEHLER] Fehler beim Installieren der Grund-Abhängigkeiten!
        pause
        exit /b 1
    )
)

:: Electron und Electron-Builder prüfen
if not exist "node_modules\electron\" (
    echo  -> Electron wird im Projekt installiert (einmalig)...
    call npm install --save-dev electron
)

if not exist "node_modules\electron-builder\" (
    echo  -> Electron-Builder wird im Projekt installiert (einmalig)...
    call npm install --save-dev electron-builder
)

echo  -> Alle Abhängigkeiten sind bereit.
echo.

:: 4. Auswahlmenü für den gewünschten Build-Typ
:MENU
echo ======================================================================
echo Bitte wählen Sie die gewünschte Windows-Aktion:
echo ======================================================================
echo  [1] Standard Windows-Installer (.exe Setup-Assistent mit Desktop-Icon)
echo  [2] Portable Version (.exe ohne Installation, ideal für USB-Sticks)
echo  [3] Beide Versionen erstellen (Installer + Portable .exe)
echo  [4] Desktop-App jetzt sofort im Testfenster starten (ohne Bauen)
echo  [5] Beenden
echo ======================================================================
set /p USER_CHOICE="Ihre Auswahl (1, 2, 3, 4 oder 5): "

if "%USER_CHOICE%"=="1" goto BUILD_INSTALLER
if "%USER_CHOICE%"=="2" goto BUILD_PORTABLE
if "%USER_CHOICE%"=="3" goto BUILD_BOTH
if "%USER_CHOICE%"=="4" goto RUN_TEST
if "%USER_CHOICE%"=="5" goto END_SCRIPT

echo Ungültige Eingabe! Bitte 1, 2, 3, 4 oder 5 wählen.
echo.
goto MENU

:BUILD_INSTALLER
echo.
echo [3/5] Kompiliere Dashboard (Vite Frontend)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Frontend-Build fehlgeschlagen.
    pause
    exit /b 1
)

echo.
echo [4/5] Erstelle Windows Setup-Installer (.exe)...
call npx electron-builder --win nsis
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Erstellung der .exe fehlgeschlagen.
    pause
    exit /b 1
)
goto SUCCESS_MESSAGE

:BUILD_PORTABLE
echo.
echo [3/5] Kompiliere Dashboard (Vite Frontend)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Frontend-Build fehlgeschlagen.
    pause
    exit /b 1
)

echo.
echo [4/5] Erstelle Windows Portable .exe...
call npx electron-builder --win portable
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Erstellung der .exe fehlgeschlagen.
    pause
    exit /b 1
)
goto SUCCESS_MESSAGE

:BUILD_BOTH
echo.
echo [3/5] Kompiliere Dashboard (Vite Frontend)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Frontend-Build fehlgeschlagen.
    pause
    exit /b 1
)

echo.
echo [4/5] Erstelle Installer & Portable .exe...
call npx electron-builder --win nsis portable
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Erstellung der .exe fehlgeschlagen.
    pause
    exit /b 1
)
goto SUCCESS_MESSAGE

:RUN_TEST
echo.
echo Starte FJK CNC Dashboard im Electron-Testfenster...
if not exist "dist\index.html" (
    echo Kompiliere zuerst das Dashboard...
    call npm run build
)
call npx electron electron/main.cjs
goto END_SCRIPT

:SUCCESS_MESSAGE
echo.
echo ======================================================================
echo [ERFOLG] Die Windows .exe wurde erfolgreich erstellt!
echo ======================================================================
echo.
echo Sie finden Ihre fertige Installationsdatei im Ordner:
echo   --^> release\
echo.
echo Öffne den Ausgabe-Ordner im Windows Explorer...
if exist "release\" (
    start "" "release"
)
echo.
pause
goto END_SCRIPT

:END_SCRIPT
echo Auf Wiedersehen!
exit /b 0
