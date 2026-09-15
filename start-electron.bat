@echo off
chcp 65001 >nul
echo Starte FJK CNC Dashboard im Electron Desktop-Fenster...
if not exist "node_modules\" (
    echo Installiere Abhängigkeiten...
    call npm install
)
if not exist "dist\index.html" (
    echo Baue Anwendung...
    call npm run build
)
call npx electron electron/main.cjs
