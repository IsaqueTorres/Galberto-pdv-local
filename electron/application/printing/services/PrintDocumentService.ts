import { printDocumentRepository } from "../repositories/PrintDocumentRepository";
import { electronReceiptPrinter } from "./ElectronReceiptPrinter";
import { thermalReceiptRenderer } from "./ThermalReceiptRenderer";
import type {
  CashReceiptData,
  FiscalSnapshot,
  PrintAttemptResult,
  PrintableDocumentType,
  PrintTriggerSource,
  PrintedDocumentRecord,
  SaleReceiptData,
} from "../types/printing.types";

type SalePrintOptions = {
  triggerSource: PrintTriggerSource;
  fiscal?: FiscalSnapshot | null;
};

function createMessage(documentType: PrintableDocumentType, action: "printed" | "skipped" | "failed", printerName?: string | null) {
  const labels: Record<PrintableDocumentType, string> = {
    SALE_RECEIPT: "cupom da venda",
    CASH_OPENING_RECEIPT: "comprovante de abertura de caixa",
    CASH_CLOSING_RECEIPT: "comprovante de fechamento de caixa",
  };

  const label = labels[documentType];

  if (action === "printed") {
    return `${label} impresso${printerName ? ` em ${printerName}` : ""}.`;
  }

  if (action === "skipped") {
    return `Nenhuma impressora padrão configurada para imprimir o ${label}.`;
  }

  return `Falha ao imprimir o ${label}.`;
}

