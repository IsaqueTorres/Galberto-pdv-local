var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, ipcMain, BrowserWindow, shell, dialog } from "electron";
import * as fs$2 from "fs";
import fs__default from "fs";
import path$2 from "path";
import require$$2 from "os";
import require$$3 from "crypto";
import * as fs$1 from "node:fs";
import * as path$1 from "node:path";
import path__default from "node:path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { execFileSync } from "node:child_process";
import crypto$1, { X509Certificate } from "node:crypto";
import * as https from "node:https";
import http from "node:http";
import { URL as URL$1 } from "node:url";
var main = { exports: {} };
const fs = fs__default;
const path = path$2;
const os = require$$2;
const crypto = require$$3;
const TIPS = [
  "◈ encrypted .env [www.dotenvx.com]",
  "◈ secrets for agents [www.dotenvx.com]",
  "⌁ auth for agents [www.vestauth.com]",
  "⌘ custom filepath { path: '/custom/path/.env' }",
  "⌘ enable debugging { debug: true }",
  "⌘ override existing { override: true }",
  "⌘ suppress logs { quiet: true }",
  "⌘ multiple files { path: ['.env.local', '.env'] }"
];
function _getRandomTip() {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}
function parseBoolean(value) {
  if (typeof value === "string") {
    return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
  }
  return Boolean(value);
}
function supportsAnsi() {
  return process.stdout.isTTY;
}
function dim(text) {
  return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
}
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function parse(src) {
  const obj = {};
  let lines = src.toString();
  lines = lines.replace(/\r\n?/mg, "\n");
  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
    let value = match[2] || "";
    value = value.trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }
    obj[key] = value;
  }
  return obj;
}
function _parseVault(options2) {
  options2 = options2 || {};
  const vaultPath = _vaultPath(options2);
  options2.path = vaultPath;
  const result = DotenvModule.configDotenv(options2);
  if (!result.parsed) {
    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
    err.code = "MISSING_DATA";
    throw err;
  }
  const keys = _dotenvKey(options2).split(",");
  const length = keys.length;
  let decrypted;
  for (let i = 0; i < length; i++) {
    try {
      const key = keys[i].trim();
      const attrs = _instructions(result, key);
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
      break;
    } catch (error) {
      if (i + 1 >= length) {
        throw error;
      }
    }
  }
  return DotenvModule.parse(decrypted);
}
function _warn(message) {
  console.error(`⚠ ${message}`);
}
function _debug(message) {
  console.log(`┆ ${message}`);
}
function _log(message) {
  console.log(`◇ ${message}`);
}
function _dotenvKey(options2) {
  if (options2 && options2.DOTENV_KEY && options2.DOTENV_KEY.length > 0) {
    return options2.DOTENV_KEY;
  }
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY;
  }
  return "";
}
function _instructions(result, dotenvKey) {
  let uri;
  try {
    uri = new URL(dotenvKey);
  } catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    throw error;
  }
  const key = uri.password;
  if (!key) {
    const err = new Error("INVALID_DOTENV_KEY: Missing key part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environment = uri.searchParams.get("environment");
  if (!environment) {
    const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey];
  if (!ciphertext) {
    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
    err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
    throw err;
  }
  return { ciphertext, key };
}
function _vaultPath(options2) {
  let possibleVaultPath = null;
  if (options2 && options2.path && options2.path.length > 0) {
    if (Array.isArray(options2.path)) {
      for (const filepath of options2.path) {
        if (fs.existsSync(filepath)) {
          possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
        }
      }
    } else {
      possibleVaultPath = options2.path.endsWith(".vault") ? options2.path : `${options2.path}.vault`;
    }
  } else {
    possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
  }
  if (fs.existsSync(possibleVaultPath)) {
    return possibleVaultPath;
  }
  return null;
}
function _resolveHome(envPath) {
  return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
}
function _configVault(options2) {
  const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options2 && options2.debug);
  const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options2 && options2.quiet);
  if (debug || !quiet) {
    _log("loading env from encrypted .env.vault");
  }
  const parsed = DotenvModule._parseVault(options2);
  let processEnv = process.env;
  if (options2 && options2.processEnv != null) {
    processEnv = options2.processEnv;
  }
  DotenvModule.populate(processEnv, parsed, options2);
  return { parsed };
}
function configDotenv(options2) {
  const dotenvPath = path.resolve(process.cwd(), ".env");
  let encoding = "utf8";
  let processEnv = process.env;
  if (options2 && options2.processEnv != null) {
    processEnv = options2.processEnv;
  }
  let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options2 && options2.debug);
  let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options2 && options2.quiet);
  if (options2 && options2.encoding) {
    encoding = options2.encoding;
  } else {
    if (debug) {
      _debug("no encoding is specified (UTF-8 is used by default)");
    }
  }
  let optionPaths = [dotenvPath];
  if (options2 && options2.path) {
    if (!Array.isArray(options2.path)) {
      optionPaths = [_resolveHome(options2.path)];
    } else {
      optionPaths = [];
      for (const filepath of options2.path) {
        optionPaths.push(_resolveHome(filepath));
      }
    }
  }
  let lastError;
  const parsedAll = {};
  for (const path2 of optionPaths) {
    try {
      const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
      DotenvModule.populate(parsedAll, parsed, options2);
    } catch (e) {
      if (debug) {
        _debug(`failed to load ${path2} ${e.message}`);
      }
      lastError = e;
    }
  }
  const populated = DotenvModule.populate(processEnv, parsedAll, options2);
  debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
  quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
  if (debug || !quiet) {
    const keysCount = Object.keys(populated).length;
    const shortPaths = [];
    for (const filePath of optionPaths) {
      try {
        const relative = path.relative(process.cwd(), filePath);
        shortPaths.push(relative);
      } catch (e) {
        if (debug) {
          _debug(`failed to load ${filePath} ${e.message}`);
        }
        lastError = e;
      }
    }
    _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`// tip: ${_getRandomTip()}`)}`);
  }
  if (lastError) {
    return { parsed: parsedAll, error: lastError };
  } else {
    return { parsed: parsedAll };
  }
}
function config(options2) {
  if (_dotenvKey(options2).length === 0) {
    return DotenvModule.configDotenv(options2);
  }
  const vaultPath = _vaultPath(options2);
  if (!vaultPath) {
    _warn(`you set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}`);
    return DotenvModule.configDotenv(options2);
  }
  return DotenvModule._configVault(options2);
}
function decrypt(encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), "hex");
  let ciphertext = Buffer.from(encrypted, "base64");
  const nonce = ciphertext.subarray(0, 12);
  const authTag = ciphertext.subarray(-16);
  ciphertext = ciphertext.subarray(12, -16);
  try {
    const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
    aesgcm.setAuthTag(authTag);
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
  } catch (error) {
    const isRange = error instanceof RangeError;
    const invalidKeyLength = error.message === "Invalid key length";
    const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
    if (isRange || invalidKeyLength) {
      const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    } else if (decryptionFailed) {
      const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      err.code = "DECRYPTION_FAILED";
      throw err;
    } else {
      throw error;
    }
  }
}
function populate(processEnv, parsed, options2 = {}) {
  const debug = Boolean(options2 && options2.debug);
  const override = Boolean(options2 && options2.override);
  const populated = {};
  if (typeof parsed !== "object") {
    const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    err.code = "OBJECT_REQUIRED";
    throw err;
  }
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key];
        populated[key] = parsed[key];
      }
      if (debug) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`);
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`);
        }
      }
    } else {
      processEnv[key] = parsed[key];
      populated[key] = parsed[key];
    }
  }
  return populated;
}
const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse,
  populate
};
main.exports.configDotenv = DotenvModule.configDotenv;
main.exports._configVault = DotenvModule._configVault;
main.exports._parseVault = DotenvModule._parseVault;
main.exports.config = DotenvModule.config;
main.exports.decrypt = DotenvModule.decrypt;
main.exports.parse = DotenvModule.parse;
main.exports.populate = DotenvModule.populate;
main.exports = DotenvModule;
var mainExports = main.exports;
const options = {};
if (process.env.DOTENV_CONFIG_ENCODING != null) {
  options.encoding = process.env.DOTENV_CONFIG_ENCODING;
}
if (process.env.DOTENV_CONFIG_PATH != null) {
  options.path = process.env.DOTENV_CONFIG_PATH;
}
if (process.env.DOTENV_CONFIG_QUIET != null) {
  options.quiet = process.env.DOTENV_CONFIG_QUIET;
}
if (process.env.DOTENV_CONFIG_DEBUG != null) {
  options.debug = process.env.DOTENV_CONFIG_DEBUG;
}
if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
  options.override = process.env.DOTENV_CONFIG_OVERRIDE;
}
if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
  options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
}
var envOptions = options;
const re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
var cliOptions = function optionMatcher(args) {
  const options2 = args.reduce(function(acc, cur) {
    const matches = cur.match(re);
    if (matches) {
      acc[matches[1]] = matches[2];
    }
    return acc;
  }, {});
  if (!("quiet" in options2)) {
    options2.quiet = "true";
  }
  return options2;
};
(function() {
  mainExports.config(
    Object.assign(
      {},
      envOptions,
      cliOptions(process.argv)
    )
  );
})();
const logDir = path$2.join(app.getPath("userData"), "logs");
if (!fs__default.existsSync(logDir)) {
  fs__default.mkdirSync(logDir, { recursive: true });
}
function writeLog(level, message) {
  const date = /* @__PURE__ */ new Date();
  const dateISO = date.toLocaleString("sv-SE", {
    timeZone: "America/Sao_Paulo"
  }).replace(" ", "T");
  const line = `${dateISO} [${level}] ${message}
`;
  const fileName = `${dateISO.slice(0, 10)}.log`;
  const filePath = path$2.join(logDir, fileName);
  fs__default.appendFileSync(filePath, line, { encoding: "utf-8" });
}
const logger = {
  info: (msg) => writeLog("INFO", msg),
  warn: (msg) => writeLog("WARN", msg),
  error: (msg) => writeLog("ERROR", msg)
};
function hashSenha(senha) {
  return require$$3.createHash("sha256").update(senha).digest("hex");
}
function compareSenha(senhaDigitada, hashBanco) {
  return hashSenha(senhaDigitada) === hashBanco;
}
function autenticarUsuario(username, password) {
  const user = db.prepare(`
    SELECT id, nome, funcao, email, username, password, ativo
    FROM usuarios
    WHERE username = ?
    LIMIT 1
  `).get(username);
  if (!user) {
    throw new Error("Usuário inválido");
  }
  if (!compareSenha(password, user.password)) {
    throw new Error("Senha inválida");
  }
  if (!user.ativo) {
    throw new Error("Usuário desabilitado");
  }
  const sessionId = db.transaction(() => {
    db.prepare(`
      UPDATE sessions
      SET active = 0,
          logout_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND active = 1
    `).run(user.id);
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
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$3 = path$2.dirname(__filename$1);
function seedCnaes(db2) {
  const count = db2.prepare("SELECT COUNT(*) as total FROM cnaes").get();
  if (count.total > 0) {
    console.log("CNAEs já cadastrados. Seed ignorado.");
    return;
  }
  console.log("Iniciando seed de CNAEs...");
  const filePath = path$2.join(__dirname$3, "../electron/infra/database/seeds/files/cnaes-1.csv");
  const fileContent = fs__default.readFileSync(filePath, "utf-8");
  const lines = fileContent.split(/\r?\n/).slice(1);
  const insert = db2.prepare(`
    INSERT INTO cnaes 
    (codigo, secao, divisao, grupo, classe, denominacao, ativo)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  const insertMany = db2.transaction((rows) => {
    for (const row of rows) {
      insert.run(
        row[3],
        // codigo
        row[0],
        // secao
        row[1],
        // divisao
        row[2],
        // grupo
        row[3],
        // classe
        row[4]
        // denominacao
      );
    }
  });
  const parsedRows = lines.filter((line) => line.trim() !== "").map((line) => line.split("%"));
  insertMany(parsedRows);
  for (const row of parsedRows) {
    if (!row[3]) {
      console.log("LINHA COM PROBLEMA:", row);
    }
  }
  console.log("Seed de CNAEs concluído.");
}
const MIGRATION_ID = "2026-04-16-fiscal-persistence-v1";
function ensureMigrationsTable(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      executed_at TEXT NOT NULL
    );
  `);
}
function hasMigration(database, migrationId) {
  const row = database.prepare(`SELECT 1 FROM schema_migrations WHERE id = ? LIMIT 1`).get(migrationId);
  return Boolean(row);
}
function hasColumn(database, table, column) {
  const rows = database.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some((row) => row.name === column);
}
function executeMigration(database) {
  const transaction = database.transaction(() => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        legal_name TEXT NOT NULL,
        cnpj TEXT NOT NULL UNIQUE,
        state_registration TEXT NOT NULL,
        tax_regime_code TEXT NOT NULL,
        environment TEXT NOT NULL CHECK (environment IN ('homologation', 'production')),
        csc_id TEXT,
        csc_token TEXT,
        default_series INTEGER NOT NULL DEFAULT 1,
        next_nfce_number INTEGER NOT NULL DEFAULT 1,
        address_street TEXT NOT NULL,
        address_number TEXT NOT NULL,
        address_neighborhood TEXT NOT NULL,
        address_city TEXT NOT NULL,
        address_state TEXT NOT NULL,
        address_zip_code TEXT NOT NULL,
        address_city_ibge_code TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_id INTEGER NOT NULL,
        customer_id TEXT,
        customer_name TEXT,
        customer_document TEXT,
        status TEXT NOT NULL CHECK (status IN ('OPEN', 'PAID', 'CANCELLED')) DEFAULT 'OPEN',
        subtotal_amount REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        surcharge_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        change_amount REAL NOT NULL DEFAULT 0,
        external_reference TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS ux_sales_external_reference
      ON sales(external_reference);

      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id TEXT,
        sku TEXT,
        description TEXT NOT NULL,
        unit TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        gross_amount REAL NOT NULL,
        discount_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL,
        ncm TEXT,
        cfop TEXT,
        cest TEXT,
        origin_code TEXT,
        tax_snapshot_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        method TEXT NOT NULL,
        amount REAL NOT NULL,
        received_amount REAL NOT NULL DEFAULT 0,
        change_amount REAL NOT NULL DEFAULT 0,
        integration_reference TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS fiscal_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        model INTEGER NOT NULL DEFAULT 65 CHECK (model = 65),
        series INTEGER NOT NULL,
        number INTEGER NOT NULL,
        access_key TEXT,
        environment TEXT NOT NULL CHECK (environment IN ('homologation', 'production')),
        status TEXT NOT NULL,
        issued_datetime TEXT,
        xml TEXT,
        xml_signed TEXT,
        xml_authorized TEXT,
        xml_cancellation TEXT,
        protocol TEXT,
        receipt_number TEXT,
        qr_code_url TEXT,
        authorization_datetime TEXT,
        cancel_datetime TEXT,
        contingency_type TEXT,
        rejection_code TEXT,
        rejection_reason TEXT,
        danfe_path TEXT,
        provider TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id),
        UNIQUE (sale_id),
        UNIQUE (store_id, model, series, number, environment),
        UNIQUE (access_key)
      );

      CREATE TABLE IF NOT EXISTS fiscal_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fiscal_document_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        payload_json TEXT,
        response_json TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fiscal_document_id) REFERENCES fiscal_documents(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'DONE', 'FAILED')) DEFAULT 'PENDING',
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TEXT,
        last_error TEXT,
        idempotency_key TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sales_store_status
      ON sales(store_id, status, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id
      ON sale_items(sale_id);

      CREATE INDEX IF NOT EXISTS idx_payments_sale_id
      ON payments(sale_id);

      CREATE INDEX IF NOT EXISTS idx_fiscal_documents_status
      ON fiscal_documents(status, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_fiscal_documents_sale_store
      ON fiscal_documents(sale_id, store_id);

      CREATE INDEX IF NOT EXISTS idx_fiscal_events_document
      ON fiscal_events(fiscal_document_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_sync_queue_status_next
      ON sync_queue(status, next_attempt_at, created_at);

      CREATE INDEX IF NOT EXISTS idx_sync_queue_entity
      ON sync_queue(entity_type, entity_id, operation);
    `);
    database.exec(`
      INSERT INTO stores (
        code,
        name,
        legal_name,
        cnpj,
        state_registration,
        tax_regime_code,
        environment,
        csc_id,
        csc_token,
        default_series,
        next_nfce_number,
        address_street,
        address_number,
        address_neighborhood,
        address_city,
        address_state,
        address_zip_code,
        address_city_ibge_code,
        active,
        created_at,
        updated_at
      )
      SELECT
        'MAIN',
        nome_fantasia,
        razao_social,
        cnpj,
        inscricao_estadual,
        CAST(crt AS TEXT),
        CASE ambiente_emissao WHEN 1 THEN 'production' ELSE 'homologation' END,
        csc_id,
        csc_token,
        COALESCE(serie_nfce, 1),
        COALESCE(proximo_numero_nfce, 1),
        rua,
        numero,
        bairro,
        cidade,
        uf,
        cep,
        cod_municipio_ibge,
        ativo,
        COALESCE(created_at, CURRENT_TIMESTAMP),
        COALESCE(updated_at, CURRENT_TIMESTAMP)
      FROM company
      WHERE NOT EXISTS (SELECT 1 FROM stores)
      LIMIT 1;
    `);
    database.prepare(`INSERT INTO schema_migrations (id, executed_at) VALUES (?, CURRENT_TIMESTAMP)`).run(MIGRATION_ID);
  });
  transaction();
}
function ensureFiscalPersistenceColumns(database) {
  const statements = [];
  if (!hasColumn(database, "fiscal_documents", "issued_datetime")) {
    statements.push(`ALTER TABLE fiscal_documents ADD COLUMN issued_datetime TEXT`);
  }
  if (!hasColumn(database, "fiscal_documents", "xml_authorized")) {
    statements.push(`ALTER TABLE fiscal_documents ADD COLUMN xml_authorized TEXT`);
  }
  if (!hasColumn(database, "fiscal_documents", "xml_cancellation")) {
    statements.push(`ALTER TABLE fiscal_documents ADD COLUMN xml_cancellation TEXT`);
  }
  if (!hasColumn(database, "sync_queue", "result_json")) {
    statements.push(`ALTER TABLE sync_queue ADD COLUMN result_json TEXT`);
  }
  if (!hasColumn(database, "sync_queue", "locked_at")) {
    statements.push(`ALTER TABLE sync_queue ADD COLUMN locked_at TEXT`);
  }
  if (!hasColumn(database, "sync_queue", "locked_by")) {
    statements.push(`ALTER TABLE sync_queue ADD COLUMN locked_by TEXT`);
  }
  if (!hasColumn(database, "sync_queue", "processed_at")) {
    statements.push(`ALTER TABLE sync_queue ADD COLUMN processed_at TEXT`);
  }
  if (statements.length > 0) {
    database.exec(statements.join(";\n"));
  }
}
function runFiscalPersistenceMigrations(database) {
  ensureMigrationsTable(database);
  if (!hasMigration(database, MIGRATION_ID)) {
    executeMigration(database);
  }
  ensureFiscalPersistenceColumns(database);
}
const dbPath = path__default.join(app.getPath("userData"), "galberto.db");
console.log(" Criando/abrindo banco de dados em: ", dbPath);
const db = new Database(dbPath);
function enableForeignKeys() {
  db.exec("PRAGMA foreign_keys = ON;");
  logger.info("-> Foreign keys ativadas");
}
function createTableProducts() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    external_id TEXT,
    integration_source TEXT,
    sku TEXT,
    barcode TEXT,
    category_id TEXT,
    name TEXT NOT NULL,
    unit TEXT,
    sale_price_cents INTEGER NOT NULL DEFAULT 0,
    cost_price_cents INTEGER NOT NULL DEFAULT 0,
    current_stock REAL NOT NULL DEFAULT 0,
    minimum_stock REAL NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    remote_created_at TEXT,
    remote_updated_at TEXT,
    last_synced_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'synced',
    raw_json TEXT,
    ncm TEXT,
    origin TEXT,
    fixed_ipi_value_cents INTEGER,
    notes TEXT,
    situation TEXT,
    supplier_code TEXT,
    supplier_name TEXT,
    location TEXT,
    maximum_stock REAL,
    net_weight_kg REAL,
    gross_weight_kg REAL,
    packaging_barcode TEXT,
    width_cm REAL,
    height_cm REAL,
    depth_cm REAL,
    expiration_date TEXT,
    supplier_product_description TEXT,
    complementary_description TEXT,
    items_per_box REAL,
    is_variation INTEGER,
    production_type TEXT,
    ipi_tax_class TEXT,
    service_list_code TEXT,
    item_type TEXT,
    tags_group TEXT,
    tags TEXT,
    taxes_json TEXT,
    parent_code TEXT,
    integration_code TEXT,
    product_group TEXT,
    brand TEXT,
    cest TEXT,
    volumes REAL,
    short_description TEXT,
    cross_docking_days INTEGER,
    external_image_urls TEXT,
    external_link TEXT,
    supplier_warranty_months INTEGER,
    clone_parent_data INTEGER,
    product_condition TEXT,
    free_shipping INTEGER,
    fci_number TEXT,
    department TEXT,
    measurement_unit TEXT,
    purchase_price_cents INTEGER,
    icms_st_retention_base_cents INTEGER,
    icms_st_retention_value_cents INTEGER,
    icms_substitute_own_value_cents INTEGER,
    product_category_name TEXT,
    additional_info TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

    CREATE UNIQUE INDEX IF NOT EXISTS ux_products_integration_external
    ON products (integration_source, external_id);

  CREATE INDEX IF NOT EXISTS idx_products_name
    ON products (name);

  CREATE INDEX IF NOT EXISTS idx_products_sku
    ON products (sku);

  CREATE INDEX IF NOT EXISTS idx_products_barcode
    ON products (barcode);

  CREATE INDEX IF NOT EXISTS idx_products_category_id
    ON products (category_id);

  CREATE TABLE IF NOT EXISTS produtos (
    id TEXT PRIMARY KEY,
    internal_code TEXT,
    gtin TEXT,
    nome TEXT NOT NULL,
    marca TEXT,
    preco_custo REAL NOT NULL DEFAULT 0,
    preco_venda REAL NOT NULL DEFAULT 0,
    estoque_atual REAL NOT NULL DEFAULT 0,
    estoque_minimo REAL NOT NULL DEFAULT 0,
    unidade_medida TEXT,
    ncm TEXT,
    cfop TEXT,
    ativo INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_produtos_nome
    ON produtos (nome);

  CREATE INDEX IF NOT EXISTS idx_produtos_gtin
    ON produtos (gtin);
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'products' checada/criada");
}
function ensureProductsColumns() {
  const productColumnDefinitions = [
    `current_stock REAL NOT NULL DEFAULT 0`,
    `minimum_stock REAL NOT NULL DEFAULT 0`,
    `ncm TEXT`,
    `origin TEXT`,
    `fixed_ipi_value_cents INTEGER`,
    `notes TEXT`,
    `situation TEXT`,
    `supplier_code TEXT`,
    `supplier_name TEXT`,
    `location TEXT`,
    `maximum_stock REAL`,
    `net_weight_kg REAL`,
    `gross_weight_kg REAL`,
    `packaging_barcode TEXT`,
    `width_cm REAL`,
    `height_cm REAL`,
    `depth_cm REAL`,
    `expiration_date TEXT`,
    `supplier_product_description TEXT`,
    `complementary_description TEXT`,
    `items_per_box REAL`,
    `is_variation INTEGER`,
    `production_type TEXT`,
    `ipi_tax_class TEXT`,
    `service_list_code TEXT`,
    `item_type TEXT`,
    `tags_group TEXT`,
    `tags TEXT`,
    `taxes_json TEXT`,
    `parent_code TEXT`,
    `integration_code TEXT`,
    `product_group TEXT`,
    `brand TEXT`,
    `cest TEXT`,
    `volumes REAL`,
    `short_description TEXT`,
    `cross_docking_days INTEGER`,
    `external_image_urls TEXT`,
    `external_link TEXT`,
    `supplier_warranty_months INTEGER`,
    `clone_parent_data INTEGER`,
    `product_condition TEXT`,
    `free_shipping INTEGER`,
    `fci_number TEXT`,
    `department TEXT`,
    `measurement_unit TEXT`,
    `purchase_price_cents INTEGER`,
    `icms_st_retention_base_cents INTEGER`,
    `icms_st_retention_value_cents INTEGER`,
    `icms_substitute_own_value_cents INTEGER`,
    `product_category_name TEXT`,
    `additional_info TEXT`
  ];
  const columns = db.prepare(`PRAGMA table_info(products)`).all();
  const columnNames = new Set(columns.map((column) => column.name));
  for (const definition of productColumnDefinitions) {
    const [columnName] = definition.split(" ");
    if (!columnNames.has(columnName)) {
      db.exec(`ALTER TABLE products ADD COLUMN ${definition};`);
    }
  }
}
function syncLegacyProductsMirror() {
  db.exec(`
    INSERT OR REPLACE INTO produtos (
      id, internal_code, gtin, nome, marca, preco_custo, preco_venda,
      estoque_atual, estoque_minimo, unidade_medida, ncm, ativo, created_at, updated_at
    )
    SELECT
      p.id,
      p.sku,
      p.barcode,
      p.name,
      p.brand,
      p.cost_price_cents / 100.0,
      p.sale_price_cents / 100.0,
      p.current_stock,
      p.minimum_stock,
      COALESCE(p.measurement_unit, p.unit),
      p.ncm,
      p.active,
      COALESCE(prod.created_at, datetime('now')),
      datetime('now')
    FROM products p
    LEFT JOIN produtos prod ON prod.id = p.id;
  `);
}
function createTableCategories() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    external_id TEXT,
    integration_source TEXT,
    name TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    remote_created_at TEXT,
    remote_updated_at TEXT,
    last_synced_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'synced',
    raw_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

CREATE UNIQUE INDEX IF NOT EXISTS ux_categories_integration_external
  ON categories (integration_source, external_id);

CREATE INDEX IF NOT EXISTS idx_categories_name
  ON categories (name);
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'categories' checada/criada");
}
function createTableTaxProfile() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS tax_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      name TEXT NOT NULL UNIQUE,

      -- Regime / enquadramento fiscal do item
      regime_tributario TEXT NOT NULL CHECK (regime_tributario IN ('SIMPLES_NACIONAL', 'REGIME_NORMAL')),
      origin_code TEXT NOT NULL, -- 0..8 conforme tabela de origem da mercadoria

      -- Operação padrão
      cfop_padrao_saida_interna TEXT,
      cfop_padrao_saida_interestadual TEXT,

      -- ICMS
      csosn TEXT,                -- usar quando Simples Nacional
      icms_cst TEXT,             -- usar quando regime normal
      mod_bc_icms TEXT,
      red_bc_icms REAL DEFAULT 0,
      icms_aliquota REAL DEFAULT 0,
      icms_st INTEGER NOT NULL DEFAULT 0,
      mod_bc_icms_st TEXT,
      red_bc_icms_st REAL DEFAULT 0,
      icms_st_aliquota REAL DEFAULT 0,
      mva_st REAL DEFAULT 0,
      fcp_aliquota REAL DEFAULT 0,
      fcp_st_aliquota REAL DEFAULT 0,

      -- PIS / COFINS
      pis_cst TEXT NOT NULL,
      pis_aliquota REAL DEFAULT 0,
      cofins_cst TEXT NOT NULL,
      cofins_aliquota REAL DEFAULT 0,
      pis_cofins_monofasico INTEGER NOT NULL DEFAULT 0,

      -- Regras complementares
      cest_obrigatorio INTEGER NOT NULL DEFAULT 0,
      ativo INTEGER NOT NULL DEFAULT 1,

      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'tax_profiles' checada/criada");
}
function createTableFornecedores() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      razao_social TEXT NOT NULL,
      nome_fantasia TEXT,
      cnpj TEXT UNIQUE,
      cpf TEXT UNIQUE,
      ie TEXT,
      telefone TEXT,
      email TEXT,
      cep TEXT,
      rua TEXT,
      numero TEXT,
      complemento TEXT,
      bairro TEXT,
      cidade TEXT,
      estado TEXT,
      cod_municipio_ibge TEXT,
      observacao TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'fornecedores' checada/criada");
}
function createTableClientes() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    external_id TEXT,
    integration_source TEXT,
    customer_type TEXT, -- 'individual' | 'company'
    cpf TEXT,
    cnpj TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    remote_created_at TEXT,
    remote_updated_at TEXT,
    last_synced_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'synced',
    raw_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_integration_external
  ON customers (integration_source, external_id);

CREATE INDEX IF NOT EXISTS idx_customers_name
  ON customers (name);

CREATE INDEX IF NOT EXISTS idx_customers_cpf
  ON customers (cpf);

