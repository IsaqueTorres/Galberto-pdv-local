import {
  CashMovementData,
  CashRestoredSession,
  CashRestoreSessionData,
  CashSessionData,
  CloseCashSessionData,
} from "../../../types/session.types";

export async function openCashSession(data: CashSessionData): Promise<CashRestoredSession> {
    console.log("Abrindo caixa com dados: ", data);
    return window.api.openCashSession(data);
}

export async function closeCashSession(data: CloseCashSessionData): Promise<void> {
    console.log("Fechando caixa com dados: ", data);
    return window.api.closeCashSession(data);
}

export async function getOpenCashSession(data: CashRestoreSessionData): Promise<CashRestoredSession | null> {
  return window.api.getOpenCashSession(data);
}

export async function registerCashWithdrawal(data: CashMovementData): Promise<CashRestoredSession> {
  return window.api.registerCashWithdrawal(data);
}
