/**
 * id.ts
 * ---------------------------------------------------------------------
 * Responsável por gerar identificadores únicos (UUID) para entidades locais.
 *
 * Contexto:
 * No sistema existem dois tipos de ID:
 * - id (local): gerado pelo sistema (UUID)
 * - external_id: vindo do ERP (ex: Bling)
 *
 * Este util garante que todos os registros locais tenham IDs únicos,
 * independentes do banco ou do ERP.
 *
 * Por que usar UUID:
 * - Funciona offline (não depende do banco)
 * - Evita colisões
 * - Permite criar registros antes de persistir
 * - Facilita sincronização futura entre sistemas
 *
 * Onde é usado:
 * - products.id
 * - sync_logs.id
 * - sync_state.id
 * - (futuro) sales, sync_queue, etc
 *
 * Regra importante:
 * NUNCA misturar id (local) com external_id (ERP)
 */

import crypto from 'node:crypto';

export function randomId(): string {
  return crypto.randomUUID();
}