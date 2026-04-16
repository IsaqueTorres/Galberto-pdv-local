/**
 * time.ts
 * ---------------------------------------------------------------------
 * Utilitário central para manipulação de datas no sistema.
 *
 * Contexto:
 * O sistema usa SQLite, que não possui um tipo nativo robusto de datetime.
 * Por isso, todas as datas são armazenadas como string no formato ISO 8601.
 *
 * Exemplo:
 * 2026-04-07T14:32:10.123Z
 *
 * Por que ISO:
 * - Ordena corretamente como string
 * - Compatível com qualquer backend/API
 * - Evita problemas de timezone
 *
 * Funções:
 *
 * nowIso():
 * - Retorna a data/hora atual em formato ISO
 * - Usado em:
 *   - created_at
 *   - updated_at
 *   - last_synced_at
 *   - logs
 *
 * subtractMinutes():
 * - Subtrai minutos de uma data ISO
 * - Usado no sync incremental para criar "janela de segurança"
 *
 * Problema que resolve:
 * APIs podem ter delay, paginação ou diferenças de relógio.
 * Sem isso, você pode PERDER dados no sync.
 *
 * Estratégia:
 * Sempre buscar com uma margem (ex: -2 minutos)
 *
 * Regra de ouro:
 * É melhor duplicar registros (resolvido com upsert)
 * do que perder dados.
 */

export function nowIso(): string {
  return new Date().toISOString();
}

export function subtractMinutes(isoDate: string, minutes: number): string {
  const dt = new Date(isoDate);
  dt.setMinutes(dt.getMinutes() - minutes);
  return dt.toISOString();
}