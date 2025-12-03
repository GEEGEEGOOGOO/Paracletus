// Electron Main Process - Adilectus Desktop App
const { app, BrowserWindow, ipcMain, globalShortcut, session, Tray, Menu, nativeImage } = require('electron');

// Fix #2: Bypass Electron's Network Restrictions
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-insecure-localhost');
// app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors'); // Optional, use if needed

if (process.env.HTTP_PROXY) {
  app.commandLine.appendSwitch('proxy-server', process.env.HTTP_PROXY);
}
const path = require('path');
const fs = require('fs');

// Debug Logging Helper
const logFile = path.join(app.getPath('userData'), 'debug_startup.log');
function logToFile(msg) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {
    // ignore
  }
}

logToFile('🚀 Main process starting...');
logToFile(`App Path: ${app.getAppPath()}`);
logToFile(`User Data: ${app.getPath('userData')}`);

const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

// Import ScreenCaptureManager
const ScreenCaptureManager = require('./screenCapture');
const screenCapture = new ScreenCaptureManager();

// Import invisibility module
let invisibility = null;
try {
  invisibility = require('./invisibility');
  console.log('✅ Invisibility module loaded');
} catch (error) {
  console.warn('⚠️ Invisibility module not available:', error.message);
}

let mainWindow = null;
let overlayWindow = null;
let serverProcess = null;
let tray = null;
let isInvisible = false;

// Create overlay window
function createOverlay() {
  overlayWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: 100,
    y: 100,
    frame: false,
    transparent: true,  // Enable transparency
    alwaysOnTop: true,
    resizable: true,
    minWidth: 200,
    minHeight: 200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Enable Web Speech API with proper permissions
      webSecurity: false,
      sandbox: false,
      allowRunningInsecureContent: true,
      // Add permissions for media/speech
      additionalArguments: [
        '--enable-features=MediaStreamTrack',
        '--use-fake-ui-for-media-stream'
      ]
    },
    skipTaskbar: true // Hide from taskbar
  });

  // Enable Content Protection (Hide from screen capture)
  overlayWindow.setContentProtection(true);

  // Set permission handler for microphone
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('📢 Permission requested:', permission);
    if (permission === 'media' || permission === 'microphone' || permission === 'audioCapture') {
      console.log('✅ Permission granted:', permission);
      callback(true);
    } else {
      console.log('❌ Permission denied:', permission);
      callback(false);
    }
  });

  // Use Whisper version (NO WEB SPEECH API!)
  overlayWindow.loadFile(path.join(__dirname, 'overlay-working.html'));

  // Open DevTools only if explicitly requested (avoids console errors)
  if (process.env.DEBUG === 'true') {
    overlayWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // 🔥 INVISIBILITY: Make window invisible to screen share!
  overlayWindow.once('ready-to-show', () => {
    console.log('');
    console.log('🎯 Window ready-to-show event fired');

    if (invisibility) {
      console.log('✅ Invisibility module is loaded');

      // Try immediately (window is ready)
      try {
        const hwnd = overlayWindow.getNativeWindowHandle();
        console.log('✅ Got native window handle');

        const success = invisibility.makeWindowInvisible(hwnd);

        if (success) {
          isInvisible = true;
          console.log('🎉 Invisibility activated successfully!');
        } else {
          console.error('⚠️ Invisibility failed to activate');

          // Try again after a delay
          console.log('🔄 Retrying in 1 second...');
          setTimeout(() => {
            const hwnd2 = overlayWindow.getNativeWindowHandle();
            const success2 = invisibility.makeWindowInvisible(hwnd2);
            if (success2) {
              isInvisible = true;
              console.log('🎉 Invisibility activated on retry!');
            } else {
              console.error('❌ Retry also failed');
            }
          }, 1000);
        }

      } catch (error) {
        console.error('❌ Error in invisibility setup:', error.message);
        console.error('   Stack:', error.stack);
      }

    } else {
      console.error('❌ Invisibility module NOT loaded!');
      console.error('   Window will be VISIBLE in screen share');
    }
    console.log('');
  });

  overlayWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      overlayWindow.hide();
    }
    return false;
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  // Forward console logs from renderer to main process
  overlayWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    console.log(`[Renderer] ${message}`);
  });

  // Create System Tray
  createTray();

  return overlayWindow;
}

