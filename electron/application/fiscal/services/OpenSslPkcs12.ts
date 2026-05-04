import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

type OpenSslFailureDetails = {
  command: string;
  platform: NodeJS.Platform;
  attemptedLegacyFallback: boolean;
  originalCode?: string;
  originalMessage?: string;
  stderr?: string;
  legacyCode?: string;
  legacyMessage?: string;
  legacyStderr?: string;
};

type OpenSslFailure = Error & {
  code?: string;
  stderr?: Buffer | string;
};

function pathEntries(): string[] {
  const rawPath = process.env.PATH ?? process.env.Path ?? '';
  return rawPath.split(path.delimiter).filter(Boolean);
}

function executableExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

export function resolveOpenSslCommand(): string {
  const envPath = process.env.OPENSSL_BIN?.trim();
  if (envPath && executableExists(envPath)) {
    return envPath;
  }

  if (process.platform !== 'win32') {
    return 'openssl';
  }

  const candidates = [
    ...pathEntries().map((entry) => path.join(entry, 'openssl.exe')),
    'C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe',
    'C:\\Program Files\\OpenSSL-Win32\\bin\\openssl.exe',
    'C:\\Program Files\\Git\\usr\\bin\\openssl.exe',
  ];

  const found = candidates.find(executableExists);
  return found ?? 'openssl';
}

function stringifyFailureValue(value: unknown): string | undefined {
  if (Buffer.isBuffer(value)) {
    return value.toString('utf8').trim() || undefined;
  }

  if (typeof value === 'string') {
    return value.trim() || undefined;
  }

  return undefined;
}

function maskSensitiveValue(value: string | undefined, password: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return value
    .replaceAll(`pass:${password}`, 'pass:***')
    .replaceAll(password, '***');
}

function toFailureDetails(error: unknown, password: string) {
  const failure = error as OpenSslFailure;
  return {
    code: failure?.code,
    message: maskSensitiveValue(error instanceof Error ? error.message : String(error), password),
    stderr: maskSensitiveValue(stringifyFailureValue(failure?.stderr), password),
  };
}

function execPkcs12(args: string[], password: string): string {
  return execFileSync(resolveOpenSslCommand(), [
    'pkcs12',
    ...args,
    '-passin',
    `pass:${password}`,
  ], {
    encoding: 'utf8',
    windowsHide: true,
  });
}

export function readPkcs12WithOpenSsl(args: string[], password: string): string {
  let originalError: unknown;

  try {
    return execPkcs12(args, password);
  } catch (error) {
    originalError = error;
  }

  try {
    return execPkcs12(['-legacy', ...args], password);
  } catch (legacyError) {
    const original = toFailureDetails(originalError, password);
    const legacy = toFailureDetails(legacyError, password);
    const details: OpenSslFailureDetails = {
      command: resolveOpenSslCommand(),
      platform: process.platform,
      attemptedLegacyFallback: true,
      originalCode: original.code,
      originalMessage: original.message,
      stderr: original.stderr,
      legacyCode: legacy.code,
      legacyMessage: legacy.message,
      legacyStderr: legacy.stderr,
    };

    const error = new Error(legacy.message ?? 'Falha ao executar OpenSSL para ler certificado PKCS#12.');
    (error as Error & { details?: OpenSslFailureDetails }).details = details;
    throw error;
  }
}
