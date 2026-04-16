import { ipcMain, BrowserWindow } from "electron"
import {
    addPrinter, listarPrinters, getPrinterPadrao, removerPrinter, definirPrinterPadrao
} from "../database/db";

export default function registerPrinterhandlers() {

    ipcMain.handle("printer:buscar-impressoras", async () => {
        const win = BrowserWindow.getAllWindows()[0]
        return win.webContents.getPrintersAsync()
    })

    ipcMain.handle("printer:add-impressora", (_event, dados) => {
        return addPrinter(dados)
    })

    ipcMain.handle("printer:listar-cadastradas", () => {
        return listarPrinters()
    })

    ipcMain.handle("printer:get-padrao", () => {
        return getPrinterPadrao()
    })

    ipcMain.handle("printer:remover", (_event, id: number) => {
        return removerPrinter(id)
    })

    ipcMain.handle("printer:definir-padrao", (_event, id: number) => {
        return definirPrinterPadrao(id)
    })

}