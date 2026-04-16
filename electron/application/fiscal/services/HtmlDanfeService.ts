import * as fs from 'node:fs';
import * as path from 'node:path';
import { app } from 'electron';
import type { DanfeService } from '../contracts/DanfeService';
import type { DanfeResult, PersistedFiscalDocument } from '../types/fiscal.types';
import { salesRepository } from '../persistence/repositories/SalesRepository';
import { storeRepository } from '../persistence/repositories/StoreRepository';

function money(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export class HtmlDanfeService implements DanfeService {
  private readonly outputDir = path.join(app.getPath('userData'), 'fiscal', 'danfe');

  async generate(document: PersistedFiscalDocument): Promise<DanfeResult> {
    fs.mkdirSync(this.outputDir, { recursive: true });

    const danfePath = document.danfePath || path.join(this.outputDir, `nfce-${document.id}.html`);
    const html = this.render(document);
    fs.writeFileSync(danfePath, html, 'utf8');

    return {
      documentId: document.id,
      danfePath,
      contentType: 'text/html',
      updatedAt: new Date().toISOString(),
    };
  }

  async recover(document: PersistedFiscalDocument): Promise<DanfeResult | null> {
    if (!document.danfePath || !fs.existsSync(document.danfePath)) {
      return null;
    }

    return {
      documentId: document.id,
      danfePath: document.danfePath,
      contentType: 'text/html',
      updatedAt: new Date().toISOString(),
    };
  }

  private render(document: PersistedFiscalDocument): string {
    const aggregate = salesRepository.findAggregateById(document.saleId);
    const store = storeRepository.findById(document.companyId);
    const isHomologation = document.environment === 'homologation';
    const items = aggregate?.items ?? [];
    const payments = aggregate?.payments ?? [];
    const total = aggregate?.sale.totalAmount ?? 0;

    return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DANFE NFC-e ${document.number}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f5; color: #18181b; padding: 12px; }
      .card { width: 320px; margin: 0 auto; background: white; border: 1px solid #d4d4d8; border-radius: 12px; padding: 16px; }
      .title { font-size: 16px; font-weight: 700; margin-bottom: 8px; text-align: center; }
      .subtitle { font-size: 12px; text-align: center; margin-bottom: 8px; }
      .row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: 12px; }
      .muted { color: #71717a; }
      .ok { color: #059669; font-weight: 700; }
      .warn { color: #b45309; font-weight: 700; text-align: center; margin: 10px 0; font-size: 12px; }
      .divider { border-top: 1px dashed #a1a1aa; margin: 10px 0; }
      .item { font-size: 12px; margin-bottom: 8px; }
      .item strong { display: block; }
      .qr { word-break: break-all; font-size: 10px; color: #52525b; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">DANFE NFC-e</div>
      <div class="subtitle">${store?.legalName ?? 'Emitente não encontrado'}</div>
      <div class="subtitle">CNPJ ${store?.cnpj ?? '—'} | IE ${store?.stateRegistration ?? '—'}</div>
      <div class="subtitle">${store ? `${store.addressStreet}, ${store.addressNumber} - ${store.addressNeighborhood}` : 'Endereço indisponível'}</div>
      <div class="subtitle">${store ? `${store.addressCity}/${store.addressState}` : ''}</div>
      ${isHomologation ? '<div class="warn">EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL</div>' : ''}
      <div class="divider"></div>
      <div class="row"><span class="muted">Documento</span><span>${document.id}</span></div>
      <div class="row"><span class="muted">Venda</span><span>${document.saleId}</span></div>
      <div class="row"><span class="muted">Número/Série</span><span>${document.number}/${document.series}</span></div>
      <div class="row"><span class="muted">Status</span><span class="${document.status === 'AUTHORIZED' ? 'ok' : 'muted'}">${document.status}</span></div>
      <div class="row"><span class="muted">Emissão</span><span>${document.issuedAt}</span></div>
      <div class="row"><span class="muted">Autorização</span><span>${document.authorizedAt ?? 'Pendente'}</span></div>
      <div class="row"><span class="muted">Protocolo</span><span>${document.authorizationProtocol ?? 'Pendente'}</span></div>
      <div class="divider"></div>
      <div class="subtitle"><strong>Itens</strong></div>
      ${items.map((item) => `
        <div class="item">
          <strong>${item.description}</strong>
          <div class="row"><span>${Number(item.quantity).toFixed(3)} x ${money(item.unitPrice)}</span><span>${money(item.totalAmount)}</span></div>
        </div>
      `).join('')}
      <div class="divider"></div>
      <div class="subtitle"><strong>Pagamentos</strong></div>
      ${payments.map((payment) => `
        <div class="row">
          <span>${payment.method}</span>
          <span>${money(payment.amount)}</span>
        </div>
      `).join('')}
      <div class="row"><span class="muted">Troco</span><span>${money(aggregate?.sale.changeAmount ?? 0)}</span></div>
      <div class="row"><span class="muted">Total</span><span><strong>${money(total)}</strong></span></div>
      <div class="divider"></div>
      <div class="row"><span class="muted">Chave</span><span>${document.accessKey ?? 'Pendente'}</span></div>
      <div class="qr">${document.qrCodeUrl ?? 'QR Code indisponível'}</div>
    </div>
  </body>
</html>`;
  }
}
