import db from "./infra/database/db";

export function encerrarSessao(sessionId: number) {
  db.prepare(`
    UPDATE sessions
    SET active = 0,
        logout_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(sessionId);
}
