"use strict";
const electron = require("electron");
let currentSessionId = null;
function getCurrentSession() {
  return currentSessionId;
}
electron.contextBridge.exposeInMainWorld("api", {
  //#region - Regiao responsavel por testar remocao, tudo que esta aqui dentro se nao fizer falta sera removido
  //#endregion
  getCurrentSession,
  searchSalesWindow: () => electron.ipcRenderer.send("window:open:sales-search"),
  //VALIDADO POS MIGRACAO, PADRAO DE IPC CALL
  openConfigWindow: () => electron.ipcRenderer.send("window:open:config"),
  //VALIDADO POS MIGRACAO, PADRAO DE IPC CALL, PDV Rapido menu SHIFT + S
  openSearchProductWindow: () => electron.ipcRenderer.send("window:open:products-search"),
  //VALIDADO POS MIGRACAO, PADRAO DE IPC CALL
  openExternalUrl: (url) => electron.ipcRenderer.invoke("app:open-external-url", url),
  selecionarProduto: (produto) => electron.ipcRenderer.send("pdv:selecionar-produto", produto),
  onProdutoSelecionado: (callback) => {
    const listener = (_event, produto) => callback(produto);
    electron.ipcRenderer.on("pdv:produto-selecionado", listener);
    return () => electron.ipcRenderer.removeListener("pdv:produto-selecionado", listener);
  },
  retomarVendaNoPdv: (venda) => electron.ipcRenderer.send("pdv:retomar-venda", venda),
  onVendaRetomada: (callback) => {
    const listener = (_event, venda) => callback(venda);
    electron.ipcRenderer.on("pdv:venda-retomada", listener);
    return () => electron.ipcRenderer.removeListener("pdv:venda-retomada", listener);
  },
  fecharJanela: () => electron.ipcRenderer.send("app:fechar-janela"),
  abrirCadastroUsuarios: () => electron.ipcRenderer.send("window:open:create-user"),
  // Chamada IPC Segura: Abrir Janela Editar Produtos
  openEditUserWindow: (id) => electron.ipcRenderer.send("window:open:edit-user", id),
  // Chamada IPC Segura: Abrir Janela Detalhes Produtos
  openProductDetails: (id) => electron.ipcRenderer.send("open:product-details-window", id),
  // FIM DAS PONTES QUE INTERAGEM COM JANELAS //
  // PONTES QUE INTERAGEM COM O BANCO DE DADOS //
  // Chamada IPC Segura para interagir com a tabela produtos.
  listarProdutos: (params) => electron.ipcRenderer.invoke("produtos:get", params),
  buscarProdutoPorCodigoBarras: (codigo) => electron.ipcRenderer.invoke("produtos:buscar-por-codigo-de-barras", codigo),
  buscarProdutoPorNome: (termo) => electron.ipcRenderer.invoke("produtos:buscar-por-nome", termo),
  getProductById: (id) => electron.ipcRenderer.invoke("get-products-by-id", id),
  // antes buscarProdutoPorID
  // Chamada IPC Segura para interagir com estoque
  searchProductsForStockMovement: (term) => electron.ipcRenderer.invoke("suggest-product-by-term", term),
  // Chamada IPC Segura para interagir com a tabela clientes.
  listarClientes: (params) => electron.ipcRenderer.invoke("clientes:get", params),
  addCliente: (dados) => electron.ipcRenderer.invoke("clientes:add", dados),
  buscarCliente: (cpf) => electron.ipcRenderer.invoke("clientes:pesquisar", cpf),
  buscarClientePorId: (id) => electron.ipcRenderer.invoke("clientes:buscar-por-id", id),
  // Chamada IPC Segura para interagir com a tabela usuarios.
  addUsuario: (dados) => electron.ipcRenderer.invoke("usuarios:add", dados),
  abrirUsuario: (id) => electron.ipcRenderer.send("usuarios:criar-janela-ver-usuario", id),
  salvarFotoUsuario: (dados) => electron.ipcRenderer.invoke("salvar-foto-usuario", dados),
  updateUser: (data) => electron.ipcRenderer.invoke("update-user", data),
  disableUser: (id) => electron.ipcRenderer.invoke("disable-user", id),
  enableUser: (id) => electron.ipcRenderer.invoke("enable-user", id),
  // Chamada IPC Segura para interagir com a tabela Vendas
  finalizarVendaComBaixaEstoque: (venda) => electron.ipcRenderer.invoke("vendas:finalizar-com-baixa-estoque", venda),
  criarVendaAbertaPagamento: (venda) => electron.ipcRenderer.invoke("vendas:finalizada-pendente-pagamento", venda),
  pausarVenda: (venda) => electron.ipcRenderer.invoke("vendas:pausar", venda),
  listarVendas: (params) => electron.ipcRenderer.invoke("vendas:get", params),
  cancelarVenda: (venda) => electron.ipcRenderer.invoke("vendas:cancelar", venda),
  abrirVenda: (id) => electron.ipcRenderer.send("vendas:criar-janela-ver-vendas", id),
  editSales: (id) => electron.ipcRenderer.send("sales:create-window-edit", id),
  buscarVendaPorId: (id) => electron.ipcRenderer.invoke("vendas:buscarPorId", id),
  // Chamada IPC Segura para interagir com impressoras
  print: () => electron.ipcRenderer.invoke("printer:imprimir"),
  listaImpressoras: () => electron.ipcRenderer.invoke("printer:buscar-impressoras"),
  addPrinter: (dados) => electron.ipcRenderer.invoke("printer:add-impressora", dados),
  listarPrintersCadastradas: () => electron.ipcRenderer.invoke("printer:listar-cadastradas"),
  getPrinterPadrao: () => electron.ipcRenderer.invoke("printer:get-padrao"),
  removerPrinter: (id) => electron.ipcRenderer.invoke("printer:remover", id),
  definirPrinterPadrao: (id) => electron.ipcRenderer.invoke("printer:definir-padrao", id),
  // Chamada IPC Segura para autenticação
  login: (username, password) => electron.ipcRenderer.invoke("auth:login", username, password),
  buscarUsuario: (id) => electron.ipcRenderer.invoke("auth:buscar-usuario", id),
  getUsers: (params) => electron.ipcRenderer.invoke("get-users", params),
  updateUserPassword: (id, newPassword) => electron.ipcRenderer.invoke("user:update-password", id, newPassword),
  removeUser: (id) => electron.ipcRenderer.invoke("delete-user", id),
  openCashSession: (data) => electron.ipcRenderer.invoke("open-cash-session", data),
  closeCashSession: (data) => electron.ipcRenderer.invoke("close-cash-session", data),
  getOpenCashSession: (data) => electron.ipcRenderer.invoke("get-open-cash-session", data),
  registerCashWithdrawal: (data) => electron.ipcRenderer.invoke("register-cash-withdrawal", data)
});
electron.contextBridge.exposeInMainWorld("appService", {
  quit: () => electron.ipcRenderer.invoke("app:quit"),
  quitWithConfirm: () => electron.ipcRenderer.invoke("app:quit-with-confirm"),
  logoffWithConfirm: () => electron.ipcRenderer.invoke("app:logoff-with-confirm")
});
electron.contextBridge.exposeInMainWorld("electron", {
  integrations: {
    getStatus: (integrationId) => electron.ipcRenderer.invoke("integrations:status", integrationId),
    connect: (integrationId) => electron.ipcRenderer.invoke("integrations:connect", integrationId),
    disconnect: (integrationId) => electron.ipcRenderer.invoke("integrations:disconnect", integrationId),
    // Sync completo: categorias → produtos
    syncAll: () => electron.ipcRenderer.invoke("integrations:bling:sync-all"),
    // Syncs individuais
    syncProducts: () => electron.ipcRenderer.invoke("integrations:bling:sync"),
    syncCategories: () => electron.ipcRenderer.invoke("integrations:bling:sync-categories"),
    // Estados
    getSyncStatus: () => electron.ipcRenderer.invoke("integrations:bling:sync-status"),
    getCategoriesSyncStatus: () => electron.ipcRenderer.invoke("integrations:bling:sync-status-categories"),
    // Logs
    getSyncLogs: () => electron.ipcRenderer.invoke("integrations:bling:sync-logs"),
    getCategoriesSyncLogs: () => electron.ipcRenderer.invoke("integrations:bling:sync-logs-categories"),
    // Testes
    testBling: () => electron.ipcRenderer.invoke("integrations:bling:test"),
    testCategories: () => electron.ipcRenderer.invoke("integrations:bling:test-categories"),
    testIcmpBling: () => electron.ipcRenderer.invoke("integrations:bling:test-icmp")
  },
  fiscal: {
    getConfig: () => electron.ipcRenderer.invoke("fiscal:get-runtime-config"),
    getCertificateInfo: () => electron.ipcRenderer.invoke("fiscal:get-certificate-info"),
    saveConfig: (input) => electron.ipcRenderer.invoke("fiscal:save-runtime-config", input),
    authorizeNfce: (request) => electron.ipcRenderer.invoke("fiscal:authorize-nfce", request),
    cancelNfce: (request) => electron.ipcRenderer.invoke("fiscal:cancel-nfce", request),
    consultStatus: (accessKey) => electron.ipcRenderer.invoke("fiscal:consult-status", accessKey),
    getDanfe: (documentId) => electron.ipcRenderer.invoke("fiscal:get-danfe", documentId),
    getQueueSummary: () => electron.ipcRenderer.invoke("fiscal:get-queue-summary"),
    listQueue: (limit) => electron.ipcRenderer.invoke("fiscal:list-queue", limit),
    reprocessQueueItem: (queueId) => electron.ipcRenderer.invoke("fiscal:reprocess-queue-item", queueId),
    processNextQueueItem: () => electron.ipcRenderer.invoke("fiscal:process-next-queue-item")
  }
});
