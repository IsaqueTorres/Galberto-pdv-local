import crypto from 'node:crypto';
import type { FiscalEnvironment } from '../types/fiscal.types';

const UF_CODES: Record<string, string> = {
  AC: '12',
  AL: '27',
  AP: '16',
  AM: '13',
  BA: '29',
  CE: '23',
  DF: '53',
  ES: '32',
  GO: '52',
  MA: '21',
  MT: '51',
  MS: '50',
  MG: '31',
  PA: '15',
  PB: '25',
  PR: '41',
  PE: '26',
  PI: '22',
  RJ: '33',
  RN: '24',
  RS: '43',
  RO: '11',
  RR: '14',
  SC: '42',
  SP: '35',
  SE: '28',
  TO: '17',
};

export type NfceAccessKeyInput = {
  uf: string;
  issuedAt: string;
  cnpj: string;
  model: 65;
  series: number;
  number: number;
  emissionType: number;
  numericCode?: string | null;
  environment: FiscalEnvironment;
};

export type NfceAccessKeyResult = {
  accessKey: string;
  numericCode: string;
  checkDigit: string;
  ufCode: string;
  yearMonth: string;
};

function onlyDigits(value: string | number): string {
  return String(value ?? '').replace(/\D/g, '');
}

function leftPad(value: string | number, length: number): string {
  return onlyDigits(value).padStart(length, '0').slice(-length);
}

function modulo11CheckDigit(base: string): string {
  let weight = 2;
  let sum = 0;

  for (let index = base.length - 1; index >= 0; index -= 1) {
    sum += Number(base[index]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  const mod = sum % 11;
  const digit = 11 - mod;
  return digit >= 10 ? '0' : String(digit);
}

function yearMonthFromIssuedAt(issuedAt: string): string {
  const date = new Date(issuedAt);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Data de emissao invalida para gerar chave de acesso.');
  }
  return `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export class NfceAccessKeyService {
  generate(input: NfceAccessKeyInput): NfceAccessKeyResult {
    const ufCode = UF_CODES[input.uf.toUpperCase()];
    if (!ufCode) {
      throw new Error(`UF sem codigo IBGE configurado para chave NFC-e: ${input.uf}`);
    }

    const cnpj = leftPad(input.cnpj, 14);
    if (cnpj.length !== 14 || /^0+$/.test(cnpj)) {
      throw new Error('CNPJ invalido para gerar chave de acesso NFC-e.');
    }

    const numericCode = input.numericCode?.replace(/\D/g, '').padStart(8, '0').slice(-8)
      ?? crypto.randomInt(0, 100_000_000).toString().padStart(8, '0');

    const base = [
      ufCode,
      yearMonthFromIssuedAt(input.issuedAt),
      cnpj,
      '65',
      leftPad(input.series, 3),
      leftPad(input.number, 9),
      String(input.emissionType),
      numericCode,
    ].join('');

    const checkDigit = modulo11CheckDigit(base);

    return {
      accessKey: `${base}${checkDigit}`,
      numericCode,
      checkDigit,
      ufCode,
      yearMonth: base.slice(2, 6),
    };
  }
}

export const nfceAccessKeyService = new NfceAccessKeyService();
