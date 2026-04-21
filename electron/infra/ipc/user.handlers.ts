import { ipcMain } from "electron";
import * as fs from "fs";
import { app } from "electron";
import path from 'node:path';
import {
    updateUser, disableUser, enableUser, addUsuario, selectUsers, alterarSenhaUsuario, removerUsuario
} from "../database/db";
import { assertCurrentUserPermission } from "../security/permission.guard";


export default function registerUserHandlers() {

    ipcMain.handle("salvar-foto-usuario", async (_, dados) => {
        assertCurrentUserPermission("users:manage");
        const userData = app.getPath("userData");
        const pasta = path.join(userData, "fotos");

        if (!fs.existsSync(pasta)) fs.mkdirSync(pasta);

        const extensao = path.extname(dados.nomeArquivo || "");
        const baseName = path
            .basename(dados.nomeArquivo || "foto", extensao)
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 40);
        const caminho = path.join(pasta, `${Date.now()}-${baseName}${extensao}`);
        fs.writeFileSync(caminho, Buffer.from(dados.buffer));

        return caminho;
    });

    ipcMain.handle("update-user", (_, data) => {
        assertCurrentUserPermission("users:manage");
        return updateUser(data);
    })

    ipcMain.handle("disable-user", (_, id) => {
        assertCurrentUserPermission("users:manage");
        return disableUser(id);
    })

    ipcMain.handle("enable-user", (_, id) => {
        assertCurrentUserPermission("users:manage");
        return enableUser(id);
    })

    ipcMain.handle("user:update-password", (_event, id: number, newPassword: string) => {
        assertCurrentUserPermission("users:manage");
        return alterarSenhaUsuario(id, newPassword)
    })

    ipcMain.handle("get-users", (_, params) => {
        assertCurrentUserPermission("users:manage");
        return selectUsers(params)
    })

    // VALIDANDO REMOCAO DE TRECHO DE CODIGO
    // ipcMain.handle("usuarios:listar", (_, params) => {
    //     return listarUsuarios(params)
    // })

    ipcMain.handle("usuarios:add", (_event, dados: any) => {
        assertCurrentUserPermission("users:manage");
        return addUsuario(dados)
    })

    ipcMain.handle("delete-user", (_event, id: number) => {
        assertCurrentUserPermission("users:manage");
        return removerUsuario(id)
    })
}
