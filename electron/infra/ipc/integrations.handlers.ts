import { ipcMain } from 'electron';
import { blingOAuthService } from '../../application/integrations/bling-oauth.service';
import { blingApiService } from '../../application/integrations/bling-api.service';
import { syncStateRepository } from '../database/repositories/syncState.repository';
import { syncLogRepository } from '../database/repositories/syncLog.repository';
import { assertCurrentUserPermission } from '../security/permission.guard';

const LOCAL_CATALOG_MODE_MESSAGE = 'Integração Bling desativada nesta versão local. O catálogo é gerenciado no SQLite do PDV.';

export default function registerIntegrationHandlers() {
  ipcMain.handle('integrations:status', async (_event, integrationId: string) => {
    assertCurrentUserPermission('integrations:manage');
    if (integrationId !== 'bling') {
      return { connected: false };
    }
    return await blingOAuthService.getStatus();
  });

  ipcMain.handle('integrations:connect', async (_event, integrationId: string) => {
    assertCurrentUserPermission('integrations:manage');
    if (integrationId !== 'bling') {
      return { success: false, message: `Integração ${integrationId} ainda não implementada.` };
    }
    return { success: false, message: LOCAL_CATALOG_MODE_MESSAGE };
  });

  ipcMain.handle('integrations:disconnect', async (_event, integrationId: string) => {
    assertCurrentUserPermission('integrations:manage');
    if (integrationId !== 'bling') {
      return { success: false, message: `Integração ${integrationId} ainda não implementada.` };
    }
    return { success: false, message: LOCAL_CATALOG_MODE_MESSAGE };
  });

  // Sync completo: categorias → produtos (ordem obrigatória)
  ipcMain.handle('integrations:bling:sync-all', async () => {
    assertCurrentUserPermission('integrations:manage');
    return { success: false, message: LOCAL_CATALOG_MODE_MESSAGE };
  });

  // Sync individual: apenas produtos
  ipcMain.handle('integrations:bling:sync', async () => {
    assertCurrentUserPermission('integrations:manage');
    return { success: false, message: LOCAL_CATALOG_MODE_MESSAGE };
  });

  // Sync individual: apenas categorias
  ipcMain.handle('integrations:bling:sync-categories', async () => {
    assertCurrentUserPermission('integrations:manage');
    return { success: false, message: LOCAL_CATALOG_MODE_MESSAGE };
  });

  // Estados de sync
  ipcMain.handle('integrations:bling:sync-status', () => {
    assertCurrentUserPermission('integrations:manage');
    return syncStateRepository.get('bling', 'products');
  });

  ipcMain.handle('integrations:bling:sync-status-categories', () => {
    assertCurrentUserPermission('integrations:manage');
    return syncStateRepository.get('bling', 'categories');
  });

  // Logs de sync
  ipcMain.handle('integrations:bling:sync-logs', () => {
    assertCurrentUserPermission('integrations:manage');
    return syncLogRepository.listByIntegration('bling', 'products', 10);
  });

  ipcMain.handle('integrations:bling:sync-logs-categories', () => {
    assertCurrentUserPermission('integrations:manage');
    return syncLogRepository.listByIntegration('bling', 'categories', 10);
  });

  // Utilitários de teste
  ipcMain.handle('integrations:bling:test', async () => {
    assertCurrentUserPermission('integrations:manage');
    return await blingApiService.getProducts({ page: 1, limit: 5 });
  });

  ipcMain.handle('integrations:bling:debug-product', async (_event, input: { id?: string | number; code?: string }) => {
    assertCurrentUserPermission('integrations:manage');
    if (input?.id) {
      return await blingApiService.getProductById(input.id);
    }
    if (input?.code) {
      const list = await blingApiService.getProductByCode(input.code);
      const first = Array.isArray(list.data) ? list.data[0] : null;
      if (!first?.id) {
        return { data: null, list };
      }
      return {
        list,
        detail: await blingApiService.getProductById(first.id),
      };
    }
    throw new Error('Informe id ou code para diagnosticar produto do Bling.');
  });

  ipcMain.handle('integrations:bling:test-categories', async () => {
    assertCurrentUserPermission('integrations:manage');
    return await blingApiService.getCategories({ page: 1, limit: 5 });
  });

  ipcMain.handle('integrations:bling:test-icmp', async () => {
    assertCurrentUserPermission('integrations:manage');
    return await blingApiService.ping();
  });
}
