import http from 'node:http';
import { URL } from 'node:url';
import { shell } from 'electron';
import { generateRandomState, toBasicAuth } from '../../lib/crypto';
import { getBlingAppConfig } from './bling-app.config';
import {
  integrationRepository,
  StoredIntegrationToken,
} from '../../infra/database/repositories/integration.repository';


type BlingTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

type BlingStatus = {
  connected: boolean;
  expiresAt?: string | null;
};

const BLING_AUTHORIZE_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize';
const BLING_TOKEN_URL = 'https://api.bling.com.br/Api/v3/oauth/token';
const BLING_REVOKE_URL = 'https://api.bling.com.br/oauth/revoke';

function parseRedirectUri(redirectUri: string) {
  const url = new URL(redirectUri);

  if (url.protocol !== 'http:') {
    throw new Error(
      'Para callback local no Electron, use redirect URI no formato http://127.0.0.1:PORT/callback/bling'
    );
  }

  return {
    hostname: url.hostname,
    port: Number(url.port),
    pathname: url.pathname,
  };
}

export class BlingOAuthService {
  async getStatus(): Promise<BlingStatus> {
    const saved = integrationRepository.getByIntegrationId('bling');

    if (!saved) {
      return {
        connected: false,
        expiresAt: null,
      };
    }

    try {
      await this.getValidAccessToken();

      const refreshed = integrationRepository.getByIntegrationId('bling');

      return {
        connected: true,
        expiresAt: refreshed?.expiresAt ?? null,
      };
    } catch (error) {
      console.error('[BlingOAuthService.getStatus]', error);

      return {
        connected: false,
        expiresAt: saved.expiresAt,
      };
    }
  }

  async connect(): Promise<{ success: boolean; message: string }> {
    const { clientId, redirectUri } = getBlingAppConfig();

    const state = generateRandomState(24);

    const code = await this.requestAuthorizationCode({
      clientId,
      redirectUri,
      state,
    });

    await this.exchangeCodeForToken(code);

    return {
      success: true,
      message: 'Bling conectado com sucesso.',
    };
  }

  async disconnect(): Promise<{ success: boolean; message: string }> {
    const { clientId, clientSecret } = getBlingAppConfig();
    const saved = integrationRepository.getByIntegrationId('bling');

    if (!saved) {
      return {
        success: true,
        message: 'Bling já estava desconectado.',
      };
    }

    try {
      const body = new URLSearchParams({
        token: saved.refreshToken,
      });

      await fetch(BLING_REVOKE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${toBasicAuth(clientId, clientSecret)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
      });
    } catch (error) {
      console.warn('[BlingOAuthService.disconnect] falha ao revogar remotamente:', error);
    }

    integrationRepository.delete('bling');

    return {
      success: true,
      message: 'Bling desconectado com sucesso.',
    };
  }

  async getValidAccessToken(): Promise<string> {
    const saved = integrationRepository.getByIntegrationId('bling');

    if (!saved) {
      throw new Error('Bling não está conectado.');
    }

    const expiresAtMs = new Date(saved.expiresAt).getTime();
    const expired = expiresAtMs <= Date.now() + 60_000;

    if (!expired) {
      return saved.accessToken;
    }

    await this.refreshAccessToken(saved.refreshToken);

    const refreshed = integrationRepository.getByIntegrationId('bling');

    if (!refreshed) {
      throw new Error('Falha ao renovar token do Bling.');
    }

    return refreshed.accessToken;
  }

