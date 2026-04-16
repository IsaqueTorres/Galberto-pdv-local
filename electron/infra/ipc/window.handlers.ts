import { BrowserWindow, ipcMain, shell } from "electron"
import { VITE_DEV_SERVER_URL } from '../../main'
import path from 'node:path';

let viewVendaWindow: BrowserWindow | null = null;
let viewUsuarioWindow: BrowserWindow | null = null;
let cadastrarUsuarioWindow: BrowserWindow | null = null;
let editUserWindow: BrowserWindow | null = null;
let searchProductWindow: BrowserWindow | null = null;
let configAppWindow: BrowserWindow | null = null;
let searchSalesWindow: BrowserWindow | null = null;

const __dirname = import.meta.dirname;
process.env.APP_ROOT = path.join(__dirname, '..')

export default function registerWindowHandlers() {
  ipcMain.handle("app:open-external-url", async (_event, url: string) => {
    await shell.openExternal(url);
    return true;
  });

  ipcMain.on("window:open:sales-search", () => {
    //condicao que impede o usuario de abrir varias janelas
    if (searchSalesWindow && !searchSalesWindow.isDestroyed()) {
      searchSalesWindow.focus();
      return;

    }
    createSearchSalesWindow();
  })

  // Janela Buscar Vendas menu F2 no PDV Rapido
  function createSearchSalesWindow() {
    searchSalesWindow = new BrowserWindow({
      title: "Vendas",
      width: 600,
      height: 530,
      center: true,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    searchSalesWindow.maximize();

    if (VITE_DEV_SERVER_URL) {
      searchSalesWindow.loadURL(`${VITE_DEV_SERVER_URL}#/sales/search`)
    } else {
      // win.loadFile('dist/index.html')
      searchSalesWindow.loadFile(path.join('dist/index.html'))
    }
  }

  // Cria a janela "ver" dentro de vendas.
  function createViewVendaWindow(id: number) {
    viewVendaWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Venda #${id}`,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (VITE_DEV_SERVER_URL) {
      viewVendaWindow.loadURL(`${VITE_DEV_SERVER_URL}#/vendas/${id}`)
    } else {
      // win.loadFile('dist/index.html')
      viewVendaWindow.loadFile(path.join('dist/index.html')), {
        hash: `/vendas/${id}`,
      }
    }
  }

  // Validado 23/03/2026 - Janela chamada no PDV Rapido menu F3
  function createSearchProductWindow() {
    searchProductWindow = new BrowserWindow({
      title: "Search Product",
      maximizable: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (VITE_DEV_SERVER_URL) {
      searchProductWindow.loadURL(`${VITE_DEV_SERVER_URL}#/products/search`)
    } else {
      // win.loadFile('dist/index.html')
      searchProductWindow.loadFile(path.join('dist/index.html')), {
        hash: `/products/search`,
      }
    }
  }

  function createViewUsuarioWindow(id: number) {
    viewUsuarioWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Usuario #${id}`,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (VITE_DEV_SERVER_URL) {
      viewUsuarioWindow.loadURL(`${VITE_DEV_SERVER_URL}#/config/usuarios/${id}`)
    } else {
      // win.loadFile('dist/index.html')
      viewUsuarioWindow.loadFile(path.join('dist/index.html')), {
        hash: `/config/usuarios/${id}`,
      }
    }
  }

  function createConfigWindow() {
    editUserWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Config PDV`,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (VITE_DEV_SERVER_URL) {
      editUserWindow.loadURL(`${VITE_DEV_SERVER_URL}#/config/app`)
    } else {
      // win.loadFile('dist/index.html')
      editUserWindow.loadFile(path.join('dist/index.html')), {
        hash: `/config/app`,
      }
    }
  }

  // Esse handler cria a janela pesquisar vendas, nao apagar !
  // - PDV Rapido menu F2
  ipcMain.on("open-search-sales-window", () => {
    // condicao if que impede usuario de abrir varias janelas
    if (searchProductWindow && !searchProductWindow.isDestroyed()) {
      searchProductWindow.focus();
      return;
    }
    createSearchSalesWindow();
  });

  // Esse handler cria a janela config, dentro de pdv Rapido menu SHIFT + S, nao apagar!
  ipcMain.on("window:open:config", () => {
    // condicao if que impede usuario de abrir varias janelas
    if (configAppWindow && !configAppWindow.isDestroyed()) {
      configAppWindow.focus();
      return;
    }
    createConfigWindow();
  });

  // Essa janela esta localizada em algumas paginas, nao apagar
  // - PDV Rapido menu F3
  ipcMain.on("window:open:products-search", () => {
    // condicao if que impede usuario de abrir varias janelas
    if (searchProductWindow && !searchProductWindow.isDestroyed()) {
      searchProductWindow.focus();
      return;
    }
    createSearchProductWindow();
  });

  ipcMain.on("vendas:criar-janela-ver-vendas", (_, id: number) => {

    // condicao if que impede usuario de abrir varias janelas
    if (viewVendaWindow && !viewVendaWindow.isDestroyed()) {
      viewVendaWindow.focus();
      return;
    }
    createViewVendaWindow(id);

  });

  ipcMain.on("usuarios:criar-janela-ver-usuario", (_, id: number) => {
    if (viewUsuarioWindow && !viewUsuarioWindow.isDestroyed()) {
      viewUsuarioWindow.focus();
      return;
    }
    createViewUsuarioWindow(id);
  });

  ipcMain.on("window:open:create-user", () => {

    // condicao if que impede usuario de abrir varias janelas
    if (cadastrarUsuarioWindow && !cadastrarUsuarioWindow.isDestroyed()) {
      cadastrarUsuarioWindow.focus();
      return;
    }
    createCadastroUsuarioWindow();
  });

  ipcMain.on("window:open:edit-user", (_, id: number) => {
    //condicao if que impede usuario de abrir varias janelas
    if (editUserWindow && !editUserWindow.isDestroyed()) {
      editUserWindow.focus();
      return;
    }
    createEditUserWindow(id);
  });

  function createCadastroUsuarioWindow() {
    cadastrarUsuarioWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Cadastrar Usuario`,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (VITE_DEV_SERVER_URL) {
      cadastrarUsuarioWindow.loadURL(`${VITE_DEV_SERVER_URL}#/config/usuarios/cadastrar_usuario`)
    } else {
      // win.loadFile('dist/index.html')
      cadastrarUsuarioWindow.loadFile(path.join('dist/index.html')), {
        hash: `/config/usuarios/cadastrar_usuario`,
      }
    }
  }

  function createEditUserWindow(id: number) {
    editUserWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Editar Usuario`,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (VITE_DEV_SERVER_URL) {
      editUserWindow.loadURL(`${VITE_DEV_SERVER_URL}#/config/users/edit_user/${id}`)
    } else {
      // win.loadFile('dist/index.html')
      editUserWindow.loadFile(path.join('dist/index.html')), {
        hash: `/config/users/edit_user/${id}`,
      }
    }
  }
}
