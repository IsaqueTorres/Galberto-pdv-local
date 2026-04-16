import { syncCategoriesFromBlingService, CategoriesSyncResult } from './SyncCategoriesFromBlingService';
import { syncProductsFromBlingService, SyncResult as ProductsSyncResult } from './SyncProductsFromBlingService';

export type SyncAllResult = {
  categories: CategoriesSyncResult;
  products: ProductsSyncResult;
};

/**
 * Orquestra a sincronização completa com o Bling.
 *
 * Ordem obrigatória: categorias primeiro, depois produtos.
 * Isso garante que category_id já existe no banco quando os
 * produtos forem inseridos/atualizados.
 */
export class SyncAllFromBlingService {
  async execute(): Promise<SyncAllResult> {
    const categories = await syncCategoriesFromBlingService.execute();
    const products = await syncProductsFromBlingService.execute();
    return { categories, products };
  }
}

export const syncAllFromBlingService = new SyncAllFromBlingService();
