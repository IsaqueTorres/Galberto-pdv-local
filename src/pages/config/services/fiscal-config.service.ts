import type {
  CertificateInfo,
  FiscalConfigInput,
  FiscalConfigView,
  FiscalHandlerResult,
  FiscalQueueItem,
  FiscalQueueSummary,
  FiscalStoreInput,
  FiscalStoreRecord,
} from '../types/fiscal-config.types';

type FiscalBridge = {
  getConfig: () => Promise<FiscalConfigView>;
  getContext?: (storeId?: number) => Promise<unknown>;
  validateReadiness?: (storeId?: number) => Promise<unknown>;
  getActiveStore: () => Promise<FiscalStoreRecord | null>;
  saveActiveStore: (input: FiscalStoreInput) => Promise<FiscalHandlerResult<FiscalStoreRecord>>;
  getCertificateInfo: () => Promise<CertificateInfo>;
  saveConfig: (input: FiscalConfigInput) => Promise<FiscalHandlerResult<FiscalConfigView> | FiscalConfigView>;
  getQueueSummary: () => Promise<FiscalQueueSummary>;
  listQueue: (limit?: number) => Promise<FiscalQueueItem[]>;
  reprocessQueueItem: (queueId: string) => Promise<FiscalHandlerResult<FiscalQueueItem | null>>;
  processNextQueueItem: () => Promise<FiscalHandlerResult<FiscalQueueItem | null>>;
  runStatusDiagnostic: () => Promise<FiscalHandlerResult<FiscalQueueItem>>;
};

function fiscalBridge(): FiscalBridge {
  return (window as typeof window & { electron: { fiscal: FiscalBridge } }).electron.fiscal;
}

export const fiscalConfigService = {
  async getConfig() {
    return fiscalBridge().getConfig();
  },

  async getContext(storeId?: number) {
    return fiscalBridge().getContext?.(storeId);
  },

  async validateReadiness(storeId?: number) {
    return fiscalBridge().validateReadiness?.(storeId);
  },

  async getActiveStore() {
    return fiscalBridge().getActiveStore();
  },

  async saveActiveStore(input: FiscalStoreInput) {
    const result = await fiscalBridge().saveActiveStore(input);
    if (result.success === false) {
      throw new Error(result.error.message);
    }
    return result.data;
  },

  async saveConfig(input: FiscalConfigInput) {
    const result = await fiscalBridge().saveConfig(input);
    if ('success' in result && result.success === false) {
      throw new Error(result.error.message);
    }
    return 'success' in result ? result.data : result;
  },

  async getCertificateInfo() {
    return fiscalBridge().getCertificateInfo();
  },

  async getQueueSummary() {
    return fiscalBridge().getQueueSummary();
  },

  async listQueue(limit = 10) {
    return fiscalBridge().listQueue(limit);
  },

  async reprocessQueueItem(queueId: string) {
    const result = await fiscalBridge().reprocessQueueItem(queueId);
    if (result.success === false) {
      throw new Error(result.error.message);
    }
    return result.data;
  },

  async processNextQueueItem() {
    const result = await fiscalBridge().processNextQueueItem();
    if (result.success === false) {
      throw new Error(result.error.message);
    }
    return result.data;
  },

  async runStatusDiagnostic() {
    const result = await fiscalBridge().runStatusDiagnostic();
    if (result.success === false) {
      throw new Error(result.error.message);
    }
    return result.data;
  },
};
