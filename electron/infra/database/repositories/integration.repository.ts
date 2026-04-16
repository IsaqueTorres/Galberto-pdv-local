/**
 * IntegrationRepository
 * ---------------------------------------------------------------------
 * Responsável por persistir e recuperar os dados de autenticação (OAuth)
 * das integrações externas (ex: Bling).
 *
 * Este repository NÃO faz chamadas HTTP nem lógica de negócio.
 * Ele atua apenas como camada de acesso ao banco de dados (SQLite).
 *
 * Responsabilidades:
 * - Armazenar tokens (access_token, refresh_token)
 * - Atualizar tokens após refresh
 * - Recuperar credenciais de uma integração
 * - Verificar se uma integração está conectada
 * - Remover integração (desconectar)
 *
 * Estrutura esperada:
 * - Tabela: integrations
 * - Chave principal lógica: integration_id
 *
 * Importante:
 * - O campo `raw_json` pode armazenar o payload original retornado pela API
 * - O campo `expires_at` deve ser usado por serviços para controle de expiração
 *
 * NÃO é responsabilidade deste arquivo:
 * - Validar token
 * - Fazer refresh de token
 * - Chamar API da Bling
 *
 * Uso típico:
 * - Utilizado por serviços como:
 *   - BlingTokenService
 *   - BlingApiClient
 *
 * Padrão:
 * - Usa better-sqlite3 (sincrono)
 * - Exporta instância singleton
 */



import db from '../db';

export type StoredIntegrationToken = {
  integrationId: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
  scope?: string | null;
  raw?: unknown;
  updatedAt: string;
};

type IntegrationRow = {
  integration_id: string;
  access_token: string;
  refresh_token: string;
  token_type: string | null;
  expires_at: string;
  scope: string | null;
  raw_json: string | null;
  updated_at: string;
};

class IntegrationRepository {
  getByIntegrationId(integrationId: string): StoredIntegrationToken | null {
    const stmt = db.prepare(`
      SELECT
        integration_id,
        access_token,
        refresh_token,
        token_type,
        expires_at,
        scope,
        raw_json,
        updated_at
      FROM integrations
      WHERE integration_id = ?
    `);

    const row = stmt.get(integrationId) as IntegrationRow | undefined;

    if (!row) {
      return null;
    }

    return {
      integrationId: row.integration_id,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      tokenType: row.token_type ?? 'Bearer',
      expiresAt: row.expires_at,
      scope: row.scope,
      raw: row.raw_json ? JSON.parse(row.raw_json) : null,
      updatedAt: row.updated_at,
    };
  }

  save(token: StoredIntegrationToken): void {
    const stmt = db.prepare(`
      INSERT INTO integrations (
        integration_id,
        access_token,
        refresh_token,
        token_type,
        expires_at,
        scope,
        raw_json,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_id) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        token_type = excluded.token_type,
        expires_at = excluded.expires_at,
        scope = excluded.scope,
        raw_json = excluded.raw_json,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      token.integrationId,
      token.accessToken,
      token.refreshToken,
      token.tokenType,
      token.expiresAt,
      token.scope ?? null,
      token.raw ? JSON.stringify(token.raw) : null,
      token.updatedAt
    );
  }

  delete(integrationId: string): void {
    const stmt = db.prepare(`
      DELETE FROM integrations
      WHERE integration_id = ?
    `);

    stmt.run(integrationId);
  }

  isConnected(integrationId: string): boolean {
    const stmt = db.prepare(`
      SELECT 1
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `);

    const row = stmt.get(integrationId);
    return !!row;
  }
}

export const integrationRepository = new IntegrationRepository();