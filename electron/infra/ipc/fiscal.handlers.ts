import { ipcMain } from 'electron';

import { fiscalCertificateService, fiscalConfigService, fiscalQueueService, fiscalService } from '../../application/fiscal';
import { normalizeFiscalError } from '../../application/fiscal/errors/FiscalError';
import { assertCurrentUserPermission } from '../security/permission.guard';

export default function registerFiscalHandlers() {

  ipcMain.handle('fiscal:get-runtime-config', async () => {
    assertCurrentUserPermission('fiscal:manage');
    return fiscalService.getConfig();
  });

  ipcMain.handle('fiscal:save-runtime-config', async (_event, input) => {
    try {
      assertCurrentUserPermission('fiscal:manage');
      return await fiscalService.saveConfig(input);
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'FISCAL_CONFIG_SAVE_FAILED');
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable,
        },
      };
    }
  });

  ipcMain.handle('fiscal:get-certificate-info', async () => {
    assertCurrentUserPermission('fiscal:manage');
    return fiscalCertificateService.getCertificateInfo(fiscalConfigService.getConfig());
  });

  ipcMain.handle('fiscal:authorize-nfce', async (_event, request) => {
    try {
      assertCurrentUserPermission('fiscal:manage');
      return {
        success: true,
        data: await fiscalService.authorizeNfce(request),
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'FISCAL_AUTHORIZE_FAILED');
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable,
        },
      };
    }
  });

  ipcMain.handle('fiscal:cancel-nfce', async (_event, request) => {
    try {
      assertCurrentUserPermission('fiscal:manage');
      return {
        success: true,
        data: await fiscalService.cancelNfce(request),
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'FISCAL_CANCEL_FAILED');
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable,
        },
      };
    }
  });

  ipcMain.handle('fiscal:consult-status', async (_event, accessKey: string) => {
    try {
      assertCurrentUserPermission('fiscal:manage');
      return {
        success: true,
        data: await fiscalService.consultStatusByAccessKey(accessKey),
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'FISCAL_CONSULT_FAILED');
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable,
        },
      };
    }
  });

  ipcMain.handle('fiscal:get-danfe', async (_event, documentId: number) => {
    try {
      assertCurrentUserPermission('fiscal:manage');
      return {
        success: true,
        data: await fiscalService.getDanfe(documentId),
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'FISCAL_DANFE_FAILED');
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable,
        },
      };
    }
  });

  ipcMain.handle('fiscal:get-queue-summary', async () => {
    assertCurrentUserPermission('fiscal:manage');
    return fiscalService.getQueueSummary();
  });

  ipcMain.handle('fiscal:list-queue', async (_event, limit = 20) => {
    assertCurrentUserPermission('fiscal:manage');
    return fiscalService.listQueue(limit);
  });

  ipcMain.handle('fiscal:reprocess-queue-item', async (_event, queueId: string) => {
    try {
      assertCurrentUserPermission('fiscal:manage');
      return {
        success: true,
        data: await fiscalService.reprocessQueueItem(queueId),
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'FISCAL_REPROCESS_FAILED');
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable,
        },
      };
    }
  });

  ipcMain.handle('fiscal:process-next-queue-item', async () => {
    assertCurrentUserPermission('fiscal:manage');
    return fiscalQueueService.processNext();
  });

}
