import { FotoPerfil, Usuario } from "@/types/Usuario";
import { contextBridge, ipcRenderer } from "electron";
import { pathToFileURL } from "node:url";
import { getCurrentSession } from "./infra/session/session.store";
import {
  CashMovementData,
  CashSessionActionResult,
  CashSessionData,
  CloseCashSessionData,
  CashRestoreSessionData,
} from "@/types/session.types";

contextBridge.exposeInMainWorld("api", {

  //#region - Regiao responsavel por testar remocao, tudo que esta aqui dentro se nao fizer falta sera removido

  //#endregion

  getCurrentSession,
  searchSalesWindow: () => ipcRenderer.send("window:open:sales-search"), //VALIDADO POS MIGRACAO, PADRAO DE IPC CALL
  abrirPdvRapido: () => ipcRenderer.send("window:open:pdv"),
  openConfigWindow: () => ipcRenderer.send("window:open:config"), //VALIDADO POS MIGRACAO, PADRAO DE IPC CALL, PDV Rapido menu SHIFT + S
  openSearchProductWindow: () => ipcRenderer.send("window:open:products-search"), //VALIDADO POS MIGRACAO, PADRAO DE IPC CALL
  openExternalUrl: (url: string) => ipcRenderer.invoke("app:open-external-url", url),
  selecionarProduto: (produto: unknown) => ipcRenderer.send("pdv:selecionar-produto", produto),
  onProdutoSelecionado: (callback: (produto: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, produto: unknown) => callback(produto);
    ipcRenderer.on("pdv:produto-selecionado", listener);
    return () => ipcRenderer.removeListener("pdv:produto-selecionado", listener);
  },
  retomarVendaNoPdv: (venda: unknown) => ipcRenderer.send("pdv:retomar-venda", venda),
  onVendaRetomada: (callback: (venda: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, venda: unknown) => callback(venda);
    ipcRenderer.on("pdv:venda-retomada", listener);
    return () => ipcRenderer.removeListener("pdv:venda-retomada", listener);
  },

  fecharJanela: () => ipcRenderer.send("app:fechar-janela"),

  abrirCadastroUsuarios: () => ipcRenderer.send("window:open:create-user"),

  // Chamada IPC Segura: Abrir Janela Editar Produtos
  openEditUserWindow: (id: number) => ipcRenderer.send("window:open:edit-user", id),

  // Chamada IPC Segura: Abrir Janela Detalhes Produtos
  openProductDetails: (id: number) => ipcRenderer.send("open:product-details-window", id),

  // FIM DAS PONTES QUE INTERAGEM COM JANELAS //



  // PONTES QUE INTERAGEM COM O BANCO DE DADOS //

  // Chamada IPC Segura para interagir com a tabela produtos.
  listarProdutos: (params: any) => ipcRenderer.invoke("produtos:get", params),
  buscarProdutoPorCodigoBarras: (codigo: string) => ipcRenderer.invoke("produtos:buscar-por-codigo-de-barras", codigo),
  buscarProdutoPorNome: (termo: any) => ipcRenderer.invoke("produtos:buscar-por-nome", termo),
  getProductById: (id: number) => ipcRenderer.invoke("get-products-by-id", id), // antes buscarProdutoPorID

  // Chamada IPC Segura para interagir com estoque
  searchProductsForStockMovement: (term: string) => ipcRenderer.invoke("suggest-product-by-term", term),


  // Chamada IPC Segura para interagir com a tabela clientes.
  listarClientes: (params: any) => ipcRenderer.invoke("clientes:get", params),
  addCliente: (dados: any) => ipcRenderer.invoke("clientes:add", dados),
  buscarCliente: (cpf: any) => ipcRenderer.invoke("clientes:pesquisar", cpf),
  buscarClientePorId: (id: number) => ipcRenderer.invoke('clientes:buscar-por-id', id),


  // Chamada IPC Segura para interagir com a tabela usuarios.
  addUsuario: (dados: any) => ipcRenderer.invoke("usuarios:add", dados),
  abrirUsuario: (id: number) => ipcRenderer.send("usuarios:criar-janela-ver-usuario", id),
  salvarFotoUsuario: (dados: FotoPerfil) => ipcRenderer.invoke("salvar-foto-usuario", dados),
  getFileUrl: (filePath: string) => pathToFileURL(filePath).toString(),
  updateUser: (data: Usuario) => ipcRenderer.invoke("update-user", data),
  disableUser: (id: number) => ipcRenderer.invoke("disable-user", id),
  enableUser: (id: number) => ipcRenderer.invoke("enable-user", id),
  // Chamada IPC Segura para interagir com a tabela Vendas
  finalizarVendaComBaixaEstoque: (venda: any) => ipcRenderer.invoke('vendas:finalizar-com-baixa-estoque', venda),
  criarVendaAbertaPagamento: (venda: any) => ipcRenderer.invoke('vendas:finalizada-pendente-pagamento', venda),
  pausarVenda: (venda: any) => ipcRenderer.invoke('vendas:pausar', venda),
  listarVendas: (params: any) => ipcRenderer.invoke("vendas:get", params),
  cancelarVenda: (venda: any) => ipcRenderer.invoke("vendas:cancelar", venda),
  abrirVenda: (id: number) => ipcRenderer.send("vendas:criar-janela-ver-vendas", id),
  editSales: (id: number) => ipcRenderer.send("sales:create-window-edit", id),
  buscarVendaPorId: (id: number) => ipcRenderer.invoke('vendas:buscarPorId', id),


  // Chamada IPC Segura para interagir com impressoras
  print: () => ipcRenderer.invoke("printer:imprimir"),
  listaImpressoras: () => ipcRenderer.invoke("printer:buscar-impressoras"),
  addPrinter: (dados: any) => ipcRenderer.invoke("printer:add-impressora", dados),
  listarPrintersCadastradas: () => ipcRenderer.invoke("printer:listar-cadastradas"),
  getPrinterPadrao: () => ipcRenderer.invoke("printer:get-padrao"),
  removerPrinter: (id: number) => ipcRenderer.invoke("printer:remover", id),
  definirPrinterPadrao: (id: number) => ipcRenderer.invoke("printer:definir-padrao", id),
  atualizarLayoutPrinter: (id: number, dados: unknown) => ipcRenderer.invoke("printer:atualizar-layout", id, dados),
  atualizarPersonalizacaoPrinter: (id: number, receiptSettingsJson: string) => ipcRenderer.invoke("printer:atualizar-personalizacao", id, receiptSettingsJson),
  testPrint: (printerId: number) => ipcRenderer.invoke("printer:test-print", printerId),
  reprintSaleReceipt: (saleId: number) => ipcRenderer.invoke("printer:reprint-sale-receipt", saleId),

  // Chamada IPC Segura para autenticação
  login: (username: string, password: string) => ipcRenderer.invoke("auth:login", username, password),
  buscarUsuario: (id: number) => ipcRenderer.invoke("auth:buscar-usuario", id),
  getUsers: (params: any) => ipcRenderer.invoke("get-users", params),
  updateUserPassword: (id: number, newPassword: string) => ipcRenderer.invoke("user:update-password", id, newPassword),
  removeUser: (id: number) => ipcRenderer.invoke("delete-user", id),


  openCashSession: (data: CashSessionData): Promise<CashSessionActionResult> => ipcRenderer.invoke('open-cash-session', data),
  closeCashSession: (data: CloseCashSessionData): Promise<CashSessionActionResult> => ipcRenderer.invoke('close-cash-session', data),
  getOpenCashSession: (data: CashRestoreSessionData) => ipcRenderer.invoke('get-open-cash-session', data),
  registerCashWithdrawal: (data: CashMovementData) => ipcRenderer.invoke('register-cash-withdrawal', data),

});


