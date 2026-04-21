import { BrowserWindow, ipcMain } from 'electron';
import { closeCashSession, insertCashSession, getOpenCashSession, registerCashWithdrawal } from "../database/db";
import { CashRestoredSession, CashRestoreSessionData } from '@/types/session.types';
import { printDocumentService } from "../../application/printing";
import { assertCurrentUserPermission } from '../security/permission.guard';


// Aqui você pode adicionar os handlers relacionados ao PDV (Ponto de Venda) POS
export default function registerPosHandlers() {

    ipcMain.handle('open-cash-session', async (_event, data) => {
        console.log("Abrindo caixa com dados: ", data);
        const session = insertCashSession(data);
        let print;

        try {
            print = await printDocumentService.printCashOpeningReceipt(session.id!, "AUTO");
        } catch (error) {
            print = {
                success: false,
                status: 'FAILED',
                documentId: 0,
                printerId: null,
                printerName: null,
                message: error instanceof Error ? error.message : 'Falha ao imprimir comprovante de abertura de caixa.',
                jobId: 0,
                reprint: false,
            };
        }

        return { session, print };
    })

    ipcMain.handle('close-cash-session', async (_event, data) => {
        console.log("Fechando caixa com dados: ", data);
        const session = closeCashSession(data);
        let print;

        try {
            print = await printDocumentService.printCashClosingReceipt(session.id!, "AUTO");
        } catch (error) {
            print = {
                success: false,
                status: 'FAILED',
                documentId: 0,
                printerId: null,
                printerName: null,
                message: error instanceof Error ? error.message : 'Falha ao imprimir comprovante de fechamento de caixa.',
                jobId: 0,
                reprint: false,
            };
        }

        return { session, print };
    })

    ipcMain.handle('get-open-cash-session', async (_event, data: CashRestoreSessionData): Promise<CashRestoredSession | null> => {
        return getOpenCashSession(data);
    });

    ipcMain.handle('register-cash-withdrawal', async (_event, data) => {
        assertCurrentUserPermission('cash:withdraw');
        return registerCashWithdrawal(data);
    });

    ipcMain.on('pdv:selecionar-produto', (_event, produto) => {
        for (const window of BrowserWindow.getAllWindows()) {
            window.webContents.send('pdv:produto-selecionado', produto);
        }
    });

    ipcMain.on('pdv:retomar-venda', (_event, venda) => {
        for (const window of BrowserWindow.getAllWindows()) {
            window.webContents.send('pdv:venda-retomada', venda);
        }
    });



}
