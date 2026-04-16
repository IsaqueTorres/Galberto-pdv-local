import { ipcMain } from 'electron';
import { blingOAuthService } from '../../application/integrations/bling-oauth.service';
import { blingApiService } from '../../application/integrations/bling-api.service';
import { syncAllFromBlingService } from '../../application/integrations/services/SyncAllFromBlingService';
import { syncProductsFromBlingService } from '../../application/integrations/services/SyncProductsFromBlingService';
import { syncCategoriesFromBlingService } from '../../application/integrations/services/SyncCategoriesFromBlingService';
import { syncStateRepository } from '../database/repositories/syncState.repository';
import { syncLogRepository } from '../database/repositories/syncLog.repository';

export default function registerIntegrationHandlers() {
  ipcMain.handle('integrations:status', async (_event, integrationId: string) => {
    if (integrationId !== 'bling') {
      return { connected: false };
    }
    return await blingOAuthService.getStatus();
  });

  ipcMain.handle('integrations:connect', async (_event, integrationId: string) => {
    if (integrationId !== 'bling') {
      return { success: false, message: `Integração ${integrationId} ainda não implementada.` };
    }
    try {
      return await blingOAuthService.connect();
    } catch (error) {
      console.error('[integrations:connect]', error);
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao conectar com o Bling.' };
    }
  });

  ipcMain.handle('integrations:disconnect', async (_event, integrationId: string) => {
    if (integrationId !== 'bling') {
      return { success: false, message: `Integração ${integrationId} ainda não implementada.` };
    }
    try {
      return await blingOAuthService.disconnect();
    } catch (error) {
      console.error('[integrations:disconnect]', error);
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao desconectar Bling.' };
    }
  });

  // Sync completo: categorias → produtos (ordem obrigatória)
  ipcMain.handle('integrations:bling:sync-all', async () => {
    try {
      const result = await syncAllFromBlingService.execute();
      return { success: true, ...result };
    } catch (error) {
      console.error('[integrations:bling:sync-all]', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao sincronizar.',
      };
    }
  });

  // Sync individual: apenas produtos
  ipcMain.handle('integrations:bling:sync', async () => {
    try {
      const result = await syncProductsFromBlingService.execute();
      return { success: true, ...result };
    } catch (error) {
      console.error('[integrations:bling:sync]', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao sincronizar produtos.',
      };
    }
  });

  // Sync individual: apenas categorias
  ipcMain.handle('integrations:bling:sync-categories', async () => {
    try {
      const result = await syncCategoriesFromBlingService.execute();
      return { success: true, ...result };
    } catch (error) {
      console.error('[integrations:bling:sync-categories]', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao sincronizar categorias.',
      };
    }
  });

  // Estados de sync
  ipcMain.handle('integrations:bling:sync-status', () => {
    return syncStateRepository.get('bling', 'products');
  });

  ipcMain.handle('integrations:bling:sync-status-categories', () => {
    return syncStateRepository.get('bling', 'categories');
  });

  // Logs de sync
  ipcMain.handle('integrations:bling:sync-logs', () => {
    return syncLogRepository.listByIntegration('bling', 'products', 10);
  });

  ipcMain.handle('integrations:bling:sync-logs-categories', () => {
    return syncLogRepository.listByIntegration('bling', 'categories', 10);
  });

  // Utilitários de teste
  ipcMain.handle('integrations:bling:test', async () => {
    return await blingApiService.getProducts({ page: 1, limit: 5 });
  });

  ipcMain.handle('integrations:bling:test-categories', async () => {
    return await blingApiService.getCategories({ page: 1, limit: 5 });
  });

  ipcMain.handle('integrations:bling:test-icmp', async () => {
    return await blingApiService.ping();
  });
}
