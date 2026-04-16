import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { X509Certificate } from 'node:crypto';
import type { CertificateService } from '../contracts/CertificateService';
import { FiscalError } from '../errors/FiscalError';
import type { CertificateInfo, FiscalProviderConfig } from '../types/fiscal.types';

export class FileSystemCertificateService implements CertificateService {
  private readCertificatePem(config: FiscalProviderConfig): string | null {
    const certificatePath = config.certificatePath?.trim();
    if (!certificatePath) {
      return null;
    }

    const extension = path.extname(certificatePath).toLowerCase();
    if (extension === '.pem' || extension === '.crt' || extension === '.cer') {
      return fs.readFileSync(certificatePath, 'utf8');
    }

    if (extension === '.pfx' || extension === '.p12') {
      if (!config.certificatePassword) {
        throw new FiscalError({
          code: 'CERTIFICATE_PASSWORD_REQUIRED',
          message: 'Senha do certificado não configurada.',
          category: 'CERTIFICATE',
        });
      }

      try {
        return execFileSync(
          'openssl',
          ['pkcs12', '-in', certificatePath, '-clcerts', '-nokeys', '-passin', `pass:${config.certificatePassword}`],
          { encoding: 'utf8' }
        );
      } catch (error) {
        throw new FiscalError({
          code: 'CERTIFICATE_READ_FAILED',
          message: 'Não foi possível validar o certificado digital informado.',
          category: 'CERTIFICATE',
          cause: error,
        });
      }
    }

    return null;
  }

  async getCertificateInfo(config: FiscalProviderConfig): Promise<CertificateInfo> {
    const certificatePath = config.certificatePath?.trim();
    const lastCheckedAt = new Date().toISOString();

    if (!certificatePath) {
      return {
        configured: false,
        type: 'UNKNOWN',
        lastCheckedAt,
      };
    }

    const exists = fs.existsSync(certificatePath);
    let validUntil: string | null = null;

    if (exists) {
      try {
        const pem = this.readCertificatePem(config);
        if (pem) {
          const certificate = new X509Certificate(pem);
          validUntil = new Date(certificate.validTo).toISOString();
        }
      } catch {
        validUntil = null;
      }
    }

    return {
      configured: exists,
      type: ['.pfx', '.p12'].includes(path.extname(certificatePath).toLowerCase()) ? 'A1' : 'UNKNOWN',
      alias: path.basename(certificatePath),
      source: certificatePath,
      validUntil,
      lastCheckedAt,
    };
  }

  async assertCertificateReady(config: FiscalProviderConfig): Promise<void> {
    if (config.provider === 'mock') {
      return;
    }

    if (!config.certificatePath) {
      throw new FiscalError({
        code: 'CERTIFICATE_NOT_CONFIGURED',
        message: 'Certificado fiscal não configurado.',
        category: 'CERTIFICATE',
      });
    }

    if (!fs.existsSync(config.certificatePath)) {
      throw new FiscalError({
        code: 'CERTIFICATE_FILE_NOT_FOUND',
        message: `Arquivo do certificado não encontrado: ${config.certificatePath}`,
        category: 'CERTIFICATE',
      });
    }

    const pem = this.readCertificatePem(config);
    if (!pem) {
      throw new FiscalError({
        code: 'CERTIFICATE_FORMAT_NOT_SUPPORTED',
        message: 'Formato de certificado não suportado pela camada fiscal atual.',
        category: 'CERTIFICATE',
      });
    }

    const certificate = new X509Certificate(pem);
    if (new Date(certificate.validTo).getTime() < Date.now()) {
      throw new FiscalError({
        code: 'CERTIFICATE_EXPIRED',
        message: 'O certificado digital configurado está expirado.',
        category: 'CERTIFICATE',
      });
    }
  }
}
