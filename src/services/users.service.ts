
import { FotoPerfil, UsuarioFiltro, UsuarioListagem } from "../types/Usuario";


export async function abrirUsuario(id: number) {
    return await window.api.abrirUsuario(id)
}

export async function salvarFotoUsuario(dados: FotoPerfil) {
    return window.api.salvarFotoUsuario(dados);
}

export async function abrirCadastroUsuarios() {
    return window.api.abrirCadastroUsuarios();
}

export async function editUser(id: number) {
    return window.api.openEditUserWindow(id);
}

export async function updateUser(data: any) {
    return window.api.updateUser(data);
}

export async function removeUser(id: number) {
    return window.api.removeUser(id);
}

export async function disableUser(id: number) {
    return window.api.disableUser(id);
}

export async function enableUser(id: number) {
    return window.api.enableUser(id);
}

export async function getUsers(params: UsuarioFiltro): Promise<UsuarioListagem> {
  return await window.api.getUsers(params);
}
