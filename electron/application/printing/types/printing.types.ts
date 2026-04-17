export type PrintableDocumentType =
  | "SALE_RECEIPT"
  | "CASH_OPENING_RECEIPT"
  | "CASH_CLOSING_RECEIPT";

export type PrintableReferenceType = "SALE" | "CASH_SESSION";

export type PrintDocumentStatus = "PENDING" | "PRINTED" | "FAILED";

export type PrintJobStatus = "SUCCESS" | "FAILED" | "SKIPPED";

export type PrintTriggerSource = "AUTO" | "MANUAL";

export interface ReceiptCustomizationSettings {
  templateMode?: "default" | "custom";
  headerTitle?: string | null;
  headerMessage?: string | null;
  footerMessage?: string | null;
  thankYouMessage?: string | null;
  logoPath?: string | null;
  showLogo?: boolean;
  showLegalName?: boolean;
  showDocument?: boolean;
  showAddress?: boolean;
  showOperator?: boolean;
  showCustomer?: boolean;
  showItemCodes?: boolean;
  showPaymentBreakdown?: boolean;
  showFiscalSection?: boolean;
}

export interface PrinterRecord {
  id: number;
  name: string;
  display_name: string | null;
  brand: string | null;
  model: string | null;
  connection_type: string | null;
  driver_name: string | null;
  driver_version: string | null;
  photo_path: string | null;
  notes: string | null;
  is_default: number;
  installed_at: string | null;
  paper_width_mm: number;
  content_width_mm: number;
  base_font_size_px: number;
  line_height: number;
  receipt_settings_json?: string | null;
}

export interface PrintedDocumentRecord {
  id: number;
  documentType: PrintableDocumentType;
  referenceType: PrintableReferenceType;
  referenceId: number;
  saleId: number | null;
  cashSessionId: number | null;
  printerId: number | null;
  title: string;
  status: PrintDocumentStatus;
  templateVersion: string;
  payloadJson: string;
  contentHtml: string;
  printCount: number;
  lastPrintedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrintJobRecord {
  id: number;
  printedDocumentId: number;
  printerId: number | null;
  triggerSource: PrintTriggerSource;
  status: PrintJobStatus;
  errorMessage: string | null;
  copies: number;
  attemptedAt: string;
  completedAt: string | null;
}

export interface PrintAttemptResult {
  success: boolean;
  status: PrintJobStatus;
  documentId: number;
  printerId: number | null;
  printerName: string | null;
  message: string;
  jobId: number;
  reprint: boolean;
}

export interface FiscalSnapshot {
  status?: string | null;
  accessKey?: string | null;
  protocol?: string | null;
  statusMessage?: string | null;
  authorizationDatetime?: string | null;
  qrCodeUrl?: string | null;
}

export interface SaleReceiptItem {
  productId: string;
  code: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface SaleReceiptPayment {
  paymentCode: string;
  paymentLabel: string;
  amount: number;
  receivedAmount: number;
  changeAmount: number;
}

export interface SaleReceiptData {
  saleId: number;
  emittedAt: string;
  movedAt: string | null;
  status: string;
  storeName: string;
  storeLegalName: string | null;
  storeDocument: string | null;
  storeAddress: string | null;
  operatorName: string | null;
  operatorId: string | null;
  pdvId: string | null;
  customerName: string | null;
  customerDocument: string | null;
  items: SaleReceiptItem[];
  payments: SaleReceiptPayment[];
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  changeAmount: number;
  notes: string | null;
  fiscal: FiscalSnapshot | null;
}

export interface CashReceiptData {
  cashSessionId: number;
  documentType: Extract<PrintableDocumentType, "CASH_OPENING_RECEIPT" | "CASH_CLOSING_RECEIPT">;
  operatorName: string | null;
  operatorId: string | null;
  pdvId: string;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  differenceAmount: number | null;
  totalSalesCash: number;
  totalWithdrawals: number;
  openedAt: string;
  closedAt: string | null;
  openingNotes: string | null;
  closingNotes: string | null;
}

export interface PrintDocumentDraft {
  documentType: PrintableDocumentType;
  referenceType: PrintableReferenceType;
  referenceId: number;
  saleId?: number | null;
  cashSessionId?: number | null;
  printerId?: number | null;
  title: string;
  status: PrintDocumentStatus;
  templateVersion: string;
  payloadJson: string;
  contentHtml: string;
  lastError?: string | null;
}
