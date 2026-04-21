var Zt = Object.defineProperty;
var ea = (t, e, a) => e in t ? Zt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : t[e] = a;
var M = (t, e, a) => ea(t, typeof e != "symbol" ? e + "" : e, a);
import { app as X, ipcMain as u, BrowserWindow as O, shell as vt, dialog as Ot } from "electron";
import * as Fe from "fs";
import Le from "fs";
import Se from "path";
import ta from "os";
import yt from "crypto";
import * as ue from "node:fs";
import * as ge from "node:path";
import g from "node:path";
import aa from "better-sqlite3";
import { fileURLToPath as sa } from "url";
import { execFileSync as na } from "node:child_process";
import Ut, { X509Certificate as rt } from "node:crypto";
import ra from "node:http";
import { URL as Ke } from "node:url";
var z = { exports: {} };
const qe = Le, Oe = Se, oa = ta, ia = yt, ot = [
  "◈ encrypted .env [www.dotenvx.com]",
  "◈ secrets for agents [www.dotenvx.com]",
  "⌁ auth for agents [www.vestauth.com]",
  "⌘ custom filepath { path: '/custom/path/.env' }",
  "⌘ enable debugging { debug: true }",
  "⌘ override existing { override: true }",
  "⌘ suppress logs { quiet: true }",
  "⌘ multiple files { path: ['.env.local', '.env'] }"
];
function ca() {
  return ot[Math.floor(Math.random() * ot.length)];
}
function le(t) {
  return typeof t == "string" ? !["false", "0", "no", "off", ""].includes(t.toLowerCase()) : !!t;
}
function da() {
  return process.stdout.isTTY;
}
function la(t) {
  return da() ? `\x1B[2m${t}\x1B[0m` : t;
}
const ua = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function Ea(t) {
  const e = {};
  let a = t.toString();
  a = a.replace(/\r\n?/mg, `
`);
  let s;
  for (; (s = ua.exec(a)) != null; ) {
    const n = s[1];
    let r = s[2] || "";
    r = r.trim();
    const i = r[0];
    r = r.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), i === '"' && (r = r.replace(/\\n/g, `
`), r = r.replace(/\\r/g, "\r")), e[n] = r;
  }
  return e;
}
function Ta(t) {
  t = t || {};
  const e = Ft(t);
  t.path = e;
  const a = C.configDotenv(t);
  if (!a.parsed) {
    const i = new Error(`MISSING_DATA: Cannot parse ${e} for an unknown reason`);
    throw i.code = "MISSING_DATA", i;
  }
  const s = bt(t).split(","), n = s.length;
  let r;
  for (let i = 0; i < n; i++)
    try {
      const c = s[i].trim(), d = _a(a, c);
      r = C.decrypt(d.ciphertext, d.key);
      break;
    } catch (c) {
      if (i + 1 >= n)
        throw c;
    }
  return C.parse(r);
}
function ma(t) {
  console.error(`⚠ ${t}`);
}
function Ie(t) {
  console.log(`┆ ${t}`);
}
function Dt(t) {
  console.log(`◇ ${t}`);
}
function bt(t) {
  return t && t.DOTENV_KEY && t.DOTENV_KEY.length > 0 ? t.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function _a(t, e) {
  let a;
  try {
    a = new URL(e);
  } catch (c) {
    if (c.code === "ERR_INVALID_URL") {
      const d = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw d.code = "INVALID_DOTENV_KEY", d;
    }
    throw c;
  }
  const s = a.password;
  if (!s) {
    const c = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw c.code = "INVALID_DOTENV_KEY", c;
  }
  const n = a.searchParams.get("environment");
  if (!n) {
    const c = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw c.code = "INVALID_DOTENV_KEY", c;
  }
  const r = `DOTENV_VAULT_${n.toUpperCase()}`, i = t.parsed[r];
  if (!i) {
    const c = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${r} in your .env.vault file.`);
    throw c.code = "NOT_FOUND_DOTENV_ENVIRONMENT", c;
  }
  return { ciphertext: i, key: s };
}
function Ft(t) {
  let e = null;
  if (t && t.path && t.path.length > 0)
    if (Array.isArray(t.path))
      for (const a of t.path)
        qe.existsSync(a) && (e = a.endsWith(".vault") ? a : `${a}.vault`);
    else
      e = t.path.endsWith(".vault") ? t.path : `${t.path}.vault`;
  else
    e = Oe.resolve(process.cwd(), ".env.vault");
  return qe.existsSync(e) ? e : null;
}
function it(t) {
  return t[0] === "~" ? Oe.join(oa.homedir(), t.slice(1)) : t;
}
function pa(t) {
  const e = le(process.env.DOTENV_CONFIG_DEBUG || t && t.debug), a = le(process.env.DOTENV_CONFIG_QUIET || t && t.quiet);
  (e || !a) && Dt("loading env from encrypted .env.vault");
  const s = C._parseVault(t);
  let n = process.env;
  return t && t.processEnv != null && (n = t.processEnv), C.populate(n, s, t), { parsed: s };
}
function Na(t) {
  const e = Oe.resolve(process.cwd(), ".env");
  let a = "utf8", s = process.env;
  t && t.processEnv != null && (s = t.processEnv);
  let n = le(s.DOTENV_CONFIG_DEBUG || t && t.debug), r = le(s.DOTENV_CONFIG_QUIET || t && t.quiet);
  t && t.encoding ? a = t.encoding : n && Ie("no encoding is specified (UTF-8 is used by default)");
  let i = [e];
  if (t && t.path)
    if (!Array.isArray(t.path))
      i = [it(t.path)];
    else {
      i = [];
      for (const E of t.path)
        i.push(it(E));
    }
  let c;
  const d = {};
  for (const E of i)
    try {
      const _ = C.parse(qe.readFileSync(E, { encoding: a }));
      C.populate(d, _, t);
    } catch (_) {
      n && Ie(`failed to load ${E} ${_.message}`), c = _;
    }
  const l = C.populate(s, d, t);
  if (n = le(s.DOTENV_CONFIG_DEBUG || n), r = le(s.DOTENV_CONFIG_QUIET || r), n || !r) {
    const E = Object.keys(l).length, _ = [];
    for (const T of i)
      try {
        const N = Oe.relative(process.cwd(), T);
        _.push(N);
      } catch (N) {
        n && Ie(`failed to load ${T} ${N.message}`), c = N;
      }
    Dt(`injecting env (${E}) from ${_.join(",")} ${la(`// tip: ${ca()}`)}`);
  }
  return c ? { parsed: d, error: c } : { parsed: d };
}
function fa(t) {
  if (bt(t).length === 0)
    return C.configDotenv(t);
  const e = Ft(t);
  return e ? C._configVault(t) : (ma(`you set DOTENV_KEY but you are missing a .env.vault file at ${e}`), C.configDotenv(t));
}
function ga(t, e) {
  const a = Buffer.from(e.slice(-64), "hex");
  let s = Buffer.from(t, "base64");
  const n = s.subarray(0, 12), r = s.subarray(-16);
  s = s.subarray(12, -16);
  try {
    const i = ia.createDecipheriv("aes-256-gcm", a, n);
    return i.setAuthTag(r), `${i.update(s)}${i.final()}`;
  } catch (i) {
    const c = i instanceof RangeError, d = i.message === "Invalid key length", l = i.message === "Unsupported state or unable to authenticate data";
    if (c || d) {
      const E = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw E.code = "INVALID_DOTENV_KEY", E;
    } else if (l) {
      const E = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw E.code = "DECRYPTION_FAILED", E;
    } else
      throw i;
  }
}
function Ia(t, e, a = {}) {
  const s = !!(a && a.debug), n = !!(a && a.override), r = {};
  if (typeof e != "object") {
    const i = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw i.code = "OBJECT_REQUIRED", i;
  }
  for (const i of Object.keys(e))
    Object.prototype.hasOwnProperty.call(t, i) ? (n === !0 && (t[i] = e[i], r[i] = e[i]), s && Ie(n === !0 ? `"${i}" is already defined and WAS overwritten` : `"${i}" is already defined and was NOT overwritten`)) : (t[i] = e[i], r[i] = e[i]);
  return r;
}
const C = {
  configDotenv: Na,
  _configVault: pa,
  _parseVault: Ta,
  config: fa,
  decrypt: ga,
  parse: Ea,
  populate: Ia
};
z.exports.configDotenv = C.configDotenv;
z.exports._configVault = C._configVault;
z.exports._parseVault = C._parseVault;
z.exports.config = C.config;
z.exports.decrypt = C.decrypt;
z.exports.parse = C.parse;
z.exports.populate = C.populate;
z.exports = C;
var Aa = z.exports;
const te = {};
process.env.DOTENV_CONFIG_ENCODING != null && (te.encoding = process.env.DOTENV_CONFIG_ENCODING);
process.env.DOTENV_CONFIG_PATH != null && (te.path = process.env.DOTENV_CONFIG_PATH);
process.env.DOTENV_CONFIG_QUIET != null && (te.quiet = process.env.DOTENV_CONFIG_QUIET);
process.env.DOTENV_CONFIG_DEBUG != null && (te.debug = process.env.DOTENV_CONFIG_DEBUG);
process.env.DOTENV_CONFIG_OVERRIDE != null && (te.override = process.env.DOTENV_CONFIG_OVERRIDE);
process.env.DOTENV_CONFIG_DOTENV_KEY != null && (te.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY);
var La = te;
const Ra = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
var ha = function(e) {
  const a = e.reduce(function(s, n) {
    const r = n.match(Ra);
    return r && (s[r[1]] = r[2]), s;
  }, {});
  return "quiet" in a || (a.quiet = "true"), a;
};
(function() {
  Aa.config(
    Object.assign(
      {},
      La,
      ha(process.argv)
    )
  );
})();
const Qe = Se.join(X.getPath("userData"), "logs");
Le.existsSync(Qe) || Le.mkdirSync(Qe, { recursive: !0 });
function Me(t, e) {
  const s = (/* @__PURE__ */ new Date()).toLocaleString("sv-SE", {
    timeZone: "America/Sao_Paulo"
  }).replace(" ", "T"), n = `${s} [${t}] ${e}
`, r = `${s.slice(0, 10)}.log`, i = Se.join(Qe, r);
  Le.appendFileSync(i, n, { encoding: "utf-8" });
}
const f = {
  info: (t) => Me("INFO", t),
  warn: (t) => Me("WARN", t),
  error: (t) => Me("ERROR", t)
};
function De(t) {
  return yt.createHash("sha256").update(t).digest("hex");
}
function Sa(t, e) {
  return De(t) === e;
}
function Ca(t, e) {
  const a = o.prepare(`
    SELECT id, nome, funcao, email, username, password, ativo
    FROM usuarios
    WHERE username = ?
    LIMIT 1
  `).get(t);
  if (!a)
    throw new Error("Usuário inválido");
  if (!Sa(e, a.password))
    throw new Error("Senha inválida");
  if (!a.ativo)
    throw new Error("Usuário desabilitado");
  const s = o.transaction(() => {
    o.prepare(`
      UPDATE sessions
      SET active = 0,
          logout_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND active = 1
    `).run(a.id);
    const n = o.prepare(`
      INSERT INTO sessions (user_id)
      VALUES (?)
    `).run(a.id);
    return Number(n.lastInsertRowid);
  })();
  return {
    id: a.id,
    nome: a.nome,
    role: a.funcao,
    email: a.email,
    login: a.username,
    sessionId: s
  };
}
const va = sa(import.meta.url), Oa = Se.dirname(va);
function ya(t) {
  if (t.prepare("SELECT COUNT(*) as total FROM cnaes").get().total > 0) {
    console.log("CNAEs já cadastrados. Seed ignorado.");
    return;
  }
  console.log("Iniciando seed de CNAEs...");
  const a = Se.join(Oa, "../electron/infra/database/seeds/files/cnaes-1.csv"), n = Le.readFileSync(a, "utf-8").split(/\r?\n/).slice(1), r = t.prepare(`
    INSERT INTO cnaes 
    (codigo, secao, divisao, grupo, classe, denominacao, ativo)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `), i = t.transaction((d) => {
    for (const l of d)
      r.run(
        l[3],
        // codigo
        l[0],
        // secao
        l[1],
        // divisao
        l[2],
        // grupo
        l[3],
        // classe
        l[4]
        // denominacao
      );
  }), c = n.filter((d) => d.trim() !== "").map((d) => d.split("%"));
  i(c);
  for (const d of c)
    d[3] || console.log("LINHA COM PROBLEMA:", d);
  console.log("Seed de CNAEs concluído.");
}
const Mt = "2026-04-16-fiscal-persistence-v1";
function Ua(t) {
  t.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      executed_at TEXT NOT NULL
    );
  `);
}
function Da(t, e) {
  return !!t.prepare("SELECT 1 FROM schema_migrations WHERE id = ? LIMIT 1").get(e);
}
function xe(t, e, a) {
  return t.prepare(`PRAGMA table_info(${e})`).all().some((n) => n.name === a);
}
function ba(t) {
  t.transaction(() => {
    t.exec(`
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
    `), t.exec(`
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
    `), t.prepare("INSERT INTO schema_migrations (id, executed_at) VALUES (?, CURRENT_TIMESTAMP)").run(Mt);
  })();
}
function Fa(t) {
  const e = [];
  xe(t, "fiscal_documents", "issued_datetime") || e.push("ALTER TABLE fiscal_documents ADD COLUMN issued_datetime TEXT"), xe(t, "fiscal_documents", "xml_authorized") || e.push("ALTER TABLE fiscal_documents ADD COLUMN xml_authorized TEXT"), xe(t, "fiscal_documents", "xml_cancellation") || e.push("ALTER TABLE fiscal_documents ADD COLUMN xml_cancellation TEXT"), e.length > 0 && t.exec(e.join(`;
`));
}
function Ma(t) {
  Ua(t), Da(t, Mt) || ba(t), Fa(t);
}
const xt = g.join(X.getPath("userData"), "galberto.db");
console.log(" Criando/abrindo banco de dados em: ", xt);
const o = new aa(xt);
function xa() {
  o.exec("PRAGMA foreign_keys = ON;"), f.info("-> Foreign keys ativadas");
}
function Pa() {
  o.exec(`
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
  `), f.info("-> Tabela 'products' checada/criada");
}
function wa() {
  const t = o.prepare("PRAGMA table_info(products)").all(), e = new Set(t.map((a) => a.name));
  e.has("current_stock") || o.exec("ALTER TABLE products ADD COLUMN current_stock REAL NOT NULL DEFAULT 0;"), e.has("minimum_stock") || o.exec("ALTER TABLE products ADD COLUMN minimum_stock REAL NOT NULL DEFAULT 0;");
}
function Xa() {
  o.exec(`
    INSERT OR REPLACE INTO produtos (
      id, internal_code, gtin, nome, preco_custo, preco_venda,
      estoque_atual, estoque_minimo, unidade_medida, ativo, created_at, updated_at
    )
    SELECT
      p.id,
      p.sku,
      p.barcode,
      p.name,
      p.cost_price_cents / 100.0,
      p.sale_price_cents / 100.0,
      p.current_stock,
      p.minimum_stock,
      p.unit,
      p.active,
      COALESCE(prod.created_at, datetime('now')),
      datetime('now')
    FROM products p
    LEFT JOIN produtos prod ON prod.id = p.id;
  `);
}
function $a() {
  o.exec(`
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
  `), f.info("-> Tabela 'categories' checada/criada");
}
function Ba() {
  o.exec(`
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
  `), f.info("-> Tabela 'tax_profiles' checada/criada");
}
function ka() {
  o.exec(`
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
  `), f.info("-> Tabela 'fornecedores' checada/criada");
}
function Ga() {
  o.exec(`
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
  `), f.info("-> Created table customer");
}
function Ha() {
  o.exec(`
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
  `), f.info("-> Tabela 'company' checada/criada");
}
function ja() {
  o.exec(`
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
  `), f.info("-> Tabela 'vendas' checada/criada");
}
function Va() {
  o.exec(`
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
  `), f.info("-> Tabela 'venda_itens' checada/criada");
}
function za() {
  o.exec(`
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
  `), f.info("-> Tabela 'sale_item_tax_snapshot' checada/criada");
}
function Ya() {
  o.exec(`
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
  `), f.info("-> Tabela 'venda_pagamento' checada/criada");
}
function Wa() {
  o.exec(`
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
  `), f.info("-> Tabela legada 'documentos_fiscais' checada/criada");
}
function Ka() {
  o.exec(`
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
  `), f.info("-> Tabela 'printers' checada/criada");
}
function qa() {
  try {
    o.exec("ALTER TABLE printers ADD COLUMN paper_width_mm REAL NOT NULL DEFAULT 80");
  } catch {
  }
  try {
    o.exec("ALTER TABLE printers ADD COLUMN content_width_mm REAL NOT NULL DEFAULT 76");
  } catch {
  }
  try {
    o.exec("ALTER TABLE printers ADD COLUMN base_font_size_px REAL NOT NULL DEFAULT 13");
  } catch {
  }
  try {
    o.exec("ALTER TABLE printers ADD COLUMN line_height REAL NOT NULL DEFAULT 1.5");
  } catch {
  }
  try {
    o.exec("ALTER TABLE printers ADD COLUMN receipt_settings_json TEXT");
  } catch {
  }
}
function Qa() {
  o.exec(`
    CREATE TABLE IF NOT EXISTS printer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    );
  `), f.info("-> Tabela 'printer_logs' checada/criada");
}
function Ja() {
  o.exec(`
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
  `), f.info("-> Tabela 'usuarios' checada/criada");
}
function Za() {
  o.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      logout_at DATETIME,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `), f.info("-> Tabela 'sessions' checada/criada");
}
function es() {
  o.exec(`
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
  `), f.info("-> Tabela 'cnaes' checada/criada");
}
function ts() {
  const t = `CREATE TABLE IF NOT EXISTS stock_movements (
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
  f.info("-> Tabela 'stock_movements' checada/criada"), o.exec(t);
}
function as() {
  o.exec(`
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
  `), f.info("-> Tabela 'cash_register_sessions' checada/criada");
}
function ss() {
  try {
    o.exec("ALTER TABLE cash_register_sessions ADD COLUMN expected_cash_amount REAL");
  } catch {
  }
  try {
    o.exec("ALTER TABLE cash_register_sessions ADD COLUMN closing_difference REAL");
  } catch {
  }
  try {
    o.exec("ALTER TABLE cash_register_sessions ADD COLUMN opening_notes TEXT");
  } catch {
  }
  try {
    o.exec("ALTER TABLE cash_register_sessions ADD COLUMN closing_notes TEXT");
  } catch {
  }
}
function ns() {
  o.exec(`
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
  `), f.info("-> Tabela 'cash_register_movements' checada/criada");
}
function rs() {
  try {
    o.exec("ALTER TABLE venda_pagamento ADD COLUMN cash_session_id INTEGER REFERENCES cash_register_sessions(id)");
  } catch {
  }
  try {
    o.exec("ALTER TABLE venda_pagamento ADD COLUMN valor_recebido REAL NOT NULL DEFAULT 0");
  } catch {
  }
  try {
    o.exec("ALTER TABLE venda_pagamento ADD COLUMN troco REAL NOT NULL DEFAULT 0");
  } catch {
  }
}
function os() {
  try {
    const t = `
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
    console.log("Criando tabela integrations..."), o.exec(t), console.log("Tabela criada com sucesso!");
    const e = o.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
function is() {
  o.exec(`
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
  `), f.info("-> Tabela 'printed_documents' checada/criada");
}
function cs() {
  o.exec(`
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
  `), f.info("-> Tabela 'print_jobs' checada/criada");
}
function ds() {
  try {
    const t = `
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
    console.log("Criando tabela sync_state..."), o.exec(t), console.log("Tabela criada com sucesso!");
    const e = o.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
function ls() {
  try {
    const t = `
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
    console.log("Criando tabela sync_logs..."), o.exec(t), console.log("Tabela criada com sucesso!");
    const e = o.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
Pa();
wa();
Xa();
$a();
Ga();
Ja();
ka();
ja();
Va();
Ha();
Ka();
qa();
Qa();
Za();
es();
ya(o);
Ba();
za();
ts();
Ya();
rs();
Wa();
as();
ss();
ns();
os();
ds();
ls();
is();
cs();
Ma(o);
function Pt() {
  const t = o.prepare(`
    SELECT ambiente_emissao, serie_nfce
    FROM company
    WHERE ativo = 1
    LIMIT 1
  `).get(), e = (t == null ? void 0 : t.ambiente_emissao) ?? 2, a = (t == null ? void 0 : t.serie_nfce) ?? 1, s = o.prepare(`
    SELECT COALESCE(MAX(numero), 0) + 1 AS nextNumber
    FROM vendas
    WHERE modelo_documento = 65 AND serie = ? AND ambiente = ?
  `).get(a, e);
  return {
    ambiente: e,
    serie: a,
    numero: s.nextNumber,
    naturezaOperacao: "VENDA PDV",
    modeloDocumento: 65
  };
}
function us(t) {
  const e = o.prepare(`
    SELECT id, barcode, name, unit, sale_price_cents
    FROM products
    WHERE id = ? AND deleted_at IS NULL
    LIMIT 1
  `).get(t);
  if (!e)
    throw new Error(`Produto não encontrado para venda: ${t}`);
  return {
    codigoProduto: e.barcode || e.id,
    nomeProduto: e.name,
    gtin: e.barcode,
    unidade: e.unit || "UN",
    precoUnitario: Number(e.sale_price_cents ?? 0) / 100,
    ncm: "",
    cfop: "5102",
    cest: null
  };
}
function wt(t, e) {
  o.prepare("DELETE FROM venda_itens WHERE venda_id = ?").run(t);
  const a = o.prepare(`
    INSERT INTO venda_itens(
      venda_id, produto_id, codigo_produto, nome_produto, gtin, gtin_tributavel,
      ncm, cfop, cest, unidade_comercial, quantidade_comercial, valor_unitario_comercial,
      unidade_tributavel, quantidade_tributavel, valor_unitario_tributavel,
      valor_bruto, valor_desconto, subtotal
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of e) {
    const n = us(s.produto_id), r = Number(s.quantidade ?? s.estoque_atual ?? 0), i = Number(s.preco_venda ?? n.precoUnitario), c = Number(s.valor_bruto ?? r * i), d = Math.max(0, Math.min(Number(s.valor_desconto ?? 0), c)), l = Number(s.subtotal ?? Math.max(c - d, 0));
    a.run(
      t,
      s.produto_id,
      n.codigoProduto,
      s.nome ?? n.nomeProduto,
      n.gtin,
      n.gtin,
      n.ncm,
      n.cfop,
      n.cest,
      n.unidade,
      r,
      i,
      n.unidade,
      r,
      i,
      c,
      d,
      l
    );
  }
}
function ct(t, e, a) {
  const s = Pt(), n = Number(t.valor_produtos ?? t.total ?? 0), r = Number(t.valor_desconto ?? 0), i = Number(t.total ?? 0);
  return o.transaction(() => {
    let d = a ?? null;
    return d ? o.prepare(`
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
      e,
      t.cpf_cliente ?? null,
      t.consumidor_identificado ? t.cpf_cliente ?? null : "Consumidor final",
      n,
      r,
      i,
      d
    ) : d = o.prepare(`
        INSERT INTO vendas(
          data_emissao, data_movimento, status, natureza_operacao, modelo_documento,
          serie, numero, ambiente, cliente_nome, cpf_cliente, valor_produtos, valor_desconto, valor_total
        )
        VALUES(datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
      e,
      s.naturezaOperacao,
      s.modeloDocumento,
      s.serie,
      s.numero,
      s.ambiente,
      t.consumidor_identificado ? t.cpf_cliente ?? null : "Consumidor final",
      t.cpf_cliente ?? null,
      n,
      r,
      i
    ).lastInsertRowid, wt(d, t.itens), d;
  })();
}
function Es(t) {
  return {
    DINHEIRO: "01",
    CHEQUE: "02",
    CREDITO: "03",
    DEBITO: "04",
    VOUCHER: "10",
    PIX: "17"
  }[t] ?? "99";
}
function Re(t) {
  const a = o.prepare(`
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
  `).get(t);
  return a ? {
    ...a,
    total_sangrias: Number(a.total_sangrias ?? 0),
    total_vendas_dinheiro: Number(a.total_vendas_dinheiro ?? 0),
    expected_cash_amount: Number(a.opening_cash_amount ?? 0) + Number(a.total_vendas_dinheiro ?? 0) - Number(a.total_sangrias ?? 0)
  } : null;
}
function Ts(t, e) {
  if (!(e != null && e.meioPagamento))
    return;
  const a = o.prepare(`
    SELECT valor_total
    FROM vendas
    WHERE id = ?
    LIMIT 1
  `).get(t);
  if (!a)
    throw new Error(`Venda não encontrada para registrar pagamento: ${t}`);
  o.prepare("DELETE FROM venda_pagamento WHERE venda_id = ?").run(t);
  const s = Number(a.valor_total ?? 0), n = Number(e.troco ?? 0), r = e.meioPagamento === "DINHEIRO" ? Number(e.valorPago ?? s) : s;
  o.prepare(`
    INSERT INTO venda_pagamento(
      venda_id, cash_session_id, tpag, valor, valor_recebido, troco, descricao_outro
    )
    VALUES(?, ?, ?, ?, ?, ?, ?)
  `).run(
    t,
    e.cashSessionId ?? null,
    Es(e.meioPagamento),
    s,
    r,
    n,
    null
  );
}
function ms(t) {
  o.prepare("BEGIN").run();
  try {
    const e = Pt(), a = Number(t.valor_produtos ?? t.total ?? 0), s = Number(t.valor_desconto ?? 0), n = Number(t.total ?? 0), i = o.prepare(`
        INSERT INTO vendas(
          data_emissao, data_movimento, status, natureza_operacao, modelo_documento,
          serie, numero, ambiente, valor_produtos, valor_desconto, valor_total
        )
        VALUES(datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
      "CANCELADA",
      e.naturezaOperacao,
      e.modeloDocumento,
      e.serie,
      e.numero,
      e.ambiente,
      a,
      s,
      n
    ).lastInsertRowid;
    return wt(i, t.itens), o.prepare("COMMIT").run(), { sucesso: !0, vendaId: i };
  } catch (e) {
    throw o.prepare("ROLLBACK").run(), e;
  }
}
function _s(t) {
  const e = typeof t == "number" ? t : t.vendaId, a = o.prepare(
    `SELECT produto_id, quantidade_comercial AS quantidade
     FROM venda_itens
     WHERE venda_id = ? `
  ), s = o.prepare(
    `SELECT current_stock
     FROM products
     WHERE id = ? AND deleted_at IS NULL
     LIMIT 1`
  ), n = o.prepare(
    `UPDATE products
     SET current_stock = current_stock - ?,
         updated_at = datetime('now')
     WHERE id = ?`
  ), r = o.prepare(
    `UPDATE produtos
     SET estoque_atual = estoque_atual - ?,
         updated_at = datetime('now')
     WHERE id = ?`
  ), i = o.prepare(
    `SELECT valor_produtos, valor_desconto, valor_total
     FROM vendas
     WHERE id = ?
     LIMIT 1`
  ), c = o.prepare(
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
  o.transaction(() => {
    const l = a.all(e), E = i.get(e);
    if (!E)
      throw new Error(`Venda não encontrada: ${e}`);
    for (const A of l) {
      const D = s.get(A.produto_id);
      if (!D)
        throw new Error(`Produto da venda não encontrado: ${A.produto_id}`);
      if (Number(D.current_stock ?? 0) < Number(A.quantidade ?? 0))
        throw new Error(`Estoque insuficiente para o produto ${A.produto_id}`);
      n.run(A.quantidade, A.produto_id), r.run(A.quantidade, A.produto_id);
    }
    const _ = Number(typeof t == "number" ? E.valor_produtos ?? 0 : t.valorProdutos ?? E.valor_produtos ?? 0), T = Number(typeof t == "number" ? E.valor_desconto ?? 0 : t.valorDesconto ?? E.valor_desconto ?? 0), N = Number(typeof t == "number" ? E.valor_total ?? 0 : t.valorTotal ?? E.valor_total ?? 0), v = typeof t == "number" ? 0 : Number(t.troco ?? 0);
    c.run(
      _,
      T,
      N,
      v,
      e
    ), Ts(
      e,
      typeof t == "number" ? void 0 : t
    );
  })();
}
function ps(t) {
  var n;
  const a = o.prepare(`
    INSERT INTO cash_register_sessions
      (operator_id, pdv_id, status, opening_cash_amount, opening_notes, opened_at)
    VALUES(?, ?, 'OPEN', ?, ?, datetime('now'))
      `).run(
    t.operator_id,
    t.pdv_id,
    t.opening_cash_amount,
    ((n = t.opening_notes) == null ? void 0 : n.trim()) || null
  ), s = Re(a.lastInsertRowid);
  if (!s)
    throw new Error("Sessão de caixa não encontrada após abertura.");
  return s;
}
function Ns(t) {
  var r;
  if (!o.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE id = ?
      AND operator_id = ?
      AND pdv_id = ?
      AND status = 'OPEN'
    LIMIT 1
  `).get(t.cash_session_id, t.operator_id, t.pdv_id))
    throw new Error("Nenhum caixa aberto foi encontrado para registrar a sangria.");
  const a = Re(t.cash_session_id);
  if (!a)
    throw new Error("Sessão de caixa inválida para sangria.");
  const s = Number(t.amount ?? 0);
  if (s <= 0)
    throw new Error("Informe um valor válido para a sangria.");
  if (s > Number(a.expected_cash_amount ?? 0))
    throw new Error("A sangria não pode ser maior que o valor disponível em caixa.");
  o.prepare(`
    INSERT INTO cash_register_movements(
      cash_session_id, operator_id, pdv_id, movement_type, amount, reason
    )
    VALUES(?, ?, ?, ?, ?, ?)
  `).run(
    t.cash_session_id,
    t.operator_id,
    t.pdv_id,
    t.movement_type,
    s,
    ((r = t.reason) == null ? void 0 : r.trim()) || null
  );
  const n = Re(t.cash_session_id);
  if (!n)
    throw new Error("Não foi possível recarregar a sessão após a sangria.");
  return n;
}
function fs(t) {
  var r;
  if (o.prepare(`
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
          `).run(
    t.closing_cash_amount,
    t.expected_cash_amount,
    t.difference,
    ((r = t.closing_notes) == null ? void 0 : r.trim()) || null,
    t.operator_id,
    t.pdv_id
  ).changes === 0)
    throw new Error("Nenhum caixa aberto foi encontrado para fechamento.");
  const s = o.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE operator_id = ?
      AND pdv_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(t.operator_id, t.pdv_id);
  if (!s)
    throw new Error("Sessão de caixa não encontrada após o fechamento.");
  const n = Re(s.id);
  if (!n)
    throw new Error("Resumo da sessão de caixa não encontrado após o fechamento.");
  return n;
}
function gs({ venda_id: t, data: e, status: a, page: s = 1, limit: n = 20 }) {
  const r = (s - 1) * n;
  let i = [], c = [];
  const d = { 1: "FINALIZADA", 2: "CANCELADA", 3: "ABERTA_PAGAMENTO", 4: "ORCAMENTO", 5: "PAUSADA" };
  t && (i.push("CAST(id AS TEXT) LIKE ?"), c.push(`%${t}%`)), e && (i.push("date(data_emissao) = date(?)"), c.push(e)), a !== void 0 && (i.push("status = ?"), c.push(d[a]));
  const l = i.length ? `WHERE ${i.join(" AND ")} ` : "", E = o.prepare(`
    SELECT * FROM vendas
      ${l}
      ORDER BY id DESC
    LIMIT ? OFFSET ?
      `).all(...c, n, r), _ = o.prepare(`
      SELECT COUNT(*) as total
      FROM vendas
      ${l}
    `).get(...c);
  return {
    data: E,
    page: s,
    limit: n,
    total: _.total
  };
}
function Is(t) {
  const e = o.prepare(`
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
      `).get(t);
  if (!e) return null;
  const a = o.prepare(`
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
      `).all(t);
  return {
    ...e,
    itens: a
  };
}
function As({ nome: t, codigo: e, ativo: a, page: s = 1, limit: n = 20 }) {
  const r = (s - 1) * n;
  let i = [], c = [];
  t && (i.push("name LIKE ?"), c.push(`%${t}%`)), e && (i.push("(barcode LIKE ? OR sku LIKE ?)"), c.push(`%${e}%`, `%${e}%`)), a !== void 0 && (i.push("active = ?"), c.push(a));
  const d = o.prepare(`
      SELECT
        id,
        barcode AS codigo_barras,
        name AS nome,
        ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
        current_stock AS estoque_atual,
        active AS ativo
      FROM products
      WHERE deleted_at IS NULL
      ${i.length ? `AND ${i.join(" AND ")}` : ""}
      ORDER BY name
    LIMIT ? OFFSET ?
      `).all(...c, n, r), l = o.prepare(`
      SELECT COUNT(*) as total
      FROM products
      WHERE deleted_at IS NULL
      ${i.length ? `AND ${i.join(" AND ")}` : ""}
    `).get(...c);
  return {
    data: d,
    page: s,
    limit: n,
    total: l.total
  };
}
function Ls(t) {
  return o.prepare(`
    SELECT
      id,
      external_id,
      barcode AS codigo_barras,
      sku,
      name AS nome,
      ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
      ROUND(cost_price_cents / 100.0, 2) AS preco_custo,
      current_stock AS estoque_atual,
      active AS ativo,
      unit AS unidade_medida,
      minimum_stock AS estoque_minimo,
      raw_json
    FROM products
    WHERE id = ? AND deleted_at IS NULL
    LIMIT 1;
  `).get(t);
}
function Rs(t) {
  return o.prepare(`
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
      `).all(`%${t}%`);
}
function hs(t) {
  return o.prepare(`
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
  `).get(t);
}
function Ss(t) {
  return o.prepare(`
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
      `).all(t, t, `%${t}%`).map((s) => ({
    id: s.id,
    internalCode: s.sku ?? "",
    name: s.name,
    brand: "",
    gtin: s.barcode ?? "",
    unitOfMeasure: s.unit ?? "UN",
    currentStock: Number(s.current_stock ?? 0),
    minimumStock: Number(s.minimum_stock ?? 0),
    avgCost: Number(s.cost_price_cents ?? 0) / 100,
    ncm: s.ncm ?? "",
    cfop: s.cfop ?? "",
    controlsExpiration: !1,
    controlsBatch: !1
  }));
}
console.log(o);
function Cs(t) {
  t.is_default === 1 && o.prepare("UPDATE printers SET is_default = 0 WHERE is_default = 1").run(), o.prepare(`
    INSERT INTO printers(
      name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
      paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json, notes, is_default
    )
    VALUES(
      @selectedPrinter, @display_name, @brand, @model, @connection_type, @driver_name, @driver_version,
      @photo_path, @paper_width_mm, @content_width_mm, @base_font_size_px, @line_height, @receipt_settings_json, @notes, @is_default
    )
      `).run(t);
}
function vs() {
  return o.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
           paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json, notes, is_default, installed_at
    FROM printers
    ORDER BY is_default DESC, id DESC
      `).all();
}
function Os() {
  return o.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, is_default,
           paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
    FROM printers
    WHERE is_default = 1
    LIMIT 1
  `).get();
}
function ys(t, e) {
  return o.prepare(`
    UPDATE printers
    SET
      paper_width_mm = ?,
      content_width_mm = ?,
      base_font_size_px = ?,
      line_height = ?
    WHERE id = ?
  `).run(
    e.paper_width_mm,
    e.content_width_mm,
    e.base_font_size_px,
    e.line_height,
    t
  );
}
function Us(t, e) {
  return o.prepare(`
    UPDATE printers
    SET receipt_settings_json = ?
    WHERE id = ?
  `).run(e, t);
}
function Ds(t) {
  return o.prepare("DELETE FROM printers WHERE id = ? ").run(t);
}
function bs(t) {
  o.transaction(() => {
    o.prepare("UPDATE printers SET is_default = 0 WHERE is_default = 1").run(), o.prepare("UPDATE printers SET is_default = 1 WHERE id = ? ").run(t);
  })();
}
function Fs() {
  o.prepare("SELECT COUNT(*) as total FROM usuarios").get().total === 0 && (o.prepare(`
      INSERT INTO usuarios(nome, funcao, email, username, password, ativo)
    VALUES(?, ?, ?, ?, ?, ?)
      `).run(
    "Administrador",
    "Gerente",
    "admin@galberto.local",
    "admin",
    De("admin123"),
    1
  ), f.info("-> Usuário admin padrão criado (admin / admin123)"), console.log("-> Usuário admin padrão criado (admin / admin123)"));
}
function Ms(t) {
  return o.prepare(`
    SELECT id, nome, funcao, email, username, ativo, foto_path
    FROM usuarios
    WHERE id = ?
      `).get(t);
}
function xs({ name: t, role: e, login: a, ativo: s, page: n = 1, limit: r = 20 }) {
  const i = (n - 1) * r;
  let c = [], d = [];
  t && (c.push("nome LIKE ?"), d.push(`% ${t}% `)), e && (c.push("funcao LIKE ?"), d.push(`% ${e}% `)), a && (c.push("username LIKE ?"), d.push(`% ${a}% `)), s !== void 0 && (c.push("ativo = ?"), d.push(s));
  const l = c.length ? `WHERE ${c.join(" AND ")} ` : "", E = o.prepare(`
      SELECT id, nome, funcao AS role, email, username AS login, ativo
      FROM usuarios
      ${l}
      ORDER BY nome
    LIMIT ? OFFSET ?
      `).all(...d, r, i), _ = o.prepare(`
      SELECT COUNT(*) as total
      FROM usuarios
      ${l}
    `).get(...d);
  return {
    data: E,
    page: n,
    limit: r,
    total: _.total
  };
}
function Ps(t) {
  return o.prepare(`
    INSERT INTO usuarios(nome, funcao, email, username, password, ativo, foto_path)
    VALUES(@nome, @funcao, @email, @username, @password, @ativo, @foto_path)
  `).run({
    ...t,
    foto_path: t.foto_path ?? null,
    password: De(t.password)
  });
}
function ws(t, e) {
  return o.prepare("UPDATE usuarios SET password = ? WHERE id = ? ").run(De(e), t);
}
function Xs(t) {
  return o.prepare("DELETE FROM usuarios WHERE id = ? ").run(t);
}
function $s(t) {
  console.log("Dados chegando no db.ts", t);
  const e = [], a = [];
  t.nome !== void 0 && (e.push("nome = ?"), a.push(t.nome)), t.email !== void 0 && (e.push("email = ?"), a.push(t.email)), t.login !== void 0 && (e.push("username = ?"), a.push(t.login)), t.role !== void 0 && (e.push("funcao = ?"), a.push(t.role)), a.push(t.id);
  const s = `
  UPDATE usuarios
  SET ${e.join(", ")}
  WHERE id = ?
      `;
  o.prepare(s).run(...a);
}
function Bs(t) {
  return o.prepare("UPDATE usuarios SET ativo = 0 WHERE id = ? ").run(t);
}
function ks(t) {
  return o.prepare("UPDATE usuarios SET ativo = 1 WHERE id = ? ").run(t);
}
Fs();
function Gs(t) {
  const a = o.prepare(`
    SELECT id
      FROM cash_register_sessions
    WHERE pdv_id = ?
      AND operator_id = ?
        AND status = 'OPEN'
    ORDER BY opened_at DESC
    LIMIT 1;
    `).get(t.pdv_id, t.operator_id);
  return a ? Re(a.id) : null;
}
function Je(t) {
  return JSON.stringify(t ?? null);
}
function Hs(t) {
  return t ? 1 : 0;
}
function js(t) {
  return {
    id: t.id,
    storeId: t.store_id,
    customerId: t.customer_id,
    customerName: t.customer_name,
    customerDocument: t.customer_document,
    status: t.status,
    subtotalAmount: t.subtotal_amount,
    discountAmount: t.discount_amount,
    surchargeAmount: t.surcharge_amount,
    totalAmount: t.total_amount,
    changeAmount: t.change_amount,
    externalReference: t.external_reference,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
function Vs(t) {
  return {
    id: t.id,
    saleId: t.sale_id,
    productId: t.product_id,
    sku: t.sku,
    description: t.description,
    unit: t.unit,
    quantity: t.quantity,
    unitPrice: t.unit_price,
    grossAmount: t.gross_amount,
    discountAmount: t.discount_amount,
    totalAmount: t.total_amount,
    ncm: t.ncm,
    cfop: t.cfop,
    cest: t.cest,
    originCode: t.origin_code,
    taxSnapshotJson: t.tax_snapshot_json,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
function zs(t) {
  return {
    id: t.id,
    saleId: t.sale_id,
    method: t.method,
    amount: t.amount,
    receivedAmount: t.received_amount,
    changeAmount: t.change_amount,
    integrationReference: t.integration_reference,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
class Ys {
  create(e) {
    return o.transaction(() => {
      const s = o.prepare(`
        INSERT INTO sales (
          store_id, customer_id, customer_name, customer_document, status,
          subtotal_amount, discount_amount, surcharge_amount, total_amount,
          change_amount, external_reference, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        e.storeId,
        e.customerId ?? null,
        e.customerName ?? null,
        e.customerDocument ?? null,
        e.status ?? "OPEN",
        e.subtotalAmount,
        e.discountAmount ?? 0,
        e.surchargeAmount ?? 0,
        e.totalAmount,
        e.changeAmount ?? 0,
        e.externalReference ?? null
      ), n = Number(s.lastInsertRowid), r = o.prepare(`
        INSERT INTO sale_items (
          sale_id, product_id, sku, description, unit, quantity, unit_price,
          gross_amount, discount_amount, total_amount, ncm, cfop, cest,
          origin_code, tax_snapshot_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      for (const c of e.items)
        r.run(
          n,
          c.productId ?? null,
          c.sku ?? null,
          c.description,
          c.unit,
          c.quantity,
          c.unitPrice,
          c.grossAmount,
          c.discountAmount ?? 0,
          c.totalAmount,
          c.ncm ?? null,
          c.cfop ?? null,
          c.cest ?? null,
          c.originCode ?? null,
          c.taxSnapshot ? Je(c.taxSnapshot) : null
        );
      const i = o.prepare(`
        INSERT INTO payments (
          sale_id, method, amount, received_amount, change_amount,
          integration_reference, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      for (const c of e.payments)
        i.run(
          n,
          c.method,
          c.amount,
          c.receivedAmount ?? c.amount,
          c.changeAmount ?? 0,
          c.integrationReference ?? null
        );
      return this.findAggregateById(n);
    })();
  }
  findById(e) {
    const a = o.prepare("SELECT * FROM sales WHERE id = ? LIMIT 1").get(e);
    return a ? js(a) : null;
  }
  findByExternalReference(e) {
    const a = o.prepare(`
      SELECT * FROM sales
      WHERE external_reference = ?
      LIMIT 1
    `).get(e);
    return a ? this.findAggregateById(a.id) : null;
  }
  findAggregateById(e) {
    const a = this.findById(e);
    if (!a) return null;
    const s = o.prepare("SELECT * FROM sale_items WHERE sale_id = ? ORDER BY id ASC").all(e), n = o.prepare("SELECT * FROM payments WHERE sale_id = ? ORDER BY id ASC").all(e), r = o.prepare("SELECT id FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return {
      sale: a,
      items: s.map(Vs),
      payments: n.map(zs),
      fiscalDocument: r ? { id: r.id } : null
    };
  }
  listRecent(e = 20) {
    return o.prepare(`
      SELECT * FROM sales
      ORDER BY created_at DESC
      LIMIT ?
    `).all(e).map((s) => this.findAggregateById(s.id)).filter((s) => !!s);
  }
  updateStatus(e, a) {
    o.prepare(`
      UPDATE sales
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(a, e);
  }
}
const Ze = new Ys();
function dt(t) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    legalName: t.legal_name,
    cnpj: t.cnpj,
    stateRegistration: t.state_registration,
    taxRegimeCode: t.tax_regime_code,
    environment: t.environment,
    cscId: t.csc_id,
    cscToken: t.csc_token,
    defaultSeries: t.default_series,
    nextNfceNumber: t.next_nfce_number,
    addressStreet: t.address_street,
    addressNumber: t.address_number,
    addressNeighborhood: t.address_neighborhood,
    addressCity: t.address_city,
    addressState: t.address_state,
    addressZipCode: t.address_zip_code,
    addressCityIbgeCode: t.address_city_ibge_code,
    active: !!t.active,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
class Ws {
  create(e) {
    const a = o.prepare(`
      INSERT INTO stores (
        code, name, legal_name, cnpj, state_registration, tax_regime_code,
        environment, csc_id, csc_token, default_series, next_nfce_number,
        address_street, address_number, address_neighborhood, address_city,
        address_state, address_zip_code, address_city_ibge_code, active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      e.code,
      e.name,
      e.legalName,
      e.cnpj,
      e.stateRegistration,
      e.taxRegimeCode,
      e.environment,
      e.cscId ?? null,
      e.cscToken ?? null,
      e.defaultSeries ?? 1,
      e.nextNfceNumber ?? 1,
      e.addressStreet,
      e.addressNumber,
      e.addressNeighborhood,
      e.addressCity,
      e.addressState,
      e.addressZipCode,
      e.addressCityIbgeCode,
      Hs(e.active ?? !0)
    );
    return this.findById(Number(a.lastInsertRowid));
  }
  findById(e) {
    const a = o.prepare("SELECT * FROM stores WHERE id = ? LIMIT 1").get(e);
    return a ? dt(a) : null;
  }
  findActive() {
    const e = o.prepare(`
      SELECT * FROM stores
      WHERE active = 1
      ORDER BY id ASC
      LIMIT 1
    `).get();
    return e ? dt(e) : null;
  }
  reserveNextNfceNumber(e) {
    return o.transaction(() => {
      const s = o.prepare(`
        SELECT default_series, next_nfce_number
        FROM stores
        WHERE id = ?
        LIMIT 1
      `).get(e);
      if (!s)
        throw new Error(`Store ${e} não encontrada.`);
      return o.prepare(`
        UPDATE stores
        SET next_nfce_number = next_nfce_number + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(e), {
        series: s.default_series,
        number: s.next_nfce_number
      };
    })();
  }
}
const ee = new Ws();
function me(t) {
  return Number(t ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
class Ks {
  constructor() {
    M(this, "outputDir", ge.join(X.getPath("userData"), "fiscal", "danfe"));
  }
  async generate(e) {
    ue.mkdirSync(this.outputDir, { recursive: !0 });
    const a = e.danfePath || ge.join(this.outputDir, `nfce-${e.id}.html`), s = this.render(e);
    return ue.writeFileSync(a, s, "utf8"), {
      documentId: e.id,
      danfePath: a,
      contentType: "text/html",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async recover(e) {
    return !e.danfePath || !ue.existsSync(e.danfePath) ? null : {
      documentId: e.id,
      danfePath: e.danfePath,
      contentType: "text/html",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  render(e) {
    const a = Ze.findAggregateById(e.saleId), s = ee.findById(e.companyId), n = e.environment === "homologation", r = (a == null ? void 0 : a.items) ?? [], i = (a == null ? void 0 : a.payments) ?? [], c = (a == null ? void 0 : a.sale.totalAmount) ?? 0;
    return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DANFE NFC-e ${e.number}</title>
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
      <div class="subtitle">${(s == null ? void 0 : s.legalName) ?? "Emitente não encontrado"}</div>
      <div class="subtitle">CNPJ ${(s == null ? void 0 : s.cnpj) ?? "—"} | IE ${(s == null ? void 0 : s.stateRegistration) ?? "—"}</div>
      <div class="subtitle">${s ? `${s.addressStreet}, ${s.addressNumber} - ${s.addressNeighborhood}` : "Endereço indisponível"}</div>
      <div class="subtitle">${s ? `${s.addressCity}/${s.addressState}` : ""}</div>
      ${n ? '<div class="warn">EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL</div>' : ""}
      <div class="divider"></div>
      <div class="row"><span class="muted">Documento</span><span>${e.id}</span></div>
      <div class="row"><span class="muted">Venda</span><span>${e.saleId}</span></div>
      <div class="row"><span class="muted">Número/Série</span><span>${e.number}/${e.series}</span></div>
      <div class="row"><span class="muted">Status</span><span class="${e.status === "AUTHORIZED" ? "ok" : "muted"}">${e.status}</span></div>
      <div class="row"><span class="muted">Emissão</span><span>${e.issuedAt}</span></div>
      <div class="row"><span class="muted">Autorização</span><span>${e.authorizedAt ?? "Pendente"}</span></div>
      <div class="row"><span class="muted">Protocolo</span><span>${e.authorizationProtocol ?? "Pendente"}</span></div>
      <div class="divider"></div>
      <div class="subtitle"><strong>Itens</strong></div>
      ${r.map((d) => `
        <div class="item">
          <strong>${d.description}</strong>
          <div class="row"><span>${Number(d.quantity).toFixed(3)} x ${me(d.unitPrice)}</span><span>${me(d.totalAmount)}</span></div>
        </div>
      `).join("")}
      <div class="divider"></div>
      <div class="subtitle"><strong>Pagamentos</strong></div>
      ${i.map((d) => `
        <div class="row">
          <span>${d.method}</span>
          <span>${me(d.amount)}</span>
        </div>
      `).join("")}
      <div class="row"><span class="muted">Troco</span><span>${me((a == null ? void 0 : a.sale.changeAmount) ?? 0)}</span></div>
      <div class="row"><span class="muted">Total</span><span><strong>${me(c)}</strong></span></div>
      <div class="divider"></div>
      <div class="row"><span class="muted">Chave</span><span>${e.accessKey ?? "Pendente"}</span></div>
      <div class="qr">${e.qrCodeUrl ?? "QR Code indisponível"}</div>
    </div>
  </body>
</html>`;
  }
}
class S extends Error {
  constructor(a) {
    super(a.message);
    M(this, "code");
    M(this, "category");
    M(this, "retryable");
    M(this, "details");
    this.name = "FiscalError", this.code = a.code, this.category = a.category, this.retryable = a.retryable ?? !1, this.details = a.details, a.cause !== void 0 && (this.cause = a.cause);
  }
}
function V(t, e = "FISCAL_INTERNAL_ERROR") {
  return t instanceof S ? t : t instanceof Error ? new S({
    code: e,
    message: t.message,
    category: "INTERNAL",
    retryable: !1,
    cause: t
  }) : new S({
    code: e,
    message: "Erro interno na camada fiscal.",
    category: "INTERNAL",
    retryable: !1,
    details: t
  });
}
class qs {
  readCertificatePem(e) {
    var n;
    const a = (n = e.certificatePath) == null ? void 0 : n.trim();
    if (!a)
      return null;
    const s = ge.extname(a).toLowerCase();
    if (s === ".pem" || s === ".crt" || s === ".cer")
      return ue.readFileSync(a, "utf8");
    if (s === ".pfx" || s === ".p12") {
      if (!e.certificatePassword)
        throw new S({
          code: "CERTIFICATE_PASSWORD_REQUIRED",
          message: "Senha do certificado não configurada.",
          category: "CERTIFICATE"
        });
      try {
        return na(
          "openssl",
          ["pkcs12", "-in", a, "-clcerts", "-nokeys", "-passin", `pass:${e.certificatePassword}`],
          { encoding: "utf8" }
        );
      } catch (r) {
        throw new S({
          code: "CERTIFICATE_READ_FAILED",
          message: "Não foi possível validar o certificado digital informado.",
          category: "CERTIFICATE",
          cause: r
        });
      }
    }
    return null;
  }
  async getCertificateInfo(e) {
    var i;
    const a = (i = e.certificatePath) == null ? void 0 : i.trim(), s = (/* @__PURE__ */ new Date()).toISOString();
    if (!a)
      return {
        configured: !1,
        type: "UNKNOWN",
        lastCheckedAt: s
      };
    const n = ue.existsSync(a);
    let r = null;
    if (n)
      try {
        const c = this.readCertificatePem(e);
        if (c) {
          const d = new rt(c);
          r = new Date(d.validTo).toISOString();
        }
      } catch {
        r = null;
      }
    return {
      configured: n,
      type: [".pfx", ".p12"].includes(ge.extname(a).toLowerCase()) ? "A1" : "UNKNOWN",
      alias: ge.basename(a),
      source: a,
      validUntil: r,
      lastCheckedAt: s
    };
  }
  async assertCertificateReady(e) {
    if (e.provider === "mock")
      return;
    if (!e.certificatePath)
      throw new S({
        code: "CERTIFICATE_NOT_CONFIGURED",
        message: "Certificado fiscal não configurado.",
        category: "CERTIFICATE"
      });
    if (!ue.existsSync(e.certificatePath))
      throw new S({
        code: "CERTIFICATE_FILE_NOT_FOUND",
        message: `Arquivo do certificado não encontrado: ${e.certificatePath}`,
        category: "CERTIFICATE"
      });
    const a = this.readCertificatePem(e);
    if (!a)
      throw new S({
        code: "CERTIFICATE_FORMAT_NOT_SUPPORTED",
        message: "Formato de certificado não suportado pela camada fiscal atual.",
        category: "CERTIFICATE"
      });
    const s = new rt(a);
    if (new Date(s.validTo).getTime() < Date.now())
      throw new S({
        code: "CERTIFICATE_EXPIRED",
        message: "O certificado digital configurado está expirado.",
        category: "CERTIFICATE"
      });
  }
}
const fe = "fiscal:nfce", lt = "__FISCAL_CONFIG__";
function et() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function ut() {
  return {
    provider: "mock",
    environment: "homologation",
    contingencyMode: "queue",
    integrationId: fe,
    gatewayApiKey: null,
    gatewayBaseUrl: null,
    sefazBaseUrl: null,
    certificatePath: null,
    certificatePassword: null,
    cscId: null,
    cscToken: null,
    defaultSeries: 1,
    updatedAt: et()
  };
}
function Et(t) {
  return {
    provider: t.provider,
    environment: t.environment,
    contingencyMode: t.contingencyMode,
    integrationId: t.integrationId,
    gatewayBaseUrl: t.gatewayBaseUrl ?? null,
    sefazBaseUrl: t.sefazBaseUrl ?? null,
    certificatePath: t.certificatePath ?? null,
    cscId: t.cscId ?? null,
    defaultSeries: t.defaultSeries ?? null,
    hasGatewayApiKey: !!t.gatewayApiKey,
    hasCertificatePassword: !!t.certificatePassword,
    hasCscToken: !!t.cscToken,
    updatedAt: t.updatedAt
  };
}
class Qs {
  getConfig() {
    const e = o.prepare(`
      SELECT integration_id, raw_json, updated_at
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(fe);
    if (!(e != null && e.raw_json))
      return ut();
    const a = JSON.parse(e.raw_json);
    return {
      ...ut(),
      ...a,
      integrationId: fe,
      updatedAt: a.updatedAt ?? e.updated_at ?? et()
    };
  }
  getConfigView() {
    return Et(this.getConfig());
  }
  saveConfig(e) {
    const a = this.getConfig(), s = {
      ...a,
      ...e,
      gatewayApiKey: e.gatewayApiKey === "" ? a.gatewayApiKey : e.gatewayApiKey ?? a.gatewayApiKey,
      certificatePassword: e.certificatePassword === "" ? a.certificatePassword : e.certificatePassword ?? a.certificatePassword,
      cscToken: e.cscToken === "" ? a.cscToken : e.cscToken ?? a.cscToken,
      integrationId: fe,
      updatedAt: et()
    };
    return o.prepare(`
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
      fe,
      lt,
      lt,
      "CONFIG",
      "9999-12-31T23:59:59.999Z",
      "fiscal:nfce",
      JSON.stringify(s),
      s.updatedAt
    ), Et(s);
  }
}
function Pe(t) {
  return {
    id: t.id,
    saleId: t.sale_id,
    companyId: t.store_id,
    number: t.number,
    series: t.series,
    model: t.model,
    environment: t.environment,
    status: t.status,
    issueType: t.contingency_type ? 9 : 1,
    accessKey: t.access_key,
    authorizationProtocol: t.protocol,
    receiptNumber: t.receipt_number,
    statusCode: t.rejection_code,
    statusMessage: t.rejection_reason,
    issuedAt: t.issued_datetime ?? t.created_at,
    authorizedAt: t.authorization_datetime,
    cancelledAt: t.cancel_datetime,
    cancellationProtocol: t.protocol,
    xmlBuilt: t.xml,
    xmlSigned: t.xml_signed,
    xmlSent: t.xml,
    xmlAuthorized: t.xml_authorized,
    xmlCancellation: t.xml_cancellation,
    danfePath: t.danfe_path,
    qrCodeUrl: t.qr_code_url,
    digestValue: null,
    contingencyJustification: t.contingency_type,
    cancellationJustification: null,
    updatedAt: t.updated_at,
    createdAt: t.created_at
  };
}
function Js(t) {
  switch (t) {
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
function we(t) {
  const e = JSON.parse(t.payload_json), a = Number(t.entity_id);
  return {
    id: String(t.id),
    saleId: Number((e == null ? void 0 : e.saleId) ?? 0),
    documentId: Number.isNaN(a) ? null : a,
    operation: t.operation,
    payload: e,
    status: Js(t.status),
    idempotencyKey: t.idempotency_key,
    attempts: t.attempts,
    maxAttempts: 5,
    nextRetryAt: t.next_attempt_at,
    lastErrorCode: t.last_error ?? null,
    lastErrorMessage: t.last_error ?? null,
    lockedAt: null,
    lockedBy: null,
    processedAt: t.status === "DONE" ? t.updated_at : null,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
class Zs {
  ensureSchema() {
  }
  createPendingDocument(e) {
    const a = this.findBySaleId(e.saleId);
    if (a)
      return a;
    const s = o.prepare(`
      INSERT INTO fiscal_documents (
        sale_id, store_id, model, series, number, access_key, environment, status,
        issued_datetime, xml, xml_signed, xml_authorized, xml_cancellation, protocol, receipt_number, qr_code_url, authorization_datetime,
        cancel_datetime, contingency_type, rejection_code, rejection_reason, danfe_path,
        provider, created_at, updated_at
      ) VALUES (?, ?, 65, ?, ?, NULL, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      e.saleId,
      e.companyId,
      e.series,
      e.number,
      e.environment,
      e.offlineFallbackMode === "queue" ? "QUEUED" : "PENDING",
      e.issuedAt,
      e.offlineFallbackMode === "offline-contingency" ? "offline-contingency" : null
    );
    return this.findById(Number(s.lastInsertRowid));
  }
  updateTransmissionArtifacts(e, a) {
    o.prepare(`
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
      a.issuedAt ?? null,
      a.xmlBuilt ?? null,
      a.xmlSigned ?? null,
      a.xmlAuthorized ?? null,
      a.xmlCancellation ?? null,
      e
    );
  }
  markAsAuthorized(e, a) {
    return o.prepare(`
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
      a.accessKey ?? null,
      a.protocol ?? null,
      a.receiptNumber ?? null,
      a.qrCodeUrl ?? null,
      a.authorizedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      a.issuedAt ?? null,
      a.xmlBuilt ?? a.xmlSent ?? null,
      a.xmlSigned ?? null,
      a.xmlAuthorized ?? null,
      a.statusCode ?? null,
      a.statusMessage,
      a.provider ?? null,
      e
    ), this.findById(e);
  }
  markAsRejected(e, a) {
    return o.prepare(`
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
      a.status,
      a.issuedAt ?? null,
      a.xmlBuilt ?? a.xmlSent ?? null,
      a.xmlSigned ?? null,
      a.xmlAuthorized ?? null,
      a.statusCode ?? null,
      a.statusMessage,
      a.provider ?? null,
      e
    ), this.findById(e);
  }
  markAsCancelled(e, a, s) {
    return o.prepare(`
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
      s.cancelledAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      s.cancellationProtocol ?? null,
      s.xmlAuthorized ?? null,
      s.xmlCancellation ?? null,
      s.statusCode ?? null,
      s.statusMessage,
      e
    ), this.findById(e);
  }
  updateDanfePath(e, a) {
    o.prepare(`
      UPDATE fiscal_documents
      SET danfe_path = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(a, e);
  }
  findById(e) {
    const a = o.prepare("SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1").get(e);
    return a ? Pe(a) : null;
  }
  findBySaleId(e) {
    const a = o.prepare("SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return a ? Pe(a) : null;
  }
  findByAccessKey(e) {
    const a = o.prepare("SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1").get(e);
    return a ? Pe(a) : null;
  }
  updateStatus(e, a, s, n) {
    o.prepare(`
      UPDATE fiscal_documents
      SET
        status = ?,
        rejection_code = ?,
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(a, s ?? null, n ?? null, e);
  }
  enqueue(e) {
    const a = this.findQueueItemByIdempotencyKey(e.idempotencyKey);
    if (a)
      return a;
    const s = o.prepare(`
      INSERT INTO sync_queue (
        entity_type, entity_id, operation, payload_json, status, attempts,
        next_attempt_at, last_error, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'PENDING', 0, CURRENT_TIMESTAMP, NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      "fiscal_document",
      String(e.documentId ?? e.saleId),
      e.operation,
      JSON.stringify(e.payload),
      e.idempotencyKey
    );
    return this.findQueueItemById(String(s.lastInsertRowid));
  }
  findQueueItemByIdempotencyKey(e) {
    const a = o.prepare(`
      SELECT * FROM sync_queue
      WHERE idempotency_key = ?
      LIMIT 1
    `).get(e);
    return a ? we(a) : null;
  }
  findQueueItemById(e) {
    const a = o.prepare("SELECT * FROM sync_queue WHERE id = ? LIMIT 1").get(Number(e));
    return a ? we(a) : null;
  }
  claimNextQueueItem(e, a) {
    const s = o.prepare(`
      SELECT * FROM sync_queue
      WHERE status IN ('PENDING', 'FAILED')
        AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
      ORDER BY created_at ASC
      LIMIT 1
    `).get(e);
    return s ? (this.markQueueItemProcessing(String(s.id), "main", e), this.findQueueItemById(String(s.id))) : null;
  }
  markQueueItemProcessing(e, a, s) {
    o.prepare(`
      UPDATE sync_queue
      SET
        status = 'PROCESSING',
        attempts = attempts + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(Number(e));
  }
  markQueueItemDone(e, a) {
    o.prepare(`
      UPDATE sync_queue
      SET
        status = 'DONE',
        last_error = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(Number(e));
  }
  markQueueItemFailed(e, a, s, n, r) {
    const i = [a, s].filter(Boolean).join(": ");
    o.prepare(`
      UPDATE sync_queue
      SET
        status = 'FAILED',
        last_error = ?,
        next_attempt_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(i, n ?? null, Number(e));
  }
  listQueueItems(e = 20) {
    return o.prepare(`
      SELECT * FROM sync_queue
      ORDER BY created_at DESC
      LIMIT ?
    `).all(e).map(we);
  }
  summarizeQueue() {
    const e = o.prepare(`
      SELECT status, COUNT(*) as total
      FROM sync_queue
      GROUP BY status
    `).all(), a = {
      pending: 0,
      processing: 0,
      failed: 0,
      done: 0,
      nextRetryAt: null
    };
    for (const n of e)
      n.status === "PENDING" && (a.pending = n.total), n.status === "PROCESSING" && (a.processing = n.total), n.status === "FAILED" && (a.failed = n.total), n.status === "DONE" && (a.done = n.total);
    const s = o.prepare(`
      SELECT next_attempt_at
      FROM sync_queue
      WHERE status = 'FAILED' AND next_attempt_at IS NOT NULL
      ORDER BY next_attempt_at ASC
      LIMIT 1
    `).get();
    return a.nextRetryAt = (s == null ? void 0 : s.next_attempt_at) ?? null, a;
  }
}
function Xe(t) {
  var a;
  const e = (a = t.gatewayBaseUrl) == null ? void 0 : a.trim();
  if (!e)
    throw new S({
      code: "GATEWAY_BASE_URL_REQUIRED",
      message: "Gateway fiscal não configurado.",
      category: "CONFIGURATION"
    });
  return e.replace(/\/+$/, "");
}
function $e(t) {
  var a;
  const e = (a = t.gatewayApiKey) == null ? void 0 : a.trim();
  if (!e)
    throw new S({
      code: "GATEWAY_API_KEY_REQUIRED",
      message: "API key do gateway fiscal não configurada.",
      category: "CONFIGURATION"
    });
  return {
    "content-type": "application/json",
    authorization: `Bearer ${e}`
  };
}
async function Be(t, e) {
  var r, i, c, d, l, E;
  const a = await t.text(), s = a ? JSON.parse(a) : {}, n = s;
  if (!t.ok)
    throw new S({
      code: ((r = n.error) == null ? void 0 : r.code) ?? e,
      message: ((i = n.error) == null ? void 0 : i.message) ?? `Gateway fiscal retornou HTTP ${t.status}.`,
      category: "PROVIDER",
      retryable: t.status >= 500 || ((c = n.error) == null ? void 0 : c.retryable) === !0,
      details: s
    });
  if ("success" in n && n.success === !1)
    throw new S({
      code: ((d = n.error) == null ? void 0 : d.code) ?? e,
      message: ((l = n.error) == null ? void 0 : l.message) ?? "Gateway fiscal retornou erro de negócio.",
      category: "PROVIDER",
      retryable: ((E = n.error) == null ? void 0 : E.retryable) === !0,
      details: s
    });
  return "data" in n && n.data !== void 0 ? n.data : s;
}
class en {
  constructor() {
    M(this, "providerId", "gateway");
  }
  async authorizeNfce(e, a) {
    const s = await fetch(`${Xe(a)}/nfce/authorize`, {
      method: "POST",
      headers: $e(a),
      body: JSON.stringify({
        request: e
      })
    });
    return Be(s, "GATEWAY_AUTHORIZE_FAILED");
  }
  async cancelNfce(e, a) {
    const s = await fetch(`${Xe(a)}/nfce/cancel`, {
      method: "POST",
      headers: $e(a),
      body: JSON.stringify({
        request: e
      })
    });
    return Be(s, "GATEWAY_CANCEL_FAILED");
  }
  async consultStatus(e, a) {
    const s = await fetch(`${Xe(a)}/nfce/status/${encodeURIComponent(e.accessKey)}`, {
      method: "GET",
      headers: $e(a)
    });
    return Be(s, "GATEWAY_CONSULT_FAILED");
  }
}
function tn(t) {
  return `${t.emitter.address.state}${t.saleId}${t.number}${t.series}`.replace(/\D/g, "").padEnd(44, "0").slice(0, 44);
}
class an {
  constructor() {
    M(this, "providerId", "mock");
  }
  async authorizeNfce(e, a) {
    const s = (/* @__PURE__ */ new Date()).toISOString(), n = tn(e);
    return {
      status: "AUTHORIZED",
      provider: "mock",
      accessKey: n,
      protocol: `MOCK-PROT-${e.saleId}-${e.number}`,
      receiptNumber: `MOCK-REC-${e.saleId}`,
      statusCode: "100",
      statusMessage: "Autorizado em ambiente mock.",
      authorizedAt: s,
      xmlSent: `<NFe><infNFe Id="${n}"></infNFe></NFe>`,
      xmlAuthorized: `<procNFe><protNFe nProt="MOCK-PROT-${e.saleId}-${e.number}"/></procNFe>`,
      qrCodeUrl: `https://mock.fiscal.local/qrcode/${n}`,
      rawResponse: { mock: !0, environment: e.environment }
    };
  }
  async cancelNfce(e, a) {
    return {
      status: "CANCELLED",
      provider: "mock",
      cancellationProtocol: `MOCK-CANC-${e.documentId}`,
      cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
      statusCode: "135",
      statusMessage: "Cancelamento homologado em provider mock.",
      xmlCancellation: "<procEventoNFe><descEvento>Cancelamento</descEvento></procEventoNFe>",
      rawResponse: { mock: !0 }
    };
  }
  async consultStatus(e, a) {
    return {
      provider: "mock",
      accessKey: e.accessKey,
      status: "AUTHORIZED",
      statusCode: "100",
      statusMessage: "Documento autorizado em ambiente mock.",
      protocol: `MOCK-CONSULT-${e.accessKey.slice(-8)}`,
      authorizedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawResponse: { mock: !0 }
    };
  }
}
class sn {
  constructor() {
    M(this, "providerId", "sefaz-direct");
  }
  async authorizeNfce(e, a) {
    throw new S({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async cancelNfce(e, a) {
    throw new S({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async consultStatus(e, a) {
    throw new S({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
}
class nn {
  constructor() {
    M(this, "providers");
    this.providers = {
      mock: new an(),
      "sefaz-direct": new sn(),
      gateway: new en()
    };
  }
  resolve(e) {
    return this.providers[e.provider];
  }
}
class rn {
  constructor(e, a) {
    M(this, "workerId");
    this.repository = e, this.processor = a, this.workerId = `main-${process.pid}`;
  }
  async enqueue(e) {
    return this.repository.enqueue(e);
  }
  async processNext() {
    const e = (/* @__PURE__ */ new Date()).toISOString(), a = this.repository.claimNextQueueItem(e, this.workerId);
    if (!a)
      return null;
    try {
      const s = await this.processor(a);
      s.status === "AUTHORIZED" || s.status === "REJECTED" || s.status === "CANCELLED" ? this.repository.markQueueItemDone(a.id, (/* @__PURE__ */ new Date()).toISOString()) : s.status === "FAILED_RETRYABLE" || s.status === "PENDING_EXTERNAL" ? this.repository.markQueueItemFailed(
        a.id,
        s.statusCode ?? s.status,
        s.statusMessage ?? "Aguardando novo processamento fiscal.",
        s.nextRetryAt ?? new Date(Date.now() + Math.max(a.attempts, 1) * 6e4).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ) : this.repository.markQueueItemFailed(
        a.id,
        s.statusCode ?? s.status,
        s.statusMessage ?? "Falha fiscal definitiva.",
        null,
        (/* @__PURE__ */ new Date()).toISOString()
      );
    } catch (s) {
      const n = V(s, "FISCAL_QUEUE_PROCESS_FAILED"), r = n.retryable ? new Date(Date.now() + a.attempts * 6e4).toISOString() : null;
      this.repository.markQueueItemFailed(
        a.id,
        n.code,
        n.message,
        r,
        (/* @__PURE__ */ new Date()).toISOString()
      );
    }
    return this.repository.findQueueItemById(a.id);
  }
  async retry(e) {
    const a = this.repository.findQueueItemById(e);
    return a ? (this.repository.markQueueItemFailed(
      e,
      a.lastErrorCode ?? "MANUAL_RETRY",
      a.lastErrorMessage ?? "Reprocessamento manual.",
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ), this.processNext()) : null;
  }
  async list(e = 20) {
    return this.repository.listQueueItems(e);
  }
  async getSummary() {
    return this.repository.summarizeQueue();
  }
}
function se(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function L(t) {
  return String(t ?? "").trim().toUpperCase();
}
function on(t) {
  return /^\d{8}$/.test(t);
}
function cn(t) {
  return /^\d{4}$/.test(t);
}
function dn(t) {
  return /^[0-8]$/.test(t);
}
function ln(t) {
  return /^\d{7}$/.test(t);
}
function un(t) {
  return /^(SEM GTIN|\d{8}|\d{12,14})$/.test(t);
}
function Tt(t, e) {
  return Math.abs(t - e) < 0.01;
}
function En(t) {
  return {
    DINHEIRO: "Dinheiro",
    PIX: "PIX",
    DEBITO: "Cartão de débito",
    CREDITO: "Cartão de crédito",
    VOUCHER: "Voucher",
    OUTROS: "Outros"
  }[t];
}
class Tn {
  validateAuthorizeRequest(e, a) {
    const s = [], n = ee.findById(e.companyId);
    if (n || s.push({
      code: "STORE_NOT_FOUND",
      message: `Store fiscal ${e.companyId} não encontrada.`,
      field: "companyId",
      severity: "error"
    }), (!e.series || e.series <= 0) && s.push({
      code: "SERIES_INVALID",
      message: "Série fiscal inválida.",
      field: "series",
      severity: "error"
    }), (!e.number || e.number <= 0) && s.push({
      code: "NUMBER_INVALID",
      message: "Número fiscal inválido.",
      field: "number",
      severity: "error"
    }), e.issuedAt || s.push({
      code: "ISSUED_AT_REQUIRED",
      message: "Data/hora de emissão não informada.",
      field: "issuedAt",
      severity: "error"
    }), this.validateEmitter(e, a, (n == null ? void 0 : n.environment) ?? null, s), this.validateCompanyConsistency((n == null ? void 0 : n.environment) ?? null, e.companyId, s), this.validatePayments(e, s), this.validateItems(e, s), this.validateRuntimeConfig(e, a, s), s.some((r) => r.severity === "error"))
      throw new S({
        code: "FISCAL_PREREQUISITES_NOT_MET",
        message: "A venda não está pronta para emissão fiscal.",
        category: "VALIDATION",
        retryable: !1,
        details: s
      });
  }
  validateEmitter(e, a, s, n) {
    const r = e.emitter;
    se(r.cnpj).length !== 14 && n.push({ code: "EMITTER_CNPJ_INVALID", message: "CNPJ do emitente inválido.", field: "emitter.cnpj", severity: "error" }), L(r.stateRegistration) || n.push({ code: "EMITTER_IE_REQUIRED", message: "IE do emitente é obrigatória.", field: "emitter.stateRegistration", severity: "error" }), L(r.taxRegimeCode) || n.push({ code: "EMITTER_CRT_REQUIRED", message: "CRT do emitente é obrigatório.", field: "emitter.taxRegimeCode", severity: "error" }), L(r.legalName) || n.push({ code: "EMITTER_LEGAL_NAME_REQUIRED", message: "Razão social do emitente é obrigatória.", field: "emitter.legalName", severity: "error" }), L(r.tradeName) || n.push({ code: "EMITTER_TRADE_NAME_REQUIRED", message: "Nome fantasia do emitente é obrigatório.", field: "emitter.tradeName", severity: "error" }), (!L(r.address.street) || !L(r.address.number) || !L(r.address.neighborhood)) && n.push({ code: "EMITTER_ADDRESS_INCOMPLETE", message: "Endereço do emitente está incompleto.", field: "emitter.address", severity: "error" }), (!L(r.address.city) || !L(r.address.state)) && n.push({ code: "EMITTER_CITY_STATE_REQUIRED", message: "Cidade e UF do emitente são obrigatórias.", field: "emitter.address.city", severity: "error" }), se(r.address.cityIbgeCode).length !== 7 && n.push({ code: "EMITTER_CITY_IBGE_INVALID", message: "Código IBGE do município do emitente é inválido.", field: "emitter.address.cityIbgeCode", severity: "error" }), e.environment !== a.environment && n.push({
      code: "ENVIRONMENT_MISMATCH",
      message: "Ambiente do request diverge da configuração fiscal ativa.",
      field: "environment",
      severity: "error"
    }), s && e.environment !== s && n.push({
      code: "STORE_ENVIRONMENT_MISMATCH",
      message: "Ambiente fiscal da store diverge do request de emissão.",
      field: "environment",
      severity: "error"
    });
  }
  validateCompanyConsistency(e, a, s) {
    const n = ee.findById(a), r = o.prepare(`
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
    if (!n || !r)
      return;
    const i = [
      {
        code: "STORE_COMPANY_CNPJ_MISMATCH",
        left: se(n.cnpj),
        right: se(r.cnpj),
        message: "CNPJ divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_IE_MISMATCH",
        left: L(n.stateRegistration),
        right: L(r.inscricao_estadual),
        message: "IE divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_LEGAL_NAME_MISMATCH",
        left: L(n.legalName),
        right: L(r.razao_social),
        message: "Razão social divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_TRADE_NAME_MISMATCH",
        left: L(n.name),
        right: L(r.nome_fantasia),
        message: "Nome fantasia divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_CITY_MISMATCH",
        left: L(n.addressCity),
        right: L(r.cidade),
        message: "Cidade divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_STATE_MISMATCH",
        left: L(n.addressState),
        right: L(r.uf),
        message: "UF divergente entre stores e company."
      },
      {
        code: "STORE_COMPANY_IBGE_MISMATCH",
        left: se(n.addressCityIbgeCode),
        right: se(r.cod_municipio_ibge),
        message: "Código IBGE divergente entre stores e company."
      }
    ];
    for (const d of i)
      d.left !== d.right && s.push({
        code: d.code,
        message: d.message,
        severity: "error"
      });
    const c = r.ambiente_emissao === 1 ? "production" : "homologation";
    e && c !== e && s.push({
      code: "STORE_COMPANY_ENVIRONMENT_MISMATCH",
      message: "Ambiente divergente entre stores e company.",
      severity: "error"
    });
  }
  validatePayments(e, a) {
    if (e.payments.length === 0) {
      a.push({
        code: "PAYMENTS_REQUIRED",
        message: "A venda precisa ter ao menos um pagamento fiscal.",
        field: "payments",
        severity: "error"
      });
      return;
    }
    const s = e.payments.reduce((r, i) => r + Number(i.amount || 0), 0);
    Tt(s, e.totals.finalAmount) || a.push({
      code: "PAYMENTS_TOTAL_MISMATCH",
      message: "A soma dos pagamentos não corresponde ao total da venda.",
      field: "payments",
      severity: "error"
    }), e.payments.forEach((r, i) => {
      r.amount <= 0 && a.push({
        code: "PAYMENT_AMOUNT_INVALID",
        message: `Pagamento ${i + 1} (${En(r.method)}) com valor inválido.`,
        field: `payments[${i}].amount`,
        severity: "error"
      }), (r.changeAmount ?? 0) > 0 && r.method !== "DINHEIRO" && a.push({
        code: "PAYMENT_CHANGE_REQUIRES_CASH",
        message: "Troco só pode ser informado em pagamento em dinheiro.",
        field: `payments[${i}].changeAmount`,
        severity: "error"
      }), r.method === "DINHEIRO" && (r.receivedAmount ?? 0) < r.amount && a.push({
        code: "CASH_RECEIVED_AMOUNT_INVALID",
        message: `Pagamento ${i + 1} em dinheiro com valor recebido menor que o valor pago.`,
        field: `payments[${i}].receivedAmount`,
        severity: "error"
      });
    });
    const n = e.payments.reduce((r, i) => r + Number(i.changeAmount ?? 0), 0);
    Tt(n, e.totals.changeAmount) || a.push({
      code: "PAYMENTS_CHANGE_MISMATCH",
      message: "O troco dos pagamentos diverge do troco total da venda.",
      field: "payments",
      severity: "error"
    });
  }
  validateItems(e, a) {
    if (e.items.length === 0) {
      a.push({
        code: "ITEMS_REQUIRED",
        message: "A venda precisa ter itens para emissão NFC-e.",
        field: "items",
        severity: "error"
      });
      return;
    }
    e.items.forEach((s, n) => {
      const r = s.id ?? null;
      on(s.tax.ncm) || a.push({ code: "ITEM_NCM_INVALID", message: "NCM ausente ou inválido.", field: `items[${n}].tax.ncm`, severity: "error", itemIndex: n, itemId: r }), cn(s.tax.cfop) || a.push({ code: "ITEM_CFOP_INVALID", message: "CFOP ausente ou inválido.", field: `items[${n}].tax.cfop`, severity: "error", itemIndex: n, itemId: r }), dn(s.tax.originCode) || a.push({ code: "ITEM_ORIGIN_INVALID", message: "Origem fiscal ausente ou inválida.", field: `items[${n}].tax.originCode`, severity: "error", itemIndex: n, itemId: r }), !s.tax.csosn && !s.tax.icmsCst && a.push({ code: "ITEM_ICMS_CLASSIFICATION_REQUIRED", message: "CST/CSOSN de ICMS é obrigatório.", field: `items[${n}].tax`, severity: "error", itemIndex: n, itemId: r }), L(s.tax.pisCst) || a.push({ code: "ITEM_PIS_CST_REQUIRED", message: "CST de PIS é obrigatório.", field: `items[${n}].tax.pisCst`, severity: "error", itemIndex: n, itemId: r }), L(s.tax.cofinsCst) || a.push({ code: "ITEM_COFINS_CST_REQUIRED", message: "CST de COFINS é obrigatório.", field: `items[${n}].tax.cofinsCst`, severity: "error", itemIndex: n, itemId: r }), s.tax.cest && !ln(s.tax.cest) && a.push({ code: "ITEM_CEST_INVALID", message: "CEST informado é inválido.", field: `items[${n}].tax.cest`, severity: "error", itemIndex: n, itemId: r }), s.gtin && !un(s.gtin) && a.push({ code: "ITEM_GTIN_INVALID", message: "GTIN informado é inválido.", field: `items[${n}].gtin`, severity: "error", itemIndex: n, itemId: r });
    });
  }
  validateRuntimeConfig(e, a, s) {
    a.provider !== "mock" && (L(a.cscId) || s.push({ code: "CSC_ID_REQUIRED", message: "CSC ID é obrigatório para NFC-e real.", field: "config.cscId", severity: "error" }), L(a.cscToken) || s.push({ code: "CSC_TOKEN_REQUIRED", message: "CSC Token é obrigatório para NFC-e real.", field: "config.cscToken", severity: "error" })), a.provider === "gateway" && (L(a.gatewayBaseUrl) || s.push({ code: "GATEWAY_BASE_URL_REQUIRED", message: "URL base do gateway fiscal não configurada.", field: "config.gatewayBaseUrl", severity: "error" }), L(a.gatewayApiKey) || s.push({ code: "GATEWAY_API_KEY_REQUIRED", message: "API key do gateway fiscal não configurada.", field: "config.gatewayApiKey", severity: "error" })), e.environment === "production" && a.provider === "mock" && s.push({
      code: "MOCK_PROVIDER_NOT_ALLOWED_IN_PRODUCTION",
      message: "Provider mock não pode ser usado em produção.",
      field: "config.provider",
      severity: "error"
    });
  }
}
const mn = new Tn();
function p(t) {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function B(t) {
  return Number(t ?? 0).toFixed(2);
}
class _n {
  buildAuthorizeXml(e) {
    var n;
    const a = e.items.map(
      (r, i) => `    <det nItem="${i + 1}">
      <prod>
        <cProd>${p(r.id)}</cProd>
        <xProd>${p(r.description)}</xProd>
        <cEAN>${p(r.gtin ?? "SEM GTIN")}</cEAN>
        <NCM>${p(r.tax.ncm)}</NCM>
        <CFOP>${p(r.tax.cfop)}</CFOP>
        ${r.tax.cest ? `<CEST>${p(r.tax.cest)}</CEST>` : ""}
        <uCom>${p(r.unit)}</uCom>
        <qCom>${p(r.quantity.toFixed(4))}</qCom>
        <vUnCom>${B(r.unitPrice)}</vUnCom>
        <vProd>${B(r.grossAmount)}</vProd>
        <uTrib>${p(r.unit)}</uTrib>
        <qTrib>${p(r.quantity.toFixed(4))}</qTrib>
        <vUnTrib>${B(r.unitPrice)}</vUnTrib>
        <vDesc>${B(r.discountAmount)}</vDesc>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ICMS><orig>${p(r.tax.originCode)}</orig>${r.tax.csosn ? `<CSOSN>${p(r.tax.csosn)}</CSOSN>` : ""}${r.tax.icmsCst ? `<CST>${p(r.tax.icmsCst)}</CST>` : ""}</ICMS>
        <PIS><CST>${p(r.tax.pisCst)}</CST></PIS>
        <COFINS><CST>${p(r.tax.cofinsCst)}</CST></COFINS>
      </imposto>
    </det>`
    ).join(`
`), s = e.payments.map(
      (r) => `      <detPag>
        <indPag>0</indPag>
        <tPag>${p(r.method)}</tPag>
        <vPag>${B(r.amount)}</vPag>
        ${r.description ? `<xPag>${p(r.description)}</xPag>` : ""}
      </detPag>`
    ).join(`
`);
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe versao="4.00" Id="">
    <ide>
      <mod>65</mod>
      <serie>${p(e.series)}</serie>
      <nNF>${p(e.number)}</nNF>
      <dhEmi>${p(e.issuedAt)}</dhEmi>
      <tpAmb>${e.environment === "production" ? "1" : "2"}</tpAmb>
      <tpImp>4</tpImp>
      <tpEmis>1</tpEmis>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
    </ide>
    <emit>
      <CNPJ>${p(e.emitter.cnpj)}</CNPJ>
      <xNome>${p(e.emitter.legalName)}</xNome>
      <xFant>${p(e.emitter.tradeName)}</xFant>
      <IE>${p(e.emitter.stateRegistration)}</IE>
      <CRT>${p(e.emitter.taxRegimeCode)}</CRT>
      <enderEmit>
        <xLgr>${p(e.emitter.address.street)}</xLgr>
        <nro>${p(e.emitter.address.number)}</nro>
        <xBairro>${p(e.emitter.address.neighborhood)}</xBairro>
        <cMun>${p(e.emitter.address.cityIbgeCode)}</cMun>
        <xMun>${p(e.emitter.address.city)}</xMun>
        <UF>${p(e.emitter.address.state)}</UF>
        <CEP>${p(e.emitter.address.zipCode)}</CEP>
      </enderEmit>
    </emit>
    ${(n = e.customer) != null && n.cpfCnpj ? `<dest>
      <${e.customer.cpfCnpj.replace(/\D/g, "").length === 11 ? "CPF" : "CNPJ"}>${p(e.customer.cpfCnpj)}</${e.customer.cpfCnpj.replace(/\D/g, "").length === 11 ? "CPF" : "CNPJ"}>
      ${e.customer.name ? `<xNome>${p(e.customer.name)}</xNome>` : ""}
    </dest>` : ""}
${a}
    <total>
      <ICMSTot>
        <vProd>${B(e.totals.productsAmount)}</vProd>
        <vDesc>${B(e.totals.discountAmount)}</vDesc>
        <vNF>${B(e.totals.finalAmount)}</vNF>
      </ICMSTot>
    </total>
    <pag>
${s}
      <vTroco>${B(e.totals.changeAmount)}</vTroco>
    </pag>
    ${e.additionalInfo ? `<infAdic><infCpl>${p(e.additionalInfo)}</infCpl></infAdic>` : ""}
  </infNFe>
</NFe>`;
  }
}
const pn = new _n();
class Nn {
  constructor(e, a, s, n, r, i) {
    this.repository = e, this.queueService = a, this.certificateService = s, this.danfeService = n, this.configService = r, this.resolveProvider = i;
  }
  async getConfig() {
    return this.configService.getConfigView();
  }
  async saveConfig(e) {
    return this.configService.saveConfig(e);
  }
  async authorizeNfce(e) {
    const a = this.repository.findBySaleId(e.saleId);
    if ((a == null ? void 0 : a.status) === "AUTHORIZED")
      return {
        status: "AUTHORIZED",
        provider: this.configService.getConfig().provider,
        accessKey: a.accessKey,
        protocol: a.authorizationProtocol,
        statusCode: a.statusCode,
        statusMessage: a.statusMessage ?? "Documento já autorizado.",
        authorizedAt: a.authorizedAt,
        xmlAuthorized: a.xmlAuthorized,
        xmlSent: a.xmlSent,
        qrCodeUrl: a.qrCodeUrl
      };
    const s = a ?? this.repository.createPendingDocument(e), n = this.configService.getConfig();
    mn.validateAuthorizeRequest(e, n), this.repository.updateStatus(s.id, "PENDING");
    const r = pn.buildAuthorizeXml(e);
    this.repository.updateTransmissionArtifacts(s.id, {
      issuedAt: e.issuedAt,
      xmlBuilt: r
    });
    try {
      await this.certificateService.assertCertificateReady(n);
      const c = await this.resolveProvider().authorizeNfce(e, n), d = {
        ...c,
        issuedAt: c.issuedAt ?? e.issuedAt,
        xmlBuilt: c.xmlBuilt ?? r
      };
      if (d.status === "AUTHORIZED") {
        const l = this.repository.markAsAuthorized(s.id, d), E = await this.danfeService.generate(l);
        this.repository.updateDanfePath(l.id, E.danfePath);
      } else
        this.repository.markAsRejected(s.id, d);
      return d;
    } catch (i) {
      const c = V(i, "FISCAL_AUTHORIZE_FAILED");
      if (this.repository.updateStatus(s.id, "ERROR", c.code, c.message), e.offlineFallbackMode === "queue" || c.retryable)
        return await this.queueService.enqueue({
          saleId: e.saleId,
          documentId: s.id,
          operation: "AUTHORIZE_NFCE",
          idempotencyKey: e.idempotencyKey,
          payload: e
        }), this.repository.updateStatus(s.id, "QUEUED", c.code, c.message), {
          status: "QUEUED",
          provider: n.provider,
          statusCode: c.code,
          statusMessage: c.message
        };
      throw c;
    }
  }
  async cancelNfce(e) {
    const a = this.repository.findById(e.documentId);
    if (!a)
      throw new S({
        code: "FISCAL_DOCUMENT_NOT_FOUND",
        message: `Documento fiscal ${e.documentId} não encontrado.`,
        category: "VALIDATION"
      });
    if (a.status === "CANCELLED")
      return {
        status: "CANCELLED",
        provider: this.configService.getConfig().provider,
        cancellationProtocol: a.cancellationProtocol,
        cancelledAt: a.cancelledAt,
        statusCode: a.statusCode,
        statusMessage: a.statusMessage ?? "Documento já cancelado.",
        xmlCancellation: a.xmlCancellation
      };
    const s = this.resolveProvider(), n = this.configService.getConfig(), r = await s.cancelNfce(e, n);
    return this.repository.markAsCancelled(a.id, e, r), r;
  }
  async consultStatusByAccessKey(e) {
    const a = this.configService.getConfig(), n = await this.resolveProvider().consultStatus({ accessKey: e }, a), r = this.repository.findByAccessKey(e);
    return r && this.repository.updateStatus(r.id, n.status, n.statusCode, n.statusMessage), n;
  }
  async getDanfe(e) {
    const a = this.repository.findById(e);
    if (!a)
      throw new S({
        code: "DANFE_DOCUMENT_NOT_FOUND",
        message: `Documento fiscal ${e} não encontrado.`,
        category: "VALIDATION"
      });
    const s = await this.danfeService.recover(a);
    if (s)
      return s;
    const n = await this.danfeService.generate(a);
    return this.repository.updateDanfePath(e, n.danfePath), n;
  }
  async enqueuePending(e) {
    return this.queueService.enqueue(e);
  }
  async reprocessQueueItem(e) {
    return this.queueService.retry(e);
  }
  async listQueue(e = 20) {
    return this.queueService.list(e);
  }
  async getQueueSummary() {
    return this.queueService.getSummary();
  }
}
const st = new Zs();
st.ensureSchema();
const tt = new Qs(), fn = new nn(), Xt = new qs(), gn = new Ks();
let ye;
function In(t) {
  return t.status === "AUTHORIZED" ? {
    status: "AUTHORIZED",
    statusCode: t.statusCode ?? null,
    statusMessage: t.statusMessage
  } : t.status === "REJECTED" ? {
    status: "REJECTED",
    statusCode: t.statusCode ?? null,
    statusMessage: t.statusMessage
  } : t.status === "QUEUED" || t.status === "PENDING" || t.status === "CONTINGENCY" ? {
    status: "PENDING_EXTERNAL",
    statusCode: t.statusCode ?? null,
    statusMessage: t.statusMessage
  } : {
    status: "FAILED_RETRYABLE",
    statusCode: t.statusCode ?? null,
    statusMessage: t.statusMessage
  };
}
function An(t) {
  return t.status === "CANCELLED" ? {
    status: "CANCELLED",
    statusCode: t.statusCode ?? null,
    statusMessage: t.statusMessage
  } : {
    status: "FAILED_FINAL",
    statusCode: t.statusCode ?? null,
    statusMessage: t.statusMessage
  };
}
const $t = new rn(st, async (t) => {
  const e = t.payload;
  if (t.operation === "AUTHORIZE_NFCE") {
    const a = await ye.authorizeNfce(e);
    return In(a);
  }
  if (t.operation === "CANCEL_NFCE") {
    const a = await ye.cancelNfce(e);
    return An(a);
  }
  return {
    status: "FAILED_FINAL",
    statusCode: "QUEUE_OPERATION_NOT_SUPPORTED",
    statusMessage: `Operação de fila não suportada: ${t.operation}`
  };
});
ye = new Nn(
  st,
  $t,
  Xt,
  gn,
  tt,
  () => fn.resolve(tt.getConfig())
);
const P = ye, Ln = tt, Bt = $t, Rn = Xt;
let mt = !1;
function hn(t = 15e3) {
  mt || (mt = !0, setInterval(() => {
    Bt.processNext();
  }, t));
}
let kt = null;
function _t(t) {
  kt = t;
}
function nt() {
  return kt;
}
const Sn = {
  admin: ["admin", "administrador", "administrator", "dono", "owner"],
  manager: ["gerente", "gestor", "manager", "supervisor"],
  cashier: ["caixa", "operador", "operador de caixa", "atendente", "vendedor"],
  stock: ["estoque", "almoxarife"],
  unknown: []
}, Cn = {
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
function vn(t) {
  const e = String(t ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [a, s] of Object.entries(Sn))
    if (s.includes(e)) return a;
  return "unknown";
}
function On(t) {
  return Cn[vn(t)];
}
function Gt(t, e) {
  return On(t).includes(e);
}
function yn(t) {
  return {
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
  }[t];
}
function Ht() {
  const t = nt();
  return t ? o.prepare(`
    SELECT u.id, u.nome, u.funcao, u.ativo
    FROM sessions s
    INNER JOIN usuarios u ON u.id = s.user_id
    WHERE s.id = ?
      AND s.active = 1
    LIMIT 1
  `).get(t) ?? null : null;
}
function m(t) {
  const e = Ht();
  if (!e || !e.ativo)
    throw new Error("Sessão inválida ou usuário inativo.");
  if (!Gt(e.funcao, t))
    throw new Error(yn(t));
  return e;
}
function de(t) {
  const e = Ht();
  return !!(e && e.ativo && Gt(e.funcao, t));
}
function Un() {
  u.handle("fiscal:get-runtime-config", async () => (m("fiscal:manage"), P.getConfig())), u.handle("fiscal:save-runtime-config", async (t, e) => {
    try {
      return m("fiscal:manage"), await P.saveConfig(e);
    } catch (a) {
      const s = V(a, "FISCAL_CONFIG_SAVE_FAILED");
      return {
        success: !1,
        error: {
          code: s.code,
          message: s.message,
          category: s.category,
          retryable: s.retryable
        }
      };
    }
  }), u.handle("fiscal:get-certificate-info", async () => (m("fiscal:manage"), Rn.getCertificateInfo(Ln.getConfig()))), u.handle("fiscal:authorize-nfce", async (t, e) => {
    try {
      return m("fiscal:manage"), {
        success: !0,
        data: await P.authorizeNfce(e)
      };
    } catch (a) {
      const s = V(a, "FISCAL_AUTHORIZE_FAILED");
      return {
        success: !1,
        error: {
          code: s.code,
          message: s.message,
          category: s.category,
          retryable: s.retryable
        }
      };
    }
  }), u.handle("fiscal:cancel-nfce", async (t, e) => {
    try {
      return m("fiscal:manage"), {
        success: !0,
        data: await P.cancelNfce(e)
      };
    } catch (a) {
      const s = V(a, "FISCAL_CANCEL_FAILED");
      return {
        success: !1,
        error: {
          code: s.code,
          message: s.message,
          category: s.category,
          retryable: s.retryable
        }
      };
    }
  }), u.handle("fiscal:consult-status", async (t, e) => {
    try {
      return m("fiscal:manage"), {
        success: !0,
        data: await P.consultStatusByAccessKey(e)
      };
    } catch (a) {
      const s = V(a, "FISCAL_CONSULT_FAILED");
      return {
        success: !1,
        error: {
          code: s.code,
          message: s.message,
          category: s.category,
          retryable: s.retryable
        }
      };
    }
  }), u.handle("fiscal:get-danfe", async (t, e) => {
    try {
      return m("fiscal:manage"), {
        success: !0,
        data: await P.getDanfe(e)
      };
    } catch (a) {
      const s = V(a, "FISCAL_DANFE_FAILED");
      return {
        success: !1,
        error: {
          code: s.code,
          message: s.message,
          category: s.category,
          retryable: s.retryable
        }
      };
    }
  }), u.handle("fiscal:get-queue-summary", async () => (m("fiscal:manage"), P.getQueueSummary())), u.handle("fiscal:list-queue", async (t, e = 20) => (m("fiscal:manage"), P.listQueue(e))), u.handle("fiscal:reprocess-queue-item", async (t, e) => {
    try {
      return m("fiscal:manage"), {
        success: !0,
        data: await P.reprocessQueueItem(e)
      };
    } catch (a) {
      const s = V(a, "FISCAL_REPROCESS_FAILED");
      return {
        success: !1,
        error: {
          code: s.code,
          message: s.message,
          category: s.category,
          retryable: s.retryable
        }
      };
    }
  }), u.handle("fiscal:process-next-queue-item", async () => (m("fiscal:manage"), Bt.processNext()));
}
function ke(t) {
  return {
    id: t.id,
    saleId: t.sale_id,
    storeId: t.store_id,
    model: t.model,
    series: t.series,
    number: t.number,
    accessKey: t.access_key,
    environment: t.environment,
    status: t.status,
    issuedDatetime: t.issued_datetime,
    xml: t.xml,
    xmlSigned: t.xml_signed,
    xmlAuthorized: t.xml_authorized,
    xmlCancellation: t.xml_cancellation,
    protocol: t.protocol,
    receiptNumber: t.receipt_number,
    qrCodeUrl: t.qr_code_url,
    authorizationDatetime: t.authorization_datetime,
    cancelDatetime: t.cancel_datetime,
    contingencyType: t.contingency_type,
    rejectionCode: t.rejection_code,
    rejectionReason: t.rejection_reason,
    danfePath: t.danfe_path,
    provider: t.provider,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
class Dn {
  createPending(e) {
    const a = o.prepare(`
      INSERT INTO fiscal_documents (
        sale_id, store_id, model, series, number, access_key, environment, status,
        issued_datetime, xml, xml_signed, xml_authorized, xml_cancellation, protocol, receipt_number, qr_code_url, authorization_datetime,
        cancel_datetime, contingency_type, rejection_code, rejection_reason, danfe_path,
        provider, created_at, updated_at
      ) VALUES (?, ?, 65, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      e.saleId,
      e.storeId,
      e.series,
      e.number,
      e.accessKey ?? null,
      e.environment,
      e.status,
      e.issuedDatetime ?? null,
      e.xml ?? null,
      e.xmlSigned ?? null,
      e.xmlAuthorized ?? null,
      e.xmlCancellation ?? null,
      e.protocol ?? null,
      e.receiptNumber ?? null,
      e.qrCodeUrl ?? null,
      e.authorizationDatetime ?? null,
      e.cancelDatetime ?? null,
      e.contingencyType ?? null,
      e.rejectionCode ?? null,
      e.rejectionReason ?? null,
      e.danfePath ?? null,
      e.provider ?? null
    );
    return this.findById(Number(a.lastInsertRowid));
  }
  upsertBySale(e) {
    const a = this.findBySaleId(e.saleId);
    return a ? (o.prepare(`
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
      e.storeId,
      e.series,
      e.number,
      e.accessKey ?? a.accessKey ?? null,
      e.environment,
      e.status,
      e.issuedDatetime ?? a.issuedDatetime ?? null,
      e.xml ?? a.xml ?? null,
      e.xmlSigned ?? a.xmlSigned ?? null,
      e.xmlAuthorized ?? a.xmlAuthorized ?? null,
      e.xmlCancellation ?? a.xmlCancellation ?? null,
      e.protocol ?? a.protocol ?? null,
      e.receiptNumber ?? a.receiptNumber ?? null,
      e.qrCodeUrl ?? a.qrCodeUrl ?? null,
      e.authorizationDatetime ?? a.authorizationDatetime ?? null,
      e.cancelDatetime ?? a.cancelDatetime ?? null,
      e.contingencyType ?? a.contingencyType ?? null,
      e.rejectionCode ?? a.rejectionCode ?? null,
      e.rejectionReason ?? a.rejectionReason ?? null,
      e.danfePath ?? a.danfePath ?? null,
      e.provider ?? a.provider ?? null,
      a.id
    ), this.findById(a.id)) : this.createPending(e);
  }
  findById(e) {
    const a = o.prepare("SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1").get(e);
    return a ? ke(a) : null;
  }
  findBySaleId(e) {
    const a = o.prepare("SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return a ? ke(a) : null;
  }
  findByAccessKey(e) {
    const a = o.prepare("SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1").get(e);
    return a ? ke(a) : null;
  }
  markCancelled(e, a, s) {
    o.prepare(`
      UPDATE fiscal_documents
      SET
        status = 'CANCELLED',
        cancel_datetime = ?,
        protocol = COALESCE(?, protocol),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(a, s ?? null, e);
  }
}
const Ue = new Dn(), at = {
  DRAFT: "DRAFT",
  QUEUED: "QUEUED",
  SIGNING: "SIGNING",
  TRANSMITTING: "TRANSMITTING",
  AUTHORIZED: "AUTHORIZED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  CONTINGENCY: "CONTINGENCY",
  ERROR: "ERROR"
}, Ge = {
  AUTHORIZATION_REQUESTED: "AUTHORIZATION_REQUESTED",
  AUTHORIZATION_RESPONSE: "AUTHORIZATION_RESPONSE",
  STATUS_CONSULTED: "STATUS_CONSULTED",
  CANCELLATION_REQUESTED: "CANCELLATION_REQUESTED",
  CANCELLATION_RESPONSE: "CANCELLATION_RESPONSE",
  DANFE_REPRINTED: "DANFE_REPRINTED",
  CONTINGENCY_ACTIVATED: "CONTINGENCY_ACTIVATED",
  CONTINGENCY_SYNC_REQUESTED: "CONTINGENCY_SYNC_REQUESTED"
};
class bn {
  getOrReserveForSale(e, a) {
    const s = Ue.findBySaleId(e);
    return s ? {
      series: s.series,
      number: s.number
    } : ee.reserveNextNfceNumber(a);
  }
}
const Fn = new bn();
function pt(t) {
  return {
    "01": "DINHEIRO",
    "03": "CREDITO",
    "04": "DEBITO",
    10: "VOUCHER",
    17: "PIX"
  }[t] ?? "OUTROS";
}
function Nt(t) {
  return t === 1 ? "production" : "homologation";
}
function Mn(t) {
  return t.length === 0 ? "OUTROS" : new Set(t.map((a) => a.method)).size === 1 ? t[0].method : "OUTROS";
}
class xn {
  loadActiveCompany() {
    return o.prepare(`
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
    `).get() ?? null;
  }
  resolveActiveStore() {
    const e = ee.findActive();
    if (e)
      return e;
    const a = this.loadActiveCompany();
    if (!a)
      throw new Error("Nenhuma store ativa encontrada e não existe company ativa para criar o espelho fiscal.");
    return ee.create({
      code: "MAIN",
      name: a.nome_fantasia,
      legalName: a.razao_social,
      cnpj: a.cnpj,
      stateRegistration: a.inscricao_estadual,
      taxRegimeCode: String(a.crt),
      environment: Nt(a.ambiente_emissao),
      cscId: a.csc_id,
      cscToken: a.csc_token,
      defaultSeries: Number(a.serie_nfce ?? 1),
      nextNfceNumber: Number(a.proximo_numero_nfce ?? 1),
      addressStreet: a.rua,
      addressNumber: a.numero,
      addressNeighborhood: a.bairro,
      addressCity: a.cidade,
      addressState: a.uf,
      addressZipCode: a.cep,
      addressCityIbgeCode: a.cod_municipio_ibge,
      active: !0
    });
  }
  loadLegacySale(e) {
    const a = o.prepare(`
      SELECT
        id, ambiente, data_emissao, valor_produtos, valor_desconto,
        valor_total, valor_troco, cliente_nome, cpf_cliente, cnpj_cliente
      FROM vendas
      WHERE id = ?
      LIMIT 1
    `).get(e);
    if (!a)
      throw new Error(`Venda ${e} não encontrada para emissão fiscal.`);
    return a;
  }
  loadLegacyItems(e) {
    return o.prepare(`
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
    `).all(e);
  }
  loadLegacyPayments(e) {
    return o.prepare(`
      SELECT id, tpag, valor, valor_recebido, troco, descricao_outro
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id ASC
    `).all(e);
  }
  buildAuthorizeRequest(e, a, s, n) {
    const r = this.loadLegacySale(e), i = ee.findById(a);
    if (!i)
      throw new Error(`Store fiscal ${a} não encontrada para emissão.`);
    const c = this.loadLegacyItems(e), d = this.loadLegacyPayments(e).map((l) => ({
      method: pt(l.tpag),
      amount: Number(l.valor ?? 0),
      receivedAmount: l.valor_recebido != null ? Number(l.valor_recebido) : void 0,
      changeAmount: l.troco != null ? Number(l.troco) : void 0,
      description: l.descricao_outro ?? null
    }));
    return {
      saleId: r.id,
      companyId: i.id,
      number: n,
      series: s,
      environment: Nt(r.ambiente),
      paymentMethod: Mn(d),
      payments: d,
      issuedAt: r.data_emissao,
      emitter: {
        cnpj: i.cnpj,
        stateRegistration: i.stateRegistration,
        legalName: i.legalName,
        tradeName: i.name,
        taxRegimeCode: String(i.taxRegimeCode),
        address: {
          street: i.addressStreet,
          number: i.addressNumber,
          neighborhood: i.addressNeighborhood,
          city: i.addressCity,
          state: i.addressState,
          zipCode: i.addressZipCode,
          cityIbgeCode: i.addressCityIbgeCode
        }
      },
      customer: {
        name: r.cliente_nome ?? void 0,
        cpfCnpj: r.cpf_cliente ?? r.cnpj_cliente ?? null
      },
      items: c.map((l) => ({
        id: l.produto_id ?? l.codigo_produto,
        description: l.nome_produto,
        unit: l.unidade_comercial,
        quantity: Number(l.quantidade_comercial ?? 0),
        unitPrice: Number(l.valor_unitario_comercial ?? 0),
        grossAmount: Number(l.valor_bruto ?? 0),
        discountAmount: Number(l.valor_desconto ?? 0),
        totalAmount: Number(l.subtotal ?? 0),
        gtin: l.gtin,
        tax: {
          ncm: l.ncm ?? "",
          cfop: l.cfop ?? "",
          cest: l.cest,
          originCode: l.origin_code ?? "",
          csosn: l.csosn,
          icmsCst: l.icms_cst,
          pisCst: l.pis_cst ?? "",
          cofinsCst: l.cofins_cst ?? ""
        }
      })),
      totals: {
        productsAmount: Number(r.valor_produtos ?? 0),
        discountAmount: Number(r.valor_desconto ?? 0),
        finalAmount: Number(r.valor_total ?? 0),
        receivedAmount: d.reduce((l, E) => l + Number(E.receivedAmount ?? E.amount ?? 0), 0),
        changeAmount: d.reduce((l, E) => l + Number(E.changeAmount ?? 0), 0) || Number(r.valor_troco ?? 0)
      },
      additionalInfo: `Venda PDV ${r.id}`,
      offlineFallbackMode: "queue",
      idempotencyKey: `nfce-sale-${r.id}`
    };
  }
  mirrorLegacySale(e) {
    const a = this.resolveActiveStore(), s = this.loadLegacySale(e), n = this.loadLegacyItems(e), r = this.loadLegacyPayments(e), i = `legacy-sale:${e}`, d = Ze.findByExternalReference(i) ?? Ze.create({
      storeId: a.id,
      customerName: s.cliente_nome ?? null,
      customerDocument: s.cpf_cliente ?? s.cnpj_cliente ?? null,
      status: "PAID",
      subtotalAmount: Number(s.valor_produtos ?? 0),
      discountAmount: Number(s.valor_desconto ?? 0),
      totalAmount: Number(s.valor_total ?? 0),
      changeAmount: Number(s.valor_troco ?? 0),
      externalReference: i,
      items: n.map((T) => ({
        productId: T.produto_id ?? T.codigo_produto,
        description: T.nome_produto,
        unit: T.unidade_comercial,
        quantity: Number(T.quantidade_comercial ?? 0),
        unitPrice: Number(T.valor_unitario_comercial ?? 0),
        grossAmount: Number(T.valor_bruto ?? 0),
        discountAmount: Number(T.valor_desconto ?? 0),
        totalAmount: Number(T.subtotal ?? 0),
        ncm: T.ncm ?? null,
        cfop: T.cfop ?? null,
        cest: T.cest,
        originCode: T.origin_code,
        taxSnapshot: {
          ncm: T.ncm,
          cfop: T.cfop,
          cest: T.cest,
          originCode: T.origin_code,
          csosn: T.csosn,
          icmsCst: T.icms_cst,
          pisCst: T.pis_cst,
          cofinsCst: T.cofins_cst
        }
      })),
      payments: r.map((T) => ({
        method: pt(T.tpag),
        amount: Number(T.valor ?? 0),
        receivedAmount: T.valor_recebido != null ? Number(T.valor_recebido) : Number(T.valor ?? 0),
        changeAmount: Number(T.troco ?? 0),
        integrationReference: T.descricao_outro ?? null
      }))
    }), l = Fn.getOrReserveForSale(d.sale.id, a.id), E = this.buildAuthorizeRequest(e, a.id, l.series, l.number), _ = Ue.upsertBySale({
      saleId: d.sale.id,
      storeId: a.id,
      series: l.series,
      number: l.number,
      environment: E.environment,
      status: at.DRAFT,
      issuedDatetime: E.issuedAt,
      contingencyType: E.offlineFallbackMode === "queue" ? "queue" : null,
      provider: null
    });
    return {
      request: E,
      store: a,
      mirroredSale: d,
      mirroredFiscalDocument: _
    };
  }
}
const Pn = new xn();
function ft(t) {
  return {
    id: t.id,
    fiscalDocumentId: t.fiscal_document_id,
    eventType: t.event_type,
    payloadJson: t.payload_json,
    responseJson: t.response_json,
    status: t.status,
    createdAt: t.created_at
  };
}
class wn {
  create(e) {
    const a = o.prepare(`
      INSERT INTO fiscal_events (
        fiscal_document_id, event_type, payload_json, response_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      e.fiscalDocumentId,
      e.eventType,
      e.payload ? Je(e.payload) : null,
      e.response ? Je(e.response) : null,
      e.status
    );
    return this.findById(Number(a.lastInsertRowid));
  }
  findById(e) {
    const a = o.prepare("SELECT * FROM fiscal_events WHERE id = ? LIMIT 1").get(e);
    return a ? ft(a) : null;
  }
  listByFiscalDocument(e) {
    return o.prepare(`
      SELECT * FROM fiscal_events
      WHERE fiscal_document_id = ?
      ORDER BY created_at DESC, id DESC
    `).all(e).map(ft);
  }
}
const He = new wn();
class Xn {
  async execute(e) {
    try {
      const a = Pn.mirrorLegacySale(e), s = {
        ...a.request,
        saleId: a.mirroredSale.sale.id,
        companyId: a.store.id,
        idempotencyKey: `nfce-sale-${a.mirroredSale.sale.id}`
      };
      He.create({
        fiscalDocumentId: a.mirroredFiscalDocument.id,
        eventType: Ge.AUTHORIZATION_REQUESTED,
        payload: { legacySaleId: e, request: s },
        status: at.TRANSMITTING
      });
      const n = await P.authorizeNfce(s), r = Ue.findBySaleId(a.mirroredSale.sale.id);
      return r && He.create({
        fiscalDocumentId: r.id,
        eventType: Ge.AUTHORIZATION_RESPONSE,
        payload: { legacySaleId: e, request: s },
        response: n,
        status: n.status
      }), {
        success: !0,
        saleId: e,
        fiscal: {
          status: n.status,
          accessKey: n.accessKey,
          protocol: n.protocol,
          receiptNumber: n.receiptNumber,
          qrCodeUrl: n.qrCodeUrl,
          authorizedAt: n.authorizedAt,
          statusCode: n.statusCode,
          statusMessage: n.statusMessage,
          documentId: (r == null ? void 0 : r.id) ?? null,
          provider: n.provider
        }
      };
    } catch (a) {
      const s = V(a, "ISSUE_FISCAL_SALE_FAILED"), n = Ue.findBySaleId(e);
      return n && He.create({
        fiscalDocumentId: n.id,
        eventType: Ge.AUTHORIZATION_RESPONSE,
        payload: { legacySaleId: e },
        response: {
          status: "ERROR",
          statusCode: s.code,
          statusMessage: s.message
        },
        status: at.ERROR
      }), {
        success: !1,
        saleId: e,
        fiscal: {
          status: "ERROR",
          statusCode: s.code,
          statusMessage: s.message,
          documentId: (n == null ? void 0 : n.id) ?? null
        }
      };
    }
  }
}
const $n = new Xn();
function gt(t) {
  return {
    id: Number(t.id),
    documentType: t.document_type,
    referenceType: t.reference_type,
    referenceId: Number(t.reference_id),
    saleId: t.sale_id === null ? null : Number(t.sale_id),
    cashSessionId: t.cash_session_id === null ? null : Number(t.cash_session_id),
    printerId: t.printer_id === null ? null : Number(t.printer_id),
    title: t.title,
    status: t.status,
    templateVersion: t.template_version,
    payloadJson: t.payload_json,
    contentHtml: t.content_html,
    printCount: Number(t.print_count ?? 0),
    lastPrintedAt: t.last_printed_at ?? null,
    lastError: t.last_error ?? null,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
function It(t) {
  return {
    id: Number(t.id),
    printedDocumentId: Number(t.printed_document_id),
    printerId: t.printer_id === null ? null : Number(t.printer_id),
    triggerSource: t.trigger_source,
    status: t.status,
    errorMessage: t.error_message ?? null,
    copies: Number(t.copies ?? 1),
    attemptedAt: t.attempted_at,
    completedAt: t.completed_at ?? null
  };
}
function Bn(t) {
  return {
    "01": "Dinheiro",
    "02": "Cheque",
    "03": "Cartao de Credito",
    "04": "Cartao de Debito",
    10: "Vale Alimentacao",
    11: "Vale Refeicao",
    12: "Vale Presente",
    13: "Vale Combustivel",
    15: "Boleto",
    17: "PIX",
    99: "Outros"
  }[t] ?? `Pagamento ${t}`;
}
function kn(t) {
  const e = [
    t.endereco,
    t.numero,
    t.bairro,
    t.cidade,
    t.uf,
    t.cep
  ].filter(Boolean);
  return e.length > 0 ? e.join(" - ") : null;
}
class Gn {
  mapPrinter(e) {
    return {
      id: Number(e.id),
      name: e.name,
      display_name: e.display_name ?? null,
      brand: e.brand ?? null,
      model: e.model ?? null,
      connection_type: e.connection_type ?? null,
      driver_name: e.driver_name ?? null,
      driver_version: e.driver_version ?? null,
      photo_path: e.photo_path ?? null,
      notes: e.notes ?? null,
      is_default: Number(e.is_default ?? 0),
      installed_at: e.installed_at ?? null,
      paper_width_mm: Number(e.paper_width_mm ?? 80),
      content_width_mm: Number(e.content_width_mm ?? 76),
      base_font_size_px: Number(e.base_font_size_px ?? 13),
      line_height: Number(e.line_height ?? 1.5),
      receipt_settings_json: e.receipt_settings_json ?? null
    };
  }
  findByReference(e, a, s) {
    const n = o.prepare(`
      SELECT *
      FROM printed_documents
      WHERE document_type = ?
        AND reference_type = ?
        AND reference_id = ?
      LIMIT 1
    `).get(e, a, s);
    return n ? gt(n) : null;
  }
  findById(e) {
    const a = o.prepare(`
      SELECT *
      FROM printed_documents
      WHERE id = ?
      LIMIT 1
    `).get(e);
    return a ? gt(a) : null;
  }
  upsertDocument(e) {
    const a = this.findByReference(e.documentType, e.referenceType, e.referenceId);
    if (a)
      return o.prepare(`
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
        e.saleId ?? null,
        e.cashSessionId ?? null,
        e.printerId ?? null,
        e.title,
        e.status,
        e.templateVersion,
        e.payloadJson,
        e.contentHtml,
        e.lastError ?? null,
        a.id
      ), this.findById(a.id);
    const s = o.prepare(`
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
      e.documentType,
      e.referenceType,
      e.referenceId,
      e.saleId ?? null,
      e.cashSessionId ?? null,
      e.printerId ?? null,
      e.title,
      e.status,
      e.templateVersion,
      e.payloadJson,
      e.contentHtml,
      e.lastError ?? null
    );
    return this.findById(Number(s.lastInsertRowid));
  }
  markDocumentPrinted(e, a) {
    o.prepare(`
      UPDATE printed_documents
      SET
        status = 'PRINTED',
        printer_id = ?,
        print_count = print_count + 1,
        last_printed_at = datetime('now'),
        last_error = NULL,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(a, e);
  }
  markDocumentFailed(e, a, s, n) {
    o.prepare(`
      UPDATE printed_documents
      SET
        status = ?,
        printer_id = ?,
        last_error = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(a, n, s, e);
  }
  createPrintJob(e) {
    const a = o.prepare(`
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
      e.printedDocumentId,
      e.printerId ?? null,
      e.triggerSource,
      e.status,
      e.errorMessage ?? null,
      e.copies ?? 1
    ), s = o.prepare(`
      SELECT *
      FROM print_jobs
      WHERE id = ?
      LIMIT 1
    `).get(a.lastInsertRowid);
    return It(s);
  }
  listDocumentJobs(e) {
    return o.prepare(`
      SELECT *
      FROM print_jobs
      WHERE printed_document_id = ?
      ORDER BY id DESC
    `).all(e).map(It);
  }
  getDefaultPrinter() {
    const e = o.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE is_default = 1
      LIMIT 1
    `).get();
    return e ? this.mapPrinter(e) : null;
  }
  findPrinterById(e) {
    const a = o.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE id = ?
      LIMIT 1
    `).get(e);
    return a ? this.mapPrinter(a) : null;
  }
  buildTestSaleReceiptData(e, a) {
    var n;
    const s = a.templateMode === "custom" ? ((n = a.headerTitle) == null ? void 0 : n.trim()) || e.display_name || "Galberto PDV" : e.display_name || "Galberto PDV";
    return {
      saleId: 999999,
      emittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      movedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "FINALIZADA",
      storeName: s,
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
  appendPrinterLog(e, a) {
    o.prepare(`
      INSERT INTO printer_logs (printer_id, message)
      VALUES (?, ?)
    `).run(e, a);
  }
  loadSaleReceiptData(e) {
    const a = o.prepare(`
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
    `).get(e);
    if (!a)
      throw new Error(`Venda não encontrada para impressão: ${e}`);
    const s = o.prepare(`
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
    `).all(e), n = o.prepare(`
      SELECT
        tpag,
        valor,
        valor_recebido,
        troco
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id
    `).all(e), r = o.prepare(`
      SELECT fd.status, fd.access_key, fd.protocol, fd.authorization_datetime, fd.qr_code_url
      FROM fiscal_documents fd
      INNER JOIN sales s ON s.id = fd.sale_id
      WHERE s.external_reference = ?
      ORDER BY fd.id DESC
      LIMIT 1
    `).get(`legacy-sale:${e}`);
    return {
      saleId: Number(a.id),
      emittedAt: a.data_emissao,
      movedAt: a.data_movimento ?? null,
      status: a.status,
      storeName: a.nome_fantasia ?? a.razao_social ?? "Galberto PDV",
      storeLegalName: a.razao_social ?? null,
      storeDocument: a.cnpj ?? null,
      storeAddress: kn(a),
      operatorName: a.operator_name ?? null,
      operatorId: a.operator_id === null ? null : String(a.operator_id),
      pdvId: a.pdv_id ?? null,
      customerName: a.cliente_nome ?? null,
      customerDocument: a.cpf_cliente ?? null,
      items: s.map((i) => ({
        productId: String(i.produto_id),
        code: i.codigo_produto ?? null,
        description: i.nome_produto,
        quantity: Number(i.quantidade_comercial ?? 0),
        unitPrice: Number(i.valor_unitario_comercial ?? 0),
        grossAmount: Number(i.valor_bruto ?? 0),
        discountAmount: Number(i.valor_desconto ?? 0),
        totalAmount: Number(i.subtotal ?? 0)
      })),
      payments: n.map((i) => ({
        paymentCode: i.tpag,
        paymentLabel: Bn(i.tpag),
        amount: Number(i.valor ?? 0),
        receivedAmount: Number(i.valor_recebido ?? i.valor ?? 0),
        changeAmount: Number(i.troco ?? 0)
      })),
      subtotalAmount: Number(a.valor_produtos ?? 0),
      discountAmount: Number(a.valor_desconto ?? 0),
      totalAmount: Number(a.valor_total ?? 0),
      changeAmount: Number(a.valor_troco ?? 0),
      notes: a.observacao ?? null,
      fiscal: r ? {
        status: r.status ?? null,
        accessKey: r.access_key ?? null,
        protocol: r.protocol ?? null,
        statusMessage: r.status ?? null,
        authorizationDatetime: r.authorization_datetime ?? null,
        qrCodeUrl: r.qr_code_url ?? null
      } : null
    };
  }
  loadCashReceiptData(e, a) {
    const s = o.prepare(`
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
    `).get(e);
    if (!s)
      throw new Error(`Sessão de caixa não encontrada para impressão: ${e}`);
    return {
      cashSessionId: Number(s.id),
      documentType: a,
      operatorName: s.operator_name ?? null,
      operatorId: s.operator_id === null ? null : String(s.operator_id),
      pdvId: s.pdv_id,
      openingAmount: Number(s.opening_cash_amount ?? 0),
      closingAmount: s.closing_cash_amount === null ? null : Number(s.closing_cash_amount),
      expectedAmount: s.expected_cash_amount === null ? null : Number(s.expected_cash_amount),
      differenceAmount: s.closing_difference === null ? null : Number(s.closing_difference),
      totalSalesCash: Number(s.total_vendas_dinheiro ?? 0),
      totalWithdrawals: Number(s.total_sangrias ?? 0),
      openedAt: s.opened_at,
      closedAt: s.closed_at ?? null,
      openingNotes: s.opening_notes ?? null,
      closingNotes: s.closing_notes ?? null
    };
  }
  hasPrintedDocumentForSale(e) {
    const a = o.prepare(`
      SELECT COUNT(*) AS total
      FROM printed_documents
      WHERE sale_id = ?
        AND document_type = 'SALE_RECEIPT'
    `).get(e);
    return Number(a.total ?? 0) > 0;
  }
  logInfo(e) {
    f.info(`[printing] ${e}`);
  }
}
const R = new Gn();
class Hn {
  async printHtml(e) {
    const a = Number(e.paperWidthMm ?? 80), s = Math.max(360, Math.round(a / 25.4 * 96) + 48), n = new O({
      show: !1,
      width: s,
      height: 1280,
      webPreferences: {
        sandbox: !0
      }
    });
    try {
      const r = `data:text/html;charset=utf-8,${encodeURIComponent(e.html)}`;
      await n.loadURL(r), await new Promise((i, c) => {
        n.webContents.print(
          {
            silent: !0,
            printBackground: !0,
            deviceName: e.printerName,
            margins: {
              marginType: "none"
            }
          },
          (d, l) => {
            if (!d) {
              c(new Error(l || "Falha desconhecida na impressão."));
              return;
            }
            i();
          }
        );
      });
    } catch (r) {
      throw f.error(`[printing] erro ao imprimir "${e.title}": ${r instanceof Error ? r.message : String(r)}`), r;
    } finally {
      n.isDestroyed() || n.destroy();
    }
  }
}
const At = new Hn();
function I(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function y(t) {
  return t.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function je(t) {
  if (!t) return "—";
  const e = new Date(t);
  return Number.isNaN(e.getTime()) ? t : e.toLocaleString("pt-BR");
}
function jn(t) {
  if (!(t != null && t.receipt_settings_json)) return {};
  try {
    return JSON.parse(t.receipt_settings_json);
  } catch {
    return {};
  }
}
function Vn(t) {
  return t.templateMode === "custom";
}
function zn(t) {
  return {
    paperWidthMm: Number((t == null ? void 0 : t.paper_width_mm) ?? 80),
    contentWidthMm: Number((t == null ? void 0 : t.content_width_mm) ?? 76),
    baseFontSizePx: Number((t == null ? void 0 : t.base_font_size_px) ?? 14),
    lineHeight: Number((t == null ? void 0 : t.line_height) ?? 1.55)
  };
}
function Lt(t, e, a) {
  const s = zn(a), n = Math.max((s.paperWidthMm - s.contentWidthMm) / 2, 0);
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${I(t)}</title>
    <style>
      @page {
        size: ${s.paperWidthMm}mm auto;
        margin: 0;
      }

      html, body {
        margin: 0;
        padding: 0;
        width: ${s.paperWidthMm}mm;
        font-family: "Courier New", monospace;
        color: #000000;
        background: #ffffff;
        font-size: ${s.baseFontSizePx}px;
        line-height: ${s.lineHeight};
        font-weight: 600;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        text-rendering: geometricPrecision;
      }

      body {
        box-sizing: border-box;
        padding: 1.2mm ${n}mm 0.8mm;
      }

      .receipt {
        box-sizing: border-box;
        width: ${s.contentWidthMm}mm;
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
        font-size: ${Math.max(s.baseFontSizePx - 2, 10)}px;
        color: #000000;
      }
    </style>
  </head>
  <body><div class="receipt">${e}</div></body>
</html>`;
}
class Yn {
  renderSaleReceipt(e, a) {
    var d, l;
    const s = jn(a), n = Vn(s), r = e.items.map((E) => `
      <div class="item">
        <div class="item-name">${I(E.description)}</div>
        <div class="item-meta">
          <span>${E.quantity.toFixed(3).replace(".", ",")} x ${y(E.unitPrice)}</span>
          <span class="strong">${y(E.totalAmount)}</span>
        </div>
        ${E.discountAmount > 0 ? `<div class="muted">Desconto: ${y(E.discountAmount)}</div>` : ""}
        ${(!n || s.showItemCodes !== !1) && E.code ? `<div class="muted">Cod.: ${I(E.code)}</div>` : ""}
      </div>
    `).join(""), i = e.payments.map((E) => `
      <div class="row">
        <span class="label">${I(E.paymentLabel)}</span>
        <span class="value">${y(E.amount)}</span>
      </div>
    `).join(""), c = `
      <div class="center">
        ${n && s.showLogo && s.logoPath ? `<div class="footer-note">LOGO: ${I(s.logoPath)}</div>` : ""}
        <div class="strong">${I(n && ((d = s.headerTitle) == null ? void 0 : d.trim()) || e.storeName)}</div>
        ${(!n || s.showLegalName !== !1) && e.storeLegalName && e.storeLegalName !== e.storeName ? `<div>${I(e.storeLegalName)}</div>` : ""}
        ${(!n || s.showDocument !== !1) && e.storeDocument ? `<div>CNPJ: ${I(e.storeDocument)}</div>` : ""}
        ${(!n || s.showAddress !== !1) && e.storeAddress ? `<div>${I(e.storeAddress)}</div>` : ""}
        ${n && s.headerMessage ? `<div class="footer-note">${I(s.headerMessage)}</div>` : ""}
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Venda</span><span class="value">#${e.saleId}</span></div>
      <div class="row"><span class="label">Data/Hora</span><span class="value">${I(je(e.movedAt ?? e.emittedAt))}</span></div>
      ${!n || s.showOperator !== !1 ? `<div class="row"><span class="label">Operador</span><span class="value">${I(e.operatorName ?? "Não informado")}</span></div>` : ""}
      <div class="row"><span class="label">PDV</span><span class="value">${I(e.pdvId ?? "—")}</span></div>
      ${!n || s.showCustomer !== !1 ? `<div class="row"><span class="label">Cliente</span><span class="value">${I(e.customerName ?? "Consumidor final")}</span></div>` : ""}
      ${(!n || s.showCustomer !== !1) && e.customerDocument ? `<div class="row"><span class="label">Documento</span><span class="value">${I(e.customerDocument)}</span></div>` : ""}

      <div class="separator"></div>
      ${r}
      <div class="separator"></div>

      <div class="row"><span class="label">Subtotal</span><span class="value">${y(e.subtotalAmount)}</span></div>
      ${e.discountAmount > 0 ? `<div class="row"><span class="label">Descontos</span><span class="value">${y(e.discountAmount)}</span></div>` : ""}
      <div class="row"><span class="label strong">TOTAL</span><span class="value">${y(e.totalAmount)}</span></div>
      ${e.changeAmount > 0 ? `<div class="row"><span class="label">Troco</span><span class="value">${y(e.changeAmount)}</span></div>` : ""}

      ${!n || s.showPaymentBreakdown !== !1 ? `
        <div class="separator"></div>
        <div class="strong">Pagamentos</div>
        ${i}
      ` : ""}

      ${(!n || s.showFiscalSection !== !1) && e.fiscal ? `
        <div class="separator"></div>
        <div class="strong">Situação fiscal</div>
        <div class="row"><span class="label">Status</span><span class="value">${I(e.fiscal.status ?? "—")}</span></div>
        ${e.fiscal.protocol ? `<div class="row"><span class="label">Protocolo</span><span class="value">${I(e.fiscal.protocol)}</span></div>` : ""}
        ${e.fiscal.accessKey ? `<div class="footer-note mono">Chave: ${I(e.fiscal.accessKey)}</div>` : ""}
      ` : ""}

      ${e.notes ? `<div class="footer-note">Obs.: ${I(e.notes)}</div>` : ""}
      ${n && s.footerMessage ? `<div class="footer-note">${I(s.footerMessage)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        ${I(n && ((l = s.thankYouMessage) == null ? void 0 : l.trim()) || "Documento impresso pelo Galberto PDV")}<br />
        Guarde este comprovante para conferência.
      </div>
    `;
    return Lt(`Cupom de venda #${e.saleId}`, c, a);
  }
  renderCashReceipt(e, a) {
    const s = e.documentType === "CASH_CLOSING_RECEIPT", n = s ? "Comprovante de Fechamento de Caixa" : "Comprovante de Abertura de Caixa", r = `
      <div class="center">
        <div class="strong">${I(n)}</div>
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Sessão</span><span class="value">#${e.cashSessionId}</span></div>
      <div class="row"><span class="label">Operador</span><span class="value">${I(e.operatorName ?? "Não informado")}</span></div>
      <div class="row"><span class="label">PDV</span><span class="value">${I(e.pdvId)}</span></div>
      <div class="row"><span class="label">Aberto em</span><span class="value">${I(je(e.openedAt))}</span></div>
      ${s ? `<div class="row"><span class="label">Fechado em</span><span class="value">${I(je(e.closedAt))}</span></div>` : ""}

      <div class="separator"></div>

      <div class="row"><span class="label">Fundo inicial</span><span class="value">${y(e.openingAmount)}</span></div>
      ${s ? `
        <div class="row"><span class="label">Vendas em dinheiro</span><span class="value">${y(e.totalSalesCash)}</span></div>
        <div class="row"><span class="label">Sangrias</span><span class="value">${y(e.totalWithdrawals)}</span></div>
        <div class="row"><span class="label">Valor esperado</span><span class="value">${y(e.expectedAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Valor contado</span><span class="value">${y(e.closingAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Diferença</span><span class="value">${y(e.differenceAmount ?? 0)}</span></div>
      ` : ""}

      ${e.openingNotes ? `<div class="footer-note">Obs. abertura: ${I(e.openingNotes)}</div>` : ""}
      ${s && e.closingNotes ? `<div class="footer-note">Obs. fechamento: ${I(e.closingNotes)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        Documento impresso pelo Galberto PDV<br />
        Conferência operacional de caixa.
      </div>
    `;
    return Lt(n, r, a);
  }
  renderFromStoredDocument(e) {
    return e.contentHtml;
  }
}
const _e = new Yn();
function Ve(t, e, a) {
  const n = {
    SALE_RECEIPT: "cupom da venda",
    CASH_OPENING_RECEIPT: "comprovante de abertura de caixa",
    CASH_CLOSING_RECEIPT: "comprovante de fechamento de caixa"
  }[t];
  return e === "printed" ? `${n} impresso${a ? ` em ${a}` : ""}.` : e === "skipped" ? `Nenhuma impressora padrão configurada para imprimir o ${n}.` : `Falha ao imprimir o ${n}.`;
}
class Wn {
  async printTestReceipt(e) {
    const a = R.findPrinterById(e);
    if (!a)
      return {
        success: !1,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: "Impressora não encontrada para teste.",
        jobId: 0,
        reprint: !1
      };
    const s = R.buildTestSaleReceiptData(a, {}), n = _e.renderSaleReceipt(s, a);
    try {
      return await At.printHtml({
        html: n,
        printerName: a.name,
        title: `Teste ${a.display_name ?? a.name}`,
        paperWidthMm: a.paper_width_mm
      }), R.appendPrinterLog(a.id, "Impressão de teste enviada."), {
        success: !0,
        status: "SUCCESS",
        documentId: 0,
        printerId: a.id,
        printerName: a.display_name ?? a.name,
        message: `Teste de impressão enviado para ${a.display_name ?? a.name}.`,
        jobId: 0,
        reprint: !1
      };
    } catch (r) {
      const i = r instanceof Error ? r.message : "Falha desconhecida na impressão de teste.";
      return R.appendPrinterLog(a.id, `Teste de impressão falhou: ${i}`), {
        success: !1,
        status: "FAILED",
        documentId: 0,
        printerId: a.id,
        printerName: a.display_name ?? a.name,
        message: i,
        jobId: 0,
        reprint: !1
      };
    }
  }
  async printSaleReceipt(e, a) {
    const s = R.loadSaleReceiptData(e), n = R.getDefaultPrinter(), r = {
      ...s,
      fiscal: a.fiscal ?? s.fiscal
    }, i = `Cupom de venda #${e}`, c = _e.renderSaleReceipt(r, n), d = R.upsertDocument({
      documentType: "SALE_RECEIPT",
      referenceType: "SALE",
      referenceId: e,
      saleId: e,
      title: i,
      status: "PENDING",
      templateVersion: "thermal-v1",
      payloadJson: JSON.stringify(r),
      contentHtml: c,
      lastError: null
    });
    return this.dispatchToPrinter(d, a.triggerSource, !1);
  }
  async printCashOpeningReceipt(e, a) {
    const s = R.loadCashReceiptData(e, "CASH_OPENING_RECEIPT");
    return this.printCashReceipt(s, a, !1);
  }
  async printCashClosingReceipt(e, a) {
    const s = R.loadCashReceiptData(e, "CASH_CLOSING_RECEIPT");
    return this.printCashReceipt(s, a, !1);
  }
  async reprintSaleReceipt(e) {
    let a = R.findByReference("SALE_RECEIPT", "SALE", e);
    if (!a)
      return this.printSaleReceipt(e, { triggerSource: "MANUAL" });
    const s = R.getDefaultPrinter();
    try {
      const n = JSON.parse(a.payloadJson);
      a = R.upsertDocument({
        documentType: a.documentType,
        referenceType: a.referenceType,
        referenceId: a.referenceId,
        saleId: a.saleId,
        cashSessionId: a.cashSessionId,
        printerId: (s == null ? void 0 : s.id) ?? a.printerId,
        title: a.title,
        status: a.status,
        templateVersion: a.templateVersion,
        payloadJson: a.payloadJson,
        contentHtml: _e.renderSaleReceipt(n, s),
        lastError: a.lastError
      });
    } catch {
      a = R.upsertDocument({
        documentType: a.documentType,
        referenceType: a.referenceType,
        referenceId: a.referenceId,
        saleId: a.saleId,
        cashSessionId: a.cashSessionId,
        printerId: (s == null ? void 0 : s.id) ?? a.printerId,
        title: a.title,
        status: a.status,
        templateVersion: a.templateVersion,
        payloadJson: a.payloadJson,
        contentHtml: a.contentHtml,
        lastError: a.lastError
      });
    }
    return this.dispatchToPrinter(a, "MANUAL", !0);
  }
  async printCashReceipt(e, a, s) {
    const n = R.getDefaultPrinter(), r = e.documentType === "CASH_OPENING_RECEIPT" ? `Abertura de caixa #${e.cashSessionId}` : `Fechamento de caixa #${e.cashSessionId}`, i = _e.renderCashReceipt(e, n), c = R.upsertDocument({
      documentType: e.documentType,
      referenceType: "CASH_SESSION",
      referenceId: e.cashSessionId,
      cashSessionId: e.cashSessionId,
      title: r,
      status: "PENDING",
      templateVersion: "thermal-v1",
      payloadJson: JSON.stringify(e),
      contentHtml: i,
      lastError: null
    });
    return this.dispatchToPrinter(c, a, s);
  }
  async dispatchToPrinter(e, a, s) {
    const n = R.getDefaultPrinter();
    if (!n) {
      R.markDocumentFailed(e.id, "PENDING", "Nenhuma impressora padrão configurada.", null);
      const r = R.createPrintJob({
        printedDocumentId: e.id,
        printerId: null,
        triggerSource: a,
        status: "SKIPPED",
        errorMessage: "Nenhuma impressora padrão configurada."
      });
      return {
        success: !1,
        status: "SKIPPED",
        documentId: e.id,
        printerId: null,
        printerName: null,
        message: Ve(e.documentType, "skipped"),
        jobId: r.id,
        reprint: s
      };
    }
    try {
      await At.printHtml({
        html: _e.renderFromStoredDocument(e),
        printerName: n.name,
        title: e.title,
        paperWidthMm: n.paper_width_mm
      }), R.markDocumentPrinted(e.id, n.id), R.appendPrinterLog(n.id, `${e.title} enviado para impressão.`);
      const r = R.createPrintJob({
        printedDocumentId: e.id,
        printerId: n.id,
        triggerSource: a,
        status: "SUCCESS"
      });
      return {
        success: !0,
        status: "SUCCESS",
        documentId: e.id,
        printerId: n.id,
        printerName: n.display_name ?? n.name,
        message: Ve(e.documentType, "printed", n.display_name ?? n.name),
        jobId: r.id,
        reprint: s
      };
    } catch (r) {
      const i = r instanceof Error ? r.message : "Falha desconhecida na impressão.";
      R.markDocumentFailed(e.id, "FAILED", i, n.id), R.appendPrinterLog(n.id, `${e.title} falhou: ${i}`);
      const c = R.createPrintJob({
        printedDocumentId: e.id,
        printerId: n.id,
        triggerSource: a,
        status: "FAILED",
        errorMessage: i
      });
      return {
        success: !1,
        status: "FAILED",
        documentId: e.id,
        printerId: n.id,
        printerName: n.display_name ?? n.name,
        message: `${Ve(e.documentType, "failed")} ${i}`,
        jobId: c.id,
        reprint: s
      };
    }
  }
}
const he = new Wn();
function Kn(t) {
  const e = Number((t == null ? void 0 : t.valorDesconto) ?? (t == null ? void 0 : t.valor_desconto) ?? 0), a = Array.isArray(t == null ? void 0 : t.itens) ? t.itens.some((s) => Number((s == null ? void 0 : s.valor_desconto) ?? (s == null ? void 0 : s.valorDesconto) ?? 0) > 0) : !1;
  return e > 0 || a;
}
function ze(t) {
  if (Kn(t) && !de("discounts:apply"))
    throw new Error("Somente gerente ou administrador pode conceder descontos.");
}
function qn() {
  u.handle("vendas:finalizar-com-baixa-estoque", async (t, e) => {
    ze(e), _s(e);
    const a = typeof e == "number" ? e : e.vendaId, s = await $n.execute(a);
    let n;
    try {
      n = await he.printSaleReceipt(a, {
        triggerSource: "AUTO",
        fiscal: s.fiscal ?? null
      });
    } catch (r) {
      n = {
        success: !1,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: r instanceof Error ? r.message : "Falha ao imprimir o cupom da venda.",
        jobId: 0,
        reprint: !1
      };
    }
    return {
      success: !0,
      vendaId: a,
      fiscal: s.fiscal,
      print: n
    };
  }), u.handle("vendas:get", (t, e) => gs(e)), u.handle("vendas:cancelar", (t, e) => ms(e)), u.handle("vendas:buscarPorId", (t, e) => Is(e)), u.handle("vendas:finalizada-pendente-pagamento", (t, e) => (ze(e), ct(e, "ABERTA_PAGAMENTO", (e == null ? void 0 : e.id) ?? null))), u.handle("vendas:pausar", (t, e) => (ze(e), ct(e, "PAUSADA", (e == null ? void 0 : e.id) ?? null)));
}
let ne = null, re = null, oe = null, ie = null, k = null, ce = null, Q = null, J = null;
const H = import.meta.dirname;
process.env.APP_ROOT = g.join(H, "..");
function Qn() {
  u.handle("app:open-external-url", async (d, l) => (await vt.openExternal(l), !0)), u.on("window:open:sales-search", () => {
    if (Q && !Q.isDestroyed()) {
      Q.focus();
      return;
    }
    t();
  });
  function t() {
    Q = new O({
      title: "Vendas",
      width: 600,
      height: 530,
      center: !0,
      maximizable: !1,
      webPreferences: {
        preload: g.join(H, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), Q.maximize(), h ? Q.loadURL(`${h}#/sales/search`) : Q.loadFile(g.join("dist/index.html"));
  }
  function e() {
    J = new O({
      title: "Galberto PDV",
      width: 1280,
      height: 820,
      center: !0,
      maximizable: !0,
      webPreferences: {
        preload: g.join(H, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), J.maximize(), h ? J.loadURL(`${h}#/pdv`) : J.loadFile(g.join("dist/index.html"));
  }
  function a(d) {
    ne = new O({
      width: 764,
      height: 717,
      title: `Venda #${d}`,
      maximizable: !1,
      webPreferences: {
        preload: g.join(H, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), h ? ne.loadURL(`${h}#/vendas/${d}`) : ne.loadFile(g.join("dist/index.html"));
  }
  function s() {
    k = new O({
      title: "Search Product",
      maximizable: !0,
      webPreferences: {
        preload: g.join(H, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), h ? k.loadURL(`${h}#/pdv/products/search`) : k.loadFile(g.join("dist/index.html"), {
      hash: "/pdv/products/search"
    });
  }
  function n(d) {
    re = new O({
      width: 764,
      height: 717,
      title: `Usuario #${d}`,
      maximizable: !1,
      webPreferences: {
        preload: g.join(H, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), h ? re.loadURL(`${h}#/config/usuarios/${d}`) : re.loadFile(g.join("dist/index.html"));
  }
  function r() {
    ce = new O({
      width: 764,
      height: 717,
      title: "Config PDV",
      maximizable: !1,
      webPreferences: {
        preload: g.join(H, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), h ? ce.loadURL(`${h}#/pdv/config/app`) : ce.loadFile(g.join("dist/index.html"), {
      hash: "/pdv/config/app"
    });
  }
  u.on("open-search-sales-window", () => {
    if (k && !k.isDestroyed()) {
      k.focus();
      return;
    }
    t();
  }), u.on("window:open:config", () => {
    if (de("config:access")) {
      if (ce && !ce.isDestroyed()) {
        ce.focus();
        return;
      }
      r();
    }
  }), u.on("window:open:pdv", () => {
    if (de("pdv:access")) {
      if (J && !J.isDestroyed()) {
        J.focus();
        return;
      }
      e();
    }
  }), u.on("window:open:products-search", () => {
    if (k && !k.isDestroyed()) {
      k.focus();
      return;
    }
    s();
  }), u.on("vendas:criar-janela-ver-vendas", (d, l) => {
    if (ne && !ne.isDestroyed()) {
      ne.focus();
      return;
    }
    a(l);
  }), u.on("usuarios:criar-janela-ver-usuario", (d, l) => {
    if (de("users:manage")) {
      if (re && !re.isDestroyed()) {
        re.focus();
        return;
      }
      n(l);
    }
  }), u.on("window:open:create-user", () => {
    if (de("users:manage")) {
      if (oe && !oe.isDestroyed()) {
        oe.focus();
        return;
      }
      i();
    }
  }), u.on("window:open:edit-user", (d, l) => {
    if (de("users:manage")) {
      if (ie && !ie.isDestroyed()) {
        ie.focus();
        return;
      }
      c(l);
    }
  });
  function i() {
    oe = new O({
      width: 764,
      height: 717,
      title: "Cadastrar Usuario",
      maximizable: !1,
      webPreferences: {
        preload: g.join(H, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), h ? oe.loadURL(`${h}#/config/usuarios/cadastrar_usuario`) : oe.loadFile(g.join("dist/index.html"));
  }
  function c(d) {
    ie = new O({
      width: 764,
      height: 717,
      title: "Editar Usuario",
      maximizable: !1,
      webPreferences: {
        preload: g.join(H, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), h ? ie.loadURL(`${h}#/config/users/edit_user/${d}`) : ie.loadFile(g.join("dist/index.html"));
  }
}
function Jn() {
  u.handle("produtos:get", (t, e) => As(e)), u.handle("get-products-by-id", (t, e) => {
    if (!e) throw new Error("ID inválido");
    return Ls(e);
  }), u.handle("produtos:buscar-por-nome", (t, e) => {
    if (!e) throw new Error("Nome Invalido");
    return Rs(e);
  }), u.handle("produtos:buscar-por-codigo-de-barras", (t, e) => {
    if (!e) throw new Error("Codigo de Barras invalido");
    return hs(e);
  }), u.handle("suggest-product-by-term", (t, e) => Ss(e));
}
function Zn() {
  u.handle("printer:buscar-impressoras", async () => (m("printers:manage"), O.getAllWindows()[0].webContents.getPrintersAsync())), u.handle("printer:add-impressora", (t, e) => (m("printers:manage"), Cs(e))), u.handle("printer:listar-cadastradas", () => (m("printers:manage"), vs())), u.handle("printer:get-padrao", () => Os()), u.handle("printer:remover", (t, e) => (m("printers:manage"), Ds(e))), u.handle("printer:definir-padrao", (t, e) => (m("printers:manage"), bs(e))), u.handle("printer:atualizar-layout", (t, e, a) => (m("printers:manage"), ys(e, a))), u.handle("printer:atualizar-personalizacao", (t, e, a) => (m("printers:manage"), Us(e, a))), u.handle("printer:test-print", (t, e) => (m("printers:manage"), he.printTestReceipt(e))), u.handle("printer:reprint-sale-receipt", (t, e) => (m("sales:view"), he.reprintSaleReceipt(e)));
}
function jt(t) {
  o.prepare(`
    UPDATE sessions
    SET active = 0,
        logout_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(t);
}
function er() {
  u.handle("auth:login", (t, e, a) => {
    const s = Ca(e, a);
    return _t(s.sessionId), s;
  }), u.handle("auth:buscar-usuario", (t, e) => {
    if (!e) throw new Error("ID inválido");
    return m("users:manage"), Ms(e);
  }), u.handle("app:logoff-with-confirm", async () => {
    f.info("Logoff solicitado pelo usuario");
    const { response: t } = await Ot.showMessageBox({
      type: "question",
      buttons: ["cancelar", "sair"],
      defaultId: 1,
      cancelId: 0,
      message: "Tem certeza que deseja encerrar sessao?"
    });
    if (t === 1) {
      const e = nt();
      return e && (jt(e), _t(null)), f.info("logoff aprovado pelo usuario"), !0;
    }
    return !1;
  });
}
function tr() {
  u.handle("salvar-foto-usuario", async (t, e) => {
    m("users:manage");
    const a = X.getPath("userData"), s = g.join(a, "fotos");
    Fe.existsSync(s) || Fe.mkdirSync(s);
    const n = g.extname(e.nomeArquivo || ""), r = g.basename(e.nomeArquivo || "foto", n).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40), i = g.join(s, `${Date.now()}-${r}${n}`);
    return Fe.writeFileSync(i, Buffer.from(e.buffer)), i;
  }), u.handle("update-user", (t, e) => (m("users:manage"), $s(e))), u.handle("disable-user", (t, e) => (m("users:manage"), Bs(e))), u.handle("enable-user", (t, e) => (m("users:manage"), ks(e))), u.handle("user:update-password", (t, e, a) => (m("users:manage"), ws(e, a))), u.handle("get-users", (t, e) => (m("users:manage"), xs(e))), u.handle("usuarios:add", (t, e) => (m("users:manage"), Ps(e))), u.handle("delete-user", (t, e) => (m("users:manage"), Xs(e)));
}
function ar() {
  u.handle("open-cash-session", async (t, e) => {
    console.log("Abrindo caixa com dados: ", e);
    const a = ps(e);
    let s;
    try {
      s = await he.printCashOpeningReceipt(a.id, "AUTO");
    } catch (n) {
      s = {
        success: !1,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: n instanceof Error ? n.message : "Falha ao imprimir comprovante de abertura de caixa.",
        jobId: 0,
        reprint: !1
      };
    }
    return { session: a, print: s };
  }), u.handle("close-cash-session", async (t, e) => {
    console.log("Fechando caixa com dados: ", e);
    const a = fs(e);
    let s;
    try {
      s = await he.printCashClosingReceipt(a.id, "AUTO");
    } catch (n) {
      s = {
        success: !1,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: n instanceof Error ? n.message : "Falha ao imprimir comprovante de fechamento de caixa.",
        jobId: 0,
        reprint: !1
      };
    }
    return { session: a, print: s };
  }), u.handle("get-open-cash-session", async (t, e) => Gs(e)), u.handle("register-cash-withdrawal", async (t, e) => (m("cash:withdraw"), Ns(e))), u.on("pdv:selecionar-produto", (t, e) => {
    for (const a of O.getAllWindows())
      a.webContents.send("pdv:produto-selecionado", e);
  }), u.on("pdv:retomar-venda", (t, e) => {
    for (const a of O.getAllWindows())
      a.webContents.send("pdv:venda-retomada", e);
  });
}
function sr(t = 32) {
  return Ut.randomBytes(t).toString("hex");
}
function Ye(t, e) {
  return Buffer.from(`${t}:${e}`, "utf8").toString("base64");
}
class nr {
  getByIntegrationId(e) {
    const s = o.prepare(`
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
    `).get(e);
    return s ? {
      integrationId: s.integration_id,
      accessToken: s.access_token,
      refreshToken: s.refresh_token,
      tokenType: s.token_type ?? "Bearer",
      expiresAt: s.expires_at,
      scope: s.scope,
      raw: s.raw_json ? JSON.parse(s.raw_json) : null,
      updatedAt: s.updated_at
    } : null;
  }
  save(e) {
    o.prepare(`
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
    `).run(
      e.integrationId,
      e.accessToken,
      e.refreshToken,
      e.tokenType,
      e.expiresAt,
      e.scope ?? null,
      e.raw ? JSON.stringify(e.raw) : null,
      e.updatedAt
    );
  }
  delete(e) {
    o.prepare(`
      DELETE FROM integrations
      WHERE integration_id = ?
    `).run(e);
  }
  isConnected(e) {
    return !!o.prepare(`
      SELECT 1
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(e);
  }
}
const Z = new nr(), rr = "https://www.bling.com.br/Api/v3/oauth/authorize", Rt = "https://api.bling.com.br/Api/v3/oauth/token", or = "https://api.bling.com.br/oauth/revoke";
function G(t) {
  const e = process.env[t];
  if (!e)
    throw new Error(`Variável de ambiente ausente: ${t}`);
  return e;
}
function ir(t) {
  const e = new Ke(t);
  if (e.protocol !== "http:")
    throw new Error(
      "Para callback local no Electron, use redirect URI no formato http://127.0.0.1:PORT/callback/bling"
    );
  return {
    hostname: e.hostname,
    port: Number(e.port),
    pathname: e.pathname
  };
}
class cr {
  async getStatus() {
    const e = Z.getByIntegrationId("bling");
    if (!e)
      return {
        connected: !1,
        expiresAt: null
      };
    try {
      await this.getValidAccessToken();
      const a = Z.getByIntegrationId("bling");
      return {
        connected: !0,
        expiresAt: (a == null ? void 0 : a.expiresAt) ?? null
      };
    } catch (a) {
      return console.error("[BlingOAuthService.getStatus]", a), {
        connected: !1,
        expiresAt: e.expiresAt
      };
    }
  }
  async connect() {
    const e = G("BLING_CLIENT_ID"), a = G("BLING_REDIRECT_URI"), s = sr(24), n = await this.requestAuthorizationCode({
      clientId: e,
      redirectUri: a,
      state: s
    });
    return await this.exchangeCodeForToken(n), {
      success: !0,
      message: "Bling conectado com sucesso."
    };
  }
  async disconnect() {
    const e = G("BLING_CLIENT_ID"), a = G("BLING_CLIENT_SECRET"), s = Z.getByIntegrationId("bling");
    if (!s)
      return {
        success: !0,
        message: "Bling já estava desconectado."
      };
    try {
      const n = new URLSearchParams({
        token: s.refreshToken
      });
      await fetch(or, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Ye(e, a)}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: n.toString()
      });
    } catch (n) {
      console.warn("[BlingOAuthService.disconnect] falha ao revogar remotamente:", n);
    }
    return Z.delete("bling"), {
      success: !0,
      message: "Bling desconectado com sucesso."
    };
  }
  async getValidAccessToken() {
    const e = Z.getByIntegrationId("bling");
    if (!e)
      throw new Error("Bling não está conectado.");
    if (!(new Date(e.expiresAt).getTime() <= Date.now() + 6e4))
      return e.accessToken;
    await this.refreshAccessToken(e.refreshToken);
    const n = Z.getByIntegrationId("bling");
    if (!n)
      throw new Error("Falha ao renovar token do Bling.");
    return n.accessToken;
  }
  async requestAuthorizationCode(e) {
    const { hostname: a, port: s, pathname: n } = ir(e.redirectUri), r = new Ke(rr);
    return r.searchParams.set("response_type", "code"), r.searchParams.set("client_id", e.clientId), r.searchParams.set("state", e.state), r.searchParams.set("redirect_uri", e.redirectUri), await new Promise((i, c) => {
      let d = !1;
      const l = (T, N) => {
        clearTimeout(N), T.close();
      }, E = ra.createServer((T, N) => {
        try {
          if (!T.url)
            throw new Error("Callback sem URL.");
          const v = new Ke(T.url, `http://${a}:${s}`);
          if (v.pathname !== n) {
            N.statusCode = 404, N.end("Not found");
            return;
          }
          const A = v.searchParams.get("error"), D = v.searchParams.get("code"), ae = v.searchParams.get("state");
          if (A) {
            N.statusCode = 400, N.end("Autorização recusada ou inválida."), d || (d = !0, l(E, _), c(new Error(`Bling retornou erro no callback: ${A}`)));
            return;
          }
          if (!D) {
            N.statusCode = 400, N.end("Authorization code não recebido."), d || (d = !0, l(E, _), c(new Error("Authorization code não recebido.")));
            return;
          }
          if (ae !== e.state) {
            N.statusCode = 400, N.end("State inválido."), d || (d = !0, l(E, _), c(new Error("State inválido no callback do Bling.")));
            return;
          }
          N.statusCode = 200, N.setHeader("Content-Type", "text/html; charset=utf-8"), N.end(`
            <html>
              <body style="font-family: Arial, sans-serif; padding: 24px;">
                <h2>Integração concluída</h2>
                <p>Você já pode fechar esta janela e voltar ao sistema.</p>
              </body>
            </html>
          `), d || (d = !0, l(E, _), i(D));
        } catch (v) {
          d || (d = !0, l(E, _), c(v instanceof Error ? v : new Error("Erro desconhecido no callback.")));
        }
      }), _ = setTimeout(() => {
        d || (d = !0, l(E, _), c(new Error("Tempo esgotado aguardando autorização do Bling.")));
      }, 12e4);
      E.listen(s, a, async () => {
        try {
          await vt.openExternal(r.toString());
        } catch (T) {
          d || (d = !0, l(E, _), c(
            T instanceof Error ? T : new Error("Falha ao abrir navegador para autorização.")
          ));
        }
      }), E.on("error", (T) => {
        d || (d = !0, l(E, _), c(T instanceof Error ? T : new Error("Erro ao iniciar servidor local.")));
      });
    });
  }
  async exchangeCodeForToken(e) {
    const a = G("BLING_CLIENT_ID"), s = G("BLING_CLIENT_SECRET"), n = G("BLING_REDIRECT_URI"), r = new URLSearchParams({
      grant_type: "authorization_code",
      code: e,
      redirect_uri: n
    }), i = await fetch(Rt, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Ye(a, s)}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "enable-jwt": "1"
      },
      body: r.toString()
    }), c = await i.text();
    if (!i.ok)
      throw new Error(`Falha ao trocar code por token no Bling: ${i.status} - ${c}`);
    const d = JSON.parse(c);
    this.persistToken(d);
  }
  async refreshAccessToken(e) {
    const a = G("BLING_CLIENT_ID"), s = G("BLING_CLIENT_SECRET"), n = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: e
    }), r = await fetch(Rt, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Ye(a, s)}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "enable-jwt": "1"
      },
      body: n.toString()
    }), i = await r.text();
    if (!r.ok)
      throw new Error(`Falha ao renovar token do Bling: ${r.status} - ${i}`);
    const c = JSON.parse(i);
    this.persistToken(c);
  }
  persistToken(e) {
    const a = new Date(Date.now() + e.expires_in * 1e3).toISOString(), s = {
      integrationId: "bling",
      accessToken: e.access_token,
      refreshToken: e.refresh_token,
      tokenType: e.token_type,
      expiresAt: a,
      scope: e.scope ?? null,
      raw: e,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    Z.save(s);
  }
}
const Ce = new cr(), dr = "https://api.bling.com.br/Api/v3";
class lr {
  /**
   * Método genérico GET para a API da Bling.
   *
   * Permite passar query params dinamicamente.
   */
  async get(e, a) {
    const s = await Ce.getValidAccessToken(), n = new URL(`${dr}${e}`);
    a && Object.entries(a).forEach(([c, d]) => {
      d != null && n.searchParams.append(c, String(d));
    });
    const r = await fetch(n.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${s}`,
        Accept: "application/json",
        "enable-jwt": "1"
      }
    }), i = await r.text();
    if (!r.ok)
      throw new Error(`Erro na API do Bling: ${r.status} - ${i}`);
    return JSON.parse(i);
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
  async getProducts(e) {
    return this.get("/produtos", {
      pagina: (e == null ? void 0 : e.page) ?? 1,
      limite: (e == null ? void 0 : e.limit) ?? 100,
      criterio: e == null ? void 0 : e.criterio,
      dataAlteracaoInicial: e == null ? void 0 : e.dataAlteracaoInicial
    });
  }
  async getCategories(e) {
    return this.get("/categorias/produtos", {
      pagina: (e == null ? void 0 : e.page) ?? 1,
      limite: (e == null ? void 0 : e.limit) ?? 100
    });
  }
}
const Ae = new lr();
function be() {
  return Ut.randomUUID();
}
function U() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function ht(t, e) {
  const a = new Date(t);
  return a.setMinutes(a.getMinutes() - e), a.toISOString();
}
class ur {
  countByIntegrationSource(e) {
    return o.prepare(`
      SELECT COUNT(*) as count FROM categories
      WHERE integration_source = ? AND deleted_at IS NULL
    `).get(e).count;
  }
  upsert(e) {
    if (!(e != null && e.externalId) || !(e != null && e.name)) {
      console.warn("[CategoryRepository] Pulando categoria inválida:", e);
      return;
    }
    const a = U();
    o.prepare(`
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
      e.id ?? be(),
      e.externalId,
      e.integrationSource,
      e.name,
      e.active ?? 1,
      e.remoteUpdatedAt ?? null,
      e.lastSyncedAt,
      e.syncStatus ?? "synced",
      e.raw ? JSON.stringify(e.raw) : null,
      e.createdAt ?? a,
      e.updatedAt ?? a
    );
  }
  upsertMany(e) {
    o.transaction((s) => {
      for (const n of s) this.upsert(n);
    })(e);
  }
  getExternalIdsBySource(e, a) {
    if (a.length === 0) return [];
    const s = a.map(() => "?").join(",");
    return o.prepare(`
      SELECT external_id FROM categories
      WHERE integration_source = ? AND external_id IN (${s})
    `).all(e, ...a).map((r) => r.external_id);
  }
  /**
   * Retorna um Map de externalId -> localId para todas as categorias de uma fonte.
   * Usado pelo sync de produtos para linkar category_id sem fazer N queries.
   */
  getAllExternalIdMap(e) {
    const a = o.prepare(`
      SELECT id, external_id FROM categories
      WHERE integration_source = ? AND deleted_at IS NULL
    `).all(e);
    return new Map(a.map((s) => [s.external_id, s.id]));
  }
  mapRow(e) {
    let a = null;
    if (e.raw_json)
      try {
        a = JSON.parse(e.raw_json);
      } catch {
        a = e.raw_json;
      }
    return {
      id: e.id,
      externalId: e.external_id,
      integrationSource: e.integration_source,
      name: e.name,
      active: e.active,
      remoteUpdatedAt: e.remote_updated_at,
      lastSyncedAt: e.last_synced_at ?? "",
      syncStatus: e.sync_status,
      raw: a,
      createdAt: e.created_at,
      updatedAt: e.updated_at
    };
  }
}
const ve = new ur();
class Er {
  get(e, a) {
    const s = o.prepare(`
      SELECT * FROM sync_states
      WHERE integration_id = ? AND resource = ?
      LIMIT 1
    `).get(e, a);
    return s ? {
      integrationId: s.integration_id,
      resource: s.resource,
      lastSyncAt: s.last_sync_at,
      lastSuccessAt: s.last_success_at,
      checkpointCursor: s.checkpoint_cursor,
      status: s.status,
      errorMessage: s.error_message,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    } : null;
  }
  save(e) {
    o.prepare(`
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
      be(),
      e.integrationId,
      e.resource,
      e.lastSyncAt ?? null,
      e.lastSuccessAt ?? null,
      e.checkpointCursor ?? null,
      e.status,
      e.errorMessage ?? null,
      e.createdAt,
      e.updatedAt
    );
  }
  markRunning(e, a) {
    const s = U(), n = this.get(e, a);
    this.save({
      integrationId: e,
      resource: a,
      lastSyncAt: s,
      lastSuccessAt: (n == null ? void 0 : n.lastSuccessAt) ?? null,
      checkpointCursor: (n == null ? void 0 : n.checkpointCursor) ?? null,
      status: "running",
      errorMessage: null,
      createdAt: (n == null ? void 0 : n.createdAt) ?? s,
      updatedAt: s
    });
  }
  markSuccess(e, a, s) {
    const n = U(), r = this.get(e, a);
    this.save({
      integrationId: e,
      resource: a,
      lastSyncAt: n,
      lastSuccessAt: n,
      checkpointCursor: s ?? (r == null ? void 0 : r.checkpointCursor) ?? null,
      status: "success",
      errorMessage: null,
      createdAt: (r == null ? void 0 : r.createdAt) ?? n,
      updatedAt: n
    });
  }
  markError(e, a, s) {
    const n = U(), r = this.get(e, a);
    this.save({
      integrationId: e,
      resource: a,
      lastSyncAt: (r == null ? void 0 : r.lastSyncAt) ?? null,
      lastSuccessAt: (r == null ? void 0 : r.lastSuccessAt) ?? null,
      checkpointCursor: (r == null ? void 0 : r.checkpointCursor) ?? null,
      status: "error",
      errorMessage: s,
      createdAt: (r == null ? void 0 : r.createdAt) ?? n,
      updatedAt: n
    });
  }
}
const w = new Er();
class Tr {
  start(e) {
    const a = be();
    return o.prepare(`
      INSERT INTO sync_logs (
        id, integration_id, resource, mode, status,
        started_at, items_processed, items_created, items_updated, items_failed
      ) VALUES (?, ?, ?, ?, 'running', ?, 0, 0, 0, 0)
    `).run(a, e.integrationId, e.resource, e.mode, e.startedAt), a;
  }
  finish(e) {
    o.prepare(`
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
      e.status,
      e.finishedAt,
      e.itemsProcessed,
      e.itemsCreated,
      e.itemsUpdated,
      e.itemsFailed,
      e.errorMessage ?? null,
      e.id
    );
  }
  listByIntegration(e, a, s = 20) {
    return o.prepare(`
      SELECT * FROM sync_logs
      WHERE integration_id = ? AND resource = ?
      ORDER BY started_at DESC
      LIMIT ?
    `).all(e, a, s).map((r) => ({
      id: r.id,
      integrationId: r.integration_id,
      resource: r.resource,
      mode: r.mode,
      status: r.status,
      startedAt: r.started_at,
      finishedAt: r.finished_at,
      itemsProcessed: r.items_processed,
      itemsCreated: r.items_created,
      itemsUpdated: r.items_updated,
      itemsFailed: r.items_failed,
      errorMessage: r.error_message
    }));
  }
}
const W = new Tr();
async function Vt(t) {
  await new Promise((e) => setTimeout(e, t));
}
const Y = "bling", pe = "categories", St = 100;
function mr(t) {
  const e = [
    t.nome,
    t.descricao,
    t.description
  ];
  for (const a of e)
    if (typeof a == "string" && a.trim())
      return a.trim();
  return null;
}
function _r(t, e) {
  if (t == null || !t.id) return null;
  const a = mr(t);
  return a ? {
    externalId: String(t.id),
    integrationSource: Y,
    name: a,
    active: 1,
    lastSyncedAt: e,
    syncStatus: "synced",
    raw: t,
    updatedAt: e
  } : null;
}
class pr {
  async execute() {
    const e = w.get(Y, pe), a = ve.countByIntegrationSource(Y), n = !e || !e.lastSuccessAt || a === 0 ? "initial" : "incremental";
    w.markRunning(Y, pe);
    const r = U(), i = W.start({
      integrationId: Y,
      resource: pe,
      mode: n,
      startedAt: r
    });
    let c = 0, d = 0, l = 0, E = 0;
    try {
      let _ = 1, T = !0;
      for (; T; ) {
        const v = await Ae.getCategories({ page: _, limit: St }), A = Array.isArray(v.data) ? v.data : [], D = A.filter(($) => $ != null), ae = A.length - D.length;
        if (E += ae, D.length === 0 && _ === 1) {
          T = !1;
          break;
        }
        const K = U(), Ee = D.map(($) => _r($, K)), x = Ee.filter(($) => $ != null);
        if (E += Ee.length - x.length, c += A.length, A.length > 0 && x.length === 0 && console.warn("[SyncCategoriesFromBlingService] Nenhuma categoria válida mapeada. Exemplo de payload:", A[0]), x.length > 0) {
          const $ = x.map((Te) => Te.externalId), q = new Set(
            ve.getExternalIdsBySource(Y, $)
          );
          for (const Te of x)
            q.has(Te.externalId) ? l++ : d++;
          ve.upsertMany(x);
        }
        A.length < St ? T = !1 : (_++, await Vt(350));
      }
      const N = U();
      return w.markSuccess(Y, pe), W.finish({
        id: i,
        status: "success",
        finishedAt: N,
        itemsProcessed: c,
        itemsCreated: d,
        itemsUpdated: l,
        itemsFailed: E
      }), { mode: n, processed: c, created: d, updated: l, failed: E };
    } catch (_) {
      const T = U(), N = _ instanceof Error ? _.message : String(_);
      throw w.markError(Y, pe, N), W.finish({
        id: i,
        status: "failed",
        finishedAt: T,
        itemsProcessed: c,
        itemsCreated: d,
        itemsUpdated: l,
        itemsFailed: E,
        errorMessage: N
      }), _;
    }
  }
}
const zt = new pr();
class Nr {
  countByIntegrationSource(e) {
    return o.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE integration_source = ? AND deleted_at IS NULL
    `).get(e).count;
  }
  upsert(e) {
    const a = U(), s = e.id ?? be();
    o.prepare(`
      INSERT INTO products (
        id, external_id, integration_source, sku, barcode, category_id,
        name, unit, sale_price_cents, cost_price_cents, current_stock, minimum_stock, active,
        remote_created_at, remote_updated_at, last_synced_at, sync_status,
        raw_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        active            = excluded.active,
        remote_created_at = excluded.remote_created_at,
        remote_updated_at = excluded.remote_updated_at,
        last_synced_at    = excluded.last_synced_at,
        sync_status       = excluded.sync_status,
        raw_json          = excluded.raw_json,
        updated_at        = excluded.updated_at
    `).run(
      s,
      e.externalId,
      e.integrationSource,
      e.sku ?? null,
      e.barcode ?? null,
      e.categoryId ?? null,
      e.name,
      e.unit ?? null,
      e.salePriceCents,
      e.costPriceCents,
      e.currentStock ?? 0,
      e.minimumStock ?? 0,
      e.active,
      e.remoteCreatedAt ?? null,
      e.remoteUpdatedAt ?? null,
      e.lastSyncedAt,
      e.syncStatus ?? "synced",
      e.raw ? JSON.stringify(e.raw) : null,
      e.createdAt ?? a,
      e.updatedAt ?? a
    ), o.prepare(`
      INSERT INTO produtos (
        id, internal_code, gtin, nome, preco_custo, preco_venda,
        estoque_atual, estoque_minimo, unidade_medida, ativo, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        internal_code = excluded.internal_code,
        gtin = excluded.gtin,
        nome = excluded.nome,
        preco_custo = excluded.preco_custo,
        preco_venda = excluded.preco_venda,
        estoque_atual = excluded.estoque_atual,
        estoque_minimo = excluded.estoque_minimo,
        unidade_medida = excluded.unidade_medida,
        ativo = excluded.ativo,
        updated_at = excluded.updated_at
    `).run(
      s,
      e.sku ?? null,
      e.barcode ?? null,
      e.name,
      e.costPriceCents / 100,
      e.salePriceCents / 100,
      e.currentStock ?? 0,
      e.minimumStock ?? 0,
      e.unit ?? null,
      e.active,
      e.createdAt ?? a,
      e.updatedAt ?? a
    );
  }
  upsertMany(e) {
    o.transaction((s) => {
      for (const n of s) this.upsert(n);
    })(e);
  }
  getExternalIdsBySource(e, a) {
    if (a.length === 0) return [];
    const s = a.map(() => "?").join(",");
    return o.prepare(`
      SELECT external_id FROM products
      WHERE integration_source = ? AND external_id IN (${s})
    `).all(e, ...a).map((r) => r.external_id);
  }
  getByExternalId(e, a) {
    const s = o.prepare(`
      SELECT * FROM products
      WHERE integration_source = ? AND external_id = ?
      LIMIT 1
    `).get(e, a);
    return s ? this.mapRow(s) : null;
  }
  listByIntegrationSource(e) {
    return o.prepare(`
      SELECT * FROM products
      WHERE integration_source = ? AND deleted_at IS NULL
      ORDER BY name ASC
    `).all(e).map((s) => this.mapRow(s));
  }
  mapRow(e) {
    let a = null;
    if (e.raw_json)
      try {
        a = JSON.parse(e.raw_json);
      } catch {
        a = e.raw_json;
      }
    return {
      id: e.id,
      externalId: e.external_id,
      integrationSource: e.integration_source,
      sku: e.sku,
      barcode: e.barcode,
      categoryId: e.category_id,
      name: e.name,
      unit: e.unit,
      salePriceCents: e.sale_price_cents,
      costPriceCents: e.cost_price_cents,
      currentStock: e.current_stock,
      minimumStock: e.minimum_stock,
      active: e.active,
      remoteCreatedAt: e.remote_created_at,
      remoteUpdatedAt: e.remote_updated_at,
      lastSyncedAt: e.last_synced_at ?? "",
      syncStatus: e.sync_status,
      raw: a,
      createdAt: e.created_at,
      updatedAt: e.updated_at
    };
  }
}
const We = new Nr(), j = "bling", Ne = "products", Ct = 100, fr = "5";
function Yt(t) {
  return t.replace("T", " ").slice(0, 19);
}
function gr(t) {
  const e = (t == null ? void 0 : t.checkpointCursor) ?? (t == null ? void 0 : t.lastSuccessAt);
  if (!e) return;
  const a = e.includes("T") ? ht(e, 2) : ht(e.replace(" ", "T") + "Z", 2);
  return Yt(a);
}
function Ir(t, e, a) {
  var n, r;
  const s = (n = t.categoria) != null && n.id ? String(t.categoria.id) : null;
  return {
    // Identificação do produto no Bling e origem da integração.
    externalId: String(t.id),
    integrationSource: j,
    // Dados comerciais e de identificação. Campos ausentes viram null para manter padrão local.
    sku: t.codigo || null,
    barcode: t.codigo || null,
    categoryId: s ? a.get(s) ?? null : null,
    name: t.nome,
    unit: null,
    // Valores monetários são armazenados em centavos para evitar problemas com ponto flutuante.
    salePriceCents: Math.round((t.preco ?? 0) * 100),
    costPriceCents: Math.round((t.precoCusto ?? 0) * 100),
    // Estoque e limites locais.
    currentStock: Number(((r = t.estoque) == null ? void 0 : r.saldoVirtualTotal) ?? 0),
    minimumStock: 0,
    // No Bling, "A" representa produto ativo.
    active: t.situacao === "A" ? 1 : 0,
    // Datas e metadados de sincronização.
    remoteUpdatedAt: t.dataAlteracao ?? null,
    lastSyncedAt: e,
    syncStatus: "synced",
    // Guarda o payload original para auditoria/debug e futuras evoluções do mapeamento.
    raw: t,
    updatedAt: e
  };
}
function Ar(t) {
  if (!t || typeof t != "object") return null;
  const e = "produto" in t && t.produto && typeof t.produto == "object" ? t.produto : t;
  if (!e || typeof e != "object") return null;
  const a = e;
  return !a.id || typeof a.nome != "string" || !a.nome.trim() ? null : a;
}
class Lr {
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
    const e = w.get(j, Ne), a = We.countByIntegrationSource(j), s = !e || !e.lastSuccessAt || a === 0, n = s ? "initial" : "incremental", r = s ? void 0 : gr(e);
    w.markRunning(j, Ne);
    const i = U(), c = W.start({
      integrationId: j,
      resource: Ne,
      mode: n,
      startedAt: i
    });
    let d = 0, l = 0, E = 0, _ = 0, T = (e == null ? void 0 : e.checkpointCursor) ?? null;
    try {
      const N = ve.getAllExternalIdMap(j);
      let v = 1, A = !0;
      for (; A; ) {
        const ae = await Ae.getProducts({
          page: v,
          limit: Ct,
          criterio: fr,
          dataAlteracaoInicial: r
        }), K = Array.isArray(ae.data) ? ae.data : [], Ee = K.map(Ar), x = Ee.filter((F) => F != null);
        if (_ += Ee.length - x.length, x.length === 0) {
          K.length > 0 && console.warn("[SyncProductsFromBlingService] Nenhum produto válido encontrado na página. Exemplo de payload:", K[0]), A = !1;
          break;
        }
        const $ = U(), q = x.map((F) => Ir(F, $, N));
        for (const F of q)
          F.remoteUpdatedAt && (!T || F.remoteUpdatedAt > T) && (T = F.remoteUpdatedAt);
        const Te = q.map((F) => F.externalId), Jt = new Set(
          We.getExternalIdsBySource(j, Te)
        );
        for (const F of q)
          Jt.has(F.externalId) ? E++ : l++;
        q.length > 0 && We.upsertMany(q), d += K.length, K.length < Ct ? A = !1 : (v++, await Vt(350));
      }
      const D = U();
      return w.markSuccess(
        j,
        Ne,
        T ?? Yt(D)
      ), W.finish({
        id: c,
        status: "success",
        finishedAt: D,
        itemsProcessed: d,
        itemsCreated: l,
        itemsUpdated: E,
        itemsFailed: _
      }), { mode: n, processed: d, created: l, updated: E, failed: _ };
    } catch (N) {
      const v = U(), A = N instanceof Error ? N.message : String(N);
      throw w.markError(j, Ne, A), W.finish({
        id: c,
        status: "failed",
        finishedAt: v,
        itemsProcessed: d,
        itemsCreated: l,
        itemsUpdated: E,
        itemsFailed: _,
        errorMessage: A
      }), N;
    }
  }
}
const Wt = new Lr();
class Rr {
  async execute() {
    const e = await zt.execute(), a = await Wt.execute();
    return { categories: e, products: a };
  }
}
const hr = new Rr();
function Sr() {
  u.handle("integrations:status", async (t, e) => (m("integrations:manage"), e !== "bling" ? { connected: !1 } : await Ce.getStatus())), u.handle("integrations:connect", async (t, e) => {
    if (m("integrations:manage"), e !== "bling")
      return { success: !1, message: `Integração ${e} ainda não implementada.` };
    try {
      return await Ce.connect();
    } catch (a) {
      return console.error("[integrations:connect]", a), { success: !1, message: a instanceof Error ? a.message : "Erro ao conectar com o Bling." };
    }
  }), u.handle("integrations:disconnect", async (t, e) => {
    if (m("integrations:manage"), e !== "bling")
      return { success: !1, message: `Integração ${e} ainda não implementada.` };
    try {
      return await Ce.disconnect();
    } catch (a) {
      return console.error("[integrations:disconnect]", a), { success: !1, message: a instanceof Error ? a.message : "Erro ao desconectar Bling." };
    }
  }), u.handle("integrations:bling:sync-all", async () => {
    m("integrations:manage");
    try {
      return { success: !0, ...await hr.execute() };
    } catch (t) {
      return console.error("[integrations:bling:sync-all]", t), {
        success: !1,
        message: t instanceof Error ? t.message : "Erro ao sincronizar."
      };
    }
  }), u.handle("integrations:bling:sync", async () => {
    m("integrations:manage");
    try {
      return { success: !0, ...await Wt.execute() };
    } catch (t) {
      return console.error("[integrations:bling:sync]", t), {
        success: !1,
        message: t instanceof Error ? t.message : "Erro ao sincronizar produtos."
      };
    }
  }), u.handle("integrations:bling:sync-categories", async () => {
    m("integrations:manage");
    try {
      return { success: !0, ...await zt.execute() };
    } catch (t) {
      return console.error("[integrations:bling:sync-categories]", t), {
        success: !1,
        message: t instanceof Error ? t.message : "Erro ao sincronizar categorias."
      };
    }
  }), u.handle("integrations:bling:sync-status", () => (m("integrations:manage"), w.get("bling", "products"))), u.handle("integrations:bling:sync-status-categories", () => (m("integrations:manage"), w.get("bling", "categories"))), u.handle("integrations:bling:sync-logs", () => (m("integrations:manage"), W.listByIntegration("bling", "products", 10))), u.handle("integrations:bling:sync-logs-categories", () => (m("integrations:manage"), W.listByIntegration("bling", "categories", 10))), u.handle("integrations:bling:test", async () => (m("integrations:manage"), await Ae.getProducts({ page: 1, limit: 5 }))), u.handle("integrations:bling:test-categories", async () => (m("integrations:manage"), await Ae.getCategories({ page: 1, limit: 5 }))), u.handle("integrations:bling:test-icmp", async () => (m("integrations:manage"), await Ae.ping()));
}
const Kt = import.meta.dirname;
process.env.APP_ROOT = g.join(Kt, "..");
const h = process.env.VITE_DEV_SERVER_URL, $r = g.join(process.env.APP_ROOT, "dist-electron"), qt = g.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = h ? g.join(process.env.APP_ROOT, "public") : qt;
let b = null;
function Qt() {
  b = new O({
    icon: g.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: g.join(Kt, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), b.webContents.on("did-finish-load", () => {
    b == null || b.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), b.webContents.on("did-fail-load", (t, e, a) => {
    f.error(`Renderer falhou ao carregar: [${e}] ${a}`);
  }), b.webContents.on("render-process-gone", (t, e) => {
    f.error(`Renderer process encerrado: ${e.reason}`);
  }), h ? b.loadURL(h) : b.loadFile(g.join(qt, "index.html")), b.maximize(), b.on(
    "close",
    () => {
    }
  );
}
X.on("before-quit", () => {
  const t = nt();
  t && jt(t);
});
X.on("window-all-closed", () => {
  process.platform !== "darwin" && (X.quit(), b = null);
});
X.on("activate", () => {
  O.getAllWindows().length === 0 && Qt();
});
u.on("app:fechar-janela", () => {
  const t = O.getFocusedWindow();
  t && t.close();
});
u.handle("app:quit-with-confirm", async () => {
  f.info("Encerramento solicitado pelo usuário");
  const { response: t } = await Ot.showMessageBox({
    type: "question",
    buttons: ["Cancelar", "Sair"],
    defaultId: 1,
    cancelId: 0,
    message: "Tem certeza que deseja sair do sistema?"
  });
  return t === 1 ? (X.quit(), !0) : !1;
});
X.whenReady().then(() => {
  xa(), hn(), Qn(), Un(), qn(), Jn(), Zn(), er(), tr(), ar(), Sr(), Qt(), f.info("Criado janela principal do App");
});
export {
  $r as MAIN_DIST,
  qt as RENDERER_DIST,
  h as VITE_DEV_SERVER_URL
};
