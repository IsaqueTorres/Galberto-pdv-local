export interface AuthenticatedUser {
  id: string;
  nome: string;
  login: string;
  role?: string;
}

export interface AppSession {
  sessionId: string;
  user: AuthenticatedUser | null;
  openedAt: string;
  cashRegisterId?: string | null;
}

export interface CashSessionData {
  operator_id: string;
  pdv_id: string;
  opening_cash_amount: number;
}

export interface CashMovementData {
  cash_session_id: number;
  operator_id: string;
  pdv_id: string;
  movement_type: "SANGRIA";
  amount: number;
  reason?: string;
}

export interface CloseCashSessionData {
  operator_id: string;
  pdv_id: string;
  closing_cash_amount: number;
  opening_cash_amount: number;
  expected_cash_amount: number;
  difference: number;
  opened_at: string;
  closed_at: string;
}

export interface CashRestoreSessionData {
  operator_id: string;
  pdv_id: string;
}

export interface CashRestoredSession {
  operator_id: string;
  pdv_id: string;
  opening_cash_amount: number;
  id: number | null;
  opened_at: string | null;
  total_sangrias: number;
  total_vendas_dinheiro: number;
  expected_cash_amount: number;
}


