# FJK CNC Dashboard – Windows Desktop App (.exe mit Electron)

Diese Anleitung erklärt, wie du das **FJK CNC Dashboard** als vollwertige Windows-Anwendung (`.exe`) installierst oder als portable App erstellst.

---

## ⚡ Schnellstart: 1-Klick-Erstellung mit der .BAT Datei

Im Hauptordner des Projekts befindet sich die Datei **`build-electron-app.bat`**.

1. **Voraussetzung prüfen:**
   - Auf dem Windows-PC muss [Node.js (LTS)](https://nodejs.org) installiert sein.
2. **Batch-Datei starten:**
   - Mache einen Doppelklick auf **`build-electron-app.bat`**.
3. **Option wählen:**
   - **[1] Windows Installer (.exe)**: Erstellt eine Installationsdatei mit Setup-Assistent und Desktop-Verknüpfung.
   - **[2] Portable .exe**: Erstellt eine einzelne ausführbare `.exe`-Datei, die ohne Installation direkt gestartet werden kann (z.B. vom USB-Stick).
   - **[3] Beide Versionen**: Erstellt sowohl den Installer als auch die portable Datei.
   - **[4] Sofort testen**: Startet das Dashboard direkt im Electron-Fenster, ohne eine `.exe` zu bauen.

Das Skript übernimmt automatisch:
- Überprüfung von Node.js & npm
- Installation von Electron und electron-builder (beim ersten Mal)
- Kompilierung des Dashboards (`npm run build`)
- Erstellung der Windows `.exe`
- Automatisches Öffnen des Ausgabeordners `release\` im Windows Explorer!

---

## 📁 Wo liegt die fertige .exe Datei?

Nach dem Durchlauf von `build-electron-app.bat` findest du die fertigen Dateien im Ordner:
```
release/
  ├── FJK CNC Dashboard Setup 0.0.0.exe   (Windows Setup-Installer)
  └── FJK CNC Dashboard 0.0.0.exe         (Portable Version)
```

---

## 🛠️ Manuelle Befehle (falls über Terminal gewünscht)

Du kannst die Schritte auch manuell in der Windows Eingabeaufforderung (CMD) oder PowerShell ausführen:

```cmd
# 1. Abhängigkeiten installieren
npm install
npm install --save-dev electron electron-builder

# 2. Frontend bauen
npm run build

# 3. Direkt als Desktop-App testen
npm run electron:start

# 4. Windows Setup-Installer (.exe) bauen
npm run electron:build

# 5. Portable Windows .exe bauen
npm run electron:build:portable
```

---

## 💡 Hinweise & Features der Electron-Version

- **Automatische Offline-Sicherung:** Da das Dashboard den `localStorage` nutzt, merkt sich die installierte `.exe` deine eingetragene Bin-ID, den Read-Key und die zuletzt geladenen Werkzeugdaten dauerhaft.
- **Sicherer Read-Only Zugriff:** Keine Schreibrechte erforderlich.
- **Windows-Integration:** Desktop-Verknüpfung, Startmenü-Eintrag und saubere Deinstallation über die Windows-Systemsteuerung.
- **Industrie-Design:** Dunkles Werkstatt-Theme mit optimierter Fenstergröße (1360 x 860 px) und Zoom-Unterstützung.
