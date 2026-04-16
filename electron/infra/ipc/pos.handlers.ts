import { BrowserWindow, ipcMain } from 'electron';
import { closeCashSession, insertCashSession, getOpenCashSession, registerCashWithdrawal } from "../database/db";
import { CashRestoredSession, CashRestoreSessionData } from '@/types/session.types';


// Aqui você pode adicionar os handlers relacionados ao PDV (Ponto de Venda) POS
export default function registerPosHandlers() {

    ipcMain.handle('open-cash-session', async (_event, data) => {
        console.log("Abrindo caixa com dados: ", data);
        return insertCashSession(data);
    })

    ipcMain.handle('close-cash-session', async (_event, data) => {
        console.log("Fechando caixa com dados: ", data);
        return closeCashSession(data);
    })

    ipcMain.handle('get-open-cash-session', async (_event, data: CashRestoreSessionData): Promise<CashRestoredSession | null> => {
        return getOpenCashSession(data);
    });

    ipcMain.handle('register-cash-withdrawal', async (_event, data) => {
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
