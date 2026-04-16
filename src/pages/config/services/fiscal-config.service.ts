import type {
  CertificateInfo,
  FiscalConfigInput,
  FiscalConfigView,
  FiscalHandlerResult,
  FiscalQueueItem,
  FiscalQueueSummary,
} from '../types/fiscal-config.types';

type FiscalBridge = {
  getConfig: () => Promise<FiscalConfigView>;
  getCertificateInfo: () => Promise<CertificateInfo>;
  saveConfig: (input: FiscalConfigInput) => Promise<FiscalHandlerResult<FiscalConfigView> | FiscalConfigView>;
  getQueueSummary: () => Promise<FiscalQueueSummary>;
  listQueue: (limit?: number) => Promise<FiscalQueueItem[]>;
  reprocessQueueItem: (queueId: string) => Promise<FiscalHandlerResult<FiscalQueueItem | null>>;
  processNextQueueItem: () => Promise<FiscalQueueItem | null>;
};

function fiscalBridge(): FiscalBridge {
  return (window as typeof window & { electron: { fiscal: FiscalBridge } }).electron.fiscal;
}

export const fiscalConfigService = {
  async getConfig() {
    return fiscalBridge().getConfig();
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
    return fiscalBridge().processNextQueueItem();
  },
};