// Start Backend Server
function startBackendServer() {
  return new Promise((resolve, reject) => {
    try {
      // Determine paths based on whether app is packaged or in dev
      const isPackaged = app.isPackaged;
      console.log('   isPackaged:', isPackaged);

      const serverPath = isPackaged
        ? path.join(process.resourcesPath, 'server')
        : path.join(__dirname, '..', 'server');

      console.log('   Server path:', serverPath);

      const fs = require('fs');
      if (fs.existsSync(serverPath)) {
        console.log('   ✅ Server path exists');
      } else {
        console.error('   ❌ Server path DOES NOT EXIST:', serverPath);
      }

      const startScript = path.join(serverPath, 'start.js');
      if (fs.existsSync(startScript)) {
        console.log('   ✅ start.js exists at:', startScript);
      } else {
        console.error('   ❌ start.js DOES NOT EXIST at:', startScript);
      }

      // Use spawn to run the server as a child process using SYSTEM Node environment
      const { spawn } = require('child_process');
      console.log('   child_process required');

      // Prepare environment variables
      const env = { ...process.env };
      env.NODE_ENV = isPackaged ? 'production' : 'development';
      env.USER_DATA_PATH = app.getPath('userData');

      // Remove conflicting keys
      // COMMENTED OUT: We need these keys!
      // delete env.GROQ_API_KEY;
      // delete env.GROQ_MODEL;
      // delete env.GOOGLE_API_KEY;

      console.log('   Environment prepared');

      // SKIP SPAWN - User is running backend manually
      console.log('   ⚠️ Skipping backend spawn (Manual Mode)');
      resolve(null);
      return;

      /*
      console.log('   Attempting to spawn node:', startScript);
      serverProcess = spawn('node', [startScript], {
        cwd: serverPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        env
      });
      console.log('   Spawn successful, PID:', serverProcess.pid);
      */

      serverProcess.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        console.log(`[Server] ${msg}`);
        logToFile(`[Server] ${msg}`);
      });

      serverProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        console.error(`[Server Error] ${msg}`);
        logToFile(`[Server Error] ${msg}`);
      });

      serverProcess.on('error', (err) => {
        console.error('❌ Server process error:', err);
        logToFile(`[Server Process Error] ${err.message}`);
        reject(err);
      });

      serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        logToFile(`Server process exited with code ${code}`);
      });

      resolve(serverProcess);

    } catch (err) {
      console.error('❌ CRITICAL ERROR in startBackendServer:', err);
      logToFile(`CRITICAL ERROR in startBackendServer: ${err.message}`);
      reject(err);
      return;
    }
  });
}

function createTray() {
  if (tray) return;

  const iconPath = path.join(__dirname, 'icon.png'); // Ensure this icon exists or use a default
  // For now, we'll create a simple empty image if no icon exists to avoid errors, 
  // but ideally you should have an icon.
  const icon = nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('Adilectus');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide Overlay',
      click: () => {
        if (overlayWindow) {
          if (overlayWindow.isVisible()) {
            overlayWindow.hide();
          } else {
            overlayWindow.show();
          }
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Adilectus',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (overlayWindow) {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
      }
    }
  });
}

app.whenReady().then(async () => {
  console.log('🎤 Adilectus Desktop starting...');

  try {
    await startBackendServer();
  } catch (error) {
    console.error('❌ Could not start backend server. App will close.', error);
    app.quit();
    return;
  }

  // Create overlay window
  createOverlay();

  // Start continuous screen capture
  screenCapture.startCaptureLoop();

  // Global shortcuts
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (overlayWindow) {
      overlayWindow.show();
      overlayWindow.focus();
    }
  });

  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (overlayWindow) {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
      }
    }
  });

  // NEW: Toggle invisibility with Ctrl+Shift+V
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    if (overlayWindow && invisibility) {
      const hwnd = overlayWindow.getNativeWindowHandle();

      if (isInvisible) {
        invisibility.makeWindowVisible(hwnd);
        isInvisible = false;
      } else {
        invisibility.makeWindowInvisible(hwnd);
        isInvisible = true;
      }
    }
  });

  // NEW: Manual Screen Capture with Ctrl+Shift+S
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (overlayWindow) {
      console.log('📸 Manual capture triggered via shortcut');
      overlayWindow.webContents.send('trigger-manual-capture');
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlay();
    }
  });
});

// Quit app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();

  // Kill server process
  if (serverProcess) {
    console.log('👋 Stopping backend server...');
    serverProcess.kill('SIGINT');
  }

  console.log('👋 App shutting down...');
});

