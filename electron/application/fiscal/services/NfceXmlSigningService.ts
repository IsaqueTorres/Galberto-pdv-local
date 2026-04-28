import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, createSign } from 'node:crypto';
import { DOMParser } from '@xmldom/xmldom';
import { FiscalError } from '../errors/FiscalError';
import type { FiscalProviderConfig } from '../types/fiscal.types';

const NFE_NAMESPACE = 'http://www.portalfiscal.inf.br/nfe';
const DSIG_NAMESPACE = 'http://www.w3.org/2000/09/xmldsig#';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/\t/g, '&#x9;')
    .replace(/\n/g, '&#xA;')
    .replace(/\r/g, '&#xD;');
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r/g, '&#xD;');
}

function localName(node: Node): string {
  return (node as Element).localName || node.nodeName.replace(/^.*:/, '');
}

function canonicalize(node: Node): string {
  if (node.nodeType === 3) {
    return escapeText(node.nodeValue ?? '');
  }

  if (node.nodeType !== 1) {
    return '';
  }

  const element = node as Element;
  const name = element.nodeName;
  const attrs: string[] = [];

  if (localName(element) === 'infNFe' && !element.getAttribute('xmlns')) {
    attrs.push(`xmlns="${NFE_NAMESPACE}"`);
  }

  const rawAttrs: Array<{ name: string; value: string }> = [];
  for (let index = 0; index < element.attributes.length; index += 1) {
    const attr = element.attributes.item(index);
    if (!attr) continue;
    rawAttrs.push({ name: attr.name, value: attr.value });
  }

  rawAttrs
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((attr) => {
      if (attr.name === 'xmlns' && localName(element) === 'infNFe') return;
      attrs.push(`${attr.name}="${escapeAttr(attr.value)}"`);
    });

  const open = attrs.length > 0 ? `<${name} ${attrs.join(' ')}>` : `<${name}>`;
  let children = '';
  for (let index = 0; index < element.childNodes.length; index += 1) {
    children += canonicalize(element.childNodes.item(index));
  }

  return `${open}${children}</${name}>`;
}

function extractPemBody(pem: string, label: string): string {
  const match = pem.match(new RegExp(`-----BEGIN ${label}-----([\\s\\S]*?)-----END ${label}-----`));
  return match?.[1]?.replace(/\s+/g, '') ?? '';
}

function extractPemBlock(pem: string, label: string): string {
  const match = pem.match(new RegExp(`-----BEGIN ${label}-----[\\s\\S]*?-----END ${label}-----`));
  return match?.[0] ?? '';
}

function extractCertificate(config: FiscalProviderConfig): { privateKeyPem: string; certificateBody: string } {
  const certificatePath = config.certificatePath?.trim();
  if (!certificatePath) {
    throw new FiscalError({
      code: 'CERTIFICATE_NOT_CONFIGURED',
      message: 'Caminho do certificado A1 nao configurado.',
      category: 'CERTIFICATE',
    });
  }

  if (!fs.existsSync(certificatePath)) {
    throw new FiscalError({
      code: 'CERTIFICATE_FILE_NOT_FOUND',
      message: `Arquivo do certificado nao encontrado: ${certificatePath}`,
      category: 'CERTIFICATE',
    });
  }

  if (!config.certificatePassword) {
    throw new FiscalError({
      code: 'CERTIFICATE_PASSWORD_REQUIRED',
      message: 'Senha do certificado A1 nao configurada.',
      category: 'CERTIFICATE',
    });
  }

  const extension = path.extname(certificatePath).toLowerCase();
  if (!['.pfx', '.p12'].includes(extension)) {
    throw new FiscalError({
      code: 'CERTIFICATE_FORMAT_NOT_SUPPORTED',
      message: 'Assinatura NFC-e direta suporta certificado A1 .pfx/.p12.',
      category: 'CERTIFICATE',
    });
  }

  try {
    const privateKeyPem = execFileSync(
      'openssl',
      ['pkcs12', '-in', certificatePath, '-nocerts', '-nodes', '-passin', `pass:${config.certificatePassword}`],
      { encoding: 'utf8' }
    );
    const certificatePem = execFileSync(
      'openssl',
      ['pkcs12', '-in', certificatePath, '-clcerts', '-nokeys', '-passin', `pass:${config.certificatePassword}`],
      { encoding: 'utf8' }
    );
    const privateKeyBlock = extractPemBlock(privateKeyPem, 'PRIVATE KEY')
      || extractPemBlock(privateKeyPem, 'RSA PRIVATE KEY');
    const certificateBody = extractPemBody(certificatePem, 'CERTIFICATE');

    if (!privateKeyBlock) {
      throw new Error('Chave privada nao encontrada no arquivo A1.');
    }

    if (!certificateBody) {
      throw new Error('Certificado publico nao encontrado no arquivo A1.');
    }

    return { privateKeyPem: privateKeyBlock, certificateBody };
  } catch (error) {
    throw new FiscalError({
      code: 'CERTIFICATE_PKCS12_EXTRACT_FAILED',
      message: 'Falha ao extrair chave/certificado do A1 para assinatura XML.',
      category: 'CERTIFICATE',
      cause: error,
    });
  }
}

