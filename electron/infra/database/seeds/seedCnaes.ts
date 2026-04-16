import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funcao que realiza o seed de cnaes caso o db esteja vazio
export function seedCnaes(db: any) {
  // 1️⃣ Verifica se já existe registro
  const count = db.prepare("SELECT COUNT(*) as total FROM cnaes").get() as { total: number };

  if (count.total > 0) {
    console.log("CNAEs já cadastrados. Seed ignorado.");
    return;
  }

  console.log("Iniciando seed de CNAEs...");

  // 2️⃣ Lê o CSV
  const filePath = path.join(__dirname, "../electron/infra/database/seeds/files/cnaes-1.csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const lines = fileContent.split(/\r?\n/).slice(1); // ignora header


  const insert = db.prepare(`
    INSERT INTO cnaes 
    (codigo, secao, divisao, grupo, classe, denominacao, ativo)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  const insertMany = db.transaction((rows: string[][]) => {
    for (const row of rows) {
      insert.run(
        row[3], // codigo
        row[0], // secao
        row[1], // divisao
        row[2], // grupo
        row[3], // classe
        row[4]  // denominacao
      );
    }
  });

  const parsedRows = lines
    .filter(line => line.trim() !== "")
    .map(line => line.split("%"));
  insertMany(parsedRows);

  for (const row of parsedRows) {
    if (!row[3]) {
      console.log("LINHA COM PROBLEMA:", row);
    }
  }

  console.log("Seed de CNAEs concluído.");
}

