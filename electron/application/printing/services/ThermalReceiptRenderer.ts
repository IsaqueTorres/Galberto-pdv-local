import type { CashReceiptData, PrintedDocumentRecord, PrinterRecord, ReceiptCustomizationSettings, SaleReceiptData } from "../types/printing.types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pt-BR");
}

function getReceiptSettings(printer?: PrinterRecord | null): ReceiptCustomizationSettings {
  if (!printer?.receipt_settings_json) return {};

  try {
    return JSON.parse(printer.receipt_settings_json) as ReceiptCustomizationSettings;
  } catch {
    return {};
  }
}

function isCustomMode(settings: ReceiptCustomizationSettings) {
  return settings.templateMode === "custom";
}

type ReceiptLayout = {
  paperWidthMm: number;
  contentWidthMm: number;
  baseFontSizePx: number;
  lineHeight: number;
};

function resolveLayout(printer?: PrinterRecord | null): ReceiptLayout {
  return {
    paperWidthMm: Number(printer?.paper_width_mm ?? 80),
    contentWidthMm: Number(printer?.content_width_mm ?? 76),
    baseFontSizePx: Number(printer?.base_font_size_px ?? 14),
    lineHeight: Number(printer?.line_height ?? 1.55),
  };
}

function renderDocumentShell(title: string, body: string, printer?: PrinterRecord | null) {
  const layout = resolveLayout(printer);
  const sidePadding = Math.max((layout.paperWidthMm - layout.contentWidthMm) / 2, 0);
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page {
        size: ${layout.paperWidthMm}mm auto;
        margin: 0;
      }

      html, body {
        margin: 0;
        padding: 0;
        width: ${layout.paperWidthMm}mm;
        font-family: "Courier New", monospace;
        color: #000000;
        background: #ffffff;
        font-size: ${layout.baseFontSizePx}px;
        line-height: ${layout.lineHeight};
        font-weight: 600;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        text-rendering: geometricPrecision;
      }

      body {
        box-sizing: border-box;
        padding: 1.2mm ${sidePadding}mm 0.8mm;
      }

      .receipt {
        box-sizing: border-box;
        width: ${layout.contentWidthMm}mm;
        padding-bottom: 0;
      }

      .center { text-align: center; }
      .muted { color: #111111; opacity: 0.9; }
      .strong { font-weight: 800; }
      .section { margin-top: 6px; }
      .separator {
        border-top: 1px dashed #000000;
        margin: 5px 0;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin: 0;
      }
      .row .label {
        color: #000000;
      }
      .row .value {
        text-align: right;
        font-weight: 800;
      }
      .item {
        margin-bottom: 5px;
      }
      .item-name {
        font-weight: 800;
      }
      .item-meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }
      .mono {
        word-break: break-all;
      }
      .footer-note {
        margin-top: 6px;
        font-size: ${Math.max(layout.baseFontSizePx - 2, 10)}px;
        color: #000000;
      }
    </style>
  </head>
  <body><div class="receipt">${body}</div></body>
</html>`;
}

export class ThermalReceiptRenderer {
  renderSaleReceipt(data: SaleReceiptData, printer?: PrinterRecord | null) {
    const settings = getReceiptSettings(printer);
    const useCustomMode = isCustomMode(settings);
    const itemsHtml = data.items.map((item) => `
      <div class="item">
        <div class="item-name">${escapeHtml(item.description)}</div>
        <div class="item-meta">
          <span>${item.quantity.toFixed(3).replace(".", ",")} x ${formatMoney(item.unitPrice)}</span>
          <span class="strong">${formatMoney(item.totalAmount)}</span>
        </div>
        ${item.discountAmount > 0 ? `<div class="muted">Desconto: ${formatMoney(item.discountAmount)}</div>` : ""}
        ${(useCustomMode ? settings.showItemCodes !== false : true) && item.code ? `<div class="muted">Cod.: ${escapeHtml(item.code)}</div>` : ""}
      </div>
    `).join("");

    const paymentsHtml = data.payments.map((payment) => `
      <div class="row">
        <span class="label">${escapeHtml(payment.paymentLabel)}</span>
        <span class="value">${formatMoney(payment.amount)}</span>
      </div>
    `).join("");

    const body = `
      <div class="center">
        ${useCustomMode && settings.showLogo && settings.logoPath ? `<div class="footer-note">LOGO: ${escapeHtml(settings.logoPath)}</div>` : ""}
        <div class="strong">${escapeHtml(useCustomMode ? settings.headerTitle?.trim() || data.storeName : data.storeName)}</div>
        ${(useCustomMode ? settings.showLegalName !== false : true) && data.storeLegalName && data.storeLegalName !== data.storeName ? `<div>${escapeHtml(data.storeLegalName)}</div>` : ""}
        ${(useCustomMode ? settings.showDocument !== false : true) && data.storeDocument ? `<div>CNPJ: ${escapeHtml(data.storeDocument)}</div>` : ""}
        ${(useCustomMode ? settings.showAddress !== false : true) && data.storeAddress ? `<div>${escapeHtml(data.storeAddress)}</div>` : ""}
        ${useCustomMode && settings.headerMessage ? `<div class="footer-note">${escapeHtml(settings.headerMessage)}</div>` : ""}
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Venda</span><span class="value">#${data.saleId}</span></div>
      <div class="row"><span class="label">Data/Hora</span><span class="value">${escapeHtml(formatDateTime(data.movedAt ?? data.emittedAt))}</span></div>
      ${(useCustomMode ? settings.showOperator !== false : true) ? `<div class="row"><span class="label">Operador</span><span class="value">${escapeHtml(data.operatorName ?? "Não informado")}</span></div>` : ""}
      <div class="row"><span class="label">PDV</span><span class="value">${escapeHtml(data.pdvId ?? "—")}</span></div>
      ${(useCustomMode ? settings.showCustomer !== false : true) ? `<div class="row"><span class="label">Cliente</span><span class="value">${escapeHtml(data.customerName ?? "Consumidor final")}</span></div>` : ""}
      ${(useCustomMode ? settings.showCustomer !== false : true) && data.customerDocument ? `<div class="row"><span class="label">Documento</span><span class="value">${escapeHtml(data.customerDocument)}</span></div>` : ""}

      <div class="separator"></div>
      ${itemsHtml}
      <div class="separator"></div>

      <div class="row"><span class="label">Subtotal</span><span class="value">${formatMoney(data.subtotalAmount)}</span></div>
      ${data.discountAmount > 0 ? `<div class="row"><span class="label">Descontos</span><span class="value">${formatMoney(data.discountAmount)}</span></div>` : ""}
      <div class="row"><span class="label strong">TOTAL</span><span class="value">${formatMoney(data.totalAmount)}</span></div>
      ${data.changeAmount > 0 ? `<div class="row"><span class="label">Troco</span><span class="value">${formatMoney(data.changeAmount)}</span></div>` : ""}

      ${(useCustomMode ? settings.showPaymentBreakdown !== false : true) ? `
        <div class="separator"></div>
        <div class="strong">Pagamentos</div>
        ${paymentsHtml}
      ` : ""}

      ${(useCustomMode ? settings.showFiscalSection !== false : true) && data.fiscal ? `
        <div class="separator"></div>
        <div class="strong">Situação fiscal</div>
        <div class="row"><span class="label">Status</span><span class="value">${escapeHtml(data.fiscal.status ?? "—")}</span></div>
        ${data.fiscal.protocol ? `<div class="row"><span class="label">Protocolo</span><span class="value">${escapeHtml(data.fiscal.protocol)}</span></div>` : ""}
        ${data.fiscal.accessKey ? `<div class="footer-note mono">Chave: ${escapeHtml(data.fiscal.accessKey)}</div>` : ""}
      ` : ""}

      ${data.notes ? `<div class="footer-note">Obs.: ${escapeHtml(data.notes)}</div>` : ""}
      ${useCustomMode && settings.footerMessage ? `<div class="footer-note">${escapeHtml(settings.footerMessage)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        ${escapeHtml(useCustomMode ? settings.thankYouMessage?.trim() || "Documento impresso pelo Galberto PDV" : "Documento impresso pelo Galberto PDV")}<br />
        Guarde este comprovante para conferência.
      </div>
    `;

    return renderDocumentShell(`Cupom de venda #${data.saleId}`, body, printer);
  }

  renderCashReceipt(data: CashReceiptData, printer?: PrinterRecord | null) {
    const isClosing = data.documentType === "CASH_CLOSING_RECEIPT";
    const title = isClosing ? "Comprovante de Fechamento de Caixa" : "Comprovante de Abertura de Caixa";

    const body = `
      <div class="center">
        <div class="strong">${escapeHtml(title)}</div>
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Sessão</span><span class="value">#${data.cashSessionId}</span></div>
      <div class="row"><span class="label">Operador</span><span class="value">${escapeHtml(data.operatorName ?? "Não informado")}</span></div>
      <div class="row"><span class="label">PDV</span><span class="value">${escapeHtml(data.pdvId)}</span></div>
      <div class="row"><span class="label">Aberto em</span><span class="value">${escapeHtml(formatDateTime(data.openedAt))}</span></div>
      ${isClosing ? `<div class="row"><span class="label">Fechado em</span><span class="value">${escapeHtml(formatDateTime(data.closedAt))}</span></div>` : ""}

      <div class="separator"></div>

      <div class="row"><span class="label">Fundo inicial</span><span class="value">${formatMoney(data.openingAmount)}</span></div>
      ${isClosing ? `
        <div class="row"><span class="label">Vendas em dinheiro</span><span class="value">${formatMoney(data.totalSalesCash)}</span></div>
        <div class="row"><span class="label">Sangrias</span><span class="value">${formatMoney(data.totalWithdrawals)}</span></div>
        <div class="row"><span class="label">Valor esperado</span><span class="value">${formatMoney(data.expectedAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Valor contado</span><span class="value">${formatMoney(data.closingAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Diferença</span><span class="value">${formatMoney(data.differenceAmount ?? 0)}</span></div>
      ` : ""}

      ${data.openingNotes ? `<div class="footer-note">Obs. abertura: ${escapeHtml(data.openingNotes)}</div>` : ""}
      ${isClosing && data.closingNotes ? `<div class="footer-note">Obs. fechamento: ${escapeHtml(data.closingNotes)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        Documento impresso pelo Galberto PDV<br />
        Conferência operacional de caixa.
      </div>
    `;

    return renderDocumentShell(title, body, printer);
  }

  renderFromStoredDocument(document: PrintedDocumentRecord) {
    return document.contentHtml;
  }
}

export const thermalReceiptRenderer = new ThermalReceiptRenderer();
