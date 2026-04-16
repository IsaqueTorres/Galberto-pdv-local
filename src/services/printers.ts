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