export class PrintDocumentService {
  async printTestReceipt(printerId: number): Promise<PrintAttemptResult> {
    const printer = printDocumentRepository.findPrinterById(printerId);

    if (!printer) {
      return {
        success: false,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: "Impressora não encontrada para teste.",
        jobId: 0,
        reprint: false,
      };
    }

    const sample = printDocumentRepository.buildTestSaleReceiptData(printer, {});
    const html = thermalReceiptRenderer.renderSaleReceipt(sample, printer);

    try {
      await electronReceiptPrinter.printHtml({
        html,
        printerName: printer.name,
        title: `Teste ${printer.display_name ?? printer.name}`,
        paperWidthMm: printer.paper_width_mm,
      });

      printDocumentRepository.appendPrinterLog(printer.id, "Impressão de teste enviada.");

      return {
        success: true,
        status: "SUCCESS",
        documentId: 0,
        printerId: printer.id,
        printerName: printer.display_name ?? printer.name,
        message: `Teste de impressão enviado para ${printer.display_name ?? printer.name}.`,
        jobId: 0,
        reprint: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Falha desconhecida na impressão de teste.";
      printDocumentRepository.appendPrinterLog(printer.id, `Teste de impressão falhou: ${errorMessage}`);

      return {
        success: false,
        status: "FAILED",
        documentId: 0,
        printerId: printer.id,
        printerName: printer.display_name ?? printer.name,
        message: errorMessage,
        jobId: 0,
        reprint: false,
      };
    }
  }

  async printSaleReceipt(saleId: number, options: SalePrintOptions): Promise<PrintAttemptResult> {
    const saleData = printDocumentRepository.loadSaleReceiptData(saleId);
    const printer = printDocumentRepository.getDefaultPrinter();
    const mergedData: SaleReceiptData = {
      ...saleData,
      fiscal: options.fiscal ?? saleData.fiscal,
    };

    const title = `Cupom de venda #${saleId}`;
    const html = thermalReceiptRenderer.renderSaleReceipt(mergedData, printer);

    const document = printDocumentRepository.upsertDocument({
      documentType: "SALE_RECEIPT",
      referenceType: "SALE",
      referenceId: saleId,
      saleId,
      title,
      status: "PENDING",
      templateVersion: "thermal-v1",
      payloadJson: JSON.stringify(mergedData),
      contentHtml: html,
      lastError: null,
    });

    return this.dispatchToPrinter(document, options.triggerSource, false);
  }

  async printCashOpeningReceipt(sessionId: number, triggerSource: PrintTriggerSource): Promise<PrintAttemptResult> {
    const data = printDocumentRepository.loadCashReceiptData(sessionId, "CASH_OPENING_RECEIPT");
    return this.printCashReceipt(data, triggerSource, false);
  }

  async printCashClosingReceipt(sessionId: number, triggerSource: PrintTriggerSource): Promise<PrintAttemptResult> {
    const data = printDocumentRepository.loadCashReceiptData(sessionId, "CASH_CLOSING_RECEIPT");
    return this.printCashReceipt(data, triggerSource, false);
  }

  async reprintSaleReceipt(saleId: number): Promise<PrintAttemptResult> {
    let document = printDocumentRepository.findByReference("SALE_RECEIPT", "SALE", saleId);

    if (!document) {
      return this.printSaleReceipt(saleId, { triggerSource: "MANUAL" });
    }

    const printer = printDocumentRepository.getDefaultPrinter();

    try {
      const payload = JSON.parse(document.payloadJson) as SaleReceiptData;
      document = printDocumentRepository.upsertDocument({
        documentType: document.documentType,
        referenceType: document.referenceType,
        referenceId: document.referenceId,
        saleId: document.saleId,
        cashSessionId: document.cashSessionId,
        printerId: printer?.id ?? document.printerId,
        title: document.title,
        status: document.status,
        templateVersion: document.templateVersion,
        payloadJson: document.payloadJson,
        contentHtml: thermalReceiptRenderer.renderSaleReceipt(payload, printer),
        lastError: document.lastError,
      });
    } catch {
      document = printDocumentRepository.upsertDocument({
        documentType: document.documentType,
        referenceType: document.referenceType,
        referenceId: document.referenceId,
        saleId: document.saleId,
        cashSessionId: document.cashSessionId,
        printerId: printer?.id ?? document.printerId,
        title: document.title,
        status: document.status,
        templateVersion: document.templateVersion,
        payloadJson: document.payloadJson,
        contentHtml: document.contentHtml,
        lastError: document.lastError,
      });
    }

    return this.dispatchToPrinter(document, "MANUAL", true);
  }

  private async printCashReceipt(data: CashReceiptData, triggerSource: PrintTriggerSource, reprint: boolean): Promise<PrintAttemptResult> {
    const printer = printDocumentRepository.getDefaultPrinter();
    const title = data.documentType === "CASH_OPENING_RECEIPT"
      ? `Abertura de caixa #${data.cashSessionId}`
      : `Fechamento de caixa #${data.cashSessionId}`;

    const html = thermalReceiptRenderer.renderCashReceipt(data, printer);

    const document = printDocumentRepository.upsertDocument({
      documentType: data.documentType,
      referenceType: "CASH_SESSION",
      referenceId: data.cashSessionId,
      cashSessionId: data.cashSessionId,
      title,
      status: "PENDING",
      templateVersion: "thermal-v1",
      payloadJson: JSON.stringify(data),
      contentHtml: html,
      lastError: null,
    });

    return this.dispatchToPrinter(document, triggerSource, reprint);
  }

  private async dispatchToPrinter(
    document: PrintedDocumentRecord,
    triggerSource: PrintTriggerSource,
    reprint: boolean,
  ): Promise<PrintAttemptResult> {
    const printer = printDocumentRepository.getDefaultPrinter();

    if (!printer) {
      printDocumentRepository.markDocumentFailed(document.id, "PENDING", "Nenhuma impressora padrão configurada.", null);
      const job = printDocumentRepository.createPrintJob({
        printedDocumentId: document.id,
        printerId: null,
        triggerSource,
        status: "SKIPPED",
        errorMessage: "Nenhuma impressora padrão configurada.",
      });

      return {
        success: false,
        status: "SKIPPED",
        documentId: document.id,
        printerId: null,
        printerName: null,
        message: createMessage(document.documentType, "skipped"),
        jobId: job.id,
        reprint,
      };
    }

    try {
      await electronReceiptPrinter.printHtml({
        html: thermalReceiptRenderer.renderFromStoredDocument(document),
        printerName: printer.name,
        title: document.title,
        paperWidthMm: printer.paper_width_mm,
      });

      printDocumentRepository.markDocumentPrinted(document.id, printer.id);
      printDocumentRepository.appendPrinterLog(printer.id, `${document.title} enviado para impressão.`);

      const job = printDocumentRepository.createPrintJob({
        printedDocumentId: document.id,
        printerId: printer.id,
        triggerSource,
        status: "SUCCESS",
      });

      return {
        success: true,
        status: "SUCCESS",
        documentId: document.id,
        printerId: printer.id,
        printerName: printer.display_name ?? printer.name,
        message: createMessage(document.documentType, "printed", printer.display_name ?? printer.name),
        jobId: job.id,
        reprint,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Falha desconhecida na impressão.";
      printDocumentRepository.markDocumentFailed(document.id, "FAILED", errorMessage, printer.id);
      printDocumentRepository.appendPrinterLog(printer.id, `${document.title} falhou: ${errorMessage}`);

      const job = printDocumentRepository.createPrintJob({
        printedDocumentId: document.id,
        printerId: printer.id,
        triggerSource,
        status: "FAILED",
        errorMessage,
      });

      return {
        success: false,
        status: "FAILED",
        documentId: document.id,
        printerId: printer.id,
        printerName: printer.display_name ?? printer.name,
        message: `${createMessage(document.documentType, "failed")} ${errorMessage}`,
        jobId: job.id,
        reprint,
      };
    }
  }
}

export const printDocumentService = new PrintDocumentService();