// IPC Handlers
ipcMain.handle('minimize-window', () => {
  if (overlayWindow) {
    overlayWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
});

ipcMain.handle('toggle-always-on-top', (event, enabled) => {
  if (overlayWindow) {
    overlayWindow.setAlwaysOnTop(enabled);
  }
});

ipcMain.handle('resize-window', (event, bounds) => {
  if (overlayWindow) {
    // If x/y provided, use setBounds to move and resize
    if (bounds.x !== undefined && bounds.y !== undefined) {
      overlayWindow.setBounds(bounds);
    } else {
      // Otherwise just resize
      overlayWindow.setSize(Math.round(bounds.width), Math.round(bounds.height));
    }
  }
});

ipcMain.handle('get-window-bounds', () => {
  return overlayWindow ? overlayWindow.getBounds() : null;
});

// Screen Capture Handler
const { desktopCapturer } = require('electron');

ipcMain.handle('get-latest-screenshot', () => {
  return screenCapture.getLatestScreenshot();
});

ipcMain.handle('capture-screen', async () => {
  try {
    console.log('📸 Screen capture requested');

    // Get sources (screens)
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 } // HD resolution
    });

    // Get primary screen (usually the first one)
    const primarySource = sources[0];

    if (primarySource) {
      // Get image as base64 data URL
      const image = primarySource.thumbnail.toDataURL();
      console.log('✅ Screen captured successfully');
      return { success: true, image };
    } else {
      console.error('❌ No screen source found');
      return { success: false, error: 'No screen found' };
    }
  } catch (error) {
    createTray();

    return overlayWindow;
  }

  function createTray() {
    if (tray) return;

    const iconPath = path.join(__dirname, 'icon.png'); // Ensure this icon exists or use a default
    // For now, we'll create a simple empty image if no icon exists to avoid errors, 
    // but ideally you should have an icon.
    const icon = nativeImage.createEmpty();

    tray = new Tray(icon);
    tray.setToolTip('Adilectus');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show/Hide Overlay',
        click: () => {
          if (overlayWindow) {
            if (overlayWindow.isVisible()) {
              overlayWindow.hide();
            } else {
              overlayWindow.show();
            }
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit Adilectus',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      if (overlayWindow) {
        if (overlayWindow.isVisible()) {
          overlayWindow.hide();
        } else {
          overlayWindow.show();
        }
      }
    });
  }

  app.whenReady().then(async () => {
    console.log('🎤 Adilectus Desktop starting...');

    try {
      await startBackendServer();
    } catch (error) {
      console.error('❌ Could not start backend server. App will close.', error);
      app.quit();
      return;
    }

    // Create overlay window
    createOverlay();

    // Global shortcuts
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (overlayWindow) {
        overlayWindow.show();
        overlayWindow.focus();
      }
    });

    globalShortcut.register('CommandOrControl+Shift+H', () => {
      if (overlayWindow) {
        if (overlayWindow.isVisible()) {
          overlayWindow.hide();
        } else {
          overlayWindow.show();
        }
      }
    });

    // NEW: Toggle invisibility with Ctrl+Shift+V
    globalShortcut.register('CommandOrControl+Shift+V', () => {
      if (overlayWindow && invisibility) {
        const hwnd = overlayWindow.getNativeWindowHandle();

        if (isInvisible) {
          invisibility.makeWindowVisible(hwnd);
          isInvisible = false;
        } else {
          invisibility.makeWindowInvisible(hwnd);
          isInvisible = true;
        }
      }
    });

    // NEW: Manual Screen Capture with Ctrl+Shift+S
    globalShortcut.register('CommandOrControl+Shift+S', () => {
      if (overlayWindow) {
        console.log('📸 Manual capture triggered via shortcut');
        overlayWindow.webContents.send('trigger-manual-capture');
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createOverlay();
      }
    });
  });

  // Quit app
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();

    // Kill server process
    if (serverProcess) {
      console.log('👋 Stopping backend server...');
      serverProcess.kill('SIGINT');
    }

    console.log('👋 App shutting down...');
  });

  // IPC Handlers
  ipcMain.handle('minimize-window', () => {
    if (overlayWindow) {
      overlayWindow.minimize();
    }
  });

  ipcMain.handle('close-window', () => {
    if (overlayWindow) {
      overlayWindow.hide();
    }
  });

  ipcMain.handle('toggle-always-on-top', (event, enabled) => {
    if (overlayWindow) {
      overlayWindow.setAlwaysOnTop(enabled);
    }
  });

  ipcMain.handle('resize-window', (event, bounds) => {
    if (overlayWindow) {
      // If x/y provided, use setBounds to move and resize
      if (bounds.x !== undefined && bounds.y !== undefined) {
        overlayWindow.setBounds(bounds);
      } else {
        // Otherwise just resize
        overlayWindow.setSize(Math.round(bounds.width), Math.round(bounds.height));
      }
    }
  });

  ipcMain.handle('get-window-bounds', () => {
    return overlayWindow ? overlayWindow.getBounds() : null;
  });

  // Screen Capture Handler
  const { desktopCapturer } = require('electron');

  ipcMain.handle('capture-screen', async () => {
    try {
      console.log('📸 Screen capture requested');

      // Get sources (screens)
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 } // HD resolution
      });

      // Get primary screen (usually the first one)
      const primarySource = sources[0];

      if (primarySource) {
        // Get image as base64 data URL
        const image = primarySource.thumbnail.toDataURL();
        console.log('✅ Screen captured successfully');
        return { success: true, image };
      } else {
        console.error('❌ No screen source found');
        return { success: false, error: 'No screen found' };
      }
    } catch (error) {
      console.error('❌ Screen capture failed:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('✅ Electron main process loaded');
});