function findInfNFe(xml: string): Element {
  const parserErrors: string[] = [];
  const doc = new DOMParser({
    errorHandler: {
      warning: (message) => parserErrors.push(String(message)),
      error: (message) => parserErrors.push(String(message)),
      fatalError: (message) => parserErrors.push(String(message)),
    },
  }).parseFromString(xml, 'application/xml');
  if (parserErrors.length > 0) {
    throw new FiscalError({
      code: 'NFCE_XML_MALFORMED',
      message: `XML NFC-e malformado antes da assinatura: ${parserErrors.join(' | ')}`,
      category: 'VALIDATION',
      details: { parserErrors },
    });
  }

  const infNFe = doc.getElementsByTagName('infNFe').item(0);
  if (!infNFe) {
    throw new FiscalError({
      code: 'NFCE_XML_INF_NFE_NOT_FOUND',
      message: 'XML NFC-e nao contem grupo infNFe para assinatura.',
      category: 'VALIDATION',
    });
  }
  return infNFe;
}

function canonicalizeXmlFragment(xml: string): string {
  const parserErrors: string[] = [];
  const doc = new DOMParser({
    errorHandler: {
      warning: (message) => parserErrors.push(String(message)),
      error: (message) => parserErrors.push(String(message)),
      fatalError: (message) => parserErrors.push(String(message)),
    },
  }).parseFromString(xml, 'application/xml');

  if (parserErrors.length > 0 || !doc.documentElement) {
    throw new FiscalError({
      code: 'NFCE_XML_SIGNATURE_FRAGMENT_INVALID',
      message: `Fragmento XML de assinatura invalido: ${parserErrors.join(' | ')}`,
      category: 'VALIDATION',
      details: { parserErrors },
    });
  }

  return canonicalize(doc.documentElement);
}

function compactXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').trim();
}

export class NfceXmlSigningService {
  sign(xml: string, config: FiscalProviderConfig): string {
    const normalizedXml = compactXml(xml);
    const infNFe = findInfNFe(normalizedXml);
    const id = infNFe.getAttribute('Id');
    if (!id) {
      throw new FiscalError({
        code: 'NFCE_XML_ID_NOT_FOUND',
        message: 'infNFe nao possui atributo Id para assinatura.',
        category: 'VALIDATION',
      });
    }

    const { privateKeyPem, certificateBody } = extractCertificate(config);
    const canonicalInfNFe = canonicalize(infNFe);
    const digestValue = createHash('sha1').update(canonicalInfNFe, 'utf8').digest('base64');

    const signedInfo = `<SignedInfo xmlns="${DSIG_NAMESPACE}">` +
      `<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>` +
      `<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>` +
      `<Reference URI="#${id}">` +
      `<Transforms>` +
      `<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>` +
      `<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>` +
      `</Transforms>` +
      `<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>` +
      `<DigestValue>${digestValue}</DigestValue>` +
      `</Reference>` +
      `</SignedInfo>`;

    const canonicalSignedInfo = canonicalizeXmlFragment(signedInfo);
    const signatureValue = createSign('RSA-SHA1').update(canonicalSignedInfo, 'utf8').sign(privateKeyPem, 'base64');
    const signatureXml = `<Signature xmlns="${DSIG_NAMESPACE}">${signedInfo}` +
      `<SignatureValue>${signatureValue}</SignatureValue>` +
      `<KeyInfo><X509Data><X509Certificate>${certificateBody}</X509Certificate></X509Data></KeyInfo>` +
      `</Signature>`;

    if (normalizedXml.includes('</infNFeSupl>')) {
      return normalizedXml.replace('</infNFeSupl>', `</infNFeSupl>${signatureXml}`);
    }

    return normalizedXml.replace('</infNFe>', `</infNFe>${signatureXml}`);
  }
}

export const nfceXmlSigningService = new NfceXmlSigningService();
