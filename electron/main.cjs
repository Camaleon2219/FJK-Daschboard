const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'FJK CNC Dashboard',
    backgroundColor: '#020617', // Dark slate industrial theme
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Ensures local file:// origin can fetch from https://api.jsonbin.io without CORS rejection
      sandbox: false
    }
  });

  // Enable F12 or Ctrl+Shift+I to open developer tools if needed
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Open external links in default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
  const indexPath = path.join(__dirname, '../dist/index.html');

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
      }
    });
  } else {
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <!DOCTYPE html>
        <html style="background:#020617;color:#f8fafc;font-family:sans-serif;height:100%;display:flex;align-items:center;justify-content:center;">
          <head><title>FJK CNC Dashboard</title></head>
          <body style="text-align:center;padding:2rem;">
            <h1 style="color:#60a5fa;margin-bottom:0.5rem;">FJK CNC Dashboard</h1>
            <p style="color:#94a3b8;font-size:16px;">Die Anwendung wurde noch nicht kompiliert (Ordner <code>dist/</code> fehlt).</p>
            <p style="color:#cbd5e1;background:#0f172a;padding:12px;border-radius:8px;display:inline-block;border:1px solid #1e293b;">
              Bitte führen Sie im Projektordner folgenden Befehl aus:<br>
              <strong style="color:#38bdf8;">npm run build</strong> oder starten Sie <strong style="color:#38bdf8;">build-electron-app.bat</strong>
            </p>
          </body>
        </html>
      `)}`);
    }
  }

  // Remove standard menu bar for sleek modern desktop look, while keeping shortcuts
  // (F11 fullscreen, Ctrl+R reload, etc.)
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
