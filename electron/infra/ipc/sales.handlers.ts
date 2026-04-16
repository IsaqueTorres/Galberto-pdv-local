import { ipcMain } from "electron"
import { 
  finalizarVendaComBaixaEstoque, listarVendas, cancelarVenda, buscarVendaPorId, inserirVenda, salvarVendaPendente
} from "../database/db";
import { issueFiscalDocumentForSaleService } from "../../application/fiscal/services/IssueFiscalDocumentForSaleService";


export default function registerSalesHandlers() {

  ipcMain.handle('vendas:finalizar-com-baixa-estoque', async (_, vendaPayload) => {
    finalizarVendaComBaixaEstoque(vendaPayload)

    const vendaId = typeof vendaPayload === 'number' ? vendaPayload : vendaPayload.vendaId;
    const fiscalResult = await issueFiscalDocumentForSaleService.execute(vendaId);

    return {
      success: true,
      vendaId,
      fiscal: fiscalResult.fiscal,
    };
  })

  //Escuta o render invocar Listar Vendas na pagina Vendas
  ipcMain.handle("vendas:get", (_, params: any) => {
    return listarVendas(params);
  });

  // Escuta o render invokar Cancelar Venda na pagina PDV Rápido.
  ipcMain.handle("vendas:cancelar", (_, venda) => {
    return cancelarVenda(venda)
  })

  // Escuta o render chamando "buscar venda por id" na pagina Vendas
  ipcMain.handle('vendas:buscarPorId', (_, vendaId: number) => {
    return buscarVendaPorId(vendaId)
  })

  ipcMain.handle('vendas:finalizada-pendente-pagamento', (_, venda) => {
    const vendaId = salvarVendaPendente(venda, 'ABERTA_PAGAMENTO', venda?.id ?? null)
    return vendaId
  })

  ipcMain.handle('vendas:pausar', (_, venda) => {
    const vendaId = salvarVendaPendente(venda, 'PAUSADA', venda?.id ?? null)
    return vendaId
  })
  
}
