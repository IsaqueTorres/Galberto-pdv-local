import crypto from "crypto";
import db from "./infra/database/db";

type AuthUserRow = {
  id: number;
  nome: string;
  funcao: string;
  email: string;
  username: string;
  password: string;
  ativo: number;
};

export function hashSenha(senha: string): string {
  return crypto
    .createHash("sha256")
    .update(senha)
    .digest("hex");
}

export function compareSenha(
  senhaDigitada: string,
  hashBanco: string
): boolean {
  return hashSenha(senhaDigitada) === hashBanco;
}

// Autentica o usuario e ja inicia sessao
export function autenticarUsuario(username: string, password: string) {
  const user = db.prepare(`
    SELECT id, nome, funcao, email, username, password, ativo
    FROM usuarios
    WHERE username = ?
    LIMIT 1
  `).get(username) as AuthUserRow | undefined;

  // Valida se o usuario existe
  if (!user) {
    throw new Error("Usuário inválido");
  }
  // Valida a senha
  if (!compareSenha(password, user.password)) {
    throw new Error("Senha inválida");
  }
  //Valida se esta ativo = true
  if (!user.ativo) {
    throw new Error("Usuário desabilitado");
  }

  // 🔐 Transação garante integridade
  const sessionId = db.transaction(() => {

    // Fecha sessões ativas anteriores
    db.prepare(`
      UPDATE sessions
      SET active = 0,
          logout_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND active = 1
    `).run(user.id);

    // Cria nova sessão
    const result = db.prepare(`
      INSERT INTO sessions (user_id)
      VALUES (?)
    `).run(user.id);

    return Number(result.lastInsertRowid);

  })();

  return {
    id: user.id,
    nome: user.nome,
    role: user.funcao,
    email: user.email,
    login: user.username,
    sessionId
};
}







