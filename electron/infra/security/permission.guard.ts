import db from "../database/db";
import { getCurrentSession } from "../session/session.store";
import { getPermissionDeniedMessage, hasPermission, type Permission } from "../../../src/types/permissions";

type CurrentUserRow = {
  id: number;
  nome: string;
  funcao: string | null;
  ativo: number;
};

function getCurrentUser(): CurrentUserRow | null {
  const sessionId = getCurrentSession();
  if (!sessionId) return null;

  const user = db.prepare(`
    SELECT u.id, u.nome, u.funcao, u.ativo
    FROM sessions s
    INNER JOIN usuarios u ON u.id = s.user_id
    WHERE s.id = ?
      AND s.active = 1
    LIMIT 1
  `).get(sessionId) as CurrentUserRow | undefined;

  return user ?? null;
}

export function assertCurrentUserPermission(permission: Permission) {
  const user = getCurrentUser();

  if (!user || !user.ativo) {
    throw new Error("Sessão inválida ou usuário inativo.");
  }

  if (!hasPermission(user.funcao, permission)) {
    throw new Error(getPermissionDeniedMessage(permission));
  }

  return user;
}

export function currentUserHasPermission(permission: Permission) {
  const user = getCurrentUser();
  return Boolean(user && user.ativo && hasPermission(user.funcao, permission));
}