CREATE INDEX IF NOT EXISTS idx_customers_cnpj
  ON customers (cnpj);

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    cnpj TEXT UNIQUE,
    email TEXT,
    telefone TEXT,
    rua TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    ativo INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_clientes_nome
    ON clientes (nome);

  CREATE INDEX IF NOT EXISTS idx_clientes_cpf
    ON clientes (cpf);

  CREATE INDEX IF NOT EXISTS idx_clientes_cnpj
    ON clientes (cnpj);
  `;
  db.exec(sqlComand);
  logger.info("-> Created table customer");
}
function createTableCompany() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS company (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      -- Identificação da empresa
      nome_fantasia TEXT NOT NULL,
      razao_social TEXT NOT NULL,
      cnpj TEXT NOT NULL UNIQUE,
      inscricao_estadual TEXT NOT NULL,
      inscricao_municipal TEXT,
      indicador_ie INTEGER NOT NULL, -- 1,2,9
      crt INTEGER NOT NULL,           -- 1=SN, 2=SN excesso sublimite, 3=Regime normal
      cnae_principal TEXT NOT NULL,

      -- Endereço fiscal
      rua TEXT NOT NULL,
      numero TEXT NOT NULL,
      complemento TEXT,
      bairro TEXT NOT NULL,
      cidade TEXT NOT NULL,
      uf TEXT NOT NULL,
      cep TEXT NOT NULL,
      cod_municipio_ibge TEXT NOT NULL,
      pais_codigo TEXT NOT NULL DEFAULT '1058',
      pais_nome TEXT NOT NULL DEFAULT 'BRASIL',
      telefone TEXT,

      -- Ambiente / emissão
      ambiente_emissao INTEGER NOT NULL DEFAULT 2 CHECK (ambiente_emissao IN (1, 2)), -- 1=Produção, 2=Homologação
      serie_nfce INTEGER DEFAULT 1,
      proximo_numero_nfce INTEGER NOT NULL DEFAULT 1,
      serie_nfe INTEGER DEFAULT 1,
      proximo_numero_nfe INTEGER NOT NULL DEFAULT 1,

      -- CSC para NFC-e
      csc_id TEXT,
      csc_token TEXT,

      -- Certificado Digital
      cert_tipo TEXT CHECK (cert_tipo IN ('A1', 'A3')),
      cert_path TEXT,
      cert_password TEXT,
      cert_validade TEXT,

      ativo INTEGER NOT NULL DEFAULT 1,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'company' checada/criada");
}
function createTableVendas() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      cliente_id INTEGER,
      vendedor_id INTEGER,

      data_emissao TEXT NOT NULL,           -- dhEmi
      data_movimento TEXT,

      status TEXT NOT NULL DEFAULT 'ABERTA', -- ABERTA, FINALIZADA, CANCELADA

      natureza_operacao TEXT NOT NULL,
      modelo_documento INTEGER NOT NULL CHECK (modelo_documento IN (55, 65)),
      serie INTEGER NOT NULL,
      numero INTEGER NOT NULL,
      tipo_operacao INTEGER NOT NULL DEFAULT 1,      -- tpNF: 0=entrada,1=saida
      tipo_emissao INTEGER NOT NULL DEFAULT 1,       -- tpEmis: 1 normal, 9 contingência offline
      ambiente INTEGER NOT NULL CHECK (ambiente IN (1, 2)),
      finalidade_emissao INTEGER NOT NULL DEFAULT 1, -- finNFe
      consumidor_final INTEGER NOT NULL DEFAULT 1,   -- indFinal
      presenca_comprador INTEGER NOT NULL DEFAULT 1, -- indPres

      cliente_nome TEXT,
      cpf_cliente TEXT,
      cnpj_cliente TEXT,

      valor_produtos REAL NOT NULL DEFAULT 0,
      valor_desconto REAL NOT NULL DEFAULT 0,
      valor_frete REAL NOT NULL DEFAULT 0,
      valor_seguro REAL NOT NULL DEFAULT 0,
      valor_outras_despesas REAL NOT NULL DEFAULT 0,
      valor_icms REAL NOT NULL DEFAULT 0,
      valor_pis REAL NOT NULL DEFAULT 0,
      valor_cofins REAL NOT NULL DEFAULT 0,
      valor_total REAL NOT NULL DEFAULT 0,
      valor_troco REAL NOT NULL DEFAULT 0,

      observacao TEXT,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),

      UNIQUE (modelo_documento, serie, numero, ambiente)
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'vendas' checada/criada");
}
function createTableVendaItens() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS venda_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      venda_id INTEGER NOT NULL,
      produto_id TEXT NOT NULL,

      -- Snapshot comercial do item
      codigo_produto TEXT NOT NULL,             -- cProd
      nome_produto TEXT NOT NULL,               -- xProd

      gtin TEXT,                                -- cEAN
      gtin_tributavel TEXT,                     -- cEANTrib

      ncm TEXT NOT NULL,
      cfop TEXT NOT NULL,
      cest TEXT,

      unidade_comercial TEXT NOT NULL,          -- uCom
      quantidade_comercial REAL NOT NULL,       -- qCom
      valor_unitario_comercial REAL NOT NULL,   -- vUnCom

      unidade_tributavel TEXT NOT NULL,         -- uTrib
      quantidade_tributavel REAL NOT NULL,      -- qTrib
      valor_unitario_tributavel REAL NOT NULL,  -- vUnTrib

      ind_tot INTEGER NOT NULL DEFAULT 1,       -- entra no total da nota

      -- Totais
      valor_bruto REAL NOT NULL DEFAULT 0,
      valor_desconto REAL NOT NULL DEFAULT 0,
      valor_outros REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES products(id)
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'venda_itens' checada/criada");
}
function createTableSaleItemTaxSnapshot() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS sale_item_tax_snapshot (
      sale_item_id INTEGER PRIMARY KEY,

      -- Snapshot fiscal obrigatório do item
      origem TEXT NOT NULL,
      origin_code TEXT NOT NULL,
      ncm TEXT NOT NULL,
      cfop TEXT NOT NULL,
      cest TEXT,

      -- ICMS
      csosn TEXT,
      icms_cst TEXT,
      mod_bc_icms TEXT,
      base_calculo_icms REAL NOT NULL DEFAULT 0,
      red_bc_icms REAL NOT NULL DEFAULT 0,
      icms_aliquota REAL NOT NULL DEFAULT 0,
      icms_valor REAL NOT NULL DEFAULT 0,

      -- ICMS ST
      icms_st INTEGER NOT NULL DEFAULT 0,
      mod_bc_icms_st TEXT,
      base_calculo_icms_st REAL NOT NULL DEFAULT 0,
      mva_st REAL NOT NULL DEFAULT 0,
      red_bc_icms_st REAL NOT NULL DEFAULT 0,
      icms_st_aliquota REAL NOT NULL DEFAULT 0,
      icms_st_valor REAL NOT NULL DEFAULT 0,

      -- FCP
      fcp_aliquota REAL NOT NULL DEFAULT 0,
      fcp_valor REAL NOT NULL DEFAULT 0,
      fcp_st_aliquota REAL NOT NULL DEFAULT 0,
      fcp_st_valor REAL NOT NULL DEFAULT 0,

      -- PIS
      pis_cst TEXT NOT NULL,
      pis_base_calculo REAL NOT NULL DEFAULT 0,
      pis_aliquota REAL NOT NULL DEFAULT 0,
      pis_valor REAL NOT NULL DEFAULT 0,

      -- COFINS
      cofins_cst TEXT NOT NULL,
      cofins_base_calculo REAL NOT NULL DEFAULT 0,
      cofins_aliquota REAL NOT NULL DEFAULT 0,
      cofins_valor REAL NOT NULL DEFAULT 0,

      -- Tributação comercial / tributável
      utrib TEXT NOT NULL,
      qtrib REAL NOT NULL,
      vuntrib REAL NOT NULL,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (sale_item_id) REFERENCES venda_itens(id) ON DELETE CASCADE
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'sale_item_tax_snapshot' checada/criada");
}
function createTableVendaPagamento() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS venda_pagamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER NOT NULL,

      tpag TEXT NOT NULL,          -- 01,02,03,04,05,10,11,12,13,15,16,17,18,19,90,99
      valor REAL NOT NULL,
      descricao_outro TEXT,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'venda_pagamento' checada/criada");
}
function createTableDocumentosFiscais() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS documentos_fiscais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      venda_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,

      modelo INTEGER NOT NULL CHECK (modelo IN (55, 65)),
      serie INTEGER NOT NULL,
      numero INTEGER NOT NULL,
      ambiente INTEGER NOT NULL CHECK (ambiente IN (1, 2)),

      chave_acesso TEXT UNIQUE,
      protocolo_autorizacao TEXT,
      recibo_lote TEXT,

      status_sefaz TEXT NOT NULL DEFAULT 'PENDENTE', 
      -- PENDENTE, AUTORIZADA, REJEITADA, CANCELADA, INUTILIZADA, CONTINGENCIA

      codigo_status_sefaz TEXT,
      motivo_status_sefaz TEXT,

      tipo_emissao INTEGER NOT NULL DEFAULT 1, -- 1 normal / 9 contingência offline
      data_emissao TEXT NOT NULL,
      data_autorizacao TEXT,
      data_cancelamento TEXT,

      justificativa_contingencia TEXT,
      data_entrada_contingencia TEXT,

      justificativa_cancelamento TEXT,
      protocolo_cancelamento TEXT,

      xml_enviado TEXT,
      xml_autorizado TEXT,
      xml_cancelamento TEXT,

      danfe_path TEXT,
      qr_code_url TEXT,
      digest_value TEXT,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES company(id),

      UNIQUE (modelo, serie, numero, ambiente, company_id)
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela legada 'documentos_fiscais' checada/criada");
}
function createTablePrinters() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS printers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      display_name TEXT,
      brand TEXT,
      model TEXT,
      manufacturer TEXT,
      connection_type TEXT,
      ip_address TEXT,
      usb_port TEXT,
      driver_name TEXT,
      driver_version TEXT,
      photo_path TEXT,
      paper_width_mm REAL NOT NULL DEFAULT 80,
      content_width_mm REAL NOT NULL DEFAULT 76,
      base_font_size_px REAL NOT NULL DEFAULT 13,
      line_height REAL NOT NULL DEFAULT 1.5,
      receipt_settings_json TEXT,
      is_default INTEGER DEFAULT 0,
      installed_at TEXT,
      notes TEXT
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'printers' checada/criada");
}
function ensurePrintersColumns() {
  try {
    db.exec(`ALTER TABLE printers ADD COLUMN paper_width_mm REAL NOT NULL DEFAULT 80`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE printers ADD COLUMN content_width_mm REAL NOT NULL DEFAULT 76`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE printers ADD COLUMN base_font_size_px REAL NOT NULL DEFAULT 13`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE printers ADD COLUMN line_height REAL NOT NULL DEFAULT 1.5`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE printers ADD COLUMN receipt_settings_json TEXT`);
  } catch {
  }
}
function createTablePrinterLogs() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS printer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'printer_logs' checada/criada");
}
function createTableUsuarios() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      funcao TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1,
      foto_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'usuarios' checada/criada");
}
function createTableSession() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      logout_at DATETIME,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'sessions' checada/criada");
}
function createTableCnaes() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS cnaes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      secao TEXT NOT NULL,
      divisao TEXT NOT NULL,
      grupo TEXT NOT NULL,
      classe TEXT NOT NULL,
      subclasse TEXT,
      denominacao TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1,
      versao TEXT DEFAULT 'CNAE_2.0',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'cnaes' checada/criada");
}
function createTableStockMoviments() {
  const sqlComand = `CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  product_id TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('ENTRY', 'EXIT')),

  reason_code TEXT NOT NULL,
  reason_note TEXT,

  quantity REAL NOT NULL,
  stock_before REAL NOT NULL,
  stock_after REAL NOT NULL,

  unit_cost REAL,

  document_type TEXT,
  document_number TEXT,
  document_key TEXT,

  supplier_id INTEGER,
  batch_number TEXT,
  expiration_date TEXT,

  performed_by_user_id INTEGER NOT NULL,

  reversed_at DATETIME,
  reversed_by_user_id INTEGER,
  reversal_reason TEXT,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (supplier_id) REFERENCES fornecedores(id),
  FOREIGN KEY (performed_by_user_id) REFERENCES usuarios(id),
  FOREIGN KEY (reversed_by_user_id) REFERENCES usuarios(id)
);
`;
  logger.info("-> Tabela 'stock_movements' checada/criada");
  db.exec(sqlComand);
}
function createTableCashRegisterSessions() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS cash_register_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operator_id INTEGER NOT NULL,
      pdv_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
      opening_cash_amount REAL NOT NULL DEFAULT 0,
      closing_cash_amount REAL,
      expected_cash_amount REAL,
      closing_difference REAL,
      opening_notes TEXT,
      closing_notes TEXT,
      opened_at TEXT NOT NULL,
      closed_at TEXT
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'cash_register_sessions' checada/criada");
}
function ensureCashRegisterSessionsColumns() {
  try {
    db.exec(`ALTER TABLE cash_register_sessions ADD COLUMN expected_cash_amount REAL`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE cash_register_sessions ADD COLUMN closing_difference REAL`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE cash_register_sessions ADD COLUMN opening_notes TEXT`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE cash_register_sessions ADD COLUMN closing_notes TEXT`);
  } catch {
  }
}
function createTableCashRegisterMovements() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS cash_register_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cash_session_id INTEGER NOT NULL,
      operator_id INTEGER NOT NULL,
      pdv_id TEXT NOT NULL,
      movement_type TEXT NOT NULL CHECK (movement_type IN ('SANGRIA')),
      amount REAL NOT NULL CHECK (amount > 0),
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (cash_session_id) REFERENCES cash_register_sessions(id) ON DELETE CASCADE
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'cash_register_movements' checada/criada");
}
function ensureVendaPagamentoColumns() {
  try {
    db.exec(`ALTER TABLE venda_pagamento ADD COLUMN cash_session_id INTEGER REFERENCES cash_register_sessions(id)`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE venda_pagamento ADD COLUMN valor_recebido REAL NOT NULL DEFAULT 0`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE venda_pagamento ADD COLUMN troco REAL NOT NULL DEFAULT 0`);
  } catch {
  }
}
function createTableIntegrations() {
  try {
    const sqlComand = `
      CREATE TABLE IF NOT EXISTS integrations (
        integration_id TEXT PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        token_type TEXT,
        expires_at TEXT NOT NULL,
        scope TEXT,
        raw_json TEXT,
        updated_at TEXT NOT NULL
      );
    `;
    console.log("Criando tabela integrations...");
    db.exec(sqlComand);
    console.log("Tabela criada com sucesso!");
    const test = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", test);
  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
}
function createTablePrintedDocuments() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS printed_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_type TEXT NOT NULL CHECK (document_type IN ('SALE_RECEIPT', 'CASH_OPENING_RECEIPT', 'CASH_CLOSING_RECEIPT')),
      reference_type TEXT NOT NULL CHECK (reference_type IN ('SALE', 'CASH_SESSION')),
      reference_id INTEGER NOT NULL,
      sale_id INTEGER,
      cash_session_id INTEGER,
      printer_id INTEGER,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('PENDING', 'PRINTED', 'FAILED')),
      template_version TEXT NOT NULL DEFAULT 'thermal-v1',
      payload_json TEXT NOT NULL,
      content_html TEXT NOT NULL,
      print_count INTEGER NOT NULL DEFAULT 0,
      last_printed_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sale_id) REFERENCES vendas(id) ON DELETE CASCADE,
      FOREIGN KEY (cash_session_id) REFERENCES cash_register_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE SET NULL,
      UNIQUE(document_type, reference_type, reference_id)
    );

    CREATE INDEX IF NOT EXISTS idx_printed_documents_sale_id
      ON printed_documents (sale_id);

    CREATE INDEX IF NOT EXISTS idx_printed_documents_cash_session_id
      ON printed_documents (cash_session_id);
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'printed_documents' checada/criada");
}
function createTablePrintJobs() {
  const sqlComand = `
    CREATE TABLE IF NOT EXISTS print_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printed_document_id INTEGER NOT NULL,
      printer_id INTEGER,
      trigger_source TEXT NOT NULL CHECK (trigger_source IN ('AUTO', 'MANUAL')),
      status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'SKIPPED')),
      error_message TEXT,
      copies INTEGER NOT NULL DEFAULT 1,
      attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printed_document_id) REFERENCES printed_documents(id) ON DELETE CASCADE,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_print_jobs_document_id
      ON print_jobs (printed_document_id);

    CREATE INDEX IF NOT EXISTS idx_print_jobs_status
      ON print_jobs (status);
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'print_jobs' checada/criada");
}
function createTableSyncState() {
  try {
    const sqlComand = `
      CREATE TABLE IF NOT EXISTS sync_states (
          id TEXT PRIMARY KEY,
          integration_id TEXT NOT NULL,
          resource TEXT NOT NULL,
          last_sync_at TEXT,
          last_success_at TEXT,
          checkpoint_cursor TEXT, -- data/hora, cursor, ultimo id, etc
          status TEXT NOT NULL DEFAULT 'idle',
          error_message TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(integration_id, resource)
      );
    `;
    console.log("Criando tabela sync_state...");
    db.exec(sqlComand);
    console.log("Tabela criada com sucesso!");
    const test = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", test);
  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
}
function createTableSyncLogs() {
  try {
    const sqlComand = `
      CREATE TABLE IF NOT EXISTS sync_logs (
          id TEXT PRIMARY KEY,
          integration_id TEXT NOT NULL,
          resource TEXT NOT NULL,
          mode TEXT NOT NULL, -- initial | incremental
          status TEXT NOT NULL, -- running | success | failed
          started_at TEXT NOT NULL,
          finished_at TEXT,
          items_processed INTEGER NOT NULL DEFAULT 0,
          items_created INTEGER NOT NULL DEFAULT 0,
          items_updated INTEGER NOT NULL DEFAULT 0,
          items_failed INTEGER NOT NULL DEFAULT 0,
          error_message TEXT
      );
    `;
    console.log("Criando tabela sync_logs...");
    db.exec(sqlComand);
    console.log("Tabela criada com sucesso!");
    const test = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", test);
  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
}
createTableProducts();
ensureProductsColumns();
syncLegacyProductsMirror();
createTableCategories();
createTableClientes();
createTableUsuarios();
createTableFornecedores();
createTableVendas();
createTableVendaItens();
createTableCompany();
createTablePrinters();
ensurePrintersColumns();
createTablePrinterLogs();
createTableSession();
createTableCnaes();
seedCnaes(db);
createTableTaxProfile();
createTableSaleItemTaxSnapshot();
createTableStockMoviments();
createTableVendaPagamento();
ensureVendaPagamentoColumns();
createTableDocumentosFiscais();
createTableCashRegisterSessions();
ensureCashRegisterSessionsColumns();
createTableCashRegisterMovements();
createTableIntegrations();
createTableSyncState();
createTableSyncLogs();
createTablePrintedDocuments();
createTablePrintJobs();
runFiscalPersistenceMigrations(db);
function getSaleDefaults() {
  const company = db.prepare(`
    SELECT ambiente_emissao, serie_nfce
    FROM company
    WHERE ativo = 1
    LIMIT 1
  `).get();
  const ambiente = (company == null ? void 0 : company.ambiente_emissao) ?? 2;
  const serie = (company == null ? void 0 : company.serie_nfce) ?? 1;
  const nextNumberRow = db.prepare(`
    SELECT COALESCE(MAX(numero), 0) + 1 AS nextNumber
    FROM vendas
    WHERE modelo_documento = 65 AND serie = ? AND ambiente = ?
  `).get(serie, ambiente);
  return {
    ambiente,
    serie,
    numero: nextNumberRow.nextNumber,
    naturezaOperacao: "VENDA PDV",
    modeloDocumento: 65
  };
}
function getSaleItemSnapshot(productId) {
  const product = db.prepare(`
    SELECT id, barcode, name, unit, sale_price_cents
    FROM products
    WHERE id = ? AND deleted_at IS NULL
    LIMIT 1
  `).get(productId);
  if (!product) {
    throw new Error(`Produto não encontrado para venda: ${productId}`);
  }
  return {
    codigoProduto: product.barcode || product.id,
    nomeProduto: product.name,
    gtin: product.barcode,
    unidade: product.unit || "UN",
    precoUnitario: Number(product.sale_price_cents ?? 0) / 100,
    ncm: "",
    cfop: "5102",
    cest: null
  };
}
function replaceSaleItems(vendaId, itens) {
  db.prepare(`DELETE FROM venda_itens WHERE venda_id = ?`).run(vendaId);
  const insertItem = db.prepare(`
    INSERT INTO venda_itens(
      venda_id, produto_id, codigo_produto, nome_produto, gtin, gtin_tributavel,
      ncm, cfop, cest, unidade_comercial, quantidade_comercial, valor_unitario_comercial,
      unidade_tributavel, quantidade_tributavel, valor_unitario_tributavel,
      valor_bruto, valor_desconto, subtotal
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of itens) {
    const snapshot = getSaleItemSnapshot(item.produto_id);
    const quantidade = Number(item.quantidade ?? item.estoque_atual ?? 0);
    const precoUnitario = Number(item.preco_venda ?? snapshot.precoUnitario);
    const valorBruto = Number(item.valor_bruto ?? quantidade * precoUnitario);
    const valorDesconto = Math.max(0, Math.min(Number(item.valor_desconto ?? 0), valorBruto));
    const subtotal = Number(item.subtotal ?? Math.max(valorBruto - valorDesconto, 0));
    insertItem.run(
      vendaId,
      item.produto_id,
      snapshot.codigoProduto,
      item.nome ?? snapshot.nomeProduto,
      snapshot.gtin,
      snapshot.gtin,
      snapshot.ncm,
      snapshot.cfop,
      snapshot.cest,
      snapshot.unidade,
      quantidade,
      precoUnitario,
      snapshot.unidade,
      quantidade,
      precoUnitario,
      valorBruto,
      valorDesconto,
      subtotal
    );
  }
}
function salvarVendaPendente(venda, status, vendaId) {
  const saleDefaults = getSaleDefaults();
  const valorProdutos = Number(venda.valor_produtos ?? venda.total ?? 0);
  const valorDesconto = Number(venda.valor_desconto ?? 0);
  const valorTotal = Number(venda.total ?? 0);
  const transaction = db.transaction(() => {
    let persistedSaleId = vendaId ?? null;
    if (persistedSaleId) {
      db.prepare(`
        UPDATE vendas
        SET
          data_movimento = datetime('now'),
          status = ?,
          cpf_cliente = ?,
          cliente_nome = ?,
          valor_produtos = ?,
          valor_desconto = ?,
          valor_total = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        status,
        venda.cpf_cliente ?? null,
        venda.consumidor_identificado ? venda.cpf_cliente ?? null : "Consumidor final",
        valorProdutos,
        valorDesconto,
        valorTotal,
        persistedSaleId
      );
    } else {
      const result = db.prepare(`
        INSERT INTO vendas(
          data_emissao, data_movimento, status, natureza_operacao, modelo_documento,
          serie, numero, ambiente, cliente_nome, cpf_cliente, valor_produtos, valor_desconto, valor_total
        )
        VALUES(datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        status,
        saleDefaults.naturezaOperacao,
        saleDefaults.modeloDocumento,
        saleDefaults.serie,
        saleDefaults.numero,
        saleDefaults.ambiente,
        venda.consumidor_identificado ? venda.cpf_cliente ?? null : "Consumidor final",
        venda.cpf_cliente ?? null,
        valorProdutos,
        valorDesconto,
        valorTotal
      );
      persistedSaleId = result.lastInsertRowid;
    }
    replaceSaleItems(persistedSaleId, venda.itens);
    return persistedSaleId;
  });
  return transaction();
}
function mapPaymentTypeToFiscalCode(meioPagamento) {
  const paymentTypeMap = {
    DINHEIRO: "01",
    CHEQUE: "02",
    CREDITO: "03",
    DEBITO: "04",
    VOUCHER: "10",
    PIX: "17"
  };
  return paymentTypeMap[meioPagamento] ?? "99";
}
function getCashSessionSummaryById(sessionId) {
  const stmt = db.prepare(`
    SELECT
      s.id,
      s.operator_id,
      s.pdv_id,
      s.opening_cash_amount,
      s.closing_cash_amount,
      s.opened_at,
      s.closed_at,
      COALESCE((
        SELECT SUM(m.amount)
        FROM cash_register_movements m
        WHERE m.cash_session_id = s.id
          AND m.movement_type = 'SANGRIA'
      ), 0) AS total_sangrias,
      COALESCE((
        SELECT SUM(vp.valor)
        FROM venda_pagamento vp
        WHERE vp.cash_session_id = s.id
          AND vp.tpag = '01'
      ), 0) AS total_vendas_dinheiro
    FROM cash_register_sessions s
    WHERE s.id = ?
    LIMIT 1
  `);
  const session = stmt.get(sessionId);
  if (!session) {
    return null;
  }
  return {
    ...session,
    total_sangrias: Number(session.total_sangrias ?? 0),
    total_vendas_dinheiro: Number(session.total_vendas_dinheiro ?? 0),
    expected_cash_amount: Number(session.opening_cash_amount ?? 0) + Number(session.total_vendas_dinheiro ?? 0) - Number(session.total_sangrias ?? 0)
  };
}
function registrarPagamentoVenda(vendaId, paymentData) {
  if (!(paymentData == null ? void 0 : paymentData.meioPagamento)) {
    return;
  }
  const sale = db.prepare(`
    SELECT valor_total
    FROM vendas
    WHERE id = ?
    LIMIT 1
  `).get(vendaId);
  if (!sale) {
    throw new Error(`Venda não encontrada para registrar pagamento: ${vendaId}`);
  }
  db.prepare(`DELETE FROM venda_pagamento WHERE venda_id = ?`).run(vendaId);
  const valorVenda = Number(sale.valor_total ?? 0);
  const troco = Number(paymentData.troco ?? 0);
  const valorRecebido = paymentData.meioPagamento === "DINHEIRO" ? Number(paymentData.valorPago ?? valorVenda) : valorVenda;
  db.prepare(`
    INSERT INTO venda_pagamento(
      venda_id, cash_session_id, tpag, valor, valor_recebido, troco, descricao_outro
    )
    VALUES(?, ?, ?, ?, ?, ?, ?)
  `).run(
    vendaId,
    paymentData.cashSessionId ?? null,
    mapPaymentTypeToFiscalCode(paymentData.meioPagamento),
    valorVenda,
    valorRecebido,
    troco,
    null
  );
}
function cancelarVenda(venda) {
  db.prepare("BEGIN").run();
  try {
    const saleDefaults = getSaleDefaults();
    const valorProdutos = Number(venda.valor_produtos ?? venda.total ?? 0);
    const valorDesconto = Number(venda.valor_desconto ?? 0);
    const valorTotal = Number(venda.total ?? 0);
    const vendaResult = db.prepare(`
        INSERT INTO vendas(
          data_emissao, data_movimento, status, natureza_operacao, modelo_documento,
          serie, numero, ambiente, valor_produtos, valor_desconto, valor_total
        )
        VALUES(datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
      "CANCELADA",
      saleDefaults.naturezaOperacao,
      saleDefaults.modeloDocumento,
      saleDefaults.serie,
      saleDefaults.numero,
      saleDefaults.ambiente,
      valorProdutos,
      valorDesconto,
      valorTotal
    );
    const vendaId = vendaResult.lastInsertRowid;
    replaceSaleItems(vendaId, venda.itens);
    db.prepare("COMMIT").run();
    return { sucesso: true, vendaId };
  } catch (error) {
    db.prepare("ROLLBACK").run();
    throw error;
  }
}
function finalizarVendaComBaixaEstoque(vendaPayload) {
  const vendaId = typeof vendaPayload === "number" ? vendaPayload : vendaPayload.vendaId;
  const selectItens = db.prepare(
    `SELECT produto_id, quantidade_comercial AS quantidade
     FROM venda_itens
     WHERE venda_id = ? `
  );
  const selectSaldo = db.prepare(
    `SELECT current_stock
     FROM products
     WHERE id = ? AND deleted_at IS NULL
     LIMIT 1`
  );
  const atualizarEstoque = db.prepare(
    `UPDATE products
     SET current_stock = current_stock - ?,
         updated_at = datetime('now')
     WHERE id = ?`
  );
  const atualizarEstoqueLegado = db.prepare(
    `UPDATE produtos
     SET estoque_atual = estoque_atual - ?,
         updated_at = datetime('now')
     WHERE id = ?`
  );
  const buscarValoresVenda = db.prepare(
    `SELECT valor_produtos, valor_desconto, valor_total
     FROM vendas
     WHERE id = ?
     LIMIT 1`
  );
  const atualizarVenda = db.prepare(
    `UPDATE vendas
     SET status = 'FINALIZADA'
       , data_movimento = datetime('now')
       , valor_produtos = ?
       , valor_desconto = ?
       , valor_total = ?
       , valor_troco = ?
       , updated_at = datetime('now')
     WHERE id = ? `
  );
  const transaction = db.transaction(() => {
    const itens = selectItens.all(vendaId);
    const vendaAtual = buscarValoresVenda.get(vendaId);
    if (!vendaAtual) {
      throw new Error(`Venda não encontrada: ${vendaId}`);
    }
    for (const item of itens) {
      const saldo = selectSaldo.get(item.produto_id);
      if (!saldo) {
        throw new Error(`Produto da venda não encontrado: ${item.produto_id}`);
      }
      if (Number(saldo.current_stock ?? 0) < Number(item.quantidade ?? 0)) {
        throw new Error(`Estoque insuficiente para o produto ${item.produto_id}`);
      }
      atualizarEstoque.run(item.quantidade, item.produto_id);
      atualizarEstoqueLegado.run(item.quantidade, item.produto_id);
    }
    const valorProdutos = typeof vendaPayload === "number" ? Number(vendaAtual.valor_produtos ?? 0) : Number(vendaPayload.valorProdutos ?? vendaAtual.valor_produtos ?? 0);
    const valorDesconto = typeof vendaPayload === "number" ? Number(vendaAtual.valor_desconto ?? 0) : Number(vendaPayload.valorDesconto ?? vendaAtual.valor_desconto ?? 0);
    const valorTotal = typeof vendaPayload === "number" ? Number(vendaAtual.valor_total ?? 0) : Number(vendaPayload.valorTotal ?? vendaAtual.valor_total ?? 0);
    const valorTroco = typeof vendaPayload === "number" ? 0 : Number(vendaPayload.troco ?? 0);
    atualizarVenda.run(
      valorProdutos,
      valorDesconto,
      valorTotal,
      valorTroco,
      vendaId
    );
    registrarPagamentoVenda(
      vendaId,
      typeof vendaPayload === "number" ? void 0 : vendaPayload
    );
  });
  transaction();
}
function insertCashSession(data) {
  var _a;
  const stmt = db.prepare(`
    INSERT INTO cash_register_sessions
      (operator_id, pdv_id, status, opening_cash_amount, opening_notes, opened_at)
    VALUES(?, ?, 'OPEN', ?, ?, datetime('now'))
      `);
  const result = stmt.run(
    data.operator_id,
    data.pdv_id,
    data.opening_cash_amount,
    ((_a = data.opening_notes) == null ? void 0 : _a.trim()) || null
  );
  const session = getCashSessionSummaryById(result.lastInsertRowid);
  if (!session) {
    throw new Error("Sessão de caixa não encontrada após abertura.");
  }
  return session;
}
function registerCashWithdrawal(data) {
  var _a;
  const openSession = db.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE id = ?
      AND operator_id = ?
      AND pdv_id = ?
      AND status = 'OPEN'
    LIMIT 1
  `).get(data.cash_session_id, data.operator_id, data.pdv_id);
  if (!openSession) {
    throw new Error("Nenhum caixa aberto foi encontrado para registrar a sangria.");
  }
  const session = getCashSessionSummaryById(data.cash_session_id);
  if (!session) {
    throw new Error("Sessão de caixa inválida para sangria.");
  }
  const valorSangria = Number(data.amount ?? 0);
  if (valorSangria <= 0) {
    throw new Error("Informe um valor válido para a sangria.");
  }
  if (valorSangria > Number(session.expected_cash_amount ?? 0)) {
    throw new Error("A sangria não pode ser maior que o valor disponível em caixa.");
  }
  db.prepare(`
    INSERT INTO cash_register_movements(
      cash_session_id, operator_id, pdv_id, movement_type, amount, reason
    )
    VALUES(?, ?, ?, ?, ?, ?)
  `).run(
    data.cash_session_id,
    data.operator_id,
    data.pdv_id,
    data.movement_type,
    valorSangria,
    ((_a = data.reason) == null ? void 0 : _a.trim()) || null
  );
  const updatedSession = getCashSessionSummaryById(data.cash_session_id);
  if (!updatedSession) {
    throw new Error("Não foi possível recarregar a sessão após a sangria.");
  }
  return updatedSession;
}
function closeCashSession(data) {
  var _a;
  const stmt = db.prepare(`
    UPDATE cash_register_sessions
    SET
      status = 'CLOSED',
      closing_cash_amount = ?,
      expected_cash_amount = ?,
      closing_difference = ?,
      closing_notes = ?,
      closed_at = datetime('now')
      
    WHERE operator_id = ?
      AND pdv_id = ?
        AND status = 'OPEN'
          `);
  const result = stmt.run(
    data.closing_cash_amount,
    data.expected_cash_amount,
    data.difference,
    ((_a = data.closing_notes) == null ? void 0 : _a.trim()) || null,
    data.operator_id,
    data.pdv_id
  );
  if (result.changes === 0) {
    throw new Error("Nenhum caixa aberto foi encontrado para fechamento.");
  }
  const closedSession = db.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE operator_id = ?
      AND pdv_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(data.operator_id, data.pdv_id);
  if (!closedSession) {
    throw new Error("Sessão de caixa não encontrada após o fechamento.");
  }
  const summary = getCashSessionSummaryById(closedSession.id);
  if (!summary) {
    throw new Error("Resumo da sessão de caixa não encontrado após o fechamento.");
  }
  return summary;
}
function listarVendas({ venda_id, data, status, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];
  const statusMap = { 1: "FINALIZADA", 2: "CANCELADA", 3: "ABERTA_PAGAMENTO", 4: "ORCAMENTO", 5: "PAUSADA" };
  if (venda_id) {
    where.push("CAST(id AS TEXT) LIKE ?");
    params.push(`%${venda_id}%`);
  }
  if (data) {
    where.push("date(data_emissao) = date(?)");
    params.push(data);
  }
  if (status !== void 0) {
    where.push("status = ?");
    params.push(statusMap[status]);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")} ` : "";
  const stmt = db.prepare(`
    SELECT * FROM vendas
      ${whereClause}
      ORDER BY id DESC
    LIMIT ? OFFSET ?
      `).all(...params, limit, offset);
  const total = db.prepare(`
      SELECT COUNT(*) as total
      FROM vendas
      ${whereClause}
    `).get(...params);
  return {
    data: stmt,
    page,
    limit,
    total: total.total
  };
}
function buscarVendaPorId(vendaId) {
  const venda = db.prepare(`
      SELECT
        id,
        data_emissao,
        data_movimento,
        status,
        cliente_nome,
        cpf_cliente,
        valor_total,
        valor_produtos,
        valor_desconto,
        valor_troco,
        observacao
      FROM vendas
      WHERE id = ?
      `).get(vendaId);
  if (!venda) return null;
  const itens = db.prepare(`
      SELECT
        produto_id,
        codigo_produto,
        nome_produto,
        quantidade_comercial,
        valor_unitario_comercial,
        valor_bruto,
        valor_desconto,
        subtotal
      FROM venda_itens
      WHERE venda_id = ?
      `).all(vendaId);
  return {
    ...venda,
    itens
  };
}
function listarProdutos({ nome, codigo, ativo, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];
  if (nome) {
    where.push("name LIKE ?");
    params.push(`%${nome}%`);
  }
  if (codigo) {
    where.push("(barcode LIKE ? OR sku LIKE ?)");
    params.push(`%${codigo}%`, `%${codigo}%`);
  }
  if (ativo !== void 0) {
    where.push("active = ?");
    params.push(ativo);
  }
  const data = db.prepare(`
      SELECT
        id,
        barcode AS codigo_barras,
        name AS nome,
        ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
        current_stock AS estoque_atual,
        active AS ativo
      FROM products
      WHERE deleted_at IS NULL
      ${where.length ? `AND ${where.join(" AND ")}` : ""}
      ORDER BY name
    LIMIT ? OFFSET ?
      `).all(...params, limit, offset);
  const total = db.prepare(`
      SELECT COUNT(*) as total
      FROM products
      WHERE deleted_at IS NULL
      ${where.length ? `AND ${where.join(" AND ")}` : ""}
    `).get(...params);
  return {
    data,
    page,
    limit,
    total: total.total
  };
}
function select_product_by_id(id) {
  const stmt = db.prepare(`
    SELECT
      id,
      external_id,
      barcode AS codigo_barras,
      sku,
      name AS nome,
      category_id,
      category_id AS categoria_id,
      ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
      ROUND(cost_price_cents / 100.0, 2) AS preco_custo,
      ROUND(COALESCE(purchase_price_cents, cost_price_cents) / 100.0, 2) AS preco_compra,
      current_stock AS estoque_atual,
      maximum_stock AS estoque_maximo,
      active AS ativo,
      unit AS unidade_medida,
      measurement_unit,
      minimum_stock AS estoque_minimo,
      ncm,
      origin AS origem,
      ROUND(COALESCE(fixed_ipi_value_cents, 0) / 100.0, 2) AS valor_ipi_fixo,
      notes AS observacoes,
      situation AS situacao,
      supplier_code,
      supplier_name,
      location AS localizacao,
      net_weight_kg,
      gross_weight_kg,
      packaging_barcode,
      width_cm,
      height_cm,
      depth_cm,
      expiration_date,
      supplier_product_description,
      complementary_description,
      items_per_box,
      is_variation,
      production_type,
      ipi_tax_class,
      service_list_code,
      item_type,
      tags_group,
      tags,
      taxes_json,
      parent_code,
      integration_code,
      product_group,
      brand,
      brand AS marca,
      cest,
      volumes,
      short_description,
      cross_docking_days,
      external_image_urls,
      external_link,
      supplier_warranty_months,
      clone_parent_data,
      product_condition,
      free_shipping,
      fci_number,
      department,
      ROUND(COALESCE(icms_st_retention_base_cents, 0) / 100.0, 2) AS valor_base_icms_st_retencao,
      ROUND(COALESCE(icms_st_retention_value_cents, 0) / 100.0, 2) AS valor_icms_st_retencao,
      ROUND(COALESCE(icms_substitute_own_value_cents, 0) / 100.0, 2) AS valor_icms_proprio_substituto,
      product_category_name,
      additional_info,
      integration_source,
      remote_created_at,
      remote_updated_at,
      last_synced_at,
      sync_status,
      created_at,
      updated_at,
      deleted_at,
      raw_json
    FROM products
    WHERE id = ? AND deleted_at IS NULL
    LIMIT 1;
  `);
  return stmt.get(id);
}
function buscarProdutosPorNome(termo) {
  const stmt = db.prepare(`
    SELECT
      id,
      barcode AS codigo_barras,
      name AS nome,
      ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
      current_stock AS estoque
    FROM products
    WHERE deleted_at IS NULL
      AND LOWER(name) LIKE LOWER(?)
    ORDER BY name
    LIMIT 50
      `);
  return stmt.all(`%${termo}%`);
}
function buscarProdutoPorCodigoBarras(codigo) {
  const stmt = db.prepare(`
    SELECT
      id,
      barcode AS codigo_barras,
      name AS nome,
      ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
      current_stock AS estoque_atual
    FROM products
    WHERE deleted_at IS NULL
      AND barcode = ?
    LIMIT 1;
  `);
  return stmt.get(codigo);
}
function selectSuggestionProduct(term) {
  const stmt = db.prepare(`
    SELECT *
    FROM products
    WHERE deleted_at IS NULL
    AND active = 1
    AND(
      sku = ?
        OR barcode = ?
          OR name LIKE ?
      )
    ORDER BY name
    LIMIT 5
      `);
  const rows = stmt.all(term, term, `%${term}%`);
  return rows.map((product) => ({
    id: product.id,
    internalCode: product.sku ?? "",
    name: product.name,
    brand: product.brand ?? "",
    gtin: product.barcode ?? "",
    unitOfMeasure: product.unit ?? "UN",
    currentStock: Number(product.current_stock ?? 0),
    minimumStock: Number(product.minimum_stock ?? 0),
    avgCost: Number(product.cost_price_cents ?? 0) / 100,
    ncm: product.ncm ?? "",
    cfop: product.cfop ?? "",
    controlsExpiration: false,
    controlsBatch: false
  }));
}
console.log(db);
function addPrinter(dados) {
  if (dados.is_default === 1) {
    db.prepare(`UPDATE printers SET is_default = 0 WHERE is_default = 1`).run();
  }
  const stmt = db.prepare(`
    INSERT INTO printers(
      name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
      paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json, notes, is_default
    )
    VALUES(
      @selectedPrinter, @display_name, @brand, @model, @connection_type, @driver_name, @driver_version,
      @photo_path, @paper_width_mm, @content_width_mm, @base_font_size_px, @line_height, @receipt_settings_json, @notes, @is_default
    )
      `);
  stmt.run(dados);
}
function listarPrinters() {
  const stmt = db.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
           paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json, notes, is_default, installed_at
    FROM printers
    ORDER BY is_default DESC, id DESC
      `);
  return stmt.all();
}
function getPrinterPadrao() {
  const stmt = db.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, is_default,
           paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
    FROM printers
    WHERE is_default = 1
    LIMIT 1
  `);
  return stmt.get();
}
function atualizarLayoutPrinter(id, dados) {
  return db.prepare(`
    UPDATE printers
    SET
      paper_width_mm = ?,
      content_width_mm = ?,
      base_font_size_px = ?,
      line_height = ?
    WHERE id = ?
  `).run(
    dados.paper_width_mm,
    dados.content_width_mm,
    dados.base_font_size_px,
    dados.line_height,
    id
  );
}
function atualizarPersonalizacaoCupomPrinter(id, receiptSettingsJson) {
  return db.prepare(`
    UPDATE printers
    SET receipt_settings_json = ?
    WHERE id = ?
  `).run(receiptSettingsJson, id);
}
function removerPrinter(id) {
  const stmt = db.prepare(`DELETE FROM printers WHERE id = ? `);
  return stmt.run(id);
}
function definirPrinterPadrao(id) {
  const transaction = db.transaction(() => {
    db.prepare(`UPDATE printers SET is_default = 0 WHERE is_default = 1`).run();
    db.prepare(`UPDATE printers SET is_default = 1 WHERE id = ? `).run(id);
  });
  transaction();
}
function criarUsuarioAdmin() {
  const existe = db.prepare(`SELECT COUNT(*) as total FROM usuarios`).get();
  if (existe.total === 0) {
    const stmt = db.prepare(`
      INSERT INTO usuarios(nome, funcao, email, username, password, ativo)
    VALUES(?, ?, ?, ?, ?, ?)
      `);
    stmt.run(
      "Administrador",
      "Gerente",
      "admin@galberto.local",
      "admin",
      hashSenha("admin123"),
      1
    );
    logger.info("-> Usuário admin padrão criado (admin / admin123)");
    console.log("-> Usuário admin padrão criado (admin / admin123)");
  }
}
function buscarUsuario(id) {
  const stmt = db.prepare(`
    SELECT id, nome, funcao, email, username, ativo, foto_path
    FROM usuarios
    WHERE id = ?
      `);
  return stmt.get(id);
}
function selectUsers({ name, role, login, ativo, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];
  if (name) {
    where.push("nome LIKE ?");
    params.push(`% ${name}% `);
  }
  if (role) {
    where.push("funcao LIKE ?");
    params.push(`% ${role}% `);
  }
  if (login) {
    where.push("username LIKE ?");
    params.push(`% ${login}% `);
  }
  if (ativo !== void 0) {
    where.push("ativo = ?");
    params.push(ativo);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")} ` : "";
  const data = db.prepare(`
      SELECT id, nome, funcao AS role, email, username AS login, ativo
      FROM usuarios
      ${whereClause}
      ORDER BY nome
    LIMIT ? OFFSET ?
      `).all(...params, limit, offset);
  const total = db.prepare(`
      SELECT COUNT(*) as total
      FROM usuarios
      ${whereClause}
    `).get(...params);
  return {
    data,
    page,
    limit,
    total: total.total
  };
}
function addUsuario(dados) {
  const stmt = db.prepare(`
    INSERT INTO usuarios(nome, funcao, email, username, password, ativo, foto_path)
    VALUES(@nome, @funcao, @email, @username, @password, @ativo, @foto_path)
  `);
  return stmt.run({
    ...dados,
    foto_path: dados.foto_path ?? null,
    password: hashSenha(dados.password)
  });
}
function alterarSenhaUsuario(id, newPassword) {
  const stmt = db.prepare(`UPDATE usuarios SET password = ? WHERE id = ? `);
  return stmt.run(hashSenha(newPassword), id);
}
function removerUsuario(id) {
  const stmt = db.prepare(`DELETE FROM usuarios WHERE id = ? `);
  return stmt.run(id);
}
function updateUser(data) {
  console.log("Dados chegando no db.ts", data);
  const campos = [];
  const valores = [];
  if (data.nome !== void 0) {
    campos.push("nome = ?");
    valores.push(data.nome);
  }
  if (data.email !== void 0) {
    campos.push("email = ?");
    valores.push(data.email);
  }
  if (data.login !== void 0) {
    campos.push("username = ?");
    valores.push(data.login);
  }
  if (data.role !== void 0) {
    campos.push("funcao = ?");
    valores.push(data.role);
  }
  valores.push(data.id);
  const sql = `
  UPDATE usuarios
  SET ${campos.join(", ")}
  WHERE id = ?
      `;
  const stmt = db.prepare(sql);
  stmt.run(...valores);
}
function disableUser(id) {
  const stmt = db.prepare(`UPDATE usuarios SET ativo = 0 WHERE id = ? `);
  return stmt.run(id);
}
function enableUser(id) {
  const stmt = db.prepare(`UPDATE usuarios SET ativo = 1 WHERE id = ? `);
  return stmt.run(id);
}
criarUsuarioAdmin();
function getOpenCashSession(data) {
  const stmt = db.prepare(`
    SELECT id
      FROM cash_register_sessions
    WHERE pdv_id = ?
      AND operator_id = ?
        AND status = 'OPEN'
    ORDER BY opened_at DESC
    LIMIT 1;
    `);
  const session = stmt.get(data.pdv_id, data.operator_id);
  if (!session) {
    return null;
  }
  return getCashSessionSummaryById(session.id);
}
function serializeJson(value) {
  return JSON.stringify(value ?? null);
}
function booleanToInt(value) {
  return value ? 1 : 0;
}
function mapSale(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerDocument: row.customer_document,
    status: row.status,
    subtotalAmount: row.subtotal_amount,
    discountAmount: row.discount_amount,
    surchargeAmount: row.surcharge_amount,
    totalAmount: row.total_amount,
    changeAmount: row.change_amount,
    externalReference: row.external_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function mapItem(row) {
  return {
    id: row.id,
    saleId: row.sale_id,
    productId: row.product_id,
    sku: row.sku,
    description: row.description,
    unit: row.unit,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    grossAmount: row.gross_amount,
    discountAmount: row.discount_amount,
    totalAmount: row.total_amount,
    ncm: row.ncm,
    cfop: row.cfop,
    cest: row.cest,
    originCode: row.origin_code,
    taxSnapshotJson: row.tax_snapshot_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function mapPayment(row) {
  return {
    id: row.id,
    saleId: row.sale_id,
    method: row.method,
    amount: row.amount,
    receivedAmount: row.received_amount,
    changeAmount: row.change_amount,
    integrationReference: row.integration_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
class SalesRepository {
  create(input) {
    const transaction = db.transaction(() => {
      const saleResult = db.prepare(`
        INSERT INTO sales (
          store_id, customer_id, customer_name, customer_document, status,
          subtotal_amount, discount_amount, surcharge_amount, total_amount,
          change_amount, external_reference, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        input.storeId,
        input.customerId ?? null,
        input.customerName ?? null,
        input.customerDocument ?? null,
        input.status ?? "OPEN",
        input.subtotalAmount,
        input.discountAmount ?? 0,
        input.surchargeAmount ?? 0,
        input.totalAmount,
        input.changeAmount ?? 0,
        input.externalReference ?? null
      );
      const saleId = Number(saleResult.lastInsertRowid);
      const insertItem = db.prepare(`
        INSERT INTO sale_items (
          sale_id, product_id, sku, description, unit, quantity, unit_price,
          gross_amount, discount_amount, total_amount, ncm, cfop, cest,
          origin_code, tax_snapshot_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      for (const item of input.items) {
        insertItem.run(
          saleId,
          item.productId ?? null,
          item.sku ?? null,
          item.description,
          item.unit,
          item.quantity,
          item.unitPrice,
          item.grossAmount,
          item.discountAmount ?? 0,
          item.totalAmount,
          item.ncm ?? null,
          item.cfop ?? null,
          item.cest ?? null,
          item.originCode ?? null,
          item.taxSnapshot ? serializeJson(item.taxSnapshot) : null
        );
      }
      const insertPayment = db.prepare(`
        INSERT INTO payments (
          sale_id, method, amount, received_amount, change_amount,
          integration_reference, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      for (const payment of input.payments) {
        insertPayment.run(
          saleId,
          payment.method,
          payment.amount,
          payment.receivedAmount ?? payment.amount,
          payment.changeAmount ?? 0,
          payment.integrationReference ?? null
        );
      }
      return this.findAggregateById(saleId);
    });
    return transaction();
  }
  findById(id) {
    const row = db.prepare(`SELECT * FROM sales WHERE id = ? LIMIT 1`).get(id);
    return row ? mapSale(row) : null;
  }
  findByExternalReference(externalReference) {
    const row = db.prepare(`
      SELECT * FROM sales
      WHERE external_reference = ?
      LIMIT 1
    `).get(externalReference);
    return row ? this.findAggregateById(row.id) : null;
  }
  findAggregateById(id) {
    const sale = this.findById(id);
    if (!sale) return null;
    const items = db.prepare(`SELECT * FROM sale_items WHERE sale_id = ? ORDER BY id ASC`).all(id);
    const payments = db.prepare(`SELECT * FROM payments WHERE sale_id = ? ORDER BY id ASC`).all(id);
    const fiscalDocument = db.prepare(`SELECT id FROM fiscal_documents WHERE sale_id = ? LIMIT 1`).get(id);
    return {
      sale,
      items: items.map(mapItem),
      payments: payments.map(mapPayment),
      fiscalDocument: fiscalDocument ? { id: fiscalDocument.id } : null
    };
  }
  listRecent(limit = 20) {
    const sales = db.prepare(`
      SELECT * FROM sales
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);
    return sales.map((sale) => this.findAggregateById(sale.id)).filter((sale) => Boolean(sale));
  }
  updateStatus(id, status) {
    db.prepare(`
      UPDATE sales
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, id);
  }
}
const salesRepository = new SalesRepository();
function mapStore(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    legalName: row.legal_name,
    cnpj: row.cnpj,
    stateRegistration: row.state_registration,
    taxRegimeCode: row.tax_regime_code,
    environment: row.environment,
    cscId: row.csc_id,
    cscToken: row.csc_token,
    defaultSeries: row.default_series,
    nextNfceNumber: row.next_nfce_number,
    addressStreet: row.address_street,
    addressNumber: row.address_number,
    addressNeighborhood: row.address_neighborhood,
    addressCity: row.address_city,
    addressState: row.address_state,
    addressZipCode: row.address_zip_code,
    addressCityIbgeCode: row.address_city_ibge_code,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
class StoreRepository {
  create(input) {
    const result = db.prepare(`
      INSERT INTO stores (
        code, name, legal_name, cnpj, state_registration, tax_regime_code,
        environment, csc_id, csc_token, default_series, next_nfce_number,
        address_street, address_number, address_neighborhood, address_city,
        address_state, address_zip_code, address_city_ibge_code, active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      input.code,
      input.name,
      input.legalName,
      input.cnpj,
      input.stateRegistration,
      input.taxRegimeCode,
      input.environment,
      input.cscId ?? null,
      input.cscToken ?? null,
      input.defaultSeries ?? 1,
      input.nextNfceNumber ?? 1,
      input.addressStreet,
      input.addressNumber,
      input.addressNeighborhood,
      input.addressCity,
      input.addressState,
      input.addressZipCode,
      input.addressCityIbgeCode,
      booleanToInt(input.active ?? true)
    );
    return this.findById(Number(result.lastInsertRowid));
  }
  findById(id) {
    const row = db.prepare(`SELECT * FROM stores WHERE id = ? LIMIT 1`).get(id);
    return row ? mapStore(row) : null;
  }
  findActive() {
    const row = db.prepare(`
      SELECT * FROM stores
      WHERE active = 1
      ORDER BY id ASC
      LIMIT 1
    `).get();
    return row ? mapStore(row) : null;
  }
  reserveNextNfceNumber(storeId) {
    const transaction = db.transaction(() => {
      const current = db.prepare(`
        SELECT default_series, next_nfce_number
        FROM stores
        WHERE id = ?
        LIMIT 1
      `).get(storeId);
      if (!current) {
        throw new Error(`Store ${storeId} não encontrada.`);
      }
      db.prepare(`
        UPDATE stores
        SET next_nfce_number = next_nfce_number + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(storeId);
      return {
        series: current.default_series,
        number: current.next_nfce_number
      };
    });
    return transaction();
  }
}
const storeRepository = new StoreRepository();
function money$1(value) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
class HtmlDanfeService {
  constructor() {
    __publicField(this, "outputDir", path$1.join(app.getPath("userData"), "fiscal", "danfe"));
  }
  async generate(document) {
    fs$1.mkdirSync(this.outputDir, { recursive: true });
    const danfePath = document.danfePath || path$1.join(this.outputDir, `nfce-${document.id}.html`);
    const html = this.render(document);
    fs$1.writeFileSync(danfePath, html, "utf8");
    return {
      documentId: document.id,
      danfePath,
      contentType: "text/html",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async recover(document) {
    if (!document.danfePath || !fs$1.existsSync(document.danfePath)) {
      return null;
    }
    return {
      documentId: document.id,
      danfePath: document.danfePath,
      contentType: "text/html",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  render(document) {
    const aggregate = salesRepository.findAggregateById(document.saleId);
    const store = storeRepository.findById(document.companyId);
    const isHomologation = document.environment === "homologation";
    const items = (aggregate == null ? void 0 : aggregate.items) ?? [];
    const payments = (aggregate == null ? void 0 : aggregate.payments) ?? [];
    const total = (aggregate == null ? void 0 : aggregate.sale.totalAmount) ?? 0;
    return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DANFE NFC-e ${document.number}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f5; color: #18181b; padding: 12px; }
      .card { width: 320px; margin: 0 auto; background: white; border: 1px solid #d4d4d8; border-radius: 12px; padding: 16px; }
      .title { font-size: 16px; font-weight: 700; margin-bottom: 8px; text-align: center; }
      .subtitle { font-size: 12px; text-align: center; margin-bottom: 8px; }
      .row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: 12px; }
      .muted { color: #71717a; }
      .ok { color: #059669; font-weight: 700; }
      .warn { color: #b45309; font-weight: 700; text-align: center; margin: 10px 0; font-size: 12px; }
      .divider { border-top: 1px dashed #a1a1aa; margin: 10px 0; }
      .item { font-size: 12px; margin-bottom: 8px; }
      .item strong { display: block; }
      .qr { word-break: break-all; font-size: 10px; color: #52525b; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">DANFE NFC-e</div>
      <div class="subtitle">${(store == null ? void 0 : store.legalName) ?? "Emitente não encontrado"}</div>
      <div class="subtitle">CNPJ ${(store == null ? void 0 : store.cnpj) ?? "—"} | IE ${(store == null ? void 0 : store.stateRegistration) ?? "—"}</div>
      <div class="subtitle">${store ? `${store.addressStreet}, ${store.addressNumber} - ${store.addressNeighborhood}` : "Endereço indisponível"}</div>
      <div class="subtitle">${store ? `${store.addressCity}/${store.addressState}` : ""}</div>
      ${isHomologation ? '<div class="warn">EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL</div>' : ""}
      <div class="divider"></div>
      <div class="row"><span class="muted">Documento</span><span>${document.id}</span></div>
      <div class="row"><span class="muted">Venda</span><span>${document.saleId}</span></div>
      <div class="row"><span class="muted">Número/Série</span><span>${document.number}/${document.series}</span></div>
      <div class="row"><span class="muted">Status</span><span class="${document.status === "AUTHORIZED" ? "ok" : "muted"}">${document.status}</span></div>
      <div class="row"><span class="muted">Emissão</span><span>${document.issuedAt}</span></div>
      <div class="row"><span class="muted">Autorização</span><span>${document.authorizedAt ?? "Pendente"}</span></div>
      <div class="row"><span class="muted">Protocolo</span><span>${document.authorizationProtocol ?? "Pendente"}</span></div>
      <div class="divider"></div>
      <div class="subtitle"><strong>Itens</strong></div>
      ${items.map((item) => `
        <div class="item">
          <strong>${item.description}</strong>
          <div class="row"><span>${Number(item.quantity).toFixed(3)} x ${money$1(item.unitPrice)}</span><span>${money$1(item.totalAmount)}</span></div>
        </div>
      `).join("")}
      <div class="divider"></div>
      <div class="subtitle"><strong>Pagamentos</strong></div>
      ${payments.map((payment) => `
        <div class="row">
          <span>${payment.method}</span>
          <span>${money$1(payment.amount)}</span>
        </div>
      `).join("")}
      <div class="row"><span class="muted">Troco</span><span>${money$1((aggregate == null ? void 0 : aggregate.sale.changeAmount) ?? 0)}</span></div>
      <div class="row"><span class="muted">Total</span><span><strong>${money$1(total)}</strong></span></div>
      <div class="divider"></div>
      <div class="row"><span class="muted">Chave</span><span>${document.accessKey ?? "Pendente"}</span></div>
      <div class="qr">${document.qrCodeUrl ?? "QR Code indisponível"}</div>
    </div>
  </body>
</html>`;
  }
}
class FiscalError extends Error {
  constructor(input) {
    super(input.message);
    __publicField(this, "code");
    __publicField(this, "category");
    __publicField(this, "retryable");
    __publicField(this, "details");
    this.name = "FiscalError";
    this.code = input.code;
    this.category = input.category;
    this.retryable = input.retryable ?? false;
    this.details = input.details;
    if (input.cause !== void 0) {
      this.cause = input.cause;
    }
  }
}
function normalizeFiscalError(error, fallbackCode = "FISCAL_INTERNAL_ERROR") {
  if (error instanceof FiscalError) {
    return error;
  }
  if (error instanceof Error) {
    return new FiscalError({
      code: fallbackCode,
      message: error.message,
      category: "INTERNAL",
      retryable: false,
      cause: error
    });
  }
  return new FiscalError({
    code: fallbackCode,
    message: "Erro interno na camada fiscal.",
    category: "INTERNAL",
    retryable: false,
    details: error
  });
}
class FileSystemCertificateService {
  readCertificatePem(config2) {
    var _a;
    const certificatePath = (_a = config2.certificatePath) == null ? void 0 : _a.trim();
    if (!certificatePath) {
      return null;
    }
    const extension = path$1.extname(certificatePath).toLowerCase();
    if (extension === ".pem" || extension === ".crt" || extension === ".cer") {
      return fs$1.readFileSync(certificatePath, "utf8");
    }
    if (extension === ".pfx" || extension === ".p12") {
      if (!config2.certificatePassword) {
        throw new FiscalError({
          code: "CERTIFICATE_PASSWORD_REQUIRED",
          message: "Senha do certificado não configurada.",
          category: "CERTIFICATE"
        });
      }
      try {
        return execFileSync(
          "openssl",
          ["pkcs12", "-in", certificatePath, "-clcerts", "-nokeys", "-passin", `pass:${config2.certificatePassword}`],
          { encoding: "utf8" }
        );
      } catch (error) {
        throw new FiscalError({
          code: "CERTIFICATE_READ_FAILED",
          message: "Não foi possível validar o certificado digital informado.",
          category: "CERTIFICATE",
          cause: error
        });
      }
    }
    return null;
  }
  async getCertificateInfo(config2) {
    var _a;
    const certificatePath = (_a = config2.certificatePath) == null ? void 0 : _a.trim();
    const lastCheckedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (!certificatePath) {
      return {
        configured: false,
        type: "UNKNOWN",
        lastCheckedAt
      };
    }
    const exists = fs$1.existsSync(certificatePath);
    let validUntil = null;
    if (exists) {
      try {
        const pem = this.readCertificatePem(config2);
        if (pem) {
          const certificate = new X509Certificate(pem);
          validUntil = new Date(certificate.validTo).toISOString();
        }
      } catch {
        validUntil = null;
      }
    }
    return {
      configured: exists,
      type: [".pfx", ".p12"].includes(path$1.extname(certificatePath).toLowerCase()) ? "A1" : "UNKNOWN",
      alias: path$1.basename(certificatePath),
      source: certificatePath,
      validUntil,
      lastCheckedAt
    };
  }
  async assertCertificateReady(config2) {
    if (config2.provider === "mock") {
      return;
    }
    if (!config2.certificatePath) {
      throw new FiscalError({
        code: "CERTIFICATE_NOT_CONFIGURED",
        message: "Certificado fiscal não configurado.",
        category: "CERTIFICATE"
      });
    }
    if (!fs$1.existsSync(config2.certificatePath)) {
      throw new FiscalError({
        code: "CERTIFICATE_FILE_NOT_FOUND",
        message: `Arquivo do certificado não encontrado: ${config2.certificatePath}`,
        category: "CERTIFICATE"
      });
    }
    const pem = this.readCertificatePem(config2);
    if (!pem) {
      throw new FiscalError({
        code: "CERTIFICATE_FORMAT_NOT_SUPPORTED",
        message: "Formato de certificado não suportado pela camada fiscal atual.",
        category: "CERTIFICATE"
      });
    }
    const certificate = new X509Certificate(pem);
    if (new Date(certificate.validTo).getTime() < Date.now()) {
      throw new FiscalError({
        code: "CERTIFICATE_EXPIRED",
        message: "O certificado digital configurado está expirado.",
        category: "CERTIFICATE"
      });
    }
  }
}
const FISCAL_INTEGRATION_ID = "fiscal:nfce";
const CONFIG_SENTINEL = "__FISCAL_CONFIG__";
function nowIso$1() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function defaultConfig() {
  return {
    provider: "mock",
    environment: "homologation",
    contingencyMode: "queue",
    integrationId: FISCAL_INTEGRATION_ID,
    gatewayApiKey: null,
    gatewayBaseUrl: null,
    sefazBaseUrl: null,
    certificatePath: null,
    certificatePassword: null,
    cscId: null,
    cscToken: null,
    uf: "SP",
    model: 65,
    defaultSeries: 1,
    updatedAt: nowIso$1()
  };
}
function sanitizeForView(config2) {
  return {
    provider: config2.provider,
    environment: config2.environment,
    contingencyMode: config2.contingencyMode,
    integrationId: config2.integrationId,
    gatewayBaseUrl: config2.gatewayBaseUrl ?? null,
    sefazBaseUrl: config2.sefazBaseUrl ?? null,
    certificatePath: config2.certificatePath ?? null,
    cscId: config2.cscId ?? null,
    uf: config2.uf ?? "SP",
    model: config2.model ?? 65,
    defaultSeries: config2.defaultSeries ?? null,
    hasGatewayApiKey: Boolean(config2.gatewayApiKey),
    hasCertificatePassword: Boolean(config2.certificatePassword),
    hasCscToken: Boolean(config2.cscToken),
    updatedAt: config2.updatedAt
  };
}
class IntegrationFiscalSettingsService {
  getConfig() {
    const row = db.prepare(`
      SELECT integration_id, raw_json, updated_at
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(FISCAL_INTEGRATION_ID);
    if (!(row == null ? void 0 : row.raw_json)) {
      logger.warn("[FiscalConfig] Configuracao fiscal fiscal:nfce nao encontrada. Usando defaults.");
      return defaultConfig();
    }
    const parsed = JSON.parse(row.raw_json);
    logger.info(`[FiscalConfig] Configuracao fiscal carregada provider=${parsed.provider ?? "mock"} ambiente=${parsed.environment ?? "homologation"} uf=${parsed.uf ?? "SP"}.`);
    return {
      ...defaultConfig(),
      ...parsed,
      integrationId: FISCAL_INTEGRATION_ID,
      updatedAt: parsed.updatedAt ?? row.updated_at ?? nowIso$1()
    };
  }
  getConfigView() {
    return sanitizeForView(this.getConfig());
  }
  saveConfig(input) {
    const current = this.getConfig();
    const next = {
      ...current,
      ...input,
      gatewayApiKey: input.gatewayApiKey === "" ? current.gatewayApiKey : input.gatewayApiKey ?? current.gatewayApiKey,
      certificatePassword: input.certificatePassword === "" ? current.certificatePassword : input.certificatePassword ?? current.certificatePassword,
      cscToken: input.cscToken === "" ? current.cscToken : input.cscToken ?? current.cscToken,
      integrationId: FISCAL_INTEGRATION_ID,
      updatedAt: nowIso$1()
    };
    db.prepare(`
      INSERT INTO integrations (
        integration_id,
        access_token,
        refresh_token,
        token_type,
        expires_at,
        scope,
        raw_json,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_id) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        token_type = excluded.token_type,
        expires_at = excluded.expires_at,
        scope = excluded.scope,
        raw_json = excluded.raw_json,
        updated_at = excluded.updated_at
    `).run(
      FISCAL_INTEGRATION_ID,
      CONFIG_SENTINEL,
      CONFIG_SENTINEL,
      "CONFIG",
      "9999-12-31T23:59:59.999Z",
      "fiscal:nfce",
      JSON.stringify(next),
      next.updatedAt
    );
    logger.info(`[FiscalConfig] Configuracao fiscal salva provider=${next.provider} ambiente=${next.environment} uf=${next.uf ?? "SP"}.`);
    return sanitizeForView(next);
  }
}
function toPersistedDocument(row) {
  return {
    id: row.id,
    saleId: row.sale_id,
    companyId: row.store_id,
    number: row.number,
    series: row.series,
    model: row.model,
    environment: row.environment,
    status: row.status,
    issueType: row.contingency_type ? 9 : 1,
    accessKey: row.access_key,
    authorizationProtocol: row.protocol,
    receiptNumber: row.receipt_number,
    statusCode: row.rejection_code,
    statusMessage: row.rejection_reason,
    issuedAt: row.issued_datetime ?? row.created_at,
    authorizedAt: row.authorization_datetime,
    cancelledAt: row.cancel_datetime,
    cancellationProtocol: row.protocol,
    xmlBuilt: row.xml,
    xmlSigned: row.xml_signed,
    xmlSent: row.xml,
    xmlAuthorized: row.xml_authorized,
    xmlCancellation: row.xml_cancellation,
    danfePath: row.danfe_path,
    qrCodeUrl: row.qr_code_url,
    digestValue: null,
    contingencyJustification: row.contingency_type,
    cancellationJustification: null,
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}
function toQueueStatus(status) {
  switch (status) {
    case "PENDING":
      return "pending";
    case "PROCESSING":
      return "processing";
    case "DONE":
      return "done";
    case "FAILED":
    default:
      return "failed";
  }
}
function toQueueItem(row) {
  const payload = JSON.parse(row.payload_json);
  const result = row.result_json ? JSON.parse(row.result_json) : null;
  const parsedEntityId = Number(row.entity_id);
  return {
    id: String(row.id),
    saleId: Number((payload == null ? void 0 : payload.saleId) ?? 0),
    documentId: Number.isNaN(parsedEntityId) ? null : parsedEntityId,
    operation: row.operation,
    payload,
    result,
    status: toQueueStatus(row.status),
    idempotencyKey: row.idempotency_key,
    attempts: row.attempts,
    maxAttempts: 5,
    nextRetryAt: row.next_attempt_at,
    lastErrorCode: row.last_error ?? null,
    lastErrorMessage: row.last_error ?? null,
    lockedAt: row.locked_at,
    lockedBy: row.locked_by,
    processedAt: row.processed_at ?? (row.status === "DONE" ? row.updated_at : null),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
class SqliteFiscalRepository {
  ensureSchema() {
  }
  createPendingDocument(request) {
    const existing = this.findBySaleId(request.saleId);
    if (existing) {
      return existing;
    }
    const result = db.prepare(`
      INSERT INTO fiscal_documents (
        sale_id, store_id, model, series, number, access_key, environment, status,
        issued_datetime, xml, xml_signed, xml_authorized, xml_cancellation, protocol, receipt_number, qr_code_url, authorization_datetime,
        cancel_datetime, contingency_type, rejection_code, rejection_reason, danfe_path,
        provider, created_at, updated_at
      ) VALUES (?, ?, 65, ?, ?, NULL, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      request.saleId,
      request.companyId,
      request.series,
      request.number,
      request.environment,
      request.offlineFallbackMode === "queue" ? "QUEUED" : "PENDING",
      request.issuedAt,
      request.offlineFallbackMode === "offline-contingency" ? "offline-contingency" : null
    );
    return this.findById(Number(result.lastInsertRowid));
  }
  updateTransmissionArtifacts(documentId, input) {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        issued_datetime = COALESCE(?, issued_datetime),
        xml = COALESCE(?, xml),
        xml_signed = COALESCE(?, xml_signed),
        xml_authorized = COALESCE(?, xml_authorized),
        xml_cancellation = COALESCE(?, xml_cancellation),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      input.issuedAt ?? null,
      input.xmlBuilt ?? null,
      input.xmlSigned ?? null,
      input.xmlAuthorized ?? null,
      input.xmlCancellation ?? null,
      documentId
    );
  }
  markAsAuthorized(documentId, response) {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = 'AUTHORIZED',
        access_key = ?,
        protocol = ?,
        receipt_number = ?,
        qr_code_url = ?,
        authorization_datetime = ?,
        issued_datetime = COALESCE(?, issued_datetime),
        xml = COALESCE(?, xml),
        xml_signed = COALESCE(?, xml_signed),
        xml_authorized = COALESCE(?, xml_authorized),
        rejection_code = ?,
        rejection_reason = ?,
        provider = COALESCE(?, provider),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      response.accessKey ?? null,
      response.protocol ?? null,
      response.receiptNumber ?? null,
      response.qrCodeUrl ?? null,
      response.authorizedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      response.issuedAt ?? null,
      response.xmlBuilt ?? response.xmlSent ?? null,
      response.xmlSigned ?? null,
      response.xmlAuthorized ?? null,
      response.statusCode ?? null,
      response.statusMessage,
      response.provider ?? null,
      documentId
    );
    return this.findById(documentId);
  }
  markAsRejected(documentId, response) {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = ?,
        issued_datetime = COALESCE(?, issued_datetime),
        xml = COALESCE(?, xml),
        xml_signed = COALESCE(?, xml_signed),
        xml_authorized = COALESCE(?, xml_authorized),
        rejection_code = ?,
        rejection_reason = ?,
        provider = COALESCE(?, provider),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      response.status,
      response.issuedAt ?? null,
      response.xmlBuilt ?? response.xmlSent ?? null,
      response.xmlSigned ?? null,
      response.xmlAuthorized ?? null,
      response.statusCode ?? null,
      response.statusMessage,
      response.provider ?? null,
      documentId
    );
    return this.findById(documentId);
  }
  markAsCancelled(documentId, _request, response) {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = 'CANCELLED',
        cancel_datetime = ?,
        protocol = COALESCE(?, protocol),
        xml_authorized = COALESCE(?, xml_authorized),
        xml_cancellation = COALESCE(?, xml_cancellation),
        rejection_code = ?,
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      response.cancelledAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      response.cancellationProtocol ?? null,
      response.xmlAuthorized ?? null,
      response.xmlCancellation ?? null,
      response.statusCode ?? null,
      response.statusMessage,
      documentId
    );
    return this.findById(documentId);
  }
  updateDanfePath(documentId, danfePath) {
    db.prepare(`
      UPDATE fiscal_documents
      SET danfe_path = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(danfePath, documentId);
  }
  findById(documentId) {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1`).get(documentId);
    return row ? toPersistedDocument(row) : null;
  }
  findBySaleId(saleId) {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1`).get(saleId);
    return row ? toPersistedDocument(row) : null;
  }
  findByAccessKey(accessKey) {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1`).get(accessKey);
    return row ? toPersistedDocument(row) : null;
  }
  updateStatus(documentId, status, statusCode, statusMessage) {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = ?,
        rejection_code = ?,
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, statusCode ?? null, statusMessage ?? null, documentId);
  }
  enqueue(request) {
    const existing = this.findQueueItemByIdempotencyKey(request.idempotencyKey);
    if (existing) {
      return existing;
    }
    const result = db.prepare(`
      INSERT INTO sync_queue (
        entity_type, entity_id, operation, payload_json, status, attempts,
        next_attempt_at, last_error, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'PENDING', 0, CURRENT_TIMESTAMP, NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      "fiscal_document",
      String(request.documentId ?? request.saleId),
      request.operation,
      JSON.stringify(request.payload),
      request.idempotencyKey
    );
    return this.findQueueItemById(String(result.lastInsertRowid));
  }
  findQueueItemByIdempotencyKey(idempotencyKey) {
    const row = db.prepare(`
      SELECT * FROM sync_queue
      WHERE idempotency_key = ?
      LIMIT 1
    `).get(idempotencyKey);
    return row ? toQueueItem(row) : null;
  }
  findQueueItemById(queueId) {
    const row = db.prepare(`SELECT * FROM sync_queue WHERE id = ? LIMIT 1`).get(Number(queueId));
    return row ? toQueueItem(row) : null;
  }
  claimNextQueueItem(nowIso2, _workerId) {
    const row = db.prepare(`
      SELECT * FROM sync_queue
      WHERE status IN ('PENDING', 'FAILED')
        AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
      ORDER BY created_at ASC
      LIMIT 1
    `).get(nowIso2);
    if (!row) {
      return null;
    }
    this.markQueueItemProcessing(String(row.id), "main", nowIso2);
    return this.findQueueItemById(String(row.id));
  }
  claimQueueItemById(queueId, nowIso2, workerId) {
    const row = db.prepare(`
      SELECT * FROM sync_queue
      WHERE id = ?
        AND status IN ('PENDING', 'FAILED')
      LIMIT 1
    `).get(Number(queueId));
    if (!row) {
      return null;
    }
    this.markQueueItemProcessing(String(row.id), workerId, nowIso2);
    return this.findQueueItemById(String(row.id));
  }
  markQueueItemProcessing(queueId, workerId, nowIso2) {
    db.prepare(`
      UPDATE sync_queue
      SET
        status = 'PROCESSING',
        attempts = attempts + 1,
        locked_at = ?,
        locked_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nowIso2, workerId, Number(queueId));
  }
  markQueueItemDone(queueId, processedAtIso, result) {
    db.prepare(`
      UPDATE sync_queue
      SET
        status = 'DONE',
        last_error = NULL,
        result_json = ?,
        processed_at = ?,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(result === void 0 ? null : JSON.stringify(result), processedAtIso, Number(queueId));
  }
  markQueueItemFailed(queueId, errorCode, errorMessage, nextRetryAtIso, failedAtIso, result) {
    const message = [errorCode, errorMessage].filter(Boolean).join(": ");
    db.prepare(`
      UPDATE sync_queue
      SET
        status = 'FAILED',
        last_error = ?,
        next_attempt_at = ?,
        result_json = ?,
        processed_at = ?,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      message,
      nextRetryAtIso ?? null,
      result === void 0 ? null : JSON.stringify(result),
      failedAtIso,
      Number(queueId)
    );
  }
  listQueueItems(limit = 20) {
    const rows = db.prepare(`
      SELECT * FROM sync_queue
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);
    return rows.map(toQueueItem);
  }
  summarizeQueue() {
    const rows = db.prepare(`
      SELECT status, COUNT(*) as total
      FROM sync_queue
      GROUP BY status
    `).all();
    const summary = {
      pending: 0,
      processing: 0,
      failed: 0,
      done: 0,
      nextRetryAt: null
    };
    for (const row of rows) {
      if (row.status === "PENDING") summary.pending = row.total;
      if (row.status === "PROCESSING") summary.processing = row.total;
      if (row.status === "FAILED") summary.failed = row.total;
      if (row.status === "DONE") summary.done = row.total;
    }
    const nextRetry = db.prepare(`
      SELECT next_attempt_at
      FROM sync_queue
      WHERE status = 'FAILED' AND next_attempt_at IS NOT NULL
      ORDER BY next_attempt_at ASC
      LIMIT 1
    `).get();
    summary.nextRetryAt = (nextRetry == null ? void 0 : nextRetry.next_attempt_at) ?? null;
    return summary;
  }
}
function resolveBaseUrl(config2) {
  var _a;
  const baseUrl = (_a = config2.gatewayBaseUrl) == null ? void 0 : _a.trim();
  if (!baseUrl) {
    throw new FiscalError({
      code: "GATEWAY_BASE_URL_REQUIRED",
      message: "Gateway fiscal não configurado.",
      category: "CONFIGURATION"
    });
  }
  return baseUrl.replace(/\/+$/, "");
}
function resolveHeaders(config2) {
  var _a;
  const apiKey = (_a = config2.gatewayApiKey) == null ? void 0 : _a.trim();
  if (!apiKey) {
    throw new FiscalError({
      code: "GATEWAY_API_KEY_REQUIRED",
      message: "API key do gateway fiscal não configurada.",
      category: "CONFIGURATION"
    });
  }
  return {
    "content-type": "application/json",
    authorization: `Bearer ${apiKey}`
  };
}
async function parseGatewayResponse(response, fallbackCode) {
  var _a, _b, _c, _d, _e, _f;
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  const envelope = payload;
  if (!response.ok) {
    throw new FiscalError({
      code: ((_a = envelope.error) == null ? void 0 : _a.code) ?? fallbackCode,
      message: ((_b = envelope.error) == null ? void 0 : _b.message) ?? `Gateway fiscal retornou HTTP ${response.status}.`,
      category: "PROVIDER",
      retryable: response.status >= 500 || ((_c = envelope.error) == null ? void 0 : _c.retryable) === true,
      details: payload
    });
  }
  if ("success" in envelope && envelope.success === false) {
    throw new FiscalError({
      code: ((_d = envelope.error) == null ? void 0 : _d.code) ?? fallbackCode,
      message: ((_e = envelope.error) == null ? void 0 : _e.message) ?? "Gateway fiscal retornou erro de negócio.",
      category: "PROVIDER",
      retryable: ((_f = envelope.error) == null ? void 0 : _f.retryable) === true,
      details: payload
    });
  }
  return "data" in envelope && envelope.data !== void 0 ? envelope.data : payload;
}
class GatewayFiscalProvider {
  constructor() {
    __publicField(this, "providerId", "gateway");
  }
  async authorizeNfce(request, config2) {
    const response = await fetch(`${resolveBaseUrl(config2)}/nfce/authorize`, {
      method: "POST",
      headers: resolveHeaders(config2),
      body: JSON.stringify({
        request
      })
    });
    return parseGatewayResponse(response, "GATEWAY_AUTHORIZE_FAILED");
  }
  async cancelNfce(request, config2) {
    const response = await fetch(`${resolveBaseUrl(config2)}/nfce/cancel`, {
      method: "POST",
      headers: resolveHeaders(config2),
      body: JSON.stringify({
        request
      })
    });
    return parseGatewayResponse(response, "GATEWAY_CANCEL_FAILED");
  }
  async consultStatus(request, config2) {
    const response = await fetch(`${resolveBaseUrl(config2)}/nfce/status/${encodeURIComponent(request.accessKey)}`, {
      method: "GET",
      headers: resolveHeaders(config2)
    });
    return parseGatewayResponse(response, "GATEWAY_CONSULT_FAILED");
  }
  async testStatusServico(config2) {
    const startedAt = Date.now();
    const response = await fetch(`${resolveBaseUrl(config2)}/nfce/status-servico`, {
      method: "POST",
      headers: resolveHeaders(config2),
      body: JSON.stringify({
        environment: config2.environment,
        uf: config2.uf ?? "SP",
        model: config2.model ?? 65
      })
    });
    const data = await parseGatewayResponse(
      response,
      "GATEWAY_STATUS_SERVICE_FAILED"
    );
    return {
      provider: "gateway",
      environment: config2.environment,
      uf: config2.uf ?? data.uf ?? "SP",
      model: 65,
      service: "NFeStatusServico4",
      url: `${resolveBaseUrl(config2)}/nfce/status-servico`,
      success: data.success ?? true,
      statusCode: data.statusCode ?? null,
      statusMessage: data.statusMessage ?? "Consulta de status executada pelo gateway fiscal.",
      responseTimeMs: data.responseTimeMs ?? Date.now() - startedAt,
      rawRequest: data.rawRequest ?? "",
      rawResponse: data.rawResponse ?? JSON.stringify(data),
      checkedAt: data.checkedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      tlsValidation: data.tlsValidation ?? "verified",
      warning: data.warning ?? null
    };
  }
}
function buildAccessKey(request) {
  const base = `${request.emitter.address.state}${request.saleId}${request.number}${request.series}`.replace(/\D/g, "");
  return base.padEnd(44, "0").slice(0, 44);
}
class MockFiscalProvider {
  constructor() {
    __publicField(this, "providerId", "mock");
  }
  async authorizeNfce(request, _config) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const accessKey = buildAccessKey(request);
    return {
      status: "AUTHORIZED",
      provider: "mock",
      accessKey,
      protocol: `MOCK-PROT-${request.saleId}-${request.number}`,
      receiptNumber: `MOCK-REC-${request.saleId}`,
      statusCode: "100",
      statusMessage: "Autorizado em ambiente mock.",
      authorizedAt: now,
      xmlSent: `<NFe><infNFe Id="${accessKey}"></infNFe></NFe>`,
      xmlAuthorized: `<procNFe><protNFe nProt="MOCK-PROT-${request.saleId}-${request.number}"/></procNFe>`,
      qrCodeUrl: `https://mock.fiscal.local/qrcode/${accessKey}`,
      rawResponse: { mock: true, environment: request.environment }
    };
  }
  async cancelNfce(request, _config) {
    return {
      status: "CANCELLED",
      provider: "mock",
      cancellationProtocol: `MOCK-CANC-${request.documentId}`,
      cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
      statusCode: "135",
      statusMessage: "Cancelamento homologado em provider mock.",
      xmlCancellation: `<procEventoNFe><descEvento>Cancelamento</descEvento></procEventoNFe>`,
      rawResponse: { mock: true }
    };
  }
  async consultStatus(request, _config) {
    return {
      provider: "mock",
      accessKey: request.accessKey,
      status: "AUTHORIZED",
      statusCode: "100",
      statusMessage: "Documento autorizado em ambiente mock.",
      protocol: `MOCK-CONSULT-${request.accessKey.slice(-8)}`,
      authorizedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawResponse: { mock: true }
    };
  }
  async testStatusServico(config2) {
    const checkedAt = (/* @__PURE__ */ new Date()).toISOString();
    return {
      provider: "mock",
      environment: config2.environment,
      uf: config2.uf ?? "SP",
      model: 65,
      service: "NFeStatusServico4",
      url: "mock://nfce/status-servico",
      success: true,
      statusCode: "107",
      statusMessage: "Servico em operacao em ambiente mock.",
      responseTimeMs: 0,
      rawRequest: "<mockStatusServico />",
      rawResponse: "<retConsStatServ><cStat>107</cStat><xMotivo>Servico em operacao</xMotivo></retConsStatServ>",
      checkedAt,
      tlsValidation: "verified",
      warning: null
    };
  }
}
const SP_NFCE_ENDPOINTS = {
  homologation: {
    statusServico: "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeStatusServico4.asmx",
    autorizacao: "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx",
    retAutorizacao: "https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeRetAutorizacao4.asmx"
  },
  production: {
    statusServico: "https://nfce.fazenda.sp.gov.br/ws/NFeStatusServico4.asmx",
    autorizacao: "https://nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx",
    retAutorizacao: "https://nfce.fazenda.sp.gov.br/ws/NFeRetAutorizacao4.asmx"
  }
};
const IBGE_UF_CODES = {
  SP: "35"
};
function resolveUf(config2) {
  return (config2.uf ?? "SP").trim().toUpperCase();
}
function resolveStatusServicoUrl(config2) {
  var _a;
  const configuredBaseUrl = (_a = config2.sefazBaseUrl) == null ? void 0 : _a.trim();
  if (configuredBaseUrl) {
    if (configuredBaseUrl.endsWith(".asmx")) {
      return configuredBaseUrl;
    }
    return `${configuredBaseUrl.replace(/\/+$/, "")}/NFeStatusServico4.asmx`;
  }
  const uf = resolveUf(config2);
  if (uf !== "SP") {
    throw new FiscalError({
      code: "SEFAZ_UF_NOT_SUPPORTED",
      message: `SEFAZ direta para NFC-e ainda esta configurada somente para SP. UF recebida: ${uf}.`,
      category: "CONFIGURATION"
    });
  }
  return SP_NFCE_ENDPOINTS[config2.environment].statusServico;
}
function validateSefazDirectConfig(config2) {
  var _a, _b, _c;
  if (config2.provider !== "sefaz-direct") {
    throw new FiscalError({
      code: "SEFAZ_PROVIDER_INVALID",
      message: "O teste SEFAZ direto exige provider sefaz-direct.",
      category: "CONFIGURATION"
    });
  }
  if (config2.environment !== "homologation" && config2.environment !== "production") {
    throw new FiscalError({
      code: "SEFAZ_ENVIRONMENT_INVALID",
      message: "Ambiente fiscal invalido.",
      category: "CONFIGURATION"
    });
  }
  if ((config2.model ?? 65) !== 65) {
    throw new FiscalError({
      code: "SEFAZ_MODEL_NOT_SUPPORTED",
      message: "O diagnostico atual suporta apenas NFC-e modelo 65.",
      category: "CONFIGURATION"
    });
  }
  if (!((_a = config2.certificatePath) == null ? void 0 : _a.trim())) {
    throw new FiscalError({
      code: "CERTIFICATE_NOT_CONFIGURED",
      message: "Caminho do certificado A1 nao configurado.",
      category: "CERTIFICATE"
    });
  }
  if (!fs$1.existsSync(config2.certificatePath)) {
    throw new FiscalError({
      code: "CERTIFICATE_FILE_NOT_FOUND",
      message: `Arquivo do certificado nao encontrado: ${config2.certificatePath}`,
      category: "CERTIFICATE"
    });
  }
  if (!config2.certificatePassword) {
    throw new FiscalError({
      code: "CERTIFICATE_PASSWORD_REQUIRED",
      message: "Senha do certificado A1 nao configurada.",
      category: "CERTIFICATE"
    });
  }
  if (!((_b = config2.cscId) == null ? void 0 : _b.trim())) {
    throw new FiscalError({
      code: "CSC_ID_REQUIRED",
      message: "CSC ID nao configurado.",
      category: "CONFIGURATION"
    });
  }
  if (!((_c = config2.cscToken) == null ? void 0 : _c.trim())) {
    throw new FiscalError({
      code: "CSC_TOKEN_REQUIRED",
      message: "CSC Token nao configurado.",
      category: "CONFIGURATION"
    });
  }
}
function buildStatusServicoSoap(config2) {
  const uf = resolveUf(config2);
  const cUf = IBGE_UF_CODES[uf];
  if (!cUf) {
    throw new FiscalError({
      code: "SEFAZ_UF_CODE_NOT_MAPPED",
      message: `Codigo IBGE da UF ${uf} nao esta mapeado para consulta de status.`,
      category: "CONFIGURATION"
    });
  }
  const tpAmb = config2.environment === "production" ? "1" : "2";
  return `<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4"><consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>${tpAmb}</tpAmb><cUF>${cUf}</cUF><xServ>STATUS</xServ></consStatServ></nfeDadosMsg></soap12:Body></soap12:Envelope>`;
}
function isLocalIssuerCertificateError(error) {
  if (!(error instanceof FiscalError)) return false;
  const details = error.details;
  return error.code === "SEFAZ_NETWORK_OR_TLS_ERROR" && ((details == null ? void 0 : details.originalCode) === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" || (details == null ? void 0 : details.originalCode) === "SELF_SIGNED_CERT_IN_CHAIN" || /unable to get local issuer certificate|self-signed certificate/i.test((details == null ? void 0 : details.originalMessage) ?? error.message));
}
function postSoapWithCertificate(url, body, config2, options2 = {}) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const request = https.request(
      url,
      {
        method: "POST",
        pfx: fs$1.readFileSync(config2.certificatePath),
        passphrase: config2.certificatePassword ?? void 0,
        rejectUnauthorized: options2.allowUnauthorizedServerCertificate !== true,
        headers: {
          "content-type": 'application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF"',
          "content-length": Buffer.byteLength(body, "utf8"),
          soapaction: "http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF"
        },
        timeout: 3e4
      },
      (response) => {
        let data = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new FiscalError({
              code: "SEFAZ_HTTP_ERROR",
              message: `SEFAZ retornou HTTP ${response.statusCode ?? "sem status"} em ${Date.now() - startedAt}ms.`,
              category: "SEFAZ",
              retryable: true,
              details: {
                url,
                statusCode: response.statusCode,
                headers: response.headers,
                body: data
              }
            }));
            return;
          }
          resolve(data);
        });
      }
    );
    request.on("timeout", () => {
      request.destroy(new Error("Timeout de 30000ms ao chamar NFeStatusServico4."));
    });
    request.on("error", (error) => {
      reject(new FiscalError({
        code: "SEFAZ_NETWORK_OR_TLS_ERROR",
        message: `Falha de rede/TLS ao chamar SEFAZ: ${error.message}`,
        category: "NETWORK",
        retryable: true,
        cause: error,
        details: {
          url,
          originalCode: error.code ?? null,
          originalMessage: error.message
        }
      }));
    });
    request.write(body, "utf8");
    request.end();
  });
}
async function postStatusServicoSoap(url, body, config2) {
  try {
    return {
      rawResponse: await postSoapWithCertificate(url, body, config2),
      tlsValidation: "verified",
      warning: null
    };
  } catch (error) {
    if (config2.environment === "homologation" && isLocalIssuerCertificateError(error)) {
      return {
        rawResponse: await postSoapWithCertificate(url, body, config2, {
          allowUnauthorizedServerCertificate: true
        }),
        tlsValidation: "bypassed-homologation",
        warning: "A cadeia TLS do servidor da SEFAZ nao foi validada pelo Node/Electron. O diagnostico repetiu a chamada em homologacao sem validar o certificado do servidor. Para producao, configure a cadeia de CA confiavel no ambiente."
      };
    }
    throw error;
  }
}
function extractXmlTag(xml, tagName) {
  var _a;
  const match = xml.match(new RegExp(`<[^:>]*:?${tagName}[^>]*>([^<]*)</[^:>]*:?${tagName}>`, "i"));
  return ((_a = match == null ? void 0 : match[1]) == null ? void 0 : _a.trim()) ?? null;
}
class SefazDirectFiscalProvider {
  constructor() {
    __publicField(this, "providerId", "sefaz-direct");
  }
  async authorizeNfce(_request, _config) {
    throw new FiscalError({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async cancelNfce(_request, _config) {
    throw new FiscalError({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async consultStatus(_request, _config) {
    throw new FiscalError({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async testStatusServico(config2) {
    validateSefazDirectConfig(config2);
    const url = resolveStatusServicoUrl(config2);
    const rawRequest = buildStatusServicoSoap(config2);
    const startedAt = Date.now();
    const response = await postStatusServicoSoap(url, rawRequest, config2);
    const responseTimeMs = Date.now() - startedAt;
    const rawResponse = response.rawResponse;
    const statusCode = extractXmlTag(rawResponse, "cStat");
    const statusMessage = extractXmlTag(rawResponse, "xMotivo") ?? "Resposta recebida da SEFAZ sem xMotivo.";
    return {
      provider: "sefaz-direct",
      environment: config2.environment,
      uf: resolveUf(config2),
      model: 65,
      service: "NFeStatusServico4",
      url,
      success: statusCode === "107",
      statusCode,
      statusMessage,
      responseTimeMs,
      rawRequest,
      rawResponse,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
      tlsValidation: response.tlsValidation,
      warning: response.warning
    };
  }
}
class FiscalProviderFactory {
  constructor() {
    __publicField(this, "providers");
    this.providers = {
      mock: new MockFiscalProvider(),
      "sefaz-direct": new SefazDirectFiscalProvider(),
      gateway: new GatewayFiscalProvider()
    };
  }
  resolve(config2) {
    return this.providers[config2.provider];
  }
}
class SqliteFiscalQueueService {
  constructor(repository2, processor) {
    __publicField(this, "workerId");
    this.repository = repository2;
    this.processor = processor;
    this.workerId = `main-${process.pid}`;
  }
  async enqueue(request) {
    return this.repository.enqueue(request);
  }
  async processNext() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const item = this.repository.claimNextQueueItem(now, this.workerId);
    if (!item) {
      logger.info("[FiscalQueue] Nenhum item pronto para processamento.");
      return null;
    }
    return this.processClaimedItem(item);
  }
  async processById(queueId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const item = this.repository.claimQueueItemById(queueId, now, this.workerId);
    if (!item) {
      logger.warn(`[FiscalQueue] Item ${queueId} nao encontrado ou nao esta pronto para processamento.`);
      return this.repository.findQueueItemById(queueId);
    }
    return this.processClaimedItem(item);
  }
  async processClaimedItem(item) {
    logger.info(`[FiscalQueue] Iniciando job ${item.id} (${item.operation}).`);
    try {
      const result = await this.processor(item);
      if (result.status === "AUTHORIZED" || result.status === "REJECTED" || result.status === "CANCELLED" || result.status === "COMPLETED") {
        this.repository.markQueueItemDone(item.id, (/* @__PURE__ */ new Date()).toISOString(), result.result);
      } else if (result.status === "FAILED_RETRYABLE" || result.status === "PENDING_EXTERNAL") {
        this.repository.markQueueItemFailed(
          item.id,
          result.statusCode ?? result.status,
          result.statusMessage ?? "Aguardando novo processamento fiscal.",
          result.nextRetryAt ?? new Date(Date.now() + Math.max(item.attempts, 1) * 6e4).toISOString(),
          (/* @__PURE__ */ new Date()).toISOString(),
          result.result
        );
      } else {
        this.repository.markQueueItemFailed(
          item.id,
          result.statusCode ?? result.status,
          result.statusMessage ?? "Falha fiscal definitiva.",
          null,
          (/* @__PURE__ */ new Date()).toISOString(),
          result.result
        );
      }
      logger.info(`[FiscalQueue] Job ${item.id} concluido com status ${result.status}.`);
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_QUEUE_PROCESS_FAILED");
      const nextRetryAt = fiscalError.retryable ? new Date(Date.now() + item.attempts * 6e4).toISOString() : null;
      this.repository.markQueueItemFailed(
        item.id,
        fiscalError.code,
        fiscalError.message,
        nextRetryAt,
        (/* @__PURE__ */ new Date()).toISOString(),
        {
          success: false,
          statusCode: fiscalError.code,
          statusMessage: fiscalError.message,
          category: fiscalError.category,
          details: fiscalError.details ?? null
        }
      );
      logger.error(`[FiscalQueue] Job ${item.id} falhou: ${fiscalError.code} - ${fiscalError.message}`);
    }
    return this.repository.findQueueItemById(item.id);
  }
  async retry(queueId) {
    const item = this.repository.findQueueItemById(queueId);
    if (!item) {
      return null;
    }
    this.repository.markQueueItemFailed(
      queueId,
      item.lastErrorCode ?? "MANUAL_RETRY",
      item.lastErrorMessage ?? "Reprocessamento manual.",
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    );
    return this.processNext();
  }
  async list(limit = 20) {
    return this.repository.listQueueItems(limit);
  }
  async getSummary() {
    return this.repository.summarizeQueue();
  }
}
function normalizeDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}
function normalizeText(value) {
  return String(value ?? "").trim().toUpperCase();
}
function isValidNcm(value) {
  return /^\d{8}$/.test(value);
}
function isValidCfop(value) {
  return /^\d{4}$/.test(value);
}
function isValidOrigin(value) {
  return /^[0-8]$/.test(value);
}
function isValidCest(value) {
  return /^\d{7}$/.test(value);
}
function isValidGtin(value) {
  return /^(SEM GTIN|\d{8}|\d{12,14})$/.test(value);
}
function almostEqual(left, right) {
  return Math.abs(left - right) < 0.01;
}
function paymentLabel(method) {
  const labels = {
    DINHEIRO: "Dinheiro",
    PIX: "PIX",
    DEBITO: "Cartão de débito",
    CREDITO: "Cartão de crédito",
    VOUCHER: "Voucher",
    OUTROS: "Outros"
  };
  return labels[method];
}
class FiscalPreTransmissionValidator {
  validateAuthorizeRequest(request, config2) {
    const issues = [];
    const store = storeRepository.findById(request.companyId);
    if (!store) {
      issues.push({
        code: "STORE_NOT_FOUND",
        message: `Store fiscal ${request.companyId} não encontrada.`,
        field: "companyId",
        severity: "error"
      });
    }
    if (!request.series || request.series <= 0) {
      issues.push({
        code: "SERIES_INVALID",
        message: "Série fiscal inválida.",
        field: "series",
        severity: "error"
      });
    }
    if (!request.number || request.number <= 0) {
      issues.push({
        code: "NUMBER_INVALID",
        message: "Número fiscal inválido.",
        field: "number",
        severity: "error"
      });
    }
    if (!request.issuedAt) {
      issues.push({
        code: "ISSUED_AT_REQUIRED",
        message: "Data/hora de emissão não informada.",
        field: "issuedAt",
        severity: "error"
      });
    }
    this.validateEmitter(request, config2, (store == null ? void 0 : store.environment) ?? null, issues);
    this.validateCompanyConsistency((store == null ? void 0 : store.environment) ?? null, request.companyId, issues);
    this.validatePayments(request, issues);
    this.validateItems(request, issues);
    this.validateRuntimeConfig(request, config2, issues);
    if (issues.some((issue) => issue.severity === "error")) {
      throw new FiscalError({
        code: "FISCAL_PREREQUISITES_NOT_MET",
        message: "A venda não está pronta para emissão fiscal.",
        category: "VALIDATION",
        retryable: false,
        details: issues
      });
    }
  }
  validateEmitter(request, config2, storeEnvironment, issues) {
    const emitter = request.emitter;
    if (normalizeDigits(emitter.cnpj).length !== 14) {
      issues.push({ code: "EMITTER_CNPJ_INVALID", message: "CNPJ do emitente inválido.", field: "emitter.cnpj", severity: "error" });
    }
    if (!normalizeText(emitter.stateRegistration)) {
      issues.push({ code: "EMITTER_IE_REQUIRED", message: "IE do emitente é obrigatória.", field: "emitter.stateRegistration", severity: "error" });
    }
    if (!normalizeText(emitter.taxRegimeCode)) {
      issues.push({ code: "EMITTER_CRT_REQUIRED", message: "CRT do emitente é obrigatório.", field: "emitter.taxRegimeCode", severity: "error" });
    }
    if (!normalizeText(emitter.legalName)) {
      issues.push({ code: "EMITTER_LEGAL_NAME_REQUIRED", message: "Razão social do emitente é obrigatória.", field: "emitter.legalName", severity: "error" });
    }
    if (!normalizeText(emitter.tradeName)) {
      issues.push({ code: "EMITTER_TRADE_NAME_REQUIRED", message: "Nome fantasia do emitente é obrigatório.", field: "emitter.tradeName", severity: "error" });
    }
    if (!normalizeText(emitter.address.street) || !normalizeText(emitter.address.number) || !normalizeText(emitter.address.neighborhood)) {
      issues.push({ code: "EMITTER_ADDRESS_INCOMPLETE", message: "Endereço do emitente está incompleto.", field: "emitter.address", severity: "error" });
    }
    if (!normalizeText(emitter.address.city) || !normalizeText(emitter.address.state)) {
      issues.push({ code: "EMITTER_CITY_STATE_REQUIRED", message: "Cidade e UF do emitente são obrigatórias.", field: "emitter.address.city", severity: "error" });
    }
    if (normalizeDigits(emitter.address.cityIbgeCode).length !== 7) {
      issues.push({ code: "EMITTER_CITY_IBGE_INVALID", message: "Código IBGE do município do emitente é inválido.", field: "emitter.address.cityIbgeCode", severity: "error" });
    }
    if (request.environment !== config2.environment) {
      issues.push({
        code: "ENVIRONMENT_MISMATCH",
        message: "Ambiente do request diverge da configuração fiscal ativa.",
        field: "environment",
        severity: "error"
      });
    }
    if (storeEnvironment && request.environment !== storeEnvironment) {
      issues.push({
        code: "STORE_ENVIRONMENT_MISMATCH",
        message: "Ambiente fiscal da store diverge do request de emissão.",
        field: "environment",
        severity: "error"
      });
    }
  }
  validateCompanyConsistency(storeEnvironment, storeId, issues) {
    const store = storeRepository.findById(storeId);
    const company = db.prepare(`
      SELECT
        id,
        nome_fantasia,
        razao_social,
        cnpj,
        inscricao_estadual,
        ambiente_emissao,
        rua,
        numero,
        bairro,
        cidade,
        uf,
        cep,
        cod_municipio_ibge
      FROM company
      WHERE ativo = 1
      ORDER BY id ASC
      LIMIT 1
    `).get();
    if (!store || !company) {
      return;
    }
    const comparisons = [
      {
        code: "STORE_COMPANY_CNPJ_MISMATCH",
        left: normalizeDigits(store.cnpj),
        right: normalizeDigits(company.cnpj),
        message: "CNPJ divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_IE_MISMATCH",
        left: normalizeText(store.stateRegistration),
        right: normalizeText(company.inscricao_estadual),
        message: "IE divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_LEGAL_NAME_MISMATCH",
        left: normalizeText(store.legalName),
        right: normalizeText(company.razao_social),
        message: "Razão social divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_TRADE_NAME_MISMATCH",
        left: normalizeText(store.name),
        right: normalizeText(company.nome_fantasia),
        message: "Nome fantasia divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_CITY_MISMATCH",
        left: normalizeText(store.addressCity),
        right: normalizeText(company.cidade),
        message: "Cidade divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_STATE_MISMATCH",
        left: normalizeText(store.addressState),
        right: normalizeText(company.uf),
        message: "UF divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_IBGE_MISMATCH",
        left: normalizeDigits(store.addressCityIbgeCode),
        right: normalizeDigits(company.cod_municipio_ibge),
        message: "Código IBGE divergente entre stores e company."
      }
    ];
    for (const comparison of comparisons) {
      if (comparison.left !== comparison.right) {
        issues.push({
          code: comparison.code,
          message: comparison.message,
          severity: "error"
        });
      }
    }
    const companyEnvironment = company.ambiente_emissao === 1 ? "production" : "homologation";
    if (storeEnvironment && companyEnvironment !== storeEnvironment) {
      issues.push({
        code: "STORE_COMPANY_ENVIRONMENT_MISMATCH",
        message: "Ambiente divergente entre stores e company.",
        severity: "error"
      });
    }
  }
  validatePayments(request, issues) {
    if (request.payments.length === 0) {
      issues.push({
        code: "PAYMENTS_REQUIRED",
        message: "A venda precisa ter ao menos um pagamento fiscal.",
        field: "payments",
        severity: "error"
      });
      return;
    }
    const totalPayments = request.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    if (!almostEqual(totalPayments, request.totals.finalAmount)) {
      issues.push({
        code: "PAYMENTS_TOTAL_MISMATCH",
        message: "A soma dos pagamentos não corresponde ao total da venda.",
        field: "payments",
        severity: "error"
      });
    }
    request.payments.forEach((payment, index) => {
      if (payment.amount <= 0) {
        issues.push({
          code: "PAYMENT_AMOUNT_INVALID",
          message: `Pagamento ${index + 1} (${paymentLabel(payment.method)}) com valor inválido.`,
          field: `payments[${index}].amount`,
          severity: "error"
        });
      }
      if ((payment.changeAmount ?? 0) > 0 && payment.method !== "DINHEIRO") {
        issues.push({
          code: "PAYMENT_CHANGE_REQUIRES_CASH",
          message: `Troco só pode ser informado em pagamento em dinheiro.`,
          field: `payments[${index}].changeAmount`,
          severity: "error"
        });
      }
      if (payment.method === "DINHEIRO" && (payment.receivedAmount ?? 0) < payment.amount) {
        issues.push({
          code: "CASH_RECEIVED_AMOUNT_INVALID",
          message: `Pagamento ${index + 1} em dinheiro com valor recebido menor que o valor pago.`,
          field: `payments[${index}].receivedAmount`,
          severity: "error"
        });
      }
    });
    const totalChange = request.payments.reduce((sum, payment) => sum + Number(payment.changeAmount ?? 0), 0);
    if (!almostEqual(totalChange, request.totals.changeAmount)) {
      issues.push({
        code: "PAYMENTS_CHANGE_MISMATCH",
        message: "O troco dos pagamentos diverge do troco total da venda.",
        field: "payments",
        severity: "error"
      });
    }
  }
  validateItems(request, issues) {
    if (request.items.length === 0) {
      issues.push({
        code: "ITEMS_REQUIRED",
        message: "A venda precisa ter itens para emissão NFC-e.",
        field: "items",
        severity: "error"
      });
      return;
    }
    request.items.forEach((item, index) => {
      const itemId = item.id ?? null;
      if (!isValidNcm(item.tax.ncm)) {
        issues.push({ code: "ITEM_NCM_INVALID", message: "NCM ausente ou inválido.", field: `items[${index}].tax.ncm`, severity: "error", itemIndex: index, itemId });
      }
      if (!isValidCfop(item.tax.cfop)) {
        issues.push({ code: "ITEM_CFOP_INVALID", message: "CFOP ausente ou inválido.", field: `items[${index}].tax.cfop`, severity: "error", itemIndex: index, itemId });
      }
      if (!isValidOrigin(item.tax.originCode)) {
        issues.push({ code: "ITEM_ORIGIN_INVALID", message: "Origem fiscal ausente ou inválida.", field: `items[${index}].tax.originCode`, severity: "error", itemIndex: index, itemId });
      }
      if (!item.tax.csosn && !item.tax.icmsCst) {
        issues.push({ code: "ITEM_ICMS_CLASSIFICATION_REQUIRED", message: "CST/CSOSN de ICMS é obrigatório.", field: `items[${index}].tax`, severity: "error", itemIndex: index, itemId });
      }
      if (!normalizeText(item.tax.pisCst)) {
        issues.push({ code: "ITEM_PIS_CST_REQUIRED", message: "CST de PIS é obrigatório.", field: `items[${index}].tax.pisCst`, severity: "error", itemIndex: index, itemId });
      }
      if (!normalizeText(item.tax.cofinsCst)) {
        issues.push({ code: "ITEM_COFINS_CST_REQUIRED", message: "CST de COFINS é obrigatório.", field: `items[${index}].tax.cofinsCst`, severity: "error", itemIndex: index, itemId });
      }
      if (item.tax.cest && !isValidCest(item.tax.cest)) {
        issues.push({ code: "ITEM_CEST_INVALID", message: "CEST informado é inválido.", field: `items[${index}].tax.cest`, severity: "error", itemIndex: index, itemId });
      }
      if (item.gtin && !isValidGtin(item.gtin)) {
        issues.push({ code: "ITEM_GTIN_INVALID", message: "GTIN informado é inválido.", field: `items[${index}].gtin`, severity: "error", itemIndex: index, itemId });
      }
    });
  }
  validateRuntimeConfig(request, config2, issues) {
    if (config2.provider !== "mock") {
      if (!normalizeText(config2.cscId)) {
        issues.push({ code: "CSC_ID_REQUIRED", message: "CSC ID é obrigatório para NFC-e real.", field: "config.cscId", severity: "error" });
      }
      if (!normalizeText(config2.cscToken)) {
        issues.push({ code: "CSC_TOKEN_REQUIRED", message: "CSC Token é obrigatório para NFC-e real.", field: "config.cscToken", severity: "error" });
      }
    }
    if (config2.provider === "gateway") {
      if (!normalizeText(config2.gatewayBaseUrl)) {
        issues.push({ code: "GATEWAY_BASE_URL_REQUIRED", message: "URL base do gateway fiscal não configurada.", field: "config.gatewayBaseUrl", severity: "error" });
      }
      if (!normalizeText(config2.gatewayApiKey)) {
        issues.push({ code: "GATEWAY_API_KEY_REQUIRED", message: "API key do gateway fiscal não configurada.", field: "config.gatewayApiKey", severity: "error" });
      }
    }
    if (request.environment === "production" && config2.provider === "mock") {
      issues.push({
        code: "MOCK_PROVIDER_NOT_ALLOWED_IN_PRODUCTION",
        message: "Provider mock não pode ser usado em produção.",
        field: "config.provider",
        severity: "error"
      });
    }
  }
}
const fiscalPreTransmissionValidator = new FiscalPreTransmissionValidator();
function escapeXml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function money(value) {
  return Number(value ?? 0).toFixed(2);
}
class NfceXmlBuilderService {
  buildAuthorizeXml(request) {
    var _a;
    const itemsXml = request.items.map(
      (item, index) => `    <det nItem="${index + 1}">
      <prod>
        <cProd>${escapeXml(item.id)}</cProd>
        <xProd>${escapeXml(item.description)}</xProd>
        <cEAN>${escapeXml(item.gtin ?? "SEM GTIN")}</cEAN>
        <NCM>${escapeXml(item.tax.ncm)}</NCM>
        <CFOP>${escapeXml(item.tax.cfop)}</CFOP>
        ${item.tax.cest ? `<CEST>${escapeXml(item.tax.cest)}</CEST>` : ""}
        <uCom>${escapeXml(item.unit)}</uCom>
        <qCom>${escapeXml(item.quantity.toFixed(4))}</qCom>
        <vUnCom>${money(item.unitPrice)}</vUnCom>
        <vProd>${money(item.grossAmount)}</vProd>
        <uTrib>${escapeXml(item.unit)}</uTrib>
        <qTrib>${escapeXml(item.quantity.toFixed(4))}</qTrib>
        <vUnTrib>${money(item.unitPrice)}</vUnTrib>
        <vDesc>${money(item.discountAmount)}</vDesc>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ICMS><orig>${escapeXml(item.tax.originCode)}</orig>${item.tax.csosn ? `<CSOSN>${escapeXml(item.tax.csosn)}</CSOSN>` : ""}${item.tax.icmsCst ? `<CST>${escapeXml(item.tax.icmsCst)}</CST>` : ""}</ICMS>
        <PIS><CST>${escapeXml(item.tax.pisCst)}</CST></PIS>
        <COFINS><CST>${escapeXml(item.tax.cofinsCst)}</CST></COFINS>
      </imposto>
    </det>`
    ).join("\n");
    const paymentsXml = request.payments.map(
      (payment) => `      <detPag>
        <indPag>0</indPag>
        <tPag>${escapeXml(payment.method)}</tPag>
        <vPag>${money(payment.amount)}</vPag>
        ${payment.description ? `<xPag>${escapeXml(payment.description)}</xPag>` : ""}
      </detPag>`
    ).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe versao="4.00" Id="">
    <ide>
      <mod>65</mod>
      <serie>${escapeXml(request.series)}</serie>
      <nNF>${escapeXml(request.number)}</nNF>
      <dhEmi>${escapeXml(request.issuedAt)}</dhEmi>
      <tpAmb>${request.environment === "production" ? "1" : "2"}</tpAmb>
      <tpImp>4</tpImp>
      <tpEmis>1</tpEmis>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
    </ide>
    <emit>
      <CNPJ>${escapeXml(request.emitter.cnpj)}</CNPJ>
      <xNome>${escapeXml(request.emitter.legalName)}</xNome>
      <xFant>${escapeXml(request.emitter.tradeName)}</xFant>
      <IE>${escapeXml(request.emitter.stateRegistration)}</IE>
      <CRT>${escapeXml(request.emitter.taxRegimeCode)}</CRT>
      <enderEmit>
        <xLgr>${escapeXml(request.emitter.address.street)}</xLgr>
        <nro>${escapeXml(request.emitter.address.number)}</nro>
        <xBairro>${escapeXml(request.emitter.address.neighborhood)}</xBairro>
        <cMun>${escapeXml(request.emitter.address.cityIbgeCode)}</cMun>
        <xMun>${escapeXml(request.emitter.address.city)}</xMun>
        <UF>${escapeXml(request.emitter.address.state)}</UF>
        <CEP>${escapeXml(request.emitter.address.zipCode)}</CEP>
      </enderEmit>
    </emit>
    ${((_a = request.customer) == null ? void 0 : _a.cpfCnpj) ? `<dest>
      <${request.customer.cpfCnpj.replace(/\D/g, "").length === 11 ? "CPF" : "CNPJ"}>${escapeXml(request.customer.cpfCnpj)}</${request.customer.cpfCnpj.replace(/\D/g, "").length === 11 ? "CPF" : "CNPJ"}>
      ${request.customer.name ? `<xNome>${escapeXml(request.customer.name)}</xNome>` : ""}
    </dest>` : ""}
${itemsXml}
    <total>
      <ICMSTot>
        <vProd>${money(request.totals.productsAmount)}</vProd>
        <vDesc>${money(request.totals.discountAmount)}</vDesc>
        <vNF>${money(request.totals.finalAmount)}</vNF>
      </ICMSTot>
    </total>
    <pag>
${paymentsXml}
      <vTroco>${money(request.totals.changeAmount)}</vTroco>
    </pag>
    ${request.additionalInfo ? `<infAdic><infCpl>${escapeXml(request.additionalInfo)}</infCpl></infAdic>` : ""}
  </infNFe>
</NFe>`;
  }
}
const nfceXmlBuilderService = new NfceXmlBuilderService();
class DefaultFiscalService {
  constructor(repository2, queueService2, certificateService2, danfeService2, configService2, resolveProvider) {
    this.repository = repository2;
    this.queueService = queueService2;
    this.certificateService = certificateService2;
    this.danfeService = danfeService2;
    this.configService = configService2;
    this.resolveProvider = resolveProvider;
  }
  async getConfig() {
    return this.configService.getConfigView();
  }
  async saveConfig(input) {
    return this.configService.saveConfig(input);
  }
  async authorizeNfce(request) {
    const existing = this.repository.findBySaleId(request.saleId);
    if ((existing == null ? void 0 : existing.status) === "AUTHORIZED") {
      return {
        status: "AUTHORIZED",
        provider: this.configService.getConfig().provider,
        accessKey: existing.accessKey,
        protocol: existing.authorizationProtocol,
        statusCode: existing.statusCode,
        statusMessage: existing.statusMessage ?? "Documento já autorizado.",
        authorizedAt: existing.authorizedAt,
        xmlAuthorized: existing.xmlAuthorized,
        xmlSent: existing.xmlSent,
        qrCodeUrl: existing.qrCodeUrl
      };
    }
    const persisted = existing ?? this.repository.createPendingDocument(request);
    const config2 = this.configService.getConfig();
    fiscalPreTransmissionValidator.validateAuthorizeRequest(request, config2);
    this.repository.updateStatus(persisted.id, "PENDING");
    const builtXml = nfceXmlBuilderService.buildAuthorizeXml(request);
    this.repository.updateTransmissionArtifacts(persisted.id, {
      issuedAt: request.issuedAt,
      xmlBuilt: builtXml
    });
    try {
      await this.certificateService.assertCertificateReady(config2);
      const provider = this.resolveProvider();
      const response = await provider.authorizeNfce(request, config2);
      const enrichedResponse = {
        ...response,
        issuedAt: response.issuedAt ?? request.issuedAt,
        xmlBuilt: response.xmlBuilt ?? builtXml
      };
      if (enrichedResponse.status === "AUTHORIZED") {
        const document = this.repository.markAsAuthorized(persisted.id, enrichedResponse);
        const danfe = await this.danfeService.generate(document);
        this.repository.updateDanfePath(document.id, danfe.danfePath);
      } else {
        this.repository.markAsRejected(persisted.id, enrichedResponse);
      }
      return enrichedResponse;
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_AUTHORIZE_FAILED");
      this.repository.updateStatus(persisted.id, "ERROR", fiscalError.code, fiscalError.message);
      if (request.offlineFallbackMode === "queue" || fiscalError.retryable) {
        await this.queueService.enqueue({
          saleId: request.saleId,
          documentId: persisted.id,
          operation: "AUTHORIZE_NFCE",
          idempotencyKey: request.idempotencyKey,
          payload: request
        });
        this.repository.updateStatus(persisted.id, "QUEUED", fiscalError.code, fiscalError.message);
        return {
          status: "QUEUED",
          provider: config2.provider,
          statusCode: fiscalError.code,
          statusMessage: fiscalError.message
        };
      }
      throw fiscalError;
    }
  }
  async cancelNfce(request) {
    const document = this.repository.findById(request.documentId);
    if (!document) {
      throw new FiscalError({
        code: "FISCAL_DOCUMENT_NOT_FOUND",
        message: `Documento fiscal ${request.documentId} não encontrado.`,
        category: "VALIDATION"
      });
    }
    if (document.status === "CANCELLED") {
      return {
        status: "CANCELLED",
        provider: this.configService.getConfig().provider,
        cancellationProtocol: document.cancellationProtocol,
        cancelledAt: document.cancelledAt,
        statusCode: document.statusCode,
        statusMessage: document.statusMessage ?? "Documento já cancelado.",
        xmlCancellation: document.xmlCancellation
      };
    }
    const provider = this.resolveProvider();
    const config2 = this.configService.getConfig();
    const response = await provider.cancelNfce(request, config2);
    this.repository.markAsCancelled(document.id, request, response);
    return response;
  }
  async consultStatusByAccessKey(accessKey) {
    const config2 = this.configService.getConfig();
    const provider = this.resolveProvider();
    const response = await provider.consultStatus({ accessKey }, config2);
    const document = this.repository.findByAccessKey(accessKey);
    if (document) {
      this.repository.updateStatus(document.id, response.status, response.statusCode, response.statusMessage);
    }
    return response;
  }
  async runStatusServiceDiagnostic() {
    const config2 = this.configService.getConfig();
    const idempotencyKey = `fiscal:test-status:${Date.now()}`;
    logger.info(`[FiscalDiagnostic] Criando job ${idempotencyKey} para NFeStatusServico4.`);
    const item = await this.queueService.enqueue({
      saleId: 0,
      documentId: null,
      operation: "TEST_STATUS_NFCE",
      idempotencyKey,
      maxAttempts: 1,
      payload: {
        saleId: 0,
        operation: "TEST_STATUS_NFCE",
        provider: config2.provider,
        environment: config2.environment,
        uf: config2.uf ?? "SP",
        model: config2.model ?? 65,
        requestedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    const processed = await this.queueService.processById(item.id);
    return processed ?? item;
  }
  async getDanfe(documentId) {
    const document = this.repository.findById(documentId);
    if (!document) {
      throw new FiscalError({
        code: "DANFE_DOCUMENT_NOT_FOUND",
        message: `Documento fiscal ${documentId} não encontrado.`,
        category: "VALIDATION"
      });
    }
    const recovered = await this.danfeService.recover(document);
    if (recovered) {
      return recovered;
    }
    const generated = await this.danfeService.generate(document);
    this.repository.updateDanfePath(documentId, generated.danfePath);
    return generated;
  }
  async enqueuePending(request) {
    return this.queueService.enqueue(request);
  }
  async reprocessQueueItem(queueId) {
    return this.queueService.retry(queueId);
  }
  async listQueue(limit = 20) {
    return this.queueService.list(limit);
  }
  async getQueueSummary() {
    return this.queueService.getSummary();
  }
}
const repository = new SqliteFiscalRepository();
repository.ensureSchema();
const configService = new IntegrationFiscalSettingsService();
const providerFactory = new FiscalProviderFactory();
const certificateService = new FileSystemCertificateService();
const danfeService = new HtmlDanfeService();
let fiscalServiceRef;
function mapAuthorizeQueueResult(response) {
  if (response.status === "AUTHORIZED") {
    return {
      status: "AUTHORIZED",
      statusCode: response.statusCode ?? null,
      statusMessage: response.statusMessage
    };
  }
  if (response.status === "REJECTED") {
    return {
      status: "REJECTED",
      statusCode: response.statusCode ?? null,
      statusMessage: response.statusMessage
    };
  }
  if (response.status === "QUEUED" || response.status === "PENDING" || response.status === "CONTINGENCY") {
    return {
      status: "PENDING_EXTERNAL",
      statusCode: response.statusCode ?? null,
      statusMessage: response.statusMessage
    };
  }
  return {
    status: "FAILED_RETRYABLE",
    statusCode: response.statusCode ?? null,
    statusMessage: response.statusMessage
  };
}
function mapCancelQueueResult(response) {
  if (response.status === "CANCELLED") {
    return {
      status: "CANCELLED",
      statusCode: response.statusCode ?? null,
      statusMessage: response.statusMessage
    };
  }
  return {
    status: "FAILED_FINAL",
    statusCode: response.statusCode ?? null,
    statusMessage: response.statusMessage
  };
}
const queueService = new SqliteFiscalQueueService(repository, async (item) => {
  const payload = item.payload;
  if (item.operation === "AUTHORIZE_NFCE") {
    const response = await fiscalServiceRef.authorizeNfce(payload);
    return mapAuthorizeQueueResult(response);
  }
  if (item.operation === "CANCEL_NFCE") {
    const response = await fiscalServiceRef.cancelNfce(payload);
    return mapCancelQueueResult(response);
  }
  if (item.operation === "TEST_STATUS_NFCE") {
    const config2 = configService.getConfig();
    logger.info(`[FiscalDiagnostic] Iniciando NFeStatusServico4 provider=${config2.provider} ambiente=${config2.environment} uf=${config2.uf ?? "SP"}.`);
    await certificateService.assertCertificateReady(config2);
    logger.info("[FiscalDiagnostic] Certificado validado com sucesso.");
    const provider = providerFactory.resolve(config2);
    const result = await provider.testStatusServico(config2);
    logger.info(`[FiscalDiagnostic] NFeStatusServico4 finalizado url=${result.url} cStat=${result.statusCode ?? "sem cStat"} xMotivo=${result.statusMessage}.`);
    return {
      status: result.success ? "COMPLETED" : "FAILED_FINAL",
      statusCode: result.statusCode ?? "SEFAZ_STATUS_FAILED",
      statusMessage: result.statusMessage,
      result
    };
  }
  return {
    status: "FAILED_FINAL",
    statusCode: "QUEUE_OPERATION_NOT_SUPPORTED",
    statusMessage: `Operação de fila não suportada: ${item.operation}`
  };
});
fiscalServiceRef = new DefaultFiscalService(
  repository,
  queueService,
  certificateService,
  danfeService,
  configService,
  () => providerFactory.resolve(configService.getConfig())
);
const fiscalService = fiscalServiceRef;
const fiscalConfigService = configService;
const fiscalQueueService = queueService;
const fiscalCertificateService = certificateService;
let fiscalQueueWorkerStarted = false;
function startFiscalQueueWorker(intervalMs = 15e3) {
  if (fiscalQueueWorkerStarted) {
    return;
  }
  fiscalQueueWorkerStarted = true;
  setInterval(() => {
    void fiscalQueueService.processNext();
  }, intervalMs);
}
let currentSessionId = null;
function setCurrentSession(id) {
  currentSessionId = id;
}
function getCurrentSession() {
  return currentSessionId;
}
const ROLE_ALIASES = {
  admin: ["admin", "administrador", "administrator", "dono", "owner"],
  manager: ["gerente", "gestor", "manager", "supervisor"],
  cashier: ["caixa", "operador", "operador de caixa", "atendente", "vendedor"],
  stock: ["estoque", "almoxarife"],
  unknown: []
};
const ROLE_PERMISSIONS = {
  admin: [
    "pdv:access",
    "home:access",
    "sales:view",
    "products:view",
    "products:manage",
    "discounts:apply",
    "cash:withdraw",
    "config:access",
    "users:manage",
    "printers:manage",
    "integrations:manage",
    "fiscal:manage"
  ],
  manager: [
    "pdv:access",
    "home:access",
    "sales:view",
    "products:view",
    "products:manage",
    "discounts:apply",
    "cash:withdraw",
    "config:access",
    "users:manage"
  ],
  cashier: ["pdv:access", "sales:view", "products:view"],
  stock: ["home:access", "products:view", "products:manage"],
  unknown: []
};
function normalizeRole(role) {
  const normalized = String(role ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [roleKey, aliases] of Object.entries(ROLE_ALIASES)) {
    if (aliases.includes(normalized)) return roleKey;
  }
  return "unknown";
}
function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[normalizeRole(role)];
}
function hasPermission(role, permission) {
  return getPermissionsForRole(role).includes(permission);
}
function getPermissionDeniedMessage(permission) {
  const messages = {
    "home:access": "Seu perfil não pode acessar a tela inicial.",
    "pdv:access": "Seu perfil não pode acessar o caixa.",
    "sales:view": "Seu perfil não pode consultar vendas.",
    "products:view": "Seu perfil não pode consultar produtos.",
    "products:manage": "Seu perfil não pode gerenciar produtos.",
    "discounts:apply": "Somente gerente ou administrador pode conceder descontos.",
    "cash:withdraw": "Somente gerente ou administrador pode registrar sangria.",
    "config:access": "Seu perfil não pode acessar as configurações.",
    "users:manage": "Somente gerente ou administrador pode gerenciar usuários.",
    "printers:manage": "Somente gerente ou administrador pode gerenciar impressoras.",
    "integrations:manage": "Somente gerente ou administrador pode gerenciar integrações.",
    "fiscal:manage": "Somente gerente ou administrador pode gerenciar configurações fiscais."
  };
  return messages[permission];
}
function getCurrentUser() {
  const sessionId = getCurrentSession();
  if (!sessionId) return null;
  const user = db.prepare(`
    SELECT u.id, u.nome, u.funcao, u.ativo
    FROM sessions s
    INNER JOIN usuarios u ON u.id = s.user_id
    WHERE s.id = ?
      AND s.active = 1
    LIMIT 1
  `).get(sessionId);
  return user ?? null;
}
function assertCurrentUserPermission(permission) {
  const user = getCurrentUser();
  if (!user || !user.ativo) {
    throw new Error("Sessão inválida ou usuário inativo.");
  }
  if (!hasPermission(user.funcao, permission)) {
    throw new Error(getPermissionDeniedMessage(permission));
  }
  return user;
}
function currentUserHasPermission(permission) {
  const user = getCurrentUser();
  return Boolean(user && user.ativo && hasPermission(user.funcao, permission));
}
function registerFiscalHandlers() {
  ipcMain.handle("fiscal:get-runtime-config", async () => {
    assertCurrentUserPermission("fiscal:manage");
    return fiscalService.getConfig();
  });
  ipcMain.handle("fiscal:save-runtime-config", async (_event, input) => {
    try {
      assertCurrentUserPermission("fiscal:manage");
      return await fiscalService.saveConfig(input);
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_CONFIG_SAVE_FAILED");
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable
        }
      };
    }
  });
  ipcMain.handle("fiscal:get-certificate-info", async () => {
    assertCurrentUserPermission("fiscal:manage");
    return fiscalCertificateService.getCertificateInfo(fiscalConfigService.getConfig());
  });
  ipcMain.handle("fiscal:authorize-nfce", async (_event, request) => {
    try {
      assertCurrentUserPermission("fiscal:manage");
      return {
        success: true,
        data: await fiscalService.authorizeNfce(request)
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_AUTHORIZE_FAILED");
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable
        }
      };
    }
  });
  ipcMain.handle("fiscal:cancel-nfce", async (_event, request) => {
    try {
      assertCurrentUserPermission("fiscal:manage");
      return {
        success: true,
        data: await fiscalService.cancelNfce(request)
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_CANCEL_FAILED");
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable
        }
      };
    }
  });
  ipcMain.handle("fiscal:consult-status", async (_event, accessKey) => {
    try {
      assertCurrentUserPermission("fiscal:manage");
      return {
        success: true,
        data: await fiscalService.consultStatusByAccessKey(accessKey)
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_CONSULT_FAILED");
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable
        }
      };
    }
  });
  ipcMain.handle("fiscal:get-danfe", async (_event, documentId) => {
    try {
      assertCurrentUserPermission("fiscal:manage");
      return {
        success: true,
        data: await fiscalService.getDanfe(documentId)
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_DANFE_FAILED");
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable
        }
      };
    }
  });
  ipcMain.handle("fiscal:get-queue-summary", async () => {
    assertCurrentUserPermission("fiscal:manage");
    return fiscalService.getQueueSummary();
  });
  ipcMain.handle("fiscal:list-queue", async (_event, limit = 20) => {
    assertCurrentUserPermission("fiscal:manage");
    return fiscalService.listQueue(limit);
  });
  ipcMain.handle("fiscal:reprocess-queue-item", async (_event, queueId) => {
    try {
      assertCurrentUserPermission("fiscal:manage");
      return {
        success: true,
        data: await fiscalService.reprocessQueueItem(queueId)
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_REPROCESS_FAILED");
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable
        }
      };
    }
  });
  ipcMain.handle("fiscal:process-next-queue-item", async () => {
    try {
      assertCurrentUserPermission("fiscal:manage");
      logger.info("[FiscalIPC] fiscal:process-next-queue-item recebido.");
      return {
        success: true,
        data: await fiscalQueueService.processNext()
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_PROCESS_QUEUE_FAILED");
      logger.error(`[FiscalIPC] Falha em fiscal:process-next-queue-item: ${fiscalError.code} - ${fiscalError.message}`);
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable
        }
      };
    }
  });
  ipcMain.handle("fiscal:run-status-diagnostic", async () => {
    try {
      assertCurrentUserPermission("fiscal:manage");
      logger.info("[FiscalIPC] fiscal:run-status-diagnostic recebido.");
      return {
        success: true,
        data: await fiscalService.runStatusServiceDiagnostic()
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "FISCAL_STATUS_DIAGNOSTIC_FAILED");
      logger.error(`[FiscalIPC] Falha em fiscal:run-status-diagnostic: ${fiscalError.code} - ${fiscalError.message}`);
      return {
        success: false,
        error: {
          code: fiscalError.code,
          message: fiscalError.message,
          category: fiscalError.category,
          retryable: fiscalError.retryable
        }
      };
    }
  });
}
function mapDocument(row) {
  return {
    id: row.id,
    saleId: row.sale_id,
    storeId: row.store_id,
    model: row.model,
    series: row.series,
    number: row.number,
    accessKey: row.access_key,
    environment: row.environment,
    status: row.status,
    issuedDatetime: row.issued_datetime,
    xml: row.xml,
    xmlSigned: row.xml_signed,
    xmlAuthorized: row.xml_authorized,
    xmlCancellation: row.xml_cancellation,
    protocol: row.protocol,
    receiptNumber: row.receipt_number,
    qrCodeUrl: row.qr_code_url,
    authorizationDatetime: row.authorization_datetime,
    cancelDatetime: row.cancel_datetime,
    contingencyType: row.contingency_type,
    rejectionCode: row.rejection_code,
    rejectionReason: row.rejection_reason,
    danfePath: row.danfe_path,
    provider: row.provider,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
class FiscalDocumentRepository {
  createPending(input) {
    const result = db.prepare(`
      INSERT INTO fiscal_documents (
        sale_id, store_id, model, series, number, access_key, environment, status,
        issued_datetime, xml, xml_signed, xml_authorized, xml_cancellation, protocol, receipt_number, qr_code_url, authorization_datetime,
        cancel_datetime, contingency_type, rejection_code, rejection_reason, danfe_path,
        provider, created_at, updated_at
      ) VALUES (?, ?, 65, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      input.saleId,
      input.storeId,
      input.series,
      input.number,
      input.accessKey ?? null,
      input.environment,
      input.status,
      input.issuedDatetime ?? null,
      input.xml ?? null,
      input.xmlSigned ?? null,
      input.xmlAuthorized ?? null,
      input.xmlCancellation ?? null,
      input.protocol ?? null,
      input.receiptNumber ?? null,
      input.qrCodeUrl ?? null,
      input.authorizationDatetime ?? null,
      input.cancelDatetime ?? null,
      input.contingencyType ?? null,
      input.rejectionCode ?? null,
      input.rejectionReason ?? null,
      input.danfePath ?? null,
      input.provider ?? null
    );
    return this.findById(Number(result.lastInsertRowid));
  }
  upsertBySale(input) {
    const existing = this.findBySaleId(input.saleId);
    if (!existing) {
      return this.createPending(input);
    }
    db.prepare(`
      UPDATE fiscal_documents
      SET
        store_id = ?,
        series = ?,
        number = ?,
        access_key = ?,
        environment = ?,
        status = ?,
        issued_datetime = ?,
        xml = ?,
        xml_signed = ?,
        xml_authorized = ?,
        xml_cancellation = ?,
        protocol = ?,
        receipt_number = ?,
        qr_code_url = ?,
        authorization_datetime = ?,
        cancel_datetime = ?,
        contingency_type = ?,
        rejection_code = ?,
        rejection_reason = ?,
        danfe_path = ?,
        provider = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      input.storeId,
      input.series,
      input.number,
      input.accessKey ?? existing.accessKey ?? null,
      input.environment,
      input.status,
      input.issuedDatetime ?? existing.issuedDatetime ?? null,
      input.xml ?? existing.xml ?? null,
      input.xmlSigned ?? existing.xmlSigned ?? null,
      input.xmlAuthorized ?? existing.xmlAuthorized ?? null,
      input.xmlCancellation ?? existing.xmlCancellation ?? null,
      input.protocol ?? existing.protocol ?? null,
      input.receiptNumber ?? existing.receiptNumber ?? null,
      input.qrCodeUrl ?? existing.qrCodeUrl ?? null,
      input.authorizationDatetime ?? existing.authorizationDatetime ?? null,
      input.cancelDatetime ?? existing.cancelDatetime ?? null,
      input.contingencyType ?? existing.contingencyType ?? null,
      input.rejectionCode ?? existing.rejectionCode ?? null,
      input.rejectionReason ?? existing.rejectionReason ?? null,
      input.danfePath ?? existing.danfePath ?? null,
      input.provider ?? existing.provider ?? null,
      existing.id
    );
    return this.findById(existing.id);
  }
  findById(id) {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1`).get(id);
    return row ? mapDocument(row) : null;
  }
  findBySaleId(saleId) {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1`).get(saleId);
    return row ? mapDocument(row) : null;
  }
  findByAccessKey(accessKey) {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1`).get(accessKey);
    return row ? mapDocument(row) : null;
  }
  markCancelled(id, cancelDatetime, protocol) {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = 'CANCELLED',
        cancel_datetime = ?,
        protocol = COALESCE(?, protocol),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cancelDatetime, protocol ?? null, id);
  }
}
const fiscalDocumentRepository = new FiscalDocumentRepository();
const FiscalDocumentStatuses = {
  DRAFT: "DRAFT",
  QUEUED: "QUEUED",
  SIGNING: "SIGNING",
  TRANSMITTING: "TRANSMITTING",
  AUTHORIZED: "AUTHORIZED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  CONTINGENCY: "CONTINGENCY",
  ERROR: "ERROR"
};
const FiscalEventTypes = {
  AUTHORIZATION_REQUESTED: "AUTHORIZATION_REQUESTED",
  AUTHORIZATION_RESPONSE: "AUTHORIZATION_RESPONSE",
  STATUS_CONSULTED: "STATUS_CONSULTED",
  CANCELLATION_REQUESTED: "CANCELLATION_REQUESTED",
  CANCELLATION_RESPONSE: "CANCELLATION_RESPONSE",
  DANFE_REPRINTED: "DANFE_REPRINTED",
  CONTINGENCY_ACTIVATED: "CONTINGENCY_ACTIVATED",
  CONTINGENCY_SYNC_REQUESTED: "CONTINGENCY_SYNC_REQUESTED"
};
class FiscalNumberingService {
  getOrReserveForSale(saleId, storeId) {
    const existing = fiscalDocumentRepository.findBySaleId(saleId);
    if (existing) {
      return {
        series: existing.series,
        number: existing.number
      };
    }
    return storeRepository.reserveNextNfceNumber(storeId);
  }
}
const fiscalNumberingService = new FiscalNumberingService();
function mapPaymentMethod(tpag) {
  const map = {
    "01": "DINHEIRO",
    "03": "CREDITO",
    "04": "DEBITO",
    "10": "VOUCHER",
    "17": "PIX"
  };
  return map[tpag] ?? "OUTROS";
}
function mapEnvironment(ambiente) {
  return ambiente === 1 ? "production" : "homologation";
}
function resolvePrimaryPaymentMethod(payments) {
  if (payments.length === 0) {
    return "OUTROS";
  }
  const unique = new Set(payments.map((payment) => payment.method));
  return unique.size === 1 ? payments[0].method : "OUTROS";
}
class PdvSaleFiscalAdapter {
  loadActiveCompany() {
    const company = db.prepare(`
      SELECT
        nome_fantasia,
        razao_social,
        cnpj,
        inscricao_estadual,
        crt,
        rua,
        numero,
        bairro,
        cidade,
        uf,
        cep,
        cod_municipio_ibge,
        ambiente_emissao,
        serie_nfce,
        proximo_numero_nfce,
        csc_id,
        csc_token
      FROM company
      WHERE ativo = 1
      LIMIT 1
    `).get();
    return company ?? null;
  }
  resolveActiveStore() {
    const existingStore = storeRepository.findActive();
    if (existingStore) {
      return existingStore;
    }
    const company = this.loadActiveCompany();
    if (!company) {
      throw new Error("Nenhuma store ativa encontrada e não existe company ativa para criar o espelho fiscal.");
    }
    return storeRepository.create({
      code: "MAIN",
      name: company.nome_fantasia,
      legalName: company.razao_social,
      cnpj: company.cnpj,
      stateRegistration: company.inscricao_estadual,
      taxRegimeCode: String(company.crt),
      environment: mapEnvironment(company.ambiente_emissao),
      cscId: company.csc_id,
      cscToken: company.csc_token,
      defaultSeries: Number(company.serie_nfce ?? 1),
      nextNfceNumber: Number(company.proximo_numero_nfce ?? 1),
      addressStreet: company.rua,
      addressNumber: company.numero,
      addressNeighborhood: company.bairro,
      addressCity: company.cidade,
      addressState: company.uf,
      addressZipCode: company.cep,
      addressCityIbgeCode: company.cod_municipio_ibge,
      active: true
    });
  }
  loadLegacySale(legacySaleId) {
    const sale = db.prepare(`
      SELECT
        id, ambiente, data_emissao, valor_produtos, valor_desconto,
        valor_total, valor_troco, cliente_nome, cpf_cliente, cnpj_cliente
      FROM vendas
      WHERE id = ?
      LIMIT 1
    `).get(legacySaleId);
    if (!sale) {
      throw new Error(`Venda ${legacySaleId} não encontrada para emissão fiscal.`);
    }
    return sale;
  }
  loadLegacyItems(legacySaleId) {
    return db.prepare(`
      SELECT
        vi.id,
        vi.produto_id,
        vi.codigo_produto,
        vi.nome_produto,
        vi.gtin,
        vi.unidade_comercial,
        vi.quantidade_comercial,
        vi.valor_unitario_comercial,
        vi.valor_bruto,
        vi.valor_desconto,
        vi.subtotal,
        vi.ncm,
        vi.cfop,
        vi.cest,
        snapshot.origin_code,
        snapshot.csosn,
        snapshot.icms_cst,
        snapshot.pis_cst,
        snapshot.cofins_cst
      FROM venda_itens vi
      LEFT JOIN sale_item_tax_snapshot snapshot
        ON snapshot.sale_item_id = vi.id
      WHERE vi.venda_id = ?
      ORDER BY vi.id ASC
    `).all(legacySaleId);
  }
  loadLegacyPayments(legacySaleId) {
    return db.prepare(`
      SELECT id, tpag, valor, valor_recebido, troco, descricao_outro
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id ASC
    `).all(legacySaleId);
  }
  buildAuthorizeRequest(legacySaleId, storeId, series, number) {
    const sale = this.loadLegacySale(legacySaleId);
    const store = storeRepository.findById(storeId);
    if (!store) {
      throw new Error(`Store fiscal ${storeId} não encontrada para emissão.`);
    }
    const items = this.loadLegacyItems(legacySaleId);
    const payments = this.loadLegacyPayments(legacySaleId).map((payment) => ({
      method: mapPaymentMethod(payment.tpag),
      amount: Number(payment.valor ?? 0),
      receivedAmount: payment.valor_recebido != null ? Number(payment.valor_recebido) : void 0,
      changeAmount: payment.troco != null ? Number(payment.troco) : void 0,
      description: payment.descricao_outro ?? null
    }));
    return {
      saleId: sale.id,
      companyId: store.id,
      number,
      series,
      environment: mapEnvironment(sale.ambiente),
      paymentMethod: resolvePrimaryPaymentMethod(payments),
      payments,
      issuedAt: sale.data_emissao,
      emitter: {
        cnpj: store.cnpj,
        stateRegistration: store.stateRegistration,
        legalName: store.legalName,
        tradeName: store.name,
        taxRegimeCode: String(store.taxRegimeCode),
        address: {
          street: store.addressStreet,
          number: store.addressNumber,
          neighborhood: store.addressNeighborhood,
          city: store.addressCity,
          state: store.addressState,
          zipCode: store.addressZipCode,
          cityIbgeCode: store.addressCityIbgeCode
        }
      },
      customer: {
        name: sale.cliente_nome ?? void 0,
        cpfCnpj: sale.cpf_cliente ?? sale.cnpj_cliente ?? null
      },
      items: items.map((item) => ({
        id: item.produto_id ?? item.codigo_produto,
        description: item.nome_produto,
        unit: item.unidade_comercial,
        quantity: Number(item.quantidade_comercial ?? 0),
        unitPrice: Number(item.valor_unitario_comercial ?? 0),
        grossAmount: Number(item.valor_bruto ?? 0),
        discountAmount: Number(item.valor_desconto ?? 0),
        totalAmount: Number(item.subtotal ?? 0),
        gtin: item.gtin,
        tax: {
          ncm: item.ncm ?? "",
          cfop: item.cfop ?? "",
          cest: item.cest,
          originCode: item.origin_code ?? "",
          csosn: item.csosn,
          icmsCst: item.icms_cst,
          pisCst: item.pis_cst ?? "",
          cofinsCst: item.cofins_cst ?? ""
        }
      })),
      totals: {
        productsAmount: Number(sale.valor_produtos ?? 0),
        discountAmount: Number(sale.valor_desconto ?? 0),
        finalAmount: Number(sale.valor_total ?? 0),
        receivedAmount: payments.reduce((sum, payment) => sum + Number(payment.receivedAmount ?? payment.amount ?? 0), 0),
        changeAmount: payments.reduce((sum, payment) => sum + Number(payment.changeAmount ?? 0), 0) || Number(sale.valor_troco ?? 0)
      },
      additionalInfo: `Venda PDV ${sale.id}`,
      offlineFallbackMode: "queue",
      idempotencyKey: `nfce-sale-${sale.id}`
    };
  }
  mirrorLegacySale(legacySaleId) {
    const store = this.resolveActiveStore();
    const sale = this.loadLegacySale(legacySaleId);
    const items = this.loadLegacyItems(legacySaleId);
    const payments = this.loadLegacyPayments(legacySaleId);
    const externalReference = `legacy-sale:${legacySaleId}`;
    const existing = salesRepository.findByExternalReference(externalReference);
    const aggregate = existing ?? salesRepository.create({
      storeId: store.id,
      customerName: sale.cliente_nome ?? null,
      customerDocument: sale.cpf_cliente ?? sale.cnpj_cliente ?? null,
      status: "PAID",
      subtotalAmount: Number(sale.valor_produtos ?? 0),
      discountAmount: Number(sale.valor_desconto ?? 0),
      totalAmount: Number(sale.valor_total ?? 0),
      changeAmount: Number(sale.valor_troco ?? 0),
      externalReference,
      items: items.map((item) => ({
        productId: item.produto_id ?? item.codigo_produto,
        description: item.nome_produto,
        unit: item.unidade_comercial,
        quantity: Number(item.quantidade_comercial ?? 0),
        unitPrice: Number(item.valor_unitario_comercial ?? 0),
        grossAmount: Number(item.valor_bruto ?? 0),
        discountAmount: Number(item.valor_desconto ?? 0),
        totalAmount: Number(item.subtotal ?? 0),
        ncm: item.ncm ?? null,
        cfop: item.cfop ?? null,
        cest: item.cest,
        originCode: item.origin_code,
        taxSnapshot: {
          ncm: item.ncm,
          cfop: item.cfop,
          cest: item.cest,
          originCode: item.origin_code,
          csosn: item.csosn,
          icmsCst: item.icms_cst,
          pisCst: item.pis_cst,
          cofinsCst: item.cofins_cst
        }
      })),
      payments: payments.map((payment) => ({
        method: mapPaymentMethod(payment.tpag),
        amount: Number(payment.valor ?? 0),
        receivedAmount: payment.valor_recebido != null ? Number(payment.valor_recebido) : Number(payment.valor ?? 0),
        changeAmount: Number(payment.troco ?? 0),
        integrationReference: payment.descricao_outro ?? null
      }))
    });
    const numbering = fiscalNumberingService.getOrReserveForSale(aggregate.sale.id, store.id);
    const request = this.buildAuthorizeRequest(legacySaleId, store.id, numbering.series, numbering.number);
    const persistedDocument = fiscalDocumentRepository.upsertBySale({
      saleId: aggregate.sale.id,
      storeId: store.id,
      series: numbering.series,
      number: numbering.number,
      environment: request.environment,
      status: FiscalDocumentStatuses.DRAFT,
      issuedDatetime: request.issuedAt,
      contingencyType: request.offlineFallbackMode === "queue" ? "queue" : null,
      provider: null
    });
    return {
      request,
      store,
      mirroredSale: aggregate,
      mirroredFiscalDocument: persistedDocument
    };
  }
}
const pdvSaleFiscalAdapter = new PdvSaleFiscalAdapter();
function mapEvent(row) {
  return {
    id: row.id,
    fiscalDocumentId: row.fiscal_document_id,
    eventType: row.event_type,
    payloadJson: row.payload_json,
    responseJson: row.response_json,
    status: row.status,
    createdAt: row.created_at
  };
}
class FiscalEventRepository {
  create(input) {
    const result = db.prepare(`
      INSERT INTO fiscal_events (
        fiscal_document_id, event_type, payload_json, response_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      input.fiscalDocumentId,
      input.eventType,
      input.payload ? serializeJson(input.payload) : null,
      input.response ? serializeJson(input.response) : null,
      input.status
    );
    return this.findById(Number(result.lastInsertRowid));
  }
  findById(id) {
    const row = db.prepare(`SELECT * FROM fiscal_events WHERE id = ? LIMIT 1`).get(id);
    return row ? mapEvent(row) : null;
  }
  listByFiscalDocument(fiscalDocumentId) {
    const rows = db.prepare(`
      SELECT * FROM fiscal_events
      WHERE fiscal_document_id = ?
      ORDER BY created_at DESC, id DESC
    `).all(fiscalDocumentId);
    return rows.map(mapEvent);
  }
}
const fiscalEventRepository = new FiscalEventRepository();
class IssueFiscalDocumentForSaleService {
  async execute(legacySaleId) {
    try {
      const mirrored = pdvSaleFiscalAdapter.mirrorLegacySale(legacySaleId);
      const fiscalRequest = {
        ...mirrored.request,
        saleId: mirrored.mirroredSale.sale.id,
        companyId: mirrored.store.id,
        idempotencyKey: `nfce-sale-${mirrored.mirroredSale.sale.id}`
      };
      fiscalEventRepository.create({
        fiscalDocumentId: mirrored.mirroredFiscalDocument.id,
        eventType: FiscalEventTypes.AUTHORIZATION_REQUESTED,
        payload: { legacySaleId, request: fiscalRequest },
        status: FiscalDocumentStatuses.TRANSMITTING
      });
      const response = await fiscalService.authorizeNfce(fiscalRequest);
      const document = fiscalDocumentRepository.findBySaleId(mirrored.mirroredSale.sale.id);
      if (document) {
        fiscalEventRepository.create({
          fiscalDocumentId: document.id,
          eventType: FiscalEventTypes.AUTHORIZATION_RESPONSE,
          payload: { legacySaleId, request: fiscalRequest },
          response,
          status: response.status
        });
      }
      return {
        success: true,
        saleId: legacySaleId,
        fiscal: {
          status: response.status,
          accessKey: response.accessKey,
          protocol: response.protocol,
          receiptNumber: response.receiptNumber,
          qrCodeUrl: response.qrCodeUrl,
          authorizedAt: response.authorizedAt,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          documentId: (document == null ? void 0 : document.id) ?? null,
          provider: response.provider
        }
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, "ISSUE_FISCAL_SALE_FAILED");
      const document = fiscalDocumentRepository.findBySaleId(legacySaleId);
      if (document) {
        fiscalEventRepository.create({
          fiscalDocumentId: document.id,
          eventType: FiscalEventTypes.AUTHORIZATION_RESPONSE,
          payload: { legacySaleId },
          response: {
            status: "ERROR",
            statusCode: fiscalError.code,
            statusMessage: fiscalError.message
          },
          status: FiscalDocumentStatuses.ERROR
        });
      }
      return {
        success: false,
        saleId: legacySaleId,
        fiscal: {
          status: "ERROR",
          statusCode: fiscalError.code,
          statusMessage: fiscalError.message,
          documentId: (document == null ? void 0 : document.id) ?? null
        }
      };
    }
  }
}
const issueFiscalDocumentForSaleService = new IssueFiscalDocumentForSaleService();
function mapPrintedDocument(row) {
  return {
    id: Number(row.id),
    documentType: row.document_type,
    referenceType: row.reference_type,
    referenceId: Number(row.reference_id),
    saleId: row.sale_id === null ? null : Number(row.sale_id),
    cashSessionId: row.cash_session_id === null ? null : Number(row.cash_session_id),
    printerId: row.printer_id === null ? null : Number(row.printer_id),
    title: row.title,
    status: row.status,
    templateVersion: row.template_version,
    payloadJson: row.payload_json,
    contentHtml: row.content_html,
    printCount: Number(row.print_count ?? 0),
    lastPrintedAt: row.last_printed_at ?? null,
    lastError: row.last_error ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function mapPrintJob(row) {
  return {
    id: Number(row.id),
    printedDocumentId: Number(row.printed_document_id),
    printerId: row.printer_id === null ? null : Number(row.printer_id),
    triggerSource: row.trigger_source,
    status: row.status,
    errorMessage: row.error_message ?? null,
    copies: Number(row.copies ?? 1),
    attemptedAt: row.attempted_at,
    completedAt: row.completed_at ?? null
  };
}
function paymentLabelFromCode(code) {
  const labels = {
    "01": "Dinheiro",
    "02": "Cheque",
    "03": "Cartao de Credito",
    "04": "Cartao de Debito",
    "10": "Vale Alimentacao",
    "11": "Vale Refeicao",
    "12": "Vale Presente",
    "13": "Vale Combustivel",
    "15": "Boleto",
    "17": "PIX",
    "99": "Outros"
  };
  return labels[code] ?? `Pagamento ${code}`;
}
function buildStoreAddress(row) {
  const parts = [
    row.endereco,
    row.numero,
    row.bairro,
    row.cidade,
    row.uf,
    row.cep
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : null;
}
class PrintDocumentRepository {
  mapPrinter(row) {
    return {
      id: Number(row.id),
      name: row.name,
      display_name: row.display_name ?? null,
      brand: row.brand ?? null,
      model: row.model ?? null,
      connection_type: row.connection_type ?? null,
      driver_name: row.driver_name ?? null,
      driver_version: row.driver_version ?? null,
      photo_path: row.photo_path ?? null,
      notes: row.notes ?? null,
      is_default: Number(row.is_default ?? 0),
      installed_at: row.installed_at ?? null,
      paper_width_mm: Number(row.paper_width_mm ?? 80),
      content_width_mm: Number(row.content_width_mm ?? 76),
      base_font_size_px: Number(row.base_font_size_px ?? 13),
      line_height: Number(row.line_height ?? 1.5),
      receipt_settings_json: row.receipt_settings_json ?? null
    };
  }
  findByReference(documentType, referenceType, referenceId) {
    const row = db.prepare(`
      SELECT *
      FROM printed_documents
      WHERE document_type = ?
        AND reference_type = ?
        AND reference_id = ?
      LIMIT 1
    `).get(documentType, referenceType, referenceId);
    return row ? mapPrintedDocument(row) : null;
  }
  findById(documentId) {
    const row = db.prepare(`
      SELECT *
      FROM printed_documents
      WHERE id = ?
      LIMIT 1
    `).get(documentId);
    return row ? mapPrintedDocument(row) : null;
  }
  upsertDocument(input) {
    const existing = this.findByReference(input.documentType, input.referenceType, input.referenceId);
    if (existing) {
      db.prepare(`
        UPDATE printed_documents
        SET
          sale_id = ?,
          cash_session_id = ?,
          printer_id = ?,
          title = ?,
          status = ?,
          template_version = ?,
          payload_json = ?,
          content_html = ?,
          last_error = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        input.saleId ?? null,
        input.cashSessionId ?? null,
        input.printerId ?? null,
        input.title,
        input.status,
        input.templateVersion,
        input.payloadJson,
        input.contentHtml,
        input.lastError ?? null,
        existing.id
      );
      return this.findById(existing.id);
    }
    const result = db.prepare(`
      INSERT INTO printed_documents (
        document_type,
        reference_type,
        reference_id,
        sale_id,
        cash_session_id,
        printer_id,
        title,
        status,
        template_version,
        payload_json,
        content_html,
        last_error
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.documentType,
      input.referenceType,
      input.referenceId,
      input.saleId ?? null,
      input.cashSessionId ?? null,
      input.printerId ?? null,
      input.title,
      input.status,
      input.templateVersion,
      input.payloadJson,
      input.contentHtml,
      input.lastError ?? null
    );
    return this.findById(Number(result.lastInsertRowid));
  }
  markDocumentPrinted(documentId, printerId) {
    db.prepare(`
      UPDATE printed_documents
      SET
        status = 'PRINTED',
        printer_id = ?,
        print_count = print_count + 1,
        last_printed_at = datetime('now'),
        last_error = NULL,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(printerId, documentId);
  }
  markDocumentFailed(documentId, status, errorMessage, printerId) {
    db.prepare(`
      UPDATE printed_documents
      SET
        status = ?,
        printer_id = ?,
        last_error = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(status, printerId, errorMessage, documentId);
  }
  createPrintJob(input) {
    const result = db.prepare(`
      INSERT INTO print_jobs (
        printed_document_id,
        printer_id,
        trigger_source,
        status,
        error_message,
        copies
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      input.printedDocumentId,
      input.printerId ?? null,
      input.triggerSource,
      input.status,
      input.errorMessage ?? null,
      input.copies ?? 1
    );
    const row = db.prepare(`
      SELECT *
      FROM print_jobs
      WHERE id = ?
      LIMIT 1
    `).get(result.lastInsertRowid);
    return mapPrintJob(row);
  }
  listDocumentJobs(documentId) {
    const rows = db.prepare(`
      SELECT *
      FROM print_jobs
      WHERE printed_document_id = ?
      ORDER BY id DESC
    `).all(documentId);
    return rows.map(mapPrintJob);
  }
  getDefaultPrinter() {
    const row = db.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE is_default = 1
      LIMIT 1
    `).get();
    if (!row) return null;
    return this.mapPrinter(row);
  }
  findPrinterById(printerId) {
    const row = db.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE id = ?
      LIMIT 1
    `).get(printerId);
    return row ? this.mapPrinter(row) : null;
  }
  buildTestSaleReceiptData(printer, settings) {
    var _a;
    const headerTitle = settings.templateMode === "custom" ? ((_a = settings.headerTitle) == null ? void 0 : _a.trim()) || printer.display_name || "Galberto PDV" : printer.display_name || "Galberto PDV";
    return {
      saleId: 999999,
      emittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      movedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "FINALIZADA",
      storeName: headerTitle,
      storeLegalName: "GALBERTO PDV LTDA",
      storeDocument: "12.345.678/0001-99",
      storeAddress: "Rua Exemplo, 123 - Centro - Cidade/UF - 70000-000",
      operatorName: "Operador Teste",
      operatorId: "1",
      pdvId: "PDV-001",
      customerName: "Consumidor final",
      customerDocument: null,
      items: [
        {
          productId: "TESTE-1",
          code: "7890001112223",
          description: "ARROZ TIPO 1 5KG TESTE",
          quantity: 1,
          unitPrice: 29.9,
          grossAmount: 29.9,
          discountAmount: 0,
          totalAmount: 29.9
        },
        {
          productId: "TESTE-2",
          code: "7890001112224",
          description: "FEIJAO PRETO 1KG TESTE",
          quantity: 2,
          unitPrice: 8.5,
          grossAmount: 17,
          discountAmount: 1,
          totalAmount: 16
        }
      ],
      payments: [
        {
          paymentCode: "01",
          paymentLabel: "Dinheiro",
          amount: 45.9,
          receivedAmount: 50,
          changeAmount: 4.1
        }
      ],
      subtotalAmount: 46.9,
      discountAmount: 1,
      totalAmount: 45.9,
      changeAmount: 4.1,
      notes: "Documento de teste para ajuste de layout.",
      fiscal: {
        status: "TESTE",
        protocol: "PROTOCOLO-TESTE",
        accessKey: "35123456789012345678901234567890123456789012",
        statusMessage: "Simulação operacional",
        authorizationDatetime: (/* @__PURE__ */ new Date()).toISOString(),
        qrCodeUrl: null
      }
    };
  }
  appendPrinterLog(printerId, message) {
    db.prepare(`
      INSERT INTO printer_logs (printer_id, message)
      VALUES (?, ?)
    `).run(printerId, message);
  }
  loadSaleReceiptData(saleId) {
    const sale = db.prepare(`
      SELECT
        v.id,
        v.data_emissao,
        v.data_movimento,
        v.status,
        v.cliente_nome,
        v.cpf_cliente,
        v.valor_produtos,
        v.valor_desconto,
        v.valor_total,
        v.valor_troco,
        v.observacao,
        company.razao_social,
        company.nome_fantasia,
        company.cnpj,
        company.rua AS endereco,
        company.numero,
        company.bairro,
        company.cidade,
        company.uf,
        company.cep,
        vp.cash_session_id,
        cs.operator_id,
        cs.pdv_id,
        u.nome AS operator_name
      FROM vendas v
      LEFT JOIN company ON company.ativo = 1
      LEFT JOIN venda_pagamento vp ON vp.venda_id = v.id
      LEFT JOIN cash_register_sessions cs ON cs.id = vp.cash_session_id
      LEFT JOIN usuarios u ON CAST(u.id AS TEXT) = CAST(cs.operator_id AS TEXT)
      WHERE v.id = ?
      LIMIT 1
    `).get(saleId);
    if (!sale) {
      throw new Error(`Venda não encontrada para impressão: ${saleId}`);
    }
    const items = db.prepare(`
      SELECT
        produto_id,
        codigo_produto,
        nome_produto,
        quantidade_comercial,
        valor_unitario_comercial,
        valor_bruto,
        valor_desconto,
        subtotal
      FROM venda_itens
      WHERE venda_id = ?
      ORDER BY id
    `).all(saleId);
    const payments = db.prepare(`
      SELECT
        tpag,
        valor,
        valor_recebido,
        troco
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id
    `).all(saleId);
    const fiscal = db.prepare(`
      SELECT fd.status, fd.access_key, fd.protocol, fd.authorization_datetime, fd.qr_code_url
      FROM fiscal_documents fd
      INNER JOIN sales s ON s.id = fd.sale_id
      WHERE s.external_reference = ?
      ORDER BY fd.id DESC
      LIMIT 1
    `).get(`legacy-sale:${saleId}`);
    return {
      saleId: Number(sale.id),
      emittedAt: sale.data_emissao,
      movedAt: sale.data_movimento ?? null,
      status: sale.status,
      storeName: sale.nome_fantasia ?? sale.razao_social ?? "Galberto PDV",
      storeLegalName: sale.razao_social ?? null,
      storeDocument: sale.cnpj ?? null,
      storeAddress: buildStoreAddress(sale),
      operatorName: sale.operator_name ?? null,
      operatorId: sale.operator_id === null ? null : String(sale.operator_id),
      pdvId: sale.pdv_id ?? null,
      customerName: sale.cliente_nome ?? null,
      customerDocument: sale.cpf_cliente ?? null,
      items: items.map((item) => ({
        productId: String(item.produto_id),
        code: item.codigo_produto ?? null,
        description: item.nome_produto,
        quantity: Number(item.quantidade_comercial ?? 0),
        unitPrice: Number(item.valor_unitario_comercial ?? 0),
        grossAmount: Number(item.valor_bruto ?? 0),
        discountAmount: Number(item.valor_desconto ?? 0),
        totalAmount: Number(item.subtotal ?? 0)
      })),
      payments: payments.map((payment) => ({
        paymentCode: payment.tpag,
        paymentLabel: paymentLabelFromCode(payment.tpag),
        amount: Number(payment.valor ?? 0),
        receivedAmount: Number(payment.valor_recebido ?? payment.valor ?? 0),
        changeAmount: Number(payment.troco ?? 0)
      })),
      subtotalAmount: Number(sale.valor_produtos ?? 0),
      discountAmount: Number(sale.valor_desconto ?? 0),
      totalAmount: Number(sale.valor_total ?? 0),
      changeAmount: Number(sale.valor_troco ?? 0),
      notes: sale.observacao ?? null,
      fiscal: fiscal ? {
        status: fiscal.status ?? null,
        accessKey: fiscal.access_key ?? null,
        protocol: fiscal.protocol ?? null,
        statusMessage: fiscal.status ?? null,
        authorizationDatetime: fiscal.authorization_datetime ?? null,
        qrCodeUrl: fiscal.qr_code_url ?? null
      } : null
    };
  }
  loadCashReceiptData(sessionId, documentType) {
    const row = db.prepare(`
      SELECT
        s.id,
        s.operator_id,
        s.pdv_id,
        s.opening_cash_amount,
        s.closing_cash_amount,
        s.expected_cash_amount,
        s.closing_difference,
        s.opened_at,
        s.closed_at,
        s.opening_notes,
        s.closing_notes,
        u.nome AS operator_name,
        COALESCE((
          SELECT SUM(vp.valor)
          FROM venda_pagamento vp
          WHERE vp.cash_session_id = s.id
            AND vp.tpag = '01'
        ), 0) AS total_vendas_dinheiro,
        COALESCE((
          SELECT SUM(m.amount)
          FROM cash_register_movements m
          WHERE m.cash_session_id = s.id
            AND m.movement_type = 'SANGRIA'
        ), 0) AS total_sangrias
      FROM cash_register_sessions s
      LEFT JOIN usuarios u ON CAST(u.id AS TEXT) = CAST(s.operator_id AS TEXT)
      WHERE s.id = ?
      LIMIT 1
    `).get(sessionId);
    if (!row) {
      throw new Error(`Sessão de caixa não encontrada para impressão: ${sessionId}`);
    }
    return {
      cashSessionId: Number(row.id),
      documentType,
      operatorName: row.operator_name ?? null,
      operatorId: row.operator_id === null ? null : String(row.operator_id),
      pdvId: row.pdv_id,
      openingAmount: Number(row.opening_cash_amount ?? 0),
      closingAmount: row.closing_cash_amount === null ? null : Number(row.closing_cash_amount),
      expectedAmount: row.expected_cash_amount === null ? null : Number(row.expected_cash_amount),
      differenceAmount: row.closing_difference === null ? null : Number(row.closing_difference),
      totalSalesCash: Number(row.total_vendas_dinheiro ?? 0),
      totalWithdrawals: Number(row.total_sangrias ?? 0),
      openedAt: row.opened_at,
      closedAt: row.closed_at ?? null,
      openingNotes: row.opening_notes ?? null,
      closingNotes: row.closing_notes ?? null
    };
  }
  hasPrintedDocumentForSale(saleId) {
    const row = db.prepare(`
      SELECT COUNT(*) AS total
      FROM printed_documents
      WHERE sale_id = ?
        AND document_type = 'SALE_RECEIPT'
    `).get(saleId);
    return Number(row.total ?? 0) > 0;
  }
  logInfo(message) {
    logger.info(`[printing] ${message}`);
  }
}
const printDocumentRepository = new PrintDocumentRepository();
class ElectronReceiptPrinter {
  async printHtml(params) {
    const paperWidthMm = Number(params.paperWidthMm ?? 80);
    const viewportWidthPx = Math.max(360, Math.round(paperWidthMm / 25.4 * 96) + 48);
    const printWindow = new BrowserWindow({
      show: false,
      width: viewportWidthPx,
      height: 1280,
      webPreferences: {
        sandbox: true
      }
    });
    try {
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(params.html)}`;
      await printWindow.loadURL(dataUrl);
      await new Promise((resolve, reject) => {
        printWindow.webContents.print(
          {
            silent: true,
            printBackground: true,
            deviceName: params.printerName,
            margins: {
              marginType: "none"
            }
          },
          (success, failureReason) => {
            if (!success) {
              reject(new Error(failureReason || "Falha desconhecida na impressão."));
              return;
            }
            resolve();
          }
        );
      });
    } catch (error) {
      logger.error(`[printing] erro ao imprimir "${params.title}": ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (!printWindow.isDestroyed()) {
        printWindow.destroy();
      }
    }
  }
}
const electronReceiptPrinter = new ElectronReceiptPrinter();
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function formatMoney(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function formatDateTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pt-BR");
}
function getReceiptSettings(printer) {
  if (!(printer == null ? void 0 : printer.receipt_settings_json)) return {};
  try {
    return JSON.parse(printer.receipt_settings_json);
  } catch {
    return {};
  }
}
function isCustomMode(settings) {
  return settings.templateMode === "custom";
}
function resolveLayout(printer) {
  return {
    paperWidthMm: Number((printer == null ? void 0 : printer.paper_width_mm) ?? 80),
    contentWidthMm: Number((printer == null ? void 0 : printer.content_width_mm) ?? 76),
    baseFontSizePx: Number((printer == null ? void 0 : printer.base_font_size_px) ?? 14),
    lineHeight: Number((printer == null ? void 0 : printer.line_height) ?? 1.55)
  };
}
function renderDocumentShell(title, body, printer) {
  const layout = resolveLayout(printer);
  const sidePadding = Math.max((layout.paperWidthMm - layout.contentWidthMm) / 2, 0);
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page {
        size: ${layout.paperWidthMm}mm auto;
        margin: 0;
      }

      html, body {
        margin: 0;
        padding: 0;
        width: ${layout.paperWidthMm}mm;
        font-family: "Courier New", monospace;
        color: #000000;
        background: #ffffff;
        font-size: ${layout.baseFontSizePx}px;
        line-height: ${layout.lineHeight};
        font-weight: 600;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        text-rendering: geometricPrecision;
      }

      body {
        box-sizing: border-box;
        padding: 1.2mm ${sidePadding}mm 0.8mm;
      }

      .receipt {
        box-sizing: border-box;
        width: ${layout.contentWidthMm}mm;
        padding-bottom: 0;
      }

      .center { text-align: center; }
      .muted { color: #111111; opacity: 0.9; }
      .strong { font-weight: 800; }
      .section { margin-top: 6px; }
      .separator {
        border-top: 1px dashed #000000;
        margin: 5px 0;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin: 0;
      }
      .row .label {
        color: #000000;
      }
      .row .value {
        text-align: right;
        font-weight: 800;
      }
      .item {
        margin-bottom: 5px;
      }
      .item-name {
        font-weight: 800;
      }
      .item-meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }
      .mono {
        word-break: break-all;
      }
      .footer-note {
        margin-top: 6px;
        font-size: ${Math.max(layout.baseFontSizePx - 2, 10)}px;
        color: #000000;
      }
    </style>
  </head>
  <body><div class="receipt">${body}</div></body>
</html>`;
}
class ThermalReceiptRenderer {
  renderSaleReceipt(data, printer) {
    var _a, _b;
    const settings = getReceiptSettings(printer);
    const useCustomMode = isCustomMode(settings);
    const itemsHtml = data.items.map((item) => `
      <div class="item">
        <div class="item-name">${escapeHtml(item.description)}</div>
        <div class="item-meta">
          <span>${item.quantity.toFixed(3).replace(".", ",")} x ${formatMoney(item.unitPrice)}</span>
          <span class="strong">${formatMoney(item.totalAmount)}</span>
        </div>
        ${item.discountAmount > 0 ? `<div class="muted">Desconto: ${formatMoney(item.discountAmount)}</div>` : ""}
        ${(useCustomMode ? settings.showItemCodes !== false : true) && item.code ? `<div class="muted">Cod.: ${escapeHtml(item.code)}</div>` : ""}
      </div>
    `).join("");
    const paymentsHtml = data.payments.map((payment) => `
      <div class="row">
        <span class="label">${escapeHtml(payment.paymentLabel)}</span>
        <span class="value">${formatMoney(payment.amount)}</span>
      </div>
    `).join("");
    const body = `
      <div class="center">
        ${useCustomMode && settings.showLogo && settings.logoPath ? `<div class="footer-note">LOGO: ${escapeHtml(settings.logoPath)}</div>` : ""}
        <div class="strong">${escapeHtml(useCustomMode ? ((_a = settings.headerTitle) == null ? void 0 : _a.trim()) || data.storeName : data.storeName)}</div>
        ${(useCustomMode ? settings.showLegalName !== false : true) && data.storeLegalName && data.storeLegalName !== data.storeName ? `<div>${escapeHtml(data.storeLegalName)}</div>` : ""}
        ${(useCustomMode ? settings.showDocument !== false : true) && data.storeDocument ? `<div>CNPJ: ${escapeHtml(data.storeDocument)}</div>` : ""}
        ${(useCustomMode ? settings.showAddress !== false : true) && data.storeAddress ? `<div>${escapeHtml(data.storeAddress)}</div>` : ""}
        ${useCustomMode && settings.headerMessage ? `<div class="footer-note">${escapeHtml(settings.headerMessage)}</div>` : ""}
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Venda</span><span class="value">#${data.saleId}</span></div>
      <div class="row"><span class="label">Data/Hora</span><span class="value">${escapeHtml(formatDateTime(data.movedAt ?? data.emittedAt))}</span></div>
      ${(useCustomMode ? settings.showOperator !== false : true) ? `<div class="row"><span class="label">Operador</span><span class="value">${escapeHtml(data.operatorName ?? "Não informado")}</span></div>` : ""}
      <div class="row"><span class="label">PDV</span><span class="value">${escapeHtml(data.pdvId ?? "—")}</span></div>
      ${(useCustomMode ? settings.showCustomer !== false : true) ? `<div class="row"><span class="label">Cliente</span><span class="value">${escapeHtml(data.customerName ?? "Consumidor final")}</span></div>` : ""}
      ${(useCustomMode ? settings.showCustomer !== false : true) && data.customerDocument ? `<div class="row"><span class="label">Documento</span><span class="value">${escapeHtml(data.customerDocument)}</span></div>` : ""}

      <div class="separator"></div>
      ${itemsHtml}
      <div class="separator"></div>

      <div class="row"><span class="label">Subtotal</span><span class="value">${formatMoney(data.subtotalAmount)}</span></div>
      ${data.discountAmount > 0 ? `<div class="row"><span class="label">Descontos</span><span class="value">${formatMoney(data.discountAmount)}</span></div>` : ""}
      <div class="row"><span class="label strong">TOTAL</span><span class="value">${formatMoney(data.totalAmount)}</span></div>
      ${data.changeAmount > 0 ? `<div class="row"><span class="label">Troco</span><span class="value">${formatMoney(data.changeAmount)}</span></div>` : ""}

      ${(useCustomMode ? settings.showPaymentBreakdown !== false : true) ? `
        <div class="separator"></div>
        <div class="strong">Pagamentos</div>
        ${paymentsHtml}
      ` : ""}

      ${(useCustomMode ? settings.showFiscalSection !== false : true) && data.fiscal ? `
        <div class="separator"></div>
        <div class="strong">Situação fiscal</div>
        <div class="row"><span class="label">Status</span><span class="value">${escapeHtml(data.fiscal.status ?? "—")}</span></div>
        ${data.fiscal.protocol ? `<div class="row"><span class="label">Protocolo</span><span class="value">${escapeHtml(data.fiscal.protocol)}</span></div>` : ""}
        ${data.fiscal.accessKey ? `<div class="footer-note mono">Chave: ${escapeHtml(data.fiscal.accessKey)}</div>` : ""}
      ` : ""}

      ${data.notes ? `<div class="footer-note">Obs.: ${escapeHtml(data.notes)}</div>` : ""}
      ${useCustomMode && settings.footerMessage ? `<div class="footer-note">${escapeHtml(settings.footerMessage)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        ${escapeHtml(useCustomMode ? ((_b = settings.thankYouMessage) == null ? void 0 : _b.trim()) || "Documento impresso pelo Galberto PDV" : "Documento impresso pelo Galberto PDV")}<br />
        Guarde este comprovante para conferência.
      </div>
    `;
    return renderDocumentShell(`Cupom de venda #${data.saleId}`, body, printer);
  }
  renderCashReceipt(data, printer) {
    const isClosing = data.documentType === "CASH_CLOSING_RECEIPT";
    const title = isClosing ? "Comprovante de Fechamento de Caixa" : "Comprovante de Abertura de Caixa";
    const body = `
      <div class="center">
        <div class="strong">${escapeHtml(title)}</div>
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Sessão</span><span class="value">#${data.cashSessionId}</span></div>
      <div class="row"><span class="label">Operador</span><span class="value">${escapeHtml(data.operatorName ?? "Não informado")}</span></div>
      <div class="row"><span class="label">PDV</span><span class="value">${escapeHtml(data.pdvId)}</span></div>
      <div class="row"><span class="label">Aberto em</span><span class="value">${escapeHtml(formatDateTime(data.openedAt))}</span></div>
      ${isClosing ? `<div class="row"><span class="label">Fechado em</span><span class="value">${escapeHtml(formatDateTime(data.closedAt))}</span></div>` : ""}

      <div class="separator"></div>

      <div class="row"><span class="label">Fundo inicial</span><span class="value">${formatMoney(data.openingAmount)}</span></div>
      ${isClosing ? `
        <div class="row"><span class="label">Vendas em dinheiro</span><span class="value">${formatMoney(data.totalSalesCash)}</span></div>
        <div class="row"><span class="label">Sangrias</span><span class="value">${formatMoney(data.totalWithdrawals)}</span></div>
        <div class="row"><span class="label">Valor esperado</span><span class="value">${formatMoney(data.expectedAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Valor contado</span><span class="value">${formatMoney(data.closingAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Diferença</span><span class="value">${formatMoney(data.differenceAmount ?? 0)}</span></div>
      ` : ""}

      ${data.openingNotes ? `<div class="footer-note">Obs. abertura: ${escapeHtml(data.openingNotes)}</div>` : ""}
      ${isClosing && data.closingNotes ? `<div class="footer-note">Obs. fechamento: ${escapeHtml(data.closingNotes)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        Documento impresso pelo Galberto PDV<br />
        Conferência operacional de caixa.
      </div>
    `;
    return renderDocumentShell(title, body, printer);
  }
  renderFromStoredDocument(document) {
    return document.contentHtml;
  }
}
const thermalReceiptRenderer = new ThermalReceiptRenderer();
function createMessage(documentType, action, printerName) {
  const labels = {
    SALE_RECEIPT: "cupom da venda",
    CASH_OPENING_RECEIPT: "comprovante de abertura de caixa",
    CASH_CLOSING_RECEIPT: "comprovante de fechamento de caixa"
  };
  const label = labels[documentType];
  if (action === "printed") {
    return `${label} impresso${printerName ? ` em ${printerName}` : ""}.`;
  }
  if (action === "skipped") {
    return `Nenhuma impressora padrão configurada para imprimir o ${label}.`;
  }
  return `Falha ao imprimir o ${label}.`;
}
class PrintDocumentService {
  async printTestReceipt(printerId) {
    const printer = printDocumentRepository.findPrinterById(printerId);
    if (!printer) {
      return {
        success: false,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: "Impressora não encontrada para teste.",
        jobId: 0,
        reprint: false
      };
    }
    const sample = printDocumentRepository.buildTestSaleReceiptData(printer, {});
    const html = thermalReceiptRenderer.renderSaleReceipt(sample, printer);
    try {
      await electronReceiptPrinter.printHtml({
        html,
        printerName: printer.name,
        title: `Teste ${printer.display_name ?? printer.name}`,
        paperWidthMm: printer.paper_width_mm
      });
      printDocumentRepository.appendPrinterLog(printer.id, "Impressão de teste enviada.");
      return {
        success: true,
        status: "SUCCESS",
        documentId: 0,
        printerId: printer.id,
        printerName: printer.display_name ?? printer.name,
        message: `Teste de impressão enviado para ${printer.display_name ?? printer.name}.`,
        jobId: 0,
        reprint: false
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Falha desconhecida na impressão de teste.";
      printDocumentRepository.appendPrinterLog(printer.id, `Teste de impressão falhou: ${errorMessage}`);
      return {
        success: false,
        status: "FAILED",
        documentId: 0,
        printerId: printer.id,
        printerName: printer.display_name ?? printer.name,
        message: errorMessage,
        jobId: 0,
        reprint: false
      };
    }
  }
  async printSaleReceipt(saleId, options2) {
    const saleData = printDocumentRepository.loadSaleReceiptData(saleId);
    const printer = printDocumentRepository.getDefaultPrinter();
    const mergedData = {
      ...saleData,
      fiscal: options2.fiscal ?? saleData.fiscal
    };
    const title = `Cupom de venda #${saleId}`;
    const html = thermalReceiptRenderer.renderSaleReceipt(mergedData, printer);
    const document = printDocumentRepository.upsertDocument({
      documentType: "SALE_RECEIPT",
      referenceType: "SALE",
      referenceId: saleId,
      saleId,
      title,
      status: "PENDING",
      templateVersion: "thermal-v1",
      payloadJson: JSON.stringify(mergedData),
      contentHtml: html,
      lastError: null
    });
    return this.dispatchToPrinter(document, options2.triggerSource, false);
  }
  async printCashOpeningReceipt(sessionId, triggerSource) {
    const data = printDocumentRepository.loadCashReceiptData(sessionId, "CASH_OPENING_RECEIPT");
    return this.printCashReceipt(data, triggerSource, false);
  }
  async printCashClosingReceipt(sessionId, triggerSource) {
    const data = printDocumentRepository.loadCashReceiptData(sessionId, "CASH_CLOSING_RECEIPT");
    return this.printCashReceipt(data, triggerSource, false);
  }
  async reprintSaleReceipt(saleId) {
    let document = printDocumentRepository.findByReference("SALE_RECEIPT", "SALE", saleId);
    if (!document) {
      return this.printSaleReceipt(saleId, { triggerSource: "MANUAL" });
    }
    const printer = printDocumentRepository.getDefaultPrinter();
    try {
      const payload = JSON.parse(document.payloadJson);
      document = printDocumentRepository.upsertDocument({
        documentType: document.documentType,
        referenceType: document.referenceType,
        referenceId: document.referenceId,
        saleId: document.saleId,
        cashSessionId: document.cashSessionId,
        printerId: (printer == null ? void 0 : printer.id) ?? document.printerId,
        title: document.title,
        status: document.status,
        templateVersion: document.templateVersion,
        payloadJson: document.payloadJson,
        contentHtml: thermalReceiptRenderer.renderSaleReceipt(payload, printer),
        lastError: document.lastError
      });
    } catch {
      document = printDocumentRepository.upsertDocument({
        documentType: document.documentType,
        referenceType: document.referenceType,
        referenceId: document.referenceId,
        saleId: document.saleId,
        cashSessionId: document.cashSessionId,
        printerId: (printer == null ? void 0 : printer.id) ?? document.printerId,
        title: document.title,
        status: document.status,
        templateVersion: document.templateVersion,
        payloadJson: document.payloadJson,
        contentHtml: document.contentHtml,
        lastError: document.lastError
      });
    }
    return this.dispatchToPrinter(document, "MANUAL", true);
  }
  async printCashReceipt(data, triggerSource, reprint) {
    const printer = printDocumentRepository.getDefaultPrinter();
    const title = data.documentType === "CASH_OPENING_RECEIPT" ? `Abertura de caixa #${data.cashSessionId}` : `Fechamento de caixa #${data.cashSessionId}`;
    const html = thermalReceiptRenderer.renderCashReceipt(data, printer);
    const document = printDocumentRepository.upsertDocument({
      documentType: data.documentType,
      referenceType: "CASH_SESSION",
      referenceId: data.cashSessionId,
      cashSessionId: data.cashSessionId,
      title,
      status: "PENDING",
      templateVersion: "thermal-v1",
      payloadJson: JSON.stringify(data),
      contentHtml: html,
      lastError: null
    });
    return this.dispatchToPrinter(document, triggerSource, reprint);
  }
  async dispatchToPrinter(document, triggerSource, reprint) {
    const printer = printDocumentRepository.getDefaultPrinter();
    if (!printer) {
      printDocumentRepository.markDocumentFailed(document.id, "PENDING", "Nenhuma impressora padrão configurada.", null);
      const job = printDocumentRepository.createPrintJob({
        printedDocumentId: document.id,
        printerId: null,
        triggerSource,
        status: "SKIPPED",
        errorMessage: "Nenhuma impressora padrão configurada."
      });
      return {
        success: false,
        status: "SKIPPED",
        documentId: document.id,
        printerId: null,
        printerName: null,
        message: createMessage(document.documentType, "skipped"),
        jobId: job.id,
        reprint
      };
    }
    try {
      await electronReceiptPrinter.printHtml({
        html: thermalReceiptRenderer.renderFromStoredDocument(document),
        printerName: printer.name,
        title: document.title,
        paperWidthMm: printer.paper_width_mm
      });
      printDocumentRepository.markDocumentPrinted(document.id, printer.id);
      printDocumentRepository.appendPrinterLog(printer.id, `${document.title} enviado para impressão.`);
      const job = printDocumentRepository.createPrintJob({
        printedDocumentId: document.id,
        printerId: printer.id,
        triggerSource,
        status: "SUCCESS"
      });
      return {
        success: true,
        status: "SUCCESS",
        documentId: document.id,
        printerId: printer.id,
        printerName: printer.display_name ?? printer.name,
        message: createMessage(document.documentType, "printed", printer.display_name ?? printer.name),
        jobId: job.id,
        reprint
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Falha desconhecida na impressão.";
      printDocumentRepository.markDocumentFailed(document.id, "FAILED", errorMessage, printer.id);
      printDocumentRepository.appendPrinterLog(printer.id, `${document.title} falhou: ${errorMessage}`);
      const job = printDocumentRepository.createPrintJob({
        printedDocumentId: document.id,
        printerId: printer.id,
        triggerSource,
        status: "FAILED",
        errorMessage
      });
      return {
        success: false,
        status: "FAILED",
        documentId: document.id,
        printerId: printer.id,
        printerName: printer.display_name ?? printer.name,
        message: `${createMessage(document.documentType, "failed")} ${errorMessage}`,
        jobId: job.id,
        reprint
      };
    }
  }
}
const printDocumentService = new PrintDocumentService();
function payloadHasDiscount(vendaPayload) {
  const totalDiscount = Number((vendaPayload == null ? void 0 : vendaPayload.valorDesconto) ?? (vendaPayload == null ? void 0 : vendaPayload.valor_desconto) ?? 0);
  const itemDiscount = Array.isArray(vendaPayload == null ? void 0 : vendaPayload.itens) ? vendaPayload.itens.some((item) => Number((item == null ? void 0 : item.valor_desconto) ?? (item == null ? void 0 : item.valorDesconto) ?? 0) > 0) : false;
  return totalDiscount > 0 || itemDiscount;
}
function assertDiscountPermission(vendaPayload) {
  if (payloadHasDiscount(vendaPayload) && !currentUserHasPermission("discounts:apply")) {
    throw new Error("Somente gerente ou administrador pode conceder descontos.");
  }
}
function registerSalesHandlers() {
  ipcMain.handle("vendas:finalizar-com-baixa-estoque", async (_, vendaPayload) => {
    assertDiscountPermission(vendaPayload);
    finalizarVendaComBaixaEstoque(vendaPayload);
    const vendaId = typeof vendaPayload === "number" ? vendaPayload : vendaPayload.vendaId;
    const fiscalResult = await issueFiscalDocumentForSaleService.execute(vendaId);
    let printResult;
    try {
      printResult = await printDocumentService.printSaleReceipt(vendaId, {
        triggerSource: "AUTO",
        fiscal: fiscalResult.fiscal ?? null
      });
    } catch (error) {
      printResult = {
        success: false,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: error instanceof Error ? error.message : "Falha ao imprimir o cupom da venda.",
        jobId: 0,
        reprint: false
      };
    }
    return {
      success: true,
      vendaId,
      fiscal: fiscalResult.fiscal,
      print: printResult
    };
  });
  ipcMain.handle("vendas:get", (_, params) => {
    return listarVendas(params);
  });
  ipcMain.handle("vendas:cancelar", (_, venda) => {
    return cancelarVenda(venda);
  });
  ipcMain.handle("vendas:buscarPorId", (_, vendaId) => {
    return buscarVendaPorId(vendaId);
  });
  ipcMain.handle("vendas:finalizada-pendente-pagamento", (_, venda) => {
    assertDiscountPermission(venda);
    const vendaId = salvarVendaPendente(venda, "ABERTA_PAGAMENTO", (venda == null ? void 0 : venda.id) ?? null);
    return vendaId;
  });
  ipcMain.handle("vendas:pausar", (_, venda) => {
    assertDiscountPermission(venda);
    const vendaId = salvarVendaPendente(venda, "PAUSADA", (venda == null ? void 0 : venda.id) ?? null);
    return vendaId;
  });
}
let viewVendaWindow = null;
let viewUsuarioWindow = null;
let cadastrarUsuarioWindow = null;
let editUserWindow = null;
let searchProductWindow = null;
let configAppWindow = null;
let searchSalesWindow = null;
let pdvWindow = null;
const __dirname$2 = import.meta.dirname;
process.env.APP_ROOT = path__default.join(__dirname$2, "..");
function registerWindowHandlers() {
  ipcMain.handle("app:open-external-url", async (_event, url) => {
    await shell.openExternal(url);
    return true;
  });
  ipcMain.on("window:open:sales-search", () => {
    if (searchSalesWindow && !searchSalesWindow.isDestroyed()) {
      searchSalesWindow.focus();
      return;
    }
    createSearchSalesWindow();
  });
  function createSearchSalesWindow() {
    searchSalesWindow = new BrowserWindow({
      title: "Vendas",
      width: 600,
      height: 530,
      center: true,
      maximizable: false,
      webPreferences: {
        preload: path__default.join(__dirname$2, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    searchSalesWindow.maximize();
    if (VITE_DEV_SERVER_URL) {
      searchSalesWindow.loadURL(`${VITE_DEV_SERVER_URL}#/sales/search`);
    } else {
      searchSalesWindow.loadFile(path__default.join("dist/index.html"));
    }
  }
  function createPdvWindow() {
    pdvWindow = new BrowserWindow({
      title: "Galberto PDV",
      width: 1280,
      height: 820,
      center: true,
      maximizable: true,
      webPreferences: {
        preload: path__default.join(__dirname$2, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    pdvWindow.maximize();
    if (VITE_DEV_SERVER_URL) {
      pdvWindow.loadURL(`${VITE_DEV_SERVER_URL}#/pdv`);
    } else {
      pdvWindow.loadFile(path__default.join("dist/index.html"));
    }
  }
  function createViewVendaWindow(id) {
    viewVendaWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Venda #${id}`,
      maximizable: false,
      webPreferences: {
        preload: path__default.join(__dirname$2, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    if (VITE_DEV_SERVER_URL) {
      viewVendaWindow.loadURL(`${VITE_DEV_SERVER_URL}#/vendas/${id}`);
    } else {
      viewVendaWindow.loadFile(path__default.join("dist/index.html"));
    }
  }
  function createSearchProductWindow() {
    searchProductWindow = new BrowserWindow({
      title: "Search Product",
      maximizable: true,
      webPreferences: {
        preload: path__default.join(__dirname$2, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    if (VITE_DEV_SERVER_URL) {
      searchProductWindow.loadURL(`${VITE_DEV_SERVER_URL}#/pdv/products/search`);
    } else {
      searchProductWindow.loadFile(path__default.join("dist/index.html"), {
        hash: `/pdv/products/search`
      });
    }
  }
  function createViewUsuarioWindow(id) {
    viewUsuarioWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Usuario #${id}`,
      maximizable: false,
      webPreferences: {
        preload: path__default.join(__dirname$2, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    if (VITE_DEV_SERVER_URL) {
      viewUsuarioWindow.loadURL(`${VITE_DEV_SERVER_URL}#/config/usuarios/${id}`);
    } else {
      viewUsuarioWindow.loadFile(path__default.join("dist/index.html"));
    }
  }
  function createConfigWindow() {
    configAppWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Config PDV`,
      maximizable: false,
      webPreferences: {
        preload: path__default.join(__dirname$2, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    if (VITE_DEV_SERVER_URL) {
      configAppWindow.loadURL(`${VITE_DEV_SERVER_URL}#/pdv/config/app`);
    } else {
      configAppWindow.loadFile(path__default.join("dist/index.html"), {
        hash: `/pdv/config/app`
      });
    }
  }
  ipcMain.on("open-search-sales-window", () => {
    if (searchProductWindow && !searchProductWindow.isDestroyed()) {
      searchProductWindow.focus();
      return;
    }
    createSearchSalesWindow();
  });
  ipcMain.on("window:open:config", () => {
    if (!currentUserHasPermission("config:access")) {
      return;
    }
    if (configAppWindow && !configAppWindow.isDestroyed()) {
      configAppWindow.focus();
      return;
    }
    createConfigWindow();
  });
  ipcMain.on("window:open:pdv", () => {
    if (!currentUserHasPermission("pdv:access")) {
      return;
    }
    if (pdvWindow && !pdvWindow.isDestroyed()) {
      pdvWindow.focus();
      return;
    }
    createPdvWindow();
  });
  ipcMain.on("window:open:products-search", () => {
    if (searchProductWindow && !searchProductWindow.isDestroyed()) {
      searchProductWindow.focus();
      return;
    }
    createSearchProductWindow();
  });
  ipcMain.on("vendas:criar-janela-ver-vendas", (_, id) => {
    if (viewVendaWindow && !viewVendaWindow.isDestroyed()) {
      viewVendaWindow.focus();
      return;
    }
    createViewVendaWindow(id);
  });
  ipcMain.on("usuarios:criar-janela-ver-usuario", (_, id) => {
    if (!currentUserHasPermission("users:manage")) {
      return;
    }
    if (viewUsuarioWindow && !viewUsuarioWindow.isDestroyed()) {
      viewUsuarioWindow.focus();
      return;
    }
    createViewUsuarioWindow(id);
  });
  ipcMain.on("window:open:create-user", () => {
    if (!currentUserHasPermission("users:manage")) {
      return;
    }
    if (cadastrarUsuarioWindow && !cadastrarUsuarioWindow.isDestroyed()) {
      cadastrarUsuarioWindow.focus();
      return;
    }
    createCadastroUsuarioWindow();
  });
  ipcMain.on("window:open:edit-user", (_, id) => {
    if (!currentUserHasPermission("users:manage")) {
      return;
    }
    if (editUserWindow && !editUserWindow.isDestroyed()) {
      editUserWindow.focus();
      return;
    }
    createEditUserWindow(id);
  });
  function createCadastroUsuarioWindow() {
    cadastrarUsuarioWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Cadastrar Usuario`,
      maximizable: false,
      webPreferences: {
        preload: path__default.join(__dirname$2, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    if (VITE_DEV_SERVER_URL) {
      cadastrarUsuarioWindow.loadURL(`${VITE_DEV_SERVER_URL}#/config/usuarios/cadastrar_usuario`);
    } else {
      cadastrarUsuarioWindow.loadFile(path__default.join("dist/index.html"));
    }
  }
  function createEditUserWindow(id) {
    editUserWindow = new BrowserWindow({
      width: 764,
      height: 717,
      title: `Editar Usuario`,
      maximizable: false,
      webPreferences: {
        preload: path__default.join(__dirname$2, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    if (VITE_DEV_SERVER_URL) {
      editUserWindow.loadURL(`${VITE_DEV_SERVER_URL}#/config/users/edit_user/${id}`);
    } else {
      editUserWindow.loadFile(path__default.join("dist/index.html"));
    }
  }
}
function registerProductHandlers() {
  ipcMain.handle("produtos:get", (_, params) => {
    return listarProdutos(params);
  });
  ipcMain.handle("get-products-by-id", (_, id) => {
    if (!id) throw new Error("ID inválido");
    return select_product_by_id(id);
  });
  ipcMain.handle("produtos:buscar-por-nome", (_, termo) => {
    if (!termo) throw new Error("Nome Invalido");
    return buscarProdutosPorNome(termo);
  });
  ipcMain.handle("produtos:buscar-por-codigo-de-barras", (_, codigo) => {
    if (!codigo) throw new Error("Codigo de Barras invalido");
    return buscarProdutoPorCodigoBarras(codigo);
  });
  ipcMain.handle("suggest-product-by-term", (_, term) => {
    return selectSuggestionProduct(term);
  });
}
function registerPrinterhandlers() {
  ipcMain.handle("printer:buscar-impressoras", async () => {
    assertCurrentUserPermission("printers:manage");
    const win2 = BrowserWindow.getAllWindows()[0];
    return win2.webContents.getPrintersAsync();
  });
  ipcMain.handle("printer:add-impressora", (_event, dados) => {
    assertCurrentUserPermission("printers:manage");
    return addPrinter(dados);
  });
  ipcMain.handle("printer:listar-cadastradas", () => {
    assertCurrentUserPermission("printers:manage");
    return listarPrinters();
  });
  ipcMain.handle("printer:get-padrao", () => {
    return getPrinterPadrao();
  });
  ipcMain.handle("printer:remover", (_event, id) => {
    assertCurrentUserPermission("printers:manage");
    return removerPrinter(id);
  });
  ipcMain.handle("printer:definir-padrao", (_event, id) => {
    assertCurrentUserPermission("printers:manage");
    return definirPrinterPadrao(id);
  });
  ipcMain.handle("printer:atualizar-layout", (_event, id, dados) => {
    assertCurrentUserPermission("printers:manage");
    return atualizarLayoutPrinter(id, dados);
  });
  ipcMain.handle("printer:atualizar-personalizacao", (_event, id, receiptSettingsJson) => {
    assertCurrentUserPermission("printers:manage");
    return atualizarPersonalizacaoCupomPrinter(id, receiptSettingsJson);
  });
  ipcMain.handle("printer:test-print", (_event, printerId) => {
    assertCurrentUserPermission("printers:manage");
    return printDocumentService.printTestReceipt(printerId);
  });
  ipcMain.handle("printer:reprint-sale-receipt", (_event, saleId) => {
    assertCurrentUserPermission("sales:view");
    return printDocumentService.reprintSaleReceipt(saleId);
  });
}
function encerrarSessao(sessionId) {
  db.prepare(`
    UPDATE sessions
    SET active = 0,
        logout_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(sessionId);
}
function registerAuthHandlers() {
  ipcMain.handle("auth:login", (_event, username, password) => {
    const user = autenticarUsuario(username, password);
    setCurrentSession(user.sessionId);
    return user;
  });
  ipcMain.handle("auth:buscar-usuario", (_, id) => {
    if (!id) throw new Error("ID inválido");
    assertCurrentUserPermission("users:manage");
    return buscarUsuario(id);
  });
  ipcMain.handle("app:logoff-with-confirm", async () => {
    logger.info("Logoff solicitado pelo usuario");
    const { response } = await dialog.showMessageBox({
      type: "question",
      buttons: ["cancelar", "sair"],
      defaultId: 1,
      cancelId: 0,
      message: "Tem certeza que deseja encerrar sessao?"
    });
    if (response === 1) {
      const sessionId = getCurrentSession();
      if (sessionId) {
        encerrarSessao(sessionId);
        setCurrentSession(null);
      }
      logger.info("logoff aprovado pelo usuario");
      return true;
    }
    return false;
  });
}
function registerUserHandlers() {
  ipcMain.handle("salvar-foto-usuario", async (_, dados) => {
    assertCurrentUserPermission("users:manage");
    const userData = app.getPath("userData");
    const pasta = path__default.join(userData, "fotos");
    if (!fs$2.existsSync(pasta)) fs$2.mkdirSync(pasta);
    const extensao = path__default.extname(dados.nomeArquivo || "");
    const baseName = path__default.basename(dados.nomeArquivo || "foto", extensao).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const caminho = path__default.join(pasta, `${Date.now()}-${baseName}${extensao}`);
    fs$2.writeFileSync(caminho, Buffer.from(dados.buffer));
    return caminho;
  });
  ipcMain.handle("update-user", (_, data) => {
    assertCurrentUserPermission("users:manage");
    return updateUser(data);
  });
  ipcMain.handle("disable-user", (_, id) => {
    assertCurrentUserPermission("users:manage");
    return disableUser(id);
  });
  ipcMain.handle("enable-user", (_, id) => {
    assertCurrentUserPermission("users:manage");
    return enableUser(id);
  });
  ipcMain.handle("user:update-password", (_event, id, newPassword) => {
    assertCurrentUserPermission("users:manage");
    return alterarSenhaUsuario(id, newPassword);
  });
  ipcMain.handle("get-users", (_, params) => {
    assertCurrentUserPermission("users:manage");
    return selectUsers(params);
  });
  ipcMain.handle("usuarios:add", (_event, dados) => {
    assertCurrentUserPermission("users:manage");
    return addUsuario(dados);
  });
  ipcMain.handle("delete-user", (_event, id) => {
    assertCurrentUserPermission("users:manage");
    return removerUsuario(id);
  });
}
function registerPosHandlers() {
  ipcMain.handle("open-cash-session", async (_event, data) => {
    console.log("Abrindo caixa com dados: ", data);
    const session = insertCashSession(data);
    let print;
    try {
      print = await printDocumentService.printCashOpeningReceipt(session.id, "AUTO");
    } catch (error) {
      print = {
        success: false,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: error instanceof Error ? error.message : "Falha ao imprimir comprovante de abertura de caixa.",
        jobId: 0,
        reprint: false
      };
    }
    return { session, print };
  });
  ipcMain.handle("close-cash-session", async (_event, data) => {
    console.log("Fechando caixa com dados: ", data);
    const session = closeCashSession(data);
    let print;
    try {
      print = await printDocumentService.printCashClosingReceipt(session.id, "AUTO");
    } catch (error) {
      print = {
        success: false,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: error instanceof Error ? error.message : "Falha ao imprimir comprovante de fechamento de caixa.",
        jobId: 0,
        reprint: false
      };
    }
    return { session, print };
  });
  ipcMain.handle("get-open-cash-session", async (_event, data) => {
    return getOpenCashSession(data);
  });
  ipcMain.handle("register-cash-withdrawal", async (_event, data) => {
    assertCurrentUserPermission("cash:withdraw");
    return registerCashWithdrawal(data);
  });
  ipcMain.on("pdv:selecionar-produto", (_event, produto) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send("pdv:produto-selecionado", produto);
    }
  });
  ipcMain.on("pdv:retomar-venda", (_event, venda) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send("pdv:venda-retomada", venda);
    }
  });
}
function generateRandomState(size = 32) {
  return crypto$1.randomBytes(size).toString("hex");
}
function toBasicAuth(clientId, clientSecret) {
  return Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64");
}
class IntegrationRepository {
  getByIntegrationId(integrationId) {
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
    const row = stmt.get(integrationId);
    if (!row) {
      return null;
    }
    return {
      integrationId: row.integration_id,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      tokenType: row.token_type ?? "Bearer",
      expiresAt: row.expires_at,
      scope: row.scope,
      raw: row.raw_json ? JSON.parse(row.raw_json) : null,
      updatedAt: row.updated_at
    };
  }
  save(token) {
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
  delete(integrationId) {
    const stmt = db.prepare(`
      DELETE FROM integrations
      WHERE integration_id = ?
    `);
    stmt.run(integrationId);
  }
  isConnected(integrationId) {
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
const integrationRepository = new IntegrationRepository();
const BLING_AUTHORIZE_URL = "https://www.bling.com.br/Api/v3/oauth/authorize";
const BLING_TOKEN_URL = "https://api.bling.com.br/Api/v3/oauth/token";
const BLING_REVOKE_URL = "https://api.bling.com.br/oauth/revoke";
function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}
function parseRedirectUri(redirectUri) {
  const url = new URL$1(redirectUri);
  if (url.protocol !== "http:") {
    throw new Error(
      "Para callback local no Electron, use redirect URI no formato http://127.0.0.1:PORT/callback/bling"
    );
  }
  return {
    hostname: url.hostname,
    port: Number(url.port),
    pathname: url.pathname
  };
}
class BlingOAuthService {
  async getStatus() {
    const saved = integrationRepository.getByIntegrationId("bling");
    if (!saved) {
      return {
        connected: false,
        expiresAt: null
      };
    }
    try {
      await this.getValidAccessToken();
      const refreshed = integrationRepository.getByIntegrationId("bling");
      return {
        connected: true,
        expiresAt: (refreshed == null ? void 0 : refreshed.expiresAt) ?? null
      };
    } catch (error) {
      console.error("[BlingOAuthService.getStatus]", error);
      return {
        connected: false,
        expiresAt: saved.expiresAt
      };
    }
  }
  async connect() {
    const clientId = getRequiredEnv("BLING_CLIENT_ID");
    const redirectUri = getRequiredEnv("BLING_REDIRECT_URI");
    const state = generateRandomState(24);
    const code = await this.requestAuthorizationCode({
      clientId,
      redirectUri,
      state
    });
    await this.exchangeCodeForToken(code);
    return {
      success: true,
      message: "Bling conectado com sucesso."
    };
  }
  async disconnect() {
    const clientId = getRequiredEnv("BLING_CLIENT_ID");
    const clientSecret = getRequiredEnv("BLING_CLIENT_SECRET");
    const saved = integrationRepository.getByIntegrationId("bling");
    if (!saved) {
      return {
        success: true,
        message: "Bling já estava desconectado."
      };
    }
    try {
      const body = new URLSearchParams({
        token: saved.refreshToken
      });
      await fetch(BLING_REVOKE_URL, {
        method: "POST",
        headers: {
          Authorization: `Basic ${toBasicAuth(clientId, clientSecret)}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: body.toString()
      });
    } catch (error) {
      console.warn("[BlingOAuthService.disconnect] falha ao revogar remotamente:", error);
    }
    integrationRepository.delete("bling");
    return {
      success: true,
      message: "Bling desconectado com sucesso."
    };
  }
  async getValidAccessToken() {
    const saved = integrationRepository.getByIntegrationId("bling");
    if (!saved) {
      throw new Error("Bling não está conectado.");
    }
    const expiresAtMs = new Date(saved.expiresAt).getTime();
    const expired = expiresAtMs <= Date.now() + 6e4;
    if (!expired) {
      return saved.accessToken;
    }
    await this.refreshAccessToken(saved.refreshToken);
    const refreshed = integrationRepository.getByIntegrationId("bling");
    if (!refreshed) {
      throw new Error("Falha ao renovar token do Bling.");
    }
    return refreshed.accessToken;
  }
  async requestAuthorizationCode(params) {
    const { hostname, port, pathname } = parseRedirectUri(params.redirectUri);
    const authorizeUrl = new URL$1(BLING_AUTHORIZE_URL);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("client_id", params.clientId);
    authorizeUrl.searchParams.set("state", params.state);
    authorizeUrl.searchParams.set("redirect_uri", params.redirectUri);
    return await new Promise((resolve, reject) => {
      let finished = false;
      const cleanup = (server2, timeout2) => {
        clearTimeout(timeout2);
        server2.close();
      };
      const server = http.createServer((req, res) => {
        try {
          if (!req.url) {
            throw new Error("Callback sem URL.");
          }
          const callbackUrl = new URL$1(req.url, `http://${hostname}:${port}`);
          if (callbackUrl.pathname !== pathname) {
            res.statusCode = 404;
            res.end("Not found");
            return;
          }
          const error = callbackUrl.searchParams.get("error");
          const code = callbackUrl.searchParams.get("code");
          const state = callbackUrl.searchParams.get("state");
          if (error) {
            res.statusCode = 400;
            res.end("Autorização recusada ou inválida.");
            if (!finished) {
              finished = true;
              cleanup(server, timeout);
              reject(new Error(`Bling retornou erro no callback: ${error}`));
            }
            return;
          }
          if (!code) {
            res.statusCode = 400;
            res.end("Authorization code não recebido.");
            if (!finished) {
              finished = true;
              cleanup(server, timeout);
              reject(new Error("Authorization code não recebido."));
            }
            return;
          }
          if (state !== params.state) {
            res.statusCode = 400;
            res.end("State inválido.");
            if (!finished) {
              finished = true;
              cleanup(server, timeout);
              reject(new Error("State inválido no callback do Bling."));
            }
            return;
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
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
            reject(error instanceof Error ? error : new Error("Erro desconhecido no callback."));
          }
        }
      });
      const timeout = setTimeout(() => {
        if (!finished) {
          finished = true;
          cleanup(server, timeout);
          reject(new Error("Tempo esgotado aguardando autorização do Bling."));
        }
      }, 12e4);
      server.listen(port, hostname, async () => {
        try {
          await shell.openExternal(authorizeUrl.toString());
        } catch (error) {
          if (!finished) {
            finished = true;
            cleanup(server, timeout);
            reject(
              error instanceof Error ? error : new Error("Falha ao abrir navegador para autorização.")
            );
          }
        }
      });
      server.on("error", (error) => {
        if (!finished) {
          finished = true;
          cleanup(server, timeout);
          reject(error instanceof Error ? error : new Error("Erro ao iniciar servidor local."));
        }
      });
    });
  }
  async exchangeCodeForToken(code) {
    const clientId = getRequiredEnv("BLING_CLIENT_ID");
    const clientSecret = getRequiredEnv("BLING_CLIENT_SECRET");
    const redirectUri = getRequiredEnv("BLING_REDIRECT_URI");
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    });
    const response = await fetch(BLING_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${toBasicAuth(clientId, clientSecret)}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "enable-jwt": "1"
      },
      body: body.toString()
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Falha ao trocar code por token no Bling: ${response.status} - ${text}`);
    }
    const data = JSON.parse(text);
    this.persistToken(data);
  }
  async refreshAccessToken(refreshToken) {
    const clientId = getRequiredEnv("BLING_CLIENT_ID");
    const clientSecret = getRequiredEnv("BLING_CLIENT_SECRET");
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    });
    const response = await fetch(BLING_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${toBasicAuth(clientId, clientSecret)}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "enable-jwt": "1"
      },
      body: body.toString()
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Falha ao renovar token do Bling: ${response.status} - ${text}`);
    }
    const data = JSON.parse(text);
    this.persistToken(data);
  }
  persistToken(data) {
    const expiresAt = new Date(Date.now() + data.expires_in * 1e3).toISOString();
    const payload = {
      integrationId: "bling",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresAt,
      scope: data.scope ?? null,
      raw: data,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    integrationRepository.save(payload);
  }
}
const blingOAuthService = new BlingOAuthService();
const BLING_API_BASE_URL = "https://api.bling.com.br/Api/v3";
class BlingApiService {
  /**
   * Método genérico GET para a API da Bling.
   *
   * Permite passar query params dinamicamente.
   */
  async get(path2, params) {
    const accessToken = await blingOAuthService.getValidAccessToken();
    const url = new URL(`${BLING_API_BASE_URL}${path2}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "enable-jwt": "1"
      }
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Erro na API do Bling: ${response.status} - ${text}`);
    }
    return JSON.parse(text);
  }
  /**
   * Endpoint simples de teste da API.
   */
  async ping() {
    return this.get("/empresas/me");
  }
  /**
   * Método antigo (mantido por compatibilidade).
   *
   * ⚠️ Não suporta paginação
   */
  async listarProdutos() {
    return this.get("/produtos");
  }
  /**
   * Novo método para buscar produtos com paginação.
   *
   * Esse método será usado pelo Sync.
   *
   * Parâmetros:
   * - page: número da página
   * - limit: quantidade de registros por página
   */
  async getProducts(params) {
    return this.get("/produtos", {
      pagina: (params == null ? void 0 : params.page) ?? 1,
      limite: (params == null ? void 0 : params.limit) ?? 100,
      criterio: params == null ? void 0 : params.criterio,
      dataAlteracaoInicial: params == null ? void 0 : params.dataAlteracaoInicial
    });
  }
  async getCategories(params) {
    return this.get("/categorias/produtos", {
      pagina: (params == null ? void 0 : params.page) ?? 1,
      limite: (params == null ? void 0 : params.limit) ?? 100
    });
  }
}
const blingApiService = new BlingApiService();
function randomId() {
  return crypto$1.randomUUID();
}
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function subtractMinutes(isoDate, minutes) {
  const dt = new Date(isoDate);
  dt.setMinutes(dt.getMinutes() - minutes);
  return dt.toISOString();
}
class CategoryRepository {
  countByIntegrationSource(integrationSource) {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM categories
      WHERE integration_source = ? AND deleted_at IS NULL
    `).get(integrationSource);
    return row.count;
  }
  upsert(category) {
    if (!(category == null ? void 0 : category.externalId) || !(category == null ? void 0 : category.name)) {
      console.warn("[CategoryRepository] Pulando categoria inválida:", category);
      return;
    }
    const now = nowIso();
    db.prepare(`
      INSERT INTO categories (
        id, external_id, integration_source, name, active,
        remote_updated_at, last_synced_at, sync_status,
        raw_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_source, external_id) DO UPDATE SET
        name              = excluded.name,
        active            = excluded.active,
        remote_updated_at = excluded.remote_updated_at,
        last_synced_at    = excluded.last_synced_at,
        sync_status       = excluded.sync_status,
        raw_json          = excluded.raw_json,
        updated_at        = excluded.updated_at
    `).run(
      category.id ?? randomId(),
      category.externalId,
      category.integrationSource,
      category.name,
      category.active ?? 1,
      category.remoteUpdatedAt ?? null,
      category.lastSyncedAt,
      category.syncStatus ?? "synced",
      category.raw ? JSON.stringify(category.raw) : null,
      category.createdAt ?? now,
      category.updatedAt ?? now
    );
  }
  upsertMany(categories) {
    const run = db.transaction((items) => {
      for (const item of items) this.upsert(item);
    });
    run(categories);
  }
  getExternalIdsBySource(integrationSource, externalIds) {
    if (externalIds.length === 0) return [];
    const placeholders = externalIds.map(() => "?").join(",");
    const rows = db.prepare(`
      SELECT external_id FROM categories
      WHERE integration_source = ? AND external_id IN (${placeholders})
    `).all(integrationSource, ...externalIds);
    return rows.map((r) => r.external_id);
  }
  /**
   * Retorna um Map de externalId -> localId para todas as categorias de uma fonte.
   * Usado pelo sync de produtos para linkar category_id sem fazer N queries.
   */
  getAllExternalIdMap(integrationSource) {
    const rows = db.prepare(`
      SELECT id, external_id FROM categories
      WHERE integration_source = ? AND deleted_at IS NULL
    `).all(integrationSource);
    return new Map(rows.map((r) => [r.external_id, r.id]));
  }
  mapRow(row) {
    let raw = null;
    if (row.raw_json) {
      try {
        raw = JSON.parse(row.raw_json);
      } catch {
        raw = row.raw_json;
      }
    }
    return {
      id: row.id,
      externalId: row.external_id,
      integrationSource: row.integration_source,
      name: row.name,
      active: row.active,
      remoteUpdatedAt: row.remote_updated_at,
      lastSyncedAt: row.last_synced_at ?? "",
      syncStatus: row.sync_status,
      raw,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
const categoryRepository = new CategoryRepository();
class SyncStateRepository {
  get(integrationId, resource) {
    const row = db.prepare(`
      SELECT * FROM sync_states
      WHERE integration_id = ? AND resource = ?
      LIMIT 1
    `).get(integrationId, resource);
    if (!row) return null;
    return {
      integrationId: row.integration_id,
      resource: row.resource,
      lastSyncAt: row.last_sync_at,
      lastSuccessAt: row.last_success_at,
      checkpointCursor: row.checkpoint_cursor,
      status: row.status,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  save(state) {
    db.prepare(`
      INSERT INTO sync_states (
        id, integration_id, resource, last_sync_at, last_success_at,
        checkpoint_cursor, status, error_message, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_id, resource) DO UPDATE SET
        last_sync_at      = excluded.last_sync_at,
        last_success_at   = excluded.last_success_at,
        checkpoint_cursor = excluded.checkpoint_cursor,
        status            = excluded.status,
        error_message     = excluded.error_message,
        updated_at        = excluded.updated_at
    `).run(
      randomId(),
      state.integrationId,
      state.resource,
      state.lastSyncAt ?? null,
      state.lastSuccessAt ?? null,
      state.checkpointCursor ?? null,
      state.status,
      state.errorMessage ?? null,
      state.createdAt,
      state.updatedAt
    );
  }
  markRunning(integrationId, resource) {
    const now = nowIso();
    const current = this.get(integrationId, resource);
    this.save({
      integrationId,
      resource,
      lastSyncAt: now,
      lastSuccessAt: (current == null ? void 0 : current.lastSuccessAt) ?? null,
      checkpointCursor: (current == null ? void 0 : current.checkpointCursor) ?? null,
      status: "running",
      errorMessage: null,
      createdAt: (current == null ? void 0 : current.createdAt) ?? now,
      updatedAt: now
    });
  }
  markSuccess(integrationId, resource, checkpointCursor) {
    const now = nowIso();
    const current = this.get(integrationId, resource);
    this.save({
      integrationId,
      resource,
      lastSyncAt: now,
      lastSuccessAt: now,
      checkpointCursor: checkpointCursor ?? (current == null ? void 0 : current.checkpointCursor) ?? null,
      status: "success",
      errorMessage: null,
      createdAt: (current == null ? void 0 : current.createdAt) ?? now,
      updatedAt: now
    });
  }
  markError(integrationId, resource, errorMessage) {
    const now = nowIso();
    const current = this.get(integrationId, resource);
    this.save({
      integrationId,
      resource,
      lastSyncAt: (current == null ? void 0 : current.lastSyncAt) ?? null,
      lastSuccessAt: (current == null ? void 0 : current.lastSuccessAt) ?? null,
      checkpointCursor: (current == null ? void 0 : current.checkpointCursor) ?? null,
      status: "error",
      errorMessage,
      createdAt: (current == null ? void 0 : current.createdAt) ?? now,
      updatedAt: now
    });
  }
}
const syncStateRepository = new SyncStateRepository();
class SyncLogRepository {
  start(params) {
    const id = randomId();
    db.prepare(`
      INSERT INTO sync_logs (
        id, integration_id, resource, mode, status,
        started_at, items_processed, items_created, items_updated, items_failed
      ) VALUES (?, ?, ?, ?, 'running', ?, 0, 0, 0, 0)
    `).run(id, params.integrationId, params.resource, params.mode, params.startedAt);
    return id;
  }
  finish(params) {
    db.prepare(`
      UPDATE sync_logs SET
        status          = ?,
        finished_at     = ?,
        items_processed = ?,
        items_created   = ?,
        items_updated   = ?,
        items_failed    = ?,
        error_message   = ?
      WHERE id = ?
    `).run(
      params.status,
      params.finishedAt,
      params.itemsProcessed,
      params.itemsCreated,
      params.itemsUpdated,
      params.itemsFailed,
      params.errorMessage ?? null,
      params.id
    );
  }
  listByIntegration(integrationId, resource, limit = 20) {
    const rows = db.prepare(`
      SELECT * FROM sync_logs
      WHERE integration_id = ? AND resource = ?
      ORDER BY started_at DESC
      LIMIT ?
    `).all(integrationId, resource, limit);
    return rows.map((row) => ({
      id: row.id,
      integrationId: row.integration_id,
      resource: row.resource,
      mode: row.mode,
      status: row.status,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      itemsProcessed: row.items_processed,
      itemsCreated: row.items_created,
      itemsUpdated: row.items_updated,
      itemsFailed: row.items_failed,
      errorMessage: row.error_message
    }));
  }
}
const syncLogRepository = new SyncLogRepository();
async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
const INTEGRATION_ID$1 = "bling";
const RESOURCE$1 = "categories";
const PAGE_LIMIT$1 = 100;
function getCategoryName(category) {
  const candidates = [
    category.nome,
    category.descricao,
    category.description
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}
function mapBlingCategory(category, now) {
  if (category == null) return null;
  if (!category.id) return null;
  const name = getCategoryName(category);
  if (!name) return null;
  return {
    externalId: String(category.id),
    integrationSource: INTEGRATION_ID$1,
    name,
    active: 1,
    lastSyncedAt: now,
    syncStatus: "synced",
    raw: category,
    updatedAt: now
  };
}
class SyncCategoriesFromBlingService {
  async execute() {
    const state = syncStateRepository.get(INTEGRATION_ID$1, RESOURCE$1);
    const localCount = categoryRepository.countByIntegrationSource(INTEGRATION_ID$1);
    const isInitial = !state || !state.lastSuccessAt || localCount === 0;
    const mode = isInitial ? "initial" : "incremental";
    syncStateRepository.markRunning(INTEGRATION_ID$1, RESOURCE$1);
    const startedAt = nowIso();
    const logId = syncLogRepository.start({
      integrationId: INTEGRATION_ID$1,
      resource: RESOURCE$1,
      mode,
      startedAt
    });
    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;
    try {
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const response = await blingApiService.getCategories({ page, limit: PAGE_LIMIT$1 });
        const rawItems = Array.isArray(response.data) ? response.data : [];
        const validRaw = rawItems.filter((c) => c != null);
        const nullsInResponse = rawItems.length - validRaw.length;
        totalFailed += nullsInResponse;
        if (validRaw.length === 0 && page === 1) {
          hasMore = false;
          break;
        }
        const now = nowIso();
        const allMapped = validRaw.map((c) => mapBlingCategory(c, now));
        const mapped = allMapped.filter((c) => c != null);
        totalFailed += allMapped.length - mapped.length;
        totalProcessed += rawItems.length;
        if (rawItems.length > 0 && mapped.length === 0) {
          console.warn("[SyncCategoriesFromBlingService] Nenhuma categoria válida mapeada. Exemplo de payload:", rawItems[0]);
        }
        if (mapped.length > 0) {
          const externalIds = mapped.map((c) => c.externalId);
          const existingIds = new Set(
            categoryRepository.getExternalIdsBySource(INTEGRATION_ID$1, externalIds)
          );
          for (const c of mapped) {
            if (existingIds.has(c.externalId)) {
              totalUpdated++;
            } else {
              totalCreated++;
            }
          }
          categoryRepository.upsertMany(mapped);
        }
        if (rawItems.length < PAGE_LIMIT$1) {
          hasMore = false;
        } else {
          page++;
          await sleep(350);
        }
      }
      const finishedAt = nowIso();
      syncStateRepository.markSuccess(INTEGRATION_ID$1, RESOURCE$1);
      syncLogRepository.finish({
        id: logId,
        status: "success",
        finishedAt,
        itemsProcessed: totalProcessed,
        itemsCreated: totalCreated,
        itemsUpdated: totalUpdated,
        itemsFailed: totalFailed
      });
      return { mode, processed: totalProcessed, created: totalCreated, updated: totalUpdated, failed: totalFailed };
    } catch (error) {
      const finishedAt = nowIso();
      const errorMessage = error instanceof Error ? error.message : String(error);
      syncStateRepository.markError(INTEGRATION_ID$1, RESOURCE$1, errorMessage);
      syncLogRepository.finish({
        id: logId,
        status: "failed",
        finishedAt,
        itemsProcessed: totalProcessed,
        itemsCreated: totalCreated,
        itemsUpdated: totalUpdated,
        itemsFailed: totalFailed,
        errorMessage
      });
      throw error;
    }
  }
}
const syncCategoriesFromBlingService = new SyncCategoriesFromBlingService();
class ProductRepository {
  countByIntegrationSource(integrationSource) {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE integration_source = ? AND deleted_at IS NULL
    `).get(integrationSource);
    return row.count;
  }
  upsert(product) {
    const now = nowIso();
    const localId = product.id ?? randomId();
    db.prepare(`
      INSERT INTO products (
        id, external_id, integration_source, sku, barcode, category_id,
        name, unit, sale_price_cents, cost_price_cents, current_stock, minimum_stock,
        ncm, origin, fixed_ipi_value_cents, notes, situation, supplier_code, supplier_name,
        location, maximum_stock, net_weight_kg, gross_weight_kg, packaging_barcode,
        width_cm, height_cm, depth_cm, expiration_date, supplier_product_description,
        complementary_description, items_per_box, is_variation, production_type,
        ipi_tax_class, service_list_code, item_type, tags_group, tags, taxes_json,
        parent_code, integration_code, product_group, brand, cest, volumes,
        short_description, cross_docking_days, external_image_urls, external_link,
        supplier_warranty_months, clone_parent_data, product_condition, free_shipping,
        fci_number, department, measurement_unit, purchase_price_cents,
        icms_st_retention_base_cents, icms_st_retention_value_cents,
        icms_substitute_own_value_cents, product_category_name, additional_info, active,
        remote_created_at, remote_updated_at, last_synced_at, sync_status,
        raw_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_source, external_id) DO UPDATE SET
        sku               = excluded.sku,
        barcode           = excluded.barcode,
        category_id       = excluded.category_id,
        name              = excluded.name,
        unit              = excluded.unit,
        sale_price_cents  = excluded.sale_price_cents,
        cost_price_cents  = excluded.cost_price_cents,
        current_stock     = excluded.current_stock,
        minimum_stock     = excluded.minimum_stock,
        ncm               = excluded.ncm,
        origin            = excluded.origin,
        fixed_ipi_value_cents = excluded.fixed_ipi_value_cents,
        notes             = excluded.notes,
        situation         = excluded.situation,
        supplier_code     = excluded.supplier_code,
        supplier_name     = excluded.supplier_name,
        location          = excluded.location,
        maximum_stock     = excluded.maximum_stock,
        net_weight_kg     = excluded.net_weight_kg,
        gross_weight_kg   = excluded.gross_weight_kg,
        packaging_barcode = excluded.packaging_barcode,
        width_cm          = excluded.width_cm,
        height_cm         = excluded.height_cm,
        depth_cm          = excluded.depth_cm,
        expiration_date   = excluded.expiration_date,
        supplier_product_description = excluded.supplier_product_description,
        complementary_description = excluded.complementary_description,
        items_per_box     = excluded.items_per_box,
        is_variation      = excluded.is_variation,
        production_type   = excluded.production_type,
        ipi_tax_class     = excluded.ipi_tax_class,
        service_list_code = excluded.service_list_code,
        item_type         = excluded.item_type,
        tags_group        = excluded.tags_group,
        tags              = excluded.tags,
        taxes_json        = excluded.taxes_json,
        parent_code       = excluded.parent_code,
        integration_code  = excluded.integration_code,
        product_group     = excluded.product_group,
        brand             = excluded.brand,
        cest              = excluded.cest,
        volumes           = excluded.volumes,
        short_description = excluded.short_description,
        cross_docking_days = excluded.cross_docking_days,
        external_image_urls = excluded.external_image_urls,
        external_link     = excluded.external_link,
        supplier_warranty_months = excluded.supplier_warranty_months,
        clone_parent_data = excluded.clone_parent_data,
        product_condition = excluded.product_condition,
        free_shipping     = excluded.free_shipping,
        fci_number        = excluded.fci_number,
        department        = excluded.department,
        measurement_unit  = excluded.measurement_unit,
        purchase_price_cents = excluded.purchase_price_cents,
        icms_st_retention_base_cents = excluded.icms_st_retention_base_cents,
        icms_st_retention_value_cents = excluded.icms_st_retention_value_cents,
        icms_substitute_own_value_cents = excluded.icms_substitute_own_value_cents,
        product_category_name = excluded.product_category_name,
        additional_info   = excluded.additional_info,
        active            = excluded.active,
        remote_created_at = excluded.remote_created_at,
        remote_updated_at = excluded.remote_updated_at,
        last_synced_at    = excluded.last_synced_at,
        sync_status       = excluded.sync_status,
        raw_json          = excluded.raw_json,
        updated_at        = excluded.updated_at
    `).run(
      localId,
      product.externalId,
      product.integrationSource,
      product.sku ?? null,
      product.barcode ?? null,
      product.categoryId ?? null,
      product.name,
      product.unit ?? null,
      product.salePriceCents,
      product.costPriceCents,
      product.currentStock ?? 0,
      product.minimumStock ?? 0,
      product.ncm ?? null,
      product.origin ?? null,
      product.fixedIpiValueCents ?? null,
      product.notes ?? null,
      product.situation ?? null,
      product.supplierCode ?? null,
      product.supplierName ?? null,
      product.location ?? null,
      product.maximumStock ?? null,
      product.netWeightKg ?? null,
      product.grossWeightKg ?? null,
      product.packagingBarcode ?? null,
      product.widthCm ?? null,
      product.heightCm ?? null,
      product.depthCm ?? null,
      product.expirationDate ?? null,
      product.supplierProductDescription ?? null,
      product.complementaryDescription ?? null,
      product.itemsPerBox ?? null,
      product.isVariation ?? null,
      product.productionType ?? null,
      product.ipiTaxClass ?? null,
      product.serviceListCode ?? null,
      product.itemType ?? null,
      product.tagsGroup ?? null,
      product.tags ?? null,
      product.taxesJson ?? null,
      product.parentCode ?? null,
      product.integrationCode ?? null,
      product.productGroup ?? null,
      product.brand ?? null,
      product.cest ?? null,
      product.volumes ?? null,
      product.shortDescription ?? null,
      product.crossDockingDays ?? null,
      product.externalImageUrls ?? null,
      product.externalLink ?? null,
      product.supplierWarrantyMonths ?? null,
      product.cloneParentData ?? null,
      product.productCondition ?? null,
      product.freeShipping ?? null,
      product.fciNumber ?? null,
      product.department ?? null,
      product.measurementUnit ?? null,
      product.purchasePriceCents ?? null,
      product.icmsStRetentionBaseCents ?? null,
      product.icmsStRetentionValueCents ?? null,
      product.icmsSubstituteOwnValueCents ?? null,
      product.productCategoryName ?? null,
      product.additionalInfo ?? null,
      product.active,
      product.remoteCreatedAt ?? null,
      product.remoteUpdatedAt ?? null,
      product.lastSyncedAt,
      product.syncStatus ?? "synced",
      product.raw ? JSON.stringify(product.raw) : null,
      product.createdAt ?? now,
      product.updatedAt ?? now
    );
    db.prepare(`
      INSERT INTO produtos (
        id, internal_code, gtin, nome, marca, preco_custo, preco_venda,
        estoque_atual, estoque_minimo, unidade_medida, ncm, ativo, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        internal_code = excluded.internal_code,
        gtin = excluded.gtin,
        nome = excluded.nome,
        marca = excluded.marca,
        preco_custo = excluded.preco_custo,
        preco_venda = excluded.preco_venda,
        estoque_atual = excluded.estoque_atual,
        estoque_minimo = excluded.estoque_minimo,
        unidade_medida = excluded.unidade_medida,
        ncm = excluded.ncm,
        ativo = excluded.ativo,
        updated_at = excluded.updated_at
    `).run(
      localId,
      product.sku ?? null,
      product.barcode ?? null,
      product.name,
      product.brand ?? null,
      product.costPriceCents / 100,
      product.salePriceCents / 100,
      product.currentStock ?? 0,
      product.minimumStock ?? 0,
      product.measurementUnit ?? product.unit ?? null,
      product.ncm ?? null,
      product.active,
      product.createdAt ?? now,
      product.updatedAt ?? now
    );
  }
  upsertMany(products) {
    const run = db.transaction((items) => {
      for (const item of items) this.upsert(item);
    });
    run(products);
  }
  getExternalIdsBySource(integrationSource, externalIds) {
    if (externalIds.length === 0) return [];
    const placeholders = externalIds.map(() => "?").join(",");
    const rows = db.prepare(`
      SELECT external_id FROM products
      WHERE integration_source = ? AND external_id IN (${placeholders})
    `).all(integrationSource, ...externalIds);
    return rows.map((r) => r.external_id);
  }
  getByExternalId(integrationSource, externalId) {
    const row = db.prepare(`
      SELECT * FROM products
      WHERE integration_source = ? AND external_id = ?
      LIMIT 1
    `).get(integrationSource, externalId);
    return row ? this.mapRow(row) : null;
  }
  listByIntegrationSource(integrationSource) {
    const rows = db.prepare(`
      SELECT * FROM products
      WHERE integration_source = ? AND deleted_at IS NULL
      ORDER BY name ASC
    `).all(integrationSource);
    return rows.map((row) => this.mapRow(row));
  }
  mapRow(row) {
    let raw = null;
    if (row.raw_json) {
      try {
        raw = JSON.parse(row.raw_json);
      } catch {
        raw = row.raw_json;
      }
    }
    return {
      id: row.id,
      externalId: row.external_id,
      integrationSource: row.integration_source,
      sku: row.sku,
      barcode: row.barcode,
      categoryId: row.category_id,
      name: row.name,
      unit: row.unit,
      salePriceCents: row.sale_price_cents,
      costPriceCents: row.cost_price_cents,
      currentStock: row.current_stock,
      minimumStock: row.minimum_stock,
      ncm: row.ncm,
      origin: row.origin,
      fixedIpiValueCents: row.fixed_ipi_value_cents,
      notes: row.notes,
      situation: row.situation,
      supplierCode: row.supplier_code,
      supplierName: row.supplier_name,
      location: row.location,
      maximumStock: row.maximum_stock,
      netWeightKg: row.net_weight_kg,
      grossWeightKg: row.gross_weight_kg,
      packagingBarcode: row.packaging_barcode,
      widthCm: row.width_cm,
      heightCm: row.height_cm,
      depthCm: row.depth_cm,
      expirationDate: row.expiration_date,
      supplierProductDescription: row.supplier_product_description,
      complementaryDescription: row.complementary_description,
      itemsPerBox: row.items_per_box,
      isVariation: row.is_variation,
      productionType: row.production_type,
      ipiTaxClass: row.ipi_tax_class,
      serviceListCode: row.service_list_code,
      itemType: row.item_type,
      tagsGroup: row.tags_group,
      tags: row.tags,
      taxesJson: row.taxes_json,
      parentCode: row.parent_code,
      integrationCode: row.integration_code,
      productGroup: row.product_group,
      brand: row.brand,
      cest: row.cest,
      volumes: row.volumes,
      shortDescription: row.short_description,
      crossDockingDays: row.cross_docking_days,
      externalImageUrls: row.external_image_urls,
      externalLink: row.external_link,
      supplierWarrantyMonths: row.supplier_warranty_months,
      cloneParentData: row.clone_parent_data,
      productCondition: row.product_condition,
      freeShipping: row.free_shipping,
      fciNumber: row.fci_number,
      department: row.department,
      measurementUnit: row.measurement_unit,
      purchasePriceCents: row.purchase_price_cents,
      icmsStRetentionBaseCents: row.icms_st_retention_base_cents,
      icmsStRetentionValueCents: row.icms_st_retention_value_cents,
      icmsSubstituteOwnValueCents: row.icms_substitute_own_value_cents,
      productCategoryName: row.product_category_name,
      additionalInfo: row.additional_info,
      active: row.active,
      remoteCreatedAt: row.remote_created_at,
      remoteUpdatedAt: row.remote_updated_at,
      lastSyncedAt: row.last_synced_at ?? "",
      syncStatus: row.sync_status,
      raw,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
const productRepository = new ProductRepository();
const INTEGRATION_ID = "bling";
const RESOURCE = "products";
const PAGE_LIMIT = 100;
const PRODUCT_LIST_CRITERION = "5";
function getNestedValue(source, path2) {
  if (!source || typeof source !== "object") return void 0;
  let current = source;
  for (const key of path2.split(".")) {
    if (!current || typeof current !== "object" || !(key in current)) return void 0;
    current = current[key];
  }
  return current;
}
function pickValue(source, paths) {
  for (const path2 of paths) {
    const value = getNestedValue(source, path2);
    if (value !== void 0 && value !== null && value !== "") {
      return value;
    }
  }
  return void 0;
}
function toNullableString(value) {
  if (value === void 0 || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}
function toNullableNumber(value) {
  if (value === void 0 || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
function toMoneyCents(value) {
  const parsed = toNullableNumber(value);
  return parsed == null ? null : Math.round(parsed * 100);
}
function toNullableInteger(value) {
  const parsed = toNullableNumber(value);
  return parsed == null ? null : Math.round(parsed);
}
function toNullableBooleanInt(value) {
  if (value === void 0 || value === null || value === "") return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value === 0 ? 0 : 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "t", "sim", "s", "y", "yes", "a", "ativo"].includes(normalized)) return 1;
    if (["0", "false", "f", "nao", "não", "n", "no", "i", "inativo"].includes(normalized)) return 0;
  }
  return null;
}
function serializeStructuredValue(value) {
  if (value === void 0 || value === null || value === "") return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
function resolveCategoryExternalId(product) {
  const categoryId = pickValue(product, [
    "categoria.id",
    "categoriaProduto.id",
    "categoriaProdutoId"
  ]);
  return toNullableString(categoryId);
}
function toBlingDateTime(value) {
  return value.replace("T", " ").slice(0, 19);
}
function getIncrementalCursor(state) {
  const baseCursor = (state == null ? void 0 : state.checkpointCursor) ?? (state == null ? void 0 : state.lastSuccessAt);
  if (!baseCursor) return void 0;
  const cursorDate = baseCursor.includes("T") ? subtractMinutes(baseCursor, 2) : subtractMinutes(baseCursor.replace(" ", "T") + "Z", 2);
  return toBlingDateTime(cursorDate);
}
function mapBlingProduct(product, now, categoryIdMap) {
  const categoryExternalId = resolveCategoryExternalId(product);
  const salePriceCents = toMoneyCents(pickValue(product, ["preco"])) ?? 0;
  const costPriceCents = toMoneyCents(pickValue(product, ["precoCusto"])) ?? 0;
  const purchasePriceCents = toMoneyCents(pickValue(product, ["precoCompra", "precoCusto"]));
  const currentStock = toNullableNumber(pickValue(product, [
    "estoque.saldoVirtualTotal",
    "estoque.saldoFisicoTotal",
    "estoque"
  ])) ?? 0;
  const minimumStock = toNullableNumber(pickValue(product, [
    "estoque.minimo",
    "estoqueMinimo"
  ])) ?? 0;
  const activeFlag = toNullableBooleanInt(pickValue(product, ["situacao"])) ?? 0;
  const supplierName = toNullableString(pickValue(product, [
    "fornecedor.nome",
    "fornecedor"
  ]));
  const categoryName = toNullableString(pickValue(product, [
    "categoria.nome",
    "categoriaProduto.nome",
    "categoriaProduto"
  ]));
  return {
    // Identificação do produto no Bling e origem da integração.
    externalId: String(product.id),
    integrationSource: INTEGRATION_ID,
    // Dados comerciais e de identificação. Campos ausentes viram null para manter padrão local.
    sku: toNullableString(pickValue(product, ["codigo"])) ?? null,
    barcode: toNullableString(pickValue(product, ["gtin", "codigo"])) ?? null,
    categoryId: categoryExternalId ? categoryIdMap.get(categoryExternalId) ?? null : null,
    name: product.nome,
    unit: toNullableString(pickValue(product, ["unidade", "unidadeMedida"])) ?? null,
    // Valores monetários são armazenados em centavos para evitar problemas com ponto flutuante.
    salePriceCents,
    costPriceCents,
    purchasePriceCents,
    // Estoque e limites locais.
    currentStock,
    minimumStock,
    maximumStock: toNullableNumber(pickValue(product, [
      "estoque.maximo",
      "estoqueMaximo"
    ])),
    // Espelho ampliado do Bling.
    ncm: toNullableString(pickValue(product, ["ncm"])),
    origin: toNullableString(pickValue(product, ["origem"])),
    fixedIpiValueCents: toMoneyCents(pickValue(product, ["valorIpiFixo"])),
    notes: toNullableString(pickValue(product, ["observacoes", "observacao"])),
    situation: toNullableString(pickValue(product, ["situacao"])),
    supplierCode: toNullableString(pickValue(product, ["codigoFornecedor"])),
    supplierName,
    location: toNullableString(pickValue(product, ["localizacao"])),
    netWeightKg: toNullableNumber(pickValue(product, ["pesoLiquido"])),
    grossWeightKg: toNullableNumber(pickValue(product, ["pesoBruto"])),
    packagingBarcode: toNullableString(pickValue(product, ["gtinEmbalagem"])),
    widthCm: toNullableNumber(pickValue(product, ["larguraProduto", "largura"])),
    heightCm: toNullableNumber(pickValue(product, ["alturaProduto", "altura"])),
    depthCm: toNullableNumber(pickValue(product, ["profundidadeProduto", "profundidade"])),
    expirationDate: toNullableString(pickValue(product, ["dataValidade"])),
    supplierProductDescription: toNullableString(pickValue(product, [
      "descricaoFornecedor",
      "descricaoProdutoFornecedor"
    ])),
    complementaryDescription: toNullableString(pickValue(product, ["descricaoComplementar"])),
    itemsPerBox: toNullableNumber(pickValue(product, ["itensPorCaixa"])),
    isVariation: toNullableBooleanInt(pickValue(product, ["produtoVariacao", "variacao"])),
    productionType: toNullableString(pickValue(product, ["tipoProducao"])),
    ipiTaxClass: toNullableString(pickValue(product, ["classeEnquadramentoIpi"])),
    serviceListCode: toNullableString(pickValue(product, ["codigoListaServicos"])),
    itemType: toNullableString(pickValue(product, ["tipoItem", "tipo"])),
    tagsGroup: serializeStructuredValue(pickValue(product, ["grupoTags", "grupoDeTags"])),
    tags: serializeStructuredValue(pickValue(product, ["tags"])),
    taxesJson: serializeStructuredValue(pickValue(product, ["tributos"])),
    parentCode: toNullableString(pickValue(product, ["codigoPai"])),
    integrationCode: toNullableString(pickValue(product, ["codigoIntegracao"])),
    productGroup: toNullableString(pickValue(product, ["grupoProdutos", "grupoProduto"])),
    brand: toNullableString(pickValue(product, ["marca"])),
    cest: toNullableString(pickValue(product, ["cest"])),
    volumes: toNullableNumber(pickValue(product, ["volumes"])),
    shortDescription: toNullableString(pickValue(product, ["descricaoCurta"])),
    crossDockingDays: toNullableInteger(pickValue(product, ["crossDocking"])),
    externalImageUrls: serializeStructuredValue(pickValue(product, ["urlImagensExternas", "imagensURL", "imagemURL"])),
    externalLink: toNullableString(pickValue(product, ["linkExterno"])),
    supplierWarrantyMonths: toNullableInteger(pickValue(product, ["mesesGarantiaFornecedor"])),
    cloneParentData: toNullableBooleanInt(pickValue(product, ["clonarDadosPai"])),
    productCondition: toNullableString(pickValue(product, ["condicaoProduto"])),
    freeShipping: toNullableBooleanInt(pickValue(product, ["freteGratis"])),
    fciNumber: toNullableString(pickValue(product, ["numeroFci", "numeroFCI"])),
    department: toNullableString(pickValue(product, ["departamento"])),
    measurementUnit: toNullableString(pickValue(product, ["unidadeMedida", "unidade"])),
    icmsStRetentionBaseCents: toMoneyCents(pickValue(product, ["valorBaseIcmsStRetencao"])),
    icmsStRetentionValueCents: toMoneyCents(pickValue(product, ["valorIcmsStRetencao"])),
    icmsSubstituteOwnValueCents: toMoneyCents(pickValue(product, ["valorIcmsProprioSubstituto"])),
    productCategoryName: categoryName,
    additionalInfo: toNullableString(pickValue(product, ["informacoesAdicionais"])),
    // No Bling, "A" representa produto ativo.
    active: activeFlag,
    // Datas e metadados de sincronização.
    remoteCreatedAt: toNullableString(pickValue(product, ["dataCriacao"])),
    remoteUpdatedAt: toNullableString(pickValue(product, ["dataAlteracao"])),
    lastSyncedAt: now,
    syncStatus: "synced",
    // Guarda o payload original para auditoria/debug e futuras evoluções do mapeamento.
    raw: product,
    updatedAt: now
  };
}
function normalizeBlingProduct(item) {
  if (!item || typeof item !== "object") return null;
  const candidate = "produto" in item && item.produto && typeof item.produto === "object" ? item.produto : item;
  if (!candidate || typeof candidate !== "object") return null;
  const product = candidate;
  if (!product.id || typeof product.nome !== "string" || !product.nome.trim()) {
    return null;
  }
  return product;
}
class SyncProductsFromBlingService {
  /**
   * Executa a sincronização de produtos do Bling para o banco local.
   *
   * Fluxo geral:
   * 1. Lê o estado da última sincronização.
   * 2. Decide se a execução será inicial ou incremental.
   * 3. Busca produtos paginados na API do Bling.
   * 4. Normaliza, mapeia e faz upsert dos produtos.
   * 5. Atualiza estado e log de sincronização.
   */
  async execute() {
    const state = syncStateRepository.get(INTEGRATION_ID, RESOURCE);
    const localCount = productRepository.countByIntegrationSource(INTEGRATION_ID);
    const isInitial = !state || !state.lastSuccessAt || localCount === 0;
    const mode = isInitial ? "initial" : "incremental";
    const dataAlteracaoInicial = isInitial ? void 0 : getIncrementalCursor(state);
    syncStateRepository.markRunning(INTEGRATION_ID, RESOURCE);
    const startedAt = nowIso();
    const logId = syncLogRepository.start({
      integrationId: INTEGRATION_ID,
      resource: RESOURCE,
      mode,
      startedAt
    });
    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;
    let checkpointCursor = (state == null ? void 0 : state.checkpointCursor) ?? null;
    try {
      const categoryIdMap = categoryRepository.getAllExternalIdMap(INTEGRATION_ID);
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const response = await blingApiService.getProducts({
          page,
          limit: PAGE_LIMIT,
          criterio: PRODUCT_LIST_CRITERION,
          dataAlteracaoInicial
        });
        const rawItems = Array.isArray(response.data) ? response.data : [];
        const normalizedProducts = rawItems.map(normalizeBlingProduct);
        const validRaw = normalizedProducts.filter((item) => item != null);
        totalFailed += normalizedProducts.length - validRaw.length;
        if (validRaw.length === 0) {
          if (rawItems.length > 0) {
            console.warn("[SyncProductsFromBlingService] Nenhum produto válido encontrado na página. Exemplo de payload:", rawItems[0]);
          }
          hasMore = false;
          break;
        }
        const now = nowIso();
        const mapped = validRaw.map((product) => mapBlingProduct(product, now, categoryIdMap));
        for (const product of mapped) {
          if (product.remoteUpdatedAt && (!checkpointCursor || product.remoteUpdatedAt > checkpointCursor)) {
            checkpointCursor = product.remoteUpdatedAt;
          }
        }
        const externalIds = mapped.map((p) => p.externalId);
        const existingIds = new Set(
          productRepository.getExternalIdsBySource(INTEGRATION_ID, externalIds)
        );
        for (const p of mapped) {
          if (existingIds.has(p.externalId)) {
            totalUpdated++;
          } else {
            totalCreated++;
          }
        }
        if (mapped.length > 0) {
          productRepository.upsertMany(mapped);
        }
        totalProcessed += rawItems.length;
        if (rawItems.length < PAGE_LIMIT) {
          hasMore = false;
        } else {
          page++;
          await sleep(350);
        }
      }
      const finishedAt = nowIso();
      syncStateRepository.markSuccess(
        INTEGRATION_ID,
        RESOURCE,
        checkpointCursor ?? toBlingDateTime(finishedAt)
      );
      syncLogRepository.finish({
        id: logId,
        status: "success",
        finishedAt,
        itemsProcessed: totalProcessed,
        itemsCreated: totalCreated,
        itemsUpdated: totalUpdated,
        itemsFailed: totalFailed
      });
      return { mode, processed: totalProcessed, created: totalCreated, updated: totalUpdated, failed: totalFailed };
    } catch (error) {
      const finishedAt = nowIso();
      const errorMessage = error instanceof Error ? error.message : String(error);
      syncStateRepository.markError(INTEGRATION_ID, RESOURCE, errorMessage);
      syncLogRepository.finish({
        id: logId,
        status: "failed",
        finishedAt,
        itemsProcessed: totalProcessed,
        itemsCreated: totalCreated,
        itemsUpdated: totalUpdated,
        itemsFailed: totalFailed,
        errorMessage
      });
      throw error;
    }
  }
}
const syncProductsFromBlingService = new SyncProductsFromBlingService();
class SyncAllFromBlingService {
  async execute() {
    const categories = await syncCategoriesFromBlingService.execute();
    const products = await syncProductsFromBlingService.execute();
    return { categories, products };
  }
}
const syncAllFromBlingService = new SyncAllFromBlingService();
function registerIntegrationHandlers() {
  ipcMain.handle("integrations:status", async (_event, integrationId) => {
    assertCurrentUserPermission("integrations:manage");
    if (integrationId !== "bling") {
      return { connected: false };
    }
    return await blingOAuthService.getStatus();
  });
  ipcMain.handle("integrations:connect", async (_event, integrationId) => {
    assertCurrentUserPermission("integrations:manage");
    if (integrationId !== "bling") {
      return { success: false, message: `Integração ${integrationId} ainda não implementada.` };
    }
    try {
      return await blingOAuthService.connect();
    } catch (error) {
      console.error("[integrations:connect]", error);
      return { success: false, message: error instanceof Error ? error.message : "Erro ao conectar com o Bling." };
    }
  });
  ipcMain.handle("integrations:disconnect", async (_event, integrationId) => {
    assertCurrentUserPermission("integrations:manage");
    if (integrationId !== "bling") {
      return { success: false, message: `Integração ${integrationId} ainda não implementada.` };
    }
    try {
      return await blingOAuthService.disconnect();
    } catch (error) {
      console.error("[integrations:disconnect]", error);
      return { success: false, message: error instanceof Error ? error.message : "Erro ao desconectar Bling." };
    }
  });
  ipcMain.handle("integrations:bling:sync-all", async () => {
    assertCurrentUserPermission("integrations:manage");
    try {
      const result = await syncAllFromBlingService.execute();
      return { success: true, ...result };
    } catch (error) {
      console.error("[integrations:bling:sync-all]", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao sincronizar."
      };
    }
  });
  ipcMain.handle("integrations:bling:sync", async () => {
    assertCurrentUserPermission("integrations:manage");
    try {
      const result = await syncProductsFromBlingService.execute();
      return { success: true, ...result };
    } catch (error) {
      console.error("[integrations:bling:sync]", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao sincronizar produtos."
      };
    }
  });
  ipcMain.handle("integrations:bling:sync-categories", async () => {
    assertCurrentUserPermission("integrations:manage");
    try {
      const result = await syncCategoriesFromBlingService.execute();
      return { success: true, ...result };
    } catch (error) {
      console.error("[integrations:bling:sync-categories]", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao sincronizar categorias."
      };
    }
  });
  ipcMain.handle("integrations:bling:sync-status", () => {
    assertCurrentUserPermission("integrations:manage");
    return syncStateRepository.get("bling", "products");
  });
  ipcMain.handle("integrations:bling:sync-status-categories", () => {
    assertCurrentUserPermission("integrations:manage");
    return syncStateRepository.get("bling", "categories");
  });
  ipcMain.handle("integrations:bling:sync-logs", () => {
    assertCurrentUserPermission("integrations:manage");
    return syncLogRepository.listByIntegration("bling", "products", 10);
  });
  ipcMain.handle("integrations:bling:sync-logs-categories", () => {
    assertCurrentUserPermission("integrations:manage");
    return syncLogRepository.listByIntegration("bling", "categories", 10);
  });
  ipcMain.handle("integrations:bling:test", async () => {
    assertCurrentUserPermission("integrations:manage");
    return await blingApiService.getProducts({ page: 1, limit: 5 });
  });
  ipcMain.handle("integrations:bling:test-categories", async () => {
    assertCurrentUserPermission("integrations:manage");
    return await blingApiService.getCategories({ page: 1, limit: 5 });
  });
  ipcMain.handle("integrations:bling:test-icmp", async () => {
    assertCurrentUserPermission("integrations:manage");
    return await blingApiService.ping();
  });
}
const __dirname$1 = import.meta.dirname;
process.env.APP_ROOT = path__default.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path__default.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path__default.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path__default.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win = null;
function createWindow() {
  win = new BrowserWindow({
    icon: path__default.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path__default.join(__dirname$1, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    logger.error(`Renderer falhou ao carregar: [${errorCode}] ${errorDescription}`);
  });
  win.webContents.on("render-process-gone", (_event, details) => {
    logger.error(`Renderer process encerrado: ${details.reason}`);
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path__default.join(RENDERER_DIST, "index.html"));
  }
  win.maximize();
  win.on(
    "close",
    () => {
    }
  );
}
app.on("before-quit", () => {
  const sessionId = getCurrentSession();
  if (sessionId) {
    encerrarSessao(sessionId);
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on("app:fechar-janela", () => {
  const win2 = BrowserWindow.getFocusedWindow();
  if (win2) {
    win2.close();
  }
});
ipcMain.handle("app:quit-with-confirm", async () => {
  logger.info("Encerramento solicitado pelo usuário");
  const { response } = await dialog.showMessageBox({
    type: "question",
    buttons: ["Cancelar", "Sair"],
    defaultId: 1,
    cancelId: 0,
    message: "Tem certeza que deseja sair do sistema?"
  });
  if (response === 1) {
    app.quit();
    return true;
  }
  return false;
});
app.whenReady().then(() => {
  enableForeignKeys();
  startFiscalQueueWorker();
  registerWindowHandlers();
  registerFiscalHandlers();
  registerSalesHandlers();
  registerProductHandlers();
  registerPrinterhandlers();
  registerAuthHandlers();
  registerUserHandlers();
  registerPosHandlers();
  registerIntegrationHandlers();
  createWindow();
  logger.info("Criado janela principal do App");
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