  private async requestAuthorizationCode(params: {
    clientId: string;
    redirectUri: string;
    state: string;
  }): Promise<string> {
    const { hostname, port, pathname } = parseRedirectUri(params.redirectUri);

    const authorizeUrl = new URL(BLING_AUTHORIZE_URL);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('client_id', params.clientId);
    authorizeUrl.searchParams.set('state', params.state);
    authorizeUrl.searchParams.set('redirect_uri', params.redirectUri);

    return await new Promise<string>((resolve, reject) => {
      let finished = false;

      const cleanup = (server: http.Server, timeout: NodeJS.Timeout) => {
        clearTimeout(timeout);
        server.close();
      };

      const server = http.createServer((req, res) => {
        try {
          if (!req.url) {
            throw new Error('Callback sem URL.');
          }

          const callbackUrl = new URL(req.url, `http://${hostname}:${port}`);

          if (callbackUrl.pathname !== pathname) {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }

          const error = callbackUrl.searchParams.get('error');
          const code = callbackUrl.searchParams.get('code');
          const state = callbackUrl.searchParams.get('state');

          if (error) {
            res.statusCode = 400;
            res.end('Autorização recusada ou inválida.');

            if (!finished) {
              finished = true;
              cleanup(server, timeout);
              reject(new Error(`Bling retornou erro no callback: ${error}`));
            }
            return;
          }

          if (!code) {
            res.statusCode = 400;
            res.end('Authorization code não recebido.');

            if (!finished) {
              finished = true;
              cleanup(server, timeout);
              reject(new Error('Authorization code não recebido.'));
            }
            return;
          }

          if (state !== params.state) {
            res.statusCode = 400;
            res.end('State inválido.');

            if (!finished) {
              finished = true;
              cleanup(server, timeout);
              reject(new Error('State inválido no callback do Bling.'));
            }
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; padding: 24px;">
                <h2>Integração concluída</h2>
                <p>Você já pode fechar esta janela e voltar ao sistema.</p>
              </body>
            </html>
          `);

          if (!finished) {
            finished = true;
            cleanup(server, timeout);
            resolve(code);
          }
        } catch (error) {
          if (!finished) {
            finished = true;
            cleanup(server, timeout);
            reject(error instanceof Error ? error : new Error('Erro desconhecido no callback.'));
          }
        }
      });

      const timeout = setTimeout(() => {
        if (!finished) {
          finished = true;
          cleanup(server, timeout);
          reject(new Error('Tempo esgotado aguardando autorização do Bling.'));
        }
      }, 120_000);

      server.listen(port, hostname, async () => {
        try {
          await shell.openExternal(authorizeUrl.toString());
        } catch (error) {
          if (!finished) {
            finished = true;
            cleanup(server, timeout);
            reject(
              error instanceof Error
                ? error
                : new Error('Falha ao abrir navegador para autorização.')
            );
          }
        }
      });

      server.on('error', (error) => {
        if (!finished) {
          finished = true;
          cleanup(server, timeout);
          reject(error instanceof Error ? error : new Error('Erro ao iniciar servidor local.'));
        }
      });
    });
  }

  private async exchangeCodeForToken(code: string): Promise<void> {
    const { clientId, clientSecret, redirectUri } = getBlingAppConfig();

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(BLING_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${toBasicAuth(clientId, clientSecret)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'enable-jwt': '1',
      },
      body: body.toString(),
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Falha ao trocar code por token no Bling: ${response.status} - ${text}`);
    }

    const data = JSON.parse(text) as BlingTokenResponse;
    this.persistToken(data);
  }

  private async refreshAccessToken(refreshToken: string): Promise<void> {
    const { clientId, clientSecret } = getBlingAppConfig();

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(BLING_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${toBasicAuth(clientId, clientSecret)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'enable-jwt': '1',
      },
      body: body.toString(),
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Falha ao renovar token do Bling: ${response.status} - ${text}`);
    }

    const data = JSON.parse(text) as BlingTokenResponse;
    this.persistToken(data);
  }

  private persistToken(data: BlingTokenResponse): void {
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    const payload: StoredIntegrationToken = {
      integrationId: 'bling',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresAt,
      scope: data.scope ?? null,
      raw: data,
      updatedAt: new Date().toISOString(),
    };

    integrationRepository.save(payload);
  }
}

export const blingOAuthService = new BlingOAuthService();
