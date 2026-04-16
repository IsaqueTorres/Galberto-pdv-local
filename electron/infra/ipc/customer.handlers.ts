// import { ipcMain } from "electron";
// import { buscarCliente, buscarClientePorId, addCliente, listarClientes } from "../database/db";

export default function registerCustomerHandlers() {

    // // Escuta o render invokar Busca por ID de cliente na pagina cliente.
    // ipcMain.handle('clientes:buscar-por-id', (_event, id: number) => {
    //     return buscarClientePorId(id)
    // })
    // // Escuta o render invocar Cadastrar cliente
    // ipcMain.handle("clientes:add", (_event, dados) => {
    //     return addCliente(dados);
    // })

    // // Escuta o render invocar Listar clientes no painel da pagina clientes
    // ipcMain.handle("clientes:get", (_, params) => {
    //     return listarClientes(params);
    // })

    // // Escuta o render invocar Pesquisar clientes no painel da pagina clientes
    // ipcMain.handle("clientes:pesquisar", (_event, cpf) => {
    //     return buscarCliente(cpf);
    // })


}