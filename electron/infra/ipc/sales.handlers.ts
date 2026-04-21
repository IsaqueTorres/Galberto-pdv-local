import { ipcMain } from "electron"
import { 
  finalizarVendaComBaixaEstoque, listarVendas, cancelarVenda, buscarVendaPorId, inserirVenda, salvarVendaPendente
} from "../database/db";
import { issueFiscalDocumentForSaleService } from "../../application/fiscal/services/IssueFiscalDocumentForSaleService";
import { printDocumentService } from "../../application/printing";
import { currentUserHasPermission } from "../security/permission.guard";

function payloadHasDiscount(vendaPayload: any) {
  const totalDiscount = Number(vendaPayload?.valorDesconto ?? vendaPayload?.valor_desconto ?? 0);
  const itemDiscount = Array.isArray(vendaPayload?.itens)
    ? vendaPayload.itens.some((item: any) => Number(item?.valor_desconto ?? item?.valorDesconto ?? 0) > 0)
    : false;

  return totalDiscount > 0 || itemDiscount;
}

function assertDiscountPermission(vendaPayload: any) {
  if (payloadHasDiscount(vendaPayload) && !currentUserHasPermission("discounts:apply")) {
    throw new Error("Somente gerente ou administrador pode conceder descontos.");
  }
}


export default function registerSalesHandlers() {

  ipcMain.handle('vendas:finalizar-com-baixa-estoque', async (_, vendaPayload) => {
    assertDiscountPermission(vendaPayload);
    finalizarVendaComBaixaEstoque(vendaPayload)

    const vendaId = typeof vendaPayload === 'number' ? vendaPayload : vendaPayload.vendaId;
    const fiscalResult = await issueFiscalDocumentForSaleService.execute(vendaId);
    let printResult;

    try {
      printResult = await printDocumentService.printSaleReceipt(vendaId, {
        triggerSource: "AUTO",
        fiscal: fiscalResult.fiscal ?? null,
      });
    } catch (error) {
      printResult = {
        success: false,
        status: 'FAILED',
        documentId: 0,
        printerId: null,
        printerName: null,
        message: error instanceof Error ? error.message : 'Falha ao imprimir o cupom da venda.',
        jobId: 0,
        reprint: false,
      };
    }

    return {
      success: true,
      vendaId,
      fiscal: fiscalResult.fiscal,
      print: printResult,
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
    assertDiscountPermission(venda);
    const vendaId = salvarVendaPendente(venda, 'ABERTA_PAGAMENTO', venda?.id ?? null)
    return vendaId
  })

  ipcMain.handle('vendas:pausar', (_, venda) => {
    assertDiscountPermission(venda);
    const vendaId = salvarVendaPendente(venda, 'PAUSADA', venda?.id ?? null)
    return vendaId
  })
  
}
