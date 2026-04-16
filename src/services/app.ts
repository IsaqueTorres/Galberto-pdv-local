export function fecharJanela() {
  return window.api.fecharJanela();
}

export async function quitWithConfirm(): Promise<boolean> {
  return window.appService.quitWithConfirm();
}

export async function logoffWithConfirm(): Promise<boolean> {
  return window.appService.logoffWithConfirm();
}

export async function quit() {
  return window.appService.quit();
}

