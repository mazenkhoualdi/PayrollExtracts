const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('node:path');
const url = require('node:url');

const isDev = !app.isPackaged;
const DEV_SERVER_URL = 'http://localhost:5173';


protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'Extraits de Salaire',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    autoHideMenuBar: true,
  });

  if (isDev) {
    win.loadURL(DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadURL('app://bundle/index.html');
  }
}

app.whenReady().then(() => {
  if (!isDev) {
    // dist/ est le dossier généré par "vite build" (voir vite.config.js: outDir).
    const distPath = path.join(__dirname, '..', 'dist');

    protocol.handle('app', (request) => {
      const reqUrl = new URL(request.url);
      // "app://bundle/index.html" -> pathname = "/index.html"
      let relativePath = decodeURIComponent(reqUrl.pathname);
      if (relativePath === '' || relativePath === '/') relativePath = '/index.html';

      const filePath = path.normalize(path.join(distPath, relativePath));

      // Sécurité : empêcher toute sortie du dossier dist/
      if (!filePath.startsWith(distPath)) {
        return new Response('Forbidden', { status: 403 });
      }

      return net.fetch(url.pathToFileURL(filePath).toString());
    });
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
