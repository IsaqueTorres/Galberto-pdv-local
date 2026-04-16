/**
 * sleep.ts
 * ---------------------------------------------------------------------
 * Utilitário para controle de tempo entre execuções (delay).
 *
 * Contexto:
 * A API do Bling possui limite de requisições:
 * - ~3 requisições por segundo
 *
 * Se esse limite for excedido:
 * - Retorna erro 429 (Too Many Requests)
 * - Pode bloquear temporariamente a integração
 *
 * Este util é usado para criar um "throttle" simples,
 * garantindo que o sistema respeite o rate limit da API.
 *
 * Exemplo de uso:
 * await sleep(350);
 *
 * Isso mantém aproximadamente:
 * ~3 requisições por segundo
 *
 * Onde é usado:
 * - BlingHttpClient (entre chamadas de API)
 * - Loops de paginação (importação inicial)
 * - Sync incremental
 *
 * Sem isso:
 * - Requisições são disparadas muito rápido
 * - A API começa a falhar
 * - O sync fica instável
 *
 * Futuro:
 * Pode ser substituído por um rate limiter mais avançado,
 * mas atualmente resolve o problema de forma simples e eficiente.
 */

export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}