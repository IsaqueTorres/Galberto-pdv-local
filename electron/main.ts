import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import 'dotenv/config'; // pacote usado para carregar variaveis de ambiente em .env
import registerFiscalHandlers from './infra/ipc/fiscal.handlers'
import registerSalesHandlers from './infra/ipc/sales.handlers'
import registerWindowHandlers from './infra/ipc/window.handlers';
import registerCustomerHandlers from './infra/ipc/customer.handlers';
import registerProductHandlers from './infra/ipc/products.handlers';
import registerPrinterhandlers from './infra/ipc/printer.handlers';
import registerAuthHandlers from './infra/ipc/auth.handlers';
import registerUserHandlers from './infra/ipc/user.handlers';
import registerPosHandlers from './infra/ipc/pos.handlers';
import registerIntegrationHandlers from './infra/ipc/integrations.handlers';
import { enableForeignKeys } from './infra/database/db';
import { startFiscalQueueWorker } from './application/fiscal';
import path from 'node:path';
import { logger } from './logger/logger';
import { encerrarSessao } from './session';
import { getCurrentSession } from "./infra/session/session.store";


const __dirname = import.meta.dirname;
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null = null
let pdvWindow: BrowserWindow | null = null
// Cria a janela principal do App
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    logger.error(`Renderer falhou ao carregar: [${errorCode}] ${errorDescription}`)
  })

  win.webContents.on('render-process-gone', (_event, details) => {
    logger.error(`Renderer process encerrado: ${details.reason}`)
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
  win.maximize();
  win.on("close", () => {
    if (pdvWindow && !pdvWindow.isDestroyed()) {
      pdvWindow.close();
    }
  }

  );

}

app.on("before-quit", () => {
   const sessionId = getCurrentSession();
  if (sessionId) {
    encerrarSessao(sessionId);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

ipcMain.on("app:fechar-janela", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.close();
  }
});

ipcMain.handle('app:quit-with-confirm', async () => {
  logger.info('Encerramento solicitado pelo usuário');

  const { response } = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Cancelar', 'Sair'],
    defaultId: 1,
    cancelId: 0,
    message: 'Tem certeza que deseja sair do sistema?'
  });

  if (response === 1) {
    app.quit();
    return true;
  }

  return false;
});

app.whenReady().then(() => {
  enableForeignKeys();
  startFiscalQueueWorker();
  registerWindowHandlers();
  registerFiscalHandlers();
  registerSalesHandlers();
  registerCustomerHandlers();
  registerProductHandlers();
  registerPrinterhandlers();
  registerAuthHandlers();
  registerUserHandlers();
  registerPosHandlers();
  registerIntegrationHandlers();

  createWindow();
  logger.info('Criado janela principal do App')

});
