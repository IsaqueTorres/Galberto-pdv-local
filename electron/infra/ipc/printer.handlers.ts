import { ipcMain, BrowserWindow } from "electron"
import {
    addPrinter, listarPrinters, getPrinterPadrao, removerPrinter, definirPrinterPadrao, atualizarLayoutPrinter, atualizarPersonalizacaoCupomPrinter
} from "../database/db";
import { printDocumentService } from "../../application/printing";
import { assertCurrentUserPermission } from "../security/permission.guard";

export default function registerPrinterhandlers() {

    ipcMain.handle("printer:buscar-impressoras", async () => {
        assertCurrentUserPermission("printers:manage")
        const win = BrowserWindow.getAllWindows()[0]
        return win.webContents.getPrintersAsync()
    })

    ipcMain.handle("printer:add-impressora", (_event, dados) => {
        assertCurrentUserPermission("printers:manage")
        return addPrinter(dados)
    })

    ipcMain.handle("printer:listar-cadastradas", () => {
        assertCurrentUserPermission("printers:manage")
        return listarPrinters()
    })

    ipcMain.handle("printer:get-padrao", () => {
        return getPrinterPadrao()
    })

    ipcMain.handle("printer:remover", (_event, id: number) => {
        assertCurrentUserPermission("printers:manage")
        return removerPrinter(id)
    })

    ipcMain.handle("printer:definir-padrao", (_event, id: number) => {
        assertCurrentUserPermission("printers:manage")
        return definirPrinterPadrao(id)
    })

    ipcMain.handle("printer:atualizar-layout", (_event, id: number, dados) => {
        assertCurrentUserPermission("printers:manage")
        return atualizarLayoutPrinter(id, dados)
    })

    ipcMain.handle("printer:atualizar-personalizacao", (_event, id: number, receiptSettingsJson: string) => {
        assertCurrentUserPermission("printers:manage")
        return atualizarPersonalizacaoCupomPrinter(id, receiptSettingsJson)
    })

    ipcMain.handle("printer:test-print", (_event, printerId: number) => {
        assertCurrentUserPermission("printers:manage")
        return printDocumentService.printTestReceipt(printerId)
    })

    ipcMain.handle("printer:reprint-sale-receipt", (_event, saleId: number) => {
        assertCurrentUserPermission("sales:view")
        return printDocumentService.reprintSaleReceipt(saleId)
    })

}
