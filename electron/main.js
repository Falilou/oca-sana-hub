/**
 * Electron Main Process
 * OCA Sana Hub Desktop Application
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const http = require('http');
const next = require('next');
const isDev = process.env.NODE_ENV === 'development';
const standalonePort = Number(process.env.STANDALONE_PORT || 3456);

let mainWindow;
let nextServer;

async function startNextServer() {
  if (isDev) {
    return;
  }

  const appDir = app.getAppPath();
  const nextApp = next({ dev: false, dir: appDir });
  await nextApp.prepare();

  const requestHandler = nextApp.getRequestHandler();
  nextServer = http.createServer((req, res) => {
    requestHandler(req, res);
  });

  await new Promise((resolve, reject) => {
    nextServer.once('error', reject);
    nextServer.listen(standalonePort, '127.0.0.1', () => resolve());
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../public/oca-logo.png'),
    title: 'OCA Sana Hub - Portal Dashboard',
    backgroundColor: '#0f172a', // Slate 900
    show: false, // Don't show until ready
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `http://127.0.0.1:${standalonePort}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Create custom menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          },
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 1);
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 1);
          },
        },
        { type: 'separator' },
        {
          label: 'Toggle Full Screen',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About OCA Sana Hub',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About OCA Sana Hub',
              message: 'OCA Sana Hub - Desktop Edition',
              detail: 'Portal Management Dashboard\n\nVersion 1.0.0\n\nManage and access OCA Michelin portals across multiple countries.',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(async () => {
  await startNextServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error) => {
  console.error('Failed to start desktop application:', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.close();
    nextServer = null;
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
