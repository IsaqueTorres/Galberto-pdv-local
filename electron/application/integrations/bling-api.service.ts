/**
 * BlingApiService
 * ---------------------------------------------------------------------
 * Cliente responsável por realizar chamadas HTTP para a API da Bling.
 *
 * Este serviço encapsula:
 * - Autenticação via OAuth (Bearer Token)
 * - Construção de requisições HTTP
 * - Tratamento básico de erros da API
 *
 * Responsabilidades:
 * - Executar requisições GET autenticadas
 * - Fornecer métodos de acesso aos endpoints da Bling
 *
 * NÃO é responsabilidade deste serviço:
 * - Persistir dados no banco
 * - Controlar sincronização
 * - Mapear dados para entidades internas
 *
 * Uso típico:
 * - Utilizado por serviços como:
 *   - SyncProductsFromBlingService
 *   - BlingProductsService
 *
 * Observação:
 * - O token é obtido dinamicamente via blingOAuthService
 */

import { blingOAuthService } from './bling-oauth.service';
import { BlingCategoriesResponse, BlingProductsResponse } from './types/integration.types'
const BLING_API_BASE_URL = 'https://api.bling.com.br/Api/v3';

export class BlingApiService {
  /**
   * Método genérico GET para a API da Bling.
   *
   * Permite passar query params dinamicamente.
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const accessToken = await blingOAuthService.getValidAccessToken();

    /**
     * Monta query string automaticamente.
     */
    const url = new URL(`${BLING_API_BASE_URL}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'enable-jwt': '1',
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Erro na API do Bling: ${response.status} - ${text}`);
    }

    return JSON.parse(text) as T;
  }

  /**
   * Endpoint simples de teste da API.
   */
  async ping() {
    return this.get('/empresas/me');
  }

  /**
   * Método antigo (mantido por compatibilidade).
   *
   * ⚠️ Não suporta paginação
   */
  async listarProdutos() {
    return this.get('/produtos');
  }

  /**
   * Novo método para buscar produtos com paginação.
   *
   * Esse método será usado pelo Sync.
   *
   * Parâmetros:
   * - page: número da página
   * - limit: quantidade de registros por página
   */
  async getProducts(params?: {
    page?: number;
    limit?: number;
    criterio?: string;
    dataAlteracaoInicial?: string; // formato: "YYYY-MM-DD HH:MM:SS"
  }): Promise<BlingProductsResponse> {
    return this.get('/produtos', {
      pagina: params?.page ?? 1,
      limite: params?.limit ?? 100,
      criterio: params?.criterio,
      dataAlteracaoInicial: params?.dataAlteracaoInicial,
    });
  }

  async getCategories(params?: {
    page?: number;
    limit?: number;
  }): Promise<BlingCategoriesResponse> {
    return this.get('/categorias/produtos', {
      pagina: params?.page ?? 1,
      limite: params?.limit ?? 100,
    });
  }

}
export const blingApiService = new BlingApiService();