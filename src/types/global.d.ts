import { ProductFormData, ProductRecord, insertStockMovement, ProdutoInput, Produto, ProdutoCarrinho } from "../pages/products/types/products.types";
import {
    CashMovementData,
    CashSessionActionResult,
    CashRestoredSession,
    CashRestoreSessionData,
    CashSessionData,
    CloseCashSessionData
} from "./session.types";
import { Usuario, FotoPerfil } from "./Usuario";


export { };


declare global {

    interface Window {
        appService: {
            quitWithConfirm: () => Promise<bollean>
            logoffWithConfirm: () => Promise<bollean>
            quit: () => Promise<void>
        };

        api: {
            // funções expostas pelo preload aqui.

            // PAGINA PDV RAPIDO
            finalizarVendaComBaixaEstoque: (venda: any) => Promise<any>
            criarVendaAbertaPagamento: (venda: any) => Promise<any>
            pausarVenda: (venda: any) => Promise<any>
            cancelarVenda: (venda: any) => Promise<any>;
            abrirVenda: (id: number) => Promise<number>;
            editSales: (id: number) => Promise<number>;
            buscarVendaPorId: (id: number) => Promise<any>;
            openCashSession: (data: CashSessionData) => Promise<CashSessionActionResult>;
            getOpenCashSession: (data: CashRestoreSessionData) => Promise<CashRestoredSession | null>;
            closeCashSession: (data: CloseCashSessionData) => Promise<CashSessionActionResult>;
            registerCashWithdrawal: (data: CashMovementData) => Promise<CashRestoredSession>;
            preVendas: () => void;
            // PAGINA VENDAS

            listarVendas: (params: {
                venda_id?: string
                produto_id?: number
                nome_produto?: string
                preco_unitario?: number
                quantidade?: number
                data?: date
                subtotal?: number
                status?: string
                page?: number
                limit?: number
            }) => Promise<{
                data: Venda[]
                page: number
                limit: number
                total: number
            }>

            //PAGINA CLIENTES
            abrirPdvRapido: () => void;
            openCustomerRegistration
            CadastrarNovoCliente?: () => void;
            PesquisarCliente: () => void;
            getClientes: () => Promise<any[]>;
            abrirCliente: (id: number) => Promise<number>;
            buscarClientePorId: (id: number) => Promise<number>;
            addCliente: (dados: any) => Promise<number>;
            buscarCliente: (cpf: any) => Promise<any>;
            listarClientes: (params: {
                nome?: string
                cnpj?: string
                cpf?: string
                page?: number
                limit?: number
            }) => Promise<{
                data: Cliente[]
                page: number
                limit: number
                total: number
            }>

            // PAGINA PRODUTOS
            openAddProductWindow: () => Promise<void>;
            updateProduct: (dataToSave: any) => Promise<any>; //VALIDADO
            addProduct: (formData: ProductFormData) => Promise<any>; //VALIDADO
            criarJanelaBuscarProduto: () => Promise<any>
            adicionarNovoProduto?: () => void;
            openSearchProductWindow: () => Promise<any>
            searchSalesWindow: () => void; // VALIDADO POS SEPARACAO
            selecionarProduto: (produto: unknown) => void
            onProdutoSelecionado: (callback: (produto: unknown) => void) => () => void
            retomarVendaNoPdv: (venda: unknown) => void
            onVendaRetomada: (callback: (venda: unknown) => void) => () => void
            removerProdutos?: () => void;
            getProductById: (id: number) => Promise<ProductRecord | null>;
            buscarProdutoPorNome: (termo: string) => Promise<any>;
            buscarProdutoPorCodigoBarras: (termo: string) => Promise<any>;
            definirAlertasProduto?: () => void;
            relatoriosDeProduto?: () => void;
            alterarProduto: (dados: any) => Promise<number>;
            openProductDetails: (id: number) => Promise<number>;

            movimentarProduto?: () => void;
            alterarProdutos?: () => void;
            openEditProductWindow: (id: number) => void;
            delProduto: (dados: {
                id?: number
                codigo_barras?: string
            }) => Promise<{
                success: boolean
                error?: string
            }>;

            listarProdutos: (params: {
                nome?: string
                ativo?: number
                codigo?: string
                page?: number
                limit?: number
            }) => Promise<{
                data: Produto[]
                page: number
                limit: number
                total: number
            }>

            listarUsuarios: (params: UsuarioFiltro) => Promise<UsuarioListagem>
            abrirCadastroUsuarios: () => void;
            // PAGINA AUTH
            removeUser: (id: number) => Promise<number>;
            updateUserPassword: (id: number, newPassword: string) => Promise<any>;
            addUsuario
            listarUsuarios
            buscarUsuario
            login
            getUsers
            openEditUserWindow: (id: number) => Promise<Number>;
            updateUser: (data: Usuario) => Promise<Usuario>;
            enableUser: (id: number) => Promise<number>;
            disableUser: (id: number) => Promise<number>;
            onRefreshUsers: (callback: () => void) => void;

            //PAGINA CONFIG 
            listaImpressoras: () => any;
            addPrinter: (dados: any) => Promise<number>;
            definirPrinterPadrao: (id: any) => Promise<number>;
            removerPrinter: (id: any) => Promise<number>;
            getPrinterPadrao: () => any;
            listarPrintersCadastradas: () => any;
            atualizarLayoutPrinter: (id: number, dados: any) => Promise<any>;
            atualizarPersonalizacaoPrinter: (id: number, receiptSettingsJson: string) => Promise<any>;
            testPrint: (printerId: number) => Promise<any>;
            reprintSaleReceipt: (saleId: number) => Promise<any>;
            abrirUsuario: (id: number) => Promise<number>;
            salvarFotoUsuario: (dados: FotoPerfil) => Promise<string>
            getFileUrl: (filePath: string) => string;

            // ESTOQUE

            searchProductsForStockMovement: (term: string) => Promise<Product>; // validado
            insertProductIntoStock: (FormData: InsertStockMovementParams) => Promise<StockMovementResult>; // validado


            // SESSOES
            getCurrentSession;



            // CONFIG 
            openConfigWindow: () => void;
            openExternalUrl: (url: string) => Promise<boolean>;

            // Adicione mais funções expostas pelo preload aqui

            fecharJanela: () => void;
        };

        electron: {
            integrations: {
                getStatus: (integrationId: string) => Promise<{
                    connected: boolean;
                    expiresAt?: string | null;
                }>;
                connect: (integrationId: string) => Promise<{
                    success: boolean;
                    message: string;
                }>;
                disconnect: (integrationId: string) => Promise<{
                    success: boolean;
                    message: string;
                }>;
                // Sync completo: categorias → produtos
                syncAll: () => Promise<{
                    success: boolean;
                    categories?: {
                        mode: 'initial' | 'incremental';
                        processed: number;
                        created: number;
                        updated: number;
                        failed: number;
                    };
                    products?: {
                        mode: 'initial' | 'incremental';
                        processed: number;
                        created: number;
                        updated: number;
                        failed: number;
                    };
                    message?: string;
                }>;
                // Syncs individuais
                syncProducts: () => Promise<{
                    success: boolean;
                    mode?: 'initial' | 'incremental';
                    processed?: number;
                    created?: number;
                    updated?: number;
                    failed?: number;
                    message?: string;
                }>;
                syncCategories: () => Promise<{
                    success: boolean;
                    mode?: 'initial' | 'incremental';
                    processed?: number;
                    created?: number;
                    updated?: number;
                    failed?: number;
                    message?: string;
                }>;
                // Estados de sync
                getSyncStatus: () => Promise<{
                    status: 'idle' | 'running' | 'success' | 'error';
                    lastSyncAt?: string | null;
                    lastSuccessAt?: string | null;
                    errorMessage?: string | null;
                } | null>;
                getCategoriesSyncStatus: () => Promise<{
                    status: 'idle' | 'running' | 'success' | 'error';
                    lastSyncAt?: string | null;
                    lastSuccessAt?: string | null;
                    errorMessage?: string | null;
                } | null>;
                // Logs de sync
                getSyncLogs: () => Promise<Array<{
                    id: string;
                    resource: string;
                    mode: 'initial' | 'incremental';
                    status: 'running' | 'success' | 'failed';
                    startedAt: string;
                    finishedAt?: string | null;
                    itemsProcessed: number;
                    itemsCreated: number;
                    itemsUpdated: number;
                    itemsFailed: number;
                    errorMessage?: string | null;
                }>>;
                getCategoriesSyncLogs: () => Promise<Array<{
                    id: string;
                    resource: string;
                    mode: 'initial' | 'incremental';
                    status: 'running' | 'success' | 'failed';
                    startedAt: string;
                    finishedAt?: string | null;
                    itemsProcessed: number;
                    itemsCreated: number;
                    itemsUpdated: number;
                    itemsFailed: number;
                    errorMessage?: string | null;
                }>>;
                // Testes
                testBling: () => Promise<unknown>;
                testIcmpBling: () => Promise<unknown>;
            };
        };
    }
}