contextBridge.exposeInMainWorld('appService', {
  quit: () => ipcRenderer.invoke('app:quit'),
  quitWithConfirm: (): Promise<boolean> => ipcRenderer.invoke("app:quit-with-confirm"),
  logoffWithConfirm: (): Promise<boolean> => ipcRenderer.invoke("app:logoff-with-confirm"),
});


contextBridge.exposeInMainWorld('electron', {
  integrations: {
    getStatus: (integrationId: string) => ipcRenderer.invoke('integrations:status', integrationId),
    connect: (integrationId: string) => ipcRenderer.invoke('integrations:connect', integrationId),
    disconnect: (integrationId: string) => ipcRenderer.invoke('integrations:disconnect', integrationId),
    // Sync completo: categorias → produtos
    syncAll: () => ipcRenderer.invoke('integrations:bling:sync-all'),
    // Syncs individuais
    syncProducts: () => ipcRenderer.invoke('integrations:bling:sync'),
    syncCategories: () => ipcRenderer.invoke('integrations:bling:sync-categories'),
    // Estados
    getSyncStatus: () => ipcRenderer.invoke('integrations:bling:sync-status'),
    getCategoriesSyncStatus: () => ipcRenderer.invoke('integrations:bling:sync-status-categories'),
    // Logs
    getSyncLogs: () => ipcRenderer.invoke('integrations:bling:sync-logs'),
    getCategoriesSyncLogs: () => ipcRenderer.invoke('integrations:bling:sync-logs-categories'),
    // Testes
    testBling: () => ipcRenderer.invoke('integrations:bling:test'),
    testCategories: () => ipcRenderer.invoke('integrations:bling:test-categories'),
    testIcmpBling: () => ipcRenderer.invoke('integrations:bling:test-icmp'),
  },
  fiscal: {
    getConfig: () => ipcRenderer.invoke('fiscal:get-runtime-config'),
    getCertificateInfo: () => ipcRenderer.invoke('fiscal:get-certificate-info'),
    saveConfig: (input: unknown) => ipcRenderer.invoke('fiscal:save-runtime-config', input),
    authorizeNfce: (request: unknown) => ipcRenderer.invoke('fiscal:authorize-nfce', request),
    cancelNfce: (request: unknown) => ipcRenderer.invoke('fiscal:cancel-nfce', request),
    consultStatus: (accessKey: string) => ipcRenderer.invoke('fiscal:consult-status', accessKey),
    getDanfe: (documentId: number) => ipcRenderer.invoke('fiscal:get-danfe', documentId),
    getQueueSummary: () => ipcRenderer.invoke('fiscal:get-queue-summary'),
    listQueue: (limit?: number) => ipcRenderer.invoke('fiscal:list-queue', limit),
    reprocessQueueItem: (queueId: string) => ipcRenderer.invoke('fiscal:reprocess-queue-item', queueId),
    processNextQueueItem: () => ipcRenderer.invoke('fiscal:process-next-queue-item'),
  },
});
