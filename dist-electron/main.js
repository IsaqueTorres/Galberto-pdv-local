var Eo = Object.defineProperty;
var mo = (t, e, r) => e in t ? Eo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var ce = (t, e, r) => mo(t, typeof e != "symbol" ? e + "" : e, r);
import { app as _e, ipcMain as p, BrowserWindow as H, shell as Wa, dialog as Qa } from "electron";
import * as or from "fs";
import qt from "fs";
import Or from "path";
import po from "os";
import Ja from "crypto";
import * as Ee from "node:fs";
import * as st from "node:path";
import R from "node:path";
import _o from "better-sqlite3";
import { execFileSync as Ar } from "node:child_process";
import br, { X509Certificate as Jr, createHash as Za, createSign as To } from "node:crypto";
import * as fo from "node:https";
import No from "node:http";
import { URL as hr } from "node:url";
var De = { exports: {} };
const Ir = qt, Gt = Or, go = po, Ao = Ja, Zr = [
  "◈ encrypted .env [www.dotenvx.com]",
  "◈ secrets for agents [www.dotenvx.com]",
  "⌁ auth for agents [www.vestauth.com]",
  "⌘ custom filepath { path: '/custom/path/.env' }",
  "⌘ enable debugging { debug: true }",
  "⌘ override existing { override: true }",
  "⌘ suppress logs { quiet: true }",
  "⌘ multiple files { path: ['.env.local', '.env'] }"
];
function ho() {
  return Zr[Math.floor(Math.random() * Zr.length)];
}
function nt(t) {
  return typeof t == "string" ? !["false", "0", "no", "off", ""].includes(t.toLowerCase()) : !!t;
}
function Io() {
  return process.stdout.isTTY;
}
function Co(t) {
  return Io() ? `\x1B[2m${t}\x1B[0m` : t;
}
const vo = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function Do(t) {
  const e = {};
  let r = t.toString();
  r = r.replace(/\r\n?/mg, `
`);
  let a;
  for (; (a = vo.exec(r)) != null; ) {
    const n = a[1];
    let o = a[2] || "";
    o = o.trim();
    const s = o[0];
    o = o.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), s === '"' && (o = o.replace(/\\n/g, `
`), o = o.replace(/\\r/g, "\r")), e[n] = o;
  }
  return e;
}
function So(t) {
  t = t || {};
  const e = rn(t);
  t.path = e;
  const r = B.configDotenv(t);
  if (!r.parsed) {
    const s = new Error(`MISSING_DATA: Cannot parse ${e} for an unknown reason`);
    throw s.code = "MISSING_DATA", s;
  }
  const a = tn(t).split(","), n = a.length;
  let o;
  for (let s = 0; s < n; s++)
    try {
      const i = a[s].trim(), c = Lo(r, i);
      o = B.decrypt(c.ciphertext, c.key);
      break;
    } catch (i) {
      if (s + 1 >= n)
        throw i;
    }
  return B.parse(o);
}
function Ro(t) {
  console.error(`⚠ ${t}`);
}
function It(t) {
  console.log(`┆ ${t}`);
}
function en(t) {
  console.log(`◇ ${t}`);
}
function tn(t) {
  return t && t.DOTENV_KEY && t.DOTENV_KEY.length > 0 ? t.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function Lo(t, e) {
  let r;
  try {
    r = new URL(e);
  } catch (i) {
    if (i.code === "ERR_INVALID_URL") {
      const c = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw c.code = "INVALID_DOTENV_KEY", c;
    }
    throw i;
  }
  const a = r.password;
  if (!a) {
    const i = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw i.code = "INVALID_DOTENV_KEY", i;
  }
  const n = r.searchParams.get("environment");
  if (!n) {
    const i = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw i.code = "INVALID_DOTENV_KEY", i;
  }
  const o = `DOTENV_VAULT_${n.toUpperCase()}`, s = t.parsed[o];
  if (!s) {
    const i = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);
    throw i.code = "NOT_FOUND_DOTENV_ENVIRONMENT", i;
  }
  return { ciphertext: s, key: a };
}
function rn(t) {
  let e = null;
  if (t && t.path && t.path.length > 0)
    if (Array.isArray(t.path))
      for (const r of t.path)
        Ir.existsSync(r) && (e = r.endsWith(".vault") ? r : `${r}.vault`);
    else
      e = t.path.endsWith(".vault") ? t.path : `${t.path}.vault`;
  else
    e = Gt.resolve(process.cwd(), ".env.vault");
  return Ir.existsSync(e) ? e : null;
}
function ea(t) {
  return t[0] === "~" ? Gt.join(go.homedir(), t.slice(1)) : t;
}
function yo(t) {
  const e = nt(process.env.DOTENV_CONFIG_DEBUG || t && t.debug), r = nt(process.env.DOTENV_CONFIG_QUIET || t && t.quiet);
  (e || !r) && en("loading env from encrypted .env.vault");
  const a = B._parseVault(t);
  let n = process.env;
  return t && t.processEnv != null && (n = t.processEnv), B.populate(n, a, t), { parsed: a };
}
function Oo(t) {
  const e = Gt.resolve(process.cwd(), ".env");
  let r = "utf8", a = process.env;
  t && t.processEnv != null && (a = t.processEnv);
  let n = nt(a.DOTENV_CONFIG_DEBUG || t && t.debug), o = nt(a.DOTENV_CONFIG_QUIET || t && t.quiet);
  t && t.encoding ? r = t.encoding : n && It("no encoding is specified (UTF-8 is used by default)");
  let s = [e];
  if (t && t.path)
    if (!Array.isArray(t.path))
      s = [ea(t.path)];
    else {
      s = [];
      for (const d of t.path)
        s.push(ea(d));
    }
  let i;
  const c = {};
  for (const d of s)
    try {
      const m = B.parse(Ir.readFileSync(d, { encoding: r }));
      B.populate(c, m, t);
    } catch (m) {
      n && It(`failed to load ${d} ${m.message}`), i = m;
    }
  const l = B.populate(a, c, t);
  if (n = nt(a.DOTENV_CONFIG_DEBUG || n), o = nt(a.DOTENV_CONFIG_QUIET || o), n || !o) {
    const d = Object.keys(l).length, m = [];
    for (const E of s)
      try {
        const _ = Gt.relative(process.cwd(), E);
        m.push(_);
      } catch (_) {
        n && It(`failed to load ${E} ${_.message}`), i = _;
      }
    en(`injecting env (${d}) from ${m.join(",")} ${Co(`// tip: ${ho()}`)}`);
  }
  return i ? { parsed: c, error: i } : { parsed: c };
}
function bo(t) {
  if (tn(t).length === 0)
    return B.configDotenv(t);
  const e = rn(t);
  return e ? B._configVault(t) : (Ro(`you set DOTENV_KEY but you are missing a .env.vault file at ${e}`), B.configDotenv(t));
}
function Uo(t, e) {
  const r = Buffer.from(e.slice(-64), "hex");
  let a = Buffer.from(t, "base64");
  const n = a.subarray(0, 12), o = a.subarray(-16);
  a = a.subarray(12, -16);
  try {
    const s = Ao.createDecipheriv("aes-256-gcm", r, n);
    return s.setAuthTag(o), `${s.update(a)}${s.final()}`;
  } catch (s) {
    const i = s instanceof RangeError, c = s.message === "Invalid key length", l = s.message === "Unsupported state or unable to authenticate data";
    if (i || c) {
      const d = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw d.code = "INVALID_DOTENV_KEY", d;
    } else if (l) {
      const d = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw d.code = "DECRYPTION_FAILED", d;
    } else
      throw s;
  }
}
function Fo(t, e, r = {}) {
  const a = !!(r && r.debug), n = !!(r && r.override), o = {};
  if (typeof e != "object") {
    const s = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw s.code = "OBJECT_REQUIRED", s;
  }
  for (const s of Object.keys(e))
    Object.prototype.hasOwnProperty.call(t, s) ? (n === !0 && (t[s] = e[s], o[s] = e[s]), a && It(n === !0 ? `"${s}" is already defined and WAS overwritten` : `"${s}" is already defined and was NOT overwritten`)) : (t[s] = e[s], o[s] = e[s]);
  return o;
}
const B = {
  configDotenv: Oo,
  _configVault: yo,
  _parseVault: So,
  config: bo,
  decrypt: Uo,
  parse: Do,
  populate: Fo
};
De.exports.configDotenv = B.configDotenv;
De.exports._configVault = B._configVault;
De.exports._parseVault = B._parseVault;
De.exports.config = B.config;
De.exports.decrypt = B.decrypt;
De.exports.parse = B.parse;
De.exports.populate = B.populate;
De.exports = B;
var wo = De.exports;
const Ge = {};
process.env.DOTENV_CONFIG_ENCODING != null && (Ge.encoding = process.env.DOTENV_CONFIG_ENCODING);
process.env.DOTENV_CONFIG_PATH != null && (Ge.path = process.env.DOTENV_CONFIG_PATH);
process.env.DOTENV_CONFIG_QUIET != null && (Ge.quiet = process.env.DOTENV_CONFIG_QUIET);
process.env.DOTENV_CONFIG_DEBUG != null && (Ge.debug = process.env.DOTENV_CONFIG_DEBUG);
process.env.DOTENV_CONFIG_OVERRIDE != null && (Ge.override = process.env.DOTENV_CONFIG_OVERRIDE);
process.env.DOTENV_CONFIG_DOTENV_KEY != null && (Ge.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY);
var xo = Ge;
const Mo = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
var Po = function(e) {
  const r = e.reduce(function(a, n) {
    const o = n.match(Mo);
    return o && (a[o[1]] = o[2]), a;
  }, {});
  return "quiet" in r || (r.quiet = "true"), r;
};
(function() {
  wo.config(
    Object.assign(
      {},
      xo,
      Po(process.argv)
    )
  );
})();
const Cr = Or.join(_e.getPath("userData"), "logs");
qt.existsSync(Cr) || qt.mkdirSync(Cr, { recursive: !0 });
function sr(t, e) {
  const a = (/* @__PURE__ */ new Date()).toLocaleString("sv-SE", {
    timeZone: "America/Sao_Paulo"
  }).replace(" ", "T"), n = `${a} [${t}] ${e}
`, o = `${a.slice(0, 10)}.log`, s = Or.join(Cr, o);
  qt.appendFileSync(s, n, { encoding: "utf-8" });
}
const f = {
  info: (t) => sr("INFO", t),
  warn: (t) => sr("WARN", t),
  error: (t) => sr("ERROR", t)
};
function Jt(t) {
  return Ja.createHash("sha256").update(t).digest("hex");
}
function Bo(t, e) {
  return Jt(t) === e;
}
function Xo(t, e) {
  const r = u.prepare(`
    SELECT id, nome, funcao, email, username, password, ativo
    FROM usuarios
    WHERE username = ?
    LIMIT 1
  `).get(t);
  if (!r)
    throw new Error("Usuário inválido");
  if (!Bo(e, r.password))
    throw new Error("Senha inválida");
  if (!r.ativo)
    throw new Error("Usuário desabilitado");
  const a = u.transaction(() => {
    u.prepare(`
      UPDATE sessions
      SET active = 0,
          logout_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND active = 1
    `).run(r.id);
    const n = u.prepare(`
      INSERT INTO sessions (user_id)
      VALUES (?)
    `).run(r.id);
    return Number(n.lastInsertRowid);
  })();
  return {
    id: r.id,
    nome: r.nome,
    role: r.funcao,
    email: r.email,
    login: r.username,
    sessionId: a
  };
}
const an = "2026-04-16-fiscal-persistence-v1";
function $o(t) {
  t.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      executed_at TEXT NOT NULL
    );
  `);
}
function ko(t, e) {
  return !!t.prepare("SELECT 1 FROM schema_migrations WHERE id = ? LIMIT 1").get(e);
}
function Fe(t, e, r) {
  return t.prepare(`PRAGMA table_info(${e})`).all().some((n) => n.name === r);
}
function qo(t) {
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
    `), t.prepare("INSERT INTO schema_migrations (id, executed_at) VALUES (?, CURRENT_TIMESTAMP)").run(an);
  })();
}
function Go(t) {
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

    CREATE UNIQUE INDEX IF NOT EXISTS ux_sales_external_reference
    ON sales(external_reference);

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
}
function z(t) {
  if (typeof t != "string") return null;
  const e = t.trim();
  return e.length > 0 ? e : null;
}
function Vo(t) {
  return t === "sefaz-direct" || t === "gateway" || t === "mock" ? t : "mock";
}
function zo(t) {
  return t === "production" || t === "homologation" ? t : null;
}
function jo(t) {
  return t === "online" || t === "offline-contingency" || t === "queue" ? t : "queue";
}
function Ho(t) {
  return t === "bypass-homologation-diagnostic" ? t : "strict";
}
function Ko(t) {
  const e = t.prepare(`
    SELECT raw_json
    FROM integrations
    WHERE integration_id = 'fiscal:nfce'
    LIMIT 1
  `).get();
  if (!(e != null && e.raw_json)) return null;
  try {
    return JSON.parse(e.raw_json);
  } catch (r) {
    return f.warn(`[FiscalMigration] Falha ao ler integrations.raw_json fiscal:nfce: ${r instanceof Error ? r.message : String(r)}`), null;
  }
}
function Yo(t) {
  t.exec(`
    CREATE TABLE IF NOT EXISTS fiscal_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      document_model INTEGER NOT NULL DEFAULT 65 CHECK (document_model = 65),
      contingency_mode TEXT,
      sefaz_base_url TEXT,
      gateway_base_url TEXT,
      gateway_api_key TEXT,
      certificate_type TEXT NOT NULL DEFAULT 'A1',
      certificate_path TEXT,
      certificate_password TEXT,
      certificate_valid_until TEXT,
      ca_bundle_path TEXT,
      tls_validation_mode TEXT NOT NULL DEFAULT 'strict',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE INDEX IF NOT EXISTS idx_fiscal_settings_store_active
    ON fiscal_settings(store_id, active);

    CREATE UNIQUE INDEX IF NOT EXISTS ux_fiscal_settings_active_store
    ON fiscal_settings(store_id)
    WHERE active = 1;
  `);
}
function Wo(t) {
  t.prepare("SELECT id FROM stores WHERE active = 1 ORDER BY id ASC LIMIT 1").get() || t.exec(`
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
    WHERE ativo = 1
      AND NOT EXISTS (SELECT 1 FROM stores WHERE active = 1)
    LIMIT 1;
  `);
}
function Qo(t) {
  Wo(t);
  const e = t.prepare(`
    SELECT id, csc_id, csc_token, default_series
    FROM stores
    WHERE active = 1
    ORDER BY id ASC
    LIMIT 1
  `).get();
  if (!e) {
    f.warn("[FiscalMigration] Nenhuma store ativa encontrada para backfill de fiscal_settings.");
    return;
  }
  if (t.prepare(`
    SELECT id
    FROM fiscal_settings
    WHERE store_id = ? AND active = 1
    LIMIT 1
  `).get(e.id)) {
    f.info(`[FiscalMigration] fiscal_settings ativo ja existe para store=${e.id}; backfill preservado.`);
    return;
  }
  const a = Ko(t), n = t.prepare(`
    SELECT cert_tipo, cert_path, cert_password, cert_validade, csc_id, csc_token, serie_nfce
    FROM company
    WHERE ativo = 1
    ORDER BY id ASC
    LIMIT 1
  `).get(), o = zo(a == null ? void 0 : a.environment), s = z(a == null ? void 0 : a.cscId) ?? z(n == null ? void 0 : n.csc_id), i = z(a == null ? void 0 : a.cscToken) ?? z(n == null ? void 0 : n.csc_token), c = Number((a == null ? void 0 : a.defaultSeries) ?? (n == null ? void 0 : n.serie_nfce) ?? e.default_series ?? 1);
  t.prepare(`
    UPDATE stores
    SET
      environment = COALESCE(?, environment),
      csc_id = COALESCE(?, csc_id),
      csc_token = COALESCE(?, csc_token),
      default_series = CASE WHEN ? > 0 THEN ? ELSE default_series END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    o,
    s,
    i,
    c,
    c,
    e.id
  ), t.prepare(`
    INSERT INTO fiscal_settings (
      store_id,
      provider,
      document_model,
      contingency_mode,
      sefaz_base_url,
      gateway_base_url,
      gateway_api_key,
      certificate_type,
      certificate_path,
      certificate_password,
      certificate_valid_until,
      ca_bundle_path,
      tls_validation_mode,
      active,
      created_at,
      updated_at
    ) VALUES (?, ?, 65, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(
    e.id,
    Vo(a == null ? void 0 : a.provider),
    jo(a == null ? void 0 : a.contingencyMode),
    z(a == null ? void 0 : a.sefazBaseUrl),
    z(a == null ? void 0 : a.gatewayBaseUrl),
    z(a == null ? void 0 : a.gatewayApiKey),
    z(n == null ? void 0 : n.cert_tipo) ?? "A1",
    z(a == null ? void 0 : a.certificatePath) ?? z(n == null ? void 0 : n.cert_path),
    z(a == null ? void 0 : a.certificatePassword) ?? z(n == null ? void 0 : n.cert_password),
    z(a == null ? void 0 : a.certificateValidUntil) ?? z(n == null ? void 0 : n.cert_validade),
    z(a == null ? void 0 : a.caBundlePath),
    Ho(a == null ? void 0 : a.tlsValidationMode)
  ), f.info(`[FiscalMigration] fiscal_settings criado para store=${e.id} usando integrations/company como origem legada.`);
}
function Jo(t) {
  const e = [];
  Fe(t, "fiscal_documents", "issued_datetime") || e.push("ALTER TABLE fiscal_documents ADD COLUMN issued_datetime TEXT"), Fe(t, "fiscal_documents", "xml_authorized") || e.push("ALTER TABLE fiscal_documents ADD COLUMN xml_authorized TEXT"), Fe(t, "fiscal_documents", "xml_cancellation") || e.push("ALTER TABLE fiscal_documents ADD COLUMN xml_cancellation TEXT"), Fe(t, "sync_queue", "result_json") || e.push("ALTER TABLE sync_queue ADD COLUMN result_json TEXT"), Fe(t, "sync_queue", "locked_at") || e.push("ALTER TABLE sync_queue ADD COLUMN locked_at TEXT"), Fe(t, "sync_queue", "locked_by") || e.push("ALTER TABLE sync_queue ADD COLUMN locked_by TEXT"), Fe(t, "sync_queue", "processed_at") || e.push("ALTER TABLE sync_queue ADD COLUMN processed_at TEXT"), e.length > 0 && t.exec(e.join(`;
`));
}
function Zo(t) {
  $o(t), ko(t, an) || qo(t), Go(t), Jo(t), Yo(t), Qo(t);
}
const nn = R.join(_e.getPath("userData"), "galberto.db");
console.log(" Criando/abrindo banco de dados em: ", nn);
const u = new _o(nn);
function es() {
  u.exec("PRAGMA foreign_keys = ON;"), f.info("-> Foreign keys ativadas");
}
function ts() {
  u.exec(`
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
    cfop TEXT,
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
  `), f.info("-> Tabela 'products' checada/criada");
}
function rs() {
  const t = [
    "current_stock REAL NOT NULL DEFAULT 0",
    "minimum_stock REAL NOT NULL DEFAULT 0",
    "ncm TEXT",
    "cfop TEXT",
    "origin TEXT",
    "fixed_ipi_value_cents INTEGER",
    "notes TEXT",
    "situation TEXT",
    "supplier_code TEXT",
    "supplier_name TEXT",
    "location TEXT",
    "maximum_stock REAL",
    "net_weight_kg REAL",
    "gross_weight_kg REAL",
    "packaging_barcode TEXT",
    "width_cm REAL",
    "height_cm REAL",
    "depth_cm REAL",
    "expiration_date TEXT",
    "supplier_product_description TEXT",
    "complementary_description TEXT",
    "items_per_box REAL",
    "is_variation INTEGER",
    "production_type TEXT",
    "ipi_tax_class TEXT",
    "service_list_code TEXT",
    "item_type TEXT",
    "tags_group TEXT",
    "tags TEXT",
    "taxes_json TEXT",
    "parent_code TEXT",
    "integration_code TEXT",
    "product_group TEXT",
    "brand TEXT",
    "cest TEXT",
    "volumes REAL",
    "short_description TEXT",
    "cross_docking_days INTEGER",
    "external_image_urls TEXT",
    "external_link TEXT",
    "supplier_warranty_months INTEGER",
    "clone_parent_data INTEGER",
    "product_condition TEXT",
    "free_shipping INTEGER",
    "fci_number TEXT",
    "department TEXT",
    "measurement_unit TEXT",
    "purchase_price_cents INTEGER",
    "icms_st_retention_base_cents INTEGER",
    "icms_st_retention_value_cents INTEGER",
    "icms_substitute_own_value_cents INTEGER",
    "product_category_name TEXT",
    "additional_info TEXT"
  ], e = u.prepare("PRAGMA table_info(products)").all(), r = new Set(e.map((a) => a.name));
  for (const a of t) {
    const [n] = a.split(" ");
    r.has(n) || u.exec(`ALTER TABLE products ADD COLUMN ${a};`);
  }
}
function as() {
  u.exec(`
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
function ns() {
  u.exec(`
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
function os() {
  u.exec(`
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
function ss() {
  u.exec(`
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
function is() {
  u.exec(`
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
function cs() {
  u.exec(`
    CREATE TABLE IF NOT EXISTS company (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      -- Identificação da empresa
      nome_fantasia TEXT NOT NULL,
      razao_social TEXT NOT NULL,
      cnpj TEXT NOT NULL UNIQUE,
      inscricao_estadual TEXT NOT NULL,
      inscricao_municipal TEXT,
      indicador_ie INTEGER NOT NULL, -- 1,2,9
      crt INTEGER NOT NULL,           -- 1=SN, 2=SN excesso sublimite, 3=Regime normal, 4=MEI
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
function us() {
  u.exec(`
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
function ds() {
  u.exec(`
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
function ls() {
  u.exec(`
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
function Es() {
  u.exec(`
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
function ms() {
  u.exec(`
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
function ps() {
  try {
    u.exec("ALTER TABLE printers ADD COLUMN paper_width_mm REAL NOT NULL DEFAULT 80");
  } catch {
  }
  try {
    u.exec("ALTER TABLE printers ADD COLUMN content_width_mm REAL NOT NULL DEFAULT 76");
  } catch {
  }
  try {
    u.exec("ALTER TABLE printers ADD COLUMN base_font_size_px REAL NOT NULL DEFAULT 13");
  } catch {
  }
  try {
    u.exec("ALTER TABLE printers ADD COLUMN line_height REAL NOT NULL DEFAULT 1.5");
  } catch {
  }
  try {
    u.exec("ALTER TABLE printers ADD COLUMN receipt_settings_json TEXT");
  } catch {
  }
}
function _s() {
  u.exec(`
    CREATE TABLE IF NOT EXISTS printer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    );
  `), f.info("-> Tabela 'printer_logs' checada/criada");
}
function Ts() {
  u.exec(`
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
function fs() {
  u.exec(`
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
function Ns() {
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
  f.info("-> Tabela 'stock_movements' checada/criada"), u.exec(t);
}
function gs() {
  u.exec(`
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
function As() {
  try {
    u.exec("ALTER TABLE cash_register_sessions ADD COLUMN expected_cash_amount REAL");
  } catch {
  }
  try {
    u.exec("ALTER TABLE cash_register_sessions ADD COLUMN closing_difference REAL");
  } catch {
  }
  try {
    u.exec("ALTER TABLE cash_register_sessions ADD COLUMN opening_notes TEXT");
  } catch {
  }
  try {
    u.exec("ALTER TABLE cash_register_sessions ADD COLUMN closing_notes TEXT");
  } catch {
  }
}
function hs() {
  u.exec(`
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
function Is() {
  try {
    u.exec("ALTER TABLE venda_pagamento ADD COLUMN cash_session_id INTEGER REFERENCES cash_register_sessions(id)");
  } catch {
  }
  try {
    u.exec("ALTER TABLE venda_pagamento ADD COLUMN valor_recebido REAL NOT NULL DEFAULT 0");
  } catch {
  }
  try {
    u.exec("ALTER TABLE venda_pagamento ADD COLUMN troco REAL NOT NULL DEFAULT 0");
  } catch {
  }
}
function Cs() {
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
    console.log("Criando tabela integrations..."), u.exec(t), console.log("Tabela criada com sucesso!");
    const e = u.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
function vs() {
  u.exec(`
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
function Ds() {
  u.exec(`
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
function Ss() {
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
    console.log("Criando tabela sync_state..."), u.exec(t), console.log("Tabela criada com sucesso!");
    const e = u.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
function Rs() {
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
    console.log("Criando tabela sync_logs..."), u.exec(t), console.log("Tabela criada com sucesso!");
    const e = u.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
ts();
rs();
as();
ns();
is();
Ts();
ss();
us();
ds();
cs();
ms();
ps();
_s();
fs();
os();
ls();
Ns();
Es();
Is();
gs();
As();
hs();
Cs();
Ss();
Rs();
vs();
Ds();
Zo(u);
function on() {
  const t = u.prepare(`
    SELECT ambiente_emissao, serie_nfce
    FROM company
    WHERE ativo = 1
    LIMIT 1
  `).get(), e = (t == null ? void 0 : t.ambiente_emissao) ?? 2, r = (t == null ? void 0 : t.serie_nfce) ?? 1, a = u.prepare(`
    SELECT COALESCE(MAX(numero), 0) + 1 AS nextNumber
    FROM vendas
    WHERE modelo_documento = 65 AND serie = ? AND ambiente = ?
  `).get(r, e);
  return {
    ambiente: e,
    serie: r,
    numero: a.nextNumber,
    naturezaOperacao: "VENDA PDV",
    modeloDocumento: 65
  };
}
function Ls(t) {
  const e = u.prepare(`
    SELECT id, barcode, name, unit, sale_price_cents, ncm, cfop, origin, cest
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
    ncm: e.ncm ?? "",
    cfop: e.cfop ?? "5102",
    cest: e.cest ?? null,
    originCode: e.origin ?? null
  };
}
function ys() {
  return u.prepare(`
    SELECT origin_code, cfop_padrao_saida_interna, csosn, icms_cst, pis_cst, cofins_cst
    FROM tax_profiles
    WHERE ativo = 1
    ORDER BY id ASC
    LIMIT 1
  `).get();
}
function Os(t) {
  const e = ys(), r = t.originCode || (e == null ? void 0 : e.origin_code) || "0", a = t.cfop || (e == null ? void 0 : e.cfop_padrao_saida_interna) || "5102", n = (e == null ? void 0 : e.pis_cst) || "49", o = (e == null ? void 0 : e.cofins_cst) || "49", s = (e == null ? void 0 : e.csosn) || "102", i = (e == null ? void 0 : e.icms_cst) ?? null;
  u.prepare(`
    INSERT INTO sale_item_tax_snapshot (
      sale_item_id, origem, origin_code, ncm, cfop, cest, csosn, icms_cst,
      pis_cst, cofins_cst, utrib, qtrib, vuntrib
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sale_item_id) DO UPDATE SET
      origem = excluded.origem,
      origin_code = excluded.origin_code,
      ncm = excluded.ncm,
      cfop = excluded.cfop,
      cest = excluded.cest,
      csosn = excluded.csosn,
      icms_cst = excluded.icms_cst,
      pis_cst = excluded.pis_cst,
      cofins_cst = excluded.cofins_cst,
      utrib = excluded.utrib,
      qtrib = excluded.qtrib,
      vuntrib = excluded.vuntrib
  `).run(
    t.saleItemId,
    r,
    r,
    t.ncm,
    a,
    t.cest,
    s,
    i,
    n,
    o,
    t.unit,
    t.quantity,
    t.unitPrice
  );
}
function sn(t, e) {
  u.prepare("DELETE FROM venda_itens WHERE venda_id = ?").run(t);
  const r = u.prepare(`
    INSERT INTO venda_itens(
      venda_id, produto_id, codigo_produto, nome_produto, gtin, gtin_tributavel,
      ncm, cfop, cest, unidade_comercial, quantidade_comercial, valor_unitario_comercial,
      unidade_tributavel, quantidade_tributavel, valor_unitario_tributavel,
      valor_bruto, valor_desconto, subtotal
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of e) {
    const n = Ls(a.produto_id), o = Number(a.quantidade ?? a.estoque_atual ?? 0), s = Number(a.preco_venda ?? n.precoUnitario), i = Number(a.valor_bruto ?? o * s), c = Math.max(0, Math.min(Number(a.valor_desconto ?? 0), i)), l = Number(a.subtotal ?? Math.max(i - c, 0)), d = r.run(
      t,
      a.produto_id,
      n.codigoProduto,
      a.nome ?? n.nomeProduto,
      n.gtin,
      n.gtin,
      n.ncm,
      n.cfop,
      n.cest,
      n.unidade,
      o,
      s,
      n.unidade,
      o,
      s,
      i,
      c,
      l
    );
    Os({
      saleItemId: Number(d.lastInsertRowid),
      ncm: n.ncm,
      cfop: n.cfop,
      cest: n.cest,
      originCode: n.originCode,
      unit: n.unidade,
      quantity: o,
      unitPrice: s
    });
  }
}
function ta(t, e, r) {
  const a = on(), n = Number(t.valor_produtos ?? t.total ?? 0), o = Number(t.valor_desconto ?? 0), s = Number(t.total ?? 0);
  return u.transaction(() => {
    let c = r ?? null;
    return c ? u.prepare(`
        UPDATE vendas
        SET
          data_movimento = datetime('now', 'localtime'),
          status = ?,
          cpf_cliente = ?,
          cliente_nome = ?,
          valor_produtos = ?,
          valor_desconto = ?,
          valor_total = ?,
          updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(
      e,
      t.cpf_cliente ?? null,
      t.consumidor_identificado ? t.cpf_cliente ?? null : "Consumidor final",
      n,
      o,
      s,
      c
    ) : c = u.prepare(`
        INSERT INTO vendas(
          data_emissao, data_movimento, status, natureza_operacao, modelo_documento,
          serie, numero, ambiente, cliente_nome, cpf_cliente, valor_produtos, valor_desconto, valor_total
        )
        VALUES(datetime('now', 'localtime'), datetime('now', 'localtime'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
      e,
      a.naturezaOperacao,
      a.modeloDocumento,
      a.serie,
      a.numero,
      a.ambiente,
      t.consumidor_identificado ? t.cpf_cliente ?? null : "Consumidor final",
      t.cpf_cliente ?? null,
      n,
      o,
      s
    ).lastInsertRowid, sn(c, t.itens), c;
  })();
}
function bs(t) {
  return {
    DINHEIRO: "01",
    CHEQUE: "02",
    CREDITO: "03",
    DEBITO: "04",
    VOUCHER: "10",
    PIX: "17"
  }[t] ?? "99";
}
function Ct(t) {
  const r = u.prepare(`
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
  return r ? {
    ...r,
    total_sangrias: Number(r.total_sangrias ?? 0),
    total_vendas_dinheiro: Number(r.total_vendas_dinheiro ?? 0),
    expected_cash_amount: Number(r.opening_cash_amount ?? 0) + Number(r.total_vendas_dinheiro ?? 0) - Number(r.total_sangrias ?? 0)
  } : null;
}
function Us(t, e) {
  if (!(e != null && e.meioPagamento))
    return;
  const r = u.prepare(`
    SELECT valor_total
    FROM vendas
    WHERE id = ?
    LIMIT 1
  `).get(t);
  if (!r)
    throw new Error(`Venda não encontrada para registrar pagamento: ${t}`);
  u.prepare("DELETE FROM venda_pagamento WHERE venda_id = ?").run(t);
  const a = Number(r.valor_total ?? 0), n = Number(e.troco ?? 0), o = e.meioPagamento === "DINHEIRO" ? Number(e.valorPago ?? a) : a;
  u.prepare(`
    INSERT INTO venda_pagamento(
      venda_id, cash_session_id, tpag, valor, valor_recebido, troco, descricao_outro
    )
    VALUES(?, ?, ?, ?, ?, ?, ?)
  `).run(
    t,
    e.cashSessionId ?? null,
    bs(e.meioPagamento),
    a,
    o,
    n,
    null
  );
}
function Fs(t) {
  u.prepare("BEGIN").run();
  try {
    const e = on(), r = Number(t.valor_produtos ?? t.total ?? 0), a = Number(t.valor_desconto ?? 0), n = Number(t.total ?? 0), s = u.prepare(`
        INSERT INTO vendas(
          data_emissao, data_movimento, status, natureza_operacao, modelo_documento,
          serie, numero, ambiente, valor_produtos, valor_desconto, valor_total
        )
        VALUES(datetime('now', 'localtime'), datetime('now', 'localtime'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
      "CANCELADA",
      e.naturezaOperacao,
      e.modeloDocumento,
      e.serie,
      e.numero,
      e.ambiente,
      r,
      a,
      n
    ).lastInsertRowid;
    return sn(s, t.itens), u.prepare("COMMIT").run(), { sucesso: !0, vendaId: s };
  } catch (e) {
    throw u.prepare("ROLLBACK").run(), e;
  }
}
function ws(t) {
  const e = typeof t == "number" ? t : t.vendaId, r = u.prepare(
    `SELECT produto_id, quantidade_comercial AS quantidade
     FROM venda_itens
     WHERE venda_id = ? `
  ), a = u.prepare(
    `SELECT current_stock
     FROM products
     WHERE id = ? AND deleted_at IS NULL
     LIMIT 1`
  ), n = u.prepare(
    `UPDATE products
     SET current_stock = current_stock - ?,
         updated_at = datetime('now')
     WHERE id = ?`
  ), o = u.prepare(
    `UPDATE produtos
     SET estoque_atual = estoque_atual - ?,
         updated_at = datetime('now')
     WHERE id = ?`
  ), s = u.prepare(
    `SELECT valor_produtos, valor_desconto, valor_total
     FROM vendas
     WHERE id = ?
     LIMIT 1`
  ), i = u.prepare(
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
  u.transaction(() => {
    const l = r.all(e), d = s.get(e);
    if (!d)
      throw new Error(`Venda não encontrada: ${e}`);
    for (const N of l) {
      const C = a.get(N.produto_id);
      if (!C)
        throw new Error(`Produto da venda não encontrado: ${N.produto_id}`);
      if (Number(C.current_stock ?? 0) < Number(N.quantidade ?? 0))
        throw new Error(`Estoque insuficiente para o produto ${N.produto_id}`);
      n.run(N.quantidade, N.produto_id), o.run(N.quantidade, N.produto_id);
    }
    const m = Number(typeof t == "number" ? d.valor_produtos ?? 0 : t.valorProdutos ?? d.valor_produtos ?? 0), E = Number(typeof t == "number" ? d.valor_desconto ?? 0 : t.valorDesconto ?? d.valor_desconto ?? 0), _ = Number(typeof t == "number" ? d.valor_total ?? 0 : t.valorTotal ?? d.valor_total ?? 0), A = typeof t == "number" ? 0 : Number(t.troco ?? 0);
    i.run(
      m,
      E,
      _,
      A,
      e
    ), Us(
      e,
      typeof t == "number" ? void 0 : t
    );
  })();
}
function xs(t) {
  var n;
  const r = u.prepare(`
    INSERT INTO cash_register_sessions
      (operator_id, pdv_id, status, opening_cash_amount, opening_notes, opened_at)
    VALUES(?, ?, 'OPEN', ?, ?, datetime('now'))
      `).run(
    t.operator_id,
    t.pdv_id,
    t.opening_cash_amount,
    ((n = t.opening_notes) == null ? void 0 : n.trim()) || null
  ), a = Ct(r.lastInsertRowid);
  if (!a)
    throw new Error("Sessão de caixa não encontrada após abertura.");
  return a;
}
function Ms(t) {
  var o;
  if (!u.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE id = ?
      AND operator_id = ?
      AND pdv_id = ?
      AND status = 'OPEN'
    LIMIT 1
  `).get(t.cash_session_id, t.operator_id, t.pdv_id))
    throw new Error("Nenhum caixa aberto foi encontrado para registrar a sangria.");
  const r = Ct(t.cash_session_id);
  if (!r)
    throw new Error("Sessão de caixa inválida para sangria.");
  const a = Number(t.amount ?? 0);
  if (a <= 0)
    throw new Error("Informe um valor válido para a sangria.");
  if (a > Number(r.expected_cash_amount ?? 0))
    throw new Error("A sangria não pode ser maior que o valor disponível em caixa.");
  u.prepare(`
    INSERT INTO cash_register_movements(
      cash_session_id, operator_id, pdv_id, movement_type, amount, reason
    )
    VALUES(?, ?, ?, ?, ?, ?)
  `).run(
    t.cash_session_id,
    t.operator_id,
    t.pdv_id,
    t.movement_type,
    a,
    ((o = t.reason) == null ? void 0 : o.trim()) || null
  );
  const n = Ct(t.cash_session_id);
  if (!n)
    throw new Error("Não foi possível recarregar a sessão após a sangria.");
  return n;
}
function Ps(t) {
  var o;
  if (u.prepare(`
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
    ((o = t.closing_notes) == null ? void 0 : o.trim()) || null,
    t.operator_id,
    t.pdv_id
  ).changes === 0)
    throw new Error("Nenhum caixa aberto foi encontrado para fechamento.");
  const a = u.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE operator_id = ?
      AND pdv_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(t.operator_id, t.pdv_id);
  if (!a)
    throw new Error("Sessão de caixa não encontrada após o fechamento.");
  const n = Ct(a.id);
  if (!n)
    throw new Error("Resumo da sessão de caixa não encontrado após o fechamento.");
  return n;
}
function Bs({ venda_id: t, data: e, status: r, page: a = 1, limit: n = 20 }) {
  const o = (a - 1) * n;
  let s = [], i = [];
  const c = { 1: "FINALIZADA", 2: "CANCELADA", 3: "ABERTA_PAGAMENTO", 4: "ORCAMENTO", 5: "PAUSADA" };
  t && (s.push("CAST(id AS TEXT) LIKE ?"), i.push(`%${t}%`)), e && (s.push("date(data_emissao) = date(?)"), i.push(e)), r !== void 0 && (s.push("status = ?"), i.push(c[r]));
  const l = s.length ? `WHERE ${s.join(" AND ")} ` : "", d = u.prepare(`
    SELECT * FROM vendas
      ${l}
      ORDER BY id DESC
    LIMIT ? OFFSET ?
      `).all(...i, n, o), m = u.prepare(`
      SELECT COUNT(*) as total
      FROM vendas
      ${l}
    `).get(...i);
  return {
    data: d,
    page: a,
    limit: n,
    total: m.total
  };
}
function Xs(t) {
  const e = u.prepare(`
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
  const r = u.prepare(`
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
    itens: r
  };
}
function $s({ nome: t, codigo: e, ativo: r, page: a = 1, limit: n = 20 }) {
  const o = (a - 1) * n;
  let s = [], i = [];
  t && (s.push("name LIKE ?"), i.push(`%${t}%`)), e && (s.push("(barcode LIKE ? OR sku LIKE ?)"), i.push(`%${e}%`, `%${e}%`)), r !== void 0 && (s.push("active = ?"), i.push(r));
  const c = u.prepare(`
      SELECT
        id,
        barcode AS codigo_barras,
        name AS nome,
        ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
        current_stock AS estoque_atual,
        active AS ativo
      FROM products
      WHERE deleted_at IS NULL
      ${s.length ? `AND ${s.join(" AND ")}` : ""}
      ORDER BY name
    LIMIT ? OFFSET ?
      `).all(...i, n, o), l = u.prepare(`
      SELECT COUNT(*) as total
      FROM products
      WHERE deleted_at IS NULL
      ${s.length ? `AND ${s.join(" AND ")}` : ""}
    `).get(...i);
  return {
    data: c,
    page: a,
    limit: n,
    total: l.total
  };
}
function ks(t) {
  return u.prepare(`
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
      cfop,
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
  `).get(t);
}
function qs(t) {
  return u.prepare(`
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
function Gs(t) {
  return u.prepare(`
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
function Vs(t) {
  return u.prepare(`
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
      `).all(t, t, `%${t}%`).map((a) => ({
    id: a.id,
    internalCode: a.sku ?? "",
    name: a.name,
    brand: a.brand ?? "",
    gtin: a.barcode ?? "",
    unitOfMeasure: a.unit ?? "UN",
    currentStock: Number(a.current_stock ?? 0),
    minimumStock: Number(a.minimum_stock ?? 0),
    avgCost: Number(a.cost_price_cents ?? 0) / 100,
    ncm: a.ncm ?? "",
    cfop: a.cfop ?? "",
    controlsExpiration: !1,
    controlsBatch: !1
  }));
}
console.log(u);
function zs(t) {
  t.is_default === 1 && u.prepare("UPDATE printers SET is_default = 0 WHERE is_default = 1").run(), u.prepare(`
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
function js() {
  return u.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
           paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json, notes, is_default, installed_at
    FROM printers
    ORDER BY is_default DESC, id DESC
      `).all();
}
function Hs() {
  return u.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, is_default,
           paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
    FROM printers
    WHERE is_default = 1
    LIMIT 1
  `).get();
}
function Ks(t, e) {
  return u.prepare(`
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
function Ys(t, e) {
  return u.prepare(`
    UPDATE printers
    SET receipt_settings_json = ?
    WHERE id = ?
  `).run(e, t);
}
function Ws(t) {
  return u.prepare("DELETE FROM printers WHERE id = ? ").run(t);
}
function Qs(t) {
  u.transaction(() => {
    u.prepare("UPDATE printers SET is_default = 0 WHERE is_default = 1").run(), u.prepare("UPDATE printers SET is_default = 1 WHERE id = ? ").run(t);
  })();
}
function Js() {
  u.prepare("SELECT COUNT(*) as total FROM usuarios").get().total === 0 && (u.prepare(`
      INSERT INTO usuarios(nome, funcao, email, username, password, ativo)
    VALUES(?, ?, ?, ?, ?, ?)
      `).run(
    "Administrador",
    "Gerente",
    "admin@galberto.local",
    "admin",
    Jt("admin123"),
    1
  ), f.info("-> Usuário admin padrão criado (admin / admin123)"), console.log("-> Usuário admin padrão criado (admin / admin123)"));
}
function Zs(t) {
  return u.prepare(`
    SELECT id, nome, funcao, email, username, ativo, foto_path
    FROM usuarios
    WHERE id = ?
      `).get(t);
}
function ei({ name: t, role: e, login: r, ativo: a, page: n = 1, limit: o = 20 }) {
  const s = (n - 1) * o;
  let i = [], c = [];
  t && (i.push("nome LIKE ?"), c.push(`% ${t}% `)), e && (i.push("funcao LIKE ?"), c.push(`% ${e}% `)), r && (i.push("username LIKE ?"), c.push(`% ${r}% `)), a !== void 0 && (i.push("ativo = ?"), c.push(a));
  const l = i.length ? `WHERE ${i.join(" AND ")} ` : "", d = u.prepare(`
      SELECT id, nome, funcao AS role, email, username AS login, ativo
      FROM usuarios
      ${l}
      ORDER BY nome
    LIMIT ? OFFSET ?
      `).all(...c, o, s), m = u.prepare(`
      SELECT COUNT(*) as total
      FROM usuarios
      ${l}
    `).get(...c);
  return {
    data: d,
    page: n,
    limit: o,
    total: m.total
  };
}
function ti(t) {
  return u.prepare(`
    INSERT INTO usuarios(nome, funcao, email, username, password, ativo, foto_path)
    VALUES(@nome, @funcao, @email, @username, @password, @ativo, @foto_path)
  `).run({
    ...t,
    foto_path: t.foto_path ?? null,
    password: Jt(t.password)
  });
}
function ri(t, e) {
  return u.prepare("UPDATE usuarios SET password = ? WHERE id = ? ").run(Jt(e), t);
}
function ai(t) {
  return u.prepare("DELETE FROM usuarios WHERE id = ? ").run(t);
}
function ni(t) {
  console.log("Dados chegando no db.ts", t);
  const e = [], r = [];
  t.nome !== void 0 && (e.push("nome = ?"), r.push(t.nome)), t.email !== void 0 && (e.push("email = ?"), r.push(t.email)), t.login !== void 0 && (e.push("username = ?"), r.push(t.login)), t.role !== void 0 && (e.push("funcao = ?"), r.push(t.role)), r.push(t.id);
  const a = `
  UPDATE usuarios
  SET ${e.join(", ")}
  WHERE id = ?
      `;
  u.prepare(a).run(...r);
}
function oi(t) {
  return u.prepare("UPDATE usuarios SET ativo = 0 WHERE id = ? ").run(t);
}
function si(t) {
  return u.prepare("UPDATE usuarios SET ativo = 1 WHERE id = ? ").run(t);
}
Js();
function ii(t) {
  const r = u.prepare(`
    SELECT id
      FROM cash_register_sessions
    WHERE pdv_id = ?
      AND operator_id = ?
        AND status = 'OPEN'
    ORDER BY opened_at DESC
    LIMIT 1;
    `).get(t.pdv_id, t.operator_id);
  return r ? Ct(r.id) : null;
}
function vr(t) {
  return JSON.stringify(t ?? null);
}
function Vt(t) {
  return t ? 1 : 0;
}
function ci(t) {
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
function ui(t) {
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
function di(t) {
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
class li {
  create(e) {
    return u.transaction(() => {
      const a = u.prepare(`
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
      ), n = Number(a.lastInsertRowid), o = u.prepare(`
        INSERT INTO sale_items (
          sale_id, product_id, sku, description, unit, quantity, unit_price,
          gross_amount, discount_amount, total_amount, ncm, cfop, cest,
          origin_code, tax_snapshot_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      for (const i of e.items)
        o.run(
          n,
          i.productId ?? null,
          i.sku ?? null,
          i.description,
          i.unit,
          i.quantity,
          i.unitPrice,
          i.grossAmount,
          i.discountAmount ?? 0,
          i.totalAmount,
          i.ncm ?? null,
          i.cfop ?? null,
          i.cest ?? null,
          i.originCode ?? null,
          i.taxSnapshot ? vr(i.taxSnapshot) : null
        );
      const s = u.prepare(`
        INSERT INTO payments (
          sale_id, method, amount, received_amount, change_amount,
          integration_reference, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      for (const i of e.payments)
        s.run(
          n,
          i.method,
          i.amount,
          i.receivedAmount ?? i.amount,
          i.changeAmount ?? 0,
          i.integrationReference ?? null
        );
      return this.findAggregateById(n);
    })();
  }
  findById(e) {
    const r = u.prepare("SELECT * FROM sales WHERE id = ? LIMIT 1").get(e);
    return r ? ci(r) : null;
  }
  findByExternalReference(e) {
    const r = u.prepare(`
      SELECT * FROM sales
      WHERE external_reference = ?
      LIMIT 1
    `).get(e);
    return r ? this.findAggregateById(r.id) : null;
  }
  findAggregateById(e) {
    const r = this.findById(e);
    if (!r) return null;
    const a = u.prepare("SELECT * FROM sale_items WHERE sale_id = ? ORDER BY id ASC").all(e), n = u.prepare("SELECT * FROM payments WHERE sale_id = ? ORDER BY id ASC").all(e), o = u.prepare("SELECT id FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return {
      sale: r,
      items: a.map(ui),
      payments: n.map(di),
      fiscalDocument: o ? { id: o.id } : null
    };
  }
  listRecent(e = 20) {
    return u.prepare(`
      SELECT * FROM sales
      ORDER BY created_at DESC
      LIMIT ?
    `).all(e).map((a) => this.findAggregateById(a.id)).filter((a) => !!a);
  }
  updateStatus(e, r) {
    u.prepare(`
      UPDATE sales
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(r, e);
  }
}
const Xt = new li();
function Ei(t) {
  const e = String(t ?? "").trim();
  if (["1", "2", "3", "4"].includes(e))
    return e;
  throw new Error(`CRT/regime tributario invalido na store: ${e || "vazio"}.`);
}
function ra(t) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    legalName: t.legal_name,
    cnpj: t.cnpj,
    stateRegistration: t.state_registration,
    taxRegimeCode: Ei(t.tax_regime_code),
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
class mi {
  create(e) {
    const r = u.prepare(`
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
      Vt(e.active ?? !0)
    );
    return this.findById(Number(r.lastInsertRowid));
  }
  findById(e) {
    const r = u.prepare("SELECT * FROM stores WHERE id = ? LIMIT 1").get(e);
    return r ? ra(r) : null;
  }
  findActive() {
    const e = u.prepare(`
      SELECT * FROM stores
      WHERE active = 1
      ORDER BY id ASC
      LIMIT 1
    `).get();
    return e ? ra(e) : null;
  }
  upsertActive(e) {
    const r = e.id ? this.findById(e.id) : this.findActive();
    return r ? (u.prepare(`
      UPDATE stores
      SET
        code = ?,
        name = ?,
        legal_name = ?,
        cnpj = ?,
        state_registration = ?,
        tax_regime_code = ?,
        environment = ?,
        csc_id = ?,
        csc_token = ?,
        default_series = ?,
        next_nfce_number = ?,
        address_street = ?,
        address_number = ?,
        address_neighborhood = ?,
        address_city = ?,
        address_state = ?,
        address_zip_code = ?,
        address_city_ibge_code = ?,
        active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      e.code || r.code || "MAIN",
      e.name,
      e.legalName,
      e.cnpj,
      e.stateRegistration,
      e.taxRegimeCode,
      e.environment,
      e.cscId ?? null,
      e.cscToken ?? r.cscToken ?? null,
      e.defaultSeries ?? r.defaultSeries,
      e.nextNfceNumber ?? r.nextNfceNumber,
      e.addressStreet,
      e.addressNumber,
      e.addressNeighborhood,
      e.addressCity,
      e.addressState,
      e.addressZipCode,
      e.addressCityIbgeCode,
      Vt(e.active ?? !0),
      r.id
    ), this.findById(r.id)) : this.create({ ...e, code: e.code || "MAIN", active: !0 });
  }
  updateFiscalConfiguration(e, r) {
    const a = this.findById(e);
    if (!a)
      throw new Error(`Store ${e} não encontrada.`);
    return u.prepare(`
      UPDATE stores
      SET
        environment = ?,
        csc_id = ?,
        csc_token = ?,
        default_series = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      r.environment ?? a.environment,
      r.cscId ?? a.cscId ?? null,
      r.cscToken ?? a.cscToken ?? null,
      r.defaultSeries && r.defaultSeries > 0 ? r.defaultSeries : a.defaultSeries,
      e
    ), this.findById(e);
  }
  reserveNextNfceNumber(e) {
    return u.transaction(() => {
      const a = u.prepare(`
        SELECT default_series, next_nfce_number
        FROM stores
        WHERE id = ?
        LIMIT 1
      `).get(e);
      if (!a)
        throw new Error(`Store ${e} não encontrada.`);
      return u.prepare(`
        UPDATE stores
        SET next_nfce_number = next_nfce_number + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(e), {
        series: a.default_series,
        number: a.next_nfce_number
      };
    })();
  }
}
const se = new mi();
function Et(t) {
  return Number(t ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
class pi {
  constructor() {
    ce(this, "outputDir", st.join(_e.getPath("userData"), "fiscal", "danfe"));
  }
  async generate(e) {
    Ee.mkdirSync(this.outputDir, { recursive: !0 });
    const r = e.danfePath || st.join(this.outputDir, `nfce-${e.id}.html`), a = this.render(e);
    return Ee.writeFileSync(r, a, "utf8"), {
      documentId: e.id,
      danfePath: r,
      contentType: "text/html",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async recover(e) {
    return !e.danfePath || !Ee.existsSync(e.danfePath) ? null : {
      documentId: e.id,
      danfePath: e.danfePath,
      contentType: "text/html",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  render(e) {
    const r = Xt.findAggregateById(e.saleId), a = se.findById(e.companyId), n = e.environment === "homologation", o = (r == null ? void 0 : r.items) ?? [], s = (r == null ? void 0 : r.payments) ?? [], i = (r == null ? void 0 : r.sale.totalAmount) ?? 0;
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
      <div class="subtitle">${(a == null ? void 0 : a.legalName) ?? "Emitente não encontrado"}</div>
      <div class="subtitle">CNPJ ${(a == null ? void 0 : a.cnpj) ?? "—"} | IE ${(a == null ? void 0 : a.stateRegistration) ?? "—"}</div>
      <div class="subtitle">${a ? `${a.addressStreet}, ${a.addressNumber} - ${a.addressNeighborhood}` : "Endereço indisponível"}</div>
      <div class="subtitle">${a ? `${a.addressCity}/${a.addressState}` : ""}</div>
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
      ${o.map((c) => `
        <div class="item">
          <strong>${c.description}</strong>
          <div class="row"><span>${Number(c.quantity).toFixed(3)} x ${Et(c.unitPrice)}</span><span>${Et(c.totalAmount)}</span></div>
        </div>
      `).join("")}
      <div class="divider"></div>
      <div class="subtitle"><strong>Pagamentos</strong></div>
      ${s.map((c) => `
        <div class="row">
          <span>${c.method}</span>
          <span>${Et(c.amount)}</span>
        </div>
      `).join("")}
      <div class="row"><span class="muted">Troco</span><span>${Et((r == null ? void 0 : r.sale.changeAmount) ?? 0)}</span></div>
      <div class="row"><span class="muted">Total</span><span><strong>${Et(i)}</strong></span></div>
      <div class="divider"></div>
      <div class="row"><span class="muted">Chave</span><span>${e.accessKey ?? "Pendente"}</span></div>
      <div class="qr">${e.qrCodeUrl ?? "QR Code indisponível"}</div>
    </div>
  </body>
</html>`;
  }
}
class I extends Error {
  constructor(r) {
    super(r.message);
    ce(this, "code");
    ce(this, "category");
    ce(this, "retryable");
    ce(this, "details");
    this.name = "FiscalError", this.code = r.code, this.category = r.category, this.retryable = r.retryable ?? !1, this.details = r.details, r.cause !== void 0 && (this.cause = r.cause);
  }
}
function Z(t, e = "FISCAL_INTERNAL_ERROR") {
  return t instanceof I ? t : t instanceof Error ? new I({
    code: e,
    message: t.message,
    category: "INTERNAL",
    retryable: !1,
    cause: t
  }) : new I({
    code: e,
    message: "Erro interno na camada fiscal.",
    category: "INTERNAL",
    retryable: !1,
    details: t
  });
}
class _i {
  readCertificatePem(e) {
    var n;
    const r = (n = e.certificatePath) == null ? void 0 : n.trim();
    if (!r)
      return null;
    const a = st.extname(r).toLowerCase();
    if (a === ".pem" || a === ".crt" || a === ".cer")
      return Ee.readFileSync(r, "utf8");
    if (a === ".pfx" || a === ".p12") {
      if (!e.certificatePassword)
        throw new I({
          code: "CERTIFICATE_PASSWORD_REQUIRED",
          message: "Senha do certificado não configurada.",
          category: "CERTIFICATE"
        });
      try {
        return Ar(
          "openssl",
          ["pkcs12", "-in", r, "-clcerts", "-nokeys", "-passin", `pass:${e.certificatePassword}`],
          { encoding: "utf8" }
        );
      } catch (o) {
        throw new I({
          code: "CERTIFICATE_READ_FAILED",
          message: "Não foi possível validar o certificado digital informado.",
          category: "CERTIFICATE",
          cause: o
        });
      }
    }
    return null;
  }
  async getCertificateInfo(e) {
    var s;
    const r = (s = e.certificatePath) == null ? void 0 : s.trim(), a = (/* @__PURE__ */ new Date()).toISOString();
    if (!r)
      return {
        configured: !1,
        type: "UNKNOWN",
        lastCheckedAt: a
      };
    const n = Ee.existsSync(r);
    let o = null;
    if (n)
      try {
        const i = this.readCertificatePem(e);
        if (i) {
          const c = new Jr(i);
          o = new Date(c.validTo).toISOString();
        }
      } catch {
        o = null;
      }
    return {
      configured: n,
      type: [".pfx", ".p12"].includes(st.extname(r).toLowerCase()) ? "A1" : "UNKNOWN",
      alias: st.basename(r),
      source: r,
      validUntil: o,
      lastCheckedAt: a
    };
  }
  async assertCertificateReady(e) {
    if (e.provider === "mock")
      return;
    if (!e.certificatePath)
      throw new I({
        code: "CERTIFICATE_NOT_CONFIGURED",
        message: "Certificado fiscal não configurado.",
        category: "CERTIFICATE"
      });
    if (!Ee.existsSync(e.certificatePath))
      throw new I({
        code: "CERTIFICATE_FILE_NOT_FOUND",
        message: `Arquivo do certificado não encontrado: ${e.certificatePath}`,
        category: "CERTIFICATE"
      });
    const r = this.readCertificatePem(e);
    if (!r)
      throw new I({
        code: "CERTIFICATE_FORMAT_NOT_SUPPORTED",
        message: "Formato de certificado não suportado pela camada fiscal atual.",
        category: "CERTIFICATE"
      });
    const a = new Jr(r);
    if (new Date(a.validTo).getTime() < Date.now())
      throw new I({
        code: "CERTIFICATE_EXPIRED",
        message: "O certificado digital configurado está expirado.",
        category: "CERTIFICATE"
      });
  }
}
function aa(t) {
  return {
    id: t.id,
    storeId: t.store_id,
    provider: t.provider,
    documentModel: t.document_model,
    contingencyMode: t.contingency_mode,
    sefazBaseUrl: t.sefaz_base_url,
    gatewayBaseUrl: t.gateway_base_url,
    gatewayApiKey: t.gateway_api_key,
    certificateType: t.certificate_type,
    certificatePath: t.certificate_path,
    certificatePassword: t.certificate_password,
    certificateValidUntil: t.certificate_valid_until,
    caBundlePath: t.ca_bundle_path,
    tlsValidationMode: t.tls_validation_mode,
    active: !!t.active,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
class Ti {
  findActiveByStoreId(e) {
    const r = u.prepare(`
      SELECT *
      FROM fiscal_settings
      WHERE store_id = ? AND active = 1
      ORDER BY id DESC
      LIMIT 1
    `).get(e);
    return r ? aa(r) : null;
  }
  upsertActive(e) {
    const r = this.findActiveByStoreId(e.storeId);
    if (!r) {
      const a = u.prepare(`
        INSERT INTO fiscal_settings (
          store_id,
          provider,
          document_model,
          contingency_mode,
          sefaz_base_url,
          gateway_base_url,
          gateway_api_key,
          certificate_type,
          certificate_path,
          certificate_password,
          certificate_valid_until,
          ca_bundle_path,
          tls_validation_mode,
          active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        e.storeId,
        e.provider,
        e.documentModel ?? 65,
        e.contingencyMode ?? "queue",
        e.sefazBaseUrl ?? null,
        e.gatewayBaseUrl ?? null,
        e.gatewayApiKey ?? null,
        e.certificateType ?? "A1",
        e.certificatePath ?? null,
        e.certificatePassword ?? null,
        e.certificateValidUntil ?? null,
        e.caBundlePath ?? null,
        e.tlsValidationMode ?? "strict",
        Vt(e.active ?? !0)
      );
      return this.findById(Number(a.lastInsertRowid));
    }
    return u.prepare(`
      UPDATE fiscal_settings
      SET
        provider = ?,
        document_model = ?,
        contingency_mode = ?,
        sefaz_base_url = ?,
        gateway_base_url = ?,
        gateway_api_key = ?,
        certificate_type = ?,
        certificate_path = ?,
        certificate_password = ?,
        certificate_valid_until = ?,
        ca_bundle_path = ?,
        tls_validation_mode = ?,
        active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      e.provider,
      e.documentModel ?? r.documentModel,
      e.contingencyMode ?? r.contingencyMode ?? "queue",
      e.sefazBaseUrl ?? null,
      e.gatewayBaseUrl ?? null,
      e.gatewayApiKey ?? null,
      e.certificateType ?? r.certificateType,
      e.certificatePath ?? null,
      e.certificatePassword ?? null,
      e.certificateValidUntil ?? null,
      e.caBundlePath ?? null,
      e.tlsValidationMode ?? r.tlsValidationMode,
      Vt(e.active ?? r.active),
      r.id
    ), this.findById(r.id);
  }
  findById(e) {
    const r = u.prepare(`
      SELECT *
      FROM fiscal_settings
      WHERE id = ?
      LIMIT 1
    `).get(e);
    return r ? aa(r) : null;
  }
}
const cn = new Ti(), ht = "fiscal:nfce", na = "__FISCAL_CONFIG__";
function Dr() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function oa() {
  return {
    provider: "mock",
    environment: "homologation",
    contingencyMode: "queue",
    integrationId: ht,
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
    certificateType: "A1",
    certificateValidUntil: null,
    caBundlePath: null,
    tlsValidationMode: "strict",
    updatedAt: Dr()
  };
}
function sa(t) {
  return {
    provider: t.provider,
    environment: t.environment,
    contingencyMode: t.contingencyMode,
    integrationId: t.integrationId,
    gatewayBaseUrl: t.gatewayBaseUrl ?? null,
    sefazBaseUrl: t.sefazBaseUrl ?? null,
    certificatePath: t.certificatePath ?? null,
    cscId: t.cscId ?? null,
    uf: t.uf ?? "SP",
    model: t.model ?? 65,
    defaultSeries: t.defaultSeries ?? null,
    certificateType: t.certificateType ?? "A1",
    certificateValidUntil: t.certificateValidUntil ?? null,
    caBundlePath: t.caBundlePath ?? null,
    tlsValidationMode: t.tlsValidationMode ?? "strict",
    hasGatewayApiKey: !!t.gatewayApiKey,
    hasCertificatePassword: !!t.certificatePassword,
    hasCscToken: !!t.cscToken,
    updatedAt: t.updatedAt
  };
}
class un {
  /**
   * Legacy fallback only.
   * Fiscal runtime must use FiscalSettingsService/FiscalContextResolver as the primary source.
   */
  getConfig() {
    const e = u.prepare(`
      SELECT integration_id, raw_json, updated_at
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(ht);
    if (!(e != null && e.raw_json))
      return f.warn("[FiscalConfig] Configuracao fiscal fiscal:nfce nao encontrada. Usando defaults."), oa();
    const r = JSON.parse(e.raw_json);
    return f.info(`[FiscalConfig] Configuracao fiscal carregada provider=${r.provider ?? "mock"} ambiente=${r.environment ?? "homologation"} uf=${r.uf ?? "SP"}.`), {
      ...oa(),
      ...r,
      integrationId: ht,
      updatedAt: r.updatedAt ?? e.updated_at ?? Dr()
    };
  }
  getConfigView() {
    return sa(this.getConfig());
  }
  saveConfig(e) {
    const r = this.getConfig(), a = {
      ...r,
      ...e,
      gatewayApiKey: e.gatewayApiKey === "" ? r.gatewayApiKey : e.gatewayApiKey ?? r.gatewayApiKey,
      certificatePassword: e.certificatePassword === "" ? r.certificatePassword : e.certificatePassword ?? r.certificatePassword,
      cscToken: e.cscToken === "" ? r.cscToken : e.cscToken ?? r.cscToken,
      integrationId: ht,
      updatedAt: Dr()
    };
    return u.prepare(`
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
      ht,
      na,
      na,
      "CONFIG",
      "9999-12-31T23:59:59.999Z",
      "fiscal:nfce",
      JSON.stringify(a),
      a.updatedAt
    ), f.info(`[FiscalConfig] Configuracao fiscal salva provider=${a.provider} ambiente=${a.environment} uf=${a.uf ?? "SP"}.`), sa(a);
  }
}
function fi(t) {
  const e = String(t ?? "").trim();
  if (["1", "2", "3", "4"].includes(e))
    return e;
  throw new Error(`CRT/regime tributario invalido na company legada: ${e || "vazio"}.`);
}
function Ni(t) {
  return {
    code: "MAIN",
    name: t.nome_fantasia,
    legalName: t.razao_social,
    cnpj: t.cnpj,
    stateRegistration: t.inscricao_estadual,
    taxRegimeCode: fi(t.crt),
    environment: t.ambiente_emissao === 1 ? "production" : "homologation",
    cscId: t.csc_id,
    cscToken: t.csc_token,
    defaultSeries: Number(t.serie_nfce ?? 1),
    nextNfceNumber: Number(t.proximo_numero_nfce ?? 1),
    addressStreet: t.rua,
    addressNumber: t.numero,
    addressNeighborhood: t.bairro,
    addressCity: t.cidade,
    addressState: t.uf,
    addressZipCode: t.cep,
    addressCityIbgeCode: t.cod_municipio_ibge,
    active: !!t.ativo
  };
}
function dn() {
  const t = se.findActive();
  if (t) return t;
  const e = u.prepare(`
    SELECT *
    FROM company
    WHERE ativo = 1
    ORDER BY id ASC
    LIMIT 1
  `).get();
  if (!e)
    return f.warn("[FiscalStore] Nenhuma store ativa e nenhuma company ativa encontrada."), null;
  const r = se.create(Ni(e));
  return f.info(`[FiscalStore] Store fiscal criada a partir de company ativa store=${r.id}.`), r;
}
const gi = "fiscal:nfce";
function Ai(t) {
  return (t ?? "SP").trim().toUpperCase() || "SP";
}
function hi(t) {
  return {
    provider: t.provider,
    environment: t.environment,
    contingencyMode: t.contingencyMode,
    integrationId: gi,
    certificateType: t.certificateType ?? "A1",
    sefazBaseUrl: t.sefazBaseUrl ?? null,
    gatewayBaseUrl: t.gatewayBaseUrl ?? null,
    gatewayApiKey: t.gatewayApiKey ?? null,
    certificatePath: t.certificatePath ?? null,
    certificatePassword: t.certificatePassword ?? null,
    certificateValidUntil: t.certificateValidUntil ?? null,
    caBundlePath: t.caBundlePath ?? null,
    tlsValidationMode: t.tlsValidationMode,
    cscId: t.cscId ?? null,
    cscToken: t.cscToken ?? null,
    uf: t.uf,
    model: t.documentModel,
    defaultSeries: t.defaultSeries,
    updatedAt: t.updatedAt
  };
}
class Ii {
  constructor(e = new un()) {
    this.legacySettings = e;
  }
  resolve(e) {
    const r = e ? se.findById(e) : dn();
    if (e && !r)
      throw new Error(`Store fiscal ${e} não encontrada ou inativa.`);
    if (!r)
      throw new Error("Nenhuma store fiscal ativa encontrada. Cadastre os dados do emitente antes da emissão.");
    const a = cn.findActiveByStoreId(r.id), n = a ? null : this.legacySettings.getConfig(), o = !a && !!n;
    o && f.warn(`[FiscalContext] Usando fallback legado integrations para store=${r.id}.`);
    const s = a ? "fiscal_settings" : o ? "integrations-fallback" : "defaults";
    return this.buildContext(r, a, n ?? null, s, o);
  }
  resolveProviderConfig(e) {
    return hi(this.resolve(e));
  }
  buildContext(e, r, a, n, o) {
    return {
      storeId: e.id,
      provider: (r == null ? void 0 : r.provider) ?? (a == null ? void 0 : a.provider) ?? "mock",
      environment: e.environment,
      contingencyMode: (r == null ? void 0 : r.contingencyMode) ?? (a == null ? void 0 : a.contingencyMode) ?? "queue",
      documentModel: 65,
      sefazBaseUrl: (r == null ? void 0 : r.sefazBaseUrl) ?? (a == null ? void 0 : a.sefazBaseUrl) ?? null,
      gatewayBaseUrl: (r == null ? void 0 : r.gatewayBaseUrl) ?? (a == null ? void 0 : a.gatewayBaseUrl) ?? null,
      gatewayApiKey: (r == null ? void 0 : r.gatewayApiKey) ?? (a == null ? void 0 : a.gatewayApiKey) ?? null,
      certificateType: (r == null ? void 0 : r.certificateType) ?? (a == null ? void 0 : a.certificateType) ?? "A1",
      certificatePath: (r == null ? void 0 : r.certificatePath) ?? (a == null ? void 0 : a.certificatePath) ?? null,
      certificatePassword: (r == null ? void 0 : r.certificatePassword) ?? (a == null ? void 0 : a.certificatePassword) ?? null,
      certificateValidUntil: (r == null ? void 0 : r.certificateValidUntil) ?? (a == null ? void 0 : a.certificateValidUntil) ?? null,
      caBundlePath: (r == null ? void 0 : r.caBundlePath) ?? (a == null ? void 0 : a.caBundlePath) ?? null,
      tlsValidationMode: (r == null ? void 0 : r.tlsValidationMode) ?? (a == null ? void 0 : a.tlsValidationMode) ?? "strict",
      cscId: e.cscId ?? (a == null ? void 0 : a.cscId) ?? null,
      cscToken: e.cscToken ?? (a == null ? void 0 : a.cscToken) ?? null,
      uf: Ai(e.addressState ?? (a == null ? void 0 : a.uf)),
      defaultSeries: e.defaultSeries,
      nextNfceNumber: e.nextNfceNumber,
      emitter: {
        cnpj: e.cnpj,
        stateRegistration: e.stateRegistration,
        legalName: e.legalName,
        tradeName: e.name,
        taxRegimeCode: e.taxRegimeCode,
        address: {
          street: e.addressStreet,
          number: e.addressNumber,
          neighborhood: e.addressNeighborhood,
          city: e.addressCity,
          state: e.addressState,
          zipCode: e.addressZipCode,
          cityIbgeCode: e.addressCityIbgeCode
        }
      },
      source: {
        store: "stores",
        settings: n,
        legacyFallbackUsed: o
      },
      updatedAt: (r == null ? void 0 : r.updatedAt) ?? (a == null ? void 0 : a.updatedAt) ?? e.updatedAt
    };
  }
}
const Oe = new Ii(), Ci = "fiscal:nfce";
function ia(t) {
  return {
    provider: t.provider,
    environment: t.environment,
    contingencyMode: t.contingencyMode,
    integrationId: t.integrationId,
    certificateType: t.certificateType ?? "A1",
    gatewayBaseUrl: t.gatewayBaseUrl ?? null,
    sefazBaseUrl: t.sefazBaseUrl ?? null,
    certificatePath: t.certificatePath ?? null,
    certificateValidUntil: t.certificateValidUntil ?? null,
    caBundlePath: t.caBundlePath ?? null,
    tlsValidationMode: t.tlsValidationMode ?? "strict",
    cscId: t.cscId ?? null,
    uf: t.uf ?? "SP",
    model: t.model ?? 65,
    defaultSeries: t.defaultSeries ?? null,
    hasGatewayApiKey: !!t.gatewayApiKey,
    hasCertificatePassword: !!t.certificatePassword,
    hasCscToken: !!t.cscToken,
    updatedAt: t.updatedAt
  };
}
function Re(t) {
  if (t == null) return null;
  const e = t.trim();
  return e.length > 0 ? e : null;
}
class vi {
  constructor(e = new un()) {
    this.legacySettings = e;
  }
  getConfig() {
    return Oe.resolveProviderConfig();
  }
  getConfigView() {
    return ia(this.getConfig());
  }
  saveConfig(e) {
    const r = dn();
    if (!r)
      throw new Error("Nenhuma store fiscal ativa encontrada. Cadastre os dados do emitente antes de salvar a configuração fiscal.");
    const a = this.getConfig(), n = e.certificatePassword === "" ? a.certificatePassword : e.certificatePassword ?? a.certificatePassword ?? null, o = e.gatewayApiKey === "" ? a.gatewayApiKey : e.gatewayApiKey ?? a.gatewayApiKey ?? null, s = e.cscToken === "" ? a.cscToken : e.cscToken ?? a.cscToken ?? null, i = se.updateFiscalConfiguration(r.id, {
      environment: e.environment,
      cscId: Re(e.cscId) ?? a.cscId ?? null,
      cscToken: s,
      defaultSeries: e.defaultSeries ?? a.defaultSeries ?? r.defaultSeries
    }), c = cn.upsertActive({
      storeId: i.id,
      provider: e.provider,
      documentModel: e.model ?? 65,
      contingencyMode: e.contingencyMode,
      sefazBaseUrl: Re(e.sefazBaseUrl),
      gatewayBaseUrl: Re(e.gatewayBaseUrl),
      gatewayApiKey: Re(o),
      certificateType: e.certificateType ?? a.certificateType ?? "A1",
      certificatePath: Re(e.certificatePath) ?? a.certificatePath ?? null,
      certificatePassword: Re(n),
      certificateValidUntil: Re(e.certificateValidUntil) ?? a.certificateValidUntil ?? null,
      caBundlePath: Re(e.caBundlePath),
      tlsValidationMode: e.tlsValidationMode ?? a.tlsValidationMode ?? "strict",
      active: !0
    }), l = Oe.resolveProviderConfig(i.id);
    return this.mirrorLegacyConfig(l), f.info(`[FiscalConfig] Configuracao fiscal salva em fiscal_settings store=${c.storeId} provider=${c.provider} ambiente=${i.environment}.`), ia(l);
  }
  mirrorLegacyConfig(e) {
    try {
      this.legacySettings.saveConfig({
        provider: e.provider,
        environment: e.environment,
        contingencyMode: e.contingencyMode,
        certificateType: e.certificateType,
        sefazBaseUrl: e.sefazBaseUrl,
        gatewayBaseUrl: e.gatewayBaseUrl,
        gatewayApiKey: e.gatewayApiKey,
        certificatePath: e.certificatePath,
        certificatePassword: e.certificatePassword,
        certificateValidUntil: e.certificateValidUntil,
        caBundlePath: e.caBundlePath,
        tlsValidationMode: e.tlsValidationMode,
        cscId: e.cscId,
        cscToken: e.cscToken,
        uf: e.uf,
        model: e.model,
        defaultSeries: e.defaultSeries
      });
    } catch (r) {
      f.warn(`[FiscalConfig] Falha ao espelhar configuracao fiscal no legado integrations: ${r instanceof Error ? r.message : String(r)}`);
    }
  }
  getLegacyRowForDiagnostics() {
    return u.prepare(`
      SELECT integration_id, updated_at
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(Ci);
  }
}
function mt(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function w(t) {
  return typeof t == "string" && t.trim().length > 0;
}
function D(t, e, r, a, n, o = "error") {
  t.push({ code: e, message: r, field: a, table: n, severity: o });
}
class Di {
  validateContext(e) {
    const r = [];
    mt(e.emitter.cnpj).length !== 14 && D(r, "EMITTER_CNPJ_REQUIRED", "CNPJ do emitente deve ter 14 digitos.", "cnpj", "stores"), w(e.emitter.stateRegistration) || D(r, "EMITTER_IE_REQUIRED", "IE do emitente e obrigatoria.", "state_registration", "stores"), w(e.emitter.legalName) || D(r, "EMITTER_LEGAL_NAME_REQUIRED", "Razao social do emitente e obrigatoria.", "legal_name", "stores"), w(e.emitter.taxRegimeCode) || D(r, "EMITTER_TAX_REGIME_REQUIRED", "Regime tributario/CRT e obrigatorio.", "tax_regime_code", "stores");
    const a = e.emitter.address;
    return w(a.street) || D(r, "EMITTER_STREET_REQUIRED", "Logradouro do emitente e obrigatorio.", "address_street", "stores"), w(a.number) || D(r, "EMITTER_NUMBER_REQUIRED", "Numero do endereco do emitente e obrigatorio.", "address_number", "stores"), w(a.neighborhood) || D(r, "EMITTER_NEIGHBORHOOD_REQUIRED", "Bairro do emitente e obrigatorio.", "address_neighborhood", "stores"), w(a.city) || D(r, "EMITTER_CITY_REQUIRED", "Municipio do emitente e obrigatorio.", "address_city", "stores"), (!w(a.state) || a.state.length !== 2) && D(r, "EMITTER_UF_REQUIRED", "UF do emitente deve ter 2 letras.", "address_state", "stores"), mt(a.zipCode).length !== 8 && D(r, "EMITTER_ZIP_REQUIRED", "CEP do emitente deve ter 8 digitos.", "address_zip_code", "stores"), mt(a.cityIbgeCode).length !== 7 && D(r, "EMITTER_IBGE_REQUIRED", "Codigo IBGE do municipio deve ter 7 digitos.", "address_city_ibge_code", "stores"), e.environment || D(r, "FISCAL_ENVIRONMENT_REQUIRED", "Ambiente fiscal e obrigatorio.", "environment", "stores"), e.provider || D(r, "FISCAL_PROVIDER_REQUIRED", "Provider fiscal e obrigatorio.", "provider", "fiscal_settings"), e.provider === "sefaz-direct" && !w(e.sefazBaseUrl) && e.uf !== "SP" && D(r, "SEFAZ_URL_REQUIRED", "URL SEFAZ deve ser configurada para UF diferente de SP.", "sefaz_base_url", "fiscal_settings"), e.provider === "gateway" && !w(e.gatewayBaseUrl) && D(r, "GATEWAY_URL_REQUIRED", "URL do gateway fiscal e obrigatoria para provider gateway.", "gateway_base_url", "fiscal_settings"), e.provider === "gateway" && !w(e.gatewayApiKey) && D(r, "GATEWAY_API_KEY_REQUIRED", "API key do gateway fiscal e obrigatoria para provider gateway.", "gateway_api_key", "fiscal_settings"), e.provider !== "mock" && (w(e.certificatePath) || D(r, "CERTIFICATE_PATH_REQUIRED", "Certificado A1 e obrigatorio para emissao real.", "certificate_path", "fiscal_settings"), w(e.certificatePassword) || D(r, "CERTIFICATE_PASSWORD_REQUIRED", "Senha do certificado A1 e obrigatoria.", "certificate_password", "fiscal_settings"), w(e.cscId) || D(r, "CSC_ID_REQUIRED", "CSC ID e obrigatorio para NFC-e.", "csc_id", "stores"), w(e.cscToken) || D(r, "CSC_TOKEN_REQUIRED", "CSC token e obrigatorio para NFC-e.", "csc_token", "stores")), (!Number.isInteger(e.defaultSeries) || e.defaultSeries <= 0) && D(r, "DEFAULT_SERIES_REQUIRED", "Serie padrao NFC-e deve ser maior que zero.", "default_series", "stores"), (!Number.isInteger(e.nextNfceNumber) || e.nextNfceNumber <= 0) && D(r, "NEXT_NFCE_NUMBER_REQUIRED", "Proximo numero NFC-e deve ser maior que zero.", "next_nfce_number", "stores"), this.toResult(r);
  }
  validateAuthorizeReadiness(e, r) {
    const a = this.validateContext(e), n = [...a.errors, ...a.warnings];
    return this.validateItems(r.items, n), this.validatePayments(r.payments, n), (!r.totals || r.totals.finalAmount <= 0) && D(n, "SALE_TOTAL_REQUIRED", "Total da venda deve ser maior que zero.", "totals.finalAmount", "sales"), this.toResult(n);
  }
  validateItems(e, r) {
    if (!Array.isArray(e) || e.length === 0) {
      D(r, "SALE_ITEMS_REQUIRED", "Venda deve possuir ao menos um item.", "items", "sale_items");
      return;
    }
    e.forEach((a, n) => {
      var s, i, c, l, d, m, E;
      const o = `items[${n}]`;
      w(a.description) || D(r, "ITEM_DESCRIPTION_REQUIRED", "Descricao do item e obrigatoria.", `${o}.description`, "sale_items"), w(a.unit) || D(r, "ITEM_UNIT_REQUIRED", "Unidade do item e obrigatoria.", `${o}.unit`, "sale_items"), a.quantity <= 0 && D(r, "ITEM_QUANTITY_REQUIRED", "Quantidade do item deve ser maior que zero.", `${o}.quantity`, "sale_items"), a.unitPrice <= 0 && D(r, "ITEM_UNIT_PRICE_REQUIRED", "Valor unitario do item deve ser maior que zero.", `${o}.unitPrice`, "sale_items"), mt((s = a.tax) == null ? void 0 : s.ncm).length !== 8 && D(r, "ITEM_NCM_REQUIRED", `NCM do item "${a.description}" deve ter 8 digitos. Corrija o cadastro do produto antes de emitir NFC-e.`, `${o}.tax.ncm`, "sale_items"), mt((i = a.tax) == null ? void 0 : i.cfop).length !== 4 && D(r, "ITEM_CFOP_REQUIRED", "CFOP do item deve ter 4 digitos.", `${o}.tax.cfop`, "sale_items"), w((c = a.tax) == null ? void 0 : c.originCode) || D(r, "ITEM_ORIGIN_REQUIRED", `Origem tributaria do item "${a.description}" e obrigatoria.`, `${o}.tax.originCode`, "sale_item_tax_snapshot"), !w((l = a.tax) == null ? void 0 : l.csosn) && !w((d = a.tax) == null ? void 0 : d.icmsCst) && D(r, "ITEM_ICMS_REQUIRED", `CST ou CSOSN do ICMS do item "${a.description}" e obrigatorio.`, `${o}.tax`, "sale_item_tax_snapshot"), w((m = a.tax) == null ? void 0 : m.pisCst) || D(r, "ITEM_PIS_REQUIRED", `CST de PIS do item "${a.description}" e obrigatorio.`, `${o}.tax.pisCst`, "sale_item_tax_snapshot"), w((E = a.tax) == null ? void 0 : E.cofinsCst) || D(r, "ITEM_COFINS_REQUIRED", `CST de COFINS do item "${a.description}" e obrigatorio.`, `${o}.tax.cofinsCst`, "sale_item_tax_snapshot");
    });
  }
  validatePayments(e, r) {
    if (!Array.isArray(e) || e.length === 0) {
      D(r, "PAYMENTS_REQUIRED", "NFC-e exige grupo de pagamento.", "payments", "payments");
      return;
    }
    e.forEach((a, n) => {
      const o = `payments[${n}]`;
      w(a.method) || D(r, "PAYMENT_METHOD_REQUIRED", "Forma de pagamento e obrigatoria.", `${o}.method`, "payments"), a.amount <= 0 && D(r, "PAYMENT_AMOUNT_REQUIRED", "Valor do pagamento deve ser maior que zero.", `${o}.amount`, "payments");
    });
  }
  toResult(e) {
    const r = e.filter((n) => n.severity === "error"), a = e.filter((n) => n.severity === "warning");
    return { ok: r.length === 0, errors: r, warnings: a };
  }
}
const Ur = new Di(), Si = ["1", "2", "3", "4"];
function Ri(t) {
  return Si.includes(t);
}
function ir(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function $e(t) {
  return String(t ?? "").trim();
}
function je(t, e, r) {
  const a = $e(String(t[e] ?? ""));
  if (!a)
    throw new Error(`${r} e obrigatorio.`);
  return a;
}
function Li(t) {
  const e = {
    id: t.id,
    code: $e(t.code || "MAIN") || "MAIN",
    name: je(t, "name", "Nome fantasia"),
    legalName: je(t, "legalName", "Razao social"),
    cnpj: ir(t.cnpj),
    stateRegistration: $e(t.stateRegistration),
    taxRegimeCode: $e(t.taxRegimeCode),
    environment: t.environment === "production" ? "production" : "homologation",
    cscId: $e(t.cscId ?? "") || null,
    cscToken: $e(t.cscToken ?? "") || null,
    defaultSeries: Number(t.defaultSeries ?? 1),
    nextNfceNumber: Number(t.nextNfceNumber ?? 1),
    addressStreet: je(t, "addressStreet", "Logradouro"),
    addressNumber: je(t, "addressNumber", "Numero"),
    addressNeighborhood: je(t, "addressNeighborhood", "Bairro"),
    addressCity: je(t, "addressCity", "Cidade"),
    addressState: $e(t.addressState).toUpperCase(),
    addressZipCode: ir(t.addressZipCode),
    addressCityIbgeCode: ir(t.addressCityIbgeCode),
    active: !0
  };
  if (e.cnpj.length !== 14)
    throw new Error("CNPJ deve conter 14 digitos.");
  if (!e.stateRegistration)
    throw new Error("Inscricao estadual e obrigatoria.");
  if (!e.taxRegimeCode)
    throw new Error("CRT/regime tributario e obrigatorio.");
  if (!Ri(e.taxRegimeCode))
    throw new Error("CRT deve ser 1, 2, 3 ou 4.");
  if (e.addressState.length !== 2)
    throw new Error("UF deve conter 2 letras.");
  if (e.addressZipCode.length !== 8)
    throw new Error("CEP deve conter 8 digitos.");
  if (e.addressCityIbgeCode.length !== 7)
    throw new Error("Codigo IBGE do municipio deve conter 7 digitos.");
  if (!Number.isInteger(e.defaultSeries ?? 0) || (e.defaultSeries ?? 0) <= 0)
    throw new Error("Serie padrao NFC-e deve ser maior que zero.");
  if (!Number.isInteger(e.nextNfceNumber ?? 0) || (e.nextNfceNumber ?? 0) <= 0)
    throw new Error("Proximo numero NFC-e deve ser maior que zero.");
  return e;
}
class yi {
  getActiveStore() {
    return se.findActive();
  }
  saveActiveStore(e) {
    const r = se.upsertActive(Li(e));
    return f.info(`[FiscalStore] Store fiscal salva id=${r.id} cnpj=${r.cnpj} ambiente=${r.environment}.`), r;
  }
}
const Oi = new yi();
function cr(t) {
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
function bi(t) {
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
function ur(t) {
  const e = JSON.parse(t.payload_json), r = t.result_json ? JSON.parse(t.result_json) : null, a = Number(t.entity_id);
  return {
    id: String(t.id),
    saleId: Number((e == null ? void 0 : e.saleId) ?? 0),
    documentId: Number.isNaN(a) ? null : a,
    operation: t.operation,
    payload: e,
    result: r,
    status: bi(t.status),
    idempotencyKey: t.idempotency_key,
    attempts: t.attempts,
    maxAttempts: 5,
    nextRetryAt: t.next_attempt_at,
    lastErrorCode: t.last_error ?? null,
    lastErrorMessage: t.last_error ?? null,
    lockedAt: t.locked_at,
    lockedBy: t.locked_by,
    processedAt: t.processed_at ?? (t.status === "DONE" ? t.updated_at : null),
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
}
class Ui {
  ensureSchema() {
  }
  createPendingDocument(e) {
    const r = this.findBySaleId(e.saleId);
    if (r)
      return r;
    const a = u.prepare(`
      INSERT INTO fiscal_documents (
        sale_id, store_id, model, series, number, access_key, environment, status,
        issued_datetime, xml, xml_signed, xml_authorized, xml_cancellation, protocol, receipt_number, qr_code_url, authorization_datetime,
        cancel_datetime, contingency_type, rejection_code, rejection_reason, danfe_path,
        provider, created_at, updated_at
      ) VALUES (?, ?, 65, ?, ?, NULL, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
    return this.findById(Number(a.lastInsertRowid));
  }
  updateTransmissionArtifacts(e, r) {
    u.prepare(`
      UPDATE fiscal_documents
      SET
        issued_datetime = COALESCE(?, issued_datetime),
        access_key = COALESCE(?, access_key),
        xml = COALESCE(?, xml),
        xml_signed = COALESCE(?, xml_signed),
        xml_authorized = COALESCE(?, xml_authorized),
        xml_cancellation = COALESCE(?, xml_cancellation),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      r.issuedAt ?? null,
      r.accessKey ?? null,
      r.xmlBuilt ?? null,
      r.xmlSigned ?? null,
      r.xmlAuthorized ?? null,
      r.xmlCancellation ?? null,
      e
    );
  }
  markAsAuthorized(e, r) {
    return u.prepare(`
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
      r.accessKey ?? null,
      r.protocol ?? null,
      r.receiptNumber ?? null,
      r.qrCodeUrl ?? null,
      r.authorizedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      r.issuedAt ?? null,
      r.xmlBuilt ?? r.xmlSent ?? null,
      r.xmlSigned ?? null,
      r.xmlAuthorized ?? null,
      r.statusCode ?? null,
      r.statusMessage,
      r.provider ?? null,
      e
    ), this.findById(e);
  }
  markAsRejected(e, r) {
    return u.prepare(`
      UPDATE fiscal_documents
      SET
        status = ?,
        access_key = COALESCE(?, access_key),
        protocol = COALESCE(?, protocol),
        receipt_number = COALESCE(?, receipt_number),
        qr_code_url = COALESCE(?, qr_code_url),
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
      r.status,
      r.accessKey ?? null,
      r.protocol ?? null,
      r.receiptNumber ?? null,
      r.qrCodeUrl ?? null,
      r.issuedAt ?? null,
      r.xmlBuilt ?? r.xmlSent ?? null,
      r.xmlSigned ?? null,
      r.xmlAuthorized ?? null,
      r.statusCode ?? null,
      r.statusMessage,
      r.provider ?? null,
      e
    ), this.findById(e);
  }
  markAsCancelled(e, r, a) {
    return u.prepare(`
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
      a.cancelledAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      a.cancellationProtocol ?? null,
      a.xmlAuthorized ?? null,
      a.xmlCancellation ?? null,
      a.statusCode ?? null,
      a.statusMessage,
      e
    ), this.findById(e);
  }
  updateDanfePath(e, r) {
    u.prepare(`
      UPDATE fiscal_documents
      SET danfe_path = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(r, e);
  }
  findById(e) {
    const r = u.prepare("SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1").get(e);
    return r ? cr(r) : null;
  }
  findBySaleId(e) {
    const r = u.prepare("SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return r ? cr(r) : null;
  }
  findByAccessKey(e) {
    const r = u.prepare("SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1").get(e);
    return r ? cr(r) : null;
  }
  updateStatus(e, r, a, n) {
    u.prepare(`
      UPDATE fiscal_documents
      SET
        status = ?,
        rejection_code = ?,
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(r, a ?? null, n ?? null, e);
  }
  enqueue(e) {
    const r = this.findQueueItemByIdempotencyKey(e.idempotencyKey);
    if (r)
      return r;
    const a = u.prepare(`
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
    return this.findQueueItemById(String(a.lastInsertRowid));
  }
  findQueueItemByIdempotencyKey(e) {
    const r = u.prepare(`
      SELECT * FROM sync_queue
      WHERE idempotency_key = ?
      LIMIT 1
    `).get(e);
    return r ? ur(r) : null;
  }
  findQueueItemById(e) {
    const r = u.prepare("SELECT * FROM sync_queue WHERE id = ? LIMIT 1").get(Number(e));
    return r ? ur(r) : null;
  }
  claimNextQueueItem(e, r) {
    const a = u.prepare(`
      SELECT * FROM sync_queue
      WHERE status IN ('PENDING', 'FAILED')
        AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
      ORDER BY created_at ASC
      LIMIT 1
    `).get(e);
    return a ? (this.markQueueItemProcessing(String(a.id), "main", e), this.findQueueItemById(String(a.id))) : null;
  }
  claimQueueItemById(e, r, a) {
    const n = u.prepare(`
      SELECT * FROM sync_queue
      WHERE id = ?
        AND status IN ('PENDING', 'FAILED')
      LIMIT 1
    `).get(Number(e));
    return n ? (this.markQueueItemProcessing(String(n.id), a, r), this.findQueueItemById(String(n.id))) : null;
  }
  markQueueItemProcessing(e, r, a) {
    u.prepare(`
      UPDATE sync_queue
      SET
        status = 'PROCESSING',
        attempts = attempts + 1,
        locked_at = ?,
        locked_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(a, r, Number(e));
  }
  markQueueItemDone(e, r, a) {
    u.prepare(`
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
    `).run(a === void 0 ? null : JSON.stringify(a), r, Number(e));
  }
  markQueueItemFailed(e, r, a, n, o, s) {
    const i = [r, a].filter(Boolean).join(": ");
    u.prepare(`
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
      i,
      n ?? null,
      s === void 0 ? null : JSON.stringify(s),
      o,
      Number(e)
    );
  }
  listQueueItems(e = 20) {
    return u.prepare(`
      SELECT * FROM sync_queue
      ORDER BY created_at DESC
      LIMIT ?
    `).all(e).map(ur);
  }
  summarizeQueue() {
    const e = u.prepare(`
      SELECT status, COUNT(*) as total
      FROM sync_queue
      GROUP BY status
    `).all(), r = {
      pending: 0,
      processing: 0,
      failed: 0,
      done: 0,
      nextRetryAt: null
    };
    for (const n of e)
      n.status === "PENDING" && (r.pending = n.total), n.status === "PROCESSING" && (r.processing = n.total), n.status === "FAILED" && (r.failed = n.total), n.status === "DONE" && (r.done = n.total);
    const a = u.prepare(`
      SELECT next_attempt_at
      FROM sync_queue
      WHERE status = 'FAILED' AND next_attempt_at IS NOT NULL
      ORDER BY next_attempt_at ASC
      LIMIT 1
    `).get();
    return r.nextRetryAt = (a == null ? void 0 : a.next_attempt_at) ?? null, r;
  }
}
function pt(t) {
  var r;
  const e = (r = t.gatewayBaseUrl) == null ? void 0 : r.trim();
  if (!e)
    throw new I({
      code: "GATEWAY_BASE_URL_REQUIRED",
      message: "Gateway fiscal não configurado.",
      category: "CONFIGURATION"
    });
  return e.replace(/\/+$/, "");
}
function Ft(t) {
  var r;
  const e = (r = t.gatewayApiKey) == null ? void 0 : r.trim();
  if (!e)
    throw new I({
      code: "GATEWAY_API_KEY_REQUIRED",
      message: "API key do gateway fiscal não configurada.",
      category: "CONFIGURATION"
    });
  return {
    "content-type": "application/json",
    authorization: `Bearer ${e}`
  };
}
async function wt(t, e) {
  var o, s, i, c, l, d;
  const r = await t.text(), a = r ? JSON.parse(r) : {}, n = a;
  if (!t.ok)
    throw new I({
      code: ((o = n.error) == null ? void 0 : o.code) ?? e,
      message: ((s = n.error) == null ? void 0 : s.message) ?? `Gateway fiscal retornou HTTP ${t.status}.`,
      category: "PROVIDER",
      retryable: t.status >= 500 || ((i = n.error) == null ? void 0 : i.retryable) === !0,
      details: a
    });
  if ("success" in n && n.success === !1)
    throw new I({
      code: ((c = n.error) == null ? void 0 : c.code) ?? e,
      message: ((l = n.error) == null ? void 0 : l.message) ?? "Gateway fiscal retornou erro de negócio.",
      category: "PROVIDER",
      retryable: ((d = n.error) == null ? void 0 : d.retryable) === !0,
      details: a
    });
  return "data" in n && n.data !== void 0 ? n.data : a;
}
class Fi {
  constructor() {
    ce(this, "providerId", "gateway");
  }
  async authorizeNfce(e, r) {
    const a = await fetch(`${pt(r)}/nfce/authorize`, {
      method: "POST",
      headers: Ft(r),
      body: JSON.stringify({
        request: e
      })
    });
    return wt(a, "GATEWAY_AUTHORIZE_FAILED");
  }
  async cancelNfce(e, r) {
    const a = await fetch(`${pt(r)}/nfce/cancel`, {
      method: "POST",
      headers: Ft(r),
      body: JSON.stringify({
        request: e
      })
    });
    return wt(a, "GATEWAY_CANCEL_FAILED");
  }
  async consultStatus(e, r) {
    const a = await fetch(`${pt(r)}/nfce/status/${encodeURIComponent(e.accessKey)}`, {
      method: "GET",
      headers: Ft(r)
    });
    return wt(a, "GATEWAY_CONSULT_FAILED");
  }
  async testStatusServico(e) {
    const r = Date.now(), a = await fetch(`${pt(e)}/nfce/status-servico`, {
      method: "POST",
      headers: Ft(e),
      body: JSON.stringify({
        environment: e.environment,
        uf: e.uf ?? "SP",
        model: e.model ?? 65
      })
    }), n = await wt(
      a,
      "GATEWAY_STATUS_SERVICE_FAILED"
    );
    return {
      provider: "gateway",
      environment: e.environment,
      uf: e.uf ?? n.uf ?? "SP",
      model: 65,
      service: "NFeStatusServico4",
      url: `${pt(e)}/nfce/status-servico`,
      success: n.success ?? !0,
      statusCode: n.statusCode ?? null,
      statusMessage: n.statusMessage ?? "Consulta de status executada pelo gateway fiscal.",
      responseTimeMs: n.responseTimeMs ?? Date.now() - r,
      rawRequest: n.rawRequest ?? "",
      rawResponse: n.rawResponse ?? JSON.stringify(n),
      checkedAt: n.checkedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      tlsValidation: n.tlsValidation ?? "verified",
      warning: n.warning ?? null
    };
  }
}
function wi(t) {
  return `${t.emitter.address.state}${t.saleId}${t.number}${t.series}`.replace(/\D/g, "").padEnd(44, "0").slice(0, 44);
}
class xi {
  constructor() {
    ce(this, "providerId", "mock");
  }
  async authorizeNfce(e, r) {
    const a = (/* @__PURE__ */ new Date()).toISOString(), n = wi(e);
    return {
      status: "AUTHORIZED",
      provider: "mock",
      accessKey: n,
      protocol: `MOCK-PROT-${e.saleId}-${e.number}`,
      receiptNumber: `MOCK-REC-${e.saleId}`,
      statusCode: "100",
      statusMessage: "Autorizado em ambiente mock.",
      authorizedAt: a,
      xmlSent: `<NFe><infNFe Id="${n}"></infNFe></NFe>`,
      xmlAuthorized: `<procNFe><protNFe nProt="MOCK-PROT-${e.saleId}-${e.number}"/></procNFe>`,
      qrCodeUrl: `https://mock.fiscal.local/qrcode/${n}`,
      rawResponse: { mock: !0, environment: e.environment }
    };
  }
  async cancelNfce(e, r) {
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
  async consultStatus(e, r) {
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
  async testStatusServico(e) {
    const r = (/* @__PURE__ */ new Date()).toISOString();
    return {
      provider: "mock",
      environment: e.environment,
      uf: e.uf ?? "SP",
      model: 65,
      service: "NFeStatusServico4",
      url: "mock://nfce/status-servico",
      success: !0,
      statusCode: "107",
      statusMessage: "Servico em operacao em ambiente mock.",
      responseTimeMs: 0,
      rawRequest: "<mockStatusServico />",
      rawResponse: "<retConsStatServ><cStat>107</cStat><xMotivo>Servico em operacao</xMotivo></retConsStatServ>",
      checkedAt: r,
      tlsValidation: "verified",
      warning: null
    };
  }
}
var Ue = {}, Se = {};
function Mi(t, e, r) {
  if (r === void 0 && (r = Array.prototype), t && typeof r.find == "function")
    return r.find.call(t, e);
  for (var a = 0; a < t.length; a++)
    if (Object.prototype.hasOwnProperty.call(t, a)) {
      var n = t[a];
      if (e.call(void 0, n, a, t))
        return n;
    }
}
function Fr(t, e) {
  return e === void 0 && (e = Object), e && typeof e.freeze == "function" ? e.freeze(t) : t;
}
function Pi(t, e) {
  if (t === null || typeof t != "object")
    throw new TypeError("target is not an object");
  for (var r in e)
    Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
  return t;
}
var ln = Fr({
  /**
   * `text/html`, the only mime type that triggers treating an XML document as HTML.
   *
   * @see DOMParser.SupportedType.isHTML
   * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
   * @see https://en.wikipedia.org/wiki/HTML Wikipedia
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
   * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring WHATWG HTML Spec
   */
  HTML: "text/html",
  /**
   * Helper method to check a mime type if it indicates an HTML document
   *
   * @param {string} [value]
   * @returns {boolean}
   *
   * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
   * @see https://en.wikipedia.org/wiki/HTML Wikipedia
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
   * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring 	 */
  isHTML: function(t) {
    return t === ln.HTML;
  },
  /**
   * `application/xml`, the standard mime type for XML documents.
   *
   * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType registration
   * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
   * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
   */
  XML_APPLICATION: "application/xml",
  /**
   * `text/html`, an alias for `application/xml`.
   *
   * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
   * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
   * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
   */
  XML_TEXT: "text/xml",
  /**
   * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
   * but is parsed as an XML document.
   *
   * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType registration
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
   * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
   */
  XML_XHTML_APPLICATION: "application/xhtml+xml",
  /**
   * `image/svg+xml`,
   *
   * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
   * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
   * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
   */
  XML_SVG_IMAGE: "image/svg+xml"
}), En = Fr({
  /**
   * The XHTML namespace.
   *
   * @see http://www.w3.org/1999/xhtml
   */
  HTML: "http://www.w3.org/1999/xhtml",
  /**
   * Checks if `uri` equals `NAMESPACE.HTML`.
   *
   * @param {string} [uri]
   *
   * @see NAMESPACE.HTML
   */
  isHTML: function(t) {
    return t === En.HTML;
  },
  /**
   * The SVG namespace.
   *
   * @see http://www.w3.org/2000/svg
   */
  SVG: "http://www.w3.org/2000/svg",
  /**
   * The `xml:` namespace.
   *
   * @see http://www.w3.org/XML/1998/namespace
   */
  XML: "http://www.w3.org/XML/1998/namespace",
  /**
   * The `xmlns:` namespace
   *
   * @see https://www.w3.org/2000/xmlns/
   */
  XMLNS: "http://www.w3.org/2000/xmlns/"
});
Se.assign = Pi;
Se.find = Mi;
Se.freeze = Fr;
Se.MIME_TYPE = ln;
Se.NAMESPACE = En;
var mn = Se, me = mn.find, vt = mn.NAMESPACE;
function Bi(t) {
  return t !== "";
}
function Xi(t) {
  return t ? t.split(/[\t\n\f\r ]+/).filter(Bi) : [];
}
function $i(t, e) {
  return t.hasOwnProperty(e) || (t[e] = !0), t;
}
function ca(t) {
  if (!t) return [];
  var e = Xi(t);
  return Object.keys(e.reduce($i, {}));
}
function ki(t) {
  return function(e) {
    return t && t.indexOf(e) !== -1;
  };
}
function yt(t, e) {
  for (var r in t)
    Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
}
function W(t, e) {
  var r = t.prototype;
  if (!(r instanceof e)) {
    let a = function() {
    };
    a.prototype = e.prototype, a = new a(), yt(r, a), t.prototype = r = a;
  }
  r.constructor != t && (typeof t != "function" && console.error("unknown Class:" + t), r.constructor = t);
}
var Q = {}, ie = Q.ELEMENT_NODE = 1, it = Q.ATTRIBUTE_NODE = 2, zt = Q.TEXT_NODE = 3, pn = Q.CDATA_SECTION_NODE = 4, _n = Q.ENTITY_REFERENCE_NODE = 5, qi = Q.ENTITY_NODE = 6, Tn = Q.PROCESSING_INSTRUCTION_NODE = 7, fn = Q.COMMENT_NODE = 8, Nn = Q.DOCUMENT_NODE = 9, gn = Q.DOCUMENT_TYPE_NODE = 10, Ce = Q.DOCUMENT_FRAGMENT_NODE = 11, Gi = Q.NOTATION_NODE = 12, q = {}, X = {};
q.INDEX_SIZE_ERR = (X[1] = "Index size error", 1);
q.DOMSTRING_SIZE_ERR = (X[2] = "DOMString size error", 2);
var Y = q.HIERARCHY_REQUEST_ERR = (X[3] = "Hierarchy request error", 3);
q.WRONG_DOCUMENT_ERR = (X[4] = "Wrong document", 4);
q.INVALID_CHARACTER_ERR = (X[5] = "Invalid character", 5);
q.NO_DATA_ALLOWED_ERR = (X[6] = "No data allowed", 6);
q.NO_MODIFICATION_ALLOWED_ERR = (X[7] = "No modification allowed", 7);
var An = q.NOT_FOUND_ERR = (X[8] = "Not found", 8);
q.NOT_SUPPORTED_ERR = (X[9] = "Not supported", 9);
var ua = q.INUSE_ATTRIBUTE_ERR = (X[10] = "Attribute in use", 10);
q.INVALID_STATE_ERR = (X[11] = "Invalid state", 11);
q.SYNTAX_ERR = (X[12] = "Syntax error", 12);
q.INVALID_MODIFICATION_ERR = (X[13] = "Invalid modification", 13);
q.NAMESPACE_ERR = (X[14] = "Invalid namespace", 14);
q.INVALID_ACCESS_ERR = (X[15] = "Invalid access", 15);
function M(t, e) {
  if (e instanceof Error)
    var r = e;
  else
    r = this, Error.call(this, X[t]), this.message = X[t], Error.captureStackTrace && Error.captureStackTrace(this, M);
  return r.code = t, e && (this.message = this.message + ": " + e), r;
}
M.prototype = Error.prototype;
yt(q, M);
function Ie() {
}
Ie.prototype = {
  /**
   * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
   * @standard level1
   */
  length: 0,
  /**
   * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
   * @standard level1
   * @param index  unsigned long
   *   Index into the collection.
   * @return Node
   * 	The node at the indexth position in the NodeList, or null if that is not a valid index.
   */
  item: function(t) {
    return t >= 0 && t < this.length ? this[t] : null;
  },
  toString: function(t, e) {
    for (var r = [], a = 0; a < this.length; a++)
      ot(this[a], r, t, e);
    return r.join("");
  },
  /**
   * @private
   * @param {function (Node):boolean} predicate
   * @returns {Node[]}
   */
  filter: function(t) {
    return Array.prototype.filter.call(this, t);
  },
  /**
   * @private
   * @param {Node} item
   * @returns {number}
   */
  indexOf: function(t) {
    return Array.prototype.indexOf.call(this, t);
  }
};
function ct(t, e) {
  this._node = t, this._refresh = e, wr(this);
}
function wr(t) {
  var e = t._node._inc || t._node.ownerDocument._inc;
  if (t._inc !== e) {
    var r = t._refresh(t._node);
    if (Un(t, "length", r.length), !t.$$length || r.length < t.$$length)
      for (var a = r.length; a in t; a++)
        Object.prototype.hasOwnProperty.call(t, a) && delete t[a];
    yt(r, t), t._inc = e;
  }
}
ct.prototype.item = function(t) {
  return wr(this), this[t] || null;
};
W(ct, Ie);
function jt() {
}
function hn(t, e) {
  for (var r = t.length; r--; )
    if (t[r] === e)
      return r;
}
function da(t, e, r, a) {
  if (a ? e[hn(e, a)] = r : e[e.length++] = r, t) {
    r.ownerElement = t;
    var n = t.ownerDocument;
    n && (a && vn(n, t, a), Vi(n, t, r));
  }
}
function la(t, e, r) {
  var a = hn(e, r);
  if (a >= 0) {
    for (var n = e.length - 1; a < n; )
      e[a] = e[++a];
    if (e.length = n, t) {
      var o = t.ownerDocument;
      o && (vn(o, t, r), r.ownerElement = null);
    }
  } else
    throw new M(An, new Error(t.tagName + "@" + r));
}
jt.prototype = {
  length: 0,
  item: Ie.prototype.item,
  getNamedItem: function(t) {
    for (var e = this.length; e--; ) {
      var r = this[e];
      if (r.nodeName == t)
        return r;
    }
  },
  setNamedItem: function(t) {
    var e = t.ownerElement;
    if (e && e != this._ownerElement)
      throw new M(ua);
    var r = this.getNamedItem(t.nodeName);
    return da(this._ownerElement, this, t, r), r;
  },
  /* returns Node */
  setNamedItemNS: function(t) {
    var e = t.ownerElement, r;
    if (e && e != this._ownerElement)
      throw new M(ua);
    return r = this.getNamedItemNS(t.namespaceURI, t.localName), da(this._ownerElement, this, t, r), r;
  },
  /* returns Node */
  removeNamedItem: function(t) {
    var e = this.getNamedItem(t);
    return la(this._ownerElement, this, e), e;
  },
  // raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
  //for level2
  removeNamedItemNS: function(t, e) {
    var r = this.getNamedItemNS(t, e);
    return la(this._ownerElement, this, r), r;
  },
  getNamedItemNS: function(t, e) {
    for (var r = this.length; r--; ) {
      var a = this[r];
      if (a.localName == e && a.namespaceURI == t)
        return a;
    }
    return null;
  }
};
function In() {
}
In.prototype = {
  /**
   * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given feature is supported.
   * The different implementations fairly diverged in what kind of features were reported.
   * The latest version of the spec settled to force this method to always return true, where the functionality was accurate and in use.
   *
   * @deprecated It is deprecated and modern browsers return true in all cases.
   *
   * @param {string} feature
   * @param {string} [version]
   * @returns {boolean} always true
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
   * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
   */
  hasFeature: function(t, e) {
    return !0;
  },
  /**
   * Creates an XML Document object of the specified type with its document element.
   *
   * __It behaves slightly different from the description in the living standard__:
   * - There is no interface/class `XMLDocument`, it returns a `Document` instance.
   * - `contentType`, `encoding`, `mode`, `origin`, `url` fields are currently not declared.
   * - this implementation is not validating names or qualified names
   *   (when parsing XML strings, the SAX parser takes care of that)
   *
   * @param {string|null} namespaceURI
   * @param {string} qualifiedName
   * @param {DocumentType=null} doctype
   * @returns {Document}
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
   * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM Level 2 Core (initial)
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument  DOM Level 2 Core
   *
   * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
   * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
   * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
   */
  createDocument: function(t, e, r) {
    var a = new Ot();
    if (a.implementation = this, a.childNodes = new Ie(), a.doctype = r || null, r && a.appendChild(r), e) {
      var n = a.createElementNS(t, e);
      a.appendChild(n);
    }
    return a;
  },
  /**
   * Returns a doctype, with the given `qualifiedName`, `publicId`, and `systemId`.
   *
   * __This behavior is slightly different from the in the specs__:
   * - this implementation is not validating names or qualified names
   *   (when parsing XML strings, the SAX parser takes care of that)
   *
   * @param {string} qualifiedName
   * @param {string} [publicId]
   * @param {string} [systemId]
   * @returns {DocumentType} which can either be used with `DOMImplementation.createDocument` upon document creation
   * 				  or can be put into the document via methods like `Node.insertBefore()` or `Node.replaceChild()`
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType MDN
   * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM Level 2 Core
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living Standard
   *
   * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
   * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
   * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
   */
  createDocumentType: function(t, e, r) {
    var a = new Zt();
    return a.name = t, a.nodeName = t, a.publicId = e || "", a.systemId = r || "", a;
  }
};
function L() {
}
L.prototype = {
  firstChild: null,
  lastChild: null,
  previousSibling: null,
  nextSibling: null,
  attributes: null,
  parentNode: null,
  childNodes: null,
  ownerDocument: null,
  nodeValue: null,
  namespaceURI: null,
  prefix: null,
  localName: null,
  // Modified in DOM Level 2:
  insertBefore: function(t, e) {
    return Ht(this, t, e);
  },
  replaceChild: function(t, e) {
    Ht(this, t, e, Sn), e && this.removeChild(e);
  },
  removeChild: function(t) {
    return Dn(this, t);
  },
  appendChild: function(t) {
    return this.insertBefore(t, null);
  },
  hasChildNodes: function() {
    return this.firstChild != null;
  },
  cloneNode: function(t) {
    return Sr(this.ownerDocument || this, this, t);
  },
  // Modified in DOM Level 2:
  normalize: function() {
    for (var t = this.firstChild; t; ) {
      var e = t.nextSibling;
      e && e.nodeType == zt && t.nodeType == zt ? (this.removeChild(e), t.appendData(e.data)) : (t.normalize(), t = e);
    }
  },
  // Introduced in DOM Level 2:
  isSupported: function(t, e) {
    return this.ownerDocument.implementation.hasFeature(t, e);
  },
  // Introduced in DOM Level 2:
  hasAttributes: function() {
    return this.attributes.length > 0;
  },
  /**
   * Look up the prefix associated to the given namespace URI, starting from this node.
   * **The default namespace declarations are ignored by this method.**
   * See Namespace Prefix Lookup for details on the algorithm used by this method.
   *
   * _Note: The implementation seems to be incomplete when compared to the algorithm described in the specs._
   *
   * @param {string | null} namespaceURI
   * @returns {string | null}
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
   * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
   * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
   * @see https://github.com/xmldom/xmldom/issues/322
   */
  lookupPrefix: function(t) {
    for (var e = this; e; ) {
      var r = e._nsMap;
      if (r) {
        for (var a in r)
          if (Object.prototype.hasOwnProperty.call(r, a) && r[a] === t)
            return a;
      }
      e = e.nodeType == it ? e.ownerDocument : e.parentNode;
    }
    return null;
  },
  // Introduced in DOM Level 3:
  lookupNamespaceURI: function(t) {
    for (var e = this; e; ) {
      var r = e._nsMap;
      if (r && Object.prototype.hasOwnProperty.call(r, t))
        return r[t];
      e = e.nodeType == it ? e.ownerDocument : e.parentNode;
    }
    return null;
  },
  // Introduced in DOM Level 3:
  isDefaultNamespace: function(t) {
    var e = this.lookupPrefix(t);
    return e == null;
  }
};
function Cn(t) {
  return t == "<" && "&lt;" || t == ">" && "&gt;" || t == "&" && "&amp;" || t == '"' && "&quot;" || "&#" + t.charCodeAt() + ";";
}
yt(Q, L);
yt(Q, L.prototype);
function Dt(t, e) {
  if (e(t))
    return !0;
  if (t = t.firstChild)
    do
      if (Dt(t, e))
        return !0;
    while (t = t.nextSibling);
}
function Ot() {
  this.ownerDocument = this;
}
function Vi(t, e, r) {
  t && t._inc++;
  var a = r.namespaceURI;
  a === vt.XMLNS && (e._nsMap[r.prefix ? r.localName : ""] = r.value);
}
function vn(t, e, r, a) {
  t && t._inc++;
  var n = r.namespaceURI;
  n === vt.XMLNS && delete e._nsMap[r.prefix ? r.localName : ""];
}
function xr(t, e, r) {
  if (t && t._inc) {
    t._inc++;
    var a = e.childNodes;
    if (r)
      a[a.length++] = r;
    else {
      for (var n = e.firstChild, o = 0; n; )
        a[o++] = n, n = n.nextSibling;
      a.length = o, delete a[a.length];
    }
  }
}
function Dn(t, e) {
  var r = e.previousSibling, a = e.nextSibling;
  return r ? r.nextSibling = a : t.firstChild = a, a ? a.previousSibling = r : t.lastChild = r, e.parentNode = null, e.previousSibling = null, e.nextSibling = null, xr(t.ownerDocument, t), e;
}
function zi(t) {
  return t && (t.nodeType === L.DOCUMENT_NODE || t.nodeType === L.DOCUMENT_FRAGMENT_NODE || t.nodeType === L.ELEMENT_NODE);
}
function ji(t) {
  return t && (pe(t) || Mr(t) || ve(t) || t.nodeType === L.DOCUMENT_FRAGMENT_NODE || t.nodeType === L.COMMENT_NODE || t.nodeType === L.PROCESSING_INSTRUCTION_NODE);
}
function ve(t) {
  return t && t.nodeType === L.DOCUMENT_TYPE_NODE;
}
function pe(t) {
  return t && t.nodeType === L.ELEMENT_NODE;
}
function Mr(t) {
  return t && t.nodeType === L.TEXT_NODE;
}
function Ea(t, e) {
  var r = t.childNodes || [];
  if (me(r, pe) || ve(e))
    return !1;
  var a = me(r, ve);
  return !(e && a && r.indexOf(a) > r.indexOf(e));
}
function ma(t, e) {
  var r = t.childNodes || [];
  function a(o) {
    return pe(o) && o !== e;
  }
  if (me(r, a))
    return !1;
  var n = me(r, ve);
  return !(e && n && r.indexOf(n) > r.indexOf(e));
}
function Hi(t, e, r) {
  if (!zi(t))
    throw new M(Y, "Unexpected parent node type " + t.nodeType);
  if (r && r.parentNode !== t)
    throw new M(An, "child not in parent");
  if (
    // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
    !ji(e) || // 5. If either `node` is a Text node and `parent` is a document,
    // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
    // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
    // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
    ve(e) && t.nodeType !== L.DOCUMENT_NODE
  )
    throw new M(
      Y,
      "Unexpected node type " + e.nodeType + " for parent node type " + t.nodeType
    );
}
function Ki(t, e, r) {
  var a = t.childNodes || [], n = e.childNodes || [];
  if (e.nodeType === L.DOCUMENT_FRAGMENT_NODE) {
    var o = n.filter(pe);
    if (o.length > 1 || me(n, Mr))
      throw new M(Y, "More than one element or text in fragment");
    if (o.length === 1 && !Ea(t, r))
      throw new M(Y, "Element in fragment can not be inserted before doctype");
  }
  if (pe(e) && !Ea(t, r))
    throw new M(Y, "Only one element can be added and only after doctype");
  if (ve(e)) {
    if (me(a, ve))
      throw new M(Y, "Only one doctype is allowed");
    var s = me(a, pe);
    if (r && a.indexOf(s) < a.indexOf(r))
      throw new M(Y, "Doctype can only be inserted before an element");
    if (!r && s)
      throw new M(Y, "Doctype can not be appended since element is present");
  }
}
function Sn(t, e, r) {
  var a = t.childNodes || [], n = e.childNodes || [];
  if (e.nodeType === L.DOCUMENT_FRAGMENT_NODE) {
    var o = n.filter(pe);
    if (o.length > 1 || me(n, Mr))
      throw new M(Y, "More than one element or text in fragment");
    if (o.length === 1 && !ma(t, r))
      throw new M(Y, "Element in fragment can not be inserted before doctype");
  }
  if (pe(e) && !ma(t, r))
    throw new M(Y, "Only one element can be added and only after doctype");
  if (ve(e)) {
    if (me(a, function(c) {
      return ve(c) && c !== r;
    }))
      throw new M(Y, "Only one doctype is allowed");
    var s = me(a, pe);
    if (r && a.indexOf(s) < a.indexOf(r))
      throw new M(Y, "Doctype can only be inserted before an element");
  }
}
function Ht(t, e, r, a) {
  Hi(t, e, r), t.nodeType === L.DOCUMENT_NODE && (a || Ki)(t, e, r);
  var n = e.parentNode;
  if (n && n.removeChild(e), e.nodeType === Ce) {
    var o = e.firstChild;
    if (o == null)
      return e;
    var s = e.lastChild;
  } else
    o = s = e;
  var i = r ? r.previousSibling : t.lastChild;
  o.previousSibling = i, s.nextSibling = r, i ? i.nextSibling = o : t.firstChild = o, r == null ? t.lastChild = s : r.previousSibling = s;
  do {
    o.parentNode = t;
    var c = t.ownerDocument || t;
    St(o, c);
  } while (o !== s && (o = o.nextSibling));
  return xr(t.ownerDocument || t, t), e.nodeType == Ce && (e.firstChild = e.lastChild = null), e;
}
function St(t, e) {
  if (t.ownerDocument !== e) {
    if (t.ownerDocument = e, t.nodeType === ie && t.attributes)
      for (var r = 0; r < t.attributes.length; r++) {
        var a = t.attributes.item(r);
        a && (a.ownerDocument = e);
      }
    for (var n = t.firstChild; n; )
      St(n, e), n = n.nextSibling;
  }
}
function Yi(t, e) {
  e.parentNode && e.parentNode.removeChild(e), e.parentNode = t, e.previousSibling = t.lastChild, e.nextSibling = null, e.previousSibling ? e.previousSibling.nextSibling = e : t.firstChild = e, t.lastChild = e, xr(t.ownerDocument, t, e);
  var r = t.ownerDocument || t;
  return St(e, r), e;
}
Ot.prototype = {
  //implementation : null,
  nodeName: "#document",
  nodeType: Nn,
  /**
   * The DocumentType node of the document.
   *
   * @readonly
   * @type DocumentType
   */
  doctype: null,
  documentElement: null,
  _inc: 1,
  insertBefore: function(t, e) {
    if (t.nodeType == Ce) {
      for (var r = t.firstChild; r; ) {
        var a = r.nextSibling;
        this.insertBefore(r, e), r = a;
      }
      return t;
    }
    return Ht(this, t, e), St(t, this), this.documentElement === null && t.nodeType === ie && (this.documentElement = t), t;
  },
  removeChild: function(t) {
    return this.documentElement == t && (this.documentElement = null), Dn(this, t);
  },
  replaceChild: function(t, e) {
    Ht(this, t, e, Sn), St(t, this), e && this.removeChild(e), pe(t) && (this.documentElement = t);
  },
  // Introduced in DOM Level 2:
  importNode: function(t, e) {
    return bn(this, t, e);
  },
  // Introduced in DOM Level 2:
  getElementById: function(t) {
    var e = null;
    return Dt(this.documentElement, function(r) {
      if (r.nodeType == ie && r.getAttribute("id") == t)
        return e = r, !0;
    }), e;
  },
  /**
   * The `getElementsByClassName` method of `Document` interface returns an array-like object
   * of all child elements which have **all** of the given class name(s).
   *
   * Returns an empty list if `classeNames` is an empty string or only contains HTML white space characters.
   *
   *
   * Warning: This is a live LiveNodeList.
   * Changes in the DOM will reflect in the array as the changes occur.
   * If an element selected by this array no longer qualifies for the selector,
   * it will automatically be removed. Be aware of this for iteration purposes.
   *
   * @param {string} classNames is a string representing the class name(s) to match; multiple class names are separated by (ASCII-)whitespace
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
   * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
   */
  getElementsByClassName: function(t) {
    var e = ca(t);
    return new ct(this, function(r) {
      var a = [];
      return e.length > 0 && Dt(r.documentElement, function(n) {
        if (n !== r && n.nodeType === ie) {
          var o = n.getAttribute("class");
          if (o) {
            var s = t === o;
            if (!s) {
              var i = ca(o);
              s = e.every(ki(i));
            }
            s && a.push(n);
          }
        }
      }), a;
    });
  },
  //document factory method:
  createElement: function(t) {
    var e = new qe();
    e.ownerDocument = this, e.nodeName = t, e.tagName = t, e.localName = t, e.childNodes = new Ie();
    var r = e.attributes = new jt();
    return r._ownerElement = e, e;
  },
  createDocumentFragment: function() {
    var t = new er();
    return t.ownerDocument = this, t.childNodes = new Ie(), t;
  },
  createTextNode: function(t) {
    var e = new Pr();
    return e.ownerDocument = this, e.appendData(t), e;
  },
  createComment: function(t) {
    var e = new Br();
    return e.ownerDocument = this, e.appendData(t), e;
  },
  createCDATASection: function(t) {
    var e = new Xr();
    return e.ownerDocument = this, e.appendData(t), e;
  },
  createProcessingInstruction: function(t, e) {
    var r = new kr();
    return r.ownerDocument = this, r.tagName = r.nodeName = r.target = t, r.nodeValue = r.data = e, r;
  },
  createAttribute: function(t) {
    var e = new Kt();
    return e.ownerDocument = this, e.name = t, e.nodeName = t, e.localName = t, e.specified = !0, e;
  },
  createEntityReference: function(t) {
    var e = new $r();
    return e.ownerDocument = this, e.nodeName = t, e;
  },
  // Introduced in DOM Level 2:
  createElementNS: function(t, e) {
    var r = new qe(), a = e.split(":"), n = r.attributes = new jt();
    return r.childNodes = new Ie(), r.ownerDocument = this, r.nodeName = e, r.tagName = e, r.namespaceURI = t, a.length == 2 ? (r.prefix = a[0], r.localName = a[1]) : r.localName = e, n._ownerElement = r, r;
  },
  // Introduced in DOM Level 2:
  createAttributeNS: function(t, e) {
    var r = new Kt(), a = e.split(":");
    return r.ownerDocument = this, r.nodeName = e, r.name = e, r.namespaceURI = t, r.specified = !0, a.length == 2 ? (r.prefix = a[0], r.localName = a[1]) : r.localName = e, r;
  }
};
W(Ot, L);
function qe() {
  this._nsMap = {};
}
qe.prototype = {
  nodeType: ie,
  hasAttribute: function(t) {
    return this.getAttributeNode(t) != null;
  },
  getAttribute: function(t) {
    var e = this.getAttributeNode(t);
    return e && e.value || "";
  },
  getAttributeNode: function(t) {
    return this.attributes.getNamedItem(t);
  },
  setAttribute: function(t, e) {
    var r = this.ownerDocument.createAttribute(t);
    r.value = r.nodeValue = "" + e, this.setAttributeNode(r);
  },
  removeAttribute: function(t) {
    var e = this.getAttributeNode(t);
    e && this.removeAttributeNode(e);
  },
  //four real opeartion method
  appendChild: function(t) {
    return t.nodeType === Ce ? this.insertBefore(t, null) : Yi(this, t);
  },
  setAttributeNode: function(t) {
    return this.attributes.setNamedItem(t);
  },
  setAttributeNodeNS: function(t) {
    return this.attributes.setNamedItemNS(t);
  },
  removeAttributeNode: function(t) {
    return this.attributes.removeNamedItem(t.nodeName);
  },
  //get real attribute name,and remove it by removeAttributeNode
  removeAttributeNS: function(t, e) {
    var r = this.getAttributeNodeNS(t, e);
    r && this.removeAttributeNode(r);
  },
  hasAttributeNS: function(t, e) {
    return this.getAttributeNodeNS(t, e) != null;
  },
  getAttributeNS: function(t, e) {
    var r = this.getAttributeNodeNS(t, e);
    return r && r.value || "";
  },
  setAttributeNS: function(t, e, r) {
    var a = this.ownerDocument.createAttributeNS(t, e);
    a.value = a.nodeValue = "" + r, this.setAttributeNode(a);
  },
  getAttributeNodeNS: function(t, e) {
    return this.attributes.getNamedItemNS(t, e);
  },
  getElementsByTagName: function(t) {
    return new ct(this, function(e) {
      var r = [];
      return Dt(e, function(a) {
        a !== e && a.nodeType == ie && (t === "*" || a.tagName == t) && r.push(a);
      }), r;
    });
  },
  getElementsByTagNameNS: function(t, e) {
    return new ct(this, function(r) {
      var a = [];
      return Dt(r, function(n) {
        n !== r && n.nodeType === ie && (t === "*" || n.namespaceURI === t) && (e === "*" || n.localName == e) && a.push(n);
      }), a;
    });
  }
};
Ot.prototype.getElementsByTagName = qe.prototype.getElementsByTagName;
Ot.prototype.getElementsByTagNameNS = qe.prototype.getElementsByTagNameNS;
W(qe, L);
function Kt() {
}
Kt.prototype.nodeType = it;
W(Kt, L);
function bt() {
}
bt.prototype = {
  data: "",
  substringData: function(t, e) {
    return this.data.substring(t, t + e);
  },
  appendData: function(t) {
    t = this.data + t, this.nodeValue = this.data = t, this.length = t.length;
  },
  insertData: function(t, e) {
    this.replaceData(t, 0, e);
  },
  appendChild: function(t) {
    throw new Error(X[Y]);
  },
  deleteData: function(t, e) {
    this.replaceData(t, e, "");
  },
  replaceData: function(t, e, r) {
    var a = this.data.substring(0, t), n = this.data.substring(t + e);
    r = a + r + n, this.nodeValue = this.data = r, this.length = r.length;
  }
};
W(bt, L);
function Pr() {
}
Pr.prototype = {
  nodeName: "#text",
  nodeType: zt,
  splitText: function(t) {
    var e = this.data, r = e.substring(t);
    e = e.substring(0, t), this.data = this.nodeValue = e, this.length = e.length;
    var a = this.ownerDocument.createTextNode(r);
    return this.parentNode && this.parentNode.insertBefore(a, this.nextSibling), a;
  }
};
W(Pr, bt);
function Br() {
}
Br.prototype = {
  nodeName: "#comment",
  nodeType: fn
};
W(Br, bt);
function Xr() {
}
Xr.prototype = {
  nodeName: "#cdata-section",
  nodeType: pn
};
W(Xr, bt);
function Zt() {
}
Zt.prototype.nodeType = gn;
W(Zt, L);
function Rn() {
}
Rn.prototype.nodeType = Gi;
W(Rn, L);
function Ln() {
}
Ln.prototype.nodeType = qi;
W(Ln, L);
function $r() {
}
$r.prototype.nodeType = _n;
W($r, L);
function er() {
}
er.prototype.nodeName = "#document-fragment";
er.prototype.nodeType = Ce;
W(er, L);
function kr() {
}
kr.prototype.nodeType = Tn;
W(kr, L);
function yn() {
}
yn.prototype.serializeToString = function(t, e, r) {
  return On.call(t, e, r);
};
L.prototype.toString = On;
function On(t, e) {
  var r = [], a = this.nodeType == 9 && this.documentElement || this, n = a.prefix, o = a.namespaceURI;
  if (o && n == null) {
    var n = a.lookupPrefix(o);
    if (n == null)
      var s = [
        { namespace: o, prefix: null }
        //{namespace:uri,prefix:''}
      ];
  }
  return ot(this, r, t, e, s), r.join("");
}
function pa(t, e, r) {
  var a = t.prefix || "", n = t.namespaceURI;
  if (!n || a === "xml" && n === vt.XML || n === vt.XMLNS)
    return !1;
  for (var o = r.length; o--; ) {
    var s = r[o];
    if (s.prefix === a)
      return s.namespace !== n;
  }
  return !0;
}
function dr(t, e, r) {
  t.push(" ", e, '="', r.replace(/[<>&"\t\n\r]/g, Cn), '"');
}
function ot(t, e, r, a, n) {
  if (n || (n = []), a)
    if (t = a(t), t) {
      if (typeof t == "string") {
        e.push(t);
        return;
      }
    } else
      return;
  switch (t.nodeType) {
    case ie:
      var o = t.attributes, s = o.length, O = t.firstChild, i = t.tagName;
      r = vt.isHTML(t.namespaceURI) || r;
      var c = i;
      if (!r && !t.prefix && t.namespaceURI) {
        for (var l, d = 0; d < o.length; d++)
          if (o.item(d).name === "xmlns") {
            l = o.item(d).value;
            break;
          }
        if (!l)
          for (var m = n.length - 1; m >= 0; m--) {
            var E = n[m];
            if (E.prefix === "" && E.namespace === t.namespaceURI) {
              l = E.namespace;
              break;
            }
          }
        if (l !== t.namespaceURI)
          for (var m = n.length - 1; m >= 0; m--) {
            var E = n[m];
            if (E.namespace === t.namespaceURI) {
              E.prefix && (c = E.prefix + ":" + i);
              break;
            }
          }
      }
      e.push("<", c);
      for (var _ = 0; _ < s; _++) {
        var A = o.item(_);
        A.prefix == "xmlns" ? n.push({ prefix: A.localName, namespace: A.value }) : A.nodeName == "xmlns" && n.push({ prefix: "", namespace: A.value });
      }
      for (var _ = 0; _ < s; _++) {
        var A = o.item(_);
        if (pa(A, r, n)) {
          var N = A.prefix || "", C = A.namespaceURI;
          dr(e, N ? "xmlns:" + N : "xmlns", C), n.push({ prefix: N, namespace: C });
        }
        ot(A, e, r, a, n);
      }
      if (i === c && pa(t, r, n)) {
        var N = t.prefix || "", C = t.namespaceURI;
        dr(e, N ? "xmlns:" + N : "xmlns", C), n.push({ prefix: N, namespace: C });
      }
      if (O || r && !/^(?:meta|link|img|br|hr|input)$/i.test(i)) {
        if (e.push(">"), r && /^script$/i.test(i))
          for (; O; )
            O.data ? e.push(O.data) : ot(O, e, r, a, n.slice()), O = O.nextSibling;
        else
          for (; O; )
            ot(O, e, r, a, n.slice()), O = O.nextSibling;
        e.push("</", c, ">");
      } else
        e.push("/>");
      return;
    case Nn:
    case Ce:
      for (var O = t.firstChild; O; )
        ot(O, e, r, a, n.slice()), O = O.nextSibling;
      return;
    case it:
      return dr(e, t.name, t.value);
    case zt:
      return e.push(
        t.data.replace(/[<&>]/g, Cn)
      );
    case pn:
      return e.push("<![CDATA[", t.data, "]]>");
    case fn:
      return e.push("<!--", t.data, "-->");
    case gn:
      var J = t.publicId, b = t.systemId;
      if (e.push("<!DOCTYPE ", t.name), J)
        e.push(" PUBLIC ", J), b && b != "." && e.push(" ", b), e.push(">");
      else if (b && b != ".")
        e.push(" SYSTEM ", b, ">");
      else {
        var F = t.internalSubset;
        F && e.push(" [", F, "]"), e.push(">");
      }
      return;
    case Tn:
      return e.push("<?", t.target, " ", t.data, "?>");
    case _n:
      return e.push("&", t.nodeName, ";");
    default:
      e.push("??", t.nodeName);
  }
}
function bn(t, e, r) {
  var a;
  switch (e.nodeType) {
    case ie:
      a = e.cloneNode(!1), a.ownerDocument = t;
    case Ce:
      break;
    case it:
      r = !0;
      break;
  }
  if (a || (a = e.cloneNode(!1)), a.ownerDocument = t, a.parentNode = null, r)
    for (var n = e.firstChild; n; )
      a.appendChild(bn(t, n, r)), n = n.nextSibling;
  return a;
}
function Sr(t, e, r) {
  var a = new e.constructor();
  for (var n in e)
    if (Object.prototype.hasOwnProperty.call(e, n)) {
      var o = e[n];
      typeof o != "object" && o != a[n] && (a[n] = o);
    }
  switch (e.childNodes && (a.childNodes = new Ie()), a.ownerDocument = t, a.nodeType) {
    case ie:
      var s = e.attributes, i = a.attributes = new jt(), c = s.length;
      i._ownerElement = a;
      for (var l = 0; l < c; l++)
        a.setAttributeNode(Sr(t, s.item(l), !0));
      break;
    case it:
      r = !0;
  }
  if (r)
    for (var d = e.firstChild; d; )
      a.appendChild(Sr(t, d, r)), d = d.nextSibling;
  return a;
}
function Un(t, e, r) {
  t[e] = r;
}
try {
  if (Object.defineProperty) {
    let t = function(e) {
      switch (e.nodeType) {
        case ie:
        case Ce:
          var r = [];
          for (e = e.firstChild; e; )
            e.nodeType !== 7 && e.nodeType !== 8 && r.push(t(e)), e = e.nextSibling;
          return r.join("");
        default:
          return e.nodeValue;
      }
    };
    Object.defineProperty(ct.prototype, "length", {
      get: function() {
        return wr(this), this.$$length;
      }
    }), Object.defineProperty(L.prototype, "textContent", {
      get: function() {
        return t(this);
      },
      set: function(e) {
        switch (this.nodeType) {
          case ie:
          case Ce:
            for (; this.firstChild; )
              this.removeChild(this.firstChild);
            (e || String(e)) && this.appendChild(this.ownerDocument.createTextNode(e));
            break;
          default:
            this.data = e, this.value = e, this.nodeValue = e;
        }
      }
    }), Un = function(e, r, a) {
      e["$$" + r] = a;
    };
  }
} catch {
}
Ue.DocumentType = Zt;
Ue.DOMException = M;
Ue.DOMImplementation = In;
Ue.Element = qe;
Ue.Node = L;
Ue.NodeList = Ie;
Ue.XMLSerializer = yn;
var tr = {}, Fn = {};
(function(t) {
  var e = Se.freeze;
  t.XML_ENTITIES = e({
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"'
  }), t.HTML_ENTITIES = e({
    Aacute: "Á",
    aacute: "á",
    Abreve: "Ă",
    abreve: "ă",
    ac: "∾",
    acd: "∿",
    acE: "∾̳",
    Acirc: "Â",
    acirc: "â",
    acute: "´",
    Acy: "А",
    acy: "а",
    AElig: "Æ",
    aelig: "æ",
    af: "⁡",
    Afr: "𝔄",
    afr: "𝔞",
    Agrave: "À",
    agrave: "à",
    alefsym: "ℵ",
    aleph: "ℵ",
    Alpha: "Α",
    alpha: "α",
    Amacr: "Ā",
    amacr: "ā",
    amalg: "⨿",
    AMP: "&",
    amp: "&",
    And: "⩓",
    and: "∧",
    andand: "⩕",
    andd: "⩜",
    andslope: "⩘",
    andv: "⩚",
    ang: "∠",
    ange: "⦤",
    angle: "∠",
    angmsd: "∡",
    angmsdaa: "⦨",
    angmsdab: "⦩",
    angmsdac: "⦪",
    angmsdad: "⦫",
    angmsdae: "⦬",
    angmsdaf: "⦭",
    angmsdag: "⦮",
    angmsdah: "⦯",
    angrt: "∟",
    angrtvb: "⊾",
    angrtvbd: "⦝",
    angsph: "∢",
    angst: "Å",
    angzarr: "⍼",
    Aogon: "Ą",
    aogon: "ą",
    Aopf: "𝔸",
    aopf: "𝕒",
    ap: "≈",
    apacir: "⩯",
    apE: "⩰",
    ape: "≊",
    apid: "≋",
    apos: "'",
    ApplyFunction: "⁡",
    approx: "≈",
    approxeq: "≊",
    Aring: "Å",
    aring: "å",
    Ascr: "𝒜",
    ascr: "𝒶",
    Assign: "≔",
    ast: "*",
    asymp: "≈",
    asympeq: "≍",
    Atilde: "Ã",
    atilde: "ã",
    Auml: "Ä",
    auml: "ä",
    awconint: "∳",
    awint: "⨑",
    backcong: "≌",
    backepsilon: "϶",
    backprime: "‵",
    backsim: "∽",
    backsimeq: "⋍",
    Backslash: "∖",
    Barv: "⫧",
    barvee: "⊽",
    Barwed: "⌆",
    barwed: "⌅",
    barwedge: "⌅",
    bbrk: "⎵",
    bbrktbrk: "⎶",
    bcong: "≌",
    Bcy: "Б",
    bcy: "б",
    bdquo: "„",
    becaus: "∵",
    Because: "∵",
    because: "∵",
    bemptyv: "⦰",
    bepsi: "϶",
    bernou: "ℬ",
    Bernoullis: "ℬ",
    Beta: "Β",
    beta: "β",
    beth: "ℶ",
    between: "≬",
    Bfr: "𝔅",
    bfr: "𝔟",
    bigcap: "⋂",
    bigcirc: "◯",
    bigcup: "⋃",
    bigodot: "⨀",
    bigoplus: "⨁",
    bigotimes: "⨂",
    bigsqcup: "⨆",
    bigstar: "★",
    bigtriangledown: "▽",
    bigtriangleup: "△",
    biguplus: "⨄",
    bigvee: "⋁",
    bigwedge: "⋀",
    bkarow: "⤍",
    blacklozenge: "⧫",
    blacksquare: "▪",
    blacktriangle: "▴",
    blacktriangledown: "▾",
    blacktriangleleft: "◂",
    blacktriangleright: "▸",
    blank: "␣",
    blk12: "▒",
    blk14: "░",
    blk34: "▓",
    block: "█",
    bne: "=⃥",
    bnequiv: "≡⃥",
    bNot: "⫭",
    bnot: "⌐",
    Bopf: "𝔹",
    bopf: "𝕓",
    bot: "⊥",
    bottom: "⊥",
    bowtie: "⋈",
    boxbox: "⧉",
    boxDL: "╗",
    boxDl: "╖",
    boxdL: "╕",
    boxdl: "┐",
    boxDR: "╔",
    boxDr: "╓",
    boxdR: "╒",
    boxdr: "┌",
    boxH: "═",
    boxh: "─",
    boxHD: "╦",
    boxHd: "╤",
    boxhD: "╥",
    boxhd: "┬",
    boxHU: "╩",
    boxHu: "╧",
    boxhU: "╨",
    boxhu: "┴",
    boxminus: "⊟",
    boxplus: "⊞",
    boxtimes: "⊠",
    boxUL: "╝",
    boxUl: "╜",
    boxuL: "╛",
    boxul: "┘",
    boxUR: "╚",
    boxUr: "╙",
    boxuR: "╘",
    boxur: "└",
    boxV: "║",
    boxv: "│",
    boxVH: "╬",
    boxVh: "╫",
    boxvH: "╪",
    boxvh: "┼",
    boxVL: "╣",
    boxVl: "╢",
    boxvL: "╡",
    boxvl: "┤",
    boxVR: "╠",
    boxVr: "╟",
    boxvR: "╞",
    boxvr: "├",
    bprime: "‵",
    Breve: "˘",
    breve: "˘",
    brvbar: "¦",
    Bscr: "ℬ",
    bscr: "𝒷",
    bsemi: "⁏",
    bsim: "∽",
    bsime: "⋍",
    bsol: "\\",
    bsolb: "⧅",
    bsolhsub: "⟈",
    bull: "•",
    bullet: "•",
    bump: "≎",
    bumpE: "⪮",
    bumpe: "≏",
    Bumpeq: "≎",
    bumpeq: "≏",
    Cacute: "Ć",
    cacute: "ć",
    Cap: "⋒",
    cap: "∩",
    capand: "⩄",
    capbrcup: "⩉",
    capcap: "⩋",
    capcup: "⩇",
    capdot: "⩀",
    CapitalDifferentialD: "ⅅ",
    caps: "∩︀",
    caret: "⁁",
    caron: "ˇ",
    Cayleys: "ℭ",
    ccaps: "⩍",
    Ccaron: "Č",
    ccaron: "č",
    Ccedil: "Ç",
    ccedil: "ç",
    Ccirc: "Ĉ",
    ccirc: "ĉ",
    Cconint: "∰",
    ccups: "⩌",
    ccupssm: "⩐",
    Cdot: "Ċ",
    cdot: "ċ",
    cedil: "¸",
    Cedilla: "¸",
    cemptyv: "⦲",
    cent: "¢",
    CenterDot: "·",
    centerdot: "·",
    Cfr: "ℭ",
    cfr: "𝔠",
    CHcy: "Ч",
    chcy: "ч",
    check: "✓",
    checkmark: "✓",
    Chi: "Χ",
    chi: "χ",
    cir: "○",
    circ: "ˆ",
    circeq: "≗",
    circlearrowleft: "↺",
    circlearrowright: "↻",
    circledast: "⊛",
    circledcirc: "⊚",
    circleddash: "⊝",
    CircleDot: "⊙",
    circledR: "®",
    circledS: "Ⓢ",
    CircleMinus: "⊖",
    CirclePlus: "⊕",
    CircleTimes: "⊗",
    cirE: "⧃",
    cire: "≗",
    cirfnint: "⨐",
    cirmid: "⫯",
    cirscir: "⧂",
    ClockwiseContourIntegral: "∲",
    CloseCurlyDoubleQuote: "”",
    CloseCurlyQuote: "’",
    clubs: "♣",
    clubsuit: "♣",
    Colon: "∷",
    colon: ":",
    Colone: "⩴",
    colone: "≔",
    coloneq: "≔",
    comma: ",",
    commat: "@",
    comp: "∁",
    compfn: "∘",
    complement: "∁",
    complexes: "ℂ",
    cong: "≅",
    congdot: "⩭",
    Congruent: "≡",
    Conint: "∯",
    conint: "∮",
    ContourIntegral: "∮",
    Copf: "ℂ",
    copf: "𝕔",
    coprod: "∐",
    Coproduct: "∐",
    COPY: "©",
    copy: "©",
    copysr: "℗",
    CounterClockwiseContourIntegral: "∳",
    crarr: "↵",
    Cross: "⨯",
    cross: "✗",
    Cscr: "𝒞",
    cscr: "𝒸",
    csub: "⫏",
    csube: "⫑",
    csup: "⫐",
    csupe: "⫒",
    ctdot: "⋯",
    cudarrl: "⤸",
    cudarrr: "⤵",
    cuepr: "⋞",
    cuesc: "⋟",
    cularr: "↶",
    cularrp: "⤽",
    Cup: "⋓",
    cup: "∪",
    cupbrcap: "⩈",
    CupCap: "≍",
    cupcap: "⩆",
    cupcup: "⩊",
    cupdot: "⊍",
    cupor: "⩅",
    cups: "∪︀",
    curarr: "↷",
    curarrm: "⤼",
    curlyeqprec: "⋞",
    curlyeqsucc: "⋟",
    curlyvee: "⋎",
    curlywedge: "⋏",
    curren: "¤",
    curvearrowleft: "↶",
    curvearrowright: "↷",
    cuvee: "⋎",
    cuwed: "⋏",
    cwconint: "∲",
    cwint: "∱",
    cylcty: "⌭",
    Dagger: "‡",
    dagger: "†",
    daleth: "ℸ",
    Darr: "↡",
    dArr: "⇓",
    darr: "↓",
    dash: "‐",
    Dashv: "⫤",
    dashv: "⊣",
    dbkarow: "⤏",
    dblac: "˝",
    Dcaron: "Ď",
    dcaron: "ď",
    Dcy: "Д",
    dcy: "д",
    DD: "ⅅ",
    dd: "ⅆ",
    ddagger: "‡",
    ddarr: "⇊",
    DDotrahd: "⤑",
    ddotseq: "⩷",
    deg: "°",
    Del: "∇",
    Delta: "Δ",
    delta: "δ",
    demptyv: "⦱",
    dfisht: "⥿",
    Dfr: "𝔇",
    dfr: "𝔡",
    dHar: "⥥",
    dharl: "⇃",
    dharr: "⇂",
    DiacriticalAcute: "´",
    DiacriticalDot: "˙",
    DiacriticalDoubleAcute: "˝",
    DiacriticalGrave: "`",
    DiacriticalTilde: "˜",
    diam: "⋄",
    Diamond: "⋄",
    diamond: "⋄",
    diamondsuit: "♦",
    diams: "♦",
    die: "¨",
    DifferentialD: "ⅆ",
    digamma: "ϝ",
    disin: "⋲",
    div: "÷",
    divide: "÷",
    divideontimes: "⋇",
    divonx: "⋇",
    DJcy: "Ђ",
    djcy: "ђ",
    dlcorn: "⌞",
    dlcrop: "⌍",
    dollar: "$",
    Dopf: "𝔻",
    dopf: "𝕕",
    Dot: "¨",
    dot: "˙",
    DotDot: "⃜",
    doteq: "≐",
    doteqdot: "≑",
    DotEqual: "≐",
    dotminus: "∸",
    dotplus: "∔",
    dotsquare: "⊡",
    doublebarwedge: "⌆",
    DoubleContourIntegral: "∯",
    DoubleDot: "¨",
    DoubleDownArrow: "⇓",
    DoubleLeftArrow: "⇐",
    DoubleLeftRightArrow: "⇔",
    DoubleLeftTee: "⫤",
    DoubleLongLeftArrow: "⟸",
    DoubleLongLeftRightArrow: "⟺",
    DoubleLongRightArrow: "⟹",
    DoubleRightArrow: "⇒",
    DoubleRightTee: "⊨",
    DoubleUpArrow: "⇑",
    DoubleUpDownArrow: "⇕",
    DoubleVerticalBar: "∥",
    DownArrow: "↓",
    Downarrow: "⇓",
    downarrow: "↓",
    DownArrowBar: "⤓",
    DownArrowUpArrow: "⇵",
    DownBreve: "̑",
    downdownarrows: "⇊",
    downharpoonleft: "⇃",
    downharpoonright: "⇂",
    DownLeftRightVector: "⥐",
    DownLeftTeeVector: "⥞",
    DownLeftVector: "↽",
    DownLeftVectorBar: "⥖",
    DownRightTeeVector: "⥟",
    DownRightVector: "⇁",
    DownRightVectorBar: "⥗",
    DownTee: "⊤",
    DownTeeArrow: "↧",
    drbkarow: "⤐",
    drcorn: "⌟",
    drcrop: "⌌",
    Dscr: "𝒟",
    dscr: "𝒹",
    DScy: "Ѕ",
    dscy: "ѕ",
    dsol: "⧶",
    Dstrok: "Đ",
    dstrok: "đ",
    dtdot: "⋱",
    dtri: "▿",
    dtrif: "▾",
    duarr: "⇵",
    duhar: "⥯",
    dwangle: "⦦",
    DZcy: "Џ",
    dzcy: "џ",
    dzigrarr: "⟿",
    Eacute: "É",
    eacute: "é",
    easter: "⩮",
    Ecaron: "Ě",
    ecaron: "ě",
    ecir: "≖",
    Ecirc: "Ê",
    ecirc: "ê",
    ecolon: "≕",
    Ecy: "Э",
    ecy: "э",
    eDDot: "⩷",
    Edot: "Ė",
    eDot: "≑",
    edot: "ė",
    ee: "ⅇ",
    efDot: "≒",
    Efr: "𝔈",
    efr: "𝔢",
    eg: "⪚",
    Egrave: "È",
    egrave: "è",
    egs: "⪖",
    egsdot: "⪘",
    el: "⪙",
    Element: "∈",
    elinters: "⏧",
    ell: "ℓ",
    els: "⪕",
    elsdot: "⪗",
    Emacr: "Ē",
    emacr: "ē",
    empty: "∅",
    emptyset: "∅",
    EmptySmallSquare: "◻",
    emptyv: "∅",
    EmptyVerySmallSquare: "▫",
    emsp: " ",
    emsp13: " ",
    emsp14: " ",
    ENG: "Ŋ",
    eng: "ŋ",
    ensp: " ",
    Eogon: "Ę",
    eogon: "ę",
    Eopf: "𝔼",
    eopf: "𝕖",
    epar: "⋕",
    eparsl: "⧣",
    eplus: "⩱",
    epsi: "ε",
    Epsilon: "Ε",
    epsilon: "ε",
    epsiv: "ϵ",
    eqcirc: "≖",
    eqcolon: "≕",
    eqsim: "≂",
    eqslantgtr: "⪖",
    eqslantless: "⪕",
    Equal: "⩵",
    equals: "=",
    EqualTilde: "≂",
    equest: "≟",
    Equilibrium: "⇌",
    equiv: "≡",
    equivDD: "⩸",
    eqvparsl: "⧥",
    erarr: "⥱",
    erDot: "≓",
    Escr: "ℰ",
    escr: "ℯ",
    esdot: "≐",
    Esim: "⩳",
    esim: "≂",
    Eta: "Η",
    eta: "η",
    ETH: "Ð",
    eth: "ð",
    Euml: "Ë",
    euml: "ë",
    euro: "€",
    excl: "!",
    exist: "∃",
    Exists: "∃",
    expectation: "ℰ",
    ExponentialE: "ⅇ",
    exponentiale: "ⅇ",
    fallingdotseq: "≒",
    Fcy: "Ф",
    fcy: "ф",
    female: "♀",
    ffilig: "ﬃ",
    fflig: "ﬀ",
    ffllig: "ﬄ",
    Ffr: "𝔉",
    ffr: "𝔣",
    filig: "ﬁ",
    FilledSmallSquare: "◼",
    FilledVerySmallSquare: "▪",
    fjlig: "fj",
    flat: "♭",
    fllig: "ﬂ",
    fltns: "▱",
    fnof: "ƒ",
    Fopf: "𝔽",
    fopf: "𝕗",
    ForAll: "∀",
    forall: "∀",
    fork: "⋔",
    forkv: "⫙",
    Fouriertrf: "ℱ",
    fpartint: "⨍",
    frac12: "½",
    frac13: "⅓",
    frac14: "¼",
    frac15: "⅕",
    frac16: "⅙",
    frac18: "⅛",
    frac23: "⅔",
    frac25: "⅖",
    frac34: "¾",
    frac35: "⅗",
    frac38: "⅜",
    frac45: "⅘",
    frac56: "⅚",
    frac58: "⅝",
    frac78: "⅞",
    frasl: "⁄",
    frown: "⌢",
    Fscr: "ℱ",
    fscr: "𝒻",
    gacute: "ǵ",
    Gamma: "Γ",
    gamma: "γ",
    Gammad: "Ϝ",
    gammad: "ϝ",
    gap: "⪆",
    Gbreve: "Ğ",
    gbreve: "ğ",
    Gcedil: "Ģ",
    Gcirc: "Ĝ",
    gcirc: "ĝ",
    Gcy: "Г",
    gcy: "г",
    Gdot: "Ġ",
    gdot: "ġ",
    gE: "≧",
    ge: "≥",
    gEl: "⪌",
    gel: "⋛",
    geq: "≥",
    geqq: "≧",
    geqslant: "⩾",
    ges: "⩾",
    gescc: "⪩",
    gesdot: "⪀",
    gesdoto: "⪂",
    gesdotol: "⪄",
    gesl: "⋛︀",
    gesles: "⪔",
    Gfr: "𝔊",
    gfr: "𝔤",
    Gg: "⋙",
    gg: "≫",
    ggg: "⋙",
    gimel: "ℷ",
    GJcy: "Ѓ",
    gjcy: "ѓ",
    gl: "≷",
    gla: "⪥",
    glE: "⪒",
    glj: "⪤",
    gnap: "⪊",
    gnapprox: "⪊",
    gnE: "≩",
    gne: "⪈",
    gneq: "⪈",
    gneqq: "≩",
    gnsim: "⋧",
    Gopf: "𝔾",
    gopf: "𝕘",
    grave: "`",
    GreaterEqual: "≥",
    GreaterEqualLess: "⋛",
    GreaterFullEqual: "≧",
    GreaterGreater: "⪢",
    GreaterLess: "≷",
    GreaterSlantEqual: "⩾",
    GreaterTilde: "≳",
    Gscr: "𝒢",
    gscr: "ℊ",
    gsim: "≳",
    gsime: "⪎",
    gsiml: "⪐",
    Gt: "≫",
    GT: ">",
    gt: ">",
    gtcc: "⪧",
    gtcir: "⩺",
    gtdot: "⋗",
    gtlPar: "⦕",
    gtquest: "⩼",
    gtrapprox: "⪆",
    gtrarr: "⥸",
    gtrdot: "⋗",
    gtreqless: "⋛",
    gtreqqless: "⪌",
    gtrless: "≷",
    gtrsim: "≳",
    gvertneqq: "≩︀",
    gvnE: "≩︀",
    Hacek: "ˇ",
    hairsp: " ",
    half: "½",
    hamilt: "ℋ",
    HARDcy: "Ъ",
    hardcy: "ъ",
    hArr: "⇔",
    harr: "↔",
    harrcir: "⥈",
    harrw: "↭",
    Hat: "^",
    hbar: "ℏ",
    Hcirc: "Ĥ",
    hcirc: "ĥ",
    hearts: "♥",
    heartsuit: "♥",
    hellip: "…",
    hercon: "⊹",
    Hfr: "ℌ",
    hfr: "𝔥",
    HilbertSpace: "ℋ",
    hksearow: "⤥",
    hkswarow: "⤦",
    hoarr: "⇿",
    homtht: "∻",
    hookleftarrow: "↩",
    hookrightarrow: "↪",
    Hopf: "ℍ",
    hopf: "𝕙",
    horbar: "―",
    HorizontalLine: "─",
    Hscr: "ℋ",
    hscr: "𝒽",
    hslash: "ℏ",
    Hstrok: "Ħ",
    hstrok: "ħ",
    HumpDownHump: "≎",
    HumpEqual: "≏",
    hybull: "⁃",
    hyphen: "‐",
    Iacute: "Í",
    iacute: "í",
    ic: "⁣",
    Icirc: "Î",
    icirc: "î",
    Icy: "И",
    icy: "и",
    Idot: "İ",
    IEcy: "Е",
    iecy: "е",
    iexcl: "¡",
    iff: "⇔",
    Ifr: "ℑ",
    ifr: "𝔦",
    Igrave: "Ì",
    igrave: "ì",
    ii: "ⅈ",
    iiiint: "⨌",
    iiint: "∭",
    iinfin: "⧜",
    iiota: "℩",
    IJlig: "Ĳ",
    ijlig: "ĳ",
    Im: "ℑ",
    Imacr: "Ī",
    imacr: "ī",
    image: "ℑ",
    ImaginaryI: "ⅈ",
    imagline: "ℐ",
    imagpart: "ℑ",
    imath: "ı",
    imof: "⊷",
    imped: "Ƶ",
    Implies: "⇒",
    in: "∈",
    incare: "℅",
    infin: "∞",
    infintie: "⧝",
    inodot: "ı",
    Int: "∬",
    int: "∫",
    intcal: "⊺",
    integers: "ℤ",
    Integral: "∫",
    intercal: "⊺",
    Intersection: "⋂",
    intlarhk: "⨗",
    intprod: "⨼",
    InvisibleComma: "⁣",
    InvisibleTimes: "⁢",
    IOcy: "Ё",
    iocy: "ё",
    Iogon: "Į",
    iogon: "į",
    Iopf: "𝕀",
    iopf: "𝕚",
    Iota: "Ι",
    iota: "ι",
    iprod: "⨼",
    iquest: "¿",
    Iscr: "ℐ",
    iscr: "𝒾",
    isin: "∈",
    isindot: "⋵",
    isinE: "⋹",
    isins: "⋴",
    isinsv: "⋳",
    isinv: "∈",
    it: "⁢",
    Itilde: "Ĩ",
    itilde: "ĩ",
    Iukcy: "І",
    iukcy: "і",
    Iuml: "Ï",
    iuml: "ï",
    Jcirc: "Ĵ",
    jcirc: "ĵ",
    Jcy: "Й",
    jcy: "й",
    Jfr: "𝔍",
    jfr: "𝔧",
    jmath: "ȷ",
    Jopf: "𝕁",
    jopf: "𝕛",
    Jscr: "𝒥",
    jscr: "𝒿",
    Jsercy: "Ј",
    jsercy: "ј",
    Jukcy: "Є",
    jukcy: "є",
    Kappa: "Κ",
    kappa: "κ",
    kappav: "ϰ",
    Kcedil: "Ķ",
    kcedil: "ķ",
    Kcy: "К",
    kcy: "к",
    Kfr: "𝔎",
    kfr: "𝔨",
    kgreen: "ĸ",
    KHcy: "Х",
    khcy: "х",
    KJcy: "Ќ",
    kjcy: "ќ",
    Kopf: "𝕂",
    kopf: "𝕜",
    Kscr: "𝒦",
    kscr: "𝓀",
    lAarr: "⇚",
    Lacute: "Ĺ",
    lacute: "ĺ",
    laemptyv: "⦴",
    lagran: "ℒ",
    Lambda: "Λ",
    lambda: "λ",
    Lang: "⟪",
    lang: "⟨",
    langd: "⦑",
    langle: "⟨",
    lap: "⪅",
    Laplacetrf: "ℒ",
    laquo: "«",
    Larr: "↞",
    lArr: "⇐",
    larr: "←",
    larrb: "⇤",
    larrbfs: "⤟",
    larrfs: "⤝",
    larrhk: "↩",
    larrlp: "↫",
    larrpl: "⤹",
    larrsim: "⥳",
    larrtl: "↢",
    lat: "⪫",
    lAtail: "⤛",
    latail: "⤙",
    late: "⪭",
    lates: "⪭︀",
    lBarr: "⤎",
    lbarr: "⤌",
    lbbrk: "❲",
    lbrace: "{",
    lbrack: "[",
    lbrke: "⦋",
    lbrksld: "⦏",
    lbrkslu: "⦍",
    Lcaron: "Ľ",
    lcaron: "ľ",
    Lcedil: "Ļ",
    lcedil: "ļ",
    lceil: "⌈",
    lcub: "{",
    Lcy: "Л",
    lcy: "л",
    ldca: "⤶",
    ldquo: "“",
    ldquor: "„",
    ldrdhar: "⥧",
    ldrushar: "⥋",
    ldsh: "↲",
    lE: "≦",
    le: "≤",
    LeftAngleBracket: "⟨",
    LeftArrow: "←",
    Leftarrow: "⇐",
    leftarrow: "←",
    LeftArrowBar: "⇤",
    LeftArrowRightArrow: "⇆",
    leftarrowtail: "↢",
    LeftCeiling: "⌈",
    LeftDoubleBracket: "⟦",
    LeftDownTeeVector: "⥡",
    LeftDownVector: "⇃",
    LeftDownVectorBar: "⥙",
    LeftFloor: "⌊",
    leftharpoondown: "↽",
    leftharpoonup: "↼",
    leftleftarrows: "⇇",
    LeftRightArrow: "↔",
    Leftrightarrow: "⇔",
    leftrightarrow: "↔",
    leftrightarrows: "⇆",
    leftrightharpoons: "⇋",
    leftrightsquigarrow: "↭",
    LeftRightVector: "⥎",
    LeftTee: "⊣",
    LeftTeeArrow: "↤",
    LeftTeeVector: "⥚",
    leftthreetimes: "⋋",
    LeftTriangle: "⊲",
    LeftTriangleBar: "⧏",
    LeftTriangleEqual: "⊴",
    LeftUpDownVector: "⥑",
    LeftUpTeeVector: "⥠",
    LeftUpVector: "↿",
    LeftUpVectorBar: "⥘",
    LeftVector: "↼",
    LeftVectorBar: "⥒",
    lEg: "⪋",
    leg: "⋚",
    leq: "≤",
    leqq: "≦",
    leqslant: "⩽",
    les: "⩽",
    lescc: "⪨",
    lesdot: "⩿",
    lesdoto: "⪁",
    lesdotor: "⪃",
    lesg: "⋚︀",
    lesges: "⪓",
    lessapprox: "⪅",
    lessdot: "⋖",
    lesseqgtr: "⋚",
    lesseqqgtr: "⪋",
    LessEqualGreater: "⋚",
    LessFullEqual: "≦",
    LessGreater: "≶",
    lessgtr: "≶",
    LessLess: "⪡",
    lesssim: "≲",
    LessSlantEqual: "⩽",
    LessTilde: "≲",
    lfisht: "⥼",
    lfloor: "⌊",
    Lfr: "𝔏",
    lfr: "𝔩",
    lg: "≶",
    lgE: "⪑",
    lHar: "⥢",
    lhard: "↽",
    lharu: "↼",
    lharul: "⥪",
    lhblk: "▄",
    LJcy: "Љ",
    ljcy: "љ",
    Ll: "⋘",
    ll: "≪",
    llarr: "⇇",
    llcorner: "⌞",
    Lleftarrow: "⇚",
    llhard: "⥫",
    lltri: "◺",
    Lmidot: "Ŀ",
    lmidot: "ŀ",
    lmoust: "⎰",
    lmoustache: "⎰",
    lnap: "⪉",
    lnapprox: "⪉",
    lnE: "≨",
    lne: "⪇",
    lneq: "⪇",
    lneqq: "≨",
    lnsim: "⋦",
    loang: "⟬",
    loarr: "⇽",
    lobrk: "⟦",
    LongLeftArrow: "⟵",
    Longleftarrow: "⟸",
    longleftarrow: "⟵",
    LongLeftRightArrow: "⟷",
    Longleftrightarrow: "⟺",
    longleftrightarrow: "⟷",
    longmapsto: "⟼",
    LongRightArrow: "⟶",
    Longrightarrow: "⟹",
    longrightarrow: "⟶",
    looparrowleft: "↫",
    looparrowright: "↬",
    lopar: "⦅",
    Lopf: "𝕃",
    lopf: "𝕝",
    loplus: "⨭",
    lotimes: "⨴",
    lowast: "∗",
    lowbar: "_",
    LowerLeftArrow: "↙",
    LowerRightArrow: "↘",
    loz: "◊",
    lozenge: "◊",
    lozf: "⧫",
    lpar: "(",
    lparlt: "⦓",
    lrarr: "⇆",
    lrcorner: "⌟",
    lrhar: "⇋",
    lrhard: "⥭",
    lrm: "‎",
    lrtri: "⊿",
    lsaquo: "‹",
    Lscr: "ℒ",
    lscr: "𝓁",
    Lsh: "↰",
    lsh: "↰",
    lsim: "≲",
    lsime: "⪍",
    lsimg: "⪏",
    lsqb: "[",
    lsquo: "‘",
    lsquor: "‚",
    Lstrok: "Ł",
    lstrok: "ł",
    Lt: "≪",
    LT: "<",
    lt: "<",
    ltcc: "⪦",
    ltcir: "⩹",
    ltdot: "⋖",
    lthree: "⋋",
    ltimes: "⋉",
    ltlarr: "⥶",
    ltquest: "⩻",
    ltri: "◃",
    ltrie: "⊴",
    ltrif: "◂",
    ltrPar: "⦖",
    lurdshar: "⥊",
    luruhar: "⥦",
    lvertneqq: "≨︀",
    lvnE: "≨︀",
    macr: "¯",
    male: "♂",
    malt: "✠",
    maltese: "✠",
    Map: "⤅",
    map: "↦",
    mapsto: "↦",
    mapstodown: "↧",
    mapstoleft: "↤",
    mapstoup: "↥",
    marker: "▮",
    mcomma: "⨩",
    Mcy: "М",
    mcy: "м",
    mdash: "—",
    mDDot: "∺",
    measuredangle: "∡",
    MediumSpace: " ",
    Mellintrf: "ℳ",
    Mfr: "𝔐",
    mfr: "𝔪",
    mho: "℧",
    micro: "µ",
    mid: "∣",
    midast: "*",
    midcir: "⫰",
    middot: "·",
    minus: "−",
    minusb: "⊟",
    minusd: "∸",
    minusdu: "⨪",
    MinusPlus: "∓",
    mlcp: "⫛",
    mldr: "…",
    mnplus: "∓",
    models: "⊧",
    Mopf: "𝕄",
    mopf: "𝕞",
    mp: "∓",
    Mscr: "ℳ",
    mscr: "𝓂",
    mstpos: "∾",
    Mu: "Μ",
    mu: "μ",
    multimap: "⊸",
    mumap: "⊸",
    nabla: "∇",
    Nacute: "Ń",
    nacute: "ń",
    nang: "∠⃒",
    nap: "≉",
    napE: "⩰̸",
    napid: "≋̸",
    napos: "ŉ",
    napprox: "≉",
    natur: "♮",
    natural: "♮",
    naturals: "ℕ",
    nbsp: " ",
    nbump: "≎̸",
    nbumpe: "≏̸",
    ncap: "⩃",
    Ncaron: "Ň",
    ncaron: "ň",
    Ncedil: "Ņ",
    ncedil: "ņ",
    ncong: "≇",
    ncongdot: "⩭̸",
    ncup: "⩂",
    Ncy: "Н",
    ncy: "н",
    ndash: "–",
    ne: "≠",
    nearhk: "⤤",
    neArr: "⇗",
    nearr: "↗",
    nearrow: "↗",
    nedot: "≐̸",
    NegativeMediumSpace: "​",
    NegativeThickSpace: "​",
    NegativeThinSpace: "​",
    NegativeVeryThinSpace: "​",
    nequiv: "≢",
    nesear: "⤨",
    nesim: "≂̸",
    NestedGreaterGreater: "≫",
    NestedLessLess: "≪",
    NewLine: `
`,
    nexist: "∄",
    nexists: "∄",
    Nfr: "𝔑",
    nfr: "𝔫",
    ngE: "≧̸",
    nge: "≱",
    ngeq: "≱",
    ngeqq: "≧̸",
    ngeqslant: "⩾̸",
    nges: "⩾̸",
    nGg: "⋙̸",
    ngsim: "≵",
    nGt: "≫⃒",
    ngt: "≯",
    ngtr: "≯",
    nGtv: "≫̸",
    nhArr: "⇎",
    nharr: "↮",
    nhpar: "⫲",
    ni: "∋",
    nis: "⋼",
    nisd: "⋺",
    niv: "∋",
    NJcy: "Њ",
    njcy: "њ",
    nlArr: "⇍",
    nlarr: "↚",
    nldr: "‥",
    nlE: "≦̸",
    nle: "≰",
    nLeftarrow: "⇍",
    nleftarrow: "↚",
    nLeftrightarrow: "⇎",
    nleftrightarrow: "↮",
    nleq: "≰",
    nleqq: "≦̸",
    nleqslant: "⩽̸",
    nles: "⩽̸",
    nless: "≮",
    nLl: "⋘̸",
    nlsim: "≴",
    nLt: "≪⃒",
    nlt: "≮",
    nltri: "⋪",
    nltrie: "⋬",
    nLtv: "≪̸",
    nmid: "∤",
    NoBreak: "⁠",
    NonBreakingSpace: " ",
    Nopf: "ℕ",
    nopf: "𝕟",
    Not: "⫬",
    not: "¬",
    NotCongruent: "≢",
    NotCupCap: "≭",
    NotDoubleVerticalBar: "∦",
    NotElement: "∉",
    NotEqual: "≠",
    NotEqualTilde: "≂̸",
    NotExists: "∄",
    NotGreater: "≯",
    NotGreaterEqual: "≱",
    NotGreaterFullEqual: "≧̸",
    NotGreaterGreater: "≫̸",
    NotGreaterLess: "≹",
    NotGreaterSlantEqual: "⩾̸",
    NotGreaterTilde: "≵",
    NotHumpDownHump: "≎̸",
    NotHumpEqual: "≏̸",
    notin: "∉",
    notindot: "⋵̸",
    notinE: "⋹̸",
    notinva: "∉",
    notinvb: "⋷",
    notinvc: "⋶",
    NotLeftTriangle: "⋪",
    NotLeftTriangleBar: "⧏̸",
    NotLeftTriangleEqual: "⋬",
    NotLess: "≮",
    NotLessEqual: "≰",
    NotLessGreater: "≸",
    NotLessLess: "≪̸",
    NotLessSlantEqual: "⩽̸",
    NotLessTilde: "≴",
    NotNestedGreaterGreater: "⪢̸",
    NotNestedLessLess: "⪡̸",
    notni: "∌",
    notniva: "∌",
    notnivb: "⋾",
    notnivc: "⋽",
    NotPrecedes: "⊀",
    NotPrecedesEqual: "⪯̸",
    NotPrecedesSlantEqual: "⋠",
    NotReverseElement: "∌",
    NotRightTriangle: "⋫",
    NotRightTriangleBar: "⧐̸",
    NotRightTriangleEqual: "⋭",
    NotSquareSubset: "⊏̸",
    NotSquareSubsetEqual: "⋢",
    NotSquareSuperset: "⊐̸",
    NotSquareSupersetEqual: "⋣",
    NotSubset: "⊂⃒",
    NotSubsetEqual: "⊈",
    NotSucceeds: "⊁",
    NotSucceedsEqual: "⪰̸",
    NotSucceedsSlantEqual: "⋡",
    NotSucceedsTilde: "≿̸",
    NotSuperset: "⊃⃒",
    NotSupersetEqual: "⊉",
    NotTilde: "≁",
    NotTildeEqual: "≄",
    NotTildeFullEqual: "≇",
    NotTildeTilde: "≉",
    NotVerticalBar: "∤",
    npar: "∦",
    nparallel: "∦",
    nparsl: "⫽⃥",
    npart: "∂̸",
    npolint: "⨔",
    npr: "⊀",
    nprcue: "⋠",
    npre: "⪯̸",
    nprec: "⊀",
    npreceq: "⪯̸",
    nrArr: "⇏",
    nrarr: "↛",
    nrarrc: "⤳̸",
    nrarrw: "↝̸",
    nRightarrow: "⇏",
    nrightarrow: "↛",
    nrtri: "⋫",
    nrtrie: "⋭",
    nsc: "⊁",
    nsccue: "⋡",
    nsce: "⪰̸",
    Nscr: "𝒩",
    nscr: "𝓃",
    nshortmid: "∤",
    nshortparallel: "∦",
    nsim: "≁",
    nsime: "≄",
    nsimeq: "≄",
    nsmid: "∤",
    nspar: "∦",
    nsqsube: "⋢",
    nsqsupe: "⋣",
    nsub: "⊄",
    nsubE: "⫅̸",
    nsube: "⊈",
    nsubset: "⊂⃒",
    nsubseteq: "⊈",
    nsubseteqq: "⫅̸",
    nsucc: "⊁",
    nsucceq: "⪰̸",
    nsup: "⊅",
    nsupE: "⫆̸",
    nsupe: "⊉",
    nsupset: "⊃⃒",
    nsupseteq: "⊉",
    nsupseteqq: "⫆̸",
    ntgl: "≹",
    Ntilde: "Ñ",
    ntilde: "ñ",
    ntlg: "≸",
    ntriangleleft: "⋪",
    ntrianglelefteq: "⋬",
    ntriangleright: "⋫",
    ntrianglerighteq: "⋭",
    Nu: "Ν",
    nu: "ν",
    num: "#",
    numero: "№",
    numsp: " ",
    nvap: "≍⃒",
    nVDash: "⊯",
    nVdash: "⊮",
    nvDash: "⊭",
    nvdash: "⊬",
    nvge: "≥⃒",
    nvgt: ">⃒",
    nvHarr: "⤄",
    nvinfin: "⧞",
    nvlArr: "⤂",
    nvle: "≤⃒",
    nvlt: "<⃒",
    nvltrie: "⊴⃒",
    nvrArr: "⤃",
    nvrtrie: "⊵⃒",
    nvsim: "∼⃒",
    nwarhk: "⤣",
    nwArr: "⇖",
    nwarr: "↖",
    nwarrow: "↖",
    nwnear: "⤧",
    Oacute: "Ó",
    oacute: "ó",
    oast: "⊛",
    ocir: "⊚",
    Ocirc: "Ô",
    ocirc: "ô",
    Ocy: "О",
    ocy: "о",
    odash: "⊝",
    Odblac: "Ő",
    odblac: "ő",
    odiv: "⨸",
    odot: "⊙",
    odsold: "⦼",
    OElig: "Œ",
    oelig: "œ",
    ofcir: "⦿",
    Ofr: "𝔒",
    ofr: "𝔬",
    ogon: "˛",
    Ograve: "Ò",
    ograve: "ò",
    ogt: "⧁",
    ohbar: "⦵",
    ohm: "Ω",
    oint: "∮",
    olarr: "↺",
    olcir: "⦾",
    olcross: "⦻",
    oline: "‾",
    olt: "⧀",
    Omacr: "Ō",
    omacr: "ō",
    Omega: "Ω",
    omega: "ω",
    Omicron: "Ο",
    omicron: "ο",
    omid: "⦶",
    ominus: "⊖",
    Oopf: "𝕆",
    oopf: "𝕠",
    opar: "⦷",
    OpenCurlyDoubleQuote: "“",
    OpenCurlyQuote: "‘",
    operp: "⦹",
    oplus: "⊕",
    Or: "⩔",
    or: "∨",
    orarr: "↻",
    ord: "⩝",
    order: "ℴ",
    orderof: "ℴ",
    ordf: "ª",
    ordm: "º",
    origof: "⊶",
    oror: "⩖",
    orslope: "⩗",
    orv: "⩛",
    oS: "Ⓢ",
    Oscr: "𝒪",
    oscr: "ℴ",
    Oslash: "Ø",
    oslash: "ø",
    osol: "⊘",
    Otilde: "Õ",
    otilde: "õ",
    Otimes: "⨷",
    otimes: "⊗",
    otimesas: "⨶",
    Ouml: "Ö",
    ouml: "ö",
    ovbar: "⌽",
    OverBar: "‾",
    OverBrace: "⏞",
    OverBracket: "⎴",
    OverParenthesis: "⏜",
    par: "∥",
    para: "¶",
    parallel: "∥",
    parsim: "⫳",
    parsl: "⫽",
    part: "∂",
    PartialD: "∂",
    Pcy: "П",
    pcy: "п",
    percnt: "%",
    period: ".",
    permil: "‰",
    perp: "⊥",
    pertenk: "‱",
    Pfr: "𝔓",
    pfr: "𝔭",
    Phi: "Φ",
    phi: "φ",
    phiv: "ϕ",
    phmmat: "ℳ",
    phone: "☎",
    Pi: "Π",
    pi: "π",
    pitchfork: "⋔",
    piv: "ϖ",
    planck: "ℏ",
    planckh: "ℎ",
    plankv: "ℏ",
    plus: "+",
    plusacir: "⨣",
    plusb: "⊞",
    pluscir: "⨢",
    plusdo: "∔",
    plusdu: "⨥",
    pluse: "⩲",
    PlusMinus: "±",
    plusmn: "±",
    plussim: "⨦",
    plustwo: "⨧",
    pm: "±",
    Poincareplane: "ℌ",
    pointint: "⨕",
    Popf: "ℙ",
    popf: "𝕡",
    pound: "£",
    Pr: "⪻",
    pr: "≺",
    prap: "⪷",
    prcue: "≼",
    prE: "⪳",
    pre: "⪯",
    prec: "≺",
    precapprox: "⪷",
    preccurlyeq: "≼",
    Precedes: "≺",
    PrecedesEqual: "⪯",
    PrecedesSlantEqual: "≼",
    PrecedesTilde: "≾",
    preceq: "⪯",
    precnapprox: "⪹",
    precneqq: "⪵",
    precnsim: "⋨",
    precsim: "≾",
    Prime: "″",
    prime: "′",
    primes: "ℙ",
    prnap: "⪹",
    prnE: "⪵",
    prnsim: "⋨",
    prod: "∏",
    Product: "∏",
    profalar: "⌮",
    profline: "⌒",
    profsurf: "⌓",
    prop: "∝",
    Proportion: "∷",
    Proportional: "∝",
    propto: "∝",
    prsim: "≾",
    prurel: "⊰",
    Pscr: "𝒫",
    pscr: "𝓅",
    Psi: "Ψ",
    psi: "ψ",
    puncsp: " ",
    Qfr: "𝔔",
    qfr: "𝔮",
    qint: "⨌",
    Qopf: "ℚ",
    qopf: "𝕢",
    qprime: "⁗",
    Qscr: "𝒬",
    qscr: "𝓆",
    quaternions: "ℍ",
    quatint: "⨖",
    quest: "?",
    questeq: "≟",
    QUOT: '"',
    quot: '"',
    rAarr: "⇛",
    race: "∽̱",
    Racute: "Ŕ",
    racute: "ŕ",
    radic: "√",
    raemptyv: "⦳",
    Rang: "⟫",
    rang: "⟩",
    rangd: "⦒",
    range: "⦥",
    rangle: "⟩",
    raquo: "»",
    Rarr: "↠",
    rArr: "⇒",
    rarr: "→",
    rarrap: "⥵",
    rarrb: "⇥",
    rarrbfs: "⤠",
    rarrc: "⤳",
    rarrfs: "⤞",
    rarrhk: "↪",
    rarrlp: "↬",
    rarrpl: "⥅",
    rarrsim: "⥴",
    Rarrtl: "⤖",
    rarrtl: "↣",
    rarrw: "↝",
    rAtail: "⤜",
    ratail: "⤚",
    ratio: "∶",
    rationals: "ℚ",
    RBarr: "⤐",
    rBarr: "⤏",
    rbarr: "⤍",
    rbbrk: "❳",
    rbrace: "}",
    rbrack: "]",
    rbrke: "⦌",
    rbrksld: "⦎",
    rbrkslu: "⦐",
    Rcaron: "Ř",
    rcaron: "ř",
    Rcedil: "Ŗ",
    rcedil: "ŗ",
    rceil: "⌉",
    rcub: "}",
    Rcy: "Р",
    rcy: "р",
    rdca: "⤷",
    rdldhar: "⥩",
    rdquo: "”",
    rdquor: "”",
    rdsh: "↳",
    Re: "ℜ",
    real: "ℜ",
    realine: "ℛ",
    realpart: "ℜ",
    reals: "ℝ",
    rect: "▭",
    REG: "®",
    reg: "®",
    ReverseElement: "∋",
    ReverseEquilibrium: "⇋",
    ReverseUpEquilibrium: "⥯",
    rfisht: "⥽",
    rfloor: "⌋",
    Rfr: "ℜ",
    rfr: "𝔯",
    rHar: "⥤",
    rhard: "⇁",
    rharu: "⇀",
    rharul: "⥬",
    Rho: "Ρ",
    rho: "ρ",
    rhov: "ϱ",
    RightAngleBracket: "⟩",
    RightArrow: "→",
    Rightarrow: "⇒",
    rightarrow: "→",
    RightArrowBar: "⇥",
    RightArrowLeftArrow: "⇄",
    rightarrowtail: "↣",
    RightCeiling: "⌉",
    RightDoubleBracket: "⟧",
    RightDownTeeVector: "⥝",
    RightDownVector: "⇂",
    RightDownVectorBar: "⥕",
    RightFloor: "⌋",
    rightharpoondown: "⇁",
    rightharpoonup: "⇀",
    rightleftarrows: "⇄",
    rightleftharpoons: "⇌",
    rightrightarrows: "⇉",
    rightsquigarrow: "↝",
    RightTee: "⊢",
    RightTeeArrow: "↦",
    RightTeeVector: "⥛",
    rightthreetimes: "⋌",
    RightTriangle: "⊳",
    RightTriangleBar: "⧐",
    RightTriangleEqual: "⊵",
    RightUpDownVector: "⥏",
    RightUpTeeVector: "⥜",
    RightUpVector: "↾",
    RightUpVectorBar: "⥔",
    RightVector: "⇀",
    RightVectorBar: "⥓",
    ring: "˚",
    risingdotseq: "≓",
    rlarr: "⇄",
    rlhar: "⇌",
    rlm: "‏",
    rmoust: "⎱",
    rmoustache: "⎱",
    rnmid: "⫮",
    roang: "⟭",
    roarr: "⇾",
    robrk: "⟧",
    ropar: "⦆",
    Ropf: "ℝ",
    ropf: "𝕣",
    roplus: "⨮",
    rotimes: "⨵",
    RoundImplies: "⥰",
    rpar: ")",
    rpargt: "⦔",
    rppolint: "⨒",
    rrarr: "⇉",
    Rrightarrow: "⇛",
    rsaquo: "›",
    Rscr: "ℛ",
    rscr: "𝓇",
    Rsh: "↱",
    rsh: "↱",
    rsqb: "]",
    rsquo: "’",
    rsquor: "’",
    rthree: "⋌",
    rtimes: "⋊",
    rtri: "▹",
    rtrie: "⊵",
    rtrif: "▸",
    rtriltri: "⧎",
    RuleDelayed: "⧴",
    ruluhar: "⥨",
    rx: "℞",
    Sacute: "Ś",
    sacute: "ś",
    sbquo: "‚",
    Sc: "⪼",
    sc: "≻",
    scap: "⪸",
    Scaron: "Š",
    scaron: "š",
    sccue: "≽",
    scE: "⪴",
    sce: "⪰",
    Scedil: "Ş",
    scedil: "ş",
    Scirc: "Ŝ",
    scirc: "ŝ",
    scnap: "⪺",
    scnE: "⪶",
    scnsim: "⋩",
    scpolint: "⨓",
    scsim: "≿",
    Scy: "С",
    scy: "с",
    sdot: "⋅",
    sdotb: "⊡",
    sdote: "⩦",
    searhk: "⤥",
    seArr: "⇘",
    searr: "↘",
    searrow: "↘",
    sect: "§",
    semi: ";",
    seswar: "⤩",
    setminus: "∖",
    setmn: "∖",
    sext: "✶",
    Sfr: "𝔖",
    sfr: "𝔰",
    sfrown: "⌢",
    sharp: "♯",
    SHCHcy: "Щ",
    shchcy: "щ",
    SHcy: "Ш",
    shcy: "ш",
    ShortDownArrow: "↓",
    ShortLeftArrow: "←",
    shortmid: "∣",
    shortparallel: "∥",
    ShortRightArrow: "→",
    ShortUpArrow: "↑",
    shy: "­",
    Sigma: "Σ",
    sigma: "σ",
    sigmaf: "ς",
    sigmav: "ς",
    sim: "∼",
    simdot: "⩪",
    sime: "≃",
    simeq: "≃",
    simg: "⪞",
    simgE: "⪠",
    siml: "⪝",
    simlE: "⪟",
    simne: "≆",
    simplus: "⨤",
    simrarr: "⥲",
    slarr: "←",
    SmallCircle: "∘",
    smallsetminus: "∖",
    smashp: "⨳",
    smeparsl: "⧤",
    smid: "∣",
    smile: "⌣",
    smt: "⪪",
    smte: "⪬",
    smtes: "⪬︀",
    SOFTcy: "Ь",
    softcy: "ь",
    sol: "/",
    solb: "⧄",
    solbar: "⌿",
    Sopf: "𝕊",
    sopf: "𝕤",
    spades: "♠",
    spadesuit: "♠",
    spar: "∥",
    sqcap: "⊓",
    sqcaps: "⊓︀",
    sqcup: "⊔",
    sqcups: "⊔︀",
    Sqrt: "√",
    sqsub: "⊏",
    sqsube: "⊑",
    sqsubset: "⊏",
    sqsubseteq: "⊑",
    sqsup: "⊐",
    sqsupe: "⊒",
    sqsupset: "⊐",
    sqsupseteq: "⊒",
    squ: "□",
    Square: "□",
    square: "□",
    SquareIntersection: "⊓",
    SquareSubset: "⊏",
    SquareSubsetEqual: "⊑",
    SquareSuperset: "⊐",
    SquareSupersetEqual: "⊒",
    SquareUnion: "⊔",
    squarf: "▪",
    squf: "▪",
    srarr: "→",
    Sscr: "𝒮",
    sscr: "𝓈",
    ssetmn: "∖",
    ssmile: "⌣",
    sstarf: "⋆",
    Star: "⋆",
    star: "☆",
    starf: "★",
    straightepsilon: "ϵ",
    straightphi: "ϕ",
    strns: "¯",
    Sub: "⋐",
    sub: "⊂",
    subdot: "⪽",
    subE: "⫅",
    sube: "⊆",
    subedot: "⫃",
    submult: "⫁",
    subnE: "⫋",
    subne: "⊊",
    subplus: "⪿",
    subrarr: "⥹",
    Subset: "⋐",
    subset: "⊂",
    subseteq: "⊆",
    subseteqq: "⫅",
    SubsetEqual: "⊆",
    subsetneq: "⊊",
    subsetneqq: "⫋",
    subsim: "⫇",
    subsub: "⫕",
    subsup: "⫓",
    succ: "≻",
    succapprox: "⪸",
    succcurlyeq: "≽",
    Succeeds: "≻",
    SucceedsEqual: "⪰",
    SucceedsSlantEqual: "≽",
    SucceedsTilde: "≿",
    succeq: "⪰",
    succnapprox: "⪺",
    succneqq: "⪶",
    succnsim: "⋩",
    succsim: "≿",
    SuchThat: "∋",
    Sum: "∑",
    sum: "∑",
    sung: "♪",
    Sup: "⋑",
    sup: "⊃",
    sup1: "¹",
    sup2: "²",
    sup3: "³",
    supdot: "⪾",
    supdsub: "⫘",
    supE: "⫆",
    supe: "⊇",
    supedot: "⫄",
    Superset: "⊃",
    SupersetEqual: "⊇",
    suphsol: "⟉",
    suphsub: "⫗",
    suplarr: "⥻",
    supmult: "⫂",
    supnE: "⫌",
    supne: "⊋",
    supplus: "⫀",
    Supset: "⋑",
    supset: "⊃",
    supseteq: "⊇",
    supseteqq: "⫆",
    supsetneq: "⊋",
    supsetneqq: "⫌",
    supsim: "⫈",
    supsub: "⫔",
    supsup: "⫖",
    swarhk: "⤦",
    swArr: "⇙",
    swarr: "↙",
    swarrow: "↙",
    swnwar: "⤪",
    szlig: "ß",
    Tab: "	",
    target: "⌖",
    Tau: "Τ",
    tau: "τ",
    tbrk: "⎴",
    Tcaron: "Ť",
    tcaron: "ť",
    Tcedil: "Ţ",
    tcedil: "ţ",
    Tcy: "Т",
    tcy: "т",
    tdot: "⃛",
    telrec: "⌕",
    Tfr: "𝔗",
    tfr: "𝔱",
    there4: "∴",
    Therefore: "∴",
    therefore: "∴",
    Theta: "Θ",
    theta: "θ",
    thetasym: "ϑ",
    thetav: "ϑ",
    thickapprox: "≈",
    thicksim: "∼",
    ThickSpace: "  ",
    thinsp: " ",
    ThinSpace: " ",
    thkap: "≈",
    thksim: "∼",
    THORN: "Þ",
    thorn: "þ",
    Tilde: "∼",
    tilde: "˜",
    TildeEqual: "≃",
    TildeFullEqual: "≅",
    TildeTilde: "≈",
    times: "×",
    timesb: "⊠",
    timesbar: "⨱",
    timesd: "⨰",
    tint: "∭",
    toea: "⤨",
    top: "⊤",
    topbot: "⌶",
    topcir: "⫱",
    Topf: "𝕋",
    topf: "𝕥",
    topfork: "⫚",
    tosa: "⤩",
    tprime: "‴",
    TRADE: "™",
    trade: "™",
    triangle: "▵",
    triangledown: "▿",
    triangleleft: "◃",
    trianglelefteq: "⊴",
    triangleq: "≜",
    triangleright: "▹",
    trianglerighteq: "⊵",
    tridot: "◬",
    trie: "≜",
    triminus: "⨺",
    TripleDot: "⃛",
    triplus: "⨹",
    trisb: "⧍",
    tritime: "⨻",
    trpezium: "⏢",
    Tscr: "𝒯",
    tscr: "𝓉",
    TScy: "Ц",
    tscy: "ц",
    TSHcy: "Ћ",
    tshcy: "ћ",
    Tstrok: "Ŧ",
    tstrok: "ŧ",
    twixt: "≬",
    twoheadleftarrow: "↞",
    twoheadrightarrow: "↠",
    Uacute: "Ú",
    uacute: "ú",
    Uarr: "↟",
    uArr: "⇑",
    uarr: "↑",
    Uarrocir: "⥉",
    Ubrcy: "Ў",
    ubrcy: "ў",
    Ubreve: "Ŭ",
    ubreve: "ŭ",
    Ucirc: "Û",
    ucirc: "û",
    Ucy: "У",
    ucy: "у",
    udarr: "⇅",
    Udblac: "Ű",
    udblac: "ű",
    udhar: "⥮",
    ufisht: "⥾",
    Ufr: "𝔘",
    ufr: "𝔲",
    Ugrave: "Ù",
    ugrave: "ù",
    uHar: "⥣",
    uharl: "↿",
    uharr: "↾",
    uhblk: "▀",
    ulcorn: "⌜",
    ulcorner: "⌜",
    ulcrop: "⌏",
    ultri: "◸",
    Umacr: "Ū",
    umacr: "ū",
    uml: "¨",
    UnderBar: "_",
    UnderBrace: "⏟",
    UnderBracket: "⎵",
    UnderParenthesis: "⏝",
    Union: "⋃",
    UnionPlus: "⊎",
    Uogon: "Ų",
    uogon: "ų",
    Uopf: "𝕌",
    uopf: "𝕦",
    UpArrow: "↑",
    Uparrow: "⇑",
    uparrow: "↑",
    UpArrowBar: "⤒",
    UpArrowDownArrow: "⇅",
    UpDownArrow: "↕",
    Updownarrow: "⇕",
    updownarrow: "↕",
    UpEquilibrium: "⥮",
    upharpoonleft: "↿",
    upharpoonright: "↾",
    uplus: "⊎",
    UpperLeftArrow: "↖",
    UpperRightArrow: "↗",
    Upsi: "ϒ",
    upsi: "υ",
    upsih: "ϒ",
    Upsilon: "Υ",
    upsilon: "υ",
    UpTee: "⊥",
    UpTeeArrow: "↥",
    upuparrows: "⇈",
    urcorn: "⌝",
    urcorner: "⌝",
    urcrop: "⌎",
    Uring: "Ů",
    uring: "ů",
    urtri: "◹",
    Uscr: "𝒰",
    uscr: "𝓊",
    utdot: "⋰",
    Utilde: "Ũ",
    utilde: "ũ",
    utri: "▵",
    utrif: "▴",
    uuarr: "⇈",
    Uuml: "Ü",
    uuml: "ü",
    uwangle: "⦧",
    vangrt: "⦜",
    varepsilon: "ϵ",
    varkappa: "ϰ",
    varnothing: "∅",
    varphi: "ϕ",
    varpi: "ϖ",
    varpropto: "∝",
    vArr: "⇕",
    varr: "↕",
    varrho: "ϱ",
    varsigma: "ς",
    varsubsetneq: "⊊︀",
    varsubsetneqq: "⫋︀",
    varsupsetneq: "⊋︀",
    varsupsetneqq: "⫌︀",
    vartheta: "ϑ",
    vartriangleleft: "⊲",
    vartriangleright: "⊳",
    Vbar: "⫫",
    vBar: "⫨",
    vBarv: "⫩",
    Vcy: "В",
    vcy: "в",
    VDash: "⊫",
    Vdash: "⊩",
    vDash: "⊨",
    vdash: "⊢",
    Vdashl: "⫦",
    Vee: "⋁",
    vee: "∨",
    veebar: "⊻",
    veeeq: "≚",
    vellip: "⋮",
    Verbar: "‖",
    verbar: "|",
    Vert: "‖",
    vert: "|",
    VerticalBar: "∣",
    VerticalLine: "|",
    VerticalSeparator: "❘",
    VerticalTilde: "≀",
    VeryThinSpace: " ",
    Vfr: "𝔙",
    vfr: "𝔳",
    vltri: "⊲",
    vnsub: "⊂⃒",
    vnsup: "⊃⃒",
    Vopf: "𝕍",
    vopf: "𝕧",
    vprop: "∝",
    vrtri: "⊳",
    Vscr: "𝒱",
    vscr: "𝓋",
    vsubnE: "⫋︀",
    vsubne: "⊊︀",
    vsupnE: "⫌︀",
    vsupne: "⊋︀",
    Vvdash: "⊪",
    vzigzag: "⦚",
    Wcirc: "Ŵ",
    wcirc: "ŵ",
    wedbar: "⩟",
    Wedge: "⋀",
    wedge: "∧",
    wedgeq: "≙",
    weierp: "℘",
    Wfr: "𝔚",
    wfr: "𝔴",
    Wopf: "𝕎",
    wopf: "𝕨",
    wp: "℘",
    wr: "≀",
    wreath: "≀",
    Wscr: "𝒲",
    wscr: "𝓌",
    xcap: "⋂",
    xcirc: "◯",
    xcup: "⋃",
    xdtri: "▽",
    Xfr: "𝔛",
    xfr: "𝔵",
    xhArr: "⟺",
    xharr: "⟷",
    Xi: "Ξ",
    xi: "ξ",
    xlArr: "⟸",
    xlarr: "⟵",
    xmap: "⟼",
    xnis: "⋻",
    xodot: "⨀",
    Xopf: "𝕏",
    xopf: "𝕩",
    xoplus: "⨁",
    xotime: "⨂",
    xrArr: "⟹",
    xrarr: "⟶",
    Xscr: "𝒳",
    xscr: "𝓍",
    xsqcup: "⨆",
    xuplus: "⨄",
    xutri: "△",
    xvee: "⋁",
    xwedge: "⋀",
    Yacute: "Ý",
    yacute: "ý",
    YAcy: "Я",
    yacy: "я",
    Ycirc: "Ŷ",
    ycirc: "ŷ",
    Ycy: "Ы",
    ycy: "ы",
    yen: "¥",
    Yfr: "𝔜",
    yfr: "𝔶",
    YIcy: "Ї",
    yicy: "ї",
    Yopf: "𝕐",
    yopf: "𝕪",
    Yscr: "𝒴",
    yscr: "𝓎",
    YUcy: "Ю",
    yucy: "ю",
    Yuml: "Ÿ",
    yuml: "ÿ",
    Zacute: "Ź",
    zacute: "ź",
    Zcaron: "Ž",
    zcaron: "ž",
    Zcy: "З",
    zcy: "з",
    Zdot: "Ż",
    zdot: "ż",
    zeetrf: "ℨ",
    ZeroWidthSpace: "​",
    Zeta: "Ζ",
    zeta: "ζ",
    Zfr: "ℨ",
    zfr: "𝔷",
    ZHcy: "Ж",
    zhcy: "ж",
    zigrarr: "⇝",
    Zopf: "ℤ",
    zopf: "𝕫",
    Zscr: "𝒵",
    zscr: "𝓏",
    zwj: "‍",
    zwnj: "‌"
  }), t.entityMap = t.HTML_ENTITIES;
})(Fn);
var qr = {}, Rt = Se.NAMESPACE, Rr = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, _a = new RegExp("[\\-\\.0-9" + Rr.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"), Ta = new RegExp("^" + Rr.source + _a.source + "*(?::" + Rr.source + _a.source + "*)?$"), _t = 0, Le = 1, He = 2, Tt = 3, Ke = 4, Ye = 5, ft = 6, xt = 7;
function ut(t, e) {
  this.message = t, this.locator = e, Error.captureStackTrace && Error.captureStackTrace(this, ut);
}
ut.prototype = new Error();
ut.prototype.name = ut.name;
function wn() {
}
wn.prototype = {
  parse: function(t, e, r) {
    var a = this.domBuilder;
    a.startDocument(), xn(e, e = {}), Wi(
      t,
      e,
      r,
      a,
      this.errorHandler
    ), a.endDocument();
  }
};
function Wi(t, e, r, a, n) {
  function o(x) {
    if (x > 65535) {
      x -= 65536;
      var re = 55296 + (x >> 10), lo = 56320 + (x & 1023);
      return String.fromCharCode(re, lo);
    } else
      return String.fromCharCode(x);
  }
  function s(x) {
    var re = x.slice(1, -1);
    return Object.hasOwnProperty.call(r, re) ? r[re] : re.charAt(0) === "#" ? o(parseInt(re.substr(1).replace("x", "0x"))) : (n.error("entity not found:" + x), x);
  }
  function i(x) {
    if (x > N) {
      var re = t.substring(N, x).replace(/&#?\w+;/g, s);
      E && c(N), a.characters(re, 0, x - N), N = x;
    }
  }
  function c(x, re) {
    for (; x >= d && (re = m.exec(t)); )
      l = re.index, d = l + re[0].length, E.lineNumber++;
    E.columnNumber = x - l + 1;
  }
  for (var l = 0, d = 0, m = /.*(?:\r\n?|\n)|.*$/g, E = a.locator, _ = [{ currentNSMap: e }], A = {}, N = 0; ; ) {
    try {
      var C = t.indexOf("<", N);
      if (C < 0) {
        if (!t.substr(N).match(/^\s*$/)) {
          var O = a.doc, J = O.createTextNode(t.substr(N));
          O.appendChild(J), a.currentElement = J;
        }
        return;
      }
      switch (C > N && i(C), t.charAt(C + 1)) {
        case "/":
          var h = t.indexOf(">", C + 3), b = t.substring(C + 2, h).replace(/[ \t\n\r]+$/g, ""), F = _.pop();
          h < 0 ? (b = t.substring(C + 2).replace(/[\s<].*/, ""), n.error("end tag name: " + b + " is not complete:" + F.tagName), h = C + 1 + b.length) : b.match(/\s</) && (b = b.replace(/[\s<].*/, ""), n.error("end tag name: " + b + " maybe not complete"), h = C + 1 + b.length);
          var G = F.localNSMap, Ve = F.tagName == b, te = Ve || F.tagName && F.tagName.toLowerCase() == b.toLowerCase();
          if (te) {
            if (a.endElement(F.uri, F.localName, b), G)
              for (var dt in G)
                Object.prototype.hasOwnProperty.call(G, dt) && a.endPrefixMapping(dt);
            Ve || n.fatalError("end tag name: " + b + " is not match the current start tagName:" + F.tagName);
          } else
            _.push(F);
          h++;
          break;
        case "?":
          E && c(C), h = tc(t, C, a);
          break;
        case "!":
          E && c(C), h = ec(t, C, a, n);
          break;
        default:
          E && c(C);
          var V = new Mn(), lt = _[_.length - 1].currentNSMap, h = Qi(t, C, V, lt, s, n), ze = V.length;
          if (!V.closed && Zi(t, h, V.tagName, A) && (V.closed = !0, r.nbsp || n.warning("unclosed xml attribute")), E && ze) {
            for (var ar = fa(E, {}), nr = 0; nr < ze; nr++) {
              var Qr = V[nr];
              c(Qr.offset), Qr.locator = fa(E, {});
            }
            a.locator = ar, Na(V, a, lt) && _.push(V), a.locator = E;
          } else
            Na(V, a, lt) && _.push(V);
          Rt.isHTML(V.uri) && !V.closed ? h = Ji(t, h, V.tagName, s, a) : h++;
      }
    } catch (x) {
      if (x instanceof ut)
        throw x;
      n.error("element parse error: " + x), h = -1;
    }
    h > N ? N = h : i(Math.max(C, N) + 1);
  }
}
function fa(t, e) {
  return e.lineNumber = t.lineNumber, e.columnNumber = t.columnNumber, e;
}
function Qi(t, e, r, a, n, o) {
  function s(E, _, A) {
    r.attributeNames.hasOwnProperty(E) && o.fatalError("Attribute " + E + " redefined"), r.addValue(
      E,
      // @see https://www.w3.org/TR/xml/#AVNormalize
      // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
      // - recursive replacement of (DTD) entity references
      // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
      _.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, n),
      A
    );
  }
  for (var i, c, l = ++e, d = _t; ; ) {
    var m = t.charAt(l);
    switch (m) {
      case "=":
        if (d === Le)
          i = t.slice(e, l), d = Tt;
        else if (d === He)
          d = Tt;
        else
          throw new Error("attribute equal must after attrName");
        break;
      case "'":
      case '"':
        if (d === Tt || d === Le)
          if (d === Le && (o.warning('attribute value must after "="'), i = t.slice(e, l)), e = l + 1, l = t.indexOf(m, e), l > 0)
            c = t.slice(e, l), s(i, c, e - 1), d = Ye;
          else
            throw new Error("attribute value no end '" + m + "' match");
        else if (d == Ke)
          c = t.slice(e, l), s(i, c, e), o.warning('attribute "' + i + '" missed start quot(' + m + ")!!"), e = l + 1, d = Ye;
        else
          throw new Error('attribute value must after "="');
        break;
      case "/":
        switch (d) {
          case _t:
            r.setTagName(t.slice(e, l));
          case Ye:
          case ft:
          case xt:
            d = xt, r.closed = !0;
          case Ke:
          case Le:
            break;
          case He:
            r.closed = !0;
            break;
          default:
            throw new Error("attribute invalid close char('/')");
        }
        break;
      case "":
        return o.error("unexpected end of input"), d == _t && r.setTagName(t.slice(e, l)), l;
      case ">":
        switch (d) {
          case _t:
            r.setTagName(t.slice(e, l));
          case Ye:
          case ft:
          case xt:
            break;
          case Ke:
          case Le:
            c = t.slice(e, l), c.slice(-1) === "/" && (r.closed = !0, c = c.slice(0, -1));
          case He:
            d === He && (c = i), d == Ke ? (o.warning('attribute "' + c + '" missed quot(")!'), s(i, c, e)) : ((!Rt.isHTML(a[""]) || !c.match(/^(?:disabled|checked|selected)$/i)) && o.warning('attribute "' + c + '" missed value!! "' + c + '" instead!!'), s(c, c, e));
            break;
          case Tt:
            throw new Error("attribute value missed!!");
        }
        return l;
      case "":
        m = " ";
      default:
        if (m <= " ")
          switch (d) {
            case _t:
              r.setTagName(t.slice(e, l)), d = ft;
              break;
            case Le:
              i = t.slice(e, l), d = He;
              break;
            case Ke:
              var c = t.slice(e, l);
              o.warning('attribute "' + c + '" missed quot(")!!'), s(i, c, e);
            case Ye:
              d = ft;
              break;
          }
        else
          switch (d) {
            case He:
              r.tagName, (!Rt.isHTML(a[""]) || !i.match(/^(?:disabled|checked|selected)$/i)) && o.warning('attribute "' + i + '" missed value!! "' + i + '" instead2!!'), s(i, i, e), e = l, d = Le;
              break;
            case Ye:
              o.warning('attribute space is required"' + i + '"!!');
            case ft:
              d = Le, e = l;
              break;
            case Tt:
              d = Ke, e = l;
              break;
            case xt:
              throw new Error("elements closed character '/' and '>' must be connected to");
          }
    }
    l++;
  }
}
function Na(t, e, r) {
  for (var a = t.tagName, n = null, m = t.length; m--; ) {
    var o = t[m], s = o.qName, i = o.value, E = s.indexOf(":");
    if (E > 0)
      var c = o.prefix = s.slice(0, E), l = s.slice(E + 1), d = c === "xmlns" && l;
    else
      l = s, c = null, d = s === "xmlns" && "";
    o.localName = l, d !== !1 && (n == null && (n = {}, xn(r, r = {})), r[d] = n[d] = i, o.uri = Rt.XMLNS, e.startPrefixMapping(d, i));
  }
  for (var m = t.length; m--; ) {
    o = t[m];
    var c = o.prefix;
    c && (c === "xml" && (o.uri = Rt.XML), c !== "xmlns" && (o.uri = r[c || ""]));
  }
  var E = a.indexOf(":");
  E > 0 ? (c = t.prefix = a.slice(0, E), l = t.localName = a.slice(E + 1)) : (c = null, l = t.localName = a);
  var _ = t.uri = r[c || ""];
  if (e.startElement(_, l, a, t), t.closed) {
    if (e.endElement(_, l, a), n)
      for (c in n)
        Object.prototype.hasOwnProperty.call(n, c) && e.endPrefixMapping(c);
  } else
    return t.currentNSMap = r, t.localNSMap = n, !0;
}
function Ji(t, e, r, a, n) {
  if (/^(?:script|textarea)$/i.test(r)) {
    var o = t.indexOf("</" + r + ">", e), s = t.substring(e + 1, o);
    if (/[&<]/.test(s))
      return /^script$/i.test(r) ? (n.characters(s, 0, s.length), o) : (s = s.replace(/&#?\w+;/g, a), n.characters(s, 0, s.length), o);
  }
  return e + 1;
}
function Zi(t, e, r, a) {
  var n = a[r];
  return n == null && (n = t.lastIndexOf("</" + r + ">"), n < e && (n = t.lastIndexOf("</" + r)), a[r] = n), n < e;
}
function xn(t, e) {
  for (var r in t)
    Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
}
function ec(t, e, r, a) {
  var n = t.charAt(e + 2);
  switch (n) {
    case "-":
      if (t.charAt(e + 3) === "-") {
        var o = t.indexOf("-->", e + 4);
        return o > e ? (r.comment(t, e + 4, o - e - 4), o + 3) : (a.error("Unclosed comment"), -1);
      } else
        return -1;
    default:
      if (t.substr(e + 3, 6) == "CDATA[") {
        var o = t.indexOf("]]>", e + 9);
        return r.startCDATA(), r.characters(t, e + 9, o - e - 9), r.endCDATA(), o + 3;
      }
      var s = rc(t, e), i = s.length;
      if (i > 1 && /!doctype/i.test(s[0][0])) {
        var c = s[1][0], l = !1, d = !1;
        i > 3 && (/^public$/i.test(s[2][0]) ? (l = s[3][0], d = i > 4 && s[4][0]) : /^system$/i.test(s[2][0]) && (d = s[3][0]));
        var m = s[i - 1];
        return r.startDTD(c, l, d), r.endDTD(), m.index + m[0].length;
      }
  }
  return -1;
}
function tc(t, e, r) {
  var a = t.indexOf("?>", e);
  if (a) {
    var n = t.substring(e, a).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
    return n ? (n[0].length, r.processingInstruction(n[1], n[2]), a + 2) : -1;
  }
  return -1;
}
function Mn() {
  this.attributeNames = {};
}
Mn.prototype = {
  setTagName: function(t) {
    if (!Ta.test(t))
      throw new Error("invalid tagName:" + t);
    this.tagName = t;
  },
  addValue: function(t, e, r) {
    if (!Ta.test(t))
      throw new Error("invalid attribute:" + t);
    this.attributeNames[t] = this.length, this[this.length++] = { qName: t, value: e, offset: r };
  },
  length: 0,
  getLocalName: function(t) {
    return this[t].localName;
  },
  getLocator: function(t) {
    return this[t].locator;
  },
  getQName: function(t) {
    return this[t].qName;
  },
  getURI: function(t) {
    return this[t].uri;
  },
  getValue: function(t) {
    return this[t].value;
  }
  //	,getIndex:function(uri, localName)){
  //		if(localName){
  //
  //		}else{
  //			var qName = uri
  //		}
  //	},
  //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
  //	getType:function(uri,localName){}
  //	getType:function(i){},
};
function rc(t, e) {
  var r, a = [], n = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
  for (n.lastIndex = e, n.exec(t); r = n.exec(t); )
    if (a.push(r), r[1]) return a;
}
qr.XMLReader = wn;
qr.ParseError = ut;
var ac = Se, nc = Ue, ga = Fn, Pn = qr, oc = nc.DOMImplementation, Aa = ac.NAMESPACE, sc = Pn.ParseError, ic = Pn.XMLReader;
function Bn(t) {
  return t.replace(/\r[\n\u0085]/g, `
`).replace(/[\r\u0085\u2028]/g, `
`);
}
function Xn(t) {
  this.options = t || { locator: {} };
}
Xn.prototype.parseFromString = function(t, e) {
  var r = this.options, a = new ic(), n = r.domBuilder || new Ut(), o = r.errorHandler, s = r.locator, i = r.xmlns || {}, c = /\/x?html?$/.test(e), l = c ? ga.HTML_ENTITIES : ga.XML_ENTITIES;
  s && n.setDocumentLocator(s), a.errorHandler = cc(o, n, s), a.domBuilder = r.domBuilder || n, c && (i[""] = Aa.HTML), i.xml = i.xml || Aa.XML;
  var d = r.normalizeLineEndings || Bn;
  return t && typeof t == "string" ? a.parse(
    d(t),
    i,
    l
  ) : a.errorHandler.error("invalid doc source"), n.doc;
};
function cc(t, e, r) {
  if (!t) {
    if (e instanceof Ut)
      return e;
    t = e;
  }
  var a = {}, n = t instanceof Function;
  r = r || {};
  function o(s) {
    var i = t[s];
    !i && n && (i = t.length == 2 ? function(c) {
      t(s, c);
    } : t), a[s] = i && function(c) {
      i("[xmldom " + s + "]	" + c + Lr(r));
    } || function() {
    };
  }
  return o("warning"), o("error"), o("fatalError"), a;
}
function Ut() {
  this.cdata = !1;
}
function We(t, e) {
  e.lineNumber = t.lineNumber, e.columnNumber = t.columnNumber;
}
Ut.prototype = {
  startDocument: function() {
    this.doc = new oc().createDocument(null, null, null), this.locator && (this.doc.documentURI = this.locator.systemId);
  },
  startElement: function(t, e, r, a) {
    var n = this.doc, o = n.createElementNS(t, r || e), s = a.length;
    Mt(this, o), this.currentElement = o, this.locator && We(this.locator, o);
    for (var i = 0; i < s; i++) {
      var t = a.getURI(i), c = a.getValue(i), r = a.getQName(i), l = n.createAttributeNS(t, r);
      this.locator && We(a.getLocator(i), l), l.value = l.nodeValue = c, o.setAttributeNode(l);
    }
  },
  endElement: function(t, e, r) {
    var a = this.currentElement;
    a.tagName, this.currentElement = a.parentNode;
  },
  startPrefixMapping: function(t, e) {
  },
  endPrefixMapping: function(t) {
  },
  processingInstruction: function(t, e) {
    var r = this.doc.createProcessingInstruction(t, e);
    this.locator && We(this.locator, r), Mt(this, r);
  },
  ignorableWhitespace: function(t, e, r) {
  },
  characters: function(t, e, r) {
    if (t = ha.apply(this, arguments), t) {
      if (this.cdata)
        var a = this.doc.createCDATASection(t);
      else
        var a = this.doc.createTextNode(t);
      this.currentElement ? this.currentElement.appendChild(a) : /^\s*$/.test(t) && this.doc.appendChild(a), this.locator && We(this.locator, a);
    }
  },
  skippedEntity: function(t) {
  },
  endDocument: function() {
    this.doc.normalize();
  },
  setDocumentLocator: function(t) {
    (this.locator = t) && (t.lineNumber = 0);
  },
  //LexicalHandler
  comment: function(t, e, r) {
    t = ha.apply(this, arguments);
    var a = this.doc.createComment(t);
    this.locator && We(this.locator, a), Mt(this, a);
  },
  startCDATA: function() {
    this.cdata = !0;
  },
  endCDATA: function() {
    this.cdata = !1;
  },
  startDTD: function(t, e, r) {
    var a = this.doc.implementation;
    if (a && a.createDocumentType) {
      var n = a.createDocumentType(t, e, r);
      this.locator && We(this.locator, n), Mt(this, n), this.doc.doctype = n;
    }
  },
  /**
   * @see org.xml.sax.ErrorHandler
   * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
   */
  warning: function(t) {
    console.warn("[xmldom warning]	" + t, Lr(this.locator));
  },
  error: function(t) {
    console.error("[xmldom error]	" + t, Lr(this.locator));
  },
  fatalError: function(t) {
    throw new sc(t, this.locator);
  }
};
function Lr(t) {
  if (t)
    return `
@` + (t.systemId || "") + "#[line:" + t.lineNumber + ",col:" + t.columnNumber + "]";
}
function ha(t, e, r) {
  return typeof t == "string" ? t.substr(e, r) : t.length >= e + r || e ? new java.lang.String(t, e, r) + "" : t;
}
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(t) {
  Ut.prototype[t] = function() {
    return null;
  };
});
function Mt(t, e) {
  t.currentElement ? t.currentElement.appendChild(e) : t.doc.appendChild(e);
}
tr.__DOMHandler = Ut;
tr.normalizeLineEndings = Bn;
tr.DOMParser = Xn;
var $n = tr.DOMParser;
const uc = "http://www.portalfiscal.inf.br/nfe", Ia = "http://www.w3.org/2000/09/xmldsig#";
function dc(t) {
  return t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
}
function lc(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
}
function Ca(t) {
  return t.localName || t.nodeName.replace(/^.*:/, "");
}
function Gr(t) {
  if (t.nodeType === 3)
    return lc(t.nodeValue ?? "");
  if (t.nodeType !== 1)
    return "";
  const e = t, r = e.nodeName, a = [];
  Ca(e) === "infNFe" && !e.getAttribute("xmlns") && a.push(`xmlns="${uc}"`);
  const n = [];
  for (let i = 0; i < e.attributes.length; i += 1) {
    const c = e.attributes.item(i);
    c && n.push({ name: c.name, value: c.value });
  }
  n.sort((i, c) => i.name.localeCompare(c.name)).forEach((i) => {
    i.name === "xmlns" && Ca(e) === "infNFe" || a.push(`${i.name}="${dc(i.value)}"`);
  });
  const o = a.length > 0 ? `<${r} ${a.join(" ")}>` : `<${r}>`;
  let s = "";
  for (let i = 0; i < e.childNodes.length; i += 1)
    s += Gr(e.childNodes.item(i));
  return `${o}${s}</${r}>`;
}
function Ec(t, e) {
  var a;
  const r = t.match(new RegExp(`-----BEGIN ${e}-----([\\s\\S]*?)-----END ${e}-----`));
  return ((a = r == null ? void 0 : r[1]) == null ? void 0 : a.replace(/\s+/g, "")) ?? "";
}
function va(t, e) {
  const r = t.match(new RegExp(`-----BEGIN ${e}-----[\\s\\S]*?-----END ${e}-----`));
  return (r == null ? void 0 : r[0]) ?? "";
}
function mc(t) {
  var a;
  const e = (a = t.certificatePath) == null ? void 0 : a.trim();
  if (!e)
    throw new I({
      code: "CERTIFICATE_NOT_CONFIGURED",
      message: "Caminho do certificado A1 nao configurado.",
      category: "CERTIFICATE"
    });
  if (!Ee.existsSync(e))
    throw new I({
      code: "CERTIFICATE_FILE_NOT_FOUND",
      message: `Arquivo do certificado nao encontrado: ${e}`,
      category: "CERTIFICATE"
    });
  if (!t.certificatePassword)
    throw new I({
      code: "CERTIFICATE_PASSWORD_REQUIRED",
      message: "Senha do certificado A1 nao configurada.",
      category: "CERTIFICATE"
    });
  const r = st.extname(e).toLowerCase();
  if (![".pfx", ".p12"].includes(r))
    throw new I({
      code: "CERTIFICATE_FORMAT_NOT_SUPPORTED",
      message: "Assinatura NFC-e direta suporta certificado A1 .pfx/.p12.",
      category: "CERTIFICATE"
    });
  try {
    const n = Ar(
      "openssl",
      ["pkcs12", "-in", e, "-nocerts", "-nodes", "-passin", `pass:${t.certificatePassword}`],
      { encoding: "utf8" }
    ), o = Ar(
      "openssl",
      ["pkcs12", "-in", e, "-clcerts", "-nokeys", "-passin", `pass:${t.certificatePassword}`],
      { encoding: "utf8" }
    ), s = va(n, "PRIVATE KEY") || va(n, "RSA PRIVATE KEY"), i = Ec(o, "CERTIFICATE");
    if (!s)
      throw new Error("Chave privada nao encontrada no arquivo A1.");
    if (!i)
      throw new Error("Certificado publico nao encontrado no arquivo A1.");
    return { privateKeyPem: s, certificateBody: i };
  } catch (n) {
    throw new I({
      code: "CERTIFICATE_PKCS12_EXTRACT_FAILED",
      message: "Falha ao extrair chave/certificado do A1 para assinatura XML.",
      category: "CERTIFICATE",
      cause: n
    });
  }
}
function pc(t) {
  const e = [], r = new $n({
    errorHandler: {
      warning: (n) => e.push(String(n)),
      error: (n) => e.push(String(n)),
      fatalError: (n) => e.push(String(n))
    }
  }).parseFromString(t, "application/xml");
  if (e.length > 0)
    throw new I({
      code: "NFCE_XML_MALFORMED",
      message: `XML NFC-e malformado antes da assinatura: ${e.join(" | ")}`,
      category: "VALIDATION",
      details: { parserErrors: e }
    });
  const a = r.getElementsByTagName("infNFe").item(0);
  if (!a)
    throw new I({
      code: "NFCE_XML_INF_NFE_NOT_FOUND",
      message: "XML NFC-e nao contem grupo infNFe para assinatura.",
      category: "VALIDATION"
    });
  return a;
}
function _c(t) {
  const e = [], r = new $n({
    errorHandler: {
      warning: (a) => e.push(String(a)),
      error: (a) => e.push(String(a)),
      fatalError: (a) => e.push(String(a))
    }
  }).parseFromString(t, "application/xml");
  if (e.length > 0 || !r.documentElement)
    throw new I({
      code: "NFCE_XML_SIGNATURE_FRAGMENT_INVALID",
      message: `Fragmento XML de assinatura invalido: ${e.join(" | ")}`,
      category: "VALIDATION",
      details: { parserErrors: e }
    });
  return Gr(r.documentElement);
}
function Tc(t) {
  return t.replace(/>\s+</g, "><").trim();
}
class fc {
  sign(e, r) {
    const a = Tc(e), n = pc(a), o = n.getAttribute("Id");
    if (!o)
      throw new I({
        code: "NFCE_XML_ID_NOT_FOUND",
        message: "infNFe nao possui atributo Id para assinatura.",
        category: "VALIDATION"
      });
    const { privateKeyPem: s, certificateBody: i } = mc(r), c = Gr(n), l = Za("sha1").update(c, "utf8").digest("base64"), d = `<SignedInfo xmlns="${Ia}"><CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/><SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/><Reference URI="#${o}"><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/></Transforms><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><DigestValue>${l}</DigestValue></Reference></SignedInfo>`, m = _c(d), E = To("RSA-SHA1").update(m, "utf8").sign(s, "base64"), _ = `<Signature xmlns="${Ia}">${d}<SignatureValue>${E}</SignatureValue><KeyInfo><X509Data><X509Certificate>${i}</X509Certificate></X509Data></KeyInfo></Signature>`;
    return a.includes("</infNFeSupl>") ? a.replace("</infNFeSupl>", `</infNFeSupl>${_}`) : a.replace("</infNFe>", `</infNFe>${_}`);
  }
}
const Nc = new fc(), gc = {
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
}, Ac = {
  SP: "35"
};
function Vr(t) {
  return (t.uf ?? "SP").trim().toUpperCase();
}
function hc(t) {
  const e = Vr(t);
  if (e !== "SP")
    throw new I({
      code: "SEFAZ_UF_NOT_SUPPORTED",
      message: `SEFAZ direta para NFC-e ainda esta configurada somente para SP. UF recebida: ${e}.`,
      category: "CONFIGURATION"
    });
}
function zr(t, e) {
  var s;
  hc(t);
  const r = (s = t.sefazBaseUrl) == null ? void 0 : s.trim(), a = gc[t.environment][e];
  if (!r)
    return a;
  let n = r.replace(/homologacao\.nfe\.fazenda\.sp\.gov\.br/gi, "homologacao.nfce.fazenda.sp.gov.br").replace(/\/\/nfe\.fazenda\.sp\.gov\.br/gi, "//nfce.fazenda.sp.gov.br");
  if (!/nfce\.fazenda\.sp\.gov\.br/i.test(n))
    return a;
  const o = {
    statusServico: "NFeStatusServico4.asmx",
    autorizacao: "NFeAutorizacao4.asmx",
    retAutorizacao: "NFeRetAutorizacao4.asmx"
  };
  return n.endsWith(".asmx") ? (n = n.replace(/NFe(?:StatusServico|Autorizacao|RetAutorizacao)4\.asmx$/i, o[e]), n = n.replace(/nfe(?:statusservico|autorizacao|retautorizacao)4\.asmx$/i, o[e]), n) : `${n.replace(/\/+$/, "")}/${o[e]}`;
}
function Ic(t) {
  return zr(t, "statusServico");
}
function Cc(t) {
  return zr(t, "autorizacao");
}
function vc(t) {
  return zr(t, "retAutorizacao");
}
function Da(t) {
  var e, r, a;
  if (t.provider !== "sefaz-direct")
    throw new I({
      code: "SEFAZ_PROVIDER_INVALID",
      message: "O teste SEFAZ direto exige provider sefaz-direct.",
      category: "CONFIGURATION"
    });
  if (t.environment !== "homologation" && t.environment !== "production")
    throw new I({
      code: "SEFAZ_ENVIRONMENT_INVALID",
      message: "Ambiente fiscal invalido.",
      category: "CONFIGURATION"
    });
  if ((t.model ?? 65) !== 65)
    throw new I({
      code: "SEFAZ_MODEL_NOT_SUPPORTED",
      message: "O diagnostico atual suporta apenas NFC-e modelo 65.",
      category: "CONFIGURATION"
    });
  if (!((e = t.certificatePath) != null && e.trim()))
    throw new I({
      code: "CERTIFICATE_NOT_CONFIGURED",
      message: "Caminho do certificado A1 nao configurado.",
      category: "CERTIFICATE"
    });
  if (!Ee.existsSync(t.certificatePath))
    throw new I({
      code: "CERTIFICATE_FILE_NOT_FOUND",
      message: `Arquivo do certificado nao encontrado: ${t.certificatePath}`,
      category: "CERTIFICATE"
    });
  if (!t.certificatePassword)
    throw new I({
      code: "CERTIFICATE_PASSWORD_REQUIRED",
      message: "Senha do certificado A1 nao configurada.",
      category: "CERTIFICATE"
    });
  if (!((r = t.cscId) != null && r.trim()))
    throw new I({
      code: "CSC_ID_REQUIRED",
      message: "CSC ID nao configurado.",
      category: "CONFIGURATION"
    });
  if (!((a = t.cscToken) != null && a.trim()))
    throw new I({
      code: "CSC_TOKEN_REQUIRED",
      message: "CSC Token nao configurado.",
      category: "CONFIGURATION"
    });
}
function Dc(t) {
  const e = Vr(t), r = Ac[e];
  if (!r)
    throw new I({
      code: "SEFAZ_UF_CODE_NOT_MAPPED",
      message: `Codigo IBGE da UF ${e} nao esta mapeado para consulta de status.`,
      category: "CONFIGURATION"
    });
  return `<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4"><consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>${t.environment === "production" ? "1" : "2"}</tpAmb><cUF>${r}</cUF><xServ>STATUS</xServ></consStatServ></nfeDadosMsg></soap12:Body></soap12:Envelope>`;
}
const Sc = {
  status: "http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF",
  autorizacao: "http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote",
  retAutorizacao: "http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4/nfeRetAutorizacaoLote"
};
function kn(t) {
  if (!(t instanceof I)) return !1;
  const e = t.details;
  return t.code === "SEFAZ_NETWORK_OR_TLS_ERROR" && ((e == null ? void 0 : e.originalCode) === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" || (e == null ? void 0 : e.originalCode) === "SELF_SIGNED_CERT_IN_CHAIN" || /unable to get local issuer certificate|self-signed certificate/i.test((e == null ? void 0 : e.originalMessage) ?? t.message));
}
function Yt(t, e, r, a = {}) {
  return new Promise((n, o) => {
    const s = Date.now(), i = Sc[a.action ?? "status"], c = a.serviceName ?? "SEFAZ", l = fo.request(
      t,
      {
        method: "POST",
        pfx: Ee.readFileSync(r.certificatePath),
        passphrase: r.certificatePassword ?? void 0,
        ca: r.caBundlePath ? Ee.readFileSync(r.caBundlePath) : void 0,
        rejectUnauthorized: a.allowUnauthorizedServerCertificate !== !0,
        headers: {
          "content-type": `application/soap+xml; charset=utf-8; action="${i}"`,
          "content-length": Buffer.byteLength(e, "utf8"),
          soapaction: i
        },
        timeout: 3e4
      },
      (d) => {
        let m = "";
        d.setEncoding("utf8"), d.on("data", (E) => {
          m += E;
        }), d.on("end", () => {
          if (!d.statusCode || d.statusCode < 200 || d.statusCode >= 300) {
            const E = m.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            o(new I({
              code: "SEFAZ_HTTP_ERROR",
              message: `SEFAZ retornou HTTP ${d.statusCode ?? "sem status"} em ${Date.now() - s}ms.${E ? ` Corpo: ${E.slice(0, 500)}` : ""}`,
              category: "SEFAZ",
              retryable: !0,
              details: {
                url: t,
                statusCode: d.statusCode,
                headers: d.headers,
                body: m
              }
            }));
            return;
          }
          n(m);
        });
      }
    );
    l.on("timeout", () => {
      l.destroy(new Error(`Timeout de 30000ms ao chamar ${c}.`));
    }), l.on("error", (d) => {
      o(new I({
        code: "SEFAZ_NETWORK_OR_TLS_ERROR",
        message: `Falha de rede/TLS ao chamar SEFAZ: ${d.message}`,
        category: "NETWORK",
        retryable: !0,
        cause: d,
        details: {
          url: t,
          originalCode: d.code ?? null,
          originalMessage: d.message
        }
      }));
    }), l.write(e, "utf8"), l.end();
  });
}
async function Rc(t, e, r) {
  try {
    return {
      rawResponse: await Yt(t, e, r, {
        action: "status",
        serviceName: "NFeStatusServico4"
      }),
      tlsValidation: "verified",
      warning: null
    };
  } catch (a) {
    if (r.environment === "homologation" && kn(a))
      return {
        rawResponse: await Yt(t, e, r, {
          action: "status",
          serviceName: "NFeStatusServico4",
          allowUnauthorizedServerCertificate: !0
        }),
        tlsValidation: "bypassed-homologation",
        warning: "A cadeia TLS do servidor da SEFAZ nao foi validada pelo Node/Electron. O diagnostico repetiu a chamada em homologacao sem validar o certificado do servidor. Para producao, configure a cadeia de CA confiavel no ambiente."
      };
    throw a;
  }
}
async function Sa(t, e, r, a) {
  const n = a === "autorizacao" ? "NFeAutorizacao4" : a === "retAutorizacao" ? "NFeRetAutorizacao4" : "NFeStatusServico4";
  try {
    return {
      rawResponse: await Yt(t, e, r, { action: a, serviceName: n }),
      tlsValidation: "verified",
      warning: null
    };
  } catch (o) {
    if (r.environment === "homologation" && kn(o))
      return {
        rawResponse: await Yt(t, e, r, {
          action: a,
          serviceName: n,
          allowUnauthorizedServerCertificate: !0
        }),
        tlsValidation: "bypassed-homologation",
        warning: "A cadeia TLS do servidor da SEFAZ nao foi validada pelo Node/Electron. A chamada foi repetida em homologacao sem validar o certificado do servidor."
      };
    throw o;
  }
}
function de(t, e) {
  var a;
  const r = t.match(new RegExp(`<[^:>]*:?${e}[^>]*>([^<]*)</[^:>]*:?${e}>`, "i"));
  return ((a = r == null ? void 0 : r[1]) == null ? void 0 : a.trim()) ?? null;
}
function Lc(t, e) {
  const r = t.match(new RegExp(`(<[^:>]*:?${e}[^>]*>[\\s\\S]*?</[^:>]*:?${e}>)`, "i"));
  return (r == null ? void 0 : r[1]) ?? null;
}
function qn(t) {
  return t.replace(/^\s*<\?xml[^?]*\?>\s*/i, "").trim();
}
function Wt(t) {
  return t.replace(/>\s+</g, "><").trim();
}
function yc(t) {
  const e = String(Date.now()).slice(-15).padStart(15, "0"), r = Wt(qn(t));
  return Wt(`<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"><enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><idLote>${e}</idLote><indSinc>1</indSinc>` + r + "</enviNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>");
}
function Oc(t, e) {
  return e ? Wt(`<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">${qn(t)}${e}</nfeProc>`) : null;
}
function bc(t, e) {
  const r = t.environment === "production" ? "1" : "2";
  return Wt(`<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4"><consReciNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>${r}</tpAmb><nRec>${e}</nRec></consReciNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>`);
}
function Ra(t, e, r, a) {
  const n = de(r, "cStat"), o = de(r, "xMotivo") ?? "Resposta de autorizacao recebida sem xMotivo.", s = Lc(r, "protNFe"), c = (s ? de(s, "cStat") : null) ?? n, l = s ? de(s, "xMotivo") ?? o : o, d = de(r, "nRec"), m = s ? de(s, "nProt") : null, E = s ? de(s, "dhRecbto") : null, _ = s ? de(s, "chNFe") : t.accessKey;
  if (c === "100" || c === "150") {
    const A = Oc(e, s);
    return {
      status: "AUTHORIZED",
      provider: "sefaz-direct",
      accessKey: _,
      protocol: m,
      receiptNumber: d,
      statusCode: c,
      statusMessage: l,
      authorizedAt: E,
      issuedAt: t.issuedAt,
      xmlBuilt: t.xmlBuilt ?? null,
      xmlSigned: e,
      xmlSent: e,
      xmlAuthorized: A,
      qrCodeUrl: t.qrCodeUrl ?? null,
      rawResponse: { rawResponse: r, warning: a ?? null }
    };
  }
  return n === "103" || n === "105" ? {
    status: "PENDING",
    provider: "sefaz-direct",
    accessKey: t.accessKey,
    receiptNumber: d,
    statusCode: n,
    statusMessage: o,
    issuedAt: t.issuedAt,
    xmlBuilt: t.xmlBuilt ?? null,
    xmlSigned: e,
    xmlSent: e,
    qrCodeUrl: t.qrCodeUrl ?? null,
    rawResponse: { rawResponse: r, warning: a ?? null }
  } : {
    status: "REJECTED",
    provider: "sefaz-direct",
    accessKey: t.accessKey,
    receiptNumber: d,
    protocol: m,
    statusCode: c ?? "SEFAZ_AUTHORIZATION_REJECTED",
    statusMessage: l,
    issuedAt: t.issuedAt,
    xmlBuilt: t.xmlBuilt ?? null,
    xmlSigned: e,
    xmlSent: e,
    qrCodeUrl: t.qrCodeUrl ?? null,
    rawResponse: { rawResponse: r, warning: a ?? null }
  };
}
class Uc {
  constructor() {
    ce(this, "providerId", "sefaz-direct");
  }
  async authorizeNfce(e, r) {
    if (Da(r), !e.xmlBuilt)
      throw new I({
        code: "NFCE_XML_NOT_BUILT",
        message: "XML NFC-e gerado nao foi informado ao provider SEFAZ.",
        category: "VALIDATION"
      });
    const a = Cc(r), n = Date.now();
    f.info(`[SEFAZ_DIRECT] Iniciando autorizacao NFC-e. saleId=${e.saleId} accessKey=${e.accessKey ?? "sem-chave"} ambiente=${r.environment} endpoint=${a}`), f.info(`[SEFAZ_DIRECT] Assinando XML NFC-e. saleId=${e.saleId}`);
    const o = Nc.sign(e.xmlBuilt, r);
    f.info(`[SEFAZ_DIRECT] XML NFC-e assinado. saleId=${e.saleId}`);
    const s = yc(o);
    f.info(`[SEFAZ_DIRECT] Enviando lote NFeAutorizacao4. saleId=${e.saleId} endpoint=${a}`);
    const i = await Sa(a, s, r, "autorizacao"), c = Ra(e, o, i.rawResponse, i.warning);
    if (f.info(`[SEFAZ_DIRECT] Resposta NFeAutorizacao4. saleId=${e.saleId} cStat=${c.statusCode ?? "sem-cStat"} status=${c.status} motivo=${c.statusMessage}`), c.status === "PENDING" && c.receiptNumber) {
      const l = vc(r), d = bc(r, c.receiptNumber);
      f.info(`[SEFAZ_DIRECT] Consultando NFeRetAutorizacao4. saleId=${e.saleId} nRec=${c.receiptNumber} endpoint=${l}`);
      const m = await Sa(l, d, r, "retAutorizacao"), E = Ra(e, o, m.rawResponse, m.warning ?? i.warning);
      return f.info(`[SEFAZ_DIRECT] Resposta NFeRetAutorizacao4. saleId=${e.saleId} cStat=${E.statusCode ?? "sem-cStat"} status=${E.status} motivo=${E.statusMessage}`), {
        ...E,
        rawResponse: {
          ...typeof E.rawResponse == "object" && E.rawResponse ? E.rawResponse : {},
          authorizationUrl: a,
          retAutorizacaoUrl: l,
          responseTimeMs: Date.now() - n
        }
      };
    }
    return {
      ...c,
      rawResponse: {
        ...typeof c.rawResponse == "object" && c.rawResponse ? c.rawResponse : {},
        url: a,
        responseTimeMs: Date.now() - n
      }
    };
  }
  async cancelNfce(e, r) {
    throw new I({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async consultStatus(e, r) {
    throw new I({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async testStatusServico(e) {
    Da(e);
    const r = Ic(e), a = Dc(e), n = Date.now(), o = await Rc(r, a, e), s = Date.now() - n, i = o.rawResponse, c = de(i, "cStat"), l = de(i, "xMotivo") ?? "Resposta recebida da SEFAZ sem xMotivo.";
    return {
      provider: "sefaz-direct",
      environment: e.environment,
      uf: Vr(e),
      model: 65,
      service: "NFeStatusServico4",
      url: r,
      success: c === "107",
      statusCode: c,
      statusMessage: l,
      responseTimeMs: s,
      rawRequest: a,
      rawResponse: i,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
      tlsValidation: o.tlsValidation,
      warning: o.warning
    };
  }
}
class Fc {
  constructor() {
    ce(this, "providers");
    this.providers = {
      mock: new xi(),
      "sefaz-direct": new Uc(),
      gateway: new Fi()
    };
  }
  resolve(e) {
    return this.providers[e.provider];
  }
}
class wc {
  constructor(e, r) {
    ce(this, "workerId");
    this.repository = e, this.processor = r, this.workerId = `main-${process.pid}`;
  }
  async enqueue(e) {
    return this.repository.enqueue(e);
  }
  async processNext() {
    const e = (/* @__PURE__ */ new Date()).toISOString(), r = this.repository.claimNextQueueItem(e, this.workerId);
    return r ? this.processClaimedItem(r) : (f.info("[FiscalQueue] Nenhum item pronto para processamento."), null);
  }
  async processById(e) {
    const r = (/* @__PURE__ */ new Date()).toISOString(), a = this.repository.claimQueueItemById(e, r, this.workerId);
    return a ? this.processClaimedItem(a) : (f.warn(`[FiscalQueue] Item ${e} nao encontrado ou nao esta pronto para processamento.`), this.repository.findQueueItemById(e));
  }
  async processClaimedItem(e) {
    f.info(`[FiscalQueue] Iniciando job ${e.id} (${e.operation}).`);
    try {
      const r = await this.processor(e);
      r.status === "AUTHORIZED" || r.status === "REJECTED" || r.status === "CANCELLED" || r.status === "COMPLETED" ? this.repository.markQueueItemDone(e.id, (/* @__PURE__ */ new Date()).toISOString(), r.result) : r.status === "FAILED_RETRYABLE" || r.status === "PENDING_EXTERNAL" ? this.repository.markQueueItemFailed(
        e.id,
        r.statusCode ?? r.status,
        r.statusMessage ?? "Aguardando novo processamento fiscal.",
        r.nextRetryAt ?? new Date(Date.now() + Math.max(e.attempts, 1) * 6e4).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString(),
        r.result
      ) : this.repository.markQueueItemFailed(
        e.id,
        r.statusCode ?? r.status,
        r.statusMessage ?? "Falha fiscal definitiva.",
        null,
        (/* @__PURE__ */ new Date()).toISOString(),
        r.result
      ), f.info(`[FiscalQueue] Job ${e.id} concluido com status ${r.status}.`);
    } catch (r) {
      const a = Z(r, "FISCAL_QUEUE_PROCESS_FAILED"), n = a.retryable ? new Date(Date.now() + e.attempts * 6e4).toISOString() : null;
      this.repository.markQueueItemFailed(
        e.id,
        a.code,
        a.message,
        n,
        (/* @__PURE__ */ new Date()).toISOString(),
        {
          success: !1,
          statusCode: a.code,
          statusMessage: a.message,
          category: a.category,
          details: a.details ?? null
        }
      ), f.error(`[FiscalQueue] Job ${e.id} falhou: ${a.code} - ${a.message}`);
    }
    return this.repository.findQueueItemById(e.id);
  }
  async retry(e) {
    const r = this.repository.findQueueItemById(e);
    return r ? (this.repository.markQueueItemFailed(
      e,
      r.lastErrorCode ?? "MANUAL_RETRY",
      r.lastErrorMessage ?? "Reprocessamento manual.",
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
function La(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function j(t) {
  return String(t ?? "").trim().toUpperCase();
}
function xc(t) {
  return /^\d{8}$/.test(t);
}
function Mc(t) {
  return /^\d{4}$/.test(t);
}
function Pc(t) {
  return /^[0-8]$/.test(t);
}
function Bc(t) {
  return /^\d{7}$/.test(t);
}
function Xc(t) {
  return /^(SEM GTIN|\d{8}|\d{12,14})$/.test(t);
}
function ya(t, e) {
  return Math.abs(t - e) < 0.01;
}
function $c(t) {
  return {
    DINHEIRO: "Dinheiro",
    PIX: "PIX",
    DEBITO: "Cartão de débito",
    CREDITO: "Cartão de crédito",
    VOUCHER: "Voucher",
    OUTROS: "Outros"
  }[t];
}
class kc {
  validateAuthorizeRequest(e, r) {
    const a = [], n = se.findById(e.companyId);
    if (n || a.push({
      code: "STORE_NOT_FOUND",
      message: `Store fiscal ${e.companyId} não encontrada.`,
      field: "companyId",
      severity: "error"
    }), (!e.series || e.series <= 0) && a.push({
      code: "SERIES_INVALID",
      message: "Série fiscal inválida.",
      field: "series",
      severity: "error"
    }), (!e.number || e.number <= 0) && a.push({
      code: "NUMBER_INVALID",
      message: "Número fiscal inválido.",
      field: "number",
      severity: "error"
    }), e.issuedAt || a.push({
      code: "ISSUED_AT_REQUIRED",
      message: "Data/hora de emissão não informada.",
      field: "issuedAt",
      severity: "error"
    }), this.validateEmitter(e, r, (n == null ? void 0 : n.environment) ?? null, a), this.validatePayments(e, a), this.validateItems(e, a), this.validateRuntimeConfig(e, r, a), a.some((o) => o.severity === "error")) {
      const o = a.filter((s) => s.severity === "error").map((s) => s.message).join(" | ");
      throw new I({
        code: "FISCAL_PREREQUISITES_NOT_MET",
        message: o || "A venda não está pronta para emissão fiscal.",
        category: "VALIDATION",
        retryable: !1,
        details: a
      });
    }
  }
  validateEmitter(e, r, a, n) {
    const o = e.emitter;
    La(o.cnpj).length !== 14 && n.push({ code: "EMITTER_CNPJ_INVALID", message: "CNPJ do emitente inválido.", field: "emitter.cnpj", severity: "error" }), j(o.stateRegistration) || n.push({ code: "EMITTER_IE_REQUIRED", message: "IE do emitente é obrigatória.", field: "emitter.stateRegistration", severity: "error" }), j(o.taxRegimeCode) || n.push({ code: "EMITTER_CRT_REQUIRED", message: "CRT do emitente é obrigatório.", field: "emitter.taxRegimeCode", severity: "error" }), j(o.legalName) || n.push({ code: "EMITTER_LEGAL_NAME_REQUIRED", message: "Razão social do emitente é obrigatória.", field: "emitter.legalName", severity: "error" }), j(o.tradeName) || n.push({ code: "EMITTER_TRADE_NAME_REQUIRED", message: "Nome fantasia do emitente é obrigatório.", field: "emitter.tradeName", severity: "error" }), (!j(o.address.street) || !j(o.address.number) || !j(o.address.neighborhood)) && n.push({ code: "EMITTER_ADDRESS_INCOMPLETE", message: "Endereço do emitente está incompleto.", field: "emitter.address", severity: "error" }), (!j(o.address.city) || !j(o.address.state)) && n.push({ code: "EMITTER_CITY_STATE_REQUIRED", message: "Cidade e UF do emitente são obrigatórias.", field: "emitter.address.city", severity: "error" }), La(o.address.cityIbgeCode).length !== 7 && n.push({ code: "EMITTER_CITY_IBGE_INVALID", message: "Código IBGE do município do emitente é inválido.", field: "emitter.address.cityIbgeCode", severity: "error" }), e.environment !== r.environment && n.push({
      code: "ENVIRONMENT_MISMATCH",
      message: "Ambiente do request diverge da configuração fiscal ativa.",
      field: "environment",
      severity: "error"
    }), a && e.environment !== a && n.push({
      code: "STORE_ENVIRONMENT_MISMATCH",
      message: "Ambiente fiscal da store diverge do request de emissão.",
      field: "environment",
      severity: "error"
    });
  }
  validatePayments(e, r) {
    if (e.payments.length === 0) {
      r.push({
        code: "PAYMENTS_REQUIRED",
        message: "A venda precisa ter ao menos um pagamento fiscal.",
        field: "payments",
        severity: "error"
      });
      return;
    }
    const a = e.payments.reduce((o, s) => o + Number(s.amount || 0), 0);
    ya(a, e.totals.finalAmount) || r.push({
      code: "PAYMENTS_TOTAL_MISMATCH",
      message: "A soma dos pagamentos não corresponde ao total da venda.",
      field: "payments",
      severity: "error"
    }), e.payments.forEach((o, s) => {
      o.amount <= 0 && r.push({
        code: "PAYMENT_AMOUNT_INVALID",
        message: `Pagamento ${s + 1} (${$c(o.method)}) com valor inválido.`,
        field: `payments[${s}].amount`,
        severity: "error"
      }), (o.changeAmount ?? 0) > 0 && o.method !== "DINHEIRO" && r.push({
        code: "PAYMENT_CHANGE_REQUIRES_CASH",
        message: "Troco só pode ser informado em pagamento em dinheiro.",
        field: `payments[${s}].changeAmount`,
        severity: "error"
      }), o.method === "DINHEIRO" && (o.receivedAmount ?? 0) < o.amount && r.push({
        code: "CASH_RECEIVED_AMOUNT_INVALID",
        message: `Pagamento ${s + 1} em dinheiro com valor recebido menor que o valor pago.`,
        field: `payments[${s}].receivedAmount`,
        severity: "error"
      });
    });
    const n = e.payments.reduce((o, s) => o + Number(s.changeAmount ?? 0), 0);
    ya(n, e.totals.changeAmount) || r.push({
      code: "PAYMENTS_CHANGE_MISMATCH",
      message: "O troco dos pagamentos diverge do troco total da venda.",
      field: "payments",
      severity: "error"
    });
  }
  validateItems(e, r) {
    if (e.items.length === 0) {
      r.push({
        code: "ITEMS_REQUIRED",
        message: "A venda precisa ter itens para emissão NFC-e.",
        field: "items",
        severity: "error"
      });
      return;
    }
    e.items.forEach((a, n) => {
      const o = a.id ?? null;
      xc(a.tax.ncm) || r.push({ code: "ITEM_NCM_INVALID", message: "NCM ausente ou inválido.", field: `items[${n}].tax.ncm`, severity: "error", itemIndex: n, itemId: o }), Mc(a.tax.cfop) || r.push({ code: "ITEM_CFOP_INVALID", message: "CFOP ausente ou inválido.", field: `items[${n}].tax.cfop`, severity: "error", itemIndex: n, itemId: o }), Pc(a.tax.originCode) || r.push({ code: "ITEM_ORIGIN_INVALID", message: "Origem fiscal ausente ou inválida.", field: `items[${n}].tax.originCode`, severity: "error", itemIndex: n, itemId: o }), !a.tax.csosn && !a.tax.icmsCst && r.push({ code: "ITEM_ICMS_CLASSIFICATION_REQUIRED", message: "CST/CSOSN de ICMS é obrigatório.", field: `items[${n}].tax`, severity: "error", itemIndex: n, itemId: o }), j(a.tax.pisCst) || r.push({ code: "ITEM_PIS_CST_REQUIRED", message: "CST de PIS é obrigatório.", field: `items[${n}].tax.pisCst`, severity: "error", itemIndex: n, itemId: o }), j(a.tax.cofinsCst) || r.push({ code: "ITEM_COFINS_CST_REQUIRED", message: "CST de COFINS é obrigatório.", field: `items[${n}].tax.cofinsCst`, severity: "error", itemIndex: n, itemId: o }), a.tax.cest && !Bc(a.tax.cest) && r.push({ code: "ITEM_CEST_INVALID", message: "CEST informado é inválido.", field: `items[${n}].tax.cest`, severity: "error", itemIndex: n, itemId: o }), a.gtin && !Xc(a.gtin) && r.push({ code: "ITEM_GTIN_INVALID", message: "GTIN informado é inválido.", field: `items[${n}].gtin`, severity: "error", itemIndex: n, itemId: o });
    });
  }
  validateRuntimeConfig(e, r, a) {
    r.provider !== "mock" && (j(r.cscId) || a.push({ code: "CSC_ID_REQUIRED", message: "CSC ID é obrigatório para NFC-e real.", field: "config.cscId", severity: "error" }), j(r.cscToken) || a.push({ code: "CSC_TOKEN_REQUIRED", message: "CSC Token é obrigatório para NFC-e real.", field: "config.cscToken", severity: "error" })), r.provider === "gateway" && (j(r.gatewayBaseUrl) || a.push({ code: "GATEWAY_BASE_URL_REQUIRED", message: "URL base do gateway fiscal não configurada.", field: "config.gatewayBaseUrl", severity: "error" }), j(r.gatewayApiKey) || a.push({ code: "GATEWAY_API_KEY_REQUIRED", message: "API key do gateway fiscal não configurada.", field: "config.gatewayApiKey", severity: "error" })), e.environment === "production" && r.provider === "mock" && a.push({
      code: "MOCK_PROVIDER_NOT_ALLOWED_IN_PRODUCTION",
      message: "Provider mock não pode ser usado em produção.",
      field: "config.provider",
      severity: "error"
    });
  }
}
const qc = new kc(), Gc = {
  AC: "12",
  AL: "27",
  AP: "16",
  AM: "13",
  BA: "29",
  CE: "23",
  DF: "53",
  ES: "32",
  GO: "52",
  MA: "21",
  MT: "51",
  MS: "50",
  MG: "31",
  PA: "15",
  PB: "25",
  PR: "41",
  PE: "26",
  PI: "22",
  RJ: "33",
  RN: "24",
  RS: "43",
  RO: "11",
  RR: "14",
  SC: "42",
  SP: "35",
  SE: "28",
  TO: "17"
};
function Vc(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function lr(t, e) {
  return Vc(t).padStart(e, "0").slice(-e);
}
function zc(t) {
  let e = 2, r = 0;
  for (let o = t.length - 1; o >= 0; o -= 1)
    r += Number(t[o]) * e, e = e === 9 ? 2 : e + 1;
  const n = 11 - r % 11;
  return n >= 10 ? "0" : String(n);
}
function jc(t) {
  const e = new Date(t);
  if (Number.isNaN(e.getTime()))
    throw new Error("Data de emissao invalida para gerar chave de acesso.");
  return `${String(e.getFullYear()).slice(-2)}${String(e.getMonth() + 1).padStart(2, "0")}`;
}
class Hc {
  generate(e) {
    var i;
    const r = Gc[e.uf.toUpperCase()];
    if (!r)
      throw new Error(`UF sem codigo IBGE configurado para chave NFC-e: ${e.uf}`);
    const a = lr(e.cnpj, 14);
    if (a.length !== 14 || /^0+$/.test(a))
      throw new Error("CNPJ invalido para gerar chave de acesso NFC-e.");
    const n = ((i = e.numericCode) == null ? void 0 : i.replace(/\D/g, "").padStart(8, "0").slice(-8)) ?? br.randomInt(0, 1e8).toString().padStart(8, "0"), o = [
      r,
      jc(e.issuedAt),
      a,
      "65",
      lr(e.series, 3),
      lr(e.number, 9),
      String(e.emissionType),
      n
    ].join(""), s = zc(o);
    return {
      accessKey: `${o}${s}`,
      numericCode: n,
      checkDigit: s,
      ufCode: r,
      yearMonth: o.slice(2, 6)
    };
  }
}
const Kc = new Hc(), Yc = "http://www.portalfiscal.inf.br/nfe", Wc = "GalbertoPDV-0.1.0", Qc = "NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL", Jc = "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL";
function v(t) {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function Zc(t) {
  return t.replace(/>\s+</g, "><").trim();
}
function Gn(t) {
  const e = k(t);
  return e ? String(Number(e)) : "";
}
function Vn(t) {
  const e = t === "production" ? "www.nfce.fazenda.sp.gov.br" : "www.homologacao.nfce.fazenda.sp.gov.br";
  return {
    qrCodeBaseUrl: `https://${e}/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx`,
    publicConsultUrl: `https://${e}/consulta`
  };
}
function eu(t) {
  return Za("sha1").update(t, "utf8").digest("hex").toUpperCase();
}
function zn(t, e) {
  const r = Gn(t.cscId), a = String(t.cscToken ?? "").trim(), n = t.environment === "production" ? "1" : "2", o = "2", { qrCodeBaseUrl: s } = Vn(t.environment), i = eu(`${e}|${o}|${n}|${r}${a}`), c = `${e}|${o}|${n}|${r}|${i}`;
  return `${s}?p=${c}`;
}
function k(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function oe(t) {
  return Number(t ?? 0).toFixed(2);
}
function $(t) {
  return Math.round(Number(t ?? 0) * 100);
}
function Oa(t) {
  return (t / 100).toFixed(2);
}
function Er(t, e) {
  const r = $(t.grossAmount), a = Math.max(0, Math.min(e, r));
  return {
    ...t,
    discountAmount: a / 100,
    totalAmount: Math.max(r - a, 0) / 100
  };
}
function jr(t) {
  return t.reduce((e, r) => e + $(r.discountAmount), 0);
}
function tu(t, e) {
  const r = $(e), a = jr(t), n = r - a;
  if (n <= 0 || t.length === 0)
    return t.map((l) => Er(l, $(l.discountAmount)));
  const o = t.map((l) => {
    const d = $(l.grossAmount), m = Math.max(0, Math.min($(l.discountAmount), d));
    return {
      item: l,
      grossCents: d,
      currentCents: m,
      remainingCents: Math.max(d - m, 0),
      allocatedExtraCents: 0
    };
  }), s = o.reduce((l, d) => l + d.remainingCents, 0);
  if (s <= 0)
    return o.map((l) => Er(l.item, l.currentCents));
  let i = 0;
  for (const l of o) {
    const d = Math.floor(n * l.remainingCents / s);
    l.allocatedExtraCents = Math.min(d, l.remainingCents), i += l.allocatedExtraCents;
  }
  let c = n - i;
  for (const l of o) {
    if (c <= 0) break;
    const d = l.remainingCents - l.allocatedExtraCents;
    if (d <= 0) continue;
    const m = Math.min(d, c);
    l.allocatedExtraCents += m, c -= m;
  }
  return o.map((l) => Er(
    l.item,
    l.currentCents + l.allocatedExtraCents
  ));
}
function ba(t) {
  return Number(t ?? 0).toFixed(4);
}
function ru(t) {
  const e = new Date(t);
  if (Number.isNaN(e.getTime())) return t;
  const r = (i) => String(i).padStart(2, "0"), a = -e.getTimezoneOffset(), n = a >= 0 ? "+" : "-", o = Math.abs(a), s = `${n}${r(Math.floor(o / 60))}:${r(o % 60)}`;
  return `${e.getFullYear()}-${r(e.getMonth() + 1)}-${r(e.getDate())}T${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}${s}`;
}
function au(t) {
  const e = String(t ?? "").trim();
  return e.length > 0 ? e : "SEM GTIN";
}
function nu(t) {
  return {
    DINHEIRO: "01",
    CREDITO: "03",
    DEBITO: "04",
    VOUCHER: "99",
    PIX: "17",
    OUTROS: "99"
  }[t] ?? "99";
}
function ou(t) {
  return ["03", "04", "17"].includes(t) ? "<card><tpIntegra>2</tpIntegra></card>" : "";
}
function jn(t) {
  return t.method === "DINHEIRO" && t.receivedAmount != null ? $(t.receivedAmount) : $(t.amount);
}
function Hr(t) {
  return ["1", "4"].includes(String(t ?? "").trim());
}
function su(t, e) {
  if (Hr(e.emitter.taxRegimeCode))
    return !1;
  const r = t.tax.icmsCst || "00";
  return !["40", "41", "50"].includes(r);
}
function iu(t, e) {
  return t.reduce(
    (r, a) => (su(a, e) && (r.baseAmount += Number(a.totalAmount ?? 0)), r),
    { baseAmount: 0, amount: 0 }
  );
}
function cu(t, e) {
  const r = v(t.tax.originCode || "0");
  if (Hr(e.emitter.taxRegimeCode)) {
    const n = t.tax.csosn || "102";
    return `<ICMS><ICMSSN102><orig>${r}</orig><CSOSN>${v(n)}</CSOSN></ICMSSN102></ICMS>`;
  }
  const a = t.tax.icmsCst || "00";
  return ["40", "41", "50"].includes(a) ? `<ICMS><ICMS40><orig>${r}</orig><CST>${v(a)}</CST></ICMS40></ICMS>` : `<ICMS><ICMS00><orig>${r}</orig><CST>${v(a)}</CST><modBC>3</modBC><vBC>${oe(t.totalAmount)}</vBC><pICMS>0.00</pICMS><vICMS>0.00</vICMS></ICMS00></ICMS>`;
}
function uu(t) {
  const e = t.tax.pisCst || "49";
  return ["04", "05", "06", "07", "08", "09"].includes(e) ? `<PIS><PISNT><CST>${v(e)}</CST></PISNT></PIS>` : ["01", "02"].includes(e) ? `<PIS><PISAliq><CST>${v(e)}</CST><vBC>${oe(t.totalAmount)}</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISAliq></PIS>` : `<PIS><PISOutr><CST>${v(e)}</CST><vBC>0.00</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISOutr></PIS>`;
}
function du(t) {
  const e = t.tax.cofinsCst || "49";
  return ["04", "05", "06", "07", "08", "09"].includes(e) ? `<COFINS><COFINSNT><CST>${v(e)}</CST></COFINSNT></COFINS>` : ["01", "02"].includes(e) ? `<COFINS><COFINSAliq><CST>${v(e)}</CST><vBC>${oe(t.totalAmount)}</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSAliq></COFINS>` : `<COFINS><COFINSOutr><CST>${v(e)}</CST><vBC>0.00</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSOutr></COFINS>`;
}
function lu(t, e, r) {
  const a = t.id || String(e + 1), n = au(t.gtin), o = t.discountAmount > 0 ? `<vDesc>${oe(t.discountAmount)}</vDesc>` : "", s = r.environment === "homologation" && e === 0 ? Qc : t.description;
  return `<det nItem="${e + 1}">
<prod>
<cProd>${v(a)}</cProd>
<cEAN>${v(n)}</cEAN>
<xProd>${v(s)}</xProd>
<NCM>${v(k(t.tax.ncm))}</NCM>
${t.tax.cest ? `<CEST>${v(k(t.tax.cest))}</CEST>` : ""}
<CFOP>${v(k(t.tax.cfop))}</CFOP>
<uCom>${v(t.unit)}</uCom>
<qCom>${ba(t.quantity)}</qCom>
<vUnCom>${oe(t.unitPrice)}</vUnCom>
<vProd>${oe(t.grossAmount)}</vProd>
<cEANTrib>${v(n)}</cEANTrib>
<uTrib>${v(t.unit)}</uTrib>
<qTrib>${ba(t.quantity)}</qTrib>
<vUnTrib>${oe(t.unitPrice)}</vUnTrib>
${o}
<indTot>1</indTot>
</prod>
<imposto>
${cu(t, r)}
${uu(t)}
${du(t)}
</imposto>
</det>`;
}
function Eu(t, e) {
  const r = k(t == null ? void 0 : t.cpfCnpj);
  if (!r) return "";
  const a = r.length === 14 ? "CNPJ" : "CPF", n = e === "homologation" ? Jc : t == null ? void 0 : t.name, o = n ? `<xNome>${v(n)}</xNome>` : "";
  return `<dest>
<${a}>${r}</${a}>
${o}
<indIEDest>9</indIEDest>
</dest>`;
}
function Hn(t, e) {
  const r = t.reduce((o, s) => o + jn(s), 0), a = $(e), n = r - a;
  return { paidAmountCents: r, finalAmountCents: a, changeAmountCents: n };
}
function mu(t, e) {
  const r = Hn(t, e);
  return `<pag>${t.map((n) => {
    const o = nu(n.method), s = o === "99" && n.description ? `<xPag>${v(n.description)}</xPag>` : "";
    return `<detPag><indPag>0</indPag><tPag>${o}</tPag>${s}<vPag>${Oa(jn(n))}</vPag>${ou(o)}</detPag>`;
  }).join("")}${r.changeAmountCents > 0 ? `<vTroco>${Oa(r.changeAmountCents)}</vTroco>` : ""}</pag>`;
}
function pu(t) {
  return t ? `<infRespTec>
<CNPJ>${k(t.cnpj)}</CNPJ>
<xContato>${v(t.contactName)}</xContato>
<email>${v(t.email)}</email>
<fone>${k(t.phone)}</fone>
${t.csrtId ? `<idCSRT>${v(t.csrtId)}</idCSRT>` : ""}
${t.csrtHash ? `<hashCSRT>${v(t.csrtHash)}</hashCSRT>` : ""}
</infRespTec>` : "";
}
function _u(t, e) {
  const r = zn(t, e), { publicConsultUrl: a } = Vn(t.environment);
  return `<infNFeSupl><qrCode><![CDATA[${r}]]></qrCode><urlChave>${v(a)}</urlChave></infNFeSupl>`;
}
function Tu(t) {
  const e = [], r = [], { input: a, effectiveItems: n } = t, o = (A, N, C) => e.push({ code: A, message: N, field: C, severity: "error" }), s = (A, N, C) => r.push({ code: A, message: N, field: C, severity: "warning" });
  t.accessKey.accessKey.length !== 44 && o("ACCESS_KEY_INVALID", "Chave de acesso deve ter 44 digitos.", "accessKey"), a.items.length || o("ITEMS_REQUIRED", "NFC-e deve possuir ao menos um item.", "items"), a.payments.length || o("PAYMENTS_REQUIRED", "NFC-e exige grupo de pagamento.", "payments"), k(a.fiscalContext.emitter.cnpj) || o("EMITTER_CNPJ_REQUIRED", "CNPJ do emitente e obrigatorio.", "fiscalContext.emitter.cnpj"), k(a.fiscalContext.emitter.address.cityIbgeCode) || o("CMUNFG_REQUIRED", "Codigo IBGE do municipio de fato gerador e obrigatorio.", "fiscalContext.emitter.address.cityIbgeCode"), Gn(a.fiscalContext.cscId) || o("CSC_ID_REQUIRED", "CSC ID e obrigatorio para gerar QR Code NFC-e.", "fiscalContext.cscId"), String(a.fiscalContext.cscToken ?? "").trim() || o("CSC_TOKEN_REQUIRED", "CSC Token e obrigatorio para gerar QR Code NFC-e.", "fiscalContext.cscToken"), a.items.forEach((A, N) => {
    k(A.tax.ncm).length !== 8 && o("ITEM_NCM_INVALID", "NCM deve ter 8 digitos.", `items[${N}].tax.ncm`), k(A.tax.cfop).length !== 4 && o("ITEM_CFOP_INVALID", "CFOP deve ter 4 digitos.", `items[${N}].tax.cfop`), $(A.discountAmount) > $(A.grossAmount) && o("ITEM_DISCOUNT_EXCEEDS_GROSS", "Desconto do item nao pode ser maior que o valor bruto.", `items[${N}].discountAmount`), Hr(a.fiscalContext.emitter.taxRegimeCode) && A.tax.csosn && !["102", "103", "300", "400"].includes(A.tax.csosn) && s("ITEM_CSOSN_LIMITED_SUPPORT", `CSOSN ${A.tax.csosn} sera serializado no grupo ICMSSN102; valide a regra fiscal antes de transmitir.`, `items[${N}].tax.csosn`);
  });
  const i = $(a.totals.productsAmount), c = $(a.totals.finalAmount), l = $(a.totals.discountAmount), d = jr(n), m = n.reduce((A, N) => A + $(N.totalAmount), 0);
  l !== d && o("TOTAL_DISCOUNT_DIFFERS_FROM_ITEMS", "Desconto total da NFC-e deve ser igual a soma dos descontos dos itens.", "totals.discountAmount"), i - l !== c && o("TOTAL_FINAL_AMOUNT_INVALID", "Valor final deve ser valor dos produtos menos desconto total.", "totals.finalAmount"), m !== c && o("ITEM_TOTALS_DIFFERS_FROM_FINAL_AMOUNT", "Somatorio liquido dos itens deve ser igual ao valor final da NFC-e.", "items");
  const E = Hn(a.payments, a.totals.finalAmount);
  E.paidAmountCents < E.finalAmountCents && o("PAYMENTS_TOTAL_UNDERPAID", "A soma dos pagamentos da NFC-e e menor que o valor total da nota.", "payments");
  const _ = Math.max(E.changeAmountCents, 0);
  return $(a.totals.changeAmount) !== _ && o("PAYMENTS_CHANGE_INVALID", "Troco informado diverge de soma(detPag/vPag) - vNF.", "totals.changeAmount"), { ok: e.length === 0, errors: e, warnings: r };
}
function fu(t) {
  const { input: e, accessKey: r } = t, a = e.fiscalContext, n = a.emitter, o = n.address, s = a.environment === "production" ? "1" : "2", i = 1, c = t.effectiveItems, l = iu(c, a), d = jr(c) / 100;
  return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="${Yc}">
<infNFe versao="4.00" Id="NFe${r.accessKey}">
<ide>
<cUF>${r.ufCode}</cUF>
<cNF>${r.numericCode}</cNF>
<natOp>${v(e.sale.natureOperation || "VENDA")}</natOp>
<mod>65</mod>
<serie>${e.sale.series}</serie>
<nNF>${e.sale.number}</nNF>
<dhEmi>${v(ru(e.sale.issuedAt))}</dhEmi>
<tpNF>1</tpNF>
<idDest>1</idDest>
<cMunFG>${k(o.cityIbgeCode)}</cMunFG>
<tpImp>4</tpImp>
<tpEmis>${i}</tpEmis>
<cDV>${r.checkDigit}</cDV>
<tpAmb>${s}</tpAmb>
<finNFe>1</finNFe>
<indFinal>1</indFinal>
<indPres>1</indPres>
<procEmi>0</procEmi>
<verProc>${v(Wc)}</verProc>
</ide>
<emit>
<CNPJ>${k(n.cnpj)}</CNPJ>
<xNome>${v(n.legalName)}</xNome>
${n.tradeName ? `<xFant>${v(n.tradeName)}</xFant>` : ""}
<enderEmit>
<xLgr>${v(o.street)}</xLgr>
<nro>${v(o.number)}</nro>
<xBairro>${v(o.neighborhood)}</xBairro>
<cMun>${k(o.cityIbgeCode)}</cMun>
<xMun>${v(o.city)}</xMun>
<UF>${v(o.state)}</UF>
<CEP>${k(o.zipCode)}</CEP>
<cPais>1058</cPais>
<xPais>BRASIL</xPais>
</enderEmit>
<IE>${k(n.stateRegistration)}</IE>
<CRT>${v(n.taxRegimeCode)}</CRT>
</emit>
${Eu(e.customer, a.environment)}
${c.map((m, E) => lu(m, E, a)).join("")}
<total>
<ICMSTot>
<vBC>${oe(l.baseAmount)}</vBC>
<vICMS>${oe(l.amount)}</vICMS>
<vICMSDeson>0.00</vICMSDeson>
<vFCP>0.00</vFCP>
<vBCST>0.00</vBCST>
<vST>0.00</vST>
<vFCPST>0.00</vFCPST>
<vFCPSTRet>0.00</vFCPSTRet>
<vProd>${oe(e.totals.productsAmount)}</vProd>
<vFrete>0.00</vFrete>
<vSeg>0.00</vSeg>
<vDesc>${oe(d)}</vDesc>
<vII>0.00</vII>
<vIPI>0.00</vIPI>
<vIPIDevol>0.00</vIPIDevol>
<vPIS>0.00</vPIS>
<vCOFINS>0.00</vCOFINS>
<vOutro>0.00</vOutro>
<vNF>${oe(e.totals.finalAmount)}</vNF>
</ICMSTot>
</total>
<transp><modFrete>9</modFrete></transp>
${mu(e.payments, e.totals.finalAmount)}
${e.sale.additionalInfo ? `<infAdic><infCpl>${v(e.sale.additionalInfo)}</infCpl></infAdic>` : ""}
${pu(e.technicalResponsible)}
</infNFe>
${_u(a, r.accessKey)}
</NFe>`;
}
class Nu {
  build(e) {
    const r = Kc.generate({
      uf: e.fiscalContext.uf,
      issuedAt: e.sale.issuedAt,
      cnpj: e.fiscalContext.emitter.cnpj,
      model: 65,
      series: e.sale.series,
      number: e.sale.number,
      emissionType: 1,
      environment: e.fiscalContext.environment
    }), a = tu(e.items, e.totals.discountAmount), n = { accessKey: r, input: e, effectiveItems: a }, o = Tu(n);
    if (!o.ok)
      return {
        accessKey: r.accessKey,
        numericCode: r.numericCode,
        checkDigit: r.checkDigit,
        xml: "",
        qrCodeUrl: null,
        validation: o
      };
    const s = zn(e.fiscalContext, r.accessKey);
    return {
      accessKey: r.accessKey,
      numericCode: r.numericCode,
      checkDigit: r.checkDigit,
      xml: Zc(fu(n)),
      qrCodeUrl: s,
      validation: o
    };
  }
  buildAuthorizeXml(e, r) {
    return this.build({
      fiscalContext: r,
      sale: {
        id: e.saleId,
        issuedAt: e.issuedAt,
        series: e.series,
        number: e.number,
        additionalInfo: e.additionalInfo
      },
      customer: e.customer,
      items: e.items,
      payments: e.payments,
      totals: e.totals
    });
  }
}
const Kn = new Nu();
class gu {
  constructor(e, r, a, n, o, s) {
    this.repository = e, this.queueService = r, this.certificateService = a, this.danfeService = n, this.configService = o, this.resolveProvider = s;
  }
  async getConfig() {
    return this.configService.getConfigView();
  }
  async saveConfig(e) {
    return this.configService.saveConfig(e);
  }
  async authorizeNfce(e) {
    const r = this.repository.findBySaleId(e.saleId);
    if ((r == null ? void 0 : r.status) === "AUTHORIZED")
      return {
        status: "AUTHORIZED",
        provider: this.configService.getConfig().provider,
        accessKey: r.accessKey,
        protocol: r.authorizationProtocol,
        statusCode: r.statusCode,
        statusMessage: r.statusMessage ?? "Documento já autorizado.",
        authorizedAt: r.authorizedAt,
        xmlAuthorized: r.xmlAuthorized,
        xmlSent: r.xmlSent,
        qrCodeUrl: r.qrCodeUrl
      };
    const a = r ?? this.repository.createPendingDocument(e), n = Oe.resolve(e.companyId), o = Ur.validateAuthorizeReadiness(n, e);
    if (!o.ok)
      throw new I({
        code: "FISCAL_READINESS_FAILED",
        message: o.errors.map((c) => c.message).join(" | "),
        category: "VALIDATION",
        details: o
      });
    const s = Oe.resolveProviderConfig(e.companyId);
    qc.validateAuthorizeRequest(e, s), this.repository.updateStatus(a.id, "PENDING");
    const i = Kn.buildAuthorizeXml(e, n);
    if (!i.validation.ok) {
      const c = i.validation.errors.map((l) => l.message).join(" | ");
      throw this.repository.updateStatus(a.id, "ERROR", "NFCE_XML_BUILD_FAILED", c), new I({
        code: "NFCE_XML_BUILD_FAILED",
        message: c,
        category: "VALIDATION",
        details: i.validation
      });
    }
    this.repository.updateTransmissionArtifacts(a.id, {
      issuedAt: e.issuedAt,
      accessKey: i.accessKey,
      xmlBuilt: i.xml
    }), e.accessKey = i.accessKey, e.xmlBuilt = i.xml, e.qrCodeUrl = i.qrCodeUrl ?? null;
    try {
      await this.certificateService.assertCertificateReady(s);
      const l = await this.resolveProvider(s).authorizeNfce(e, s), d = {
        ...l,
        issuedAt: l.issuedAt ?? e.issuedAt,
        accessKey: i.accessKey,
        xmlBuilt: l.xmlBuilt ?? i.xml,
        qrCodeUrl: l.qrCodeUrl ?? i.qrCodeUrl ?? null
      };
      if (d.status === "AUTHORIZED") {
        const m = this.repository.markAsAuthorized(a.id, d), E = await this.danfeService.generate(m);
        this.repository.updateDanfePath(m.id, E.danfePath);
      } else
        this.repository.markAsRejected(a.id, d);
      return d;
    } catch (c) {
      const l = Z(c, "FISCAL_AUTHORIZE_FAILED");
      if (this.repository.updateStatus(a.id, "ERROR", l.code, l.message), e.offlineFallbackMode === "queue" || l.retryable)
        return await this.queueService.enqueue({
          saleId: e.saleId,
          documentId: a.id,
          operation: "AUTHORIZE_NFCE",
          idempotencyKey: e.idempotencyKey,
          payload: e
        }), this.repository.updateStatus(a.id, "QUEUED", l.code, l.message), {
          status: "QUEUED",
          provider: s.provider,
          statusCode: l.code,
          statusMessage: l.message
        };
      throw l;
    }
  }
  async cancelNfce(e) {
    const r = this.repository.findById(e.documentId);
    if (!r)
      throw new I({
        code: "FISCAL_DOCUMENT_NOT_FOUND",
        message: `Documento fiscal ${e.documentId} não encontrado.`,
        category: "VALIDATION"
      });
    if (r.status === "CANCELLED")
      return {
        status: "CANCELLED",
        provider: this.configService.getConfig().provider,
        cancellationProtocol: r.cancellationProtocol,
        cancelledAt: r.cancelledAt,
        statusCode: r.statusCode,
        statusMessage: r.statusMessage ?? "Documento já cancelado.",
        xmlCancellation: r.xmlCancellation
      };
    const a = Oe.resolveProviderConfig(r.companyId), o = await this.resolveProvider(a).cancelNfce(e, a);
    return this.repository.markAsCancelled(r.id, e, o), o;
  }
  async consultStatusByAccessKey(e) {
    const r = this.configService.getConfig(), n = await this.resolveProvider(r).consultStatus({ accessKey: e }, r), o = this.repository.findByAccessKey(e);
    return o && this.repository.updateStatus(o.id, n.status, n.statusCode, n.statusMessage), n;
  }
  async runStatusServiceDiagnostic() {
    const e = this.configService.getConfig(), r = `fiscal:test-status:${Date.now()}`;
    f.info(`[FiscalDiagnostic] Criando job ${r} para NFeStatusServico4.`);
    const a = await this.queueService.enqueue({
      saleId: 0,
      documentId: null,
      operation: "TEST_STATUS_NFCE",
      idempotencyKey: r,
      maxAttempts: 1,
      payload: {
        saleId: 0,
        operation: "TEST_STATUS_NFCE",
        provider: e.provider,
        environment: e.environment,
        uf: e.uf ?? "SP",
        model: e.model ?? 65,
        requestedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    return await this.queueService.processById(a.id) ?? a;
  }
  async getDanfe(e) {
    const r = this.repository.findById(e);
    if (!r)
      throw new I({
        code: "DANFE_DOCUMENT_NOT_FOUND",
        message: `Documento fiscal ${e} não encontrado.`,
        category: "VALIDATION"
      });
    const a = await this.danfeService.recover(r);
    if (a)
      return a;
    const n = await this.danfeService.generate(r);
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
const Kr = new Ui();
Kr.ensureSchema();
const Yn = new vi(), Wn = new Fc(), Yr = new _i(), Au = new pi();
let Qt;
function hu(t) {
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
function Iu(t) {
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
const Qn = new wc(Kr, async (t) => {
  const e = t.payload;
  if (t.operation === "AUTHORIZE_NFCE") {
    const r = await Qt.authorizeNfce(e);
    return hu(r);
  }
  if (t.operation === "CANCEL_NFCE") {
    const r = await Qt.cancelNfce(e);
    return Iu(r);
  }
  if (t.operation === "TEST_STATUS_NFCE") {
    const r = Oe.resolveProviderConfig();
    f.info(`[FiscalDiagnostic] Iniciando NFeStatusServico4 provider=${r.provider} ambiente=${r.environment} uf=${r.uf ?? "SP"}.`), await Yr.assertCertificateReady(r), f.info("[FiscalDiagnostic] Certificado validado com sucesso.");
    const n = await Wn.resolve(r).testStatusServico(r);
    return f.info(`[FiscalDiagnostic] NFeStatusServico4 finalizado url=${n.url} cStat=${n.statusCode ?? "sem cStat"} xMotivo=${n.statusMessage}.`), {
      status: n.success ? "COMPLETED" : "FAILED_FINAL",
      statusCode: n.statusCode ?? "SEFAZ_STATUS_FAILED",
      statusMessage: n.statusMessage,
      result: n
    };
  }
  return {
    status: "FAILED_FINAL",
    statusCode: "QUEUE_OPERATION_NOT_SUPPORTED",
    statusMessage: `Operação de fila não suportada: ${t.operation}`
  };
});
Qt = new gu(
  Kr,
  Qn,
  Yr,
  Au,
  Yn,
  (t) => Wn.resolve(t)
);
const ue = Qt, Cu = Yn, Jn = Qn, vu = Yr, Ua = Oe, Du = Ur, Fa = Oi;
let wa = !1;
function Su(t = 15e3) {
  wa || (wa = !0, setInterval(() => {
    Jn.processNext();
  }, t));
}
function mr(t) {
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
class Ru {
  createPending(e) {
    const r = u.prepare(`
      INSERT INTO fiscal_documents (
        sale_id, store_id, model, series, number, access_key, environment, status,
        issued_datetime, xml, xml_signed, xml_authorized, xml_cancellation, protocol, receipt_number, qr_code_url, authorization_datetime,
        cancel_datetime, contingency_type, rejection_code, rejection_reason, danfe_path,
        provider, created_at, updated_at
      ) VALUES (?, ?, 65, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
    return this.findById(Number(r.lastInsertRowid));
  }
  upsertBySale(e) {
    const r = this.findBySaleId(e.saleId);
    return r ? (u.prepare(`
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
      e.accessKey ?? r.accessKey ?? null,
      e.environment,
      e.status,
      e.issuedDatetime ?? r.issuedDatetime ?? null,
      e.xml ?? r.xml ?? null,
      e.xmlSigned ?? r.xmlSigned ?? null,
      e.xmlAuthorized ?? r.xmlAuthorized ?? null,
      e.xmlCancellation ?? r.xmlCancellation ?? null,
      e.protocol ?? r.protocol ?? null,
      e.receiptNumber ?? r.receiptNumber ?? null,
      e.qrCodeUrl ?? r.qrCodeUrl ?? null,
      e.authorizationDatetime ?? r.authorizationDatetime ?? null,
      e.cancelDatetime ?? r.cancelDatetime ?? null,
      e.contingencyType ?? r.contingencyType ?? null,
      e.rejectionCode ?? r.rejectionCode ?? null,
      e.rejectionReason ?? r.rejectionReason ?? null,
      e.danfePath ?? r.danfePath ?? null,
      e.provider ?? r.provider ?? null,
      r.id
    ), this.findById(r.id)) : this.createPending(e);
  }
  findById(e) {
    const r = u.prepare("SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1").get(e);
    return r ? mr(r) : null;
  }
  findBySaleId(e) {
    const r = u.prepare("SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return r ? mr(r) : null;
  }
  findByAccessKey(e) {
    const r = u.prepare("SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1").get(e);
    return r ? mr(r) : null;
  }
  markCancelled(e, r, a) {
    u.prepare(`
      UPDATE fiscal_documents
      SET
        status = 'CANCELLED',
        cancel_datetime = ?,
        protocol = COALESCE(?, protocol),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(r, a ?? null, e);
  }
}
const ke = new Ru(), Ne = {
  DRAFT: "DRAFT",
  QUEUED: "QUEUED",
  SIGNING: "SIGNING",
  TRANSMITTING: "TRANSMITTING",
  AUTHORIZED: "AUTHORIZED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  CONTINGENCY: "CONTINGENCY",
  ERROR: "ERROR"
}, we = {
  XML_GENERATED: "XML_GENERATED",
  XML_SIGNED: "XML_SIGNED",
  AUTHORIZATION_REQUESTED: "AUTHORIZATION_REQUESTED",
  AUTHORIZATION_RESPONSE: "AUTHORIZATION_RESPONSE",
  AUTHORIZED: "AUTHORIZED",
  REJECTED: "REJECTED",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  STATUS_CONSULTED: "STATUS_CONSULTED",
  CANCELLATION_REQUESTED: "CANCELLATION_REQUESTED",
  CANCELLATION_RESPONSE: "CANCELLATION_RESPONSE",
  DANFE_REPRINTED: "DANFE_REPRINTED",
  CONTINGENCY_ACTIVATED: "CONTINGENCY_ACTIVATED",
  CONTINGENCY_SYNC_REQUESTED: "CONTINGENCY_SYNC_REQUESTED"
};
class Lu {
  getOrReserveForSale(e, r) {
    const a = ke.findBySaleId(e);
    return a ? {
      series: a.series,
      number: a.number
    } : se.reserveNextNfceNumber(r);
  }
}
const yu = new Lu();
function xa(t) {
  return {
    "01": "DINHEIRO",
    "03": "CREDITO",
    "04": "DEBITO",
    10: "VOUCHER",
    17: "PIX"
  }[t] ?? "OUTROS";
}
function Ma(t) {
  return t === 1 ? "production" : "homologation";
}
function Ou(t) {
  return t.length === 0 ? "OUTROS" : new Set(t.map((r) => r.method)).size === 1 ? t[0].method : "OUTROS";
}
function Qe(t, e, r = "") {
  return String(t ?? e ?? "").trim() || r;
}
function bu(t) {
  return ["1", "4"].includes(String(t.taxRegimeCode ?? "").trim());
}
function Uu(t) {
  const e = String(t ?? "").trim();
  if (["1", "2", "3", "4"].includes(e))
    return e;
  throw new Error(`CRT/regime tributario invalido na company legada: ${e || "vazio"}.`);
}
function Pa(t, e) {
  return bu(t) ? {
    csosn: e.csosn ?? "102",
    icmsCst: e.icms_cst
  } : {
    csosn: null,
    icmsCst: e.icms_cst ?? "00"
  };
}
function Fu() {
  const t = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1
  }).formatToParts(/* @__PURE__ */ new Date()), e = (r) => {
    var a;
    return ((a = t.find((n) => n.type === r)) == null ? void 0 : a.value) ?? "00";
  };
  return `${e("year")}-${e("month")}-${e("day")}T${e("hour")}:${e("minute")}:${e("second")}-03:00`;
}
class wu {
  loadActiveCompany() {
    return u.prepare(`
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
    const e = se.findActive();
    if (e)
      return e;
    const r = this.loadActiveCompany();
    if (!r)
      throw new Error("Nenhuma store ativa encontrada e não existe company ativa para criar o espelho fiscal.");
    return se.create({
      code: "MAIN",
      name: r.nome_fantasia,
      legalName: r.razao_social,
      cnpj: r.cnpj,
      stateRegistration: r.inscricao_estadual,
      taxRegimeCode: Uu(r.crt),
      environment: Ma(r.ambiente_emissao),
      cscId: r.csc_id,
      cscToken: r.csc_token,
      defaultSeries: Number(r.serie_nfce ?? 1),
      nextNfceNumber: Number(r.proximo_numero_nfce ?? 1),
      addressStreet: r.rua,
      addressNumber: r.numero,
      addressNeighborhood: r.bairro,
      addressCity: r.cidade,
      addressState: r.uf,
      addressZipCode: r.cep,
      addressCityIbgeCode: r.cod_municipio_ibge,
      active: !0
    });
  }
  loadLegacySale(e) {
    const r = u.prepare(`
      SELECT
        id, ambiente, data_emissao, valor_produtos, valor_desconto,
        valor_total, valor_troco, cliente_nome, cpf_cliente, cnpj_cliente
      FROM vendas
      WHERE id = ?
      LIMIT 1
    `).get(e);
    if (!r)
      throw new Error(`Venda ${e} não encontrada para emissão fiscal.`);
    return r;
  }
  loadLegacyItems(e) {
    return u.prepare(`
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
        COALESCE(NULLIF(vi.ncm, ''), NULLIF(snapshot.ncm, ''), NULLIF(product.ncm, '')) AS ncm,
        COALESCE(NULLIF(vi.cfop, ''), NULLIF(snapshot.cfop, ''), NULLIF(product.cfop, ''), '5102') AS cfop,
        COALESCE(vi.cest, snapshot.cest, product.cest) AS cest,
        COALESCE(NULLIF(snapshot.origin_code, ''), NULLIF(product.origin, ''), '0') AS origin_code,
        NULLIF(snapshot.csosn, '') AS csosn,
        snapshot.icms_cst,
        COALESCE(NULLIF(snapshot.pis_cst, ''), '49') AS pis_cst,
        COALESCE(NULLIF(snapshot.cofins_cst, ''), '49') AS cofins_cst
      FROM venda_itens vi
      LEFT JOIN sale_item_tax_snapshot snapshot
        ON snapshot.sale_item_id = vi.id
      LEFT JOIN products product
        ON product.id = vi.produto_id
      WHERE vi.venda_id = ?
      ORDER BY vi.id ASC
    `).all(e);
  }
  loadLegacyPayments(e) {
    return u.prepare(`
      SELECT id, tpag, valor, valor_recebido, troco, descricao_outro
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id ASC
    `).all(e);
  }
  buildAuthorizeRequest(e, r, a, n) {
    const o = this.loadLegacySale(e), s = se.findById(r);
    if (!s)
      throw new Error(`Store fiscal ${r} não encontrada para emissão.`);
    const i = this.loadLegacyItems(e), c = this.loadLegacyPayments(e).map((d) => ({
      method: xa(d.tpag),
      amount: Number(d.valor ?? 0),
      receivedAmount: d.valor_recebido != null ? Number(d.valor_recebido) : void 0,
      changeAmount: d.troco != null ? Number(d.troco) : void 0,
      description: d.descricao_outro ?? null
    })), l = Fu();
    return {
      saleId: o.id,
      companyId: s.id,
      number: n,
      series: a,
      environment: Ma(o.ambiente),
      paymentMethod: Ou(c),
      payments: c,
      issuedAt: l,
      emitter: {
        cnpj: s.cnpj,
        stateRegistration: s.stateRegistration,
        legalName: s.legalName,
        tradeName: s.name,
        taxRegimeCode: s.taxRegimeCode,
        address: {
          street: s.addressStreet,
          number: s.addressNumber,
          neighborhood: s.addressNeighborhood,
          city: s.addressCity,
          state: s.addressState,
          zipCode: s.addressZipCode,
          cityIbgeCode: s.addressCityIbgeCode
        }
      },
      customer: {
        name: o.cliente_nome ?? void 0,
        cpfCnpj: o.cpf_cliente ?? o.cnpj_cliente ?? null
      },
      items: i.map((d) => {
        const m = Pa(s, d);
        return {
          id: d.produto_id ?? d.codigo_produto,
          description: d.nome_produto,
          unit: d.unidade_comercial,
          quantity: Number(d.quantidade_comercial ?? 0),
          unitPrice: Number(d.valor_unitario_comercial ?? 0),
          grossAmount: Number(d.valor_bruto ?? 0),
          discountAmount: Number(d.valor_desconto ?? 0),
          totalAmount: Number(d.subtotal ?? 0),
          gtin: d.gtin,
          tax: {
            ncm: d.ncm ?? "",
            cfop: Qe(d.cfop, null, "5102"),
            cest: d.cest,
            originCode: Qe(d.origin_code, null, "0"),
            csosn: m.csosn,
            icmsCst: m.icmsCst,
            pisCst: d.pis_cst ?? "49",
            cofinsCst: d.cofins_cst ?? "49"
          }
        };
      }),
      totals: {
        productsAmount: Number(o.valor_produtos ?? 0),
        discountAmount: Number(o.valor_desconto ?? 0),
        finalAmount: Number(o.valor_total ?? 0),
        receivedAmount: c.reduce((d, m) => d + Number(m.receivedAmount ?? m.amount ?? 0), 0),
        changeAmount: c.reduce((d, m) => d + Number(m.changeAmount ?? 0), 0) || Number(o.valor_troco ?? 0)
      },
      additionalInfo: `Venda PDV ${o.id}`,
      offlineFallbackMode: "queue",
      idempotencyKey: `nfce-sale-${o.id}`
    };
  }
  mirrorLegacySale(e) {
    const r = this.resolveActiveStore(), a = this.loadLegacySale(e), n = this.loadLegacyItems(e), o = this.loadLegacyPayments(e), s = `legacy-sale:${e}`, c = Xt.findByExternalReference(s) ?? Xt.create({
      storeId: r.id,
      customerName: a.cliente_nome ?? null,
      customerDocument: a.cpf_cliente ?? a.cnpj_cliente ?? null,
      status: "PAID",
      subtotalAmount: Number(a.valor_produtos ?? 0),
      discountAmount: Number(a.valor_desconto ?? 0),
      totalAmount: Number(a.valor_total ?? 0),
      changeAmount: Number(a.valor_troco ?? 0),
      externalReference: s,
      items: n.map((E) => {
        const _ = Pa(r, E);
        return {
          productId: E.produto_id ?? E.codigo_produto,
          description: E.nome_produto,
          unit: E.unidade_comercial,
          quantity: Number(E.quantidade_comercial ?? 0),
          unitPrice: Number(E.valor_unitario_comercial ?? 0),
          grossAmount: Number(E.valor_bruto ?? 0),
          discountAmount: Number(E.valor_desconto ?? 0),
          totalAmount: Number(E.subtotal ?? 0),
          ncm: E.ncm ?? null,
          cfop: Qe(E.cfop, null, "5102"),
          cest: E.cest,
          originCode: Qe(E.origin_code, null, "0"),
          taxSnapshot: {
            ncm: E.ncm,
            cfop: Qe(E.cfop, null, "5102"),
            cest: E.cest,
            originCode: Qe(E.origin_code, null, "0"),
            csosn: _.csosn,
            icmsCst: _.icmsCst,
            pisCst: E.pis_cst ?? "49",
            cofinsCst: E.cofins_cst ?? "49"
          }
        };
      }),
      payments: o.map((E) => ({
        method: xa(E.tpag),
        amount: Number(E.valor ?? 0),
        receivedAmount: E.valor_recebido != null ? Number(E.valor_recebido) : Number(E.valor ?? 0),
        changeAmount: Number(E.troco ?? 0),
        integrationReference: E.descricao_outro ?? null
      }))
    }), l = yu.getOrReserveForSale(c.sale.id, r.id), d = this.buildAuthorizeRequest(e, r.id, l.series, l.number), m = ke.upsertBySale({
      saleId: c.sale.id,
      storeId: r.id,
      series: l.series,
      number: l.number,
      environment: d.environment,
      status: Ne.DRAFT,
      issuedDatetime: d.issuedAt,
      contingencyType: d.offlineFallbackMode === "queue" ? "queue" : null,
      provider: null
    });
    return {
      request: d,
      store: r,
      mirroredSale: c,
      mirroredFiscalDocument: m
    };
  }
  findMirroredSaleByLegacyId(e) {
    return Xt.findByExternalReference(`legacy-sale:${e}`);
  }
}
const pr = new wu();
function Ba(t) {
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
class xu {
  create(e) {
    const r = u.prepare(`
      INSERT INTO fiscal_events (
        fiscal_document_id, event_type, payload_json, response_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      e.fiscalDocumentId,
      e.eventType,
      e.payload ? vr(e.payload) : null,
      e.response ? vr(e.response) : null,
      e.status
    );
    return this.findById(Number(r.lastInsertRowid));
  }
  findById(e) {
    const r = u.prepare("SELECT * FROM fiscal_events WHERE id = ? LIMIT 1").get(e);
    return r ? Ba(r) : null;
  }
  listByFiscalDocument(e) {
    return u.prepare(`
      SELECT * FROM fiscal_events
      WHERE fiscal_document_id = ?
      ORDER BY created_at DESC, id DESC
    `).all(e).map(Ba);
  }
}
const xe = new xu();
class Mu {
  generateXml(e) {
    const r = pr.mirrorLegacySale(e), a = {
      ...r.request,
      saleId: r.mirroredSale.sale.id,
      companyId: r.store.id,
      idempotencyKey: `nfce-sale-${r.mirroredSale.sale.id}`
    }, n = Oe.resolve(r.store.id), o = Ur.validateAuthorizeReadiness(n, a);
    if (!o.ok) {
      const c = o.errors.map((l) => l.message).join(" | ");
      return ke.upsertBySale({
        saleId: r.mirroredSale.sale.id,
        storeId: r.store.id,
        series: a.series,
        number: a.number,
        environment: a.environment,
        status: Ne.ERROR,
        issuedDatetime: a.issuedAt,
        rejectionCode: "FISCAL_READINESS_FAILED",
        rejectionReason: c
      }), {
        success: !1,
        saleId: e,
        fiscal: {
          status: "ERROR",
          statusCode: "FISCAL_READINESS_FAILED",
          statusMessage: c,
          documentId: r.mirroredFiscalDocument.id
        },
        validation: o
      };
    }
    const s = Kn.buildAuthorizeXml(a, n), i = ke.upsertBySale({
      saleId: r.mirroredSale.sale.id,
      storeId: r.store.id,
      series: a.series,
      number: a.number,
      environment: a.environment,
      status: s.validation.ok ? Ne.DRAFT : Ne.ERROR,
      issuedDatetime: a.issuedAt,
      accessKey: s.accessKey,
      xml: s.xml || null,
      rejectionCode: s.validation.ok ? null : "NFCE_XML_BUILD_FAILED",
      rejectionReason: s.validation.ok ? null : s.validation.errors.map((c) => c.message).join(" | ")
    });
    return xe.create({
      fiscalDocumentId: i.id,
      eventType: we.XML_GENERATED,
      payload: {
        legacySaleId: e,
        action: "GENERATE_XML_ONLY",
        accessKey: s.accessKey,
        warnings: s.validation.warnings
      },
      status: i.status
    }), {
      success: s.validation.ok,
      saleId: e,
      fiscal: {
        status: i.status,
        accessKey: i.accessKey,
        statusCode: s.validation.ok ? "XML_BUILT" : "NFCE_XML_BUILD_FAILED",
        statusMessage: s.validation.ok ? "XML NFC-e gerado e persistido." : "Falha ao montar XML NFC-e.",
        documentId: i.id
      },
      validation: s.validation
    };
  }
  async execute(e) {
    try {
      const r = pr.mirrorLegacySale(e), a = {
        ...r.request,
        saleId: r.mirroredSale.sale.id,
        companyId: r.store.id,
        idempotencyKey: `nfce-sale-${r.mirroredSale.sale.id}`
      };
      xe.create({
        fiscalDocumentId: r.mirroredFiscalDocument.id,
        eventType: we.AUTHORIZATION_REQUESTED,
        payload: { legacySaleId: e, request: a },
        status: Ne.TRANSMITTING
      });
      const n = await ue.authorizeNfce(a), o = ke.findBySaleId(r.mirroredSale.sale.id);
      return o && (n.xmlSigned && xe.create({
        fiscalDocumentId: o.id,
        eventType: we.XML_SIGNED,
        payload: {
          legacySaleId: e,
          accessKey: n.accessKey,
          provider: n.provider
        },
        status: Ne.SIGNING
      }), xe.create({
        fiscalDocumentId: o.id,
        eventType: we.AUTHORIZATION_RESPONSE,
        payload: { legacySaleId: e, request: a },
        response: n,
        status: n.status
      }), n.status === "AUTHORIZED" && xe.create({
        fiscalDocumentId: o.id,
        eventType: we.AUTHORIZED,
        payload: { legacySaleId: e, accessKey: n.accessKey },
        response: n,
        status: Ne.AUTHORIZED
      }), n.status === "REJECTED" && xe.create({
        fiscalDocumentId: o.id,
        eventType: we.REJECTED,
        payload: { legacySaleId: e, accessKey: n.accessKey },
        response: n,
        status: Ne.REJECTED
      })), {
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
          documentId: (o == null ? void 0 : o.id) ?? null,
          provider: n.provider
        }
      };
    } catch (r) {
      const a = Z(r, "ISSUE_FISCAL_SALE_FAILED"), n = pr.findMirroredSaleByLegacyId(e), o = n ? ke.findBySaleId(n.sale.id) : ke.findBySaleId(e);
      return o && xe.create({
        fiscalDocumentId: o.id,
        eventType: we.PROVIDER_ERROR,
        payload: { legacySaleId: e },
        response: {
          status: "ERROR",
          statusCode: a.code,
          statusMessage: a.message
        },
        status: Ne.ERROR
      }), {
        success: !1,
        saleId: e,
        fiscal: {
          status: "ERROR",
          statusCode: a.code,
          statusMessage: a.message,
          documentId: (o == null ? void 0 : o.id) ?? null
        }
      };
    }
  }
}
const Zn = new Mu();
let eo = null;
function Xa(t) {
  eo = t;
}
function Wr() {
  return eo;
}
const Pu = {
  admin: ["admin", "administrador", "administrator", "dono", "owner"],
  manager: ["gerente", "gestor", "manager", "supervisor"],
  cashier: ["caixa", "operador", "operador de caixa", "atendente", "vendedor"],
  stock: ["estoque", "almoxarife"],
  unknown: []
}, Bu = {
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
function Xu(t) {
  const e = String(t ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [r, a] of Object.entries(Pu))
    if (a.includes(e)) return r;
  return "unknown";
}
function $u(t) {
  return Bu[Xu(t)];
}
function to(t, e) {
  return $u(t).includes(e);
}
function ku(t) {
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
function ro() {
  const t = Wr();
  return t ? u.prepare(`
    SELECT u.id, u.nome, u.funcao, u.ativo
    FROM sessions s
    INNER JOIN usuarios u ON u.id = s.user_id
    WHERE s.id = ?
      AND s.active = 1
    LIMIT 1
  `).get(t) ?? null : null;
}
function g(t) {
  const e = ro();
  if (!e || !e.ativo)
    throw new Error("Sessão inválida ou usuário inativo.");
  if (!to(e.funcao, t))
    throw new Error(ku(t));
  return e;
}
function at(t) {
  const e = ro();
  return !!(e && e.ativo && to(e.funcao, t));
}
function qu() {
  p.handle("fiscal:get-runtime-config", async () => (g("fiscal:manage"), ue.getConfig())), p.handle("fiscal:get-context", async (t, e) => (g("fiscal:manage"), Ua.resolve(e))), p.handle("fiscal:get-active-store", async () => (g("fiscal:manage"), Fa.getActiveStore())), p.handle("fiscal:save-active-store", async (t, e) => {
    try {
      return g("fiscal:manage"), {
        success: !0,
        data: Fa.saveActiveStore(e)
      };
    } catch (r) {
      const a = Z(r, "FISCAL_STORE_SAVE_FAILED");
      return {
        success: !1,
        error: {
          code: a.code,
          message: a.message,
          category: a.category,
          retryable: a.retryable
        }
      };
    }
  }), p.handle("fiscal:validate-readiness", async (t, e) => {
    g("fiscal:manage");
    const r = Ua.resolve(e);
    return Du.validateContext(r);
  }), p.handle("fiscal:save-runtime-config", async (t, e) => {
    try {
      return g("fiscal:manage"), await ue.saveConfig(e);
    } catch (r) {
      const a = Z(r, "FISCAL_CONFIG_SAVE_FAILED");
      return {
        success: !1,
        error: {
          code: a.code,
          message: a.message,
          category: a.category,
          retryable: a.retryable
        }
      };
    }
  }), p.handle("fiscal:get-certificate-info", async () => (g("fiscal:manage"), vu.getCertificateInfo(Cu.getConfig()))), p.handle("fiscal:authorize-nfce", async (t, e) => {
    try {
      return g("fiscal:manage"), {
        success: !0,
        data: await ue.authorizeNfce(e)
      };
    } catch (r) {
      const a = Z(r, "FISCAL_AUTHORIZE_FAILED");
      return {
        success: !1,
        error: {
          code: a.code,
          message: a.message,
          category: a.category,
          retryable: a.retryable
        }
      };
    }
  }), p.handle("fiscal:generate-nfce-xml-for-sale", async (t, e) => {
    try {
      return g("fiscal:manage"), {
        success: !0,
        data: Zn.generateXml(e)
      };
    } catch (r) {
      const a = Z(r, "FISCAL_XML_BUILD_FAILED");
      return {
        success: !1,
        error: {
          code: a.code,
          message: a.message,
          category: a.category,
          retryable: a.retryable
        }
      };
    }
  }), p.handle("fiscal:cancel-nfce", async (t, e) => {
    try {
      return g("fiscal:manage"), {
        success: !0,
        data: await ue.cancelNfce(e)
      };
    } catch (r) {
      const a = Z(r, "FISCAL_CANCEL_FAILED");
      return {
        success: !1,
        error: {
          code: a.code,
          message: a.message,
          category: a.category,
          retryable: a.retryable
        }
      };
    }
  }), p.handle("fiscal:consult-status", async (t, e) => {
    try {
      return g("fiscal:manage"), {
        success: !0,
        data: await ue.consultStatusByAccessKey(e)
      };
    } catch (r) {
      const a = Z(r, "FISCAL_CONSULT_FAILED");
      return {
        success: !1,
        error: {
          code: a.code,
          message: a.message,
          category: a.category,
          retryable: a.retryable
        }
      };
    }
  }), p.handle("fiscal:get-danfe", async (t, e) => {
    try {
      return g("fiscal:manage"), {
        success: !0,
        data: await ue.getDanfe(e)
      };
    } catch (r) {
      const a = Z(r, "FISCAL_DANFE_FAILED");
      return {
        success: !1,
        error: {
          code: a.code,
          message: a.message,
          category: a.category,
          retryable: a.retryable
        }
      };
    }
  }), p.handle("fiscal:get-queue-summary", async () => (g("fiscal:manage"), ue.getQueueSummary())), p.handle("fiscal:list-queue", async (t, e = 20) => (g("fiscal:manage"), ue.listQueue(e))), p.handle("fiscal:reprocess-queue-item", async (t, e) => {
    try {
      return g("fiscal:manage"), {
        success: !0,
        data: await ue.reprocessQueueItem(e)
      };
    } catch (r) {
      const a = Z(r, "FISCAL_REPROCESS_FAILED");
      return {
        success: !1,
        error: {
          code: a.code,
          message: a.message,
          category: a.category,
          retryable: a.retryable
        }
      };
    }
  }), p.handle("fiscal:process-next-queue-item", async () => {
    try {
      return g("fiscal:manage"), f.info("[FiscalIPC] fiscal:process-next-queue-item recebido."), {
        success: !0,
        data: await Jn.processNext()
      };
    } catch (t) {
      const e = Z(t, "FISCAL_PROCESS_QUEUE_FAILED");
      return f.error(`[FiscalIPC] Falha em fiscal:process-next-queue-item: ${e.code} - ${e.message}`), {
        success: !1,
        error: {
          code: e.code,
          message: e.message,
          category: e.category,
          retryable: e.retryable
        }
      };
    }
  }), p.handle("fiscal:run-status-diagnostic", async () => {
    try {
      return g("fiscal:manage"), f.info("[FiscalIPC] fiscal:run-status-diagnostic recebido."), {
        success: !0,
        data: await ue.runStatusServiceDiagnostic()
      };
    } catch (t) {
      const e = Z(t, "FISCAL_STATUS_DIAGNOSTIC_FAILED");
      return f.error(`[FiscalIPC] Falha em fiscal:run-status-diagnostic: ${e.code} - ${e.message}`), {
        success: !1,
        error: {
          code: e.code,
          message: e.message,
          category: e.category,
          retryable: e.retryable
        }
      };
    }
  });
}
function $a(t) {
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
function ka(t) {
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
function Gu(t) {
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
function Vu(t) {
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
class zu {
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
  findByReference(e, r, a) {
    const n = u.prepare(`
      SELECT *
      FROM printed_documents
      WHERE document_type = ?
        AND reference_type = ?
        AND reference_id = ?
      LIMIT 1
    `).get(e, r, a);
    return n ? $a(n) : null;
  }
  findById(e) {
    const r = u.prepare(`
      SELECT *
      FROM printed_documents
      WHERE id = ?
      LIMIT 1
    `).get(e);
    return r ? $a(r) : null;
  }
  upsertDocument(e) {
    const r = this.findByReference(e.documentType, e.referenceType, e.referenceId);
    if (r)
      return u.prepare(`
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
        r.id
      ), this.findById(r.id);
    const a = u.prepare(`
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
    return this.findById(Number(a.lastInsertRowid));
  }
  markDocumentPrinted(e, r) {
    u.prepare(`
      UPDATE printed_documents
      SET
        status = 'PRINTED',
        printer_id = ?,
        print_count = print_count + 1,
        last_printed_at = datetime('now'),
        last_error = NULL,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(r, e);
  }
  markDocumentFailed(e, r, a, n) {
    u.prepare(`
      UPDATE printed_documents
      SET
        status = ?,
        printer_id = ?,
        last_error = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(r, n, a, e);
  }
  createPrintJob(e) {
    const r = u.prepare(`
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
    ), a = u.prepare(`
      SELECT *
      FROM print_jobs
      WHERE id = ?
      LIMIT 1
    `).get(r.lastInsertRowid);
    return ka(a);
  }
  listDocumentJobs(e) {
    return u.prepare(`
      SELECT *
      FROM print_jobs
      WHERE printed_document_id = ?
      ORDER BY id DESC
    `).all(e).map(ka);
  }
  getDefaultPrinter() {
    const e = u.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE is_default = 1
      LIMIT 1
    `).get();
    return e ? this.mapPrinter(e) : null;
  }
  findPrinterById(e) {
    const r = u.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE id = ?
      LIMIT 1
    `).get(e);
    return r ? this.mapPrinter(r) : null;
  }
  buildTestSaleReceiptData(e, r) {
    var n;
    const a = r.templateMode === "custom" ? ((n = r.headerTitle) == null ? void 0 : n.trim()) || e.display_name || "Galberto PDV" : e.display_name || "Galberto PDV";
    return {
      saleId: 999999,
      emittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      movedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "FINALIZADA",
      storeName: a,
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
  appendPrinterLog(e, r) {
    u.prepare(`
      INSERT INTO printer_logs (printer_id, message)
      VALUES (?, ?)
    `).run(e, r);
  }
  loadSaleReceiptData(e) {
    const r = u.prepare(`
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
    if (!r)
      throw new Error(`Venda não encontrada para impressão: ${e}`);
    const a = u.prepare(`
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
    `).all(e), n = u.prepare(`
      SELECT
        tpag,
        valor,
        valor_recebido,
        troco
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id
    `).all(e), o = u.prepare(`
      SELECT fd.status, fd.access_key, fd.protocol, fd.authorization_datetime, fd.qr_code_url
      FROM fiscal_documents fd
      INNER JOIN sales s ON s.id = fd.sale_id
      WHERE s.external_reference = ?
      ORDER BY fd.id DESC
      LIMIT 1
    `).get(`legacy-sale:${e}`);
    return {
      saleId: Number(r.id),
      emittedAt: r.data_emissao,
      movedAt: r.data_movimento ?? null,
      status: r.status,
      storeName: r.nome_fantasia ?? r.razao_social ?? "Galberto PDV",
      storeLegalName: r.razao_social ?? null,
      storeDocument: r.cnpj ?? null,
      storeAddress: Vu(r),
      operatorName: r.operator_name ?? null,
      operatorId: r.operator_id === null ? null : String(r.operator_id),
      pdvId: r.pdv_id ?? null,
      customerName: r.cliente_nome ?? null,
      customerDocument: r.cpf_cliente ?? null,
      items: a.map((s) => ({
        productId: String(s.produto_id),
        code: s.codigo_produto ?? null,
        description: s.nome_produto,
        quantity: Number(s.quantidade_comercial ?? 0),
        unitPrice: Number(s.valor_unitario_comercial ?? 0),
        grossAmount: Number(s.valor_bruto ?? 0),
        discountAmount: Number(s.valor_desconto ?? 0),
        totalAmount: Number(s.subtotal ?? 0)
      })),
      payments: n.map((s) => ({
        paymentCode: s.tpag,
        paymentLabel: Gu(s.tpag),
        amount: Number(s.valor ?? 0),
        receivedAmount: Number(s.valor_recebido ?? s.valor ?? 0),
        changeAmount: Number(s.troco ?? 0)
      })),
      subtotalAmount: Number(r.valor_produtos ?? 0),
      discountAmount: Number(r.valor_desconto ?? 0),
      totalAmount: Number(r.valor_total ?? 0),
      changeAmount: Number(r.valor_troco ?? 0),
      notes: r.observacao ?? null,
      fiscal: o ? {
        status: o.status ?? null,
        accessKey: o.access_key ?? null,
        protocol: o.protocol ?? null,
        statusMessage: o.status ?? null,
        authorizationDatetime: o.authorization_datetime ?? null,
        qrCodeUrl: o.qr_code_url ?? null
      } : null
    };
  }
  loadCashReceiptData(e, r) {
    const a = u.prepare(`
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
    if (!a)
      throw new Error(`Sessão de caixa não encontrada para impressão: ${e}`);
    return {
      cashSessionId: Number(a.id),
      documentType: r,
      operatorName: a.operator_name ?? null,
      operatorId: a.operator_id === null ? null : String(a.operator_id),
      pdvId: a.pdv_id,
      openingAmount: Number(a.opening_cash_amount ?? 0),
      closingAmount: a.closing_cash_amount === null ? null : Number(a.closing_cash_amount),
      expectedAmount: a.expected_cash_amount === null ? null : Number(a.expected_cash_amount),
      differenceAmount: a.closing_difference === null ? null : Number(a.closing_difference),
      totalSalesCash: Number(a.total_vendas_dinheiro ?? 0),
      totalWithdrawals: Number(a.total_sangrias ?? 0),
      openedAt: a.opened_at,
      closedAt: a.closed_at ?? null,
      openingNotes: a.opening_notes ?? null,
      closingNotes: a.closing_notes ?? null
    };
  }
  hasPrintedDocumentForSale(e) {
    const r = u.prepare(`
      SELECT COUNT(*) AS total
      FROM printed_documents
      WHERE sale_id = ?
        AND document_type = 'SALE_RECEIPT'
    `).get(e);
    return Number(r.total ?? 0) > 0;
  }
  logInfo(e) {
    f.info(`[printing] ${e}`);
  }
}
const U = new zu();
class ju {
  async printHtml(e) {
    const r = Number(e.paperWidthMm ?? 80), a = Math.max(360, Math.round(r / 25.4 * 96) + 48), n = new H({
      show: !1,
      width: a,
      height: 1280,
      webPreferences: {
        sandbox: !0
      }
    });
    try {
      const o = `data:text/html;charset=utf-8,${encodeURIComponent(e.html)}`;
      await n.loadURL(o), await new Promise((s, i) => {
        n.webContents.print(
          {
            silent: !0,
            printBackground: !0,
            deviceName: e.printerName,
            margins: {
              marginType: "none"
            }
          },
          (c, l) => {
            if (!c) {
              i(new Error(l || "Falha desconhecida na impressão."));
              return;
            }
            s();
          }
        );
      });
    } catch (o) {
      throw f.error(`[printing] erro ao imprimir "${e.title}": ${o instanceof Error ? o.message : String(o)}`), o;
    } finally {
      n.isDestroyed() || n.destroy();
    }
  }
}
const qa = new ju();
function y(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function K(t) {
  return t.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function _r(t) {
  if (!t) return "—";
  const e = new Date(t);
  return Number.isNaN(e.getTime()) ? t : e.toLocaleString("pt-BR");
}
function Hu(t) {
  if (!(t != null && t.receipt_settings_json)) return {};
  try {
    return JSON.parse(t.receipt_settings_json);
  } catch {
    return {};
  }
}
function Ku(t) {
  return t.templateMode === "custom";
}
function Yu(t) {
  return {
    paperWidthMm: Number((t == null ? void 0 : t.paper_width_mm) ?? 80),
    contentWidthMm: Number((t == null ? void 0 : t.content_width_mm) ?? 76),
    baseFontSizePx: Number((t == null ? void 0 : t.base_font_size_px) ?? 14),
    lineHeight: Number((t == null ? void 0 : t.line_height) ?? 1.55)
  };
}
function Ga(t, e, r) {
  const a = Yu(r), n = Math.max((a.paperWidthMm - a.contentWidthMm) / 2, 0);
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${y(t)}</title>
    <style>
      @page {
        size: ${a.paperWidthMm}mm auto;
        margin: 0;
      }

      html, body {
        margin: 0;
        padding: 0;
        width: ${a.paperWidthMm}mm;
        font-family: "Courier New", monospace;
        color: #000000;
        background: #ffffff;
        font-size: ${a.baseFontSizePx}px;
        line-height: ${a.lineHeight};
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
        width: ${a.contentWidthMm}mm;
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
        font-size: ${Math.max(a.baseFontSizePx - 2, 10)}px;
        color: #000000;
      }
    </style>
  </head>
  <body><div class="receipt">${e}</div></body>
</html>`;
}
class Wu {
  renderSaleReceipt(e, r) {
    var c, l;
    const a = Hu(r), n = Ku(a), o = e.items.map((d) => `
      <div class="item">
        <div class="item-name">${y(d.description)}</div>
        <div class="item-meta">
          <span>${d.quantity.toFixed(3).replace(".", ",")} x ${K(d.unitPrice)}</span>
          <span class="strong">${K(d.totalAmount)}</span>
        </div>
        ${d.discountAmount > 0 ? `<div class="muted">Desconto: ${K(d.discountAmount)}</div>` : ""}
        ${(!n || a.showItemCodes !== !1) && d.code ? `<div class="muted">Cod.: ${y(d.code)}</div>` : ""}
      </div>
    `).join(""), s = e.payments.map((d) => `
      <div class="row">
        <span class="label">${y(d.paymentLabel)}</span>
        <span class="value">${K(d.amount)}</span>
      </div>
    `).join(""), i = `
      <div class="center">
        ${n && a.showLogo && a.logoPath ? `<div class="footer-note">LOGO: ${y(a.logoPath)}</div>` : ""}
        <div class="strong">${y(n && ((c = a.headerTitle) == null ? void 0 : c.trim()) || e.storeName)}</div>
        ${(!n || a.showLegalName !== !1) && e.storeLegalName && e.storeLegalName !== e.storeName ? `<div>${y(e.storeLegalName)}</div>` : ""}
        ${(!n || a.showDocument !== !1) && e.storeDocument ? `<div>CNPJ: ${y(e.storeDocument)}</div>` : ""}
        ${(!n || a.showAddress !== !1) && e.storeAddress ? `<div>${y(e.storeAddress)}</div>` : ""}
        ${n && a.headerMessage ? `<div class="footer-note">${y(a.headerMessage)}</div>` : ""}
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Venda</span><span class="value">#${e.saleId}</span></div>
      <div class="row"><span class="label">Data/Hora</span><span class="value">${y(_r(e.movedAt ?? e.emittedAt))}</span></div>
      ${!n || a.showOperator !== !1 ? `<div class="row"><span class="label">Operador</span><span class="value">${y(e.operatorName ?? "Não informado")}</span></div>` : ""}
      <div class="row"><span class="label">PDV</span><span class="value">${y(e.pdvId ?? "—")}</span></div>
      ${!n || a.showCustomer !== !1 ? `<div class="row"><span class="label">Cliente</span><span class="value">${y(e.customerName ?? "Consumidor final")}</span></div>` : ""}
      ${(!n || a.showCustomer !== !1) && e.customerDocument ? `<div class="row"><span class="label">Documento</span><span class="value">${y(e.customerDocument)}</span></div>` : ""}

      <div class="separator"></div>
      ${o}
      <div class="separator"></div>

      <div class="row"><span class="label">Subtotal</span><span class="value">${K(e.subtotalAmount)}</span></div>
      ${e.discountAmount > 0 ? `<div class="row"><span class="label">Descontos</span><span class="value">${K(e.discountAmount)}</span></div>` : ""}
      <div class="row"><span class="label strong">TOTAL</span><span class="value">${K(e.totalAmount)}</span></div>
      ${e.changeAmount > 0 ? `<div class="row"><span class="label">Troco</span><span class="value">${K(e.changeAmount)}</span></div>` : ""}

      ${!n || a.showPaymentBreakdown !== !1 ? `
        <div class="separator"></div>
        <div class="strong">Pagamentos</div>
        ${s}
      ` : ""}

      ${(!n || a.showFiscalSection !== !1) && e.fiscal ? `
        <div class="separator"></div>
        <div class="strong">Situação fiscal</div>
        <div class="row"><span class="label">Status</span><span class="value">${y(e.fiscal.status ?? "—")}</span></div>
        ${e.fiscal.protocol ? `<div class="row"><span class="label">Protocolo</span><span class="value">${y(e.fiscal.protocol)}</span></div>` : ""}
        ${e.fiscal.accessKey ? `<div class="footer-note mono">Chave: ${y(e.fiscal.accessKey)}</div>` : ""}
      ` : ""}

      ${e.notes ? `<div class="footer-note">Obs.: ${y(e.notes)}</div>` : ""}
      ${n && a.footerMessage ? `<div class="footer-note">${y(a.footerMessage)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        ${y(n && ((l = a.thankYouMessage) == null ? void 0 : l.trim()) || "Documento impresso pelo Galberto PDV")}<br />
        Guarde este comprovante para conferência.
      </div>
    `;
    return Ga(`Cupom de venda #${e.saleId}`, i, r);
  }
  renderCashReceipt(e, r) {
    const a = e.documentType === "CASH_CLOSING_RECEIPT", n = a ? "Comprovante de Fechamento de Caixa" : "Comprovante de Abertura de Caixa", o = `
      <div class="center">
        <div class="strong">${y(n)}</div>
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Sessão</span><span class="value">#${e.cashSessionId}</span></div>
      <div class="row"><span class="label">Operador</span><span class="value">${y(e.operatorName ?? "Não informado")}</span></div>
      <div class="row"><span class="label">PDV</span><span class="value">${y(e.pdvId)}</span></div>
      <div class="row"><span class="label">Aberto em</span><span class="value">${y(_r(e.openedAt))}</span></div>
      ${a ? `<div class="row"><span class="label">Fechado em</span><span class="value">${y(_r(e.closedAt))}</span></div>` : ""}

      <div class="separator"></div>

      <div class="row"><span class="label">Fundo inicial</span><span class="value">${K(e.openingAmount)}</span></div>
      ${a ? `
        <div class="row"><span class="label">Vendas em dinheiro</span><span class="value">${K(e.totalSalesCash)}</span></div>
        <div class="row"><span class="label">Sangrias</span><span class="value">${K(e.totalWithdrawals)}</span></div>
        <div class="row"><span class="label">Valor esperado</span><span class="value">${K(e.expectedAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Valor contado</span><span class="value">${K(e.closingAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Diferença</span><span class="value">${K(e.differenceAmount ?? 0)}</span></div>
      ` : ""}

      ${e.openingNotes ? `<div class="footer-note">Obs. abertura: ${y(e.openingNotes)}</div>` : ""}
      ${a && e.closingNotes ? `<div class="footer-note">Obs. fechamento: ${y(e.closingNotes)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        Documento impresso pelo Galberto PDV<br />
        Conferência operacional de caixa.
      </div>
    `;
    return Ga(n, o, r);
  }
  renderFromStoredDocument(e) {
    return e.contentHtml;
  }
}
const Nt = new Wu();
function Tr(t, e, r) {
  const n = {
    SALE_RECEIPT: "cupom da venda",
    CASH_OPENING_RECEIPT: "comprovante de abertura de caixa",
    CASH_CLOSING_RECEIPT: "comprovante de fechamento de caixa"
  }[t];
  return e === "printed" ? `${n} impresso${r ? ` em ${r}` : ""}.` : e === "skipped" ? `Nenhuma impressora padrão configurada para imprimir o ${n}.` : `Falha ao imprimir o ${n}.`;
}
class Qu {
  async printTestReceipt(e) {
    const r = U.findPrinterById(e);
    if (!r)
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
    const a = U.buildTestSaleReceiptData(r, {}), n = Nt.renderSaleReceipt(a, r);
    try {
      return await qa.printHtml({
        html: n,
        printerName: r.name,
        title: `Teste ${r.display_name ?? r.name}`,
        paperWidthMm: r.paper_width_mm
      }), U.appendPrinterLog(r.id, "Impressão de teste enviada."), {
        success: !0,
        status: "SUCCESS",
        documentId: 0,
        printerId: r.id,
        printerName: r.display_name ?? r.name,
        message: `Teste de impressão enviado para ${r.display_name ?? r.name}.`,
        jobId: 0,
        reprint: !1
      };
    } catch (o) {
      const s = o instanceof Error ? o.message : "Falha desconhecida na impressão de teste.";
      return U.appendPrinterLog(r.id, `Teste de impressão falhou: ${s}`), {
        success: !1,
        status: "FAILED",
        documentId: 0,
        printerId: r.id,
        printerName: r.display_name ?? r.name,
        message: s,
        jobId: 0,
        reprint: !1
      };
    }
  }
  async printSaleReceipt(e, r) {
    const a = U.loadSaleReceiptData(e), n = U.getDefaultPrinter(), o = {
      ...a,
      fiscal: r.fiscal ?? a.fiscal
    }, s = `Cupom de venda #${e}`, i = Nt.renderSaleReceipt(o, n), c = U.upsertDocument({
      documentType: "SALE_RECEIPT",
      referenceType: "SALE",
      referenceId: e,
      saleId: e,
      title: s,
      status: "PENDING",
      templateVersion: "thermal-v1",
      payloadJson: JSON.stringify(o),
      contentHtml: i,
      lastError: null
    });
    return this.dispatchToPrinter(c, r.triggerSource, !1);
  }
  async printCashOpeningReceipt(e, r) {
    const a = U.loadCashReceiptData(e, "CASH_OPENING_RECEIPT");
    return this.printCashReceipt(a, r, !1);
  }
  async printCashClosingReceipt(e, r) {
    const a = U.loadCashReceiptData(e, "CASH_CLOSING_RECEIPT");
    return this.printCashReceipt(a, r, !1);
  }
  async reprintSaleReceipt(e) {
    let r = U.findByReference("SALE_RECEIPT", "SALE", e);
    if (!r)
      return this.printSaleReceipt(e, { triggerSource: "MANUAL" });
    const a = U.getDefaultPrinter();
    try {
      const n = JSON.parse(r.payloadJson);
      r = U.upsertDocument({
        documentType: r.documentType,
        referenceType: r.referenceType,
        referenceId: r.referenceId,
        saleId: r.saleId,
        cashSessionId: r.cashSessionId,
        printerId: (a == null ? void 0 : a.id) ?? r.printerId,
        title: r.title,
        status: r.status,
        templateVersion: r.templateVersion,
        payloadJson: r.payloadJson,
        contentHtml: Nt.renderSaleReceipt(n, a),
        lastError: r.lastError
      });
    } catch {
      r = U.upsertDocument({
        documentType: r.documentType,
        referenceType: r.referenceType,
        referenceId: r.referenceId,
        saleId: r.saleId,
        cashSessionId: r.cashSessionId,
        printerId: (a == null ? void 0 : a.id) ?? r.printerId,
        title: r.title,
        status: r.status,
        templateVersion: r.templateVersion,
        payloadJson: r.payloadJson,
        contentHtml: r.contentHtml,
        lastError: r.lastError
      });
    }
    return this.dispatchToPrinter(r, "MANUAL", !0);
  }
  async printCashReceipt(e, r, a) {
    const n = U.getDefaultPrinter(), o = e.documentType === "CASH_OPENING_RECEIPT" ? `Abertura de caixa #${e.cashSessionId}` : `Fechamento de caixa #${e.cashSessionId}`, s = Nt.renderCashReceipt(e, n), i = U.upsertDocument({
      documentType: e.documentType,
      referenceType: "CASH_SESSION",
      referenceId: e.cashSessionId,
      cashSessionId: e.cashSessionId,
      title: o,
      status: "PENDING",
      templateVersion: "thermal-v1",
      payloadJson: JSON.stringify(e),
      contentHtml: s,
      lastError: null
    });
    return this.dispatchToPrinter(i, r, a);
  }
  async dispatchToPrinter(e, r, a) {
    const n = U.getDefaultPrinter();
    if (!n) {
      U.markDocumentFailed(e.id, "PENDING", "Nenhuma impressora padrão configurada.", null);
      const o = U.createPrintJob({
        printedDocumentId: e.id,
        printerId: null,
        triggerSource: r,
        status: "SKIPPED",
        errorMessage: "Nenhuma impressora padrão configurada."
      });
      return {
        success: !1,
        status: "SKIPPED",
        documentId: e.id,
        printerId: null,
        printerName: null,
        message: Tr(e.documentType, "skipped"),
        jobId: o.id,
        reprint: a
      };
    }
    try {
      await qa.printHtml({
        html: Nt.renderFromStoredDocument(e),
        printerName: n.name,
        title: e.title,
        paperWidthMm: n.paper_width_mm
      }), U.markDocumentPrinted(e.id, n.id), U.appendPrinterLog(n.id, `${e.title} enviado para impressão.`);
      const o = U.createPrintJob({
        printedDocumentId: e.id,
        printerId: n.id,
        triggerSource: r,
        status: "SUCCESS"
      });
      return {
        success: !0,
        status: "SUCCESS",
        documentId: e.id,
        printerId: n.id,
        printerName: n.display_name ?? n.name,
        message: Tr(e.documentType, "printed", n.display_name ?? n.name),
        jobId: o.id,
        reprint: a
      };
    } catch (o) {
      const s = o instanceof Error ? o.message : "Falha desconhecida na impressão.";
      U.markDocumentFailed(e.id, "FAILED", s, n.id), U.appendPrinterLog(n.id, `${e.title} falhou: ${s}`);
      const i = U.createPrintJob({
        printedDocumentId: e.id,
        printerId: n.id,
        triggerSource: r,
        status: "FAILED",
        errorMessage: s
      });
      return {
        success: !1,
        status: "FAILED",
        documentId: e.id,
        printerId: n.id,
        printerName: n.display_name ?? n.name,
        message: `${Tr(e.documentType, "failed")} ${s}`,
        jobId: i.id,
        reprint: a
      };
    }
  }
}
const Lt = new Qu();
function Ju(t) {
  const e = Number((t == null ? void 0 : t.valorDesconto) ?? (t == null ? void 0 : t.valor_desconto) ?? 0), r = Array.isArray(t == null ? void 0 : t.itens) ? t.itens.some((a) => Number((a == null ? void 0 : a.valor_desconto) ?? (a == null ? void 0 : a.valorDesconto) ?? 0) > 0) : !1;
  return e > 0 || r;
}
function fr(t) {
  if (Ju(t) && !at("discounts:apply"))
    throw new Error("Somente gerente ou administrador pode conceder descontos.");
}
function Zu() {
  p.handle("vendas:finalizar-com-baixa-estoque", async (t, e) => {
    fr(e), ws(e);
    const r = typeof e == "number" ? e : e.vendaId, a = await Zn.execute(r);
    let n;
    try {
      n = await Lt.printSaleReceipt(r, {
        triggerSource: "AUTO",
        fiscal: a.fiscal ?? null
      });
    } catch (o) {
      n = {
        success: !1,
        status: "FAILED",
        documentId: 0,
        printerId: null,
        printerName: null,
        message: o instanceof Error ? o.message : "Falha ao imprimir o cupom da venda.",
        jobId: 0,
        reprint: !1
      };
    }
    return {
      success: !0,
      vendaId: r,
      fiscal: a.fiscal,
      print: n
    };
  }), p.handle("vendas:get", (t, e) => Bs(e)), p.handle("vendas:cancelar", (t, e) => Fs(e)), p.handle("vendas:buscarPorId", (t, e) => Xs(e)), p.handle("vendas:finalizada-pendente-pagamento", (t, e) => (fr(e), ta(e, "ABERTA_PAGAMENTO", (e == null ? void 0 : e.id) ?? null))), p.handle("vendas:pausar", (t, e) => (fr(e), ta(e, "PAUSADA", (e == null ? void 0 : e.id) ?? null)));
}
let Je = null, Ze = null, et = null, tt = null, Te = null, rt = null, Me = null, Pe = null;
const ge = import.meta.dirname;
process.env.APP_ROOT = R.join(ge, "..");
function ed() {
  p.handle("app:open-external-url", async (c, l) => (await Wa.openExternal(l), !0)), p.on("window:open:sales-search", () => {
    if (Me && !Me.isDestroyed()) {
      Me.focus();
      return;
    }
    t();
  });
  function t() {
    Me = new H({
      title: "Vendas",
      width: 600,
      height: 530,
      center: !0,
      maximizable: !1,
      webPreferences: {
        preload: R.join(ge, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), Me.maximize(), P ? Me.loadURL(`${P}#/sales/search`) : Me.loadFile(R.join("dist/index.html"));
  }
  function e() {
    Pe = new H({
      title: "Galberto PDV",
      width: 1280,
      height: 820,
      center: !0,
      maximizable: !0,
      webPreferences: {
        preload: R.join(ge, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), Pe.maximize(), P ? Pe.loadURL(`${P}#/pdv`) : Pe.loadFile(R.join("dist/index.html"));
  }
  function r(c) {
    Je = new H({
      width: 764,
      height: 717,
      title: `Venda #${c}`,
      maximizable: !1,
      webPreferences: {
        preload: R.join(ge, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), P ? Je.loadURL(`${P}#/vendas/${c}`) : Je.loadFile(R.join("dist/index.html"));
  }
  function a() {
    Te = new H({
      title: "Search Product",
      maximizable: !0,
      webPreferences: {
        preload: R.join(ge, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), P ? Te.loadURL(`${P}#/pdv/products/search`) : Te.loadFile(R.join("dist/index.html"), {
      hash: "/pdv/products/search"
    });
  }
  function n(c) {
    Ze = new H({
      width: 764,
      height: 717,
      title: `Usuario #${c}`,
      maximizable: !1,
      webPreferences: {
        preload: R.join(ge, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), P ? Ze.loadURL(`${P}#/config/usuarios/${c}`) : Ze.loadFile(R.join("dist/index.html"));
  }
  function o() {
    rt = new H({
      width: 764,
      height: 717,
      title: "Config PDV",
      maximizable: !1,
      webPreferences: {
        preload: R.join(ge, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), P ? rt.loadURL(`${P}#/pdv/config/app`) : rt.loadFile(R.join("dist/index.html"), {
      hash: "/pdv/config/app"
    });
  }
  p.on("open-search-sales-window", () => {
    if (Te && !Te.isDestroyed()) {
      Te.focus();
      return;
    }
    t();
  }), p.on("window:open:config", () => {
    if (at("config:access")) {
      if (rt && !rt.isDestroyed()) {
        rt.focus();
        return;
      }
      o();
    }
  }), p.on("window:open:pdv", () => {
    if (at("pdv:access")) {
      if (Pe && !Pe.isDestroyed()) {
        Pe.focus();
        return;
      }
      e();
    }
  }), p.on("window:open:products-search", () => {
    if (Te && !Te.isDestroyed()) {
      Te.focus();
      return;
    }
    a();
  }), p.on("vendas:criar-janela-ver-vendas", (c, l) => {
    if (Je && !Je.isDestroyed()) {
      Je.focus();
      return;
    }
    r(l);
  }), p.on("usuarios:criar-janela-ver-usuario", (c, l) => {
    if (at("users:manage")) {
      if (Ze && !Ze.isDestroyed()) {
        Ze.focus();
        return;
      }
      n(l);
    }
  }), p.on("window:open:create-user", () => {
    if (at("users:manage")) {
      if (et && !et.isDestroyed()) {
        et.focus();
        return;
      }
      s();
    }
  }), p.on("window:open:edit-user", (c, l) => {
    if (at("users:manage")) {
      if (tt && !tt.isDestroyed()) {
        tt.focus();
        return;
      }
      i(l);
    }
  });
  function s() {
    et = new H({
      width: 764,
      height: 717,
      title: "Cadastrar Usuario",
      maximizable: !1,
      webPreferences: {
        preload: R.join(ge, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), P ? et.loadURL(`${P}#/config/usuarios/cadastrar_usuario`) : et.loadFile(R.join("dist/index.html"));
  }
  function i(c) {
    tt = new H({
      width: 764,
      height: 717,
      title: "Editar Usuario",
      maximizable: !1,
      webPreferences: {
        preload: R.join(ge, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), P ? tt.loadURL(`${P}#/config/users/edit_user/${c}`) : tt.loadFile(R.join("dist/index.html"));
  }
}
function td() {
  p.handle("produtos:get", (t, e) => $s(e)), p.handle("get-products-by-id", (t, e) => {
    if (!e) throw new Error("ID inválido");
    return ks(e);
  }), p.handle("produtos:buscar-por-nome", (t, e) => {
    if (!e) throw new Error("Nome Invalido");
    return qs(e);
  }), p.handle("produtos:buscar-por-codigo-de-barras", (t, e) => {
    if (!e) throw new Error("Codigo de Barras invalido");
    return Gs(e);
  }), p.handle("suggest-product-by-term", (t, e) => Vs(e));
}
function rd() {
  p.handle("printer:buscar-impressoras", async () => (g("printers:manage"), H.getAllWindows()[0].webContents.getPrintersAsync())), p.handle("printer:add-impressora", (t, e) => (g("printers:manage"), zs(e))), p.handle("printer:listar-cadastradas", () => (g("printers:manage"), js())), p.handle("printer:get-padrao", () => Hs()), p.handle("printer:remover", (t, e) => (g("printers:manage"), Ws(e))), p.handle("printer:definir-padrao", (t, e) => (g("printers:manage"), Qs(e))), p.handle("printer:atualizar-layout", (t, e, r) => (g("printers:manage"), Ks(e, r))), p.handle("printer:atualizar-personalizacao", (t, e, r) => (g("printers:manage"), Ys(e, r))), p.handle("printer:test-print", (t, e) => (g("printers:manage"), Lt.printTestReceipt(e))), p.handle("printer:reprint-sale-receipt", (t, e) => (g("sales:view"), Lt.reprintSaleReceipt(e)));
}
function ao(t) {
  u.prepare(`
    UPDATE sessions
    SET active = 0,
        logout_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(t);
}
function ad() {
  p.handle("auth:login", (t, e, r) => {
    const a = Xo(e, r);
    return Xa(a.sessionId), a;
  }), p.handle("auth:buscar-usuario", (t, e) => {
    if (!e) throw new Error("ID inválido");
    return g("users:manage"), Zs(e);
  }), p.handle("app:logoff-with-confirm", async () => {
    f.info("Logoff solicitado pelo usuario");
    const { response: t } = await Qa.showMessageBox({
      type: "question",
      buttons: ["cancelar", "sair"],
      defaultId: 1,
      cancelId: 0,
      message: "Tem certeza que deseja encerrar sessao?"
    });
    if (t === 1) {
      const e = Wr();
      return e && (ao(e), Xa(null)), f.info("logoff aprovado pelo usuario"), !0;
    }
    return !1;
  });
}
function nd() {
  p.handle("salvar-foto-usuario", async (t, e) => {
    g("users:manage");
    const r = _e.getPath("userData"), a = R.join(r, "fotos");
    or.existsSync(a) || or.mkdirSync(a);
    const n = R.extname(e.nomeArquivo || ""), o = R.basename(e.nomeArquivo || "foto", n).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40), s = R.join(a, `${Date.now()}-${o}${n}`);
    return or.writeFileSync(s, Buffer.from(e.buffer)), s;
  }), p.handle("update-user", (t, e) => (g("users:manage"), ni(e))), p.handle("disable-user", (t, e) => (g("users:manage"), oi(e))), p.handle("enable-user", (t, e) => (g("users:manage"), si(e))), p.handle("user:update-password", (t, e, r) => (g("users:manage"), ri(e, r))), p.handle("get-users", (t, e) => (g("users:manage"), ei(e))), p.handle("usuarios:add", (t, e) => (g("users:manage"), ti(e))), p.handle("delete-user", (t, e) => (g("users:manage"), ai(e)));
}
function od() {
  p.handle("open-cash-session", async (t, e) => {
    console.log("Abrindo caixa com dados: ", e);
    const r = xs(e);
    let a;
    try {
      a = await Lt.printCashOpeningReceipt(r.id, "AUTO");
    } catch (n) {
      a = {
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
    return { session: r, print: a };
  }), p.handle("close-cash-session", async (t, e) => {
    console.log("Fechando caixa com dados: ", e);
    const r = Ps(e);
    let a;
    try {
      a = await Lt.printCashClosingReceipt(r.id, "AUTO");
    } catch (n) {
      a = {
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
    return { session: r, print: a };
  }), p.handle("get-open-cash-session", async (t, e) => ii(e)), p.handle("register-cash-withdrawal", async (t, e) => (g("cash:withdraw"), Ms(e))), p.on("pdv:selecionar-produto", (t, e) => {
    for (const r of H.getAllWindows())
      r.webContents.send("pdv:produto-selecionado", e);
  }), p.on("pdv:retomar-venda", (t, e) => {
    for (const r of H.getAllWindows())
      r.webContents.send("pdv:venda-retomada", e);
  });
}
function sd(t = 32) {
  return br.randomBytes(t).toString("hex");
}
function Nr(t, e) {
  return Buffer.from(`${t}:${e}`, "utf8").toString("base64");
}
class id {
  getByIntegrationId(e) {
    const a = u.prepare(`
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
    return a ? {
      integrationId: a.integration_id,
      accessToken: a.access_token,
      refreshToken: a.refresh_token,
      tokenType: a.token_type ?? "Bearer",
      expiresAt: a.expires_at,
      scope: a.scope,
      raw: a.raw_json ? JSON.parse(a.raw_json) : null,
      updatedAt: a.updated_at
    } : null;
  }
  save(e) {
    u.prepare(`
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
    u.prepare(`
      DELETE FROM integrations
      WHERE integration_id = ?
    `).run(e);
  }
  isConnected(e) {
    return !!u.prepare(`
      SELECT 1
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(e);
  }
}
const Be = new id(), cd = "https://www.bling.com.br/Api/v3/oauth/authorize", Va = "https://api.bling.com.br/Api/v3/oauth/token", ud = "https://api.bling.com.br/oauth/revoke";
function fe(t) {
  const e = process.env[t];
  if (!e)
    throw new Error(`Variável de ambiente ausente: ${t}`);
  return e;
}
function dd(t) {
  const e = new hr(t);
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
class ld {
  async getStatus() {
    const e = Be.getByIntegrationId("bling");
    if (!e)
      return {
        connected: !1,
        expiresAt: null
      };
    try {
      await this.getValidAccessToken();
      const r = Be.getByIntegrationId("bling");
      return {
        connected: !0,
        expiresAt: (r == null ? void 0 : r.expiresAt) ?? null
      };
    } catch (r) {
      return console.error("[BlingOAuthService.getStatus]", r), {
        connected: !1,
        expiresAt: e.expiresAt
      };
    }
  }
  async connect() {
    const e = fe("BLING_CLIENT_ID"), r = fe("BLING_REDIRECT_URI"), a = sd(24), n = await this.requestAuthorizationCode({
      clientId: e,
      redirectUri: r,
      state: a
    });
    return await this.exchangeCodeForToken(n), {
      success: !0,
      message: "Bling conectado com sucesso."
    };
  }
  async disconnect() {
    const e = fe("BLING_CLIENT_ID"), r = fe("BLING_CLIENT_SECRET"), a = Be.getByIntegrationId("bling");
    if (!a)
      return {
        success: !0,
        message: "Bling já estava desconectado."
      };
    try {
      const n = new URLSearchParams({
        token: a.refreshToken
      });
      await fetch(ud, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Nr(e, r)}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: n.toString()
      });
    } catch (n) {
      console.warn("[BlingOAuthService.disconnect] falha ao revogar remotamente:", n);
    }
    return Be.delete("bling"), {
      success: !0,
      message: "Bling desconectado com sucesso."
    };
  }
  async getValidAccessToken() {
    const e = Be.getByIntegrationId("bling");
    if (!e)
      throw new Error("Bling não está conectado.");
    if (!(new Date(e.expiresAt).getTime() <= Date.now() + 6e4))
      return e.accessToken;
    await this.refreshAccessToken(e.refreshToken);
    const n = Be.getByIntegrationId("bling");
    if (!n)
      throw new Error("Falha ao renovar token do Bling.");
    return n.accessToken;
  }
  async requestAuthorizationCode(e) {
    const { hostname: r, port: a, pathname: n } = dd(e.redirectUri), o = new hr(cd);
    return o.searchParams.set("response_type", "code"), o.searchParams.set("client_id", e.clientId), o.searchParams.set("state", e.state), o.searchParams.set("redirect_uri", e.redirectUri), await new Promise((s, i) => {
      let c = !1;
      const l = (E, _) => {
        clearTimeout(_), E.close();
      }, d = No.createServer((E, _) => {
        try {
          if (!E.url)
            throw new Error("Callback sem URL.");
          const A = new hr(E.url, `http://${r}:${a}`);
          if (A.pathname !== n) {
            _.statusCode = 404, _.end("Not found");
            return;
          }
          const N = A.searchParams.get("error"), C = A.searchParams.get("code"), O = A.searchParams.get("state");
          if (N) {
            _.statusCode = 400, _.end("Autorização recusada ou inválida."), c || (c = !0, l(d, m), i(new Error(`Bling retornou erro no callback: ${N}`)));
            return;
          }
          if (!C) {
            _.statusCode = 400, _.end("Authorization code não recebido."), c || (c = !0, l(d, m), i(new Error("Authorization code não recebido.")));
            return;
          }
          if (O !== e.state) {
            _.statusCode = 400, _.end("State inválido."), c || (c = !0, l(d, m), i(new Error("State inválido no callback do Bling.")));
            return;
          }
          _.statusCode = 200, _.setHeader("Content-Type", "text/html; charset=utf-8"), _.end(`
            <html>
              <body style="font-family: Arial, sans-serif; padding: 24px;">
                <h2>Integração concluída</h2>
                <p>Você já pode fechar esta janela e voltar ao sistema.</p>
              </body>
            </html>
          `), c || (c = !0, l(d, m), s(C));
        } catch (A) {
          c || (c = !0, l(d, m), i(A instanceof Error ? A : new Error("Erro desconhecido no callback.")));
        }
      }), m = setTimeout(() => {
        c || (c = !0, l(d, m), i(new Error("Tempo esgotado aguardando autorização do Bling.")));
      }, 12e4);
      d.listen(a, r, async () => {
        try {
          await Wa.openExternal(o.toString());
        } catch (E) {
          c || (c = !0, l(d, m), i(
            E instanceof Error ? E : new Error("Falha ao abrir navegador para autorização.")
          ));
        }
      }), d.on("error", (E) => {
        c || (c = !0, l(d, m), i(E instanceof Error ? E : new Error("Erro ao iniciar servidor local.")));
      });
    });
  }
  async exchangeCodeForToken(e) {
    const r = fe("BLING_CLIENT_ID"), a = fe("BLING_CLIENT_SECRET"), n = fe("BLING_REDIRECT_URI"), o = new URLSearchParams({
      grant_type: "authorization_code",
      code: e,
      redirect_uri: n
    }), s = await fetch(Va, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Nr(r, a)}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "enable-jwt": "1"
      },
      body: o.toString()
    }), i = await s.text();
    if (!s.ok)
      throw new Error(`Falha ao trocar code por token no Bling: ${s.status} - ${i}`);
    const c = JSON.parse(i);
    this.persistToken(c);
  }
  async refreshAccessToken(e) {
    const r = fe("BLING_CLIENT_ID"), a = fe("BLING_CLIENT_SECRET"), n = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: e
    }), o = await fetch(Va, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Nr(r, a)}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "enable-jwt": "1"
      },
      body: n.toString()
    }), s = await o.text();
    if (!o.ok)
      throw new Error(`Falha ao renovar token do Bling: ${o.status} - ${s}`);
    const i = JSON.parse(s);
    this.persistToken(i);
  }
  persistToken(e) {
    const r = new Date(Date.now() + e.expires_in * 1e3).toISOString(), a = {
      integrationId: "bling",
      accessToken: e.access_token,
      refreshToken: e.refresh_token,
      tokenType: e.token_type,
      expiresAt: r,
      scope: e.scope ?? null,
      raw: e,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    Be.save(a);
  }
}
const $t = new ld(), Ed = "https://api.bling.com.br/Api/v3";
class md {
  /**
   * Método genérico GET para a API da Bling.
   *
   * Permite passar query params dinamicamente.
   */
  async get(e, r) {
    const a = await $t.getValidAccessToken(), n = new URL(`${Ed}${e}`);
    r && Object.entries(r).forEach(([i, c]) => {
      c != null && n.searchParams.append(i, String(c));
    });
    const o = await fetch(n.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${a}`,
        Accept: "application/json",
        "enable-jwt": "1"
      }
    }), s = await o.text();
    if (!o.ok)
      throw new Error(`Erro na API do Bling: ${o.status} - ${s}`);
    return JSON.parse(s);
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
  async getProductById(e) {
    return this.get(`/produtos/${e}`);
  }
  async getProductByCode(e) {
    return this.get("/produtos", {
      codigos: e,
      criterio: "5",
      limite: 10
    });
  }
  async getCategories(e) {
    return this.get("/categorias/produtos", {
      pagina: (e == null ? void 0 : e.page) ?? 1,
      limite: (e == null ? void 0 : e.limit) ?? 100
    });
  }
}
const he = new md();
function rr() {
  return br.randomUUID();
}
function ee() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function za(t, e) {
  const r = new Date(t);
  return r.setMinutes(r.getMinutes() - e), r.toISOString();
}
class pd {
  countByIntegrationSource(e) {
    return u.prepare(`
      SELECT COUNT(*) as count FROM categories
      WHERE integration_source = ? AND deleted_at IS NULL
    `).get(e).count;
  }
  upsert(e) {
    if (!(e != null && e.externalId) || !(e != null && e.name)) {
      console.warn("[CategoryRepository] Pulando categoria inválida:", e);
      return;
    }
    const r = ee();
    u.prepare(`
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
      e.id ?? rr(),
      e.externalId,
      e.integrationSource,
      e.name,
      e.active ?? 1,
      e.remoteUpdatedAt ?? null,
      e.lastSyncedAt,
      e.syncStatus ?? "synced",
      e.raw ? JSON.stringify(e.raw) : null,
      e.createdAt ?? r,
      e.updatedAt ?? r
    );
  }
  upsertMany(e) {
    u.transaction((a) => {
      for (const n of a) this.upsert(n);
    })(e);
  }
  getExternalIdsBySource(e, r) {
    if (r.length === 0) return [];
    const a = r.map(() => "?").join(",");
    return u.prepare(`
      SELECT external_id FROM categories
      WHERE integration_source = ? AND external_id IN (${a})
    `).all(e, ...r).map((o) => o.external_id);
  }
  /**
   * Retorna um Map de externalId -> localId para todas as categorias de uma fonte.
   * Usado pelo sync de produtos para linkar category_id sem fazer N queries.
   */
  getAllExternalIdMap(e) {
    const r = u.prepare(`
      SELECT id, external_id FROM categories
      WHERE integration_source = ? AND deleted_at IS NULL
    `).all(e);
    return new Map(r.map((a) => [a.external_id, a.id]));
  }
  mapRow(e) {
    let r = null;
    if (e.raw_json)
      try {
        r = JSON.parse(e.raw_json);
      } catch {
        r = e.raw_json;
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
      raw: r,
      createdAt: e.created_at,
      updatedAt: e.updated_at
    };
  }
}
const kt = new pd();
class _d {
  get(e, r) {
    const a = u.prepare(`
      SELECT * FROM sync_states
      WHERE integration_id = ? AND resource = ?
      LIMIT 1
    `).get(e, r);
    return a ? {
      integrationId: a.integration_id,
      resource: a.resource,
      lastSyncAt: a.last_sync_at,
      lastSuccessAt: a.last_success_at,
      checkpointCursor: a.checkpoint_cursor,
      status: a.status,
      errorMessage: a.error_message,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    } : null;
  }
  save(e) {
    u.prepare(`
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
      rr(),
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
  markRunning(e, r) {
    const a = ee(), n = this.get(e, r);
    this.save({
      integrationId: e,
      resource: r,
      lastSyncAt: a,
      lastSuccessAt: (n == null ? void 0 : n.lastSuccessAt) ?? null,
      checkpointCursor: (n == null ? void 0 : n.checkpointCursor) ?? null,
      status: "running",
      errorMessage: null,
      createdAt: (n == null ? void 0 : n.createdAt) ?? a,
      updatedAt: a
    });
  }
  markSuccess(e, r, a) {
    const n = ee(), o = this.get(e, r);
    this.save({
      integrationId: e,
      resource: r,
      lastSyncAt: n,
      lastSuccessAt: n,
      checkpointCursor: a ?? (o == null ? void 0 : o.checkpointCursor) ?? null,
      status: "success",
      errorMessage: null,
      createdAt: (o == null ? void 0 : o.createdAt) ?? n,
      updatedAt: n
    });
  }
  markError(e, r, a) {
    const n = ee(), o = this.get(e, r);
    this.save({
      integrationId: e,
      resource: r,
      lastSyncAt: (o == null ? void 0 : o.lastSyncAt) ?? null,
      lastSuccessAt: (o == null ? void 0 : o.lastSuccessAt) ?? null,
      checkpointCursor: (o == null ? void 0 : o.checkpointCursor) ?? null,
      status: "error",
      errorMessage: a,
      createdAt: (o == null ? void 0 : o.createdAt) ?? n,
      updatedAt: n
    });
  }
}
const le = new _d();
class Td {
  start(e) {
    const r = rr();
    return u.prepare(`
      INSERT INTO sync_logs (
        id, integration_id, resource, mode, status,
        started_at, items_processed, items_created, items_updated, items_failed
      ) VALUES (?, ?, ?, ?, 'running', ?, 0, 0, 0, 0)
    `).run(r, e.integrationId, e.resource, e.mode, e.startedAt), r;
  }
  finish(e) {
    u.prepare(`
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
  listByIntegration(e, r, a = 20) {
    return u.prepare(`
      SELECT * FROM sync_logs
      WHERE integration_id = ? AND resource = ?
      ORDER BY started_at DESC
      LIMIT ?
    `).all(e, r, a).map((o) => ({
      id: o.id,
      integrationId: o.integration_id,
      resource: o.resource,
      mode: o.mode,
      status: o.status,
      startedAt: o.started_at,
      finishedAt: o.finished_at,
      itemsProcessed: o.items_processed,
      itemsCreated: o.items_created,
      itemsUpdated: o.items_updated,
      itemsFailed: o.items_failed,
      errorMessage: o.error_message
    }));
  }
}
const be = new Td();
async function yr(t) {
  await new Promise((e) => setTimeout(e, t));
}
const ye = "bling", gt = "categories", ja = 100;
function fd(t) {
  const e = [
    t.nome,
    t.descricao,
    t.description
  ];
  for (const r of e)
    if (typeof r == "string" && r.trim())
      return r.trim();
  return null;
}
function Nd(t, e) {
  if (t == null || !t.id) return null;
  const r = fd(t);
  return r ? {
    externalId: String(t.id),
    integrationSource: ye,
    name: r,
    active: 1,
    lastSyncedAt: e,
    syncStatus: "synced",
    raw: t,
    updatedAt: e
  } : null;
}
class gd {
  async execute() {
    const e = le.get(ye, gt), r = kt.countByIntegrationSource(ye), n = !e || !e.lastSuccessAt || r === 0 ? "initial" : "incremental";
    le.markRunning(ye, gt);
    const o = ee(), s = be.start({
      integrationId: ye,
      resource: gt,
      mode: n,
      startedAt: o
    });
    let i = 0, c = 0, l = 0, d = 0;
    try {
      let m = 1, E = !0;
      for (; E; ) {
        const A = await he.getCategories({ page: m, limit: ja }), N = Array.isArray(A.data) ? A.data : [], C = N.filter((G) => G != null), O = N.length - C.length;
        if (d += O, C.length === 0 && m === 1) {
          E = !1;
          break;
        }
        const J = ee(), b = C.map((G) => Nd(G, J)), F = b.filter((G) => G != null);
        if (d += b.length - F.length, i += N.length, N.length > 0 && F.length === 0 && console.warn("[SyncCategoriesFromBlingService] Nenhuma categoria válida mapeada. Exemplo de payload:", N[0]), F.length > 0) {
          const G = F.map((te) => te.externalId), Ve = new Set(
            kt.getExternalIdsBySource(ye, G)
          );
          for (const te of F)
            Ve.has(te.externalId) ? l++ : c++;
          kt.upsertMany(F);
        }
        N.length < ja ? E = !1 : (m++, await yr(350));
      }
      const _ = ee();
      return le.markSuccess(ye, gt), be.finish({
        id: s,
        status: "success",
        finishedAt: _,
        itemsProcessed: i,
        itemsCreated: c,
        itemsUpdated: l,
        itemsFailed: d
      }), { mode: n, processed: i, created: c, updated: l, failed: d };
    } catch (m) {
      const E = ee(), _ = m instanceof Error ? m.message : String(m);
      throw le.markError(ye, gt, _), be.finish({
        id: s,
        status: "failed",
        finishedAt: E,
        itemsProcessed: i,
        itemsCreated: c,
        itemsUpdated: l,
        itemsFailed: d,
        errorMessage: _
      }), m;
    }
  }
}
const no = new gd();
class Ad {
  countByIntegrationSource(e) {
    return u.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE integration_source = ? AND deleted_at IS NULL
    `).get(e).count;
  }
  upsert(e) {
    const r = ee(), a = e.id ?? rr();
    u.prepare(`
      INSERT INTO products (
        id, external_id, integration_source, sku, barcode, category_id,
        name, unit, sale_price_cents, cost_price_cents, current_stock, minimum_stock,
        ncm, cfop, origin, fixed_ipi_value_cents, notes, situation, supplier_code, supplier_name,
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        cfop              = excluded.cfop,
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
      a,
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
      e.ncm ?? null,
      e.cfop ?? null,
      e.origin ?? null,
      e.fixedIpiValueCents ?? null,
      e.notes ?? null,
      e.situation ?? null,
      e.supplierCode ?? null,
      e.supplierName ?? null,
      e.location ?? null,
      e.maximumStock ?? null,
      e.netWeightKg ?? null,
      e.grossWeightKg ?? null,
      e.packagingBarcode ?? null,
      e.widthCm ?? null,
      e.heightCm ?? null,
      e.depthCm ?? null,
      e.expirationDate ?? null,
      e.supplierProductDescription ?? null,
      e.complementaryDescription ?? null,
      e.itemsPerBox ?? null,
      e.isVariation ?? null,
      e.productionType ?? null,
      e.ipiTaxClass ?? null,
      e.serviceListCode ?? null,
      e.itemType ?? null,
      e.tagsGroup ?? null,
      e.tags ?? null,
      e.taxesJson ?? null,
      e.parentCode ?? null,
      e.integrationCode ?? null,
      e.productGroup ?? null,
      e.brand ?? null,
      e.cest ?? null,
      e.volumes ?? null,
      e.shortDescription ?? null,
      e.crossDockingDays ?? null,
      e.externalImageUrls ?? null,
      e.externalLink ?? null,
      e.supplierWarrantyMonths ?? null,
      e.cloneParentData ?? null,
      e.productCondition ?? null,
      e.freeShipping ?? null,
      e.fciNumber ?? null,
      e.department ?? null,
      e.measurementUnit ?? null,
      e.purchasePriceCents ?? null,
      e.icmsStRetentionBaseCents ?? null,
      e.icmsStRetentionValueCents ?? null,
      e.icmsSubstituteOwnValueCents ?? null,
      e.productCategoryName ?? null,
      e.additionalInfo ?? null,
      e.active,
      e.remoteCreatedAt ?? null,
      e.remoteUpdatedAt ?? null,
      e.lastSyncedAt,
      e.syncStatus ?? "synced",
      e.raw ? JSON.stringify(e.raw) : null,
      e.createdAt ?? r,
      e.updatedAt ?? r
    ), u.prepare(`
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
      a,
      e.sku ?? null,
      e.barcode ?? null,
      e.name,
      e.brand ?? null,
      e.costPriceCents / 100,
      e.salePriceCents / 100,
      e.currentStock ?? 0,
      e.minimumStock ?? 0,
      e.measurementUnit ?? e.unit ?? null,
      e.ncm ?? null,
      e.active,
      e.createdAt ?? r,
      e.updatedAt ?? r
    );
  }
  upsertMany(e) {
    u.transaction((a) => {
      for (const n of a) this.upsert(n);
    })(e);
  }
  getExternalIdsBySource(e, r) {
    if (r.length === 0) return [];
    const a = r.map(() => "?").join(",");
    return u.prepare(`
      SELECT external_id FROM products
      WHERE integration_source = ? AND external_id IN (${a})
    `).all(e, ...r).map((o) => o.external_id);
  }
  getByExternalId(e, r) {
    const a = u.prepare(`
      SELECT * FROM products
      WHERE integration_source = ? AND external_id = ?
      LIMIT 1
    `).get(e, r);
    return a ? this.mapRow(a) : null;
  }
  listByIntegrationSource(e) {
    return u.prepare(`
      SELECT * FROM products
      WHERE integration_source = ? AND deleted_at IS NULL
      ORDER BY name ASC
    `).all(e).map((a) => this.mapRow(a));
  }
  mapRow(e) {
    let r = null;
    if (e.raw_json)
      try {
        r = JSON.parse(e.raw_json);
      } catch {
        r = e.raw_json;
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
      ncm: e.ncm,
      cfop: e.cfop,
      origin: e.origin,
      fixedIpiValueCents: e.fixed_ipi_value_cents,
      notes: e.notes,
      situation: e.situation,
      supplierCode: e.supplier_code,
      supplierName: e.supplier_name,
      location: e.location,
      maximumStock: e.maximum_stock,
      netWeightKg: e.net_weight_kg,
      grossWeightKg: e.gross_weight_kg,
      packagingBarcode: e.packaging_barcode,
      widthCm: e.width_cm,
      heightCm: e.height_cm,
      depthCm: e.depth_cm,
      expirationDate: e.expiration_date,
      supplierProductDescription: e.supplier_product_description,
      complementaryDescription: e.complementary_description,
      itemsPerBox: e.items_per_box,
      isVariation: e.is_variation,
      productionType: e.production_type,
      ipiTaxClass: e.ipi_tax_class,
      serviceListCode: e.service_list_code,
      itemType: e.item_type,
      tagsGroup: e.tags_group,
      tags: e.tags,
      taxesJson: e.taxes_json,
      parentCode: e.parent_code,
      integrationCode: e.integration_code,
      productGroup: e.product_group,
      brand: e.brand,
      cest: e.cest,
      volumes: e.volumes,
      shortDescription: e.short_description,
      crossDockingDays: e.cross_docking_days,
      externalImageUrls: e.external_image_urls,
      externalLink: e.external_link,
      supplierWarrantyMonths: e.supplier_warranty_months,
      cloneParentData: e.clone_parent_data,
      productCondition: e.product_condition,
      freeShipping: e.free_shipping,
      fciNumber: e.fci_number,
      department: e.department,
      measurementUnit: e.measurement_unit,
      purchasePriceCents: e.purchase_price_cents,
      icmsStRetentionBaseCents: e.icms_st_retention_base_cents,
      icmsStRetentionValueCents: e.icms_st_retention_value_cents,
      icmsSubstituteOwnValueCents: e.icms_substitute_own_value_cents,
      productCategoryName: e.product_category_name,
      additionalInfo: e.additional_info,
      active: e.active,
      remoteCreatedAt: e.remote_created_at,
      remoteUpdatedAt: e.remote_updated_at,
      lastSyncedAt: e.last_synced_at ?? "",
      syncStatus: e.sync_status,
      raw: r,
      createdAt: e.created_at,
      updatedAt: e.updated_at
    };
  }
}
const gr = new Ad(), Ae = "bling", At = "products", Ha = 100, hd = "5";
function Id(t, e) {
  if (!t || typeof t != "object") return;
  let r = t;
  for (const a of e.split(".")) {
    if (!r || typeof r != "object" || !(a in r)) return;
    r = r[a];
  }
  return r;
}
function T(t, e) {
  for (const r of e) {
    const a = Id(t, r);
    if (a != null && a !== "")
      return a;
  }
}
function S(t) {
  if (t == null) return null;
  if (typeof t == "string") {
    const e = t.trim();
    return e || null;
  }
  return typeof t == "number" || typeof t == "boolean" ? String(t) : null;
}
function Cd(t) {
  var r;
  const e = ((r = S(t)) == null ? void 0 : r.replace(/\D/g, "")) ?? null;
  return e && e.length > 0 ? e : null;
}
function vd(t) {
  var r;
  const e = ((r = S(t)) == null ? void 0 : r.replace(/\D/g, "")) ?? null;
  return e && e.length > 0 ? e : null;
}
function Dd(t) {
  if (typeof t == "number")
    return Number.isInteger(t) && t >= 0 && t <= 8 ? String(t) : null;
  const e = S(t);
  if (e === null) return null;
  const r = e.match(/[0-8]/);
  return (r == null ? void 0 : r[0]) ?? null;
}
function ne(t) {
  if (t == null || t === "") return null;
  if (typeof t == "number") return Number.isFinite(t) ? t : null;
  if (typeof t == "string") {
    const e = t.trim(), r = e.includes(",") ? e.replace(/\./g, "").replace(",", ".") : e, a = Number(r);
    return Number.isFinite(a) ? a : null;
  }
  return null;
}
function Xe(t) {
  const e = ne(t);
  return e == null ? null : Math.round(e * 100);
}
function Ka(t) {
  const e = ne(t);
  return e == null ? null : Math.round(e);
}
function Pt(t) {
  if (t == null || t === "") return null;
  if (typeof t == "boolean") return t ? 1 : 0;
  if (typeof t == "number") return t === 0 ? 0 : 1;
  if (typeof t == "string") {
    const e = t.trim().toLowerCase();
    if (["1", "true", "t", "sim", "s", "y", "yes", "a", "ativo"].includes(e)) return 1;
    if (["0", "false", "f", "nao", "não", "n", "no", "i", "inativo"].includes(e)) return 0;
  }
  return null;
}
function Bt(t) {
  if (t == null || t === "") return null;
  if (typeof t == "string") {
    const e = t.trim();
    return e || null;
  }
  try {
    return JSON.stringify(t);
  } catch {
    return null;
  }
}
function Sd(t) {
  const e = T(t, [
    "categoria.id",
    "categoriaProduto.id",
    "categoriaProdutoId"
  ]);
  return S(e);
}
function oo(t) {
  return t.replace("T", " ").slice(0, 19);
}
function Rd(t) {
  const e = (t == null ? void 0 : t.checkpointCursor) ?? (t == null ? void 0 : t.lastSuccessAt);
  if (!e) return;
  const r = e.includes("T") ? za(e, 2) : za(e.replace(" ", "T") + "Z", 2);
  return oo(r);
}
function Ld(t, e, r) {
  const a = Sd(t), n = Xe(T(t, ["preco"])) ?? 0, o = Xe(T(t, ["precoCusto"])) ?? 0, s = Xe(T(t, ["precoCompra", "precoCusto"])), i = ne(T(t, [
    "estoque.saldoVirtualTotal",
    "estoque.saldoFisicoTotal",
    "estoque"
  ])) ?? 0, c = ne(T(t, [
    "estoque.minimo",
    "estoqueMinimo"
  ])) ?? 0, l = Pt(T(t, ["situacao"])) ?? 0, d = S(T(t, [
    "fornecedor.nome",
    "fornecedor"
  ])), m = S(T(t, [
    "categoria.nome",
    "categoriaProduto.nome",
    "categoriaProduto"
  ]));
  return {
    // Identificação do produto no Bling e origem da integração.
    externalId: String(t.id),
    integrationSource: Ae,
    // Dados comerciais e de identificação. Campos ausentes viram null para manter padrão local.
    sku: S(T(t, ["codigo"])) ?? null,
    barcode: S(T(t, ["gtin", "codigo"])) ?? null,
    categoryId: a ? r.get(a) ?? null : null,
    name: t.nome,
    unit: S(T(t, ["unidade", "unidadeMedida"])) ?? null,
    // Valores monetários são armazenados em centavos para evitar problemas com ponto flutuante.
    salePriceCents: n,
    costPriceCents: o,
    purchasePriceCents: s,
    // Estoque e limites locais.
    currentStock: i,
    minimumStock: c,
    maximumStock: ne(T(t, [
      "estoque.maximo",
      "estoqueMaximo"
    ])),
    // Espelho ampliado do Bling.
    ncm: Cd(T(t, ["ncm", "tributacao.ncm", "tributos.ncm"])),
    cfop: S(T(t, ["cfop", "tributacao.cfop", "tributos.cfop", "cfopPadrao"])),
    origin: Dd(T(t, ["origem", "tributacao.origem", "tributos.origem"])),
    fixedIpiValueCents: Xe(T(t, ["valorIpiFixo"])),
    notes: S(T(t, ["observacoes", "observacao"])),
    situation: S(T(t, ["situacao"])),
    supplierCode: S(T(t, ["codigoFornecedor"])),
    supplierName: d,
    location: S(T(t, ["localizacao"])),
    netWeightKg: ne(T(t, ["pesoLiquido"])),
    grossWeightKg: ne(T(t, ["pesoBruto"])),
    packagingBarcode: S(T(t, ["gtinEmbalagem"])),
    widthCm: ne(T(t, ["larguraProduto", "largura"])),
    heightCm: ne(T(t, ["alturaProduto", "altura"])),
    depthCm: ne(T(t, ["profundidadeProduto", "profundidade"])),
    expirationDate: S(T(t, ["dataValidade"])),
    supplierProductDescription: S(T(t, [
      "descricaoFornecedor",
      "descricaoProdutoFornecedor"
    ])),
    complementaryDescription: S(T(t, ["descricaoComplementar"])),
    itemsPerBox: ne(T(t, ["itensPorCaixa"])),
    isVariation: Pt(T(t, ["produtoVariacao", "variacao"])),
    productionType: S(T(t, ["tipoProducao"])),
    ipiTaxClass: S(T(t, ["classeEnquadramentoIpi"])),
    serviceListCode: S(T(t, ["codigoListaServicos"])),
    itemType: S(T(t, ["tipoItem", "tipo"])),
    tagsGroup: Bt(T(t, ["grupoTags", "grupoDeTags"])),
    tags: Bt(T(t, ["tags"])),
    taxesJson: Bt(T(t, ["tributos"])),
    parentCode: S(T(t, ["codigoPai"])),
    integrationCode: S(T(t, ["codigoIntegracao"])),
    productGroup: S(T(t, ["grupoProdutos", "grupoProduto"])),
    brand: S(T(t, ["marca"])),
    cest: vd(T(t, ["cest", "tributacao.cest", "tributos.cest"])),
    volumes: ne(T(t, ["volumes"])),
    shortDescription: S(T(t, ["descricaoCurta"])),
    crossDockingDays: Ka(T(t, ["crossDocking"])),
    externalImageUrls: Bt(T(t, ["urlImagensExternas", "imagensURL", "imagemURL"])),
    externalLink: S(T(t, ["linkExterno"])),
    supplierWarrantyMonths: Ka(T(t, ["mesesGarantiaFornecedor"])),
    cloneParentData: Pt(T(t, ["clonarDadosPai"])),
    productCondition: S(T(t, ["condicaoProduto"])),
    freeShipping: Pt(T(t, ["freteGratis"])),
    fciNumber: S(T(t, ["numeroFci", "numeroFCI"])),
    department: S(T(t, ["departamento"])),
    measurementUnit: S(T(t, ["unidadeMedida", "unidade"])),
    icmsStRetentionBaseCents: Xe(T(t, ["valorBaseIcmsStRetencao"])),
    icmsStRetentionValueCents: Xe(T(t, ["valorIcmsStRetencao"])),
    icmsSubstituteOwnValueCents: Xe(T(t, ["valorIcmsProprioSubstituto"])),
    productCategoryName: m,
    additionalInfo: S(T(t, ["informacoesAdicionais"])),
    // No Bling, "A" representa produto ativo.
    active: l,
    // Datas e metadados de sincronização.
    remoteCreatedAt: S(T(t, ["dataCriacao"])),
    remoteUpdatedAt: S(T(t, ["dataAlteracao"])),
    lastSyncedAt: e,
    syncStatus: "synced",
    // Guarda o payload original para auditoria/debug e futuras evoluções do mapeamento.
    raw: t,
    updatedAt: e
  };
}
function Ya(t) {
  if (!t || typeof t != "object") return null;
  const e = "produto" in t && t.produto && typeof t.produto == "object" ? t.produto : t;
  if (!e || typeof e != "object") return null;
  const r = e;
  return !r.id || typeof r.nome != "string" || !r.nome.trim() ? null : r;
}
class yd {
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
    const e = le.get(Ae, At), r = gr.countByIntegrationSource(Ae), a = !e || !e.lastSuccessAt || r === 0, n = a ? "initial" : "incremental", o = a ? void 0 : Rd(e);
    le.markRunning(Ae, At);
    const s = ee(), i = be.start({
      integrationId: Ae,
      resource: At,
      mode: n,
      startedAt: s
    });
    let c = 0, l = 0, d = 0, m = 0, E = (e == null ? void 0 : e.checkpointCursor) ?? null;
    try {
      const _ = kt.getAllExternalIdMap(Ae);
      let A = 1, N = !0;
      for (; N; ) {
        const O = await he.getProducts({
          page: A,
          limit: Ha,
          criterio: hd,
          dataAlteracaoInicial: o
        }), J = Array.isArray(O.data) ? O.data : [], b = J.map(Ya), F = b.filter((h) => h != null);
        if (m += b.length - F.length, F.length === 0) {
          J.length > 0 && console.warn("[SyncProductsFromBlingService] Nenhum produto válido encontrado na página. Exemplo de payload:", J[0]), N = !1;
          break;
        }
        const G = [];
        for (const h of F)
          try {
            const ze = await he.getProductById(h.id), ar = Ya(ze.data) ?? h;
            G.push({ ...h, ...ar }), await yr(120);
          } catch (ze) {
            console.warn(`[SyncProductsFromBlingService] Falha ao buscar detalhe do produto ${h.id}. Usando payload da listagem.`, ze), G.push(h);
          }
        const Ve = ee(), te = G.map((h) => Ld(h, Ve, _)), dt = te.filter((h) => !h.ncm || !h.origin);
        dt.length > 0 && console.warn("[SyncProductsFromBlingService] Produtos sem NCM/origem apos detalhe do Bling:", dt.slice(0, 5).map((h) => ({
          externalId: h.externalId,
          sku: h.sku,
          name: h.name,
          ncm: h.ncm,
          origin: h.origin,
          rawKeys: h.raw && typeof h.raw == "object" ? Object.keys(h.raw) : [],
          tributacao: h.raw && typeof h.raw == "object" ? h.raw.tributacao : void 0
        })));
        for (const h of te)
          h.remoteUpdatedAt && (!E || h.remoteUpdatedAt > E) && (E = h.remoteUpdatedAt);
        const V = te.map((h) => h.externalId), lt = new Set(
          gr.getExternalIdsBySource(Ae, V)
        );
        for (const h of te)
          lt.has(h.externalId) ? d++ : l++;
        te.length > 0 && gr.upsertMany(te), c += J.length, J.length < Ha ? N = !1 : (A++, await yr(350));
      }
      const C = ee();
      return le.markSuccess(
        Ae,
        At,
        E ?? oo(C)
      ), be.finish({
        id: i,
        status: "success",
        finishedAt: C,
        itemsProcessed: c,
        itemsCreated: l,
        itemsUpdated: d,
        itemsFailed: m
      }), { mode: n, processed: c, created: l, updated: d, failed: m };
    } catch (_) {
      const A = ee(), N = _ instanceof Error ? _.message : String(_);
      throw le.markError(Ae, At, N), be.finish({
        id: i,
        status: "failed",
        finishedAt: A,
        itemsProcessed: c,
        itemsCreated: l,
        itemsUpdated: d,
        itemsFailed: m,
        errorMessage: N
      }), _;
    }
  }
}
const so = new yd();
class Od {
  async execute() {
    const e = await no.execute(), r = await so.execute();
    return { categories: e, products: r };
  }
}
const bd = new Od();
function Ud() {
  p.handle("integrations:status", async (t, e) => (g("integrations:manage"), e !== "bling" ? { connected: !1 } : await $t.getStatus())), p.handle("integrations:connect", async (t, e) => {
    if (g("integrations:manage"), e !== "bling")
      return { success: !1, message: `Integração ${e} ainda não implementada.` };
    try {
      return await $t.connect();
    } catch (r) {
      return console.error("[integrations:connect]", r), { success: !1, message: r instanceof Error ? r.message : "Erro ao conectar com o Bling." };
    }
  }), p.handle("integrations:disconnect", async (t, e) => {
    if (g("integrations:manage"), e !== "bling")
      return { success: !1, message: `Integração ${e} ainda não implementada.` };
    try {
      return await $t.disconnect();
    } catch (r) {
      return console.error("[integrations:disconnect]", r), { success: !1, message: r instanceof Error ? r.message : "Erro ao desconectar Bling." };
    }
  }), p.handle("integrations:bling:sync-all", async () => {
    g("integrations:manage");
    try {
      return { success: !0, ...await bd.execute() };
    } catch (t) {
      return console.error("[integrations:bling:sync-all]", t), {
        success: !1,
        message: t instanceof Error ? t.message : "Erro ao sincronizar."
      };
    }
  }), p.handle("integrations:bling:sync", async () => {
    g("integrations:manage");
    try {
      return { success: !0, ...await so.execute() };
    } catch (t) {
      return console.error("[integrations:bling:sync]", t), {
        success: !1,
        message: t instanceof Error ? t.message : "Erro ao sincronizar produtos."
      };
    }
  }), p.handle("integrations:bling:sync-categories", async () => {
    g("integrations:manage");
    try {
      return { success: !0, ...await no.execute() };
    } catch (t) {
      return console.error("[integrations:bling:sync-categories]", t), {
        success: !1,
        message: t instanceof Error ? t.message : "Erro ao sincronizar categorias."
      };
    }
  }), p.handle("integrations:bling:sync-status", () => (g("integrations:manage"), le.get("bling", "products"))), p.handle("integrations:bling:sync-status-categories", () => (g("integrations:manage"), le.get("bling", "categories"))), p.handle("integrations:bling:sync-logs", () => (g("integrations:manage"), be.listByIntegration("bling", "products", 10))), p.handle("integrations:bling:sync-logs-categories", () => (g("integrations:manage"), be.listByIntegration("bling", "categories", 10))), p.handle("integrations:bling:test", async () => (g("integrations:manage"), await he.getProducts({ page: 1, limit: 5 }))), p.handle("integrations:bling:debug-product", async (t, e) => {
    if (g("integrations:manage"), e != null && e.id)
      return await he.getProductById(e.id);
    if (e != null && e.code) {
      const r = await he.getProductByCode(e.code), a = Array.isArray(r.data) ? r.data[0] : null;
      return a != null && a.id ? {
        list: r,
        detail: await he.getProductById(a.id)
      } : { data: null, list: r };
    }
    throw new Error("Informe id ou code para diagnosticar produto do Bling.");
  }), p.handle("integrations:bling:test-categories", async () => (g("integrations:manage"), await he.getCategories({ page: 1, limit: 5 }))), p.handle("integrations:bling:test-icmp", async () => (g("integrations:manage"), await he.ping()));
}
const io = import.meta.dirname;
process.env.APP_ROOT = R.join(io, "..");
const P = process.env.VITE_DEV_SERVER_URL, zd = R.join(process.env.APP_ROOT, "dist-electron"), co = R.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = P ? R.join(process.env.APP_ROOT, "public") : co;
let ae = null;
function uo() {
  ae = new H({
    icon: R.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: R.join(io, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), ae.webContents.on("did-finish-load", () => {
    ae == null || ae.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), ae.webContents.on("did-fail-load", (t, e, r) => {
    f.error(`Renderer falhou ao carregar: [${e}] ${r}`);
  }), ae.webContents.on("render-process-gone", (t, e) => {
    f.error(`Renderer process encerrado: ${e.reason}`);
  }), P ? ae.loadURL(P) : ae.loadFile(R.join(co, "index.html")), ae.maximize(), ae.on(
    "close",
    () => {
    }
  );
}
_e.on("before-quit", () => {
  const t = Wr();
  t && ao(t);
});
_e.on("window-all-closed", () => {
  process.platform !== "darwin" && (_e.quit(), ae = null);
});
_e.on("activate", () => {
  H.getAllWindows().length === 0 && uo();
});
p.on("app:fechar-janela", () => {
  const t = H.getFocusedWindow();
  t && t.close();
});
p.handle("app:quit-with-confirm", async () => {
  f.info("Encerramento solicitado pelo usuário");
  const { response: t } = await Qa.showMessageBox({
    type: "question",
    buttons: ["Cancelar", "Sair"],
    defaultId: 1,
    cancelId: 0,
    message: "Tem certeza que deseja sair do sistema?"
  });
  return t === 1 ? (_e.quit(), !0) : !1;
});
_e.whenReady().then(() => {
  es(), Su(), ed(), qu(), Zu(), td(), rd(), ad(), nd(), od(), Ud(), uo(), f.info("Criado janela principal do App");
});
export {
  zd as MAIN_DIST,
  co as RENDERER_DIST,
  P as VITE_DEV_SERVER_URL
};
