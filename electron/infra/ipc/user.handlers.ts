import { ipcMain } from "electron";
import * as fs from "fs";
import { app } from "electron";
import path from 'node:path';
import {
    updateUser, disableUser, enableUser, addUsuario, selectUsers, alterarSenhaUsuario, removerUsuario
} from "../database/db";


export default function registerUserHandlers() {

    ipcMain.handle("salvar-foto-usuario", async (_, dados) => {
        const userData = app.getPath("userData");
        const pasta = path.join(userData, "fotos");

        if (!fs.existsSync(pasta)) fs.mkdirSync(pasta);

        const caminho = path.join(pasta, dados.nomeArquivo);
        fs.writeFileSync(caminho, Buffer.from(dados.buffer));

        return caminho;
    });

    ipcMain.handle("update-user", (_, data) => {
        return updateUser(data);
    })

    ipcMain.handle("disable-user", (_, id) => {
        return disableUser(id);
    })

    ipcMain.handle("enable-user", (_, id) => {
        return enableUser(id);
    })

    ipcMain.handle("user:update-password", (_event, id: number, newPassword: string) => {
        return alterarSenhaUsuario(id, newPassword)
    })

    ipcMain.handle("get-users", (_, params) => {
        return selectUsers(params)
    })

    // VALIDANDO REMOCAO DE TRECHO DE CODIGO
    // ipcMain.handle("usuarios:listar", (_, params) => {
    //     return listarUsuarios(params)
    // })

    ipcMain.handle("usuarios:add", (_event, dados: any) => {
        return addUsuario(dados)
    })

    ipcMain.handle("delete-user", (_event, id: number) => {
        return removerUsuario(id)
    })
}