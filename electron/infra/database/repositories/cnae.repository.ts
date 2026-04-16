import db from '../db';
import { Cnae } from '@/types/fiscal';

export async function getAllCnaes(): Promise<Cnae[]> {
  try {
    // Usamos o .all() do better-sqlite3 para pegar todos os registros
    // Ordenamos pela descrição para facilitar a leitura do usuário no select
    const stmt = db.prepare(`
      SELECT codigo, denominacao 
      FROM cnaes 
      ORDER BY denominacao ASC
    `);

    const cnaes = stmt.all() as Cnae[];
    
    return cnaes;
  } catch (error) {
    console.error("Erro ao ler tabela CNAE:", error);
    return [];
  }
}

