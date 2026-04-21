import { ipcMain, dialog } from "electron";
import { buscarUsuario } from "../database/db";
import { autenticarUsuario } from "../../auth";
import { encerrarSessao } from "../../../electron/session";
import { logger } from "../../logger/logger";
import { setCurrentSession, getCurrentSession } from "../session/session.store";
import { assertCurrentUserPermission } from "../security/permission.guard";



export default function registerAuthHandlers() {

    ipcMain.handle("auth:login", (_event, username: string, password: string) => {
        const user = autenticarUsuario(username, password);
        setCurrentSession(user.sessionId);
        return user;
    });

    ipcMain.handle("auth:buscar-usuario", (_, id: number) => {
        if (!id) throw new Error("ID inválido");
        assertCurrentUserPermission("users:manage");
        return buscarUsuario(id);
    });

    ipcMain.handle("app:logoff-with-confirm", async () => {
        logger.info("Logoff solicitado pelo usuario");

        const { response } = await dialog.showMessageBox({
            type: "question",
            buttons: ["cancelar", "sair"],
            defaultId: 1,
            cancelId: 0,
            message: "Tem certeza que deseja encerrar sessao?"
        });

        if (response === 1) {
            const sessionId = getCurrentSession();

            if (sessionId) {
                encerrarSessao(sessionId);
                setCurrentSession(null); // limpa estado
            }

            logger.info("logoff aprovado pelo usuario");
            return true;
        }

        return false;
    });
}
