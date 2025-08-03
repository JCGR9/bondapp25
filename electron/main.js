const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Crear la ventana principal
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Opcional: añadir icono
    titleBarStyle: 'default',
    show: false, // No mostrar hasta que esté listo
  });

  // Cargar la aplicación
  const startUrl = isDev 
    ? 'http://localhost:5174' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Mostrar cuando esté listo para prevenir flash visual
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir DevTools en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Prevenir que se abran nuevas ventanas y en su lugar abrir en navegador externo
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('🔗 Interceptando window.open para URL:', url);
    
    // Verificar si es una URL de Google (autorización)
    if (url.includes('accounts.google.com') || url.includes('googleapis.com')) {
      console.log('✅ URL de Google detectada, abriendo en navegador externo');
      shell.openExternal(url);
      return { action: 'deny' };
    }
    
    // Para otras URLs, también abrir externamente por seguridad
    console.log('🌐 Abriendo URL externa:', url);
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // También manejar navegación externa
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    console.log('🧭 Intentando navegar a:', navigationUrl);
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5174') {
      console.log('🚀 Navegación externa detectada, abriendo en navegador del sistema');
      event.preventDefault();
      shell.openExternal(navigationUrl);
    } else {
      console.log('✅ Navegación interna permitida');
    }
  });

  // Configurar menú personalizado
  const template = [
    {
      label: 'BondApp',
      submenu: [
        {
          label: 'Acerca de BondApp',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rehacer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Pegar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Vista',
      submenu: [
        { label: 'Recargar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Forzar Recarga', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Herramientas de Desarrollador', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Zoom Real', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Acercar', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Alejar', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Pantalla Completa', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Esta app estará lista cuando Electron haya terminado de inicializar
app.whenReady().then(createWindow);

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Seguridad: Prevenir navegación a sitios externos
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    event.preventDefault();
  });
  
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:5175' && !navigationUrl.startsWith('file://')) {
      navigationEvent.preventDefault();
    }
  });
});
