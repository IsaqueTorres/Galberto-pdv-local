export async function buscarImpressoras() {
  return await window.api.listaImpressoras()
}

export async function addPrinter(dados: any) {
  return await window.api.addPrinter(dados)
}

export async function listarPrintersCadastradas() {
  return await window.api.listarPrintersCadastradas()
}

export async function getPrinterPadrao() {
  return await window.api.getPrinterPadrao()
}

export async function removerPrinter(id: number) {
  return await window.api.removerPrinter(id)
}

export async function definirPrinterPadrao(id: number) {
  return await window.api.definirPrinterPadrao(id)
}

export async function atualizarLayoutPrinter(id: number, dados: {
  paper_width_mm: number;
  content_width_mm: number;
  base_font_size_px: number;
  line_height: number;
}) {
  return await window.api.atualizarLayoutPrinter(id, dados)
}

export async function atualizarPersonalizacaoPrinter(id: number, receiptSettingsJson: string) {
  return await window.api.atualizarPersonalizacaoPrinter(id, receiptSettingsJson)
}

export async function testPrint(printerId: number) {
  return await window.api.testPrint(printerId)
}

export async function reprintSaleReceipt(saleId: number) {
  return await window.api.reprintSaleReceipt(saleId)
}
