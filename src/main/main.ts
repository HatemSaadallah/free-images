/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import xlsx from 'xlsx';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import DownloadService from './services/download_file.service';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const downloadService = new DownloadService();

let mainWindow: BrowserWindow | null = null;

// if file uploaded
ipcMain.on('file-uploaded', (event, arg) => {
  const filePath = arg[0];
  // read file using xlsx
  const workbook = xlsx.readFile(filePath);
  const sheetNameList = workbook.SheetNames;

  // get hyperlinks
  const sheet = workbook.Sheets[sheetNameList[0]];
  const links: string[] = [];
  // get l.Target
  Object.keys(sheet).forEach((cell) => {
    if (sheet[cell].l) {
      links.push(sheet[cell].l.Target);
    }
  });

  event.reply('file-uploaded', links);
});

ipcMain.on('download-file', (event, obj: Array<any>) => {
  const destinationPath = obj[0];
  // remove first element of obj
  obj.shift();
  console.log(222222222222, {
    destinationPath,
    obj,
  });
  downloadService.getDirectLink(obj, destinationPath);
  event.reply('download-file', obj);
});

// eslint-disable-next-line func-names
ipcMain.on('directory-selected', async function (event) {
  const dir = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!dir.canceled) {
    dialog.showMessageBox({
      type: 'info',
      title: 'Message',
      message: 'Folder Selected',
    });
  } else {
    dialog.showMessageBox({
      type: 'info',
      title: 'Message',
      message: 'Folder Selection Cancelled',
    });
  }

  event.reply('directory-selected', dir.filePaths);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

// if file uploaded
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
