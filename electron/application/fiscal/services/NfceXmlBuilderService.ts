import type { AuthorizeNfceRequest } from '../types/fiscal.types';

function escapeXml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function money(value: number): string {
  return Number(value ?? 0).toFixed(2);
}

export class NfceXmlBuilderService {
  buildAuthorizeXml(request: AuthorizeNfceRequest): string {
    const itemsXml = request.items
      .map(
        (item, index) => `    <det nItem="${index + 1}">
      <prod>
        <cProd>${escapeXml(item.id)}</cProd>
        <xProd>${escapeXml(item.description)}</xProd>
        <cEAN>${escapeXml(item.gtin ?? 'SEM GTIN')}</cEAN>
        <NCM>${escapeXml(item.tax.ncm)}</NCM>
        <CFOP>${escapeXml(item.tax.cfop)}</CFOP>
        ${item.tax.cest ? `<CEST>${escapeXml(item.tax.cest)}</CEST>` : ''}
        <uCom>${escapeXml(item.unit)}</uCom>
        <qCom>${escapeXml(item.quantity.toFixed(4))}</qCom>
        <vUnCom>${money(item.unitPrice)}</vUnCom>
        <vProd>${money(item.grossAmount)}</vProd>
        <uTrib>${escapeXml(item.unit)}</uTrib>
        <qTrib>${escapeXml(item.quantity.toFixed(4))}</qTrib>
        <vUnTrib>${money(item.unitPrice)}</vUnTrib>
        <vDesc>${money(item.discountAmount)}</vDesc>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ICMS><orig>${escapeXml(item.tax.originCode)}</orig>${item.tax.csosn ? `<CSOSN>${escapeXml(item.tax.csosn)}</CSOSN>` : ''}${item.tax.icmsCst ? `<CST>${escapeXml(item.tax.icmsCst)}</CST>` : ''}</ICMS>
        <PIS><CST>${escapeXml(item.tax.pisCst)}</CST></PIS>
        <COFINS><CST>${escapeXml(item.tax.cofinsCst)}</CST></COFINS>
      </imposto>
    </det>`
      )
      .join('\n');

    const paymentsXml = request.payments
      .map(
        (payment) => `      <detPag>
        <indPag>0</indPag>
        <tPag>${escapeXml(payment.method)}</tPag>
        <vPag>${money(payment.amount)}</vPag>
        ${payment.description ? `<xPag>${escapeXml(payment.description)}</xPag>` : ''}
      </detPag>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe versao="4.00" Id="">
    <ide>
      <mod>65</mod>
      <serie>${escapeXml(request.series)}</serie>
      <nNF>${escapeXml(request.number)}</nNF>
      <dhEmi>${escapeXml(request.issuedAt)}</dhEmi>
      <tpAmb>${request.environment === 'production' ? '1' : '2'}</tpAmb>
      <tpImp>4</tpImp>
      <tpEmis>1</tpEmis>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
    </ide>
    <emit>
      <CNPJ>${escapeXml(request.emitter.cnpj)}</CNPJ>
      <xNome>${escapeXml(request.emitter.legalName)}</xNome>
      <xFant>${escapeXml(request.emitter.tradeName)}</xFant>
      <IE>${escapeXml(request.emitter.stateRegistration)}</IE>
      <CRT>${escapeXml(request.emitter.taxRegimeCode)}</CRT>
      <enderEmit>
        <xLgr>${escapeXml(request.emitter.address.street)}</xLgr>
        <nro>${escapeXml(request.emitter.address.number)}</nro>
        <xBairro>${escapeXml(request.emitter.address.neighborhood)}</xBairro>
        <cMun>${escapeXml(request.emitter.address.cityIbgeCode)}</cMun>
        <xMun>${escapeXml(request.emitter.address.city)}</xMun>
        <UF>${escapeXml(request.emitter.address.state)}</UF>
        <CEP>${escapeXml(request.emitter.address.zipCode)}</CEP>
      </enderEmit>
    </emit>
    ${
      request.customer?.cpfCnpj
        ? `<dest>
      <${request.customer.cpfCnpj.replace(/\D/g, '').length === 11 ? 'CPF' : 'CNPJ'}>${escapeXml(request.customer.cpfCnpj)}</${request.customer.cpfCnpj.replace(/\D/g, '').length === 11 ? 'CPF' : 'CNPJ'}>
      ${request.customer.name ? `<xNome>${escapeXml(request.customer.name)}</xNome>` : ''}
    </dest>`
        : ''
    }
${itemsXml}
    <total>
      <ICMSTot>
        <vProd>${money(request.totals.productsAmount)}</vProd>
        <vDesc>${money(request.totals.discountAmount)}</vDesc>
        <vNF>${money(request.totals.finalAmount)}</vNF>
      </ICMSTot>
    </total>
    <pag>
${paymentsXml}
      <vTroco>${money(request.totals.changeAmount)}</vTroco>
    </pag>
    ${request.additionalInfo ? `<infAdic><infCpl>${escapeXml(request.additionalInfo)}</infCpl></infAdic>` : ''}
  </infNFe>
</NFe>`;
  }
}

export const nfceXmlBuilderService = new NfceXmlBuilderService();
