export const integrationsService = {
  async getStatus(integrationId: string) {
    return await window.electron.integrations.getStatus(integrationId);
  },

  async connect(integrationId: string) {
    return await window.electron.integrations.connect(integrationId);
  },

  async disconnect(integrationId: string) {
    return await window.electron.integrations.disconnect(integrationId);
  },

  // Sync completo: categorias → produtos
  async syncAll() {
    return await window.electron.integrations.syncAll();
  },

  async syncProducts() {
    return await window.electron.integrations.syncProducts();
  },

  async syncCategories() {
    return await window.electron.integrations.syncCategories();
  },

  async getSyncStatus() {
    return await window.electron.integrations.getSyncStatus();
  },

  async getCategoriesSyncStatus() {
    return await window.electron.integrations.getCategoriesSyncStatus();
  },

  async getSyncLogs() {
    return await window.electron.integrations.getSyncLogs();
  },

  async getCategoriesSyncLogs() {
    return await window.electron.integrations.getCategoriesSyncLogs();
  },

  async testIcmpBling() {
    return await window.electron.integrations.testIcmpBling();
  },

  async testBling() {
    return await window.electron.integrations.testBling();
  },
};
