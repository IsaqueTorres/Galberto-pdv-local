import db from "../../../infra/database/db";
import { logger } from "../../../logger/logger";
import type {
  CashReceiptData,
  PrintDocumentDraft,
  PrintDocumentStatus,
  PrintJobRecord,
  PrintJobStatus,
  PrintTriggerSource,
  PrintedDocumentRecord,
  PrinterRecord,
  ReceiptCustomizationSettings,
  SaleReceiptData,
} from "../types/printing.types";

type SqlCount = { total: number };

function mapPrintedDocument(row: any): PrintedDocumentRecord {
  return {
    id: Number(row.id),
    documentType: row.document_type,
    referenceType: row.reference_type,
    referenceId: Number(row.reference_id),
    saleId: row.sale_id === null ? null : Number(row.sale_id),
    cashSessionId: row.cash_session_id === null ? null : Number(row.cash_session_id),
    printerId: row.printer_id === null ? null : Number(row.printer_id),
    title: row.title,
    status: row.status,
    templateVersion: row.template_version,
    payloadJson: row.payload_json,
    contentHtml: row.content_html,
    printCount: Number(row.print_count ?? 0),
    lastPrintedAt: row.last_printed_at ?? null,
    lastError: row.last_error ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPrintJob(row: any): PrintJobRecord {
  return {
    id: Number(row.id),
    printedDocumentId: Number(row.printed_document_id),
    printerId: row.printer_id === null ? null : Number(row.printer_id),
    triggerSource: row.trigger_source,
    status: row.status,
    errorMessage: row.error_message ?? null,
    copies: Number(row.copies ?? 1),
    attemptedAt: row.attempted_at,
    completedAt: row.completed_at ?? null,
  };
}

function paymentLabelFromCode(code: string) {
  const labels: Record<string, string> = {
    "01": "Dinheiro",
    "02": "Cheque",
    "03": "Cartao de Credito",
    "04": "Cartao de Debito",
    "10": "Vale Alimentacao",
    "11": "Vale Refeicao",
    "12": "Vale Presente",
    "13": "Vale Combustivel",
    "15": "Boleto",
    "17": "PIX",
    "99": "Outros",
  };

  return labels[code] ?? `Pagamento ${code}`;
}

function buildStoreAddress(row: any) {
  const parts = [
    row.endereco,
    row.numero,
    row.bairro,
    row.cidade,
    row.uf,
    row.cep,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" - ") : null;
}

export class PrintDocumentRepository {
  private mapPrinter(row: any): PrinterRecord {
    return {
      id: Number(row.id),
      name: row.name,
      display_name: row.display_name ?? null,
      brand: row.brand ?? null,
      model: row.model ?? null,
      connection_type: row.connection_type ?? null,
      driver_name: row.driver_name ?? null,
      driver_version: row.driver_version ?? null,
      photo_path: row.photo_path ?? null,
      notes: row.notes ?? null,
      is_default: Number(row.is_default ?? 0),
      installed_at: row.installed_at ?? null,
      paper_width_mm: Number(row.paper_width_mm ?? 80),
      content_width_mm: Number(row.content_width_mm ?? 76),
      base_font_size_px: Number(row.base_font_size_px ?? 13),
      line_height: Number(row.line_height ?? 1.5),
      receipt_settings_json: row.receipt_settings_json ?? null,
    };
  }

  findByReference(documentType: string, referenceType: string, referenceId: number) {
    const row = db.prepare(`
      SELECT *
      FROM printed_documents
      WHERE document_type = ?
        AND reference_type = ?
        AND reference_id = ?
      LIMIT 1
    `).get(documentType, referenceType, referenceId);

    return row ? mapPrintedDocument(row) : null;
  }

  findById(documentId: number) {
    const row = db.prepare(`
      SELECT *
      FROM printed_documents
      WHERE id = ?
      LIMIT 1
    `).get(documentId);

    return row ? mapPrintedDocument(row) : null;
  }

  upsertDocument(input: PrintDocumentDraft) {
    const existing = this.findByReference(input.documentType, input.referenceType, input.referenceId);

    if (existing) {
      db.prepare(`
        UPDATE printed_documents
        SET
          sale_id = ?,
          cash_session_id = ?,
          printer_id = ?,
          title = ?,
          status = ?,
          template_version = ?,
          payload_json = ?,
          content_html = ?,
          last_error = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        input.saleId ?? null,
        input.cashSessionId ?? null,
        input.printerId ?? null,
        input.title,
        input.status,
        input.templateVersion,
        input.payloadJson,
        input.contentHtml,
        input.lastError ?? null,
        existing.id,
      );

      return this.findById(existing.id)!;
    }

    const result = db.prepare(`
      INSERT INTO printed_documents (
        document_type,
        reference_type,
        reference_id,
        sale_id,
        cash_session_id,
        printer_id,
        title,
        status,
        template_version,
        payload_json,
        content_html,
        last_error
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.documentType,
      input.referenceType,
      input.referenceId,
      input.saleId ?? null,
      input.cashSessionId ?? null,
      input.printerId ?? null,
      input.title,
      input.status,
      input.templateVersion,
      input.payloadJson,
      input.contentHtml,
      input.lastError ?? null,
    );

    return this.findById(Number(result.lastInsertRowid))!;
  }

  markDocumentPrinted(documentId: number, printerId: number | null) {
    db.prepare(`
      UPDATE printed_documents
      SET
        status = 'PRINTED',
        printer_id = ?,
        print_count = print_count + 1,
        last_printed_at = datetime('now'),
        last_error = NULL,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(printerId, documentId);
  }

  markDocumentFailed(documentId: number, status: PrintDocumentStatus, errorMessage: string | null, printerId: number | null) {
    db.prepare(`
      UPDATE printed_documents
      SET
        status = ?,
        printer_id = ?,
        last_error = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(status, printerId, errorMessage, documentId);
  }

  createPrintJob(input: {
    printedDocumentId: number;
    printerId: number | null;
    triggerSource: PrintTriggerSource;
    status: PrintJobStatus;
    errorMessage?: string | null;
    copies?: number;
  }) {
    const result = db.prepare(`
      INSERT INTO print_jobs (
        printed_document_id,
        printer_id,
        trigger_source,
        status,
        error_message,
        copies
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      input.printedDocumentId,
      input.printerId ?? null,
      input.triggerSource,
      input.status,
      input.errorMessage ?? null,
      input.copies ?? 1,
    );

    const row = db.prepare(`
      SELECT *
      FROM print_jobs
      WHERE id = ?
      LIMIT 1
    `).get(result.lastInsertRowid);

    return mapPrintJob(row);
  }

  listDocumentJobs(documentId: number) {
    const rows = db.prepare(`
      SELECT *
      FROM print_jobs
      WHERE printed_document_id = ?
      ORDER BY id DESC
    `).all(documentId);

    return rows.map(mapPrintJob);
  }

  getDefaultPrinter(): PrinterRecord | null {
    const row = db.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE is_default = 1
      LIMIT 1
    `).get();

    if (!row) return null;

    return this.mapPrinter(row);
  }

  findPrinterById(printerId: number): PrinterRecord | null {
    const row = db.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE id = ?
      LIMIT 1
    `).get(printerId);

    return row ? this.mapPrinter(row) : null;
  }

  buildTestSaleReceiptData(printer: PrinterRecord, settings: ReceiptCustomizationSettings): SaleReceiptData {
    const headerTitle =
      settings.templateMode === "custom" ? settings.headerTitle?.trim() || printer.display_name || "Galberto PDV" : printer.display_name || "Galberto PDV";

    return {
      saleId: 999999,
      emittedAt: new Date().toISOString(),
      movedAt: new Date().toISOString(),
      status: "FINALIZADA",
      storeName: headerTitle,
      storeLegalName: "GALBERTO PDV LTDA",
      storeDocument: "12.345.678/0001-99",
      storeAddress: "Rua Exemplo, 123 - Centro - Cidade/UF - 70000-000",
      operatorName: "Operador Teste",
      operatorId: "1",
      pdvId: "PDV-001",
      customerName: "Consumidor final",
      customerDocument: null,
      items: [
        {
          productId: "TESTE-1",
          code: "7890001112223",
          description: "ARROZ TIPO 1 5KG TESTE",
          quantity: 1,
          unitPrice: 29.9,
          grossAmount: 29.9,
          discountAmount: 0,
          totalAmount: 29.9,
        },
        {
          productId: "TESTE-2",
          code: "7890001112224",
          description: "FEIJAO PRETO 1KG TESTE",
          quantity: 2,
          unitPrice: 8.5,
          grossAmount: 17,
          discountAmount: 1,
          totalAmount: 16,
        },
      ],
      payments: [
        {
          paymentCode: "01",
          paymentLabel: "Dinheiro",
          amount: 45.9,
          receivedAmount: 50,
          changeAmount: 4.1,
        },
      ],
      subtotalAmount: 46.9,
      discountAmount: 1,
      totalAmount: 45.9,
      changeAmount: 4.1,
      notes: "Documento de teste para ajuste de layout.",
      fiscal: {
        status: "TESTE",
        protocol: "PROTOCOLO-TESTE",
        accessKey: "35123456789012345678901234567890123456789012",
        statusMessage: "Simulação operacional",
        authorizationDatetime: new Date().toISOString(),
        qrCodeUrl: null,
      },
    };
  }

  appendPrinterLog(printerId: number, message: string) {
    db.prepare(`
      INSERT INTO printer_logs (printer_id, message)
      VALUES (?, ?)
    `).run(printerId, message);
  }

  loadSaleReceiptData(saleId: number): SaleReceiptData {
    const sale = db.prepare(`
      SELECT
        v.id,
        v.data_emissao,
        v.data_movimento,
        v.status,
        v.cliente_nome,
        v.cpf_cliente,
        v.valor_produtos,
        v.valor_desconto,
        v.valor_total,
        v.valor_troco,
        v.observacao,
        company.razao_social,
        company.nome_fantasia,
        company.cnpj,
        company.rua AS endereco,
        company.numero,
        company.bairro,
        company.cidade,
        company.uf,
        company.cep,
        vp.cash_session_id,
        cs.operator_id,
        cs.pdv_id,
        u.nome AS operator_name
      FROM vendas v
      LEFT JOIN company ON company.ativo = 1
      LEFT JOIN venda_pagamento vp ON vp.venda_id = v.id
      LEFT JOIN cash_register_sessions cs ON cs.id = vp.cash_session_id
      LEFT JOIN usuarios u ON CAST(u.id AS TEXT) = CAST(cs.operator_id AS TEXT)
      WHERE v.id = ?
      LIMIT 1
    `).get(saleId) as any;

    if (!sale) {
      throw new Error(`Venda não encontrada para impressão: ${saleId}`);
    }

    const items = db.prepare(`
      SELECT
        produto_id,
        codigo_produto,
        nome_produto,
        quantidade_comercial,
        valor_unitario_comercial,
        valor_bruto,
        valor_desconto,
        subtotal
      FROM venda_itens
      WHERE venda_id = ?
      ORDER BY id
    `).all(saleId) as any[];

    const payments = db.prepare(`
      SELECT
        tpag,
        valor,
        valor_recebido,
        troco
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id
    `).all(saleId) as any[];

    const fiscal = db.prepare(`
      SELECT fd.status, fd.access_key, fd.protocol, fd.authorization_datetime, fd.qr_code_url
      FROM fiscal_documents fd
      INNER JOIN sales s ON s.id = fd.sale_id
      WHERE s.external_reference = ?
      ORDER BY fd.id DESC
      LIMIT 1
    `).get(`legacy-sale:${saleId}`) as any;

    return {
      saleId: Number(sale.id),
      emittedAt: sale.data_emissao,
      movedAt: sale.data_movimento ?? null,
      status: sale.status,
      storeName: sale.nome_fantasia ?? sale.razao_social ?? "Galberto PDV",
      storeLegalName: sale.razao_social ?? null,
      storeDocument: sale.cnpj ?? null,
      storeAddress: buildStoreAddress(sale),
      operatorName: sale.operator_name ?? null,
      operatorId: sale.operator_id === null ? null : String(sale.operator_id),
      pdvId: sale.pdv_id ?? null,
      customerName: sale.cliente_nome ?? null,
      customerDocument: sale.cpf_cliente ?? null,
      items: items.map((item) => ({
        productId: String(item.produto_id),
        code: item.codigo_produto ?? null,
        description: item.nome_produto,
        quantity: Number(item.quantidade_comercial ?? 0),
        unitPrice: Number(item.valor_unitario_comercial ?? 0),
        grossAmount: Number(item.valor_bruto ?? 0),
        discountAmount: Number(item.valor_desconto ?? 0),
        totalAmount: Number(item.subtotal ?? 0),
      })),
      payments: payments.map((payment) => ({
        paymentCode: payment.tpag,
        paymentLabel: paymentLabelFromCode(payment.tpag),
        amount: Number(payment.valor ?? 0),
        receivedAmount: Number(payment.valor_recebido ?? payment.valor ?? 0),
        changeAmount: Number(payment.troco ?? 0),
      })),
      subtotalAmount: Number(sale.valor_produtos ?? 0),
      discountAmount: Number(sale.valor_desconto ?? 0),
      totalAmount: Number(sale.valor_total ?? 0),
      changeAmount: Number(sale.valor_troco ?? 0),
      notes: sale.observacao ?? null,
      fiscal: fiscal ? {
        status: fiscal.status ?? null,
        accessKey: fiscal.access_key ?? null,
        protocol: fiscal.protocol ?? null,
        statusMessage: fiscal.status ?? null,
        authorizationDatetime: fiscal.authorization_datetime ?? null,
        qrCodeUrl: fiscal.qr_code_url ?? null,
      } : null,
    };
  }

  loadCashReceiptData(sessionId: number, documentType: CashReceiptData["documentType"]): CashReceiptData {
    const row = db.prepare(`
      SELECT
        s.id,
        s.operator_id,
        s.pdv_id,
        s.opening_cash_amount,
        s.closing_cash_amount,
        s.expected_cash_amount,
        s.closing_difference,
        s.opened_at,
        s.closed_at,
        s.opening_notes,
        s.closing_notes,
        u.nome AS operator_name,
        COALESCE((
          SELECT SUM(vp.valor)
          FROM venda_pagamento vp
          WHERE vp.cash_session_id = s.id
            AND vp.tpag = '01'
        ), 0) AS total_vendas_dinheiro,
        COALESCE((
          SELECT SUM(m.amount)
          FROM cash_register_movements m
          WHERE m.cash_session_id = s.id
            AND m.movement_type = 'SANGRIA'
        ), 0) AS total_sangrias
      FROM cash_register_sessions s
      LEFT JOIN usuarios u ON CAST(u.id AS TEXT) = CAST(s.operator_id AS TEXT)
      WHERE s.id = ?
      LIMIT 1
    `).get(sessionId) as any;

    if (!row) {
      throw new Error(`Sessão de caixa não encontrada para impressão: ${sessionId}`);
    }

    return {
      cashSessionId: Number(row.id),
      documentType,
      operatorName: row.operator_name ?? null,
      operatorId: row.operator_id === null ? null : String(row.operator_id),
      pdvId: row.pdv_id,
      openingAmount: Number(row.opening_cash_amount ?? 0),
      closingAmount: row.closing_cash_amount === null ? null : Number(row.closing_cash_amount),
      expectedAmount: row.expected_cash_amount === null ? null : Number(row.expected_cash_amount),
      differenceAmount: row.closing_difference === null ? null : Number(row.closing_difference),
      totalSalesCash: Number(row.total_vendas_dinheiro ?? 0),
      totalWithdrawals: Number(row.total_sangrias ?? 0),
      openedAt: row.opened_at,
      closedAt: row.closed_at ?? null,
      openingNotes: row.opening_notes ?? null,
      closingNotes: row.closing_notes ?? null,
    };
  }

  hasPrintedDocumentForSale(saleId: number) {
    const row = db.prepare(`
      SELECT COUNT(*) AS total
      FROM printed_documents
      WHERE sale_id = ?
        AND document_type = 'SALE_RECEIPT'
    `).get(saleId) as SqlCount;

    return Number(row.total ?? 0) > 0;
  }

  logInfo(message: string) {
    logger.info(`[printing] ${message}`);
  }
}

export const printDocumentRepository = new PrintDocumentRepository();
