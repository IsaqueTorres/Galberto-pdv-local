import { ipcMain, BrowserWindow } from "electron"
import {
    addPrinter, listarPrinters, getPrinterPadrao, removerPrinter, definirPrinterPadrao, atualizarLayoutPrinter, atualizarPersonalizacaoCupomPrinter
} from "../database/db";
import { printDocumentService } from "../../application/printing";

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

    ipcMain.handle("printer:atualizar-layout", (_event, id: number, dados) => {
        return atualizarLayoutPrinter(id, dados)
    })

    ipcMain.handle("printer:atualizar-personalizacao", (_event, id: number, receiptSettingsJson: string) => {
        return atualizarPersonalizacaoCupomPrinter(id, receiptSettingsJson)
    })

    ipcMain.handle("printer:test-print", (_event, printerId: number) => {
        return printDocumentService.printTestReceipt(printerId)
    })

    ipcMain.handle("printer:reprint-sale-receipt", (_event, saleId: number) => {
        return printDocumentService.reprintSaleReceipt(saleId)
    })

}
