import { Usuario } from "../types/Usuario";

export async function login(username: string, password: string): Promise<Usuario | null> {
    return await window.api.login(username, password);
}

export async function buscarUsuario(id: number): Promise<Usuario | null> {
  console.log(id)
  return await window.api.buscarUsuario(id);
}

// VALIDANDO REMOCAO DE TRECHO DE CODIGO
// export async function getUsers(params: UsuarioFiltro): Promise<UsuarioListagem> {
//   console.log("Parametros do filtro", params)
//   return await window.api.listarUsuarios(params);
// }

export async function addUsuario(dados: {
  nome: string;
  funcao: string;
  email: string;
  username: string;
  password: string;
  ativo: number;
}) {
  console.log(dados)
  return await window.api.addUsuario(dados);
}

export async function updateUserPassword(id: number, newPassword: string) {
  //console.log("Verificando valores da nova senha, id: ", id ," e password: ", newPassword)
  return await window.api.updateUserPassword(id, newPassword);
}

