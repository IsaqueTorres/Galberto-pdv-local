var gs = Object.defineProperty;
var hs = (t, e, r) => e in t ? gs(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var he = (t, e, r) => hs(t, typeof e != "symbol" ? e + "" : e, r);
import { app as Ae, ipcMain as p, BrowserWindow as W, shell as Gn, dialog as Vn } from "electron";
import * as Br from "fs";
import Nr from "fs";
import la from "path";
import Is from "os";
import Hn from "crypto";
import * as _e from "node:fs";
import * as Xe from "node:path";
import y from "node:path";
import Cs from "better-sqlite3";
import Ea, { randomUUID as ma, X509Certificate as Ba, createHash as zn, createSign as Ds } from "node:crypto";
import { execFileSync as vs } from "node:child_process";
import * as Ss from "node:https";
import Rs from "node:http";
import { URL as aa } from "node:url";
var Fe = { exports: {} };
const na = Nr, Ar = la, Ls = Is, Os = Hn, Xa = [
  "◈ encrypted .env [www.dotenvx.com]",
  "◈ secrets for agents [www.dotenvx.com]",
  "⌁ auth for agents [www.vestauth.com]",
  "⌘ custom filepath { path: '/custom/path/.env' }",
  "⌘ enable debugging { debug: true }",
  "⌘ override existing { override: true }",
  "⌘ suppress logs { quiet: true }",
  "⌘ multiple files { path: ['.env.local', '.env'] }"
];
function ys() {
  return Xa[Math.floor(Math.random() * Xa.length)];
}
function It(t) {
  return typeof t == "string" ? !["false", "0", "no", "off", ""].includes(t.toLowerCase()) : !!t;
}
function bs() {
  return process.stdout.isTTY;
}
function Us(t) {
  return bs() ? `\x1B[2m${t}\x1B[0m` : t;
}
const ws = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function Fs(t) {
  const e = {};
  let r = t.toString();
  r = r.replace(/\r\n?/mg, `
`);
  let a;
  for (; (a = ws.exec(r)) != null; ) {
    const n = a[1];
    let o = a[2] || "";
    o = o.trim();
    const s = o[0];
    o = o.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), s === '"' && (o = o.replace(/\\n/g, `
`), o = o.replace(/\\r/g, "\r")), e[n] = o;
  }
  return e;
}
function Ms(t) {
  t = t || {};
  const e = Kn(t);
  t.path = e;
  const r = z.configDotenv(t);
  if (!r.parsed) {
    const s = new Error(`MISSING_DATA: Cannot parse ${e} for an unknown reason`);
    throw s.code = "MISSING_DATA", s;
  }
  const a = Yn(t).split(","), n = a.length;
  let o;
  for (let s = 0; s < n; s++)
    try {
      const i = a[s].trim(), u = Ps(r, i);
      o = z.decrypt(u.ciphertext, u.key);
      break;
    } catch (i) {
      if (s + 1 >= n)
        throw i;
    }
  return z.parse(o);
}
function xs(t) {
  console.error(`⚠ ${t}`);
}
function jt(t) {
  console.log(`┆ ${t}`);
}
function jn(t) {
  console.log(`◇ ${t}`);
}
function Yn(t) {
  return t && t.DOTENV_KEY && t.DOTENV_KEY.length > 0 ? t.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function Ps(t, e) {
  let r;
  try {
    r = new URL(e);
  } catch (i) {
    if (i.code === "ERR_INVALID_URL") {
      const u = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw u.code = "INVALID_DOTENV_KEY", u;
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
function Kn(t) {
  let e = null;
  if (t && t.path && t.path.length > 0)
    if (Array.isArray(t.path))
      for (const r of t.path)
        na.existsSync(r) && (e = r.endsWith(".vault") ? r : `${r}.vault`);
    else
      e = t.path.endsWith(".vault") ? t.path : `${t.path}.vault`;
  else
    e = Ar.resolve(process.cwd(), ".env.vault");
  return na.existsSync(e) ? e : null;
}
function ka(t) {
  return t[0] === "~" ? Ar.join(Ls.homedir(), t.slice(1)) : t;
}
function Bs(t) {
  const e = It(process.env.DOTENV_CONFIG_DEBUG || t && t.debug), r = It(process.env.DOTENV_CONFIG_QUIET || t && t.quiet);
  (e || !r) && jn("loading env from encrypted .env.vault");
  const a = z._parseVault(t);
  let n = process.env;
  return t && t.processEnv != null && (n = t.processEnv), z.populate(n, a, t), { parsed: a };
}
function Xs(t) {
  const e = Ar.resolve(process.cwd(), ".env");
  let r = "utf8", a = process.env;
  t && t.processEnv != null && (a = t.processEnv);
  let n = It(a.DOTENV_CONFIG_DEBUG || t && t.debug), o = It(a.DOTENV_CONFIG_QUIET || t && t.quiet);
  t && t.encoding ? r = t.encoding : n && jt("no encoding is specified (UTF-8 is used by default)");
  let s = [e];
  if (t && t.path)
    if (!Array.isArray(t.path))
      s = [ka(t.path)];
    else {
      s = [];
      for (const l of t.path)
        s.push(ka(l));
    }
  let i;
  const u = {};
  for (const l of s)
    try {
      const E = z.parse(na.readFileSync(l, { encoding: r }));
      z.populate(u, E, t);
    } catch (E) {
      n && jt(`failed to load ${l} ${E.message}`), i = E;
    }
  const c = z.populate(a, u, t);
  if (n = It(a.DOTENV_CONFIG_DEBUG || n), o = It(a.DOTENV_CONFIG_QUIET || o), n || !o) {
    const l = Object.keys(c).length, E = [];
    for (const m of s)
      try {
        const f = Ar.relative(process.cwd(), m);
        E.push(f);
      } catch (f) {
        n && jt(`failed to load ${m} ${f.message}`), i = f;
      }
    jn(`injected env (${l}) from ${E.join(",")} ${Us(`// tip: ${ys()}`)}`);
  }
  return i ? { parsed: u, error: i } : { parsed: u };
}
function ks(t) {
  if (Yn(t).length === 0)
    return z.configDotenv(t);
  const e = Kn(t);
  return e ? z._configVault(t) : (xs(`you set DOTENV_KEY but you are missing a .env.vault file at ${e}`), z.configDotenv(t));
}
function $s(t, e) {
  const r = Buffer.from(e.slice(-64), "hex");
  let a = Buffer.from(t, "base64");
  const n = a.subarray(0, 12), o = a.subarray(-16);
  a = a.subarray(12, -16);
  try {
    const s = Os.createDecipheriv("aes-256-gcm", r, n);
    return s.setAuthTag(o), `${s.update(a)}${s.final()}`;
  } catch (s) {
    const i = s instanceof RangeError, u = s.message === "Invalid key length", c = s.message === "Unsupported state or unable to authenticate data";
    if (i || u) {
      const l = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw l.code = "INVALID_DOTENV_KEY", l;
    } else if (c) {
      const l = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw l.code = "DECRYPTION_FAILED", l;
    } else
      throw s;
  }
}
function qs(t, e, r = {}) {
  const a = !!(r && r.debug), n = !!(r && r.override), o = {};
  if (typeof e != "object") {
    const s = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw s.code = "OBJECT_REQUIRED", s;
  }
  for (const s of Object.keys(e))
    Object.prototype.hasOwnProperty.call(t, s) ? (n === !0 && (t[s] = e[s], o[s] = e[s]), a && jt(n === !0 ? `"${s}" is already defined and WAS overwritten` : `"${s}" is already defined and was NOT overwritten`)) : (t[s] = e[s], o[s] = e[s]);
  return o;
}
const z = {
  configDotenv: Xs,
  _configVault: Bs,
  _parseVault: Ms,
  config: ks,
  decrypt: $s,
  parse: Fs,
  populate: qs
};
Fe.exports.configDotenv = z.configDotenv;
Fe.exports._configVault = z._configVault;
Fe.exports._parseVault = z._parseVault;
Fe.exports.config = z.config;
Fe.exports.decrypt = z.decrypt;
Fe.exports.parse = z.parse;
Fe.exports.populate = z.populate;
Fe.exports = z;
var Gs = Fe.exports;
const nt = {};
process.env.DOTENV_CONFIG_ENCODING != null && (nt.encoding = process.env.DOTENV_CONFIG_ENCODING);
process.env.DOTENV_CONFIG_PATH != null && (nt.path = process.env.DOTENV_CONFIG_PATH);
process.env.DOTENV_CONFIG_QUIET != null && (nt.quiet = process.env.DOTENV_CONFIG_QUIET);
process.env.DOTENV_CONFIG_DEBUG != null && (nt.debug = process.env.DOTENV_CONFIG_DEBUG);
process.env.DOTENV_CONFIG_OVERRIDE != null && (nt.override = process.env.DOTENV_CONFIG_OVERRIDE);
process.env.DOTENV_CONFIG_DOTENV_KEY != null && (nt.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY);
var Vs = nt;
const Hs = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
var zs = function(e) {
  const r = e.reduce(function(a, n) {
    const o = n.match(Hs);
    return o && (a[o[1]] = o[2]), a;
  }, {});
  return "quiet" in r || (r.quiet = "true"), r;
};
(function() {
  Gs.config(
    Object.assign(
      {},
      Vs,
      zs(process.argv)
    )
  );
})();
const oa = la.join(Ae.getPath("userData"), "logs");
Nr.existsSync(oa) || Nr.mkdirSync(oa, { recursive: !0 });
function Xr(t, e) {
  const a = (/* @__PURE__ */ new Date()).toLocaleString("sv-SE", {
    timeZone: "America/Sao_Paulo"
  }).replace(" ", "T"), n = `${a} [${t}] ${e}
`, o = `${a.slice(0, 10)}.log`, s = la.join(oa, o);
  Nr.appendFileSync(s, n, { encoding: "utf-8" });
}
const _ = {
  info: (t) => Xr("INFO", t),
  warn: (t) => Xr("WARN", t),
  error: (t) => Xr("ERROR", t)
};
function Sr(t) {
  return Hn.createHash("sha256").update(t).digest("hex");
}
function js(t, e) {
  return Sr(t) === e;
}
function Ys(t, e) {
  const r = d.prepare(`
    SELECT id, nome, funcao, email, username, password, ativo
    FROM usuarios
    WHERE username = ?
    LIMIT 1
  `).get(t);
  if (!r)
    throw new Error("Usuário inválido");
  if (!js(e, r.password))
    throw new Error("Senha inválida");
  if (!r.ativo)
    throw new Error("Usuário desabilitado");
  const a = d.transaction(() => {
    d.prepare(`
      UPDATE sessions
      SET active = 0,
          logout_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND active = 1
    `).run(r.id);
    const n = d.prepare(`
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
const Wn = "2026-04-16-fiscal-persistence-v1";
function Ks(t) {
  t.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      executed_at TEXT NOT NULL
    );
  `);
}
function Ws(t, e) {
  return !!t.prepare("SELECT 1 FROM schema_migrations WHERE id = ? LIMIT 1").get(e);
}
function je(t, e, r) {
  return t.prepare(`PRAGMA table_info(${e})`).all().some((n) => n.name === r);
}
function Qs(t) {
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
    `), t.prepare("INSERT INTO schema_migrations (id, executed_at) VALUES (?, CURRENT_TIMESTAMP)").run(Wn);
  })();
}
function Js(t) {
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
function ee(t) {
  if (typeof t != "string") return null;
  const e = t.trim();
  return e.length > 0 ? e : null;
}
function Zs(t) {
  return t === "sefaz-direct" || t === "gateway" || t === "mock" ? t : "mock";
}
function ei(t) {
  return t === "production" || t === "homologation" ? t : null;
}
function ti(t) {
  return t === "online" || t === "offline-contingency" || t === "queue" ? t : "queue";
}
function ri(t) {
  return t === "bypass-homologation-diagnostic" ? t : "strict";
}
function ai(t) {
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
    return _.warn(`[FiscalMigration] Falha ao ler integrations.raw_json fiscal:nfce: ${r instanceof Error ? r.message : String(r)}`), null;
  }
}
function ni(t) {
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
function oi(t) {
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
function si(t) {
  oi(t);
  const e = t.prepare(`
    SELECT id, csc_id, csc_token, default_series
    FROM stores
    WHERE active = 1
    ORDER BY id ASC
    LIMIT 1
  `).get();
  if (!e) {
    _.warn("[FiscalMigration] Nenhuma store ativa encontrada para backfill de fiscal_settings.");
    return;
  }
  if (t.prepare(`
    SELECT id
    FROM fiscal_settings
    WHERE store_id = ? AND active = 1
    LIMIT 1
  `).get(e.id)) {
    _.info(`[FiscalMigration] fiscal_settings ativo ja existe para store=${e.id}; backfill preservado.`);
    return;
  }
  const a = ai(t), n = t.prepare(`
    SELECT cert_tipo, cert_path, cert_password, cert_validade, csc_id, csc_token, serie_nfce
    FROM company
    WHERE ativo = 1
    ORDER BY id ASC
    LIMIT 1
  `).get(), o = ei(a == null ? void 0 : a.environment), s = ee(a == null ? void 0 : a.cscId) ?? ee(n == null ? void 0 : n.csc_id), i = ee(a == null ? void 0 : a.cscToken) ?? ee(n == null ? void 0 : n.csc_token), u = Number((a == null ? void 0 : a.defaultSeries) ?? (n == null ? void 0 : n.serie_nfce) ?? e.default_series ?? 1);
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
    u,
    u,
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
    Zs(a == null ? void 0 : a.provider),
    ti(a == null ? void 0 : a.contingencyMode),
    ee(a == null ? void 0 : a.sefazBaseUrl),
    ee(a == null ? void 0 : a.gatewayBaseUrl),
    ee(a == null ? void 0 : a.gatewayApiKey),
    ee(n == null ? void 0 : n.cert_tipo) ?? "A1",
    ee(a == null ? void 0 : a.certificatePath) ?? ee(n == null ? void 0 : n.cert_path),
    ee(a == null ? void 0 : a.certificatePassword) ?? ee(n == null ? void 0 : n.cert_password),
    ee(a == null ? void 0 : a.certificateValidUntil) ?? ee(n == null ? void 0 : n.cert_validade),
    ee(a == null ? void 0 : a.caBundlePath),
    ri(a == null ? void 0 : a.tlsValidationMode)
  ), _.info(`[FiscalMigration] fiscal_settings criado para store=${e.id} usando integrations/company como origem legada.`);
}
function ii(t) {
  const e = [];
  je(t, "fiscal_documents", "issued_datetime") || e.push("ALTER TABLE fiscal_documents ADD COLUMN issued_datetime TEXT"), je(t, "fiscal_documents", "xml_authorized") || e.push("ALTER TABLE fiscal_documents ADD COLUMN xml_authorized TEXT"), je(t, "fiscal_documents", "xml_cancellation") || e.push("ALTER TABLE fiscal_documents ADD COLUMN xml_cancellation TEXT"), je(t, "sync_queue", "result_json") || e.push("ALTER TABLE sync_queue ADD COLUMN result_json TEXT"), je(t, "sync_queue", "locked_at") || e.push("ALTER TABLE sync_queue ADD COLUMN locked_at TEXT"), je(t, "sync_queue", "locked_by") || e.push("ALTER TABLE sync_queue ADD COLUMN locked_by TEXT"), je(t, "sync_queue", "processed_at") || e.push("ALTER TABLE sync_queue ADD COLUMN processed_at TEXT"), e.length > 0 && t.exec(e.join(`;
`));
}
function ci(t) {
  Ks(t), Ws(t, Wn) || Qs(t), Js(t), ii(t), ni(t), si(t);
}
const Qn = y.join(Ae.getPath("userData"), "superpdv-galberto.db");
console.log("SQLite path: ", Qn);
console.log("isPackaged:", Ae.isPackaged);
console.log("app.getPath(userData):", Ae.getPath("userData"));
console.log("process.cwd():", process.cwd());
const d = new Cs(Qn);
function ui() {
  d.exec("PRAGMA foreign_keys = ON;"), _.info("-> Foreign keys ativadas");
}
function di() {
  d.exec(`
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
  `), _.info("-> Tabela 'tax_profiles' checada/criada");
}
function li() {
  d.exec(`
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
  `), _.info("-> Tabela 'products' checada/criada");
}
function Ei() {
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
  ], e = d.prepare("PRAGMA table_info(products)").all(), r = new Set(e.map((a) => a.name));
  for (const a of t) {
    const [n] = a.split(" ");
    r.has(n) || d.exec(`ALTER TABLE products ADD COLUMN ${a};`);
  }
}
function mi() {
  d.exec(`
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
function pi() {
  d.exec(`
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
  `), _.info("-> Tabela 'categories' checada/criada");
}
function Ti() {
  d.exec(`
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
  `), _.info("-> Tabela 'fornecedores' checada/criada");
}
function _i() {
  d.exec(`
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
  `), _.info("-> Created table customer");
}
function fi() {
  d.exec(`
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
  `), _.info("-> Tabela 'company' checada/criada");
}
function Ni() {
  d.exec(`
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
  `), _.info("-> Tabela 'vendas' checada/criada");
}
function Ai() {
  d.exec(`
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
  `), _.info("-> Tabela 'venda_itens' checada/criada");
}
function gi() {
  d.exec(`
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
  `), _.info("-> Tabela 'sale_item_tax_snapshot' checada/criada");
}
function hi() {
  d.exec(`
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
  `), _.info("-> Tabela 'venda_pagamento' checada/criada");
}
function Ii() {
  d.exec(`
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
  `), _.info("-> Tabela 'printers' checada/criada");
}
function Ci() {
  try {
    d.exec("ALTER TABLE printers ADD COLUMN paper_width_mm REAL NOT NULL DEFAULT 80");
  } catch {
  }
  try {
    d.exec("ALTER TABLE printers ADD COLUMN content_width_mm REAL NOT NULL DEFAULT 76");
  } catch {
  }
  try {
    d.exec("ALTER TABLE printers ADD COLUMN base_font_size_px REAL NOT NULL DEFAULT 13");
  } catch {
  }
  try {
    d.exec("ALTER TABLE printers ADD COLUMN line_height REAL NOT NULL DEFAULT 1.5");
  } catch {
  }
  try {
    d.exec("ALTER TABLE printers ADD COLUMN receipt_settings_json TEXT");
  } catch {
  }
}
function Di() {
  d.exec(`
    CREATE TABLE IF NOT EXISTS printer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    );
  `), _.info("-> Tabela 'printer_logs' checada/criada");
}
function vi() {
  d.exec(`
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
  `), _.info("-> Tabela 'usuarios' checada/criada");
}
function Si() {
  d.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      logout_at DATETIME,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `), _.info("-> Tabela 'sessions' checada/criada");
}
function Ri() {
  var r;
  if (d.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name = 'stock_movements'
  `).get()) {
    const a = d.prepare("PRAGMA table_info(stock_movements)").all(), n = new Set(a.map((i) => i.name)), o = a.find((i) => i.name === "id");
    if (!n.has("type") || !n.has("previous_stock") || ((r = o == null ? void 0 : o.type) == null ? void 0 : r.toUpperCase()) === "INTEGER") {
      const i = `stock_movements_legacy_${Date.now()}`;
      d.exec(`ALTER TABLE stock_movements RENAME TO ${i};`), _.info(`-> Tabela 'stock_movements' legada preservada como '${i}'`);
    }
  }
  d.exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('entry', 'exit', 'adjustment', 'sale', 'sale_cancel')),
      quantity REAL NOT NULL,
      previous_stock REAL NOT NULL,
      new_stock REAL NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT,
      reference_type TEXT,
      reference_id TEXT,
      created_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id
      ON stock_movements(product_id);

    CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at
      ON stock_movements(created_at);

    CREATE INDEX IF NOT EXISTS idx_stock_movements_type
      ON stock_movements(type);
  `), _.info("-> Tabela 'stock_movements' checada/criada");
}
function Li() {
  d.exec(`
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
  `), _.info("-> Tabela 'cash_register_sessions' checada/criada");
}
function Oi() {
  try {
    d.exec("ALTER TABLE cash_register_sessions ADD COLUMN expected_cash_amount REAL");
  } catch {
  }
  try {
    d.exec("ALTER TABLE cash_register_sessions ADD COLUMN closing_difference REAL");
  } catch {
  }
  try {
    d.exec("ALTER TABLE cash_register_sessions ADD COLUMN opening_notes TEXT");
  } catch {
  }
  try {
    d.exec("ALTER TABLE cash_register_sessions ADD COLUMN closing_notes TEXT");
  } catch {
  }
}
function yi() {
  d.exec(`
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
  `), _.info("-> Tabela 'cash_register_movements' checada/criada");
}
function bi() {
  try {
    d.exec("ALTER TABLE venda_pagamento ADD COLUMN cash_session_id INTEGER REFERENCES cash_register_sessions(id)");
  } catch {
  }
  try {
    d.exec("ALTER TABLE venda_pagamento ADD COLUMN valor_recebido REAL NOT NULL DEFAULT 0");
  } catch {
  }
  try {
    d.exec("ALTER TABLE venda_pagamento ADD COLUMN troco REAL NOT NULL DEFAULT 0");
  } catch {
  }
}
function Ui() {
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
    console.log("Criando tabela integrations..."), d.exec(t), console.log("Tabela criada com sucesso!");
    const e = d.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
function wi() {
  d.exec(`
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
  `), _.info("-> Tabela 'printed_documents' checada/criada");
}
function Fi() {
  d.exec(`
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
  `), _.info("-> Tabela 'print_jobs' checada/criada");
}
function Mi() {
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
    console.log("Criando tabela sync_state..."), d.exec(t), console.log("Tabela criada com sucesso!");
    const e = d.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
function xi() {
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
    console.log("Criando tabela sync_logs..."), d.exec(t), console.log("Tabela criada com sucesso!");
    const e = d.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();
    console.log("Tabela existe?", e);
  } catch (t) {
    console.error("Erro ao criar tabela:", t);
  }
}
li();
di();
Ei();
mi();
pi();
_i();
vi();
Ti();
Ni();
Ai();
fi();
Ii();
Ci();
Di();
Si();
gi();
Ri();
hi();
bi();
Li();
Oi();
yi();
Ui();
Mi();
xi();
wi();
Fi();
ci(d);
function Jn() {
  const t = d.prepare(`
    SELECT ambiente_emissao, serie_nfce
    FROM company
    WHERE ativo = 1
    LIMIT 1
  `).get(), e = (t == null ? void 0 : t.ambiente_emissao) ?? 2, r = (t == null ? void 0 : t.serie_nfce) ?? 1, a = d.prepare(`
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
function Pi(t) {
  const e = d.prepare(`
    SELECT id, barcode, name, unit, sale_price_cents, ncm, cfop, origin, cest
    FROM products
    WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL AND active = 1
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
function Bi() {
  return d.prepare(`
    SELECT origin_code, cfop_padrao_saida_interna, csosn, icms_cst, pis_cst, cofins_cst
    FROM tax_profiles
    WHERE ativo = 1
    ORDER BY id ASC
    LIMIT 1
  `).get();
}
function Xi(t) {
  const e = Bi(), r = t.originCode || (e == null ? void 0 : e.origin_code) || "0", a = t.cfop || (e == null ? void 0 : e.cfop_padrao_saida_interna) || "5102", n = (e == null ? void 0 : e.pis_cst) || "49", o = (e == null ? void 0 : e.cofins_cst) || "49", s = (e == null ? void 0 : e.csosn) || "102", i = (e == null ? void 0 : e.icms_cst) ?? null;
  d.prepare(`
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
function Zn(t, e) {
  d.prepare("DELETE FROM venda_itens WHERE venda_id = ?").run(t);
  const r = d.prepare(`
    INSERT INTO venda_itens(
      venda_id, produto_id, codigo_produto, nome_produto, gtin, gtin_tributavel,
      ncm, cfop, cest, unidade_comercial, quantidade_comercial, valor_unitario_comercial,
      unidade_tributavel, quantidade_tributavel, valor_unitario_tributavel,
      valor_bruto, valor_desconto, subtotal
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of e) {
    const n = Pi(a.produto_id), o = Number(a.quantidade ?? a.estoque_atual ?? 0), s = Number(a.preco_venda ?? n.precoUnitario), i = Number(a.valor_bruto ?? o * s), u = Math.max(0, Math.min(Number(a.valor_desconto ?? 0), i)), c = Number(a.subtotal ?? Math.max(i - u, 0)), l = r.run(
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
      u,
      c
    );
    Xi({
      saleItemId: Number(l.lastInsertRowid),
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
function $a(t, e, r) {
  const a = Jn(), n = Number(t.valor_produtos ?? t.total ?? 0), o = Number(t.valor_desconto ?? 0), s = Number(t.total ?? 0);
  return d.transaction(() => {
    let u = r ?? null;
    return u ? d.prepare(`
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
      u
    ) : u = d.prepare(`
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
    ).lastInsertRowid, Zn(u, t.itens), u;
  })();
}
function ki(t) {
  return {
    DINHEIRO: "01",
    CHEQUE: "02",
    CREDITO: "03",
    DEBITO: "04",
    VOUCHER: "10",
    PIX: "17"
  }[t] ?? "99";
}
function Yt(t) {
  const r = d.prepare(`
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
function $i(t, e) {
  if (!(e != null && e.meioPagamento))
    return;
  const r = d.prepare(`
    SELECT valor_total
    FROM vendas
    WHERE id = ?
    LIMIT 1
  `).get(t);
  if (!r)
    throw new Error(`Venda não encontrada para registrar pagamento: ${t}`);
  d.prepare("DELETE FROM venda_pagamento WHERE venda_id = ?").run(t);
  const a = Number(r.valor_total ?? 0), n = Number(e.troco ?? 0), o = e.meioPagamento === "DINHEIRO" ? Number(e.valorPago ?? a) : a;
  d.prepare(`
    INSERT INTO venda_pagamento(
      venda_id, cash_session_id, tpag, valor, valor_recebido, troco, descricao_outro
    )
    VALUES(?, ?, ?, ?, ?, ?, ?)
  `).run(
    t,
    e.cashSessionId ?? null,
    ki(e.meioPagamento),
    a,
    o,
    n,
    null
  );
}
function qi(t) {
  d.prepare("BEGIN").run();
  try {
    const e = Jn(), r = Number(t.valor_produtos ?? t.total ?? 0), a = Number(t.valor_desconto ?? 0), n = Number(t.total ?? 0), s = d.prepare(`
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
    return Zn(s, t.itens), d.prepare("COMMIT").run(), { sucesso: !0, vendaId: s };
  } catch (e) {
    throw d.prepare("ROLLBACK").run(), e;
  }
}
function Gi(t) {
  const e = typeof t == "number" ? t : t.vendaId, r = d.prepare(
    `SELECT produto_id, quantidade_comercial AS quantidade
     FROM venda_itens
     WHERE venda_id = ? `
  ), a = d.prepare(
    `SELECT current_stock
     FROM products
     WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL
     LIMIT 1`
  ), n = d.prepare(
    `UPDATE products
     SET current_stock = current_stock - ?,
         updated_at = datetime('now')
     WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL`
  ), o = d.prepare(
    `UPDATE produtos
     SET estoque_atual = estoque_atual - ?,
         updated_at = datetime('now')
     WHERE id = ?`
  ), s = d.prepare(
    `SELECT valor_produtos, valor_desconto, valor_total
     FROM vendas
     WHERE id = ?
     LIMIT 1`
  ), i = d.prepare(
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
  d.transaction(() => {
    const c = r.all(e), l = s.get(e);
    if (!l)
      throw new Error(`Venda não encontrada: ${e}`);
    for (const S of c) {
      const U = a.get(S.produto_id);
      if (!U)
        throw new Error(`Produto da venda não encontrado: ${S.produto_id}`);
      const F = Number(U.current_stock ?? 0), j = Number(S.quantidade ?? 0);
      if (F < j)
        throw new Error(`Estoque insuficiente para o produto ${S.produto_id}`);
      const ue = F - j;
      n.run(j, S.produto_id), o.run(j, S.produto_id), to({
        productId: S.produto_id,
        type: "sale",
        quantity: j,
        previousStock: F,
        newStock: ue,
        reason: "Venda",
        notes: null,
        referenceType: "sale",
        referenceId: String(e)
      });
    }
    const E = Number(typeof t == "number" ? l.valor_produtos ?? 0 : t.valorProdutos ?? l.valor_produtos ?? 0), m = Number(typeof t == "number" ? l.valor_desconto ?? 0 : t.valorDesconto ?? l.valor_desconto ?? 0), f = Number(typeof t == "number" ? l.valor_total ?? 0 : t.valorTotal ?? l.valor_total ?? 0), C = typeof t == "number" ? 0 : Number(t.troco ?? 0);
    i.run(
      E,
      m,
      f,
      C,
      e
    ), $i(
      e,
      typeof t == "number" ? void 0 : t
    );
  })();
}
function Vi(t) {
  var n;
  const r = d.prepare(`
    INSERT INTO cash_register_sessions
      (operator_id, pdv_id, status, opening_cash_amount, opening_notes, opened_at)
    VALUES(?, ?, 'OPEN', ?, ?, datetime('now'))
      `).run(
    t.operator_id,
    t.pdv_id,
    t.opening_cash_amount,
    ((n = t.opening_notes) == null ? void 0 : n.trim()) || null
  ), a = Yt(r.lastInsertRowid);
  if (!a)
    throw new Error("Sessão de caixa não encontrada após abertura.");
  return a;
}
function Hi(t) {
  var o;
  if (!d.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE id = ?
      AND operator_id = ?
      AND pdv_id = ?
      AND status = 'OPEN'
    LIMIT 1
  `).get(t.cash_session_id, t.operator_id, t.pdv_id))
    throw new Error("Nenhum caixa aberto foi encontrado para registrar a sangria.");
  const r = Yt(t.cash_session_id);
  if (!r)
    throw new Error("Sessão de caixa inválida para sangria.");
  const a = Number(t.amount ?? 0);
  if (a <= 0)
    throw new Error("Informe um valor válido para a sangria.");
  if (a > Number(r.expected_cash_amount ?? 0))
    throw new Error("A sangria não pode ser maior que o valor disponível em caixa.");
  d.prepare(`
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
  const n = Yt(t.cash_session_id);
  if (!n)
    throw new Error("Não foi possível recarregar a sessão após a sangria.");
  return n;
}
function zi(t) {
  var o;
  if (d.prepare(`
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
  const a = d.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE operator_id = ?
      AND pdv_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(t.operator_id, t.pdv_id);
  if (!a)
    throw new Error("Sessão de caixa não encontrada após o fechamento.");
  const n = Yt(a.id);
  if (!n)
    throw new Error("Resumo da sessão de caixa não encontrado após o fechamento.");
  return n;
}
function ji({ venda_id: t, data: e, status: r, page: a = 1, limit: n = 20 }) {
  const o = (a - 1) * n;
  let s = [], i = [];
  const u = { 1: "FINALIZADA", 2: "CANCELADA", 3: "ABERTA_PAGAMENTO", 4: "ORCAMENTO", 5: "PAUSADA" };
  t && (s.push("CAST(id AS TEXT) LIKE ?"), i.push(`%${t}%`)), e && (s.push("date(data_emissao) = date(?)"), i.push(e)), r !== void 0 && (s.push("status = ?"), i.push(u[r]));
  const c = s.length ? `WHERE ${s.join(" AND ")} ` : "", l = d.prepare(`
    SELECT * FROM vendas
      ${c}
      ORDER BY id DESC
    LIMIT ? OFFSET ?
      `).all(...i, n, o), E = d.prepare(`
      SELECT COUNT(*) as total
      FROM vendas
      ${c}
    `).get(...i);
  return {
    data: l,
    page: a,
    limit: n,
    total: E.total
  };
}
function Yi(t) {
  const e = d.prepare(`
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
  const r = d.prepare(`
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
function Ki({ nome: t, codigo: e, ativo: r, page: a = 1, limit: n = 20 }) {
  const o = (a - 1) * n;
  let s = ["integration_source = 'local'", "deleted_at IS NULL"], i = [];
  t && (s.push("name LIKE ?"), i.push(`%${t}%`)), e && (s.push("(barcode LIKE ? OR sku LIKE ?)"), i.push(`%${e}%`, `%${e}%`)), r !== void 0 && (s.push("active = ?"), i.push(r));
  const u = d.prepare(`
      SELECT
        id,
        sku,
        barcode AS codigo_barras,
        name AS nome,
        ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
        current_stock AS estoque_atual,
        active AS ativo
      FROM products
      WHERE ${s.join(" AND ")}
      ORDER BY name
    LIMIT ? OFFSET ?
      `).all(...i, n, o), c = d.prepare(`
      SELECT COUNT(*) as total
      FROM products
      WHERE ${s.join(" AND ")}
    `).get(...i);
  return {
    data: u,
    page: a,
    limit: n,
    total: c.total
  };
}
function pa(t) {
  return d.prepare(`
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
      COALESCE(category_lookup.local_category_name, product_category_name) AS product_category_name,
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
    LEFT JOIN (
      SELECT id AS cat_join_id, name AS local_category_name
      FROM categories
    ) category_lookup ON category_lookup.cat_join_id = products.category_id
    WHERE products.id = ? AND products.integration_source = 'local' AND products.deleted_at IS NULL
    LIMIT 1;
  `).get(t);
}
function B(t) {
  if (t == null) return null;
  const e = String(t).trim();
  return e.length > 0 ? e : null;
}
function rt(t, e = 0) {
  const r = Number(t);
  return Number.isFinite(r) ? r : e;
}
function eo(t) {
  return d.prepare(`
    SELECT
      id,
      name,
      sku,
      barcode,
      unit,
      current_stock,
      minimum_stock,
      maximum_stock,
      active,
      deleted_at,
      integration_source
    FROM products
    WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL
    LIMIT 1
  `).get(t);
}
function to(t) {
  const e = (/* @__PURE__ */ new Date()).toISOString();
  return d.prepare(`
    INSERT INTO stock_movements (
      id, product_id, type, quantity, previous_stock, new_stock,
      reason, notes, reference_type, reference_id, created_at, deleted_at
    ) VALUES (
      @id, @product_id, @type, @quantity, @previous_stock, @new_stock,
      @reason, @notes, @reference_type, @reference_id, @created_at, NULL
    )
  `).run({
    id: ma(),
    product_id: t.productId,
    type: t.type,
    quantity: t.quantity,
    previous_stock: t.previousStock,
    new_stock: t.newStock,
    reason: t.reason,
    notes: B(t.notes),
    reference_type: t.referenceType ?? null,
    reference_id: t.referenceId ?? null,
    created_at: e
  }), e;
}
function Wi({
  term: t,
  stockFilter: e = "all",
  active: r,
  page: a = 1,
  limit: n = 100
} = {}) {
  const o = (a - 1) * n, s = ["p.integration_source = 'local'", "p.deleted_at IS NULL"], i = [];
  if (t != null && t.trim()) {
    s.push("(LOWER(p.name) LIKE LOWER(?) OR LOWER(COALESCE(p.sku, '')) LIKE LOWER(?) OR LOWER(COALESCE(p.barcode, '')) LIKE LOWER(?))");
    const l = `%${t.trim()}%`;
    i.push(l, l, l);
  }
  r !== void 0 && (s.push("p.active = ?"), i.push(r)), e === "low" && s.push("p.minimum_stock > 0 AND p.current_stock <= p.minimum_stock"), e === "out" && s.push("p.current_stock <= 0");
  const u = d.prepare(`
    SELECT
      p.id,
      p.name,
      p.sku,
      p.barcode,
      p.unit,
      p.current_stock,
      p.minimum_stock,
      p.maximum_stock,
      p.active,
      p.category_id,
      c.name AS category_name,
      p.updated_at
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${s.join(" AND ")}
    ORDER BY p.name
    LIMIT ? OFFSET ?
  `).all(...i, n, o), c = d.prepare(`
    SELECT COUNT(*) AS total
    FROM products p
    WHERE ${s.join(" AND ")}
  `).get(...i);
  return { data: u, page: a, limit: n, total: c.total };
}
function ro(t) {
  const e = eo(t);
  if (!e) throw new Error("Produto local não encontrado.");
  return e;
}
function Qi(t) {
  const e = B(t.productId);
  if (!e) throw new Error("Produto inválido.");
  const r = B(t.reason);
  if (!r) throw new Error("Informe uma justificativa.");
  const a = t.type;
  if (!["entry", "exit", "adjustment"].includes(a))
    throw new Error("Tipo de movimentação inválido.");
  return d.transaction(() => {
    const o = eo(e);
    if (!o) throw new Error("Produto local não encontrado.");
    if (Number(o.active) !== 1) throw new Error("Não é possível movimentar estoque de produto inativo.");
    const s = Number(o.current_stock ?? 0);
    let i = 0, u = s;
    if (a === "entry") {
      if (i = rt(t.quantity, NaN), !Number.isFinite(i) || i <= 0)
        throw new Error("Informe uma quantidade maior que zero.");
      u = s + i;
    }
    if (a === "exit") {
      if (i = rt(t.quantity, NaN), !Number.isFinite(i) || i <= 0)
        throw new Error("Informe uma quantidade maior que zero.");
      if (u = s - i, u < 0) throw new Error("Não é possível deixar estoque negativo.");
    }
    if (a === "adjustment") {
      if (u = rt(t.newStock, NaN), !Number.isFinite(u) || u < 0)
        throw new Error("Informe um novo saldo válido.");
      i = u - s;
    }
    return to({
      productId: e,
      type: a,
      quantity: i,
      previousStock: s,
      newStock: u,
      reason: r,
      notes: t.notes,
      referenceType: "manual",
      referenceId: null
    }), d.prepare(`
      UPDATE products
      SET current_stock = ?, updated_at = ?
      WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL
    `).run(u, (/* @__PURE__ */ new Date()).toISOString(), e), d.prepare(`
      UPDATE produtos
      SET estoque_atual = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(u, e), ro(e);
  })();
}
function ao({
  productId: t,
  type: e,
  page: r = 1,
  limit: a = 100
} = {}) {
  const n = (r - 1) * a, o = ["sm.deleted_at IS NULL"], s = [];
  t && (o.push("sm.product_id = ?"), s.push(t)), e && (o.push("sm.type = ?"), s.push(e));
  const i = d.prepare(`
    SELECT
      sm.id,
      sm.product_id,
      p.name AS product_name,
      p.sku,
      p.barcode,
      sm.type,
      sm.quantity,
      sm.previous_stock,
      sm.new_stock,
      sm.reason,
      sm.notes,
      sm.reference_type,
      sm.reference_id,
      sm.created_at
    FROM stock_movements sm
    INNER JOIN products p ON p.id = sm.product_id
    WHERE ${o.join(" AND ")}
      AND p.integration_source = 'local'
    ORDER BY sm.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...s, a, n), u = d.prepare(`
    SELECT COUNT(*) AS total
    FROM stock_movements sm
    INNER JOIN products p ON p.id = sm.product_id
    WHERE ${o.join(" AND ")}
      AND p.integration_source = 'local'
  `).get(...s);
  return { data: i, page: r, limit: a, total: u.total };
}
function Ji(t, e = {}) {
  return ao({ ...e, productId: t });
}
function no(t) {
  const e = B(t.name);
  if (!e) throw new Error("Informe o nome do produto.");
  const r = Math.round(rt(t.sale_price_cents, NaN));
  if (!Number.isFinite(r) || r < 0)
    throw new Error("Informe um preço de venda válido.");
  return {
    ...t,
    name: e,
    sale_price_cents: r,
    cost_price_cents: Math.round(rt(t.cost_price_cents)),
    minimum_stock: rt(t.minimum_stock),
    maximum_stock: t.maximum_stock === null || t.maximum_stock === void 0 || t.maximum_stock === "" ? null : rt(t.maximum_stock),
    active: t.active === !1 || t.active === 0 ? 0 : 1,
    unit: B(t.unit) ?? "UN",
    category_id: B(t.category_id),
    sku: B(t.sku),
    barcode: B(t.barcode),
    ncm: B(t.ncm),
    cfop: B(t.cfop),
    origin: B(t.origin),
    notes: B(t.notes),
    situation: B(t.situation),
    supplier_code: B(t.supplier_code),
    supplier_name: B(t.supplier_name),
    location: B(t.location),
    brand: B(t.brand),
    product_group: B(t.product_group),
    cest: B(t.cest),
    short_description: B(t.short_description),
    complementary_description: B(t.complementary_description),
    additional_info: B(t.additional_info)
  };
}
function Zi(t) {
  const e = no(t), r = ma(), a = (/* @__PURE__ */ new Date()).toISOString();
  return d.prepare(`
    INSERT INTO products (
      id, external_id, integration_source, sku, barcode, category_id, name, unit,
      sale_price_cents, cost_price_cents, current_stock, minimum_stock, active,
      sync_status, raw_json, ncm, cfop, origin, notes, situation, supplier_code,
      supplier_name, location, maximum_stock, complementary_description,
      product_group, brand, cest, short_description, additional_info,
      created_at, updated_at, deleted_at
    ) VALUES (
      @id, NULL, 'local', @sku, @barcode, @category_id, @name, @unit,
      @sale_price_cents, @cost_price_cents, 0, @minimum_stock, @active,
      'local', @raw_json, @ncm, @cfop, @origin, @notes, @situation, @supplier_code,
      @supplier_name, @location, @maximum_stock, @complementary_description,
      @product_group, @brand, @cest, @short_description, @additional_info,
      @created_at, @updated_at, NULL
    )
  `).run({
    ...e,
    id: r,
    raw_json: JSON.stringify({ source: "local", createdManually: !0 }),
    created_at: a,
    updated_at: a
  }), pa(r);
}
function ec(t, e) {
  if (!d.prepare(`
    SELECT id FROM products
    WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL
    LIMIT 1
  `).get(t)) throw new Error("Produto local não encontrado ou não editável.");
  const a = no(e);
  return d.prepare(`
    UPDATE products SET
      sku = @sku,
      barcode = @barcode,
      category_id = @category_id,
      name = @name,
      unit = @unit,
      sale_price_cents = @sale_price_cents,
      cost_price_cents = @cost_price_cents,
      minimum_stock = @minimum_stock,
      maximum_stock = @maximum_stock,
      active = @active,
      ncm = @ncm,
      cfop = @cfop,
      origin = @origin,
      notes = @notes,
      situation = @situation,
      supplier_code = @supplier_code,
      supplier_name = @supplier_name,
      location = @location,
      complementary_description = @complementary_description,
      product_group = @product_group,
      brand = @brand,
      cest = @cest,
      short_description = @short_description,
      additional_info = @additional_info,
      updated_at = @updated_at
    WHERE id = @id AND integration_source = 'local' AND deleted_at IS NULL
  `).run({
    ...a,
    id: t,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }), pa(t);
}
function tc(t) {
  return { success: d.prepare(`
    UPDATE products
    SET deleted_at = ?, active = 0, updated_at = ?
    WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL
  `).run((/* @__PURE__ */ new Date()).toISOString(), (/* @__PURE__ */ new Date()).toISOString(), t).changes > 0 };
}
function rc(t) {
  return d.prepare(`
    SELECT
      id,
      barcode AS codigo_barras,
      name AS nome,
      ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
      current_stock AS estoque
    FROM products
    WHERE integration_source = 'local'
      AND deleted_at IS NULL
      AND active = 1
      AND LOWER(name) LIKE LOWER(?)
    ORDER BY name
    LIMIT 50
      `).all(`%${t}%`);
}
function ac(t) {
  return d.prepare(`
    SELECT
      id,
      barcode AS codigo_barras,
      name AS nome,
      ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
      current_stock AS estoque_atual
    FROM products
    WHERE integration_source = 'local'
      AND deleted_at IS NULL
      AND active = 1
      AND barcode = ?
    LIMIT 1;
  `).get(t);
}
function nc(t) {
  return d.prepare(`
    SELECT *
    FROM products
    WHERE integration_source = 'local'
    AND deleted_at IS NULL
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
function oc({ activeOnly: t = !1 } = {}) {
  const e = t ? "AND active = 1" : "";
  return d.prepare(`
    SELECT
      id,
      name,
      active,
      integration_source,
      sync_status,
      created_at,
      updated_at,
      deleted_at
    FROM categories
    WHERE integration_source = 'local'
      AND deleted_at IS NULL
      ${e}
    ORDER BY name
  `).all();
}
function oo(t) {
  const e = B(t.name);
  if (!e) throw new Error("Informe o nome da categoria.");
  return {
    name: e,
    active: t.active === !1 || t.active === 0 ? 0 : 1
  };
}
function sc(t) {
  const e = oo(t), r = ma(), a = (/* @__PURE__ */ new Date()).toISOString();
  return d.prepare(`
    INSERT INTO categories (
      id, external_id, integration_source, name, active, sync_status,
      raw_json, created_at, updated_at, deleted_at
    ) VALUES (
      @id, NULL, 'local', @name, @active, 'local',
      @raw_json, @created_at, @updated_at, NULL
    )
  `).run({
    ...e,
    id: r,
    raw_json: JSON.stringify({ source: "local", createdManually: !0 }),
    created_at: a,
    updated_at: a
  }), d.prepare("SELECT * FROM categories WHERE id = ?").get(r);
}
function ic(t, e) {
  const r = oo(e);
  if (d.prepare(`
    UPDATE categories
    SET name = @name,
        active = @active,
        updated_at = @updated_at
    WHERE id = @id AND integration_source = 'local' AND deleted_at IS NULL
  `).run({
    ...r,
    id: t,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).changes === 0) throw new Error("Categoria local não encontrada ou não editável.");
  return d.prepare("SELECT * FROM categories WHERE id = ?").get(t);
}
function cc(t) {
  if (d.prepare(`
    SELECT COUNT(*) AS total
    FROM products
    WHERE category_id = ?
      AND integration_source = 'local'
      AND deleted_at IS NULL
  `).get(t).total > 0) {
    const n = (/* @__PURE__ */ new Date()).toISOString();
    return d.prepare(`
      UPDATE categories
      SET active = 0, updated_at = ?
      WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL
    `).run(n, t), { success: !0, deactivatedOnly: !0 };
  }
  const r = (/* @__PURE__ */ new Date()).toISOString();
  return { success: d.prepare(`
    UPDATE categories
    SET deleted_at = ?, active = 0, updated_at = ?
    WHERE id = ? AND integration_source = 'local' AND deleted_at IS NULL
  `).run(r, r, t).changes > 0, deactivatedOnly: !1 };
}
console.log(d);
function uc(t) {
  t.is_default === 1 && d.prepare("UPDATE printers SET is_default = 0 WHERE is_default = 1").run(), d.prepare(`
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
function dc() {
  return d.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
           paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json, notes, is_default, installed_at
    FROM printers
    ORDER BY is_default DESC, id DESC
      `).all();
}
function lc() {
  return d.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, is_default,
           paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
    FROM printers
    WHERE is_default = 1
    LIMIT 1
  `).get();
}
function Ec(t, e) {
  return d.prepare(`
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
function mc(t, e) {
  return d.prepare(`
    UPDATE printers
    SET receipt_settings_json = ?
    WHERE id = ?
  `).run(e, t);
}
function pc(t) {
  return d.prepare("DELETE FROM printers WHERE id = ? ").run(t);
}
function Tc(t) {
  d.transaction(() => {
    d.prepare("UPDATE printers SET is_default = 0 WHERE is_default = 1").run(), d.prepare("UPDATE printers SET is_default = 1 WHERE id = ? ").run(t);
  })();
}
function _c() {
  d.prepare("SELECT COUNT(*) as total FROM usuarios").get().total === 0 && (d.prepare(`
      INSERT INTO usuarios(nome, funcao, email, username, password, ativo)
    VALUES(?, ?, ?, ?, ?, ?)
      `).run(
    "Administrador",
    "Gerente",
    "admin@galberto.local",
    "admin",
    Sr("admin123"),
    1
  ), _.info("-> Usuário admin padrão criado (admin / admin123)"), console.log("-> Usuário admin padrão criado (admin / admin123)"));
}
function fc(t) {
  return d.prepare(`
    SELECT id, nome, funcao, email, username, ativo, foto_path
    FROM usuarios
    WHERE id = ?
      `).get(t);
}
function Nc({ name: t, role: e, login: r, ativo: a, page: n = 1, limit: o = 20 }) {
  const s = (n - 1) * o;
  let i = [], u = [];
  t && (i.push("nome LIKE ?"), u.push(`% ${t}% `)), e && (i.push("funcao LIKE ?"), u.push(`% ${e}% `)), r && (i.push("username LIKE ?"), u.push(`% ${r}% `)), a !== void 0 && (i.push("ativo = ?"), u.push(a));
  const c = i.length ? `WHERE ${i.join(" AND ")} ` : "", l = d.prepare(`
      SELECT id, nome, funcao AS role, email, username AS login, ativo
      FROM usuarios
      ${c}
      ORDER BY nome
    LIMIT ? OFFSET ?
      `).all(...u, o, s), E = d.prepare(`
      SELECT COUNT(*) as total
      FROM usuarios
      ${c}
    `).get(...u);
  return {
    data: l,
    page: n,
    limit: o,
    total: E.total
  };
}
function Ac(t) {
  return d.prepare(`
    INSERT INTO usuarios(nome, funcao, email, username, password, ativo, foto_path)
    VALUES(@nome, @funcao, @email, @username, @password, @ativo, @foto_path)
  `).run({
    ...t,
    foto_path: t.foto_path ?? null,
    password: Sr(t.password)
  });
}
function gc(t, e) {
  return d.prepare("UPDATE usuarios SET password = ? WHERE id = ? ").run(Sr(e), t);
}
function hc(t) {
  return d.prepare("DELETE FROM usuarios WHERE id = ? ").run(t);
}
function Ic(t) {
  console.log("Dados chegando no db.ts", t);
  const e = [], r = [];
  t.nome !== void 0 && (e.push("nome = ?"), r.push(t.nome)), t.email !== void 0 && (e.push("email = ?"), r.push(t.email)), t.login !== void 0 && (e.push("username = ?"), r.push(t.login)), t.role !== void 0 && (e.push("funcao = ?"), r.push(t.role)), r.push(t.id);
  const a = `
  UPDATE usuarios
  SET ${e.join(", ")}
  WHERE id = ?
      `;
  d.prepare(a).run(...r);
}
function Cc(t) {
  return d.prepare("UPDATE usuarios SET ativo = 0 WHERE id = ? ").run(t);
}
function Dc(t) {
  return d.prepare("UPDATE usuarios SET ativo = 1 WHERE id = ? ").run(t);
}
_c();
function vc(t) {
  const r = d.prepare(`
    SELECT id
      FROM cash_register_sessions
    WHERE pdv_id = ?
      AND operator_id = ?
        AND status = 'OPEN'
    ORDER BY opened_at DESC
    LIMIT 1;
    `).get(t.pdv_id, t.operator_id);
  return r ? Yt(r.id) : null;
}
function sa(t) {
  return JSON.stringify(t ?? null);
}
function gr(t) {
  return t ? 1 : 0;
}
function Sc(t) {
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
function Rc(t) {
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
function Lc(t) {
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
class Oc {
  create(e) {
    return d.transaction(() => {
      const a = d.prepare(`
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
      ), n = Number(a.lastInsertRowid), o = d.prepare(`
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
          i.taxSnapshot ? sa(i.taxSnapshot) : null
        );
      const s = d.prepare(`
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
    const r = d.prepare("SELECT * FROM sales WHERE id = ? LIMIT 1").get(e);
    return r ? Sc(r) : null;
  }
  findByExternalReference(e) {
    const r = d.prepare(`
      SELECT * FROM sales
      WHERE external_reference = ?
      LIMIT 1
    `).get(e);
    return r ? this.findAggregateById(r.id) : null;
  }
  findAggregateById(e) {
    const r = this.findById(e);
    if (!r) return null;
    const a = d.prepare("SELECT * FROM sale_items WHERE sale_id = ? ORDER BY id ASC").all(e), n = d.prepare("SELECT * FROM payments WHERE sale_id = ? ORDER BY id ASC").all(e), o = d.prepare("SELECT id FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return {
      sale: r,
      items: a.map(Rc),
      payments: n.map(Lc),
      fiscalDocument: o ? { id: o.id } : null
    };
  }
  listRecent(e = 20) {
    return d.prepare(`
      SELECT * FROM sales
      ORDER BY created_at DESC
      LIMIT ?
    `).all(e).map((a) => this.findAggregateById(a.id)).filter((a) => !!a);
  }
  updateStatus(e, r) {
    d.prepare(`
      UPDATE sales
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(r, e);
  }
}
const _r = new Oc();
function yc(t) {
  const e = String(t ?? "").trim();
  if (["1", "2", "3", "4"].includes(e))
    return e;
  throw new Error(`CRT/regime tributario invalido na store: ${e || "vazio"}.`);
}
function qa(t) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    legalName: t.legal_name,
    cnpj: t.cnpj,
    stateRegistration: t.state_registration,
    taxRegimeCode: yc(t.tax_regime_code),
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
class bc {
  create(e) {
    const r = d.prepare(`
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
      gr(e.active ?? !0)
    );
    return this.findById(Number(r.lastInsertRowid));
  }
  findById(e) {
    const r = d.prepare("SELECT * FROM stores WHERE id = ? LIMIT 1").get(e);
    return r ? qa(r) : null;
  }
  findActive() {
    const e = d.prepare(`
      SELECT * FROM stores
      WHERE active = 1
      ORDER BY id ASC
      LIMIT 1
    `).get();
    return e ? qa(e) : null;
  }
  upsertActive(e) {
    const r = e.id ? this.findById(e.id) : this.findActive();
    return r ? (d.prepare(`
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
      gr(e.active ?? !0),
      r.id
    ), this.findById(r.id)) : this.create({ ...e, code: e.code || "MAIN", active: !0 });
  }
  updateFiscalConfiguration(e, r) {
    const a = this.findById(e);
    if (!a)
      throw new Error(`Store ${e} não encontrada.`);
    return d.prepare(`
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
    return d.transaction(() => {
      const a = d.prepare(`
        SELECT default_series, next_nfce_number
        FROM stores
        WHERE id = ?
        LIMIT 1
      `).get(e);
      if (!a)
        throw new Error(`Store ${e} não encontrada.`);
      return d.prepare(`
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
const fe = new bc();
function Pt(t) {
  return Number(t ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
class Uc {
  constructor() {
    he(this, "outputDir", Xe.join(Ae.getPath("userData"), "fiscal", "danfe"));
  }
  async generate(e) {
    _e.mkdirSync(this.outputDir, { recursive: !0 });
    const r = e.danfePath || Xe.join(this.outputDir, `nfce-${e.id}.html`), a = this.render(e);
    return _e.writeFileSync(r, a, "utf8"), {
      documentId: e.id,
      danfePath: r,
      contentType: "text/html",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async recover(e) {
    return !e.danfePath || !_e.existsSync(e.danfePath) ? null : {
      documentId: e.id,
      danfePath: e.danfePath,
      contentType: "text/html",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  render(e) {
    const r = _r.findAggregateById(e.saleId), a = fe.findById(e.companyId), n = e.environment === "homologation", o = (r == null ? void 0 : r.items) ?? [], s = (r == null ? void 0 : r.payments) ?? [], i = (r == null ? void 0 : r.sale.totalAmount) ?? 0;
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
      ${o.map((u) => `
        <div class="item">
          <strong>${u.description}</strong>
          <div class="row"><span>${Number(u.quantity).toFixed(3)} x ${Pt(u.unitPrice)}</span><span>${Pt(u.totalAmount)}</span></div>
        </div>
      `).join("")}
      <div class="divider"></div>
      <div class="subtitle"><strong>Pagamentos</strong></div>
      ${s.map((u) => `
        <div class="row">
          <span>${u.method}</span>
          <span>${Pt(u.amount)}</span>
        </div>
      `).join("")}
      <div class="row"><span class="muted">Troco</span><span>${Pt((r == null ? void 0 : r.sale.changeAmount) ?? 0)}</span></div>
      <div class="row"><span class="muted">Total</span><span><strong>${Pt(i)}</strong></span></div>
      <div class="divider"></div>
      <div class="row"><span class="muted">Chave</span><span>${e.accessKey ?? "Pendente"}</span></div>
      <div class="qr">${e.qrCodeUrl ?? "QR Code indisponível"}</div>
    </div>
  </body>
</html>`;
  }
}
class h extends Error {
  constructor(r) {
    super(r.message);
    he(this, "code");
    he(this, "category");
    he(this, "retryable");
    he(this, "details");
    this.name = "FiscalError", this.code = r.code, this.category = r.category, this.retryable = r.retryable ?? !1, this.details = r.details, r.cause !== void 0 && (this.cause = r.cause);
  }
}
function ce(t, e = "FISCAL_INTERNAL_ERROR") {
  return t instanceof h ? t : t instanceof Error ? new h({
    code: e,
    message: t.message,
    category: "INTERNAL",
    retryable: !1,
    cause: t
  }) : new h({
    code: e,
    message: "Erro interno na camada fiscal.",
    category: "INTERNAL",
    retryable: !1,
    details: t
  });
}
function wc() {
  return (process.env.PATH ?? process.env.Path ?? "").split(Xe.delimiter).filter(Boolean);
}
function Ga(t) {
  try {
    return _e.existsSync(t) && _e.statSync(t).isFile();
  } catch {
    return !1;
  }
}
function so() {
  var a;
  const t = (a = process.env.OPENSSL_BIN) == null ? void 0 : a.trim();
  return t && Ga(t) ? t : process.platform !== "win32" ? "openssl" : [
    ...wc().map((n) => Xe.join(n, "openssl.exe")),
    "C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe",
    "C:\\Program Files\\OpenSSL-Win32\\bin\\openssl.exe",
    "C:\\Program Files\\Git\\usr\\bin\\openssl.exe"
  ].find(Ga) ?? "openssl";
}
function Fc(t) {
  if (Buffer.isBuffer(t))
    return t.toString("utf8").trim() || void 0;
  if (typeof t == "string")
    return t.trim() || void 0;
}
function Va(t, e) {
  if (t)
    return t.replaceAll(`pass:${e}`, "pass:***").replaceAll(e, "***");
}
function Ha(t, e) {
  const r = t;
  return {
    code: r == null ? void 0 : r.code,
    message: Va(t instanceof Error ? t.message : String(t), e),
    stderr: Va(Fc(r == null ? void 0 : r.stderr), e)
  };
}
function za(t, e) {
  return vs(so(), [
    "pkcs12",
    ...t,
    "-passin",
    `pass:${e}`
  ], {
    encoding: "utf8",
    windowsHide: !0
  });
}
function ia(t, e) {
  let r;
  try {
    return za(t, e);
  } catch (a) {
    r = a;
  }
  try {
    return za(["-legacy", ...t], e);
  } catch (a) {
    const n = Ha(r, e), o = Ha(a, e), s = {
      command: so(),
      platform: process.platform,
      attemptedLegacyFallback: !0,
      originalCode: n.code,
      originalMessage: n.message,
      stderr: n.stderr,
      legacyCode: o.code,
      legacyMessage: o.message,
      legacyStderr: o.stderr
    }, i = new Error(o.message ?? "Falha ao executar OpenSSL para ler certificado PKCS#12.");
    throw i.details = s, i;
  }
}
class Mc {
  readCertificatePem(e) {
    var n;
    const r = (n = e.certificatePath) == null ? void 0 : n.trim();
    if (!r)
      return null;
    const a = Xe.extname(r).toLowerCase();
    if (a === ".pem" || a === ".crt" || a === ".cer")
      return _e.readFileSync(r, "utf8");
    if (a === ".pfx" || a === ".p12") {
      if (!e.certificatePassword)
        throw new h({
          code: "CERTIFICATE_PASSWORD_REQUIRED",
          message: "Senha do certificado não configurada.",
          category: "CERTIFICATE"
        });
      try {
        return ia(["-in", r, "-clcerts", "-nokeys"], e.certificatePassword);
      } catch (o) {
        throw new h({
          code: "CERTIFICATE_READ_FAILED",
          message: "Não foi possível validar o certificado digital informado.",
          category: "CERTIFICATE",
          details: o == null ? void 0 : o.details,
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
    const n = _e.existsSync(r);
    let o = null;
    if (n)
      try {
        const i = this.readCertificatePem(e);
        if (i) {
          const u = new Ba(i);
          o = new Date(u.validTo).toISOString();
        }
      } catch {
        o = null;
      }
    return {
      configured: n,
      type: [".pfx", ".p12"].includes(Xe.extname(r).toLowerCase()) ? "A1" : "UNKNOWN",
      alias: Xe.basename(r),
      source: r,
      validUntil: o,
      lastCheckedAt: a
    };
  }
  async assertCertificateReady(e) {
    if (e.provider === "mock")
      return;
    if (!e.certificatePath)
      throw new h({
        code: "CERTIFICATE_NOT_CONFIGURED",
        message: "Certificado fiscal não configurado.",
        category: "CERTIFICATE"
      });
    if (!_e.existsSync(e.certificatePath))
      throw new h({
        code: "CERTIFICATE_FILE_NOT_FOUND",
        message: `Arquivo do certificado não encontrado: ${e.certificatePath}`,
        category: "CERTIFICATE"
      });
    const r = this.readCertificatePem(e);
    if (!r)
      throw new h({
        code: "CERTIFICATE_FORMAT_NOT_SUPPORTED",
        message: "Formato de certificado não suportado pela camada fiscal atual.",
        category: "CERTIFICATE"
      });
    const a = new Ba(r);
    if (new Date(a.validTo).getTime() < Date.now())
      throw new h({
        code: "CERTIFICATE_EXPIRED",
        message: "O certificado digital configurado está expirado.",
        category: "CERTIFICATE"
      });
  }
}
function ja(t) {
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
class xc {
  findActiveByStoreId(e) {
    const r = d.prepare(`
      SELECT *
      FROM fiscal_settings
      WHERE store_id = ? AND active = 1
      ORDER BY id DESC
      LIMIT 1
    `).get(e);
    return r ? ja(r) : null;
  }
  upsertActive(e) {
    const r = this.findActiveByStoreId(e.storeId);
    if (!r) {
      const a = d.prepare(`
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
        gr(e.active ?? !0)
      );
      return this.findById(Number(a.lastInsertRowid));
    }
    return d.prepare(`
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
      gr(e.active ?? r.active),
      r.id
    ), this.findById(r.id);
  }
  findById(e) {
    const r = d.prepare(`
      SELECT *
      FROM fiscal_settings
      WHERE id = ?
      LIMIT 1
    `).get(e);
    return r ? ja(r) : null;
  }
}
const io = new xc(), Ht = "fiscal:nfce", Ya = "__FISCAL_CONFIG__";
function ca() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function Ka() {
  return {
    provider: "mock",
    environment: "homologation",
    contingencyMode: "queue",
    integrationId: Ht,
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
    updatedAt: ca()
  };
}
function Wa(t) {
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
class co {
  /**
   * Legacy fallback only.
   * Fiscal runtime must use FiscalSettingsService/FiscalContextResolver as the primary source.
   */
  getConfig() {
    const e = d.prepare(`
      SELECT integration_id, raw_json, updated_at
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(Ht);
    if (!(e != null && e.raw_json))
      return _.warn("[FiscalConfig] Configuracao fiscal fiscal:nfce nao encontrada. Usando defaults."), Ka();
    const r = JSON.parse(e.raw_json);
    return _.info(`[FiscalConfig] Configuracao fiscal carregada provider=${r.provider ?? "mock"} ambiente=${r.environment ?? "homologation"} uf=${r.uf ?? "SP"}.`), {
      ...Ka(),
      ...r,
      integrationId: Ht,
      updatedAt: r.updatedAt ?? e.updated_at ?? ca()
    };
  }
  getConfigView() {
    return Wa(this.getConfig());
  }
  saveConfig(e) {
    const r = this.getConfig(), a = {
      ...r,
      ...e,
      gatewayApiKey: e.gatewayApiKey === "" ? r.gatewayApiKey : e.gatewayApiKey ?? r.gatewayApiKey,
      certificatePassword: e.certificatePassword === "" ? r.certificatePassword : e.certificatePassword ?? r.certificatePassword,
      cscToken: e.cscToken === "" ? r.cscToken : e.cscToken ?? r.cscToken,
      integrationId: Ht,
      updatedAt: ca()
    };
    return d.prepare(`
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
      Ht,
      Ya,
      Ya,
      "CONFIG",
      "9999-12-31T23:59:59.999Z",
      "fiscal:nfce",
      JSON.stringify(a),
      a.updatedAt
    ), _.info(`[FiscalConfig] Configuracao fiscal salva provider=${a.provider} ambiente=${a.environment} uf=${a.uf ?? "SP"}.`), Wa(a);
  }
}
function Pc(t) {
  const e = String(t ?? "").trim();
  if (["1", "2", "3", "4"].includes(e))
    return e;
  throw new Error(`CRT/regime tributario invalido na company legada: ${e || "vazio"}.`);
}
function Bc(t) {
  return {
    code: "MAIN",
    name: t.nome_fantasia,
    legalName: t.razao_social,
    cnpj: t.cnpj,
    stateRegistration: t.inscricao_estadual,
    taxRegimeCode: Pc(t.crt),
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
function uo() {
  const t = fe.findActive();
  if (t) return t;
  const e = d.prepare(`
    SELECT *
    FROM company
    WHERE ativo = 1
    ORDER BY id ASC
    LIMIT 1
  `).get();
  if (!e)
    return _.warn("[FiscalStore] Nenhuma store ativa e nenhuma company ativa encontrada."), null;
  const r = fe.create(Bc(e));
  return _.info(`[FiscalStore] Store fiscal criada a partir de company ativa store=${r.id}.`), r;
}
const Xc = "fiscal:nfce";
function kc(t) {
  return (t ?? "SP").trim().toUpperCase() || "SP";
}
function $c(t) {
  return {
    provider: t.provider,
    environment: t.environment,
    contingencyMode: t.contingencyMode,
    integrationId: Xc,
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
class qc {
  constructor(e = new co()) {
    this.legacySettings = e;
  }
  resolve(e) {
    const r = e ? fe.findById(e) : uo();
    if (e && !r)
      throw new Error(`Store fiscal ${e} não encontrada ou inativa.`);
    if (!r)
      throw new Error("Nenhuma store fiscal ativa encontrada. Cadastre os dados do emitente antes da emissão.");
    const a = io.findActiveByStoreId(r.id), n = a ? null : this.legacySettings.getConfig(), o = !a && !!n;
    o && _.warn(`[FiscalContext] Usando fallback legado integrations para store=${r.id}.`);
    const s = a ? "fiscal_settings" : o ? "integrations-fallback" : "defaults";
    return this.buildContext(r, a, n ?? null, s, o);
  }
  resolveProviderConfig(e) {
    return $c(this.resolve(e));
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
      uf: kc(e.addressState ?? (a == null ? void 0 : a.uf)),
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
const ke = new qc(), Gc = "fiscal:nfce";
function Qa(t) {
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
function Pe(t) {
  if (t == null) return null;
  const e = t.trim();
  return e.length > 0 ? e : null;
}
class Vc {
  constructor(e = new co()) {
    this.legacySettings = e;
  }
  getConfig() {
    return ke.resolveProviderConfig();
  }
  getConfigView() {
    return Qa(this.getConfig());
  }
  saveConfig(e) {
    const r = uo();
    if (!r)
      throw new Error("Nenhuma store fiscal ativa encontrada. Cadastre os dados do emitente antes de salvar a configuração fiscal.");
    const a = this.getConfig(), n = e.certificatePassword === "" ? a.certificatePassword : e.certificatePassword ?? a.certificatePassword ?? null, o = e.gatewayApiKey === "" ? a.gatewayApiKey : e.gatewayApiKey ?? a.gatewayApiKey ?? null, s = e.cscToken === "" ? a.cscToken : e.cscToken ?? a.cscToken ?? null, i = fe.updateFiscalConfiguration(r.id, {
      environment: e.environment,
      cscId: Pe(e.cscId) ?? a.cscId ?? null,
      cscToken: s,
      defaultSeries: e.defaultSeries ?? a.defaultSeries ?? r.defaultSeries
    }), u = io.upsertActive({
      storeId: i.id,
      provider: e.provider,
      documentModel: e.model ?? 65,
      contingencyMode: e.contingencyMode,
      sefazBaseUrl: Pe(e.sefazBaseUrl),
      gatewayBaseUrl: Pe(e.gatewayBaseUrl),
      gatewayApiKey: Pe(o),
      certificateType: e.certificateType ?? a.certificateType ?? "A1",
      certificatePath: Pe(e.certificatePath) ?? a.certificatePath ?? null,
      certificatePassword: Pe(n),
      certificateValidUntil: Pe(e.certificateValidUntil) ?? a.certificateValidUntil ?? null,
      caBundlePath: Pe(e.caBundlePath),
      tlsValidationMode: e.tlsValidationMode ?? a.tlsValidationMode ?? "strict",
      active: !0
    }), c = ke.resolveProviderConfig(i.id);
    return this.mirrorLegacyConfig(c), _.info(`[FiscalConfig] Configuracao fiscal salva em fiscal_settings store=${u.storeId} provider=${u.provider} ambiente=${i.environment}.`), Qa(c);
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
      _.warn(`[FiscalConfig] Falha ao espelhar configuracao fiscal no legado integrations: ${r instanceof Error ? r.message : String(r)}`);
    }
  }
  getLegacyRowForDiagnostics() {
    return d.prepare(`
      SELECT integration_id, updated_at
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(Gc);
  }
}
function Bt(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function P(t) {
  return typeof t == "string" && t.trim().length > 0;
}
function R(t, e, r, a, n, o = "error") {
  t.push({ code: e, message: r, field: a, table: n, severity: o });
}
class Hc {
  validateContext(e) {
    const r = [];
    Bt(e.emitter.cnpj).length !== 14 && R(r, "EMITTER_CNPJ_REQUIRED", "CNPJ do emitente deve ter 14 digitos.", "cnpj", "stores"), P(e.emitter.stateRegistration) || R(r, "EMITTER_IE_REQUIRED", "IE do emitente e obrigatoria.", "state_registration", "stores"), P(e.emitter.legalName) || R(r, "EMITTER_LEGAL_NAME_REQUIRED", "Razao social do emitente e obrigatoria.", "legal_name", "stores"), P(e.emitter.taxRegimeCode) || R(r, "EMITTER_TAX_REGIME_REQUIRED", "Regime tributario/CRT e obrigatorio.", "tax_regime_code", "stores");
    const a = e.emitter.address;
    return P(a.street) || R(r, "EMITTER_STREET_REQUIRED", "Logradouro do emitente e obrigatorio.", "address_street", "stores"), P(a.number) || R(r, "EMITTER_NUMBER_REQUIRED", "Numero do endereco do emitente e obrigatorio.", "address_number", "stores"), P(a.neighborhood) || R(r, "EMITTER_NEIGHBORHOOD_REQUIRED", "Bairro do emitente e obrigatorio.", "address_neighborhood", "stores"), P(a.city) || R(r, "EMITTER_CITY_REQUIRED", "Municipio do emitente e obrigatorio.", "address_city", "stores"), (!P(a.state) || a.state.length !== 2) && R(r, "EMITTER_UF_REQUIRED", "UF do emitente deve ter 2 letras.", "address_state", "stores"), Bt(a.zipCode).length !== 8 && R(r, "EMITTER_ZIP_REQUIRED", "CEP do emitente deve ter 8 digitos.", "address_zip_code", "stores"), Bt(a.cityIbgeCode).length !== 7 && R(r, "EMITTER_IBGE_REQUIRED", "Codigo IBGE do municipio deve ter 7 digitos.", "address_city_ibge_code", "stores"), e.environment || R(r, "FISCAL_ENVIRONMENT_REQUIRED", "Ambiente fiscal e obrigatorio.", "environment", "stores"), e.provider || R(r, "FISCAL_PROVIDER_REQUIRED", "Provider fiscal e obrigatorio.", "provider", "fiscal_settings"), e.provider === "sefaz-direct" && !P(e.sefazBaseUrl) && e.uf !== "SP" && R(r, "SEFAZ_URL_REQUIRED", "URL SEFAZ deve ser configurada para UF diferente de SP.", "sefaz_base_url", "fiscal_settings"), e.provider === "gateway" && !P(e.gatewayBaseUrl) && R(r, "GATEWAY_URL_REQUIRED", "URL do gateway fiscal e obrigatoria para provider gateway.", "gateway_base_url", "fiscal_settings"), e.provider === "gateway" && !P(e.gatewayApiKey) && R(r, "GATEWAY_API_KEY_REQUIRED", "API key do gateway fiscal e obrigatoria para provider gateway.", "gateway_api_key", "fiscal_settings"), e.provider !== "mock" && (P(e.certificatePath) || R(r, "CERTIFICATE_PATH_REQUIRED", "Certificado A1 e obrigatorio para emissao real.", "certificate_path", "fiscal_settings"), P(e.certificatePassword) || R(r, "CERTIFICATE_PASSWORD_REQUIRED", "Senha do certificado A1 e obrigatoria.", "certificate_password", "fiscal_settings"), P(e.cscId) || R(r, "CSC_ID_REQUIRED", "CSC ID e obrigatorio para NFC-e.", "csc_id", "stores"), P(e.cscToken) || R(r, "CSC_TOKEN_REQUIRED", "CSC token e obrigatorio para NFC-e.", "csc_token", "stores")), (!Number.isInteger(e.defaultSeries) || e.defaultSeries <= 0) && R(r, "DEFAULT_SERIES_REQUIRED", "Serie padrao NFC-e deve ser maior que zero.", "default_series", "stores"), (!Number.isInteger(e.nextNfceNumber) || e.nextNfceNumber <= 0) && R(r, "NEXT_NFCE_NUMBER_REQUIRED", "Proximo numero NFC-e deve ser maior que zero.", "next_nfce_number", "stores"), this.toResult(r);
  }
  validateAuthorizeReadiness(e, r) {
    const a = this.validateContext(e), n = [...a.errors, ...a.warnings];
    return this.validateItems(r.items, n), this.validatePayments(r.payments, n), (!r.totals || r.totals.finalAmount <= 0) && R(n, "SALE_TOTAL_REQUIRED", "Total da venda deve ser maior que zero.", "totals.finalAmount", "sales"), this.toResult(n);
  }
  validateItems(e, r) {
    if (!Array.isArray(e) || e.length === 0) {
      R(r, "SALE_ITEMS_REQUIRED", "Venda deve possuir ao menos um item.", "items", "sale_items");
      return;
    }
    e.forEach((a, n) => {
      var s, i, u, c, l, E, m;
      const o = `items[${n}]`;
      P(a.description) || R(r, "ITEM_DESCRIPTION_REQUIRED", "Descricao do item e obrigatoria.", `${o}.description`, "sale_items"), P(a.unit) || R(r, "ITEM_UNIT_REQUIRED", "Unidade do item e obrigatoria.", `${o}.unit`, "sale_items"), a.quantity <= 0 && R(r, "ITEM_QUANTITY_REQUIRED", "Quantidade do item deve ser maior que zero.", `${o}.quantity`, "sale_items"), a.unitPrice <= 0 && R(r, "ITEM_UNIT_PRICE_REQUIRED", "Valor unitario do item deve ser maior que zero.", `${o}.unitPrice`, "sale_items"), Bt((s = a.tax) == null ? void 0 : s.ncm).length !== 8 && R(r, "ITEM_NCM_REQUIRED", `NCM do item "${a.description}" deve ter 8 digitos. Corrija o cadastro do produto antes de emitir NFC-e.`, `${o}.tax.ncm`, "sale_items"), Bt((i = a.tax) == null ? void 0 : i.cfop).length !== 4 && R(r, "ITEM_CFOP_REQUIRED", "CFOP do item deve ter 4 digitos.", `${o}.tax.cfop`, "sale_items"), P((u = a.tax) == null ? void 0 : u.originCode) || R(r, "ITEM_ORIGIN_REQUIRED", `Origem tributaria do item "${a.description}" e obrigatoria.`, `${o}.tax.originCode`, "sale_item_tax_snapshot"), !P((c = a.tax) == null ? void 0 : c.csosn) && !P((l = a.tax) == null ? void 0 : l.icmsCst) && R(r, "ITEM_ICMS_REQUIRED", `CST ou CSOSN do ICMS do item "${a.description}" e obrigatorio.`, `${o}.tax`, "sale_item_tax_snapshot"), P((E = a.tax) == null ? void 0 : E.pisCst) || R(r, "ITEM_PIS_REQUIRED", `CST de PIS do item "${a.description}" e obrigatorio.`, `${o}.tax.pisCst`, "sale_item_tax_snapshot"), P((m = a.tax) == null ? void 0 : m.cofinsCst) || R(r, "ITEM_COFINS_REQUIRED", `CST de COFINS do item "${a.description}" e obrigatorio.`, `${o}.tax.cofinsCst`, "sale_item_tax_snapshot");
    });
  }
  validatePayments(e, r) {
    if (!Array.isArray(e) || e.length === 0) {
      R(r, "PAYMENTS_REQUIRED", "NFC-e exige grupo de pagamento.", "payments", "payments");
      return;
    }
    e.forEach((a, n) => {
      const o = `payments[${n}]`;
      P(a.method) || R(r, "PAYMENT_METHOD_REQUIRED", "Forma de pagamento e obrigatoria.", `${o}.method`, "payments"), a.amount <= 0 && R(r, "PAYMENT_AMOUNT_REQUIRED", "Valor do pagamento deve ser maior que zero.", `${o}.amount`, "payments");
    });
  }
  toResult(e) {
    const r = e.filter((n) => n.severity === "error"), a = e.filter((n) => n.severity === "warning");
    return { ok: r.length === 0, errors: r, warnings: a };
  }
}
const Ta = new Hc(), zc = ["1", "2", "3", "4"];
function jc(t) {
  return zc.includes(t);
}
function kr(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function Ze(t) {
  return String(t ?? "").trim();
}
function ut(t, e, r) {
  const a = Ze(String(t[e] ?? ""));
  if (!a)
    throw new Error(`${r} e obrigatorio.`);
  return a;
}
function Yc(t) {
  const e = {
    id: t.id,
    code: Ze(t.code || "MAIN") || "MAIN",
    name: ut(t, "name", "Nome fantasia"),
    legalName: ut(t, "legalName", "Razao social"),
    cnpj: kr(t.cnpj),
    stateRegistration: Ze(t.stateRegistration),
    taxRegimeCode: Ze(t.taxRegimeCode),
    environment: t.environment === "production" ? "production" : "homologation",
    cscId: Ze(t.cscId ?? "") || null,
    cscToken: Ze(t.cscToken ?? "") || null,
    defaultSeries: Number(t.defaultSeries ?? 1),
    nextNfceNumber: Number(t.nextNfceNumber ?? 1),
    addressStreet: ut(t, "addressStreet", "Logradouro"),
    addressNumber: ut(t, "addressNumber", "Numero"),
    addressNeighborhood: ut(t, "addressNeighborhood", "Bairro"),
    addressCity: ut(t, "addressCity", "Cidade"),
    addressState: Ze(t.addressState).toUpperCase(),
    addressZipCode: kr(t.addressZipCode),
    addressCityIbgeCode: kr(t.addressCityIbgeCode),
    active: !0
  };
  if (e.cnpj.length !== 14)
    throw new Error("CNPJ deve conter 14 digitos.");
  if (!e.stateRegistration)
    throw new Error("Inscricao estadual e obrigatoria.");
  if (!e.taxRegimeCode)
    throw new Error("CRT/regime tributario e obrigatorio.");
  if (!jc(e.taxRegimeCode))
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
class Kc {
  getActiveStore() {
    return fe.findActive();
  }
  saveActiveStore(e) {
    const r = fe.upsertActive(Yc(e));
    return _.info(`[FiscalStore] Store fiscal salva id=${r.id} cnpj=${r.cnpj} ambiente=${r.environment}.`), r;
  }
}
const Wc = new Kc();
function $r(t) {
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
function Qc(t) {
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
function qr(t) {
  const e = JSON.parse(t.payload_json), r = t.result_json ? JSON.parse(t.result_json) : null, a = Number(t.entity_id);
  return {
    id: String(t.id),
    saleId: Number((e == null ? void 0 : e.saleId) ?? 0),
    documentId: Number.isNaN(a) ? null : a,
    operation: t.operation,
    payload: e,
    result: r,
    status: Qc(t.status),
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
class Jc {
  ensureSchema() {
  }
  createPendingDocument(e) {
    const r = this.findBySaleId(e.saleId);
    if (r)
      return r;
    const a = d.prepare(`
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
    d.prepare(`
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
    return d.prepare(`
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
    return d.prepare(`
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
    return d.prepare(`
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
    d.prepare(`
      UPDATE fiscal_documents
      SET danfe_path = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(r, e);
  }
  findById(e) {
    const r = d.prepare("SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1").get(e);
    return r ? $r(r) : null;
  }
  findBySaleId(e) {
    const r = d.prepare("SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return r ? $r(r) : null;
  }
  findByAccessKey(e) {
    const r = d.prepare("SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1").get(e);
    return r ? $r(r) : null;
  }
  updateStatus(e, r, a, n) {
    d.prepare(`
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
    const a = d.prepare(`
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
    const r = d.prepare(`
      SELECT * FROM sync_queue
      WHERE idempotency_key = ?
      LIMIT 1
    `).get(e);
    return r ? qr(r) : null;
  }
  findQueueItemById(e) {
    const r = d.prepare("SELECT * FROM sync_queue WHERE id = ? LIMIT 1").get(Number(e));
    return r ? qr(r) : null;
  }
  claimNextQueueItem(e, r) {
    const a = d.prepare(`
      SELECT * FROM sync_queue
      WHERE status IN ('PENDING', 'FAILED')
        AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
      ORDER BY created_at ASC
      LIMIT 1
    `).get(e);
    return a ? (this.markQueueItemProcessing(String(a.id), "main", e), this.findQueueItemById(String(a.id))) : null;
  }
  claimQueueItemById(e, r, a) {
    const n = d.prepare(`
      SELECT * FROM sync_queue
      WHERE id = ?
        AND status IN ('PENDING', 'FAILED')
      LIMIT 1
    `).get(Number(e));
    return n ? (this.markQueueItemProcessing(String(n.id), a, r), this.findQueueItemById(String(n.id))) : null;
  }
  markQueueItemProcessing(e, r, a) {
    d.prepare(`
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
    d.prepare(`
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
    d.prepare(`
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
    return d.prepare(`
      SELECT * FROM sync_queue
      ORDER BY created_at DESC
      LIMIT ?
    `).all(e).map(qr);
  }
  summarizeQueue() {
    const e = d.prepare(`
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
    const a = d.prepare(`
      SELECT next_attempt_at
      FROM sync_queue
      WHERE status = 'FAILED' AND next_attempt_at IS NOT NULL
      ORDER BY next_attempt_at ASC
      LIMIT 1
    `).get();
    return r.nextRetryAt = (a == null ? void 0 : a.next_attempt_at) ?? null, r;
  }
}
function Xt(t) {
  var r;
  const e = (r = t.gatewayBaseUrl) == null ? void 0 : r.trim();
  if (!e)
    throw new h({
      code: "GATEWAY_BASE_URL_REQUIRED",
      message: "Gateway fiscal não configurado.",
      category: "CONFIGURATION"
    });
  return e.replace(/\/+$/, "");
}
function ur(t) {
  var r;
  const e = (r = t.gatewayApiKey) == null ? void 0 : r.trim();
  if (!e)
    throw new h({
      code: "GATEWAY_API_KEY_REQUIRED",
      message: "API key do gateway fiscal não configurada.",
      category: "CONFIGURATION"
    });
  return {
    "content-type": "application/json",
    authorization: `Bearer ${e}`
  };
}
async function dr(t, e) {
  var o, s, i, u, c, l;
  const r = await t.text(), a = r ? JSON.parse(r) : {}, n = a;
  if (!t.ok)
    throw new h({
      code: ((o = n.error) == null ? void 0 : o.code) ?? e,
      message: ((s = n.error) == null ? void 0 : s.message) ?? `Gateway fiscal retornou HTTP ${t.status}.`,
      category: "PROVIDER",
      retryable: t.status >= 500 || ((i = n.error) == null ? void 0 : i.retryable) === !0,
      details: a
    });
  if ("success" in n && n.success === !1)
    throw new h({
      code: ((u = n.error) == null ? void 0 : u.code) ?? e,
      message: ((c = n.error) == null ? void 0 : c.message) ?? "Gateway fiscal retornou erro de negócio.",
      category: "PROVIDER",
      retryable: ((l = n.error) == null ? void 0 : l.retryable) === !0,
      details: a
    });
  return "data" in n && n.data !== void 0 ? n.data : a;
}
class Zc {
  constructor() {
    he(this, "providerId", "gateway");
  }
  async authorizeNfce(e, r) {
    const a = await fetch(`${Xt(r)}/nfce/authorize`, {
      method: "POST",
      headers: ur(r),
      body: JSON.stringify({
        request: e
      })
    });
    return dr(a, "GATEWAY_AUTHORIZE_FAILED");
  }
  async cancelNfce(e, r) {
    const a = await fetch(`${Xt(r)}/nfce/cancel`, {
      method: "POST",
      headers: ur(r),
      body: JSON.stringify({
        request: e
      })
    });
    return dr(a, "GATEWAY_CANCEL_FAILED");
  }
  async consultStatus(e, r) {
    const a = await fetch(`${Xt(r)}/nfce/status/${encodeURIComponent(e.accessKey)}`, {
      method: "GET",
      headers: ur(r)
    });
    return dr(a, "GATEWAY_CONSULT_FAILED");
  }
  async testStatusServico(e) {
    const r = Date.now(), a = await fetch(`${Xt(e)}/nfce/status-servico`, {
      method: "POST",
      headers: ur(e),
      body: JSON.stringify({
        environment: e.environment,
        uf: e.uf ?? "SP",
        model: e.model ?? 65
      })
    }), n = await dr(
      a,
      "GATEWAY_STATUS_SERVICE_FAILED"
    );
    return {
      provider: "gateway",
      environment: e.environment,
      uf: e.uf ?? n.uf ?? "SP",
      model: 65,
      service: "NFeStatusServico4",
      url: `${Xt(e)}/nfce/status-servico`,
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
function eu(t) {
  return `${t.emitter.address.state}${t.saleId}${t.number}${t.series}`.replace(/\D/g, "").padEnd(44, "0").slice(0, 44);
}
class tu {
  constructor() {
    he(this, "providerId", "mock");
  }
  async authorizeNfce(e, r) {
    const a = (/* @__PURE__ */ new Date()).toISOString(), n = eu(e);
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
var $ = {};
function ru(t, e, r) {
  if (r === void 0 && (r = Array.prototype), t && typeof r.find == "function")
    return r.find.call(t, e);
  for (var a = 0; a < t.length; a++)
    if (ot(t, a)) {
      var n = t[a];
      if (e.call(void 0, n, a, t))
        return n;
    }
}
function Ot(t, e) {
  return e === void 0 && (e = Object), e && typeof e.getOwnPropertyDescriptors == "function" && (t = e.create(null, e.getOwnPropertyDescriptors(t))), e && typeof e.freeze == "function" ? e.freeze(t) : t;
}
function ot(t, e) {
  return Object.prototype.hasOwnProperty.call(t, e);
}
function au(t, e) {
  if (t === null || typeof t != "object")
    throw new TypeError("target is not an object");
  for (var r in e)
    ot(e, r) && (t[r] = e[r]);
  return t;
}
var lo = Ot({
  allowfullscreen: !0,
  async: !0,
  autofocus: !0,
  autoplay: !0,
  checked: !0,
  controls: !0,
  default: !0,
  defer: !0,
  disabled: !0,
  formnovalidate: !0,
  hidden: !0,
  ismap: !0,
  itemscope: !0,
  loop: !0,
  multiple: !0,
  muted: !0,
  nomodule: !0,
  novalidate: !0,
  open: !0,
  playsinline: !0,
  readonly: !0,
  required: !0,
  reversed: !0,
  selected: !0
});
function nu(t) {
  return ot(lo, t.toLowerCase());
}
var Eo = Ot({
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  embed: !0,
  hr: !0,
  img: !0,
  input: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0
});
function ou(t) {
  return ot(Eo, t.toLowerCase());
}
var Kt = Ot({
  script: !1,
  style: !1,
  textarea: !0,
  title: !0
});
function su(t) {
  var e = t.toLowerCase();
  return ot(Kt, e) && !Kt[e];
}
function iu(t) {
  var e = t.toLowerCase();
  return ot(Kt, e) && Kt[e];
}
function mo(t) {
  return t === Wt.HTML;
}
function cu(t) {
  return mo(t) || t === Wt.XML_XHTML_APPLICATION;
}
var Wt = Ot({
  /**
   * `text/html`, the only mime type that triggers treating an XML document as HTML.
   *
   * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
   * @see https://en.wikipedia.org/wiki/HTML Wikipedia
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
   * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
   *      WHATWG HTML Spec
   */
  HTML: "text/html",
  /**
   * `application/xml`, the standard mime type for XML documents.
   *
   * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType
   *      registration
   * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
   * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
   */
  XML_APPLICATION: "application/xml",
  /**
   * `text/xml`, an alias for `application/xml`.
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
   * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType
   *      registration
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
}), uu = Object.keys(Wt).map(function(t) {
  return Wt[t];
});
function du(t) {
  return uu.indexOf(t) > -1;
}
var lu = Ot({
  /**
   * The XHTML namespace.
   *
   * @see http://www.w3.org/1999/xhtml
   */
  HTML: "http://www.w3.org/1999/xhtml",
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
   * The `xmlns:` namespace.
   *
   * @see https://www.w3.org/2000/xmlns/
   */
  XMLNS: "http://www.w3.org/2000/xmlns/"
});
$.assign = au;
$.find = ru;
$.freeze = Ot;
$.HTML_BOOLEAN_ATTRIBUTES = lo;
$.HTML_RAW_TEXT_ELEMENTS = Kt;
$.HTML_VOID_ELEMENTS = Eo;
$.hasDefaultHTMLNamespace = cu;
$.hasOwn = ot;
$.isHTMLBooleanAttribute = nu;
$.isHTMLRawTextElement = su;
$.isHTMLEscapableRawTextElement = iu;
$.isHTMLMimeType = mo;
$.isHTMLVoidElement = ou;
$.isValidMimeType = du;
$.MIME_TYPE = Wt;
$.NAMESPACE = lu;
var st = {}, Eu = $;
function po(t, e) {
  t.prototype = Object.create(Error.prototype, {
    constructor: { value: t },
    name: { value: t.name, enumerable: !0, writable: e }
  });
}
var Qt = Eu.freeze({
  /**
   * the default value as defined by the spec
   */
  Error: "Error",
  /**
   * @deprecated
   * Use RangeError instead.
   */
  IndexSizeError: "IndexSizeError",
  /**
   * @deprecated
   * Just to match the related static code, not part of the spec.
   */
  DomstringSizeError: "DomstringSizeError",
  HierarchyRequestError: "HierarchyRequestError",
  WrongDocumentError: "WrongDocumentError",
  InvalidCharacterError: "InvalidCharacterError",
  /**
   * @deprecated
   * Just to match the related static code, not part of the spec.
   */
  NoDataAllowedError: "NoDataAllowedError",
  NoModificationAllowedError: "NoModificationAllowedError",
  NotFoundError: "NotFoundError",
  NotSupportedError: "NotSupportedError",
  InUseAttributeError: "InUseAttributeError",
  InvalidStateError: "InvalidStateError",
  SyntaxError: "SyntaxError",
  InvalidModificationError: "InvalidModificationError",
  NamespaceError: "NamespaceError",
  /**
   * @deprecated
   * Use TypeError for invalid arguments,
   * "NotSupportedError" DOMException for unsupported operations,
   * and "NotAllowedError" DOMException for denied requests instead.
   */
  InvalidAccessError: "InvalidAccessError",
  /**
   * @deprecated
   * Just to match the related static code, not part of the spec.
   */
  ValidationError: "ValidationError",
  /**
   * @deprecated
   * Use TypeError instead.
   */
  TypeMismatchError: "TypeMismatchError",
  SecurityError: "SecurityError",
  NetworkError: "NetworkError",
  AbortError: "AbortError",
  /**
   * @deprecated
   * Just to match the related static code, not part of the spec.
   */
  URLMismatchError: "URLMismatchError",
  QuotaExceededError: "QuotaExceededError",
  TimeoutError: "TimeoutError",
  InvalidNodeTypeError: "InvalidNodeTypeError",
  DataCloneError: "DataCloneError",
  EncodingError: "EncodingError",
  NotReadableError: "NotReadableError",
  UnknownError: "UnknownError",
  ConstraintError: "ConstraintError",
  DataError: "DataError",
  TransactionInactiveError: "TransactionInactiveError",
  ReadOnlyError: "ReadOnlyError",
  VersionError: "VersionError",
  OperationError: "OperationError",
  NotAllowedError: "NotAllowedError",
  OptOutError: "OptOutError"
}), To = Object.keys(Qt);
function _o(t) {
  return typeof t == "number" && t >= 1 && t <= 25;
}
function mu(t) {
  return typeof t == "string" && t.substring(t.length - Qt.Error.length) === Qt.Error;
}
function ar(t, e) {
  _o(t) ? (this.name = To[t], this.message = e || "") : (this.message = t, this.name = mu(e) ? e : Qt.Error), Error.captureStackTrace && Error.captureStackTrace(this, ar);
}
po(ar, !0);
Object.defineProperties(ar.prototype, {
  code: {
    enumerable: !0,
    get: function() {
      var t = To.indexOf(this.name);
      return _o(t) ? t : 0;
    }
  }
});
var fo = {
  INDEX_SIZE_ERR: 1,
  DOMSTRING_SIZE_ERR: 2,
  HIERARCHY_REQUEST_ERR: 3,
  WRONG_DOCUMENT_ERR: 4,
  INVALID_CHARACTER_ERR: 5,
  NO_DATA_ALLOWED_ERR: 6,
  NO_MODIFICATION_ALLOWED_ERR: 7,
  NOT_FOUND_ERR: 8,
  NOT_SUPPORTED_ERR: 9,
  INUSE_ATTRIBUTE_ERR: 10,
  INVALID_STATE_ERR: 11,
  SYNTAX_ERR: 12,
  INVALID_MODIFICATION_ERR: 13,
  NAMESPACE_ERR: 14,
  INVALID_ACCESS_ERR: 15,
  VALIDATION_ERR: 16,
  TYPE_MISMATCH_ERR: 17,
  SECURITY_ERR: 18,
  NETWORK_ERR: 19,
  ABORT_ERR: 20,
  URL_MISMATCH_ERR: 21,
  QUOTA_EXCEEDED_ERR: 22,
  TIMEOUT_ERR: 23,
  INVALID_NODE_TYPE_ERR: 24,
  DATA_CLONE_ERR: 25
}, Gr = Object.entries(fo);
for (var lr = 0; lr < Gr.length; lr++) {
  var pu = Gr[lr][0];
  ar[pu] = Gr[lr][1];
}
function _a(t, e) {
  this.message = t, this.locator = e, Error.captureStackTrace && Error.captureStackTrace(this, _a);
}
po(_a);
st.DOMException = ar;
st.DOMExceptionName = Qt;
st.ExceptionCode = fo;
st.ParseError = _a;
var q = {}, g = {};
function No(t) {
  try {
    typeof t != "function" && (t = RegExp);
    var e = new t("𝌆", "u").exec("𝌆");
    return !!e && e[0].length === 2;
  } catch {
  }
  return !1;
}
var yt = No();
function qe(t) {
  if (t.source[0] !== "[")
    throw new Error(t + " can not be used with chars");
  return t.source.slice(1, t.source.lastIndexOf("]"));
}
function Dt(t, e) {
  if (t.source[0] !== "[")
    throw new Error("/" + t.source + "/ can not be used with chars_without");
  if (!e || typeof e != "string")
    throw new Error(JSON.stringify(e) + " is not a valid search");
  if (t.source.indexOf(e) === -1)
    throw new Error('"' + e + '" is not is /' + t.source + "/");
  if (e === "-" && t.source.indexOf(e) !== 1)
    throw new Error('"' + e + '" is not at the first postion of /' + t.source + "/");
  return new RegExp(t.source.replace(e, ""), yt ? "u" : "");
}
function D(t) {
  var e = this;
  return new RegExp(
    Array.prototype.slice.call(arguments).map(function(r) {
      var a = typeof r == "string";
      if (a && e === void 0 && r === "|")
        throw new Error("use regg instead of reg to wrap expressions with `|`!");
      return a ? r : r.source;
    }).join(""),
    yt ? "mu" : "m"
  );
}
function A(t) {
  if (arguments.length === 0)
    throw new Error("no parameters provided");
  return D.apply(A, ["(?:"].concat(Array.prototype.slice.call(arguments), [")"]));
}
var Tu = "�", Ge = /[-\x09\x0A\x0D\x20-\x2C\x2E-\uD7FF\uE000-\uFFFD]/;
yt && (Ge = D("[", qe(Ge), "\\u{10000}-\\u{10FFFF}", "]"));
var _u = new RegExp("[^" + qe(Ge) + "]", yt ? "u" : ""), fa = /[\x20\x09\x0D\x0A]/, fu = qe(fa), b = D(fa, "+"), X = D(fa, "*"), Jt = /[:_a-zA-Z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
yt && (Jt = D("[", qe(Jt), "\\u{10000}-\\u{10FFFF}", "]"));
var Nu = qe(Jt), Na = D("[", Nu, qe(/[-.0-9\xB7]/), qe(/[\u0300-\u036F\u203F-\u2040]/), "]"), ge = D(Jt, Na, "*"), Ja = D(Na, "+"), Au = D("&", ge, ";"), gu = A(/&#[0-9]+;|&#x[0-9a-fA-F]+;/), Zt = A(Au, "|", gu), er = D("%", ge, ";"), Aa = A(
  D('"', A(/[^%&"]/, "|", er, "|", Zt), "*", '"'),
  "|",
  D("'", A(/[^%&']/, "|", er, "|", Zt), "*", "'")
), hu = A('"', A(/[^<&"]/, "|", Zt), "*", '"', "|", "'", A(/[^<&']/, "|", Zt), "*", "'"), Iu = Dt(Jt, ":"), Cu = Dt(Na, ":"), Za = D(Iu, Cu, "*"), nr = D(Za, A(":", Za), "?"), Du = D("^", nr, "$"), vu = D("(", nr, ")"), vt = A(/"[^"]*"|'[^']*'/), Su = D(/^<\?/, "(", ge, ")", A(b, "(", Ge, "*?)"), "?", /\?>/), en = /[\x20\x0D\x0Aa-zA-Z0-9-'()+,./:=?;!*#@$_%]/, or = A('"', en, '*"', "|", "'", Dt(en, "'"), "*'"), Ao = "<!--", go = "-->", Ru = D(Ao, A(Dt(Ge, "-"), "|", D("-", Dt(Ge, "-"))), "*", go), tn = "#PCDATA", Lu = A(
  D(/\(/, X, tn, A(X, /\|/, X, nr), "*", X, /\)\*/),
  "|",
  D(/\(/, X, tn, X, /\)/)
), Ou = /[?*+]?/, yu = D(
  /\([^>]+\)/,
  Ou
  /*regg(choice, '|', seq), _children_quantity*/
), bu = A("EMPTY", "|", "ANY", "|", Lu, "|", yu), Uu = "<!ELEMENT", wu = D(Uu, b, A(nr, "|", er), b, A(bu, "|", er), X, ">"), Fu = D("NOTATION", b, /\(/, X, ge, A(X, /\|/, X, ge), "*", X, /\)/), Mu = D(/\(/, X, Ja, A(X, /\|/, X, Ja), "*", X, /\)/), xu = A(Fu, "|", Mu), Pu = A(/CDATA|ID|IDREF|IDREFS|ENTITY|ENTITIES|NMTOKEN|NMTOKENS/, "|", xu), Bu = A(/#REQUIRED|#IMPLIED/, "|", A(A("#FIXED", b), "?", hu)), Xu = A(b, ge, b, Pu, b, Bu), ku = "<!ATTLIST", $u = D(ku, b, ge, Xu, "*", X, ">"), ua = "about:legacy-compat", qu = A('"' + ua + '"', "|", "'" + ua + "'"), ga = "SYSTEM", Rr = "PUBLIC", Lr = A(A(ga, b, vt), "|", A(Rr, b, or, b, vt)), Gu = D(
  "^",
  A(
    A(ga, b, "(?<SystemLiteralOnly>", vt, ")"),
    "|",
    A(Rr, b, "(?<PubidLiteral>", or, ")", b, "(?<SystemLiteral>", vt, ")")
  )
), Vu = D("^", or, "$"), Hu = D("^", vt, "$"), zu = A(b, "NDATA", b, ge), ju = A(Aa, "|", A(Lr, zu, "?")), ho = "<!ENTITY", Yu = D(ho, b, ge, b, ju, X, ">"), Ku = A(Aa, "|", Lr), Wu = D(ho, b, "%", b, ge, b, Ku, X, ">"), Qu = A(Yu, "|", Wu), Ju = D(Rr, b, or), Zu = D("<!NOTATION", b, ge, b, A(Lr, "|", Ju), X, ">"), ha = D(X, "=", X), rn = /1[.]\d+/, ed = D(b, "version", ha, A("'", rn, "'", "|", '"', rn, '"')), an = /[A-Za-z][-A-Za-z0-9._]*/, td = A(b, "encoding", ha, A('"', an, '"', "|", "'", an, "'")), rd = A(b, "standalone", ha, A("'", A("yes", "|", "no"), "'", "|", '"', A("yes", "|", "no"), '"')), ad = D(/^<\?xml/, ed, td, "?", rd, "?", X, /\?>/), nd = "<!DOCTYPE", od = "<![CDATA[", sd = "]]>", id = /<!\[CDATA\[/, cd = /\]\]>/, ud = D(Ge, "*?", cd), dd = D(id, ud);
g.chars = qe;
g.chars_without = Dt;
g.detectUnicodeSupport = No;
g.reg = D;
g.regg = A;
g.ABOUT_LEGACY_COMPAT = ua;
g.ABOUT_LEGACY_COMPAT_SystemLiteral = qu;
g.AttlistDecl = $u;
g.CDATA_START = od;
g.CDATA_END = sd;
g.CDSect = dd;
g.Char = Ge;
g.Comment = Ru;
g.COMMENT_START = Ao;
g.COMMENT_END = go;
g.DOCTYPE_DECL_START = nd;
g.elementdecl = wu;
g.EntityDecl = Qu;
g.EntityValue = Aa;
g.ExternalID = Lr;
g.ExternalID_match = Gu;
g.Name = ge;
g.NotationDecl = Zu;
g.Reference = Zt;
g.PEReference = er;
g.PI = Su;
g.PUBLIC = Rr;
g.PubidLiteral = or;
g.PubidLiteral_match = Vu;
g.QName = nr;
g.QName_exact = Du;
g.QName_group = vu;
g.S = b;
g.SChar_s = fu;
g.S_OPT = X;
g.SYSTEM = ga;
g.SystemLiteral = vt;
g.SystemLiteral_match = Hu;
g.InvalidChar = _u;
g.UNICODE_REPLACEMENT_CHARACTER = Tu;
g.UNICODE_SUPPORT = yt;
g.XMLDecl = ad;
var Ne = $, Se = Ne.find, ld = Ne.hasDefaultHTMLNamespace, St = Ne.hasOwn, Ed = Ne.isHTMLMimeType, md = Ne.isHTMLRawTextElement, pd = Ne.isHTMLVoidElement, zt = Ne.MIME_TYPE, Re = Ne.NAMESPACE, re = Symbol(), Io = st, T = Io.DOMException, Ee = Io.DOMExceptionName, Y = g;
function ne(t) {
  if (t !== re)
    throw new TypeError("Illegal constructor");
}
function Td(t) {
  return t !== "";
}
function _d(t) {
  return t ? t.split(/[\t\n\f\r ]+/).filter(Td) : [];
}
function fd(t, e) {
  return St(t, e) || (t[e] = !0), t;
}
function nn(t) {
  if (!t) return [];
  var e = _d(t);
  return Object.keys(e.reduce(fd, {}));
}
function Nd(t) {
  return function(e) {
    return t && t.indexOf(e) !== -1;
  };
}
function Co(t) {
  if (!Y.QName_exact.test(t))
    throw new T(T.INVALID_CHARACTER_ERR, 'invalid character in qualified name "' + t + '"');
}
function da(t, e) {
  Co(e), t = t || null;
  var r = null, a = e;
  if (e.indexOf(":") >= 0) {
    var n = e.split(":");
    r = n[0], a = n[1];
  }
  if (r !== null && t === null)
    throw new T(T.NAMESPACE_ERR, "prefix is non-null and namespace is null");
  if (r === "xml" && t !== Ne.NAMESPACE.XML)
    throw new T(T.NAMESPACE_ERR, 'prefix is "xml" and namespace is not the XML namespace');
  if ((r === "xmlns" || e === "xmlns") && t !== Ne.NAMESPACE.XMLNS)
    throw new T(
      T.NAMESPACE_ERR,
      'either qualifiedName or prefix is "xmlns" and namespace is not the XMLNS namespace'
    );
  if (t === Ne.NAMESPACE.XMLNS && r !== "xmlns" && e !== "xmlns")
    throw new T(
      T.NAMESPACE_ERR,
      'namespace is the XMLNS namespace and neither qualifiedName nor prefix is "xmlns"'
    );
  return [t, r, a];
}
function bt(t, e) {
  for (var r in t)
    St(t, r) && (e[r] = t[r]);
}
function oe(t, e) {
  var r = t.prototype;
  if (!(r instanceof e)) {
    let a = function() {
    };
    a.prototype = e.prototype, a = new a(), bt(r, a), t.prototype = r = a;
  }
  r.constructor != t && (typeof t != "function" && console.error("unknown Class:" + t), r.constructor = t);
}
var se = {}, Te = se.ELEMENT_NODE = 1, Rt = se.ATTRIBUTE_NODE = 2, hr = se.TEXT_NODE = 3, Do = se.CDATA_SECTION_NODE = 4, vo = se.ENTITY_REFERENCE_NODE = 5, Ad = se.ENTITY_NODE = 6, Ia = se.PROCESSING_INSTRUCTION_NODE = 7, Ca = se.COMMENT_NODE = 8, Ct = se.DOCUMENT_NODE = 9, So = se.DOCUMENT_TYPE_NODE = 10, $e = se.DOCUMENT_FRAGMENT_NODE = 11, gd = se.NOTATION_NODE = 12, k = Ne.freeze({
  DOCUMENT_POSITION_DISCONNECTED: 1,
  DOCUMENT_POSITION_PRECEDING: 2,
  DOCUMENT_POSITION_FOLLOWING: 4,
  DOCUMENT_POSITION_CONTAINS: 8,
  DOCUMENT_POSITION_CONTAINED_BY: 16,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
});
function Ro(t, e) {
  if (e.length < t.length) return Ro(e, t);
  var r = null;
  for (var a in t) {
    if (t[a] !== e[a]) return r;
    r = t[a];
  }
  return r;
}
function on(t) {
  return t.guid || (t.guid = Math.random()), t.guid;
}
function H() {
}
H.prototype = {
  /**
   * The number of nodes in the list. The range of valid child node indices is 0 to length-1
   * inclusive.
   *
   * @type {number}
   */
  length: 0,
  /**
   * Returns the item at `index`. If index is greater than or equal to the number of nodes in
   * the list, this returns null.
   *
   * @param index
   * Unsigned long Index into the collection.
   * @returns {Node | null}
   * The node at position `index` in the NodeList,
   * or null if that is not a valid index.
   */
  item: function(t) {
    return t >= 0 && t < this.length ? this[t] : null;
  },
  /**
   * Returns a string representation of the NodeList.
   *
   * Accepts the same `options` object as `XMLSerializer.prototype.serializeToString`
   * (`requireWellFormed`, `splitCDATASections`, `nodeFilter`). Passing a function is treated as
   * a legacy `nodeFilter` for backward compatibility.
   *
   * @param {Object | function} [options]
   * @param {boolean} [options.requireWellFormed=false]
   * @param {boolean} [options.splitCDATASections=true]
   * @param {function} [options.nodeFilter]
   * @returns {string}
   */
  toString: function(t) {
    var e;
    typeof t == "function" ? e = { requireWellFormed: !1, splitCDATASections: !0, nodeFilter: t } : t ? e = {
      requireWellFormed: !!t.requireWellFormed,
      splitCDATASections: t.splitCDATASections !== !1,
      nodeFilter: t.nodeFilter || null
    } : e = { requireWellFormed: !1, splitCDATASections: !0, nodeFilter: null };
    for (var r = [], a = 0; a < this.length; a++)
      Sa(this[a], r, null, e);
    return r.join("");
  },
  /**
   * Filters the NodeList based on a predicate.
   *
   * @param {function(Node): boolean} predicate
   * - A predicate function to filter the NodeList.
   * @returns {Node[]}
   * An array of nodes that satisfy the predicate.
   * @private
   */
  filter: function(t) {
    return Array.prototype.filter.call(this, t);
  },
  /**
   * Returns the first index at which a given node can be found in the NodeList, or -1 if it is
   * not present.
   *
   * @param {Node} item
   * - The Node item to locate in the NodeList.
   * @returns {number}
   * The first index of the node in the NodeList; -1 if not found.
   * @private
   */
  indexOf: function(t) {
    return Array.prototype.indexOf.call(this, t);
  }
};
H.prototype[Symbol.iterator] = function() {
  var t = this, e = 0;
  return {
    next: function() {
      return e < t.length ? {
        value: t[e++],
        done: !1
      } : {
        done: !0
      };
    },
    return: function() {
      return {
        done: !0
      };
    }
  };
};
function ve(t, e) {
  this._node = t, this._refresh = e, Or(this);
}
function Or(t) {
  var e = t._node._inc || t._node.ownerDocument._inc;
  if (t._inc !== e) {
    var r = t._refresh(t._node);
    if (Xo(t, "length", r.length), !t.$$length || r.length < t.$$length)
      for (var a = r.length; a in t; a++)
        St(t, a) && delete t[a];
    bt(r, t), t._inc = e;
  }
}
ve.prototype.item = function(t) {
  return Or(this), this[t] || null;
};
oe(ve, H);
function Lt() {
}
function Lo(t, e) {
  for (var r = 0; r < t.length; ) {
    if (t[r] === e)
      return r;
    r++;
  }
}
function hd(t, e, r, a) {
  if (a ? e[Lo(e, a)] = r : (e[e.length] = r, e.length++), t) {
    r.ownerElement = t;
    var n = t.ownerDocument;
    n && (a && bo(n, t, a), Id(n, t, r));
  }
}
function sn(t, e, r) {
  var a = Lo(e, r);
  if (a >= 0) {
    for (var n = e.length - 1; a <= n; )
      e[a] = e[++a];
    if (e.length = n, t) {
      var o = t.ownerDocument;
      o && bo(o, t, r), r.ownerElement = null;
    }
  }
}
Lt.prototype = {
  length: 0,
  item: H.prototype.item,
  /**
   * Get an attribute by name. Note: Name is in lower case in case of HTML namespace and
   * document.
   *
   * @param {string} localName
   * The local name of the attribute.
   * @returns {Attr | null}
   * The attribute with the given local name, or null if no such attribute exists.
   * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-name
   */
  getNamedItem: function(t) {
    this._ownerElement && this._ownerElement._isInHTMLDocumentAndNamespace() && (t = t.toLowerCase());
    for (var e = 0; e < this.length; ) {
      var r = this[e];
      if (r.nodeName === t)
        return r;
      e++;
    }
    return null;
  },
  /**
   * Set an attribute.
   *
   * @param {Attr} attr
   * The attribute to set.
   * @returns {Attr | null}
   * The old attribute with the same local name and namespace URI as the new one, or null if no
   * such attribute exists.
   * @throws {DOMException}
   * With code:
   * - {@link INUSE_ATTRIBUTE_ERR} - If the attribute is already an attribute of another
   * element.
   * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
   */
  setNamedItem: function(t) {
    var e = t.ownerElement;
    if (e && e !== this._ownerElement)
      throw new T(T.INUSE_ATTRIBUTE_ERR);
    var r = this.getNamedItemNS(t.namespaceURI, t.localName);
    return r === t ? t : (hd(this._ownerElement, this, t, r), r);
  },
  /**
   * Set an attribute, replacing an existing attribute with the same local name and namespace
   * URI if one exists.
   *
   * @param {Attr} attr
   * The attribute to set.
   * @returns {Attr | null}
   * The old attribute with the same local name and namespace URI as the new one, or null if no
   * such attribute exists.
   * @throws {DOMException}
   * Throws a DOMException with the name "InUseAttributeError" if the attribute is already an
   * attribute of another element.
   * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
   */
  setNamedItemNS: function(t) {
    return this.setNamedItem(t);
  },
  /**
   * Removes an attribute specified by the local name.
   *
   * @param {string} localName
   * The local name of the attribute to be removed.
   * @returns {Attr}
   * The attribute node that was removed.
   * @throws {DOMException}
   * With code:
   * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given name is found.
   * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditem
   * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-name
   */
  removeNamedItem: function(t) {
    var e = this.getNamedItem(t);
    if (!e)
      throw new T(T.NOT_FOUND_ERR, t);
    return sn(this._ownerElement, this, e), e;
  },
  /**
   * Removes an attribute specified by the namespace and local name.
   *
   * @param {string | null} namespaceURI
   * The namespace URI of the attribute to be removed.
   * @param {string} localName
   * The local name of the attribute to be removed.
   * @returns {Attr}
   * The attribute node that was removed.
   * @throws {DOMException}
   * With code:
   * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given namespace URI and local
   * name is found.
   * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditemns
   * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-namespace
   */
  removeNamedItemNS: function(t, e) {
    var r = this.getNamedItemNS(t, e);
    if (!r)
      throw new T(T.NOT_FOUND_ERR, t ? t + " : " + e : e);
    return sn(this._ownerElement, this, r), r;
  },
  /**
   * Get an attribute by namespace and local name.
   *
   * @param {string | null} namespaceURI
   * The namespace URI of the attribute.
   * @param {string} localName
   * The local name of the attribute.
   * @returns {Attr | null}
   * The attribute with the given namespace URI and local name, or null if no such attribute
   * exists.
   * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-namespace
   */
  getNamedItemNS: function(t, e) {
    t || (t = null);
    for (var r = 0; r < this.length; ) {
      var a = this[r];
      if (a.localName === e && a.namespaceURI === t)
        return a;
      r++;
    }
    return null;
  }
};
Lt.prototype[Symbol.iterator] = function() {
  var t = this, e = 0;
  return {
    next: function() {
      return e < t.length ? {
        value: t[e++],
        done: !1
      } : {
        done: !0
      };
    },
    return: function() {
      return {
        done: !0
      };
    }
  };
};
function Oo() {
}
Oo.prototype = {
  /**
   * Test if the DOM implementation implements a specific feature and version, as specified in
   * {@link https://www.w3.org/TR/DOM-Level-3-Core/core.html#DOMFeatures DOM Features}.
   *
   * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given
   * feature is supported. The different implementations fairly diverged in what kind of
   * features were reported. The latest version of the spec settled to force this method to
   * always return true, where the functionality was accurate and in use.
   *
   * @deprecated
   * It is deprecated and modern browsers return true in all cases.
   * @function DOMImplementation#hasFeature
   * @param {string} feature
   * The name of the feature to test.
   * @param {string} [version]
   * This is the version number of the feature to test.
   * @returns {boolean}
   * Always returns true.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
   * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-5CED94D7 DOM Level 3 Core
   */
  hasFeature: function(t, e) {
    return !0;
  },
  /**
   * Creates a DOM Document object of the specified type with its document element. Note that
   * based on the {@link DocumentType}
   * given to create the document, the implementation may instantiate specialized
   * {@link Document} objects that support additional features than the "Core", such as "HTML"
   * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML}.
   * On the other hand, setting the {@link DocumentType} after the document was created makes
   * this very unlikely to happen. Alternatively, specialized {@link Document} creation methods,
   * such as createHTMLDocument
   * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML},
   * can be used to obtain specific types of {@link Document} objects.
   *
   * __It behaves slightly different from the description in the living standard__:
   * - There is no interface/class `XMLDocument`, it returns a `Document`
   * instance (with it's `type` set to `'xml'`).
   * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
   *
   * @function DOMImplementation.createDocument
   * @param {string | null} namespaceURI
   * The
   * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-namespaceURI namespace URI}
   * of the document element to create or null.
   * @param {string | null} qualifiedName
   * The
   * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified name}
   * of the document element to be created or null.
   * @param {DocumentType | null} [doctype=null]
   * The type of document to be created or null. When doctype is not null, its
   * {@link Node#ownerDocument} attribute is set to the document being created. Default is
   * `null`
   * @returns {Document}
   * A new {@link Document} object with its document element. If the NamespaceURI,
   * qualifiedName, and doctype are null, the returned {@link Document} is empty with no
   * document element.
   * @throws {DOMException}
   * With code:
   *
   * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
   * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
   * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed, if the qualifiedName has a
   * prefix and the namespaceURI is null, or if the qualifiedName is null and the namespaceURI
   * is different from null, or if the qualifiedName has a prefix that is "xml" and the
   * namespaceURI is different from "{@link http://www.w3.org/XML/1998/namespace}"
   * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#Namespaces XML Namespaces},
   * or if the DOM implementation does not support the "XML" feature but a non-null namespace
   * URI was provided, since namespaces were defined by XML.
   * - `WRONG_DOCUMENT_ERR`: Raised if doctype has already been used with a different document
   * or was created from a different implementation.
   * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
   * "XML" and the language exposed through the Document does not support XML Namespaces (such
   * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
   * @since DOM Level 2.
   * @see {@link #createHTMLDocument}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument DOM Living Standard
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-2-Core-DOM-createDocument DOM
   *      Level 3 Core
   * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM
   *      Level 2 Core (initial)
   */
  createDocument: function(t, e, r) {
    var a = zt.XML_APPLICATION;
    t === Re.HTML ? a = zt.XML_XHTML_APPLICATION : t === Re.SVG && (a = zt.XML_SVG_IMAGE);
    var n = new Ue(re, { contentType: a });
    if (n.implementation = this, n.childNodes = new H(), n.doctype = r || null, r && n.appendChild(r), e) {
      var o = n.createElementNS(t, e);
      n.appendChild(o);
    }
    return n;
  },
  /**
   * Creates an empty DocumentType node. Entity declarations and notations are not made
   * available. Entity reference expansions and default attribute additions do not occur.
   *
   * **This behavior is slightly different from the one in the specs**:
   * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
   * - `publicId` and `systemId` contain the raw data including any possible quotes,
   *   so they can always be serialized back to the original value
   * - `internalSubset` contains the raw string between `[` and `]` if present,
   *   but is not parsed or validated in any form.
   *
   * @function DOMImplementation#createDocumentType
   * @param {string} qualifiedName
   * The {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified
   * name} of the document type to be created.
   * @param {string} [publicId]
   * The external subset public identifier. Stored verbatim including surrounding quotes.
   * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
   * if the value is non-empty and does not match the XML `PubidLiteral` production
   * (W3C DOM Parsing §3.2.1.3; XML 1.0 production [12]). Creation-time validation is not
   * enforced — deferred to a future breaking release.
   * @param {string} [systemId]
   * The external subset system identifier. Stored verbatim including surrounding quotes.
   * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
   * if the value is non-empty and does not match the XML `SystemLiteral` production
   * (W3C DOM Parsing §3.2.1.3; XML 1.0 production [11]). Creation-time validation is not
   * enforced — deferred to a future breaking release.
   * @param {string} [internalSubset]
   * The internal subset or an empty string if it is not present. Stored verbatim.
   * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
   * if the value contains `"]>"`. Creation-time validation is not enforced.
   * @returns {DocumentType}
   * A new {@link DocumentType} node with {@link Node#ownerDocument} set to null.
   * @throws {DOMException}
   * With code:
   *
   * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
   * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
   * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed.
   * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
   * "XML" and the language exposed through the Document does not support XML Namespaces (such
   * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
   * @since DOM Level 2.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType
   *      MDN
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living
   *      Standard
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-3-Core-DOM-createDocType DOM
   *      Level 3 Core
   * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM
   *      Level 2 Core
   * @see https://github.com/xmldom/xmldom/blob/master/CHANGELOG.md#050
   * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-Core-DocType-internalSubset
   * @prettierignore
   */
  createDocumentType: function(t, e, r, a) {
    Co(t);
    var n = new Ur(re);
    return n.name = t, n.nodeName = t, n.publicId = e || "", n.systemId = r || "", n.internalSubset = a || "", n.childNodes = new H(), n;
  },
  /**
   * Returns an HTML document, that might already have a basic DOM structure.
   *
   * __It behaves slightly different from the description in the living standard__:
   * - If the first argument is `false` no initial nodes are added (steps 3-7 in the specs are
   * omitted)
   * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
   *
   * @param {string | false} [title]
   * A string containing the title to give the new HTML document.
   * @returns {Document}
   * The HTML document.
   * @since WHATWG Living Standard.
   * @see {@link #createDocument}
   * @see https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
   * @see https://dom.spec.whatwg.org/#html-document
   */
  createHTMLDocument: function(t) {
    var e = new Ue(re, { contentType: zt.HTML });
    if (e.implementation = this, e.childNodes = new H(), t !== !1) {
      e.doctype = this.createDocumentType("html"), e.doctype.ownerDocument = e, e.appendChild(e.doctype);
      var r = e.createElement("html");
      e.appendChild(r);
      var a = e.createElement("head");
      if (r.appendChild(a), typeof t == "string") {
        var n = e.createElement("title");
        n.appendChild(e.createTextNode(t)), a.appendChild(n);
      }
      r.appendChild(e.createElement("body"));
    }
    return e;
  }
};
function L(t) {
  ne(t);
}
L.prototype = {
  /**
   * The first child of this node.
   *
   * @type {Node | null}
   */
  firstChild: null,
  /**
   * The last child of this node.
   *
   * @type {Node | null}
   */
  lastChild: null,
  /**
   * The previous sibling of this node.
   *
   * @type {Node | null}
   */
  previousSibling: null,
  /**
   * The next sibling of this node.
   *
   * @type {Node | null}
   */
  nextSibling: null,
  /**
   * The parent node of this node.
   *
   * @type {Node | null}
   */
  parentNode: null,
  /**
   * The parent element of this node.
   *
   * @type {Element | null}
   */
  get parentElement() {
    return this.parentNode && this.parentNode.nodeType === this.ELEMENT_NODE ? this.parentNode : null;
  },
  /**
   * The child nodes of this node.
   *
   * @type {NodeList}
   */
  childNodes: null,
  /**
   * The document object associated with this node.
   *
   * @type {Document | null}
   */
  ownerDocument: null,
  /**
   * The value of this node.
   *
   * @type {string | null}
   */
  nodeValue: null,
  /**
   * The namespace URI of this node.
   *
   * @type {string | null}
   */
  namespaceURI: null,
  /**
   * The prefix of the namespace for this node.
   *
   * @type {string | null}
   */
  prefix: null,
  /**
   * The local part of the qualified name of this node.
   *
   * @type {string | null}
   */
  localName: null,
  /**
   * The baseURI is currently always `about:blank`,
   * since that's what happens when you create a document from scratch.
   *
   * @type {'about:blank'}
   */
  baseURI: "about:blank",
  /**
   * Is true if this node is part of a document.
   *
   * @type {boolean}
   */
  get isConnected() {
    var t = this.getRootNode();
    return t && t.nodeType === t.DOCUMENT_NODE;
  },
  /**
   * Checks whether `other` is an inclusive descendant of this node.
   *
   * @param {Node | null | undefined} other
   * The node to check.
   * @returns {boolean}
   * True if `other` is an inclusive descendant of this node; false otherwise.
   * @see https://dom.spec.whatwg.org/#dom-node-contains
   */
  contains: function(t) {
    if (!t) return !1;
    var e = t;
    do {
      if (this === e) return !0;
      e = e.parentNode;
    } while (e);
    return !1;
  },
  /**
   * @typedef GetRootNodeOptions
   * @property {boolean} [composed=false]
   */
  /**
   * Searches for the root node of this node.
   *
   * **This behavior is slightly different from the in the specs**:
   * - ignores `options.composed`, since `ShadowRoot`s are unsupported, always returns root.
   *
   * @param {GetRootNodeOptions} [options]
   * @returns {Node}
   * Root node.
   * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
   * @see https://dom.spec.whatwg.org/#concept-shadow-including-root
   */
  getRootNode: function(t) {
    var e = this;
    do {
      if (!e.parentNode)
        return e;
      e = e.parentNode;
    } while (e);
  },
  /**
   * Checks whether the given node is equal to this node.
   *
   * Two nodes are equal when they have the same type, defining characteristics (for the type),
   * and the same childNodes. The comparison is iterative to avoid stack overflows on
   * deeply-nested trees. Attribute nodes of each Element pair are also pushed onto the stack
   * and compared the same way.
   *
   * @param {Node} [otherNode]
   * @returns {boolean}
   * @see https://dom.spec.whatwg.org/#concept-node-equals
   * @see ../docs/walk-dom.md.
   */
  isEqualNode: function(t) {
    if (!t) return !1;
    for (var e = [{ node: this, other: t }]; e.length > 0; ) {
      var r = e.pop(), a = r.node, n = r.other;
      if (a.nodeType !== n.nodeType) return !1;
      switch (a.nodeType) {
        case a.DOCUMENT_TYPE_NODE:
          if (a.name !== n.name || a.publicId !== n.publicId || a.systemId !== n.systemId) return !1;
          break;
        case a.ELEMENT_NODE:
          if (a.namespaceURI !== n.namespaceURI || a.prefix !== n.prefix || a.localName !== n.localName || a.attributes.length !== n.attributes.length) return !1;
          for (var o = 0; o < a.attributes.length; o++) {
            var s = a.attributes.item(o), i = n.getAttributeNodeNS(s.namespaceURI, s.localName);
            if (!i) return !1;
            e.push({ node: s, other: i });
          }
          break;
        case a.ATTRIBUTE_NODE:
          if (a.namespaceURI !== n.namespaceURI || a.localName !== n.localName || a.value !== n.value) return !1;
          break;
        case a.PROCESSING_INSTRUCTION_NODE:
          if (a.target !== n.target || a.data !== n.data) return !1;
          break;
        case a.TEXT_NODE:
        case a.CDATA_SECTION_NODE:
        case a.COMMENT_NODE:
          if (a.data !== n.data) return !1;
          break;
      }
      if (a.childNodes.length !== n.childNodes.length) return !1;
      for (var o = a.childNodes.length - 1; o >= 0; o--)
        e.push({ node: a.childNodes[o], other: n.childNodes[o] });
    }
    return !0;
  },
  /**
   * Checks whether or not the given node is this node.
   *
   * @param {Node} [otherNode]
   */
  isSameNode: function(t) {
    return this === t;
  },
  /**
   * Inserts a node before a reference node as a child of this node.
   *
   * @param {Node} newChild
   * The new child node to be inserted.
   * @param {Node | null} refChild
   * The reference node before which newChild will be inserted.
   * @returns {Node}
   * The new child node successfully inserted.
   * @throws {DOMException}
   * Throws a DOMException if inserting the node would result in a DOM tree that is not
   * well-formed, or if `child` is provided but is not a child of `parent`.
   * See {@link _insertBefore} for more details.
   * @since Modified in DOM L2
   */
  insertBefore: function(t, e) {
    return Ir(this, t, e);
  },
  /**
   * Replaces an old child node with a new child node within this node.
   *
   * @param {Node} newChild
   * The new node that is to replace the old node.
   * If it already exists in the DOM, it is removed from its original position.
   * @param {Node} oldChild
   * The existing child node to be replaced.
   * @returns {Node}
   * Returns the replaced child node.
   * @throws {DOMException}
   * Throws a DOMException if replacing the node would result in a DOM tree that is not
   * well-formed, or if `oldChild` is not a child of `this`.
   * This can also occur if the pre-replacement validity assertion fails.
   * See {@link _insertBefore}, {@link Node.removeChild}, and
   * {@link assertPreReplacementValidityInDocument} for more details.
   * @see https://dom.spec.whatwg.org/#concept-node-replace
   */
  replaceChild: function(t, e) {
    Ir(this, t, e, Mo), e && this.removeChild(e);
  },
  /**
   * Removes an existing child node from this node.
   *
   * @param {Node} oldChild
   * The child node to be removed.
   * @returns {Node}
   * Returns the removed child node.
   * @throws {DOMException}
   * Throws a DOMException if `oldChild` is not a child of `this`.
   * See {@link _removeChild} for more details.
   */
  removeChild: function(t) {
    return wo(this, t);
  },
  /**
   * Appends a child node to this node.
   *
   * @param {Node} newChild
   * The child node to be appended to this node.
   * If it already exists in the DOM, it is removed from its original position.
   * @returns {Node}
   * Returns the appended child node.
   * @throws {DOMException}
   * Throws a DOMException if appending the node would result in a DOM tree that is not
   * well-formed, or if `newChild` is not a valid Node.
   * See {@link insertBefore} for more details.
   */
  appendChild: function(t) {
    return this.insertBefore(t, null);
  },
  /**
   * Determines whether this node has any child nodes.
   *
   * @returns {boolean}
   * Returns true if this node has any child nodes, and false otherwise.
   */
  hasChildNodes: function() {
    return this.firstChild != null;
  },
  /**
   * Creates a copy of the calling node.
   *
   * @param {boolean} deep
   * If true, the contents of the node are recursively copied.
   * If false, only the node itself (and its attributes, if it is an element) are copied.
   * @returns {Node}
   * Returns the newly created copy of the node.
   * @throws {DOMException}
   * May throw a DOMException if operations within {@link Element#setAttributeNode} or
   * {@link Node#appendChild} (which are potentially invoked in this method) do not meet their
   * specific constraints.
   * @see {@link cloneNode}
   */
  cloneNode: function(t) {
    return Bo(this.ownerDocument || this, this, t);
  },
  /**
   * Puts the specified node and all of its subtree into a "normalized" form. In a normalized
   * subtree, no text nodes in the subtree are empty and there are no adjacent text nodes.
   *
   * Specifically, this method merges any adjacent text nodes (i.e., nodes for which `nodeType`
   * is `TEXT_NODE`) into a single node with the combined data. It also removes any empty text
   * nodes.
   *
   * This method iterativly traverses all child nodes to normalize all descendent nodes within
   * the subtree.
   *
   * @throws {DOMException}
   * May throw a DOMException if operations within removeChild or appendData (which are
   * potentially invoked in this method) do not meet their specific constraints.
   * @since Modified in DOM Level 2
   * @see {@link Node.removeChild}
   * @see {@link CharacterData.appendData}
   * @see ../docs/walk-dom.md.
   */
  normalize: function() {
    K(this, null, {
      enter: function(t) {
        for (var e = t.firstChild; e; ) {
          var r = e.nextSibling;
          r !== null && r.nodeType === hr && e.nodeType === hr ? (t.removeChild(r), e.appendData(r.data)) : e = r;
        }
        return !0;
      }
    });
  },
  /**
   * Checks whether the DOM implementation implements a specific feature and its version.
   *
   * @deprecated
   * Since `DOMImplementation.hasFeature` is deprecated and always returns true.
   * @param {string} feature
   * The package name of the feature to test. This is the same name that can be passed to the
   * method `hasFeature` on `DOMImplementation`.
   * @param {string} version
   * This is the version number of the package name to test.
   * @returns {boolean}
   * Returns true in all cases in the current implementation.
   * @since Introduced in DOM Level 2
   * @see {@link DOMImplementation.hasFeature}
   */
  isSupported: function(t, e) {
    return this.ownerDocument.implementation.hasFeature(t, e);
  },
  /**
   * Look up the prefix associated to the given namespace URI, starting from this node.
   * **The default namespace declarations are ignored by this method.**
   * See Namespace Prefix Lookup for details on the algorithm used by this method.
   *
   * **This behavior is different from the in the specs**:
   * - no node type specific handling
   * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
   *
   * @param {string | null} namespaceURI
   * The namespace URI for which to find the associated prefix.
   * @returns {string | null}
   * The associated prefix, if found; otherwise, null.
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
   * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
   * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
   * @see https://github.com/xmldom/xmldom/issues/322
   * @prettierignore
   */
  lookupPrefix: function(t) {
    for (var e = this; e; ) {
      var r = e._nsMap;
      if (r) {
        for (var a in r)
          if (St(r, a) && r[a] === t)
            return a;
      }
      e = e.nodeType == Rt ? e.ownerDocument : e.parentNode;
    }
    return null;
  },
  /**
   * This function is used to look up the namespace URI associated with the given prefix,
   * starting from this node.
   *
   * **This behavior is different from the in the specs**:
   * - no node type specific handling
   * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
   *
   * @param {string | null} prefix
   * The prefix for which to find the associated namespace URI.
   * @returns {string | null}
   * The associated namespace URI, if found; otherwise, null.
   * @since DOM Level 3
   * @see https://dom.spec.whatwg.org/#dom-node-lookupnamespaceuri
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespaceURI
   * @prettierignore
   */
  lookupNamespaceURI: function(t) {
    for (var e = this; e; ) {
      var r = e._nsMap;
      if (r && St(r, t))
        return r[t];
      e = e.nodeType == Rt ? e.ownerDocument : e.parentNode;
    }
    return null;
  },
  /**
   * Determines whether the given namespace URI is the default namespace.
   *
   * The function works by looking up the prefix associated with the given namespace URI. If no
   * prefix is found (i.e., the namespace URI is not registered in the namespace map of this
   * node or any of its ancestors), it returns `true`, implying the namespace URI is considered
   * the default.
   *
   * **This behavior is different from the in the specs**:
   * - no node type specific handling
   * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
   *
   * @param {string | null} namespaceURI
   * The namespace URI to be checked.
   * @returns {boolean}
   * Returns true if the given namespace URI is the default namespace, false otherwise.
   * @since DOM Level 3
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isDefaultNamespace
   * @see https://dom.spec.whatwg.org/#dom-node-isdefaultnamespace
   * @prettierignore
   */
  isDefaultNamespace: function(t) {
    var e = this.lookupPrefix(t);
    return e == null;
  },
  /**
   * Compares the reference node with a node with regard to their position in the document and
   * according to the document order.
   *
   * @param {Node} other
   * The node to compare the reference node to.
   * @returns {number}
   * Returns how the node is positioned relatively to the reference node according to the
   * bitmask. 0 if reference node and given node are the same.
   * @since DOM Level 3
   * @see https://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/core.html#Node3-compare
   * @see https://dom.spec.whatwg.org/#dom-node-comparedocumentposition
   */
  compareDocumentPosition: function(t) {
    if (this === t) return 0;
    var e = t, r = this, a = null, n = null;
    if (e instanceof at && (a = e, e = a.ownerElement), r instanceof at && (n = r, r = n.ownerElement, a && e && r === e))
      for (var o = 0, s; s = r.attributes[o]; o++) {
        if (s === a)
          return k.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + k.DOCUMENT_POSITION_PRECEDING;
        if (s === n)
          return k.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + k.DOCUMENT_POSITION_FOLLOWING;
      }
    if (!e || !r || r.ownerDocument !== e.ownerDocument)
      return k.DOCUMENT_POSITION_DISCONNECTED + k.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + (on(r.ownerDocument) > on(e.ownerDocument) ? k.DOCUMENT_POSITION_FOLLOWING : k.DOCUMENT_POSITION_PRECEDING);
    if (n && e === r)
      return k.DOCUMENT_POSITION_CONTAINS + k.DOCUMENT_POSITION_PRECEDING;
    if (a && e === r)
      return k.DOCUMENT_POSITION_CONTAINED_BY + k.DOCUMENT_POSITION_FOLLOWING;
    for (var i = [], u = e.parentNode; u; ) {
      if (!n && u === r)
        return k.DOCUMENT_POSITION_CONTAINED_BY + k.DOCUMENT_POSITION_FOLLOWING;
      i.push(u), u = u.parentNode;
    }
    i.reverse();
    for (var c = [], l = r.parentNode; l; ) {
      if (!a && l === e)
        return k.DOCUMENT_POSITION_CONTAINS + k.DOCUMENT_POSITION_PRECEDING;
      c.push(l), l = l.parentNode;
    }
    c.reverse();
    var E = Ro(i, c);
    for (var m in E.childNodes) {
      var f = E.childNodes[m];
      if (f === r) return k.DOCUMENT_POSITION_FOLLOWING;
      if (f === e) return k.DOCUMENT_POSITION_PRECEDING;
      if (c.indexOf(f) >= 0) return k.DOCUMENT_POSITION_FOLLOWING;
      if (i.indexOf(f) >= 0) return k.DOCUMENT_POSITION_PRECEDING;
    }
    return 0;
  }
};
function yo(t) {
  return t == "<" && "&lt;" || t == ">" && "&gt;" || t == "&" && "&amp;" || t == '"' && "&quot;" || "&#" + t.charCodeAt() + ";";
}
bt(se, L);
bt(se, L.prototype);
bt(k, L);
bt(k, L.prototype);
function fr(t, e) {
  K(t, null, {
    enter: function(r) {
      return e(r) ? K.STOP : !0;
    }
  });
}
function K(t, e, r) {
  for (var a = [{ node: t, context: e, phase: K.ENTER }]; a.length > 0; ) {
    var n = a.pop();
    if (n.phase === K.ENTER) {
      var o = r.enter(n.node, n.context);
      if (o === K.STOP)
        return K.STOP;
      if (a.push({ node: n.node, context: o, phase: K.EXIT }), o == null)
        continue;
      for (var s = n.node.lastChild; s; )
        a.push({ node: s, context: o, phase: K.ENTER }), s = s.previousSibling;
    } else
      r.exit && r.exit(n.node, n.context);
  }
}
K.STOP = Symbol("walkDOM.STOP");
K.ENTER = 0;
K.EXIT = 1;
function Ue(t, e) {
  ne(t);
  var r = e || {};
  this.ownerDocument = this, this.contentType = r.contentType || zt.XML_APPLICATION, this.type = Ed(this.contentType) ? "html" : "xml";
}
function Id(t, e, r) {
  t && t._inc++;
  var a = r.namespaceURI;
  a === Re.XMLNS && (e._nsMap[r.prefix ? r.localName : ""] = r.value);
}
function bo(t, e, r, a) {
  t && t._inc++;
  var n = r.namespaceURI;
  n === Re.XMLNS && delete e._nsMap[r.prefix ? r.localName : ""];
}
function Uo(t, e, r) {
  if (t && t._inc) {
    t._inc++;
    var a = e.childNodes;
    if (r && !r.nextSibling)
      a[a.length++] = r;
    else {
      for (var n = e.firstChild, o = 0; n; )
        a[o++] = n, n = n.nextSibling;
      a.length = o, delete a[a.length];
    }
  }
}
function wo(t, e) {
  if (t !== e.parentNode)
    throw new T(T.NOT_FOUND_ERR, "child's parent is not parent");
  var r = e.previousSibling, a = e.nextSibling;
  return r ? r.nextSibling = a : t.firstChild = a, a ? a.previousSibling = r : t.lastChild = r, Uo(t.ownerDocument, t), e.parentNode = null, e.previousSibling = null, e.nextSibling = null, e;
}
function Cd(t) {
  return t && (t.nodeType === L.DOCUMENT_NODE || t.nodeType === L.DOCUMENT_FRAGMENT_NODE || t.nodeType === L.ELEMENT_NODE);
}
function Dd(t) {
  return t && (t.nodeType === L.CDATA_SECTION_NODE || t.nodeType === L.COMMENT_NODE || t.nodeType === L.DOCUMENT_FRAGMENT_NODE || t.nodeType === L.DOCUMENT_TYPE_NODE || t.nodeType === L.ELEMENT_NODE || t.nodeType === L.PROCESSING_INSTRUCTION_NODE || t.nodeType === L.TEXT_NODE);
}
function Ve(t) {
  return t && t.nodeType === L.DOCUMENT_TYPE_NODE;
}
function be(t) {
  return t && t.nodeType === L.ELEMENT_NODE;
}
function Fo(t) {
  return t && t.nodeType === L.TEXT_NODE;
}
function cn(t, e) {
  var r = t.childNodes || [];
  if (Se(r, be) || Ve(e))
    return !1;
  var a = Se(r, Ve);
  return !(e && a && r.indexOf(a) > r.indexOf(e));
}
function un(t, e) {
  var r = t.childNodes || [];
  function a(o) {
    return be(o) && o !== e;
  }
  if (Se(r, a))
    return !1;
  var n = Se(r, Ve);
  return !(e && n && r.indexOf(n) > r.indexOf(e));
}
function vd(t, e, r) {
  if (!Cd(t))
    throw new T(T.HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + t.nodeType);
  if (r && r.parentNode !== t)
    throw new T(T.NOT_FOUND_ERR, "child not in parent");
  if (
    // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
    !Dd(e) || // 5. If either `node` is a Text node and `parent` is a document,
    // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
    // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
    // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
    Ve(e) && t.nodeType !== L.DOCUMENT_NODE
  )
    throw new T(
      T.HIERARCHY_REQUEST_ERR,
      "Unexpected node type " + e.nodeType + " for parent node type " + t.nodeType
    );
}
function Sd(t, e, r) {
  var a = t.childNodes || [], n = e.childNodes || [];
  if (e.nodeType === L.DOCUMENT_FRAGMENT_NODE) {
    var o = n.filter(be);
    if (o.length > 1 || Se(n, Fo))
      throw new T(T.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
    if (o.length === 1 && !cn(t, r))
      throw new T(T.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
  }
  if (be(e) && !cn(t, r))
    throw new T(T.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
  if (Ve(e)) {
    if (Se(a, Ve))
      throw new T(T.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
    var s = Se(a, be);
    if (r && a.indexOf(s) < a.indexOf(r))
      throw new T(T.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
    if (!r && s)
      throw new T(T.HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
  }
}
function Mo(t, e, r) {
  var a = t.childNodes || [], n = e.childNodes || [];
  if (e.nodeType === L.DOCUMENT_FRAGMENT_NODE) {
    var o = n.filter(be);
    if (o.length > 1 || Se(n, Fo))
      throw new T(T.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
    if (o.length === 1 && !un(t, r))
      throw new T(T.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
  }
  if (be(e) && !un(t, r))
    throw new T(T.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
  if (Ve(e)) {
    if (Se(a, function(u) {
      return Ve(u) && u !== r;
    }))
      throw new T(T.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
    var s = Se(a, be);
    if (r && a.indexOf(s) < a.indexOf(r))
      throw new T(T.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
  }
}
function Ir(t, e, r, a) {
  vd(t, e, r), t.nodeType === L.DOCUMENT_NODE && (a || Sd)(t, e, r);
  var n = e.parentNode;
  if (n && n.removeChild(e), e.nodeType === $e) {
    var o = e.firstChild;
    if (o == null)
      return e;
    var s = e.lastChild;
  } else
    o = s = e;
  var i = r ? r.previousSibling : t.lastChild;
  o.previousSibling = i, s.nextSibling = r, i ? i.nextSibling = o : t.firstChild = o, r == null ? t.lastChild = s : r.previousSibling = s;
  do
    o.parentNode = t;
  while (o !== s && (o = o.nextSibling));
  return Uo(t.ownerDocument || t, t, e), e.nodeType == $e && (e.firstChild = e.lastChild = null), e;
}
Ue.prototype = {
  /**
   * The implementation that created this document.
   *
   * @type DOMImplementation
   * @readonly
   */
  implementation: null,
  nodeName: "#document",
  nodeType: Ct,
  /**
   * The DocumentType node of the document.
   *
   * @type DocumentType
   * @readonly
   */
  doctype: null,
  documentElement: null,
  _inc: 1,
  insertBefore: function(t, e) {
    if (t.nodeType === $e) {
      for (var r = t.firstChild; r; ) {
        var a = r.nextSibling;
        this.insertBefore(r, e), r = a;
      }
      return t;
    }
    return Ir(this, t, e), t.ownerDocument = this, this.documentElement === null && t.nodeType === Te && (this.documentElement = t), t;
  },
  removeChild: function(t) {
    var e = wo(this, t);
    return e === this.documentElement && (this.documentElement = null), e;
  },
  replaceChild: function(t, e) {
    Ir(this, t, e, Mo), t.ownerDocument = this, e && this.removeChild(e), be(t) && (this.documentElement = t);
  },
  /**
   * Imports a node from another document into this document, creating a new copy owned by this
   * document. The source node and its subtree are not modified.
   *
   * @param {Node} importedNode
   * The node to import.
   * @param {boolean} deep
   * If true, the contents of the node are recursively imported.
   * If false, only the node itself (and its attributes, if it is an element) are imported.
   * @returns {Node}
   * Returns the newly created import of the node.
   * @see {@link importNode}
   * @see {@link https://dom.spec.whatwg.org/#dom-document-importnode}
   */
  importNode: function(t, e) {
    return Rd(this, t, e);
  },
  // Introduced in DOM Level 2:
  getElementById: function(t) {
    var e = null;
    return fr(this.documentElement, function(r) {
      if (r.nodeType == Te && r.getAttribute("id") == t)
        return e = r, !0;
    }), e;
  },
  /**
   * Creates a new `Element` that is owned by this `Document`.
   * In HTML Documents `localName` is the lower cased `tagName`,
   * otherwise no transformation is being applied.
   * When `contentType` implies the HTML namespace, it will be set as `namespaceURI`.
   *
   * __This implementation differs from the specification:__ - The provided name is not checked
   * against the `Name` production,
   * so no related error will be thrown.
   * - There is no interface `HTMLElement`, it is always an `Element`.
   * - There is no support for a second argument to indicate using custom elements.
   *
   * @param {string} tagName
   * @returns {Element}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
   * @see https://dom.spec.whatwg.org/#dom-document-createelement
   * @see https://dom.spec.whatwg.org/#concept-create-element
   */
  createElement: function(t) {
    var e = new we(re);
    e.ownerDocument = this, this.type === "html" && (t = t.toLowerCase()), ld(this.contentType) && (e.namespaceURI = Re.HTML), e.nodeName = t, e.tagName = t, e.localName = t, e.childNodes = new H();
    var r = e.attributes = new Lt();
    return r._ownerElement = e, e;
  },
  /**
   * @returns {DocumentFragment}
   */
  createDocumentFragment: function() {
    var t = new wt(re);
    return t.ownerDocument = this, t.childNodes = new H(), t;
  },
  /**
   * @param {string} data
   * @returns {Text}
   */
  createTextNode: function(t) {
    var e = new sr(re);
    return e.ownerDocument = this, e.childNodes = new H(), e.appendData(t), e;
  },
  /**
   * @param {string} data
   * @returns {Comment}
   * @see https://dom.spec.whatwg.org/#dom-document-createcomment
   * @see https://www.w3.org/TR/xml/#NT-Comment XML 1.0 production [15]
   * @see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml §3.2.1.3
   *
   *      Note: no validation is performed at creation time. When the resulting document is
   *      serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
   *      if the comment data contains `--` anywhere, ends with `-`, or contains characters
   *      outside the XML Char production (W3C DOM Parsing §3.2.1.3). Without that option the
   *      data is emitted verbatim.
   */
  createComment: function(t) {
    var e = new yr(re);
    return e.ownerDocument = this, e.childNodes = new H(), e.appendData(t), e;
  },
  /**
   * Returns a new CDATASection node whose data is `data`.
   *
   * __This implementation differs from the specification:__ - calling this method on an HTML
   * document does not throw `NotSupportedError`.
   *
   * @param {string} data
   * @returns {CDATASection}
   * @throws {DOMException}
   * With code `INVALID_CHARACTER_ERR` if `data` contains `"]]>"`.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createCDATASection
   * @see https://dom.spec.whatwg.org/#dom-document-createcdatasection
   */
  createCDATASection: function(t) {
    if (t.indexOf("]]>") !== -1)
      throw new T(T.INVALID_CHARACTER_ERR, 'data contains "]]>"');
    var e = new br(re);
    return e.ownerDocument = this, e.childNodes = new H(), e.appendData(t), e;
  },
  /**
   * Returns a ProcessingInstruction node whose target is target and data is data.
   *
   * __This behavior is slightly different from the in the specs__:
   * - it does not do any input validation on the arguments and doesn't throw
   * "InvalidCharacterError".
   *
   * Note: When the resulting document is serialized with `requireWellFormed: true`, the
   * serializer throws `InvalidStateError` if `.target` contains `:` or is an ASCII
   * case-insensitive match for `"xml"`, or if `.data` contains `?>` or characters outside the
   * XML Char production (W3C DOM Parsing §3.2.1.7). Without that option the data is emitted
   * verbatim.
   *
   * @param {string} target
   * @param {string} data
   * @returns {ProcessingInstruction}
   * @see https://developer.mozilla.org/docs/Web/API/Document/createProcessingInstruction
   * @see https://dom.spec.whatwg.org/#dom-document-createprocessinginstruction
   * @see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml §3.2.1.7
   */
  createProcessingInstruction: function(t, e) {
    var r = new Fr(re);
    return r.ownerDocument = this, r.childNodes = new H(), r.nodeName = r.target = t, r.nodeValue = r.data = e, r;
  },
  /**
   * Creates an `Attr` node that is owned by this document.
   * In HTML Documents `localName` is the lower cased `name`,
   * otherwise no transformation is being applied.
   *
   * __This implementation differs from the specification:__ - The provided name is not checked
   * against the `Name` production,
   * so no related error will be thrown.
   *
   * @param {string} name
   * @returns {Attr}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createAttribute
   * @see https://dom.spec.whatwg.org/#dom-document-createattribute
   */
  createAttribute: function(t) {
    if (!Y.QName_exact.test(t))
      throw new T(T.INVALID_CHARACTER_ERR, 'invalid character in name "' + t + '"');
    return this.type === "html" && (t = t.toLowerCase()), this._createAttribute(t);
  },
  _createAttribute: function(t) {
    var e = new at(re);
    return e.ownerDocument = this, e.childNodes = new H(), e.name = t, e.nodeName = t, e.localName = t, e.specified = !0, e;
  },
  /**
   * Creates an EntityReference object.
   * The current implementation does not fill the `childNodes` with those of the corresponding
   * `Entity`
   *
   * @deprecated
   * In DOM Level 4.
   * @param {string} name
   * The name of the entity to reference. No namespace well-formedness checks are performed.
   * @returns {EntityReference}
   * @throws {DOMException}
   * With code `INVALID_CHARACTER_ERR` when `name` is not valid.
   * @throws {DOMException}
   * with code `NOT_SUPPORTED_ERR` when the document is of type `html`
   * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-392B75AE
   */
  createEntityReference: function(t) {
    if (!Y.Name.test(t))
      throw new T(T.INVALID_CHARACTER_ERR, 'not a valid xml name "' + t + '"');
    if (this.type === "html")
      throw new T("document is an html document", Ee.NotSupportedError);
    var e = new wr(re);
    return e.ownerDocument = this, e.childNodes = new H(), e.nodeName = t, e;
  },
  // Introduced in DOM Level 2:
  /**
   * @param {string} namespaceURI
   * @param {string} qualifiedName
   * @returns {Element}
   */
  createElementNS: function(t, e) {
    var r = da(t, e), a = new we(re), n = a.attributes = new Lt();
    return a.childNodes = new H(), a.ownerDocument = this, a.nodeName = e, a.tagName = e, a.namespaceURI = r[0], a.prefix = r[1], a.localName = r[2], n._ownerElement = a, a;
  },
  // Introduced in DOM Level 2:
  /**
   * @param {string} namespaceURI
   * @param {string} qualifiedName
   * @returns {Attr}
   */
  createAttributeNS: function(t, e) {
    var r = da(t, e), a = new at(re);
    return a.ownerDocument = this, a.childNodes = new H(), a.nodeName = e, a.name = e, a.specified = !0, a.namespaceURI = r[0], a.prefix = r[1], a.localName = r[2], a;
  }
};
oe(Ue, L);
function we(t) {
  ne(t), this._nsMap = /* @__PURE__ */ Object.create(null);
}
we.prototype = {
  nodeType: Te,
  /**
   * The attributes of this element.
   *
   * @type {NamedNodeMap | null}
   */
  attributes: null,
  getQualifiedName: function() {
    return this.prefix ? this.prefix + ":" + this.localName : this.localName;
  },
  _isInHTMLDocumentAndNamespace: function() {
    return this.ownerDocument.type === "html" && this.namespaceURI === Re.HTML;
  },
  /**
   * Implementaton of Level2 Core function hasAttributes.
   *
   * @returns {boolean}
   * True if attribute list is not empty.
   * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-NodeHasAttrs
   */
  hasAttributes: function() {
    return !!(this.attributes && this.attributes.length);
  },
  hasAttribute: function(t) {
    return !!this.getAttributeNode(t);
  },
  /**
   * Returns element’s first attribute whose qualified name is `name`, and `null`
   * if there is no such attribute.
   *
   * @param {string} name
   * @returns {string | null}
   */
  getAttribute: function(t) {
    var e = this.getAttributeNode(t);
    return e ? e.value : null;
  },
  getAttributeNode: function(t) {
    return this._isInHTMLDocumentAndNamespace() && (t = t.toLowerCase()), this.attributes.getNamedItem(t);
  },
  /**
   * Sets the value of element’s first attribute whose qualified name is qualifiedName to value.
   *
   * @param {string} name
   * @param {string} value
   */
  setAttribute: function(t, e) {
    this._isInHTMLDocumentAndNamespace() && (t = t.toLowerCase());
    var r = this.getAttributeNode(t);
    r ? r.value = r.nodeValue = "" + e : (r = this.ownerDocument._createAttribute(t), r.value = r.nodeValue = "" + e, this.setAttributeNode(r));
  },
  removeAttribute: function(t) {
    var e = this.getAttributeNode(t);
    e && this.removeAttributeNode(e);
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
  /**
   * Returns element’s attribute whose namespace is `namespaceURI` and local name is
   * `localName`,
   * or `null` if there is no such attribute.
   *
   * @param {string} namespaceURI
   * @param {string} localName
   * @returns {string | null}
   */
  getAttributeNS: function(t, e) {
    var r = this.getAttributeNodeNS(t, e);
    return r ? r.value : null;
  },
  /**
   * Sets the value of element’s attribute whose namespace is `namespaceURI` and local name is
   * `localName` to value.
   *
   * @param {string} namespaceURI
   * @param {string} qualifiedName
   * @param {string} value
   * @see https://dom.spec.whatwg.org/#dom-element-setattributens
   */
  setAttributeNS: function(t, e, r) {
    var a = da(t, e), n = a[2], o = this.getAttributeNodeNS(t, n);
    o ? o.value = o.nodeValue = "" + r : (o = this.ownerDocument.createAttributeNS(t, e), o.value = o.nodeValue = "" + r, this.setAttributeNode(o));
  },
  getAttributeNodeNS: function(t, e) {
    return this.attributes.getNamedItemNS(t, e);
  },
  /**
   * Returns a LiveNodeList of all child elements which have **all** of the given class name(s).
   *
   * Returns an empty list if `classNames` is an empty string or only contains HTML white space
   * characters.
   *
   * Warning: This returns a live LiveNodeList.
   * Changes in the DOM will reflect in the array as the changes occur.
   * If an element selected by this array no longer qualifies for the selector,
   * it will automatically be removed. Be aware of this for iteration purposes.
   *
   * @param {string} classNames
   * Is a string representing the class name(s) to match; multiple class names are separated by
   * (ASCII-)whitespace.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
   * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
   */
  getElementsByClassName: function(t) {
    var e = nn(t);
    return new ve(this, function(r) {
      var a = [];
      return e.length > 0 && fr(r, function(n) {
        if (n !== r && n.nodeType === Te) {
          var o = n.getAttribute("class");
          if (o) {
            var s = t === o;
            if (!s) {
              var i = nn(o);
              s = e.every(Nd(i));
            }
            s && a.push(n);
          }
        }
      }), a;
    });
  },
  /**
   * Returns a LiveNodeList of elements with the given qualifiedName.
   * Searching for all descendants can be done by passing `*` as `qualifiedName`.
   *
   * All descendants of the specified element are searched, but not the element itself.
   * The returned list is live, which means it updates itself with the DOM tree automatically.
   * Therefore, there is no need to call `Element.getElementsByTagName()`
   * with the same element and arguments repeatedly if the DOM changes in between calls.
   *
   * When called on an HTML element in an HTML document,
   * `getElementsByTagName` lower-cases the argument before searching for it.
   * This is undesirable when trying to match camel-cased SVG elements (such as
   * `<linearGradient>`) in an HTML document.
   * Instead, use `Element.getElementsByTagNameNS()`,
   * which preserves the capitalization of the tag name.
   *
   * `Element.getElementsByTagName` is similar to `Document.getElementsByTagName()`,
   * except that it only searches for elements that are descendants of the specified element.
   *
   * @param {string} qualifiedName
   * @returns {LiveNodeList}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
   * @see https://dom.spec.whatwg.org/#concept-getelementsbytagname
   */
  getElementsByTagName: function(t) {
    var e = (this.nodeType === Ct ? this : this.ownerDocument).type === "html", r = t.toLowerCase();
    return new ve(this, function(a) {
      var n = [];
      return fr(a, function(o) {
        if (!(o === a || o.nodeType !== Te))
          if (t === "*")
            n.push(o);
          else {
            var s = o.getQualifiedName(), i = e && o.namespaceURI === Re.HTML ? r : t;
            s === i && n.push(o);
          }
      }), n;
    });
  },
  getElementsByTagNameNS: function(t, e) {
    return new ve(this, function(r) {
      var a = [];
      return fr(r, function(n) {
        n !== r && n.nodeType === Te && (t === "*" || n.namespaceURI === t) && (e === "*" || n.localName == e) && a.push(n);
      }), a;
    });
  }
};
Ue.prototype.getElementsByClassName = we.prototype.getElementsByClassName;
Ue.prototype.getElementsByTagName = we.prototype.getElementsByTagName;
Ue.prototype.getElementsByTagNameNS = we.prototype.getElementsByTagNameNS;
oe(we, L);
function at(t) {
  ne(t), this.namespaceURI = null, this.prefix = null, this.ownerElement = null;
}
at.prototype.nodeType = Rt;
oe(at, L);
function Ut(t) {
  ne(t);
}
Ut.prototype = {
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
  deleteData: function(t, e) {
    this.replaceData(t, e, "");
  },
  replaceData: function(t, e, r) {
    var a = this.data.substring(0, t), n = this.data.substring(t + e);
    r = a + r + n, this.nodeValue = this.data = r, this.length = r.length;
  }
};
oe(Ut, L);
function sr(t) {
  ne(t);
}
sr.prototype = {
  nodeName: "#text",
  nodeType: hr,
  splitText: function(t) {
    var e = this.data, r = e.substring(t);
    e = e.substring(0, t), this.data = this.nodeValue = e, this.length = e.length;
    var a = this.ownerDocument.createTextNode(r);
    return this.parentNode && this.parentNode.insertBefore(a, this.nextSibling), a;
  }
};
oe(sr, Ut);
function yr(t) {
  ne(t);
}
yr.prototype = {
  nodeName: "#comment",
  nodeType: Ca
};
oe(yr, Ut);
function br(t) {
  ne(t);
}
br.prototype = {
  nodeName: "#cdata-section",
  nodeType: Do
};
oe(br, sr);
function Ur(t) {
  ne(t);
}
Ur.prototype.nodeType = So;
oe(Ur, L);
function Da(t) {
  ne(t);
}
Da.prototype.nodeType = gd;
oe(Da, L);
function va(t) {
  ne(t);
}
va.prototype.nodeType = Ad;
oe(va, L);
function wr(t) {
  ne(t);
}
wr.prototype.nodeType = vo;
oe(wr, L);
function wt(t) {
  ne(t);
}
wt.prototype.nodeName = "#document-fragment";
wt.prototype.nodeType = $e;
oe(wt, L);
function Fr(t) {
  ne(t);
}
Fr.prototype.nodeType = Ia;
oe(Fr, Ut);
function xo() {
}
xo.prototype.serializeToString = function(t, e) {
  return Po.call(t, e);
};
L.prototype.toString = Po;
function Po(t) {
  var e;
  typeof t == "function" ? e = { requireWellFormed: !1, splitCDATASections: !0, nodeFilter: t } : t != null ? e = {
    requireWellFormed: !!t.requireWellFormed,
    splitCDATASections: t.splitCDATASections !== !1,
    nodeFilter: t.nodeFilter || null
  } : e = { requireWellFormed: !1, splitCDATASections: !0, nodeFilter: null };
  var r = [], a = this.nodeType === Ct && this.documentElement || this, n = a.prefix, o = a.namespaceURI;
  if (o && n == null) {
    var n = a.lookupPrefix(o);
    if (n == null)
      var s = [
        { namespace: o, prefix: null }
        //{namespace:uri,prefix:''}
      ];
  }
  return Sa(this, r, s, e), r.join("");
}
function dn(t, e, r) {
  var a = t.prefix || "", n = t.namespaceURI;
  if (!n || a === "xml" && n === Re.XML || n === Re.XMLNS)
    return !1;
  for (var o = r.length; o--; ) {
    var s = r[o];
    if (s.prefix === a)
      return s.namespace !== n;
  }
  return !0;
}
function Er(t, e, r) {
  t.push(" ", e, '="', r.replace(/[<>&"\t\n\r]/g, yo), '"');
}
function Sa(t, e, r, a) {
  r || (r = []);
  var n = a.nodeFilter, o = a.requireWellFormed, s = a.splitCDATASections, i = t.nodeType === Ct ? t : t.ownerDocument, u = i.type === "html";
  K(
    t,
    { ns: r },
    {
      enter: function(c, l) {
        var E = l.ns;
        if (n)
          if (c = n(c), c) {
            if (typeof c == "string")
              return e.push(c), null;
          } else
            return null;
        switch (c.nodeType) {
          case Te:
            var m = c.attributes, f = m.length, C = c.tagName, S = C;
            if (!u && !c.prefix && c.namespaceURI) {
              for (var U, F = 0; F < m.length; F++)
                if (m.item(F).name === "xmlns") {
                  U = m.item(F).value;
                  break;
                }
              if (!U)
                for (var j = E.length - 1; j >= 0; j--) {
                  var ue = E[j];
                  if (ue.prefix === "" && ue.namespace === c.namespaceURI) {
                    U = ue.namespace;
                    break;
                  }
                }
              if (U !== c.namespaceURI)
                for (var j = E.length - 1; j >= 0; j--) {
                  var ue = E[j];
                  if (ue.namespace === c.namespaceURI) {
                    ue.prefix && (S = ue.prefix + ":" + C);
                    break;
                  }
                }
            }
            e.push("<", S);
            for (var ie = E.slice(), de = 0; de < f; de++) {
              var Z = m.item(de);
              Z.prefix == "xmlns" ? ie.push({
                prefix: Z.localName,
                namespace: Z.value
              }) : Z.nodeName == "xmlns" && ie.push({ prefix: "", namespace: Z.value });
            }
            for (var de = 0; de < f; de++) {
              var Z = m.item(de);
              if (dn(Z, u, ie)) {
                var Me = Z.prefix || "", He = Z.namespaceURI;
                Er(e, Me ? "xmlns:" + Me : "xmlns", He), ie.push({ prefix: Me, namespace: He });
              }
              var Le = n ? n(Z) : Z;
              Le && (typeof Le == "string" ? e.push(Le) : Er(e, Le.name, Le.value));
            }
            if (C === S && dn(c, u, ie)) {
              var ze = c.prefix || "", He = c.namespaceURI;
              Er(e, ze ? "xmlns:" + ze : "xmlns", He), ie.push({ prefix: ze, namespace: He });
            }
            var ct = !c.firstChild;
            if (ct && (u || c.namespaceURI === Re.HTML) && (ct = pd(C)), ct)
              return e.push("/>"), null;
            if (e.push(">"), u && md(C)) {
              for (var V = c.firstChild; V; )
                V.data ? e.push(V.data) : Sa(V, e, ie.slice(), a), V = V.nextSibling;
              return e.push("</", S, ">"), null;
            }
            return { ns: ie, tag: S };
          case Ct:
          case $e:
            if (o && c.nodeType === Ct && c.documentElement == null)
              throw new T("The Document has no documentElement", Ee.InvalidStateError);
            return { ns: E };
          case Rt:
            return Er(e, c.name, c.value), null;
          case hr:
            if (o && Y.InvalidChar.test(c.data))
              throw new T(
                "The Text node data contains characters outside the XML Char production",
                Ee.InvalidStateError
              );
            return e.push(c.data.replace(/[<&>]/g, yo)), null;
          case Do:
            if (o && c.data.indexOf("]]>") !== -1)
              throw new T('The CDATASection data contains "]]>"', Ee.InvalidStateError);
            return s ? e.push(Y.CDATA_START, c.data.replace(/]]>/g, "]]]]><![CDATA[>"), Y.CDATA_END) : e.push(Y.CDATA_START, c.data, Y.CDATA_END), null;
          case Ca:
            if (o) {
              if (Y.InvalidChar.test(c.data))
                throw new T(
                  "The comment node data contains characters outside the XML Char production",
                  Ee.InvalidStateError
                );
              if (c.data.indexOf("--") !== -1 || c.data[c.data.length - 1] === "-")
                throw new T(
                  'The comment node data contains "--" or ends with "-"',
                  Ee.InvalidStateError
                );
            }
            return e.push(Y.COMMENT_START, c.data, Y.COMMENT_END), null;
          case So:
            var xe = c.publicId, x = c.systemId;
            if (o) {
              if (xe && !Y.PubidLiteral_match.test(xe))
                throw new T("DocumentType publicId is not a valid PubidLiteral", Ee.InvalidStateError);
              if (x && x !== "." && !Y.SystemLiteral_match.test(x))
                throw new T("DocumentType systemId is not a valid SystemLiteral", Ee.InvalidStateError);
              if (c.internalSubset && c.internalSubset.indexOf("]>") !== -1)
                throw new T('DocumentType internalSubset contains "]>"', Ee.InvalidStateError);
            }
            return e.push(Y.DOCTYPE_DECL_START, " ", c.name), xe ? (e.push(" ", Y.PUBLIC, " ", xe), x && x !== "." && e.push(" ", x)) : x && x !== "." && e.push(" ", Y.SYSTEM, " ", x), c.internalSubset && e.push(" [", c.internalSubset, "]"), e.push(">"), null;
          case Ia:
            if (o) {
              if (c.target.indexOf(":") !== -1 || c.target.toLowerCase() === "xml")
                throw new T("The ProcessingInstruction target is not well-formed", Ee.InvalidStateError);
              if (Y.InvalidChar.test(c.data))
                throw new T(
                  "The ProcessingInstruction data contains characters outside the XML Char production",
                  Ee.InvalidStateError
                );
              if (c.data.indexOf("?>") !== -1)
                throw new T('The ProcessingInstruction data contains "?>"', Ee.InvalidStateError);
            }
            return e.push("<?", c.target, " ", c.data, "?>"), null;
          case vo:
            return e.push("&", c.nodeName, ";"), null;
          default:
            return e.push("??", c.nodeName), null;
        }
      },
      exit: function(c, l) {
        l && l.tag && e.push("</", l.tag, ">");
      }
    }
  );
}
function Rd(t, e, r) {
  var a;
  return K(e, null, {
    enter: function(n, o) {
      var s = n.cloneNode(!1);
      s.ownerDocument = t, s.parentNode = null, o === null ? a = s : o.appendChild(s);
      var i = n.nodeType === Rt || r;
      return i ? s : null;
    }
  }), a;
}
function Bo(t, e, r) {
  var a;
  return K(e, null, {
    enter: function(n, o) {
      var s = new n.constructor(re);
      for (var i in n)
        if (St(n, i)) {
          var u = n[i];
          typeof u != "object" && u != s[i] && (s[i] = u);
        }
      n.childNodes && (s.childNodes = new H()), s.ownerDocument = t;
      var c = r;
      switch (s.nodeType) {
        case Te:
          var l = n.attributes, E = s.attributes = new Lt(), m = l.length;
          E._ownerElement = s;
          for (var f = 0; f < m; f++)
            s.setAttributeNode(Bo(t, l.item(f), !0));
          break;
        case Rt:
          c = !0;
      }
      return o !== null ? o.appendChild(s) : a = s, c ? s : null;
    }
  }), a;
}
function Xo(t, e, r) {
  t[e] = r;
}
function Vr(t) {
  for (var e = [], r = t.firstChild; r; )
    r.nodeType === Te && e.push(r), r = r.nextSibling;
  return e;
}
try {
  Object.defineProperty && (Object.defineProperty(ve.prototype, "length", {
    get: function() {
      return Or(this), this.$$length;
    }
  }), Object.defineProperty(L.prototype, "textContent", {
    get: function() {
      if (this.nodeType === Te || this.nodeType === $e) {
        var t = [];
        return K(this, null, {
          enter: function(e) {
            if (e.nodeType === Te || e.nodeType === $e)
              return !0;
            if (e.nodeType === Ia || e.nodeType === Ca)
              return null;
            t.push(e.nodeValue);
          }
        }), t.join("");
      }
      return this.nodeValue;
    },
    set: function(t) {
      switch (this.nodeType) {
        case Te:
        case $e:
          for (; this.firstChild; )
            this.removeChild(this.firstChild);
          (t || String(t)) && this.appendChild(this.ownerDocument.createTextNode(t));
          break;
        default:
          this.data = t, this.value = t, this.nodeValue = t;
      }
    }
  }), Object.defineProperty(we.prototype, "children", {
    get: function() {
      return new ve(this, Vr);
    }
  }), Object.defineProperty(Ue.prototype, "children", {
    get: function() {
      return new ve(this, Vr);
    }
  }), Object.defineProperty(wt.prototype, "children", {
    get: function() {
      return new ve(this, Vr);
    }
  }), Xo = function(t, e, r) {
    t["$$" + e] = r;
  });
} catch {
}
q._updateLiveList = Or;
q.Attr = at;
q.CDATASection = br;
q.CharacterData = Ut;
q.Comment = yr;
q.Document = Ue;
q.DocumentFragment = wt;
q.DocumentType = Ur;
q.DOMImplementation = Oo;
q.Element = we;
q.Entity = va;
q.EntityReference = wr;
q.LiveNodeList = ve;
q.NamedNodeMap = Lt;
q.Node = L;
q.NodeList = H;
q.Notation = Da;
q.Text = sr;
q.ProcessingInstruction = Fr;
q.walkDOM = K;
q.XMLSerializer = xo;
var Ft = {}, ko = {};
(function(t) {
  var e = $.freeze;
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
})(ko);
var Mr = {}, Mt = $, I = g, $o = st, Ld = Mt.isHTMLEscapableRawTextElement, Od = Mt.isHTMLMimeType, yd = Mt.isHTMLRawTextElement, tr = Mt.hasOwn, ln = Mt.NAMESPACE, En = $o.ParseError, bd = $o.DOMException, kt = 0, Be = 1, dt = 2, $t = 3, lt = 4, Et = 5, qt = 6, mr = 7;
function qo() {
}
qo.prototype = {
  parse: function(t, e, r) {
    var a = this.domBuilder;
    a.startDocument(), Go(e, e = /* @__PURE__ */ Object.create(null)), Ud(t, e, r, a, this.errorHandler), a.endDocument();
  }
};
var Ra = /&#?\w+;?/g;
function Ud(t, e, r, a, n) {
  var o = Od(a.mimeType);
  t.indexOf(I.UNICODE_REPLACEMENT_CHARACTER) >= 0 && n.warning("Unicode replacement character detected, source encoding issues?");
  function s(O) {
    if (O > 65535) {
      O -= 65536;
      var le = 55296 + (O >> 10), ir = 56320 + (O & 1023);
      return String.fromCharCode(le, ir);
    } else
      return String.fromCharCode(O);
  }
  function i(O) {
    var le = O[O.length - 1] === ";" ? O : O + ";";
    if (!o && le !== O)
      return n.error("EntityRef: expecting ;"), O;
    var ir = I.Reference.exec(le);
    if (!ir || ir[0].length !== le.length)
      return n.error("entity not matching Reference production: " + O), O;
    var cr = le.slice(1, -1);
    return tr(r, cr) ? r[cr] : cr.charAt(0) === "#" ? s(parseInt(cr.substring(1).replace("x", "0x"))) : (n.error("entity not found:" + O), O);
  }
  function u(O) {
    if (O > U) {
      var le = t.substring(U, O).replace(Ra, i);
      m && f(U), a.characters(le, 0, O - U), U = O;
    }
  }
  var c = 0, l = 0, E = /\r\n?|\n|$/g, m = a.locator;
  function f(O, le) {
    for (; O >= l && (le = E.exec(t)); )
      c = l, l = le.index + le[0].length, m.lineNumber++;
    m.columnNumber = O - c + 1;
  }
  for (var C = [{ currentNSMap: e }], S = [], U = 0; ; ) {
    try {
      var F = t.indexOf("<", U);
      if (F < 0) {
        if (!o && S.length > 0)
          return n.fatalError("unclosed xml tag(s): " + S.join(", "));
        if (!t.substring(U).match(/^\s*$/)) {
          var j = a.doc, ue = j.createTextNode(t.substring(U));
          if (j.documentElement)
            return n.error("Extra content at the end of the document");
          j.appendChild(ue), a.currentElement = ue;
        }
        return;
      }
      if (F > U) {
        var ie = t.substring(U, F);
        !o && S.length === 0 && (ie = ie.replace(new RegExp(I.S_OPT.source, "g"), ""), ie && n.error("Unexpected content outside root element: '" + ie + "'")), u(F);
      }
      switch (t.charAt(F + 1)) {
        case "/":
          var x = t.indexOf(">", F + 2), de = t.substring(F + 2, x > 0 ? x : void 0);
          if (!de)
            return n.fatalError("end tag name missing");
          var Z = x > 0 && I.reg("^", I.QName_group, I.S_OPT, "$").exec(de);
          if (!Z)
            return n.fatalError('end tag name contains invalid characters: "' + de + '"');
          if (!a.currentElement && !a.doc.documentElement)
            return;
          var Me = S[S.length - 1] || a.currentElement.tagName || a.doc.documentElement.tagName || "";
          if (Me !== Z[1]) {
            var He = Z[1].toLowerCase();
            if (!o || Me.toLowerCase() !== He)
              return n.fatalError('Opening and ending tag mismatch: "' + Me + '" != "' + de + '"');
          }
          var Le = C.pop();
          S.pop();
          var ze = Le.localNSMap;
          if (a.endElement(Le.uri, Le.localName, Me), ze)
            for (var ct in ze)
              tr(ze, ct) && a.endPrefixMapping(ct);
          x++;
          break;
        case "?":
          m && f(F), x = xd(t, F, a, n);
          break;
        case "!":
          m && f(F), x = Ho(t, F, a, n, o);
          break;
        default:
          m && f(F);
          var V = new zo(), xe = C[C.length - 1].currentNSMap, x = wd(t, F, V, xe, i, n, o), xa = V.length;
          if (V.closed || (o && Mt.isHTMLVoidElement(V.tagName) ? V.closed = !0 : S.push(V.tagName)), m && xa) {
            for (var As = mn(m, {}), Pr = 0; Pr < xa; Pr++) {
              var Pa = V[Pr];
              f(Pa.offset), Pa.locator = mn(m, {});
            }
            a.locator = As, pn(V, a, xe) && C.push(V), a.locator = m;
          } else
            pn(V, a, xe) && C.push(V);
          o && !V.closed ? x = Fd(t, x, V.tagName, i, a) : x++;
      }
    } catch (O) {
      if (O instanceof En)
        throw O;
      if (O instanceof bd)
        throw new En(O.name + ": " + O.message, a.locator, O);
      n.error("element parse error: " + O), x = -1;
    }
    x > U ? U = x : u(Math.max(F, U) + 1);
  }
}
function mn(t, e) {
  return e.lineNumber = t.lineNumber, e.columnNumber = t.columnNumber, e;
}
function wd(t, e, r, a, n, o, s) {
  function i(f, C, S) {
    if (tr(r.attributeNames, f))
      return o.fatalError("Attribute " + f + " redefined");
    if (!s && C.indexOf("<") >= 0)
      return o.fatalError("Unescaped '<' not allowed in attributes values");
    r.addValue(
      f,
      // @see https://www.w3.org/TR/xml/#AVNormalize
      // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
      // - recursive replacement of (DTD) entity references
      // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
      C.replace(/[\t\n\r]/g, " ").replace(Ra, n),
      S
    );
  }
  for (var u, c, l = ++e, E = kt; ; ) {
    var m = t.charAt(l);
    switch (m) {
      case "=":
        if (E === Be)
          u = t.slice(e, l), E = $t;
        else if (E === dt)
          E = $t;
        else
          throw new Error("attribute equal must after attrName");
        break;
      case "'":
      case '"':
        if (E === $t || E === Be)
          if (E === Be && (o.warning('attribute value must after "="'), u = t.slice(e, l)), e = l + 1, l = t.indexOf(m, e), l > 0)
            c = t.slice(e, l), i(u, c, e - 1), E = Et;
          else
            throw new Error("attribute value no end '" + m + "' match");
        else if (E == lt)
          c = t.slice(e, l), i(u, c, e), o.warning('attribute "' + u + '" missed start quot(' + m + ")!!"), e = l + 1, E = Et;
        else
          throw new Error('attribute value must after "="');
        break;
      case "/":
        switch (E) {
          case kt:
            r.setTagName(t.slice(e, l));
          case Et:
          case qt:
          case mr:
            E = mr, r.closed = !0;
          case lt:
          case Be:
            break;
          case dt:
            r.closed = !0;
            break;
          default:
            throw new Error("attribute invalid close char('/')");
        }
        break;
      case "":
        return o.error("unexpected end of input"), E == kt && r.setTagName(t.slice(e, l)), l;
      case ">":
        switch (E) {
          case kt:
            r.setTagName(t.slice(e, l));
          case Et:
          case qt:
          case mr:
            break;
          case lt:
          case Be:
            c = t.slice(e, l), c.slice(-1) === "/" && (r.closed = !0, c = c.slice(0, -1));
          case dt:
            E === dt && (c = u), E == lt ? (o.warning('attribute "' + c + '" missed quot(")!'), i(u, c, e)) : (s || o.warning('attribute "' + c + '" missed value!! "' + c + '" instead!!'), i(c, c, e));
            break;
          case $t:
            if (!s)
              return o.fatalError(`AttValue: ' or " expected`);
        }
        return l;
      case "":
        m = " ";
      default:
        if (m <= " ")
          switch (E) {
            case kt:
              r.setTagName(t.slice(e, l)), E = qt;
              break;
            case Be:
              u = t.slice(e, l), E = dt;
              break;
            case lt:
              var c = t.slice(e, l);
              o.warning('attribute "' + c + '" missed quot(")!!'), i(u, c, e);
            case Et:
              E = qt;
              break;
          }
        else
          switch (E) {
            case dt:
              s || o.warning('attribute "' + u + '" missed value!! "' + u + '" instead2!!'), i(u, u, e), e = l, E = Be;
              break;
            case Et:
              o.warning('attribute space is required"' + u + '"!!');
            case qt:
              E = Be, e = l;
              break;
            case $t:
              E = lt, e = l;
              break;
            case mr:
              throw new Error("elements closed character '/' and '>' must be connected to");
          }
    }
    l++;
  }
}
function pn(t, e, r) {
  for (var a = t.tagName, n = null, E = t.length; E--; ) {
    var o = t[E], s = o.qName, i = o.value, m = s.indexOf(":");
    if (m > 0)
      var u = o.prefix = s.slice(0, m), c = s.slice(m + 1), l = u === "xmlns" && c;
    else
      c = s, u = null, l = s === "xmlns" && "";
    o.localName = c, l !== !1 && (n == null && (n = /* @__PURE__ */ Object.create(null), Go(r, r = /* @__PURE__ */ Object.create(null))), r[l] = n[l] = i, o.uri = ln.XMLNS, e.startPrefixMapping(l, i));
  }
  for (var E = t.length; E--; )
    o = t[E], o.prefix && (o.prefix === "xml" && (o.uri = ln.XML), o.prefix !== "xmlns" && (o.uri = r[o.prefix]));
  var m = a.indexOf(":");
  m > 0 ? (u = t.prefix = a.slice(0, m), c = t.localName = a.slice(m + 1)) : (u = null, c = t.localName = a);
  var f = t.uri = r[u || ""];
  if (e.startElement(f, c, a, t), t.closed) {
    if (e.endElement(f, c, a), n)
      for (u in n)
        tr(n, u) && e.endPrefixMapping(u);
  } else
    return t.currentNSMap = r, t.localNSMap = n, !0;
}
function Fd(t, e, r, a, n) {
  var o = Ld(r);
  if (o || yd(r)) {
    var s = t.indexOf("</" + r + ">", e), i = t.substring(e + 1, s);
    return o && (i = i.replace(Ra, a)), n.characters(i, 0, i.length), s;
  }
  return e + 1;
}
function Go(t, e) {
  for (var r in t)
    tr(t, r) && (e[r] = t[r]);
}
function Vo(t, e) {
  var r = e;
  function a(l) {
    return l = l || 0, t.charAt(r + l);
  }
  function n(l) {
    l = l || 1, r += l;
  }
  function o() {
    for (var l = 0; r < t.length; ) {
      var E = a();
      if (E !== " " && E !== `
` && E !== "	" && E !== "\r")
        return l;
      l++, n();
    }
    return -1;
  }
  function s() {
    return t.substring(r);
  }
  function i(l) {
    return t.substring(r, r + l.length) === l;
  }
  function u(l) {
    return t.substring(r, r + l.length).toUpperCase() === l.toUpperCase();
  }
  function c(l) {
    var E = I.reg("^", l), m = E.exec(s());
    return m ? (n(m[0].length), m[0]) : null;
  }
  return {
    char: a,
    getIndex: function() {
      return r;
    },
    getMatch: c,
    getSource: function() {
      return t;
    },
    skip: n,
    skipBlanks: o,
    substringFromIndex: s,
    substringStartsWith: i,
    substringStartsWithCaseInsensitive: u
  };
}
function Md(t, e) {
  function r(i, u) {
    var c = I.PI.exec(i.substringFromIndex());
    return c ? c[1].toLowerCase() === "xml" ? u.fatalError(
      "xml declaration is only allowed at the start of the document, but found at position " + i.getIndex()
    ) : (i.skip(c[0].length), c[0]) : u.fatalError("processing instruction is not well-formed at position " + i.getIndex());
  }
  var a = t.getSource();
  if (t.char() === "[") {
    t.skip(1);
    for (var n = t.getIndex(); t.getIndex() < a.length; ) {
      if (t.skipBlanks(), t.char() === "]") {
        var o = a.substring(n, t.getIndex());
        return t.skip(1), o;
      }
      var s = null;
      if (t.char() === "<" && t.char(1) === "!")
        switch (t.char(2)) {
          case "E":
            t.char(3) === "L" ? s = t.getMatch(I.elementdecl) : t.char(3) === "N" && (s = t.getMatch(I.EntityDecl));
            break;
          case "A":
            s = t.getMatch(I.AttlistDecl);
            break;
          case "N":
            s = t.getMatch(I.NotationDecl);
            break;
          case "-":
            s = t.getMatch(I.Comment);
            break;
        }
      else if (t.char() === "<" && t.char(1) === "?")
        s = r(t, e);
      else if (t.char() === "%")
        s = t.getMatch(I.PEReference);
      else
        return e.fatalError("Error detected in Markup declaration");
      if (!s)
        return e.fatalError("Error in internal subset at position " + t.getIndex());
    }
    return e.fatalError("doctype internal subset is not well-formed, missing ]");
  }
}
function Ho(t, e, r, a, n) {
  var o = Vo(t, e);
  switch (n ? o.char(2).toUpperCase() : o.char(2)) {
    case "-":
      var s = o.getMatch(I.Comment);
      return s ? (r.comment(s, I.COMMENT_START.length, s.length - I.COMMENT_START.length - I.COMMENT_END.length), o.getIndex()) : a.fatalError("comment is not well-formed at position " + o.getIndex());
    case "[":
      var i = o.getMatch(I.CDSect);
      return i ? !n && !r.currentElement ? a.fatalError("CDATA outside of element") : (r.startCDATA(), r.characters(i, I.CDATA_START.length, i.length - I.CDATA_START.length - I.CDATA_END.length), r.endCDATA(), o.getIndex()) : a.fatalError("Invalid CDATA starting at position " + e);
    case "D": {
      if (r.doc && r.doc.documentElement)
        return a.fatalError("Doctype not allowed inside or after documentElement at position " + o.getIndex());
      if (n ? !o.substringStartsWithCaseInsensitive(I.DOCTYPE_DECL_START) : !o.substringStartsWith(I.DOCTYPE_DECL_START))
        return a.fatalError("Expected " + I.DOCTYPE_DECL_START + " at position " + o.getIndex());
      if (o.skip(I.DOCTYPE_DECL_START.length), o.skipBlanks() < 1)
        return a.fatalError("Expected whitespace after " + I.DOCTYPE_DECL_START + " at position " + o.getIndex());
      var u = {
        name: void 0,
        publicId: void 0,
        systemId: void 0,
        internalSubset: void 0
      };
      if (u.name = o.getMatch(I.Name), !u.name)
        return a.fatalError("doctype name missing or contains unexpected characters at position " + o.getIndex());
      if (n && u.name.toLowerCase() !== "html" && a.warning("Unexpected DOCTYPE in HTML document at position " + o.getIndex()), o.skipBlanks(), o.substringStartsWith(I.PUBLIC) || o.substringStartsWith(I.SYSTEM)) {
        var c = I.ExternalID_match.exec(o.substringFromIndex());
        if (!c)
          return a.fatalError("doctype external id is not well-formed at position " + o.getIndex());
        c.groups.SystemLiteralOnly !== void 0 ? u.systemId = c.groups.SystemLiteralOnly : (u.systemId = c.groups.SystemLiteral, u.publicId = c.groups.PubidLiteral), o.skip(c[0].length);
      } else if (n && o.substringStartsWithCaseInsensitive(I.SYSTEM)) {
        if (o.skip(I.SYSTEM.length), o.skipBlanks() < 1)
          return a.fatalError("Expected whitespace after " + I.SYSTEM + " at position " + o.getIndex());
        if (u.systemId = o.getMatch(I.ABOUT_LEGACY_COMPAT_SystemLiteral), !u.systemId)
          return a.fatalError(
            "Expected " + I.ABOUT_LEGACY_COMPAT + " in single or double quotes after " + I.SYSTEM + " at position " + o.getIndex()
          );
      }
      return n && u.systemId && !I.ABOUT_LEGACY_COMPAT_SystemLiteral.test(u.systemId) && a.warning("Unexpected doctype.systemId in HTML document at position " + o.getIndex()), n || (o.skipBlanks(), u.internalSubset = Md(o, a)), o.skipBlanks(), o.char() !== ">" ? a.fatalError("doctype not terminated with > at position " + o.getIndex()) : (o.skip(1), r.startDTD(u.name, u.publicId, u.systemId, u.internalSubset), r.endDTD(), o.getIndex());
    }
    default:
      return a.fatalError('Not well-formed XML starting with "<!" at position ' + e);
  }
}
function xd(t, e, r, a) {
  var n = t.substring(e).match(I.PI);
  if (!n)
    return a.fatalError("Invalid processing instruction starting at position " + e);
  if (n[1].toLowerCase() === "xml") {
    if (e > 0)
      return a.fatalError(
        "processing instruction at position " + e + " is an xml declaration which is only at the start of the document"
      );
    if (!I.XMLDecl.test(t.substring(e)))
      return a.fatalError("xml declaration is not well-formed");
  }
  return r.processingInstruction(n[1], n[2]), e + n[0].length;
}
function zo() {
  this.attributeNames = /* @__PURE__ */ Object.create(null);
}
zo.prototype = {
  setTagName: function(t) {
    if (!I.QName_exact.test(t))
      throw new Error("invalid tagName:" + t);
    this.tagName = t;
  },
  addValue: function(t, e, r) {
    if (!I.QName_exact.test(t))
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
Mr.XMLReader = qo;
Mr.parseUtils = Vo;
Mr.parseDoctypeCommentOrCData = Ho;
var it = $, Pd = q, Bd = st, Tn = ko, Xd = Mr, kd = Pd.DOMImplementation, $d = it.hasDefaultHTMLNamespace, qd = it.isHTMLMimeType, Gd = it.isValidMimeType, jo = it.MIME_TYPE, Hr = it.NAMESPACE, _n = Bd.ParseError, Vd = Xd.XMLReader;
function Yo(t) {
  return t.replace(/\r[\n\u0085]/g, `
`).replace(/[\r\u0085\u2028\u2029]/g, `
`);
}
function Ko(t) {
  if (t = t || {}, t.locator === void 0 && (t.locator = !0), this.assign = t.assign || it.assign, this.domHandler = t.domHandler || xr, this.onError = t.onError || t.errorHandler, t.errorHandler && typeof t.errorHandler != "function")
    throw new TypeError("errorHandler object is no longer supported, switch to onError!");
  t.errorHandler && t.errorHandler("warning", "The `errorHandler` option has been deprecated, use `onError` instead!", this), this.normalizeLineEndings = t.normalizeLineEndings || Yo, this.locator = !!t.locator, this.xmlns = this.assign(/* @__PURE__ */ Object.create(null), t.xmlns);
}
Ko.prototype.parseFromString = function(t, e) {
  if (!Gd(e))
    throw new TypeError('DOMParser.parseFromString: the provided mimeType "' + e + '" is not valid.');
  var r = this.assign(/* @__PURE__ */ Object.create(null), this.xmlns), a = Tn.XML_ENTITIES, n = r[""] || null;
  $d(e) ? (a = Tn.HTML_ENTITIES, n = Hr.HTML) : e === jo.XML_SVG_IMAGE && (n = Hr.SVG), r[""] = n, r.xml = r.xml || Hr.XML;
  var o = new this.domHandler({
    mimeType: e,
    defaultNamespace: n,
    onError: this.onError
  }), s = this.locator ? {} : void 0;
  this.locator && o.setDocumentLocator(s);
  var i = new Vd();
  i.errorHandler = o, i.domBuilder = o;
  var u = !it.isHTMLMimeType(e);
  return u && typeof t != "string" && i.errorHandler.fatalError("source is not a string"), i.parse(this.normalizeLineEndings(String(t)), r, a), o.doc.documentElement || i.errorHandler.fatalError("missing root element"), o.doc;
};
function xr(t) {
  var e = t || {};
  this.mimeType = e.mimeType || jo.XML_APPLICATION, this.defaultNamespace = e.defaultNamespace || null, this.cdata = !1, this.currentElement = void 0, this.doc = void 0, this.locator = void 0, this.onError = e.onError;
}
function mt(t, e) {
  e.lineNumber = t.lineNumber, e.columnNumber = t.columnNumber;
}
xr.prototype = {
  /**
   * Either creates an XML or an HTML document and stores it under `this.doc`.
   * If it is an XML document, `this.defaultNamespace` is used to create it,
   * and it will not contain any `childNodes`.
   * If it is an HTML document, it will be created without any `childNodes`.
   *
   * @see http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
   */
  startDocument: function() {
    var t = new kd();
    this.doc = qd(this.mimeType) ? t.createHTMLDocument(!1) : t.createDocument(this.defaultNamespace, "");
  },
  startElement: function(t, e, r, a) {
    var n = this.doc, o = n.createElementNS(t, r || e), s = a.length;
    pr(this, o), this.currentElement = o, this.locator && mt(this.locator, o);
    for (var i = 0; i < s; i++) {
      var t = a.getURI(i), u = a.getValue(i), r = a.getQName(i), c = n.createAttributeNS(t, r);
      this.locator && mt(a.getLocator(i), c), c.value = c.nodeValue = u, o.setAttributeNode(c);
    }
  },
  endElement: function(t, e, r) {
    this.currentElement = this.currentElement.parentNode;
  },
  startPrefixMapping: function(t, e) {
  },
  endPrefixMapping: function(t) {
  },
  processingInstruction: function(t, e) {
    var r = this.doc.createProcessingInstruction(t, e);
    this.locator && mt(this.locator, r), pr(this, r);
  },
  ignorableWhitespace: function(t, e, r) {
  },
  characters: function(t, e, r) {
    if (t = fn.apply(this, arguments), t) {
      if (this.cdata)
        var a = this.doc.createCDATASection(t);
      else
        var a = this.doc.createTextNode(t);
      this.currentElement ? this.currentElement.appendChild(a) : /^\s*$/.test(t) && this.doc.appendChild(a), this.locator && mt(this.locator, a);
    }
  },
  skippedEntity: function(t) {
  },
  endDocument: function() {
    this.doc.normalize();
  },
  /**
   * Stores the locator to be able to set the `columnNumber` and `lineNumber`
   * on the created DOM nodes.
   *
   * @param {Locator} locator
   */
  setDocumentLocator: function(t) {
    t && (t.lineNumber = 0), this.locator = t;
  },
  //LexicalHandler
  comment: function(t, e, r) {
    t = fn.apply(this, arguments);
    var a = this.doc.createComment(t);
    this.locator && mt(this.locator, a), pr(this, a);
  },
  startCDATA: function() {
    this.cdata = !0;
  },
  endCDATA: function() {
    this.cdata = !1;
  },
  startDTD: function(t, e, r, a) {
    var n = this.doc.implementation;
    if (n && n.createDocumentType) {
      var o = n.createDocumentType(t, e, r, a);
      this.locator && mt(this.locator, o), pr(this, o), this.doc.doctype = o;
    }
  },
  reportError: function(t, e) {
    if (typeof this.onError == "function")
      try {
        this.onError(t, e, this);
      } catch (r) {
        throw new _n("Reporting " + t + ' "' + e + '" caused ' + r, this.locator);
      }
    else
      console.error("[xmldom " + t + "]	" + e, Hd(this.locator));
  },
  /**
   * @see http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
   */
  warning: function(t) {
    this.reportError("warning", t);
  },
  error: function(t) {
    this.reportError("error", t);
  },
  /**
   * This function reports a fatal error and throws a ParseError.
   *
   * @param {string} message
   * - The message to be used for reporting and throwing the error.
   * @returns {never}
   * This function always throws an error and never returns a value.
   * @throws {ParseError}
   * Always throws a ParseError with the provided message.
   */
  fatalError: function(t) {
    throw this.reportError("fatalError", t), new _n(t, this.locator);
  }
};
function Hd(t) {
  if (t)
    return `
@#[line:` + t.lineNumber + ",col:" + t.columnNumber + "]";
}
function fn(t, e, r) {
  return typeof t == "string" ? t.substr(e, r) : t.length >= e + r || e ? new java.lang.String(t, e, r) + "" : t;
}
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(
  /\w+/g,
  function(t) {
    xr.prototype[t] = function() {
      return null;
    };
  }
);
function pr(t, e) {
  t.currentElement ? t.currentElement.appendChild(e) : t.doc.appendChild(e);
}
function zd(t) {
  if (t === "error") throw "onErrorStopParsing";
}
function jd() {
  throw "onWarningStopParsing";
}
Ft.__DOMHandler = xr;
Ft.DOMParser = Ko;
Ft.normalizeLineEndings = Yo;
Ft.onErrorStopParsing = zd;
Ft.onWarningStopParsing = jd;
var xt = $;
xt.assign;
xt.hasDefaultHTMLNamespace;
xt.isHTMLMimeType;
xt.isValidMimeType;
xt.MIME_TYPE;
xt.NAMESPACE;
var Yd = Ft, Wo = Yd.DOMParser;
const Kd = "http://www.portalfiscal.inf.br/nfe", Nn = "http://www.w3.org/2000/09/xmldsig#";
function Wd(t) {
  return t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
}
function Qd(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
}
function An(t) {
  return t.localName || t.nodeName.replace(/^.*:/, "");
}
function La(t) {
  if (t.nodeType === 3)
    return Qd(t.nodeValue ?? "");
  if (t.nodeType !== 1)
    return "";
  const e = t, r = e.nodeName, a = [];
  An(e) === "infNFe" && !e.getAttribute("xmlns") && a.push(`xmlns="${Kd}"`);
  const n = [];
  for (let i = 0; i < e.attributes.length; i += 1) {
    const u = e.attributes.item(i);
    u && n.push({ name: u.name, value: u.value });
  }
  n.sort((i, u) => i.name.localeCompare(u.name)).forEach((i) => {
    i.name === "xmlns" && An(e) === "infNFe" || a.push(`${i.name}="${Wd(i.value)}"`);
  });
  const o = a.length > 0 ? `<${r} ${a.join(" ")}>` : `<${r}>`;
  let s = "";
  for (let i = 0; i < e.childNodes.length; i += 1)
    s += La(e.childNodes.item(i));
  return `${o}${s}</${r}>`;
}
function Jd(t, e) {
  var a;
  const r = t.match(new RegExp(`-----BEGIN ${e}-----([\\s\\S]*?)-----END ${e}-----`));
  return ((a = r == null ? void 0 : r[1]) == null ? void 0 : a.replace(/\s+/g, "")) ?? "";
}
function gn(t, e) {
  const r = t.match(new RegExp(`-----BEGIN ${e}-----[\\s\\S]*?-----END ${e}-----`));
  return (r == null ? void 0 : r[0]) ?? "";
}
function Zd(t) {
  var a;
  const e = (a = t.certificatePath) == null ? void 0 : a.trim();
  if (!e)
    throw new h({
      code: "CERTIFICATE_NOT_CONFIGURED",
      message: "Caminho do certificado A1 nao configurado.",
      category: "CERTIFICATE"
    });
  if (!_e.existsSync(e))
    throw new h({
      code: "CERTIFICATE_FILE_NOT_FOUND",
      message: `Arquivo do certificado nao encontrado: ${e}`,
      category: "CERTIFICATE"
    });
  if (!t.certificatePassword)
    throw new h({
      code: "CERTIFICATE_PASSWORD_REQUIRED",
      message: "Senha do certificado A1 nao configurada.",
      category: "CERTIFICATE"
    });
  const r = Xe.extname(e).toLowerCase();
  if (![".pfx", ".p12"].includes(r))
    throw new h({
      code: "CERTIFICATE_FORMAT_NOT_SUPPORTED",
      message: "Assinatura NFC-e direta suporta certificado A1 .pfx/.p12.",
      category: "CERTIFICATE"
    });
  try {
    const n = ia(["-in", e, "-nocerts", "-nodes"], t.certificatePassword), o = ia(["-in", e, "-clcerts", "-nokeys"], t.certificatePassword), s = gn(n, "PRIVATE KEY") || gn(n, "RSA PRIVATE KEY"), i = Jd(o, "CERTIFICATE");
    if (!s)
      throw new Error("Chave privada nao encontrada no arquivo A1.");
    if (!i)
      throw new Error("Certificado publico nao encontrado no arquivo A1.");
    return { privateKeyPem: s, certificateBody: i };
  } catch (n) {
    throw new h({
      code: "CERTIFICATE_PKCS12_EXTRACT_FAILED",
      message: "Falha ao extrair chave/certificado do A1 para assinatura XML.",
      category: "CERTIFICATE",
      details: n == null ? void 0 : n.details,
      cause: n
    });
  }
}
function el(t) {
  const e = [], r = new Wo({
    onError: (n, o) => e.push(String(o))
  }).parseFromString(t, "application/xml");
  if (e.length > 0)
    throw new h({
      code: "NFCE_XML_MALFORMED",
      message: `XML NFC-e malformado antes da assinatura: ${e.join(" | ")}`,
      category: "VALIDATION",
      details: { parserErrors: e }
    });
  const a = r.getElementsByTagName("infNFe").item(0);
  if (!a)
    throw new h({
      code: "NFCE_XML_INF_NFE_NOT_FOUND",
      message: "XML NFC-e nao contem grupo infNFe para assinatura.",
      category: "VALIDATION"
    });
  return a;
}
function tl(t) {
  const e = [], r = new Wo({
    onError: (a, n) => e.push(String(n))
  }).parseFromString(t, "application/xml");
  if (e.length > 0 || !r.documentElement)
    throw new h({
      code: "NFCE_XML_SIGNATURE_FRAGMENT_INVALID",
      message: `Fragmento XML de assinatura invalido: ${e.join(" | ")}`,
      category: "VALIDATION",
      details: { parserErrors: e }
    });
  return La(r.documentElement);
}
function rl(t) {
  return t.replace(/>\s+</g, "><").trim();
}
class al {
  sign(e, r) {
    const a = rl(e), n = el(a), o = n.getAttribute("Id");
    if (!o)
      throw new h({
        code: "NFCE_XML_ID_NOT_FOUND",
        message: "infNFe nao possui atributo Id para assinatura.",
        category: "VALIDATION"
      });
    const { privateKeyPem: s, certificateBody: i } = Zd(r), u = La(n), c = zn("sha1").update(u, "utf8").digest("base64"), l = `<SignedInfo xmlns="${Nn}"><CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/><SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/><Reference URI="#${o}"><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/></Transforms><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><DigestValue>${c}</DigestValue></Reference></SignedInfo>`, E = tl(l), m = Ds("RSA-SHA1").update(E, "utf8").sign(s, "base64"), f = `<Signature xmlns="${Nn}">${l}<SignatureValue>${m}</SignatureValue><KeyInfo><X509Data><X509Certificate>${i}</X509Certificate></X509Data></KeyInfo></Signature>`;
    return a.includes("</infNFeSupl>") ? a.replace("</infNFeSupl>", `</infNFeSupl>${f}`) : a.replace("</infNFe>", `</infNFe>${f}`);
  }
}
const nl = new al(), ol = {
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
}, sl = {
  SP: "35"
};
function Oa(t) {
  return (t.uf ?? "SP").trim().toUpperCase();
}
function il(t) {
  const e = Oa(t);
  if (e !== "SP")
    throw new h({
      code: "SEFAZ_UF_NOT_SUPPORTED",
      message: `SEFAZ direta para NFC-e ainda esta configurada somente para SP. UF recebida: ${e}.`,
      category: "CONFIGURATION"
    });
}
function ya(t, e) {
  var s;
  il(t);
  const r = (s = t.sefazBaseUrl) == null ? void 0 : s.trim(), a = ol[t.environment][e];
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
function cl(t) {
  return ya(t, "statusServico");
}
function ul(t) {
  return ya(t, "autorizacao");
}
function dl(t) {
  return ya(t, "retAutorizacao");
}
function hn(t) {
  var e, r, a;
  if (t.provider !== "sefaz-direct")
    throw new h({
      code: "SEFAZ_PROVIDER_INVALID",
      message: "O teste SEFAZ direto exige provider sefaz-direct.",
      category: "CONFIGURATION"
    });
  if (t.environment !== "homologation" && t.environment !== "production")
    throw new h({
      code: "SEFAZ_ENVIRONMENT_INVALID",
      message: "Ambiente fiscal invalido.",
      category: "CONFIGURATION"
    });
  if ((t.model ?? 65) !== 65)
    throw new h({
      code: "SEFAZ_MODEL_NOT_SUPPORTED",
      message: "O diagnostico atual suporta apenas NFC-e modelo 65.",
      category: "CONFIGURATION"
    });
  if (!((e = t.certificatePath) != null && e.trim()))
    throw new h({
      code: "CERTIFICATE_NOT_CONFIGURED",
      message: "Caminho do certificado A1 nao configurado.",
      category: "CERTIFICATE"
    });
  if (!_e.existsSync(t.certificatePath))
    throw new h({
      code: "CERTIFICATE_FILE_NOT_FOUND",
      message: `Arquivo do certificado nao encontrado: ${t.certificatePath}`,
      category: "CERTIFICATE"
    });
  if (!t.certificatePassword)
    throw new h({
      code: "CERTIFICATE_PASSWORD_REQUIRED",
      message: "Senha do certificado A1 nao configurada.",
      category: "CERTIFICATE"
    });
  if (!((r = t.cscId) != null && r.trim()))
    throw new h({
      code: "CSC_ID_REQUIRED",
      message: "CSC ID nao configurado.",
      category: "CONFIGURATION"
    });
  if (!((a = t.cscToken) != null && a.trim()))
    throw new h({
      code: "CSC_TOKEN_REQUIRED",
      message: "CSC Token nao configurado.",
      category: "CONFIGURATION"
    });
}
function ll(t) {
  const e = Oa(t), r = sl[e];
  if (!r)
    throw new h({
      code: "SEFAZ_UF_CODE_NOT_MAPPED",
      message: `Codigo IBGE da UF ${e} nao esta mapeado para consulta de status.`,
      category: "CONFIGURATION"
    });
  return `<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4"><consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>${t.environment === "production" ? "1" : "2"}</tpAmb><cUF>${r}</cUF><xServ>STATUS</xServ></consStatServ></nfeDadosMsg></soap12:Body></soap12:Envelope>`;
}
const El = {
  status: "http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF",
  autorizacao: "http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote",
  retAutorizacao: "http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4/nfeRetAutorizacaoLote"
};
function Qo(t) {
  if (!(t instanceof h)) return !1;
  const e = t.details;
  return t.code === "SEFAZ_NETWORK_OR_TLS_ERROR" && ((e == null ? void 0 : e.originalCode) === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" || (e == null ? void 0 : e.originalCode) === "SELF_SIGNED_CERT_IN_CHAIN" || /unable to get local issuer certificate|self-signed certificate/i.test((e == null ? void 0 : e.originalMessage) ?? t.message));
}
function Cr(t, e, r, a = {}) {
  return new Promise((n, o) => {
    const s = Date.now(), i = El[a.action ?? "status"], u = a.serviceName ?? "SEFAZ", c = Ss.request(
      t,
      {
        method: "POST",
        pfx: _e.readFileSync(r.certificatePath),
        passphrase: r.certificatePassword ?? void 0,
        ca: r.caBundlePath ? _e.readFileSync(r.caBundlePath) : void 0,
        rejectUnauthorized: a.allowUnauthorizedServerCertificate !== !0,
        headers: {
          "content-type": `application/soap+xml; charset=utf-8; action="${i}"`,
          "content-length": Buffer.byteLength(e, "utf8"),
          soapaction: i
        },
        timeout: 3e4
      },
      (l) => {
        let E = "";
        l.setEncoding("utf8"), l.on("data", (m) => {
          E += m;
        }), l.on("end", () => {
          if (!l.statusCode || l.statusCode < 200 || l.statusCode >= 300) {
            const m = E.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            o(new h({
              code: "SEFAZ_HTTP_ERROR",
              message: `SEFAZ retornou HTTP ${l.statusCode ?? "sem status"} em ${Date.now() - s}ms.${m ? ` Corpo: ${m.slice(0, 500)}` : ""}`,
              category: "SEFAZ",
              retryable: !0,
              details: {
                url: t,
                statusCode: l.statusCode,
                headers: l.headers,
                body: E
              }
            }));
            return;
          }
          n(E);
        });
      }
    );
    c.on("timeout", () => {
      c.destroy(new Error(`Timeout de 30000ms ao chamar ${u}.`));
    }), c.on("error", (l) => {
      o(new h({
        code: "SEFAZ_NETWORK_OR_TLS_ERROR",
        message: `Falha de rede/TLS ao chamar SEFAZ: ${l.message}`,
        category: "NETWORK",
        retryable: !0,
        cause: l,
        details: {
          url: t,
          originalCode: l.code ?? null,
          originalMessage: l.message
        }
      }));
    }), c.write(e, "utf8"), c.end();
  });
}
async function ml(t, e, r) {
  try {
    return {
      rawResponse: await Cr(t, e, r, {
        action: "status",
        serviceName: "NFeStatusServico4"
      }),
      tlsValidation: "verified",
      warning: null
    };
  } catch (a) {
    if (r.environment === "homologation" && Qo(a))
      return {
        rawResponse: await Cr(t, e, r, {
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
async function In(t, e, r, a) {
  const n = a === "autorizacao" ? "NFeAutorizacao4" : a === "retAutorizacao" ? "NFeRetAutorizacao4" : "NFeStatusServico4";
  try {
    return {
      rawResponse: await Cr(t, e, r, { action: a, serviceName: n }),
      tlsValidation: "verified",
      warning: null
    };
  } catch (o) {
    if (r.environment === "homologation" && Qo(o))
      return {
        rawResponse: await Cr(t, e, r, {
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
function De(t, e) {
  var a;
  const r = t.match(new RegExp(`<[^:>]*:?${e}[^>]*>([^<]*)</[^:>]*:?${e}>`, "i"));
  return ((a = r == null ? void 0 : r[1]) == null ? void 0 : a.trim()) ?? null;
}
function pl(t, e) {
  const r = t.match(new RegExp(`(<[^:>]*:?${e}[^>]*>[\\s\\S]*?</[^:>]*:?${e}>)`, "i"));
  return (r == null ? void 0 : r[1]) ?? null;
}
function Jo(t) {
  return t.replace(/^\s*<\?xml[^?]*\?>\s*/i, "").trim();
}
function Dr(t) {
  return t.replace(/>\s+</g, "><").trim();
}
function Tl(t) {
  const e = String(Date.now()).slice(-15).padStart(15, "0"), r = Dr(Jo(t));
  return Dr(`<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"><enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><idLote>${e}</idLote><indSinc>1</indSinc>` + r + "</enviNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>");
}
function _l(t, e) {
  return e ? Dr(`<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">${Jo(t)}${e}</nfeProc>`) : null;
}
function fl(t, e) {
  const r = t.environment === "production" ? "1" : "2";
  return Dr(`<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4"><consReciNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>${r}</tpAmb><nRec>${e}</nRec></consReciNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>`);
}
function Cn(t, e, r, a) {
  const n = De(r, "cStat"), o = De(r, "xMotivo") ?? "Resposta de autorizacao recebida sem xMotivo.", s = pl(r, "protNFe"), u = (s ? De(s, "cStat") : null) ?? n, c = s ? De(s, "xMotivo") ?? o : o, l = De(r, "nRec"), E = s ? De(s, "nProt") : null, m = s ? De(s, "dhRecbto") : null, f = s ? De(s, "chNFe") : t.accessKey;
  if (u === "100" || u === "150") {
    const C = _l(e, s);
    return {
      status: "AUTHORIZED",
      provider: "sefaz-direct",
      accessKey: f,
      protocol: E,
      receiptNumber: l,
      statusCode: u,
      statusMessage: c,
      authorizedAt: m,
      issuedAt: t.issuedAt,
      xmlBuilt: t.xmlBuilt ?? null,
      xmlSigned: e,
      xmlSent: e,
      xmlAuthorized: C,
      qrCodeUrl: t.qrCodeUrl ?? null,
      rawResponse: { rawResponse: r, warning: a ?? null }
    };
  }
  return n === "103" || n === "105" ? {
    status: "PENDING",
    provider: "sefaz-direct",
    accessKey: t.accessKey,
    receiptNumber: l,
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
    receiptNumber: l,
    protocol: E,
    statusCode: u ?? "SEFAZ_AUTHORIZATION_REJECTED",
    statusMessage: c,
    issuedAt: t.issuedAt,
    xmlBuilt: t.xmlBuilt ?? null,
    xmlSigned: e,
    xmlSent: e,
    qrCodeUrl: t.qrCodeUrl ?? null,
    rawResponse: { rawResponse: r, warning: a ?? null }
  };
}
class Nl {
  constructor() {
    he(this, "providerId", "sefaz-direct");
  }
  async authorizeNfce(e, r) {
    if (hn(r), !e.xmlBuilt)
      throw new h({
        code: "NFCE_XML_NOT_BUILT",
        message: "XML NFC-e gerado nao foi informado ao provider SEFAZ.",
        category: "VALIDATION"
      });
    const a = ul(r), n = Date.now();
    _.info(`[SEFAZ_DIRECT] Iniciando autorizacao NFC-e. saleId=${e.saleId} accessKey=${e.accessKey ?? "sem-chave"} ambiente=${r.environment} endpoint=${a}`), _.info(`[SEFAZ_DIRECT] Assinando XML NFC-e. saleId=${e.saleId}`);
    const o = nl.sign(e.xmlBuilt, r);
    _.info(`[SEFAZ_DIRECT] XML NFC-e assinado. saleId=${e.saleId}`);
    const s = Tl(o);
    _.info(`[SEFAZ_DIRECT] Enviando lote NFeAutorizacao4. saleId=${e.saleId} endpoint=${a}`);
    const i = await In(a, s, r, "autorizacao"), u = Cn(e, o, i.rawResponse, i.warning);
    if (_.info(`[SEFAZ_DIRECT] Resposta NFeAutorizacao4. saleId=${e.saleId} cStat=${u.statusCode ?? "sem-cStat"} status=${u.status} motivo=${u.statusMessage}`), u.status === "PENDING" && u.receiptNumber) {
      const c = dl(r), l = fl(r, u.receiptNumber);
      _.info(`[SEFAZ_DIRECT] Consultando NFeRetAutorizacao4. saleId=${e.saleId} nRec=${u.receiptNumber} endpoint=${c}`);
      const E = await In(c, l, r, "retAutorizacao"), m = Cn(e, o, E.rawResponse, E.warning ?? i.warning);
      return _.info(`[SEFAZ_DIRECT] Resposta NFeRetAutorizacao4. saleId=${e.saleId} cStat=${m.statusCode ?? "sem-cStat"} status=${m.status} motivo=${m.statusMessage}`), {
        ...m,
        rawResponse: {
          ...typeof m.rawResponse == "object" && m.rawResponse ? m.rawResponse : {},
          authorizationUrl: a,
          retAutorizacaoUrl: c,
          responseTimeMs: Date.now() - n
        }
      };
    }
    return {
      ...u,
      rawResponse: {
        ...typeof u.rawResponse == "object" && u.rawResponse ? u.rawResponse : {},
        url: a,
        responseTimeMs: Date.now() - n
      }
    };
  }
  async cancelNfce(e, r) {
    throw new h({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async consultStatus(e, r) {
    throw new h({
      code: "SEFAZ_DIRECT_NOT_IMPLEMENTED",
      message: "Provider SEFAZ direto ainda não implementado.",
      category: "PROVIDER"
    });
  }
  async testStatusServico(e) {
    hn(e);
    const r = cl(e), a = ll(e), n = Date.now(), o = await ml(r, a, e), s = Date.now() - n, i = o.rawResponse, u = De(i, "cStat"), c = De(i, "xMotivo") ?? "Resposta recebida da SEFAZ sem xMotivo.";
    return {
      provider: "sefaz-direct",
      environment: e.environment,
      uf: Oa(e),
      model: 65,
      service: "NFeStatusServico4",
      url: r,
      success: u === "107",
      statusCode: u,
      statusMessage: c,
      responseTimeMs: s,
      rawRequest: a,
      rawResponse: i,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
      tlsValidation: o.tlsValidation,
      warning: o.warning
    };
  }
}
class Al {
  constructor() {
    he(this, "providers");
    this.providers = {
      mock: new tu(),
      "sefaz-direct": new Nl(),
      gateway: new Zc()
    };
  }
  resolve(e) {
    return this.providers[e.provider];
  }
}
class gl {
  constructor(e, r) {
    he(this, "workerId");
    this.repository = e, this.processor = r, this.workerId = `main-${process.pid}`;
  }
  async enqueue(e) {
    return this.repository.enqueue(e);
  }
  async processNext() {
    const e = (/* @__PURE__ */ new Date()).toISOString(), r = this.repository.claimNextQueueItem(e, this.workerId);
    return r ? this.processClaimedItem(r) : (_.info("[FiscalQueue] Nenhum item pronto para processamento."), null);
  }
  async processById(e) {
    const r = (/* @__PURE__ */ new Date()).toISOString(), a = this.repository.claimQueueItemById(e, r, this.workerId);
    return a ? this.processClaimedItem(a) : (_.warn(`[FiscalQueue] Item ${e} nao encontrado ou nao esta pronto para processamento.`), this.repository.findQueueItemById(e));
  }
  async processClaimedItem(e) {
    _.info(`[FiscalQueue] Iniciando job ${e.id} (${e.operation}).`);
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
      ), _.info(`[FiscalQueue] Job ${e.id} concluido com status ${r.status}.`);
    } catch (r) {
      const a = ce(r, "FISCAL_QUEUE_PROCESS_FAILED"), n = a.retryable ? new Date(Date.now() + e.attempts * 6e4).toISOString() : null;
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
      ), _.error(`[FiscalQueue] Job ${e.id} falhou: ${a.code} - ${a.message}`);
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
function Dn(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function te(t) {
  return String(t ?? "").trim().toUpperCase();
}
function hl(t) {
  return /^\d{8}$/.test(t);
}
function Il(t) {
  return /^\d{4}$/.test(t);
}
function Cl(t) {
  return /^[0-8]$/.test(t);
}
function Dl(t) {
  return /^\d{7}$/.test(t);
}
function vl(t) {
  return /^(SEM GTIN|\d{8}|\d{12,14})$/.test(t);
}
function vn(t, e) {
  return Math.abs(t - e) < 0.01;
}
function Sl(t) {
  return {
    DINHEIRO: "Dinheiro",
    PIX: "PIX",
    DEBITO: "Cartão de débito",
    CREDITO: "Cartão de crédito",
    VOUCHER: "Voucher",
    OUTROS: "Outros"
  }[t];
}
class Rl {
  validateAuthorizeRequest(e, r) {
    const a = [], n = fe.findById(e.companyId);
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
      throw new h({
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
    Dn(o.cnpj).length !== 14 && n.push({ code: "EMITTER_CNPJ_INVALID", message: "CNPJ do emitente inválido.", field: "emitter.cnpj", severity: "error" }), te(o.stateRegistration) || n.push({ code: "EMITTER_IE_REQUIRED", message: "IE do emitente é obrigatória.", field: "emitter.stateRegistration", severity: "error" }), te(o.taxRegimeCode) || n.push({ code: "EMITTER_CRT_REQUIRED", message: "CRT do emitente é obrigatório.", field: "emitter.taxRegimeCode", severity: "error" }), te(o.legalName) || n.push({ code: "EMITTER_LEGAL_NAME_REQUIRED", message: "Razão social do emitente é obrigatória.", field: "emitter.legalName", severity: "error" }), te(o.tradeName) || n.push({ code: "EMITTER_TRADE_NAME_REQUIRED", message: "Nome fantasia do emitente é obrigatório.", field: "emitter.tradeName", severity: "error" }), (!te(o.address.street) || !te(o.address.number) || !te(o.address.neighborhood)) && n.push({ code: "EMITTER_ADDRESS_INCOMPLETE", message: "Endereço do emitente está incompleto.", field: "emitter.address", severity: "error" }), (!te(o.address.city) || !te(o.address.state)) && n.push({ code: "EMITTER_CITY_STATE_REQUIRED", message: "Cidade e UF do emitente são obrigatórias.", field: "emitter.address.city", severity: "error" }), Dn(o.address.cityIbgeCode).length !== 7 && n.push({ code: "EMITTER_CITY_IBGE_INVALID", message: "Código IBGE do município do emitente é inválido.", field: "emitter.address.cityIbgeCode", severity: "error" }), e.environment !== r.environment && n.push({
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
    vn(a, e.totals.finalAmount) || r.push({
      code: "PAYMENTS_TOTAL_MISMATCH",
      message: "A soma dos pagamentos não corresponde ao total da venda.",
      field: "payments",
      severity: "error"
    }), e.payments.forEach((o, s) => {
      o.amount <= 0 && r.push({
        code: "PAYMENT_AMOUNT_INVALID",
        message: `Pagamento ${s + 1} (${Sl(o.method)}) com valor inválido.`,
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
    vn(n, e.totals.changeAmount) || r.push({
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
      hl(a.tax.ncm) || r.push({ code: "ITEM_NCM_INVALID", message: "NCM ausente ou inválido.", field: `items[${n}].tax.ncm`, severity: "error", itemIndex: n, itemId: o }), Il(a.tax.cfop) || r.push({ code: "ITEM_CFOP_INVALID", message: "CFOP ausente ou inválido.", field: `items[${n}].tax.cfop`, severity: "error", itemIndex: n, itemId: o }), Cl(a.tax.originCode) || r.push({ code: "ITEM_ORIGIN_INVALID", message: "Origem fiscal ausente ou inválida.", field: `items[${n}].tax.originCode`, severity: "error", itemIndex: n, itemId: o }), !a.tax.csosn && !a.tax.icmsCst && r.push({ code: "ITEM_ICMS_CLASSIFICATION_REQUIRED", message: "CST/CSOSN de ICMS é obrigatório.", field: `items[${n}].tax`, severity: "error", itemIndex: n, itemId: o }), te(a.tax.pisCst) || r.push({ code: "ITEM_PIS_CST_REQUIRED", message: "CST de PIS é obrigatório.", field: `items[${n}].tax.pisCst`, severity: "error", itemIndex: n, itemId: o }), te(a.tax.cofinsCst) || r.push({ code: "ITEM_COFINS_CST_REQUIRED", message: "CST de COFINS é obrigatório.", field: `items[${n}].tax.cofinsCst`, severity: "error", itemIndex: n, itemId: o }), a.tax.cest && !Dl(a.tax.cest) && r.push({ code: "ITEM_CEST_INVALID", message: "CEST informado é inválido.", field: `items[${n}].tax.cest`, severity: "error", itemIndex: n, itemId: o }), a.gtin && !vl(a.gtin) && r.push({ code: "ITEM_GTIN_INVALID", message: "GTIN informado é inválido.", field: `items[${n}].gtin`, severity: "error", itemIndex: n, itemId: o });
    });
  }
  validateRuntimeConfig(e, r, a) {
    r.provider !== "mock" && (te(r.cscId) || a.push({ code: "CSC_ID_REQUIRED", message: "CSC ID é obrigatório para NFC-e real.", field: "config.cscId", severity: "error" }), te(r.cscToken) || a.push({ code: "CSC_TOKEN_REQUIRED", message: "CSC Token é obrigatório para NFC-e real.", field: "config.cscToken", severity: "error" })), r.provider === "gateway" && (te(r.gatewayBaseUrl) || a.push({ code: "GATEWAY_BASE_URL_REQUIRED", message: "URL base do gateway fiscal não configurada.", field: "config.gatewayBaseUrl", severity: "error" }), te(r.gatewayApiKey) || a.push({ code: "GATEWAY_API_KEY_REQUIRED", message: "API key do gateway fiscal não configurada.", field: "config.gatewayApiKey", severity: "error" })), e.environment === "production" && r.provider === "mock" && a.push({
      code: "MOCK_PROVIDER_NOT_ALLOWED_IN_PRODUCTION",
      message: "Provider mock não pode ser usado em produção.",
      field: "config.provider",
      severity: "error"
    });
  }
}
const Ll = new Rl(), Ol = {
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
function yl(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function zr(t, e) {
  return yl(t).padStart(e, "0").slice(-e);
}
function bl(t) {
  let e = 2, r = 0;
  for (let o = t.length - 1; o >= 0; o -= 1)
    r += Number(t[o]) * e, e = e === 9 ? 2 : e + 1;
  const n = 11 - r % 11;
  return n >= 10 ? "0" : String(n);
}
function Ul(t) {
  const e = new Date(t);
  if (Number.isNaN(e.getTime()))
    throw new Error("Data de emissao invalida para gerar chave de acesso.");
  return `${String(e.getFullYear()).slice(-2)}${String(e.getMonth() + 1).padStart(2, "0")}`;
}
class wl {
  generate(e) {
    var i;
    const r = Ol[e.uf.toUpperCase()];
    if (!r)
      throw new Error(`UF sem codigo IBGE configurado para chave NFC-e: ${e.uf}`);
    const a = zr(e.cnpj, 14);
    if (a.length !== 14 || /^0+$/.test(a))
      throw new Error("CNPJ invalido para gerar chave de acesso NFC-e.");
    const n = ((i = e.numericCode) == null ? void 0 : i.replace(/\D/g, "").padStart(8, "0").slice(-8)) ?? Ea.randomInt(0, 1e8).toString().padStart(8, "0"), o = [
      r,
      Ul(e.issuedAt),
      a,
      "65",
      zr(e.series, 3),
      zr(e.number, 9),
      String(e.emissionType),
      n
    ].join(""), s = bl(o);
    return {
      accessKey: `${o}${s}`,
      numericCode: n,
      checkDigit: s,
      ufCode: r,
      yearMonth: o.slice(2, 6)
    };
  }
}
const Fl = new wl(), Ml = "http://www.portalfiscal.inf.br/nfe", xl = "GalbertoPDV-0.1.0", Pl = "NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL", Bl = "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL";
function v(t) {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function Xl(t) {
  return t.replace(/>\s+</g, "><").trim();
}
function Zo(t) {
  const e = J(t);
  return e ? String(Number(e)) : "";
}
function es(t) {
  const e = t === "production" ? "www.nfce.fazenda.sp.gov.br" : "www.homologacao.nfce.fazenda.sp.gov.br";
  return {
    qrCodeBaseUrl: `https://${e}/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx`,
    publicConsultUrl: `https://${e}/consulta`
  };
}
function kl(t) {
  return zn("sha1").update(t, "utf8").digest("hex").toUpperCase();
}
function ts(t, e) {
  const r = Zo(t.cscId), a = String(t.cscToken ?? "").trim(), n = t.environment === "production" ? "1" : "2", o = "2", { qrCodeBaseUrl: s } = es(t.environment), i = kl(`${e}|${o}|${n}|${r}${a}`), u = `${e}|${o}|${n}|${r}|${i}`;
  return `${s}?p=${u}`;
}
function J(t) {
  return String(t ?? "").replace(/\D/g, "");
}
function pe(t) {
  return Number(t ?? 0).toFixed(2);
}
function Q(t) {
  return Math.round(Number(t ?? 0) * 100);
}
function Sn(t) {
  return (t / 100).toFixed(2);
}
function jr(t, e) {
  const r = Q(t.grossAmount), a = Math.max(0, Math.min(e, r));
  return {
    ...t,
    discountAmount: a / 100,
    totalAmount: Math.max(r - a, 0) / 100
  };
}
function ba(t) {
  return t.reduce((e, r) => e + Q(r.discountAmount), 0);
}
function $l(t, e) {
  const r = Q(e), a = ba(t), n = r - a;
  if (n <= 0 || t.length === 0)
    return t.map((c) => jr(c, Q(c.discountAmount)));
  const o = t.map((c) => {
    const l = Q(c.grossAmount), E = Math.max(0, Math.min(Q(c.discountAmount), l));
    return {
      item: c,
      grossCents: l,
      currentCents: E,
      remainingCents: Math.max(l - E, 0),
      allocatedExtraCents: 0
    };
  }), s = o.reduce((c, l) => c + l.remainingCents, 0);
  if (s <= 0)
    return o.map((c) => jr(c.item, c.currentCents));
  let i = 0;
  for (const c of o) {
    const l = Math.floor(n * c.remainingCents / s);
    c.allocatedExtraCents = Math.min(l, c.remainingCents), i += c.allocatedExtraCents;
  }
  let u = n - i;
  for (const c of o) {
    if (u <= 0) break;
    const l = c.remainingCents - c.allocatedExtraCents;
    if (l <= 0) continue;
    const E = Math.min(l, u);
    c.allocatedExtraCents += E, u -= E;
  }
  return o.map((c) => jr(
    c.item,
    c.currentCents + c.allocatedExtraCents
  ));
}
function Rn(t) {
  return Number(t ?? 0).toFixed(4);
}
function ql(t) {
  const r = t.trim().match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?([+-]\d{2}:\d{2}|Z)$/
  );
  if (r) {
    const [, c, l, E] = r;
    return `${c}T${l}${E === "Z" ? "+00:00" : E}`;
  }
  const a = new Date(t);
  if (Number.isNaN(a.getTime())) return t;
  const n = (c) => String(c).padStart(2, "0"), o = -a.getTimezoneOffset(), s = o >= 0 ? "+" : "-", i = Math.abs(o), u = `${s}${n(Math.floor(i / 60))}:${n(i % 60)}`;
  return `${a.getFullYear()}-${n(a.getMonth() + 1)}-${n(a.getDate())}T${n(a.getHours())}:${n(a.getMinutes())}:${n(a.getSeconds())}${u}`;
}
function Gl(t) {
  const e = String(t ?? "").trim();
  return e.length > 0 ? e : "SEM GTIN";
}
function Vl(t) {
  return {
    DINHEIRO: "01",
    CREDITO: "03",
    DEBITO: "04",
    VOUCHER: "99",
    PIX: "17",
    OUTROS: "99"
  }[t] ?? "99";
}
function Hl(t) {
  return ["03", "04", "17"].includes(t) ? "<card><tpIntegra>2</tpIntegra></card>" : "";
}
function rs(t) {
  return t.method === "DINHEIRO" && t.receivedAmount != null ? Q(t.receivedAmount) : Q(t.amount);
}
function Ua(t) {
  return ["1", "4"].includes(String(t ?? "").trim());
}
function zl(t, e) {
  if (Ua(e.emitter.taxRegimeCode))
    return !1;
  const r = t.tax.icmsCst || "00";
  return !["40", "41", "50"].includes(r);
}
function jl(t, e) {
  return t.reduce(
    (r, a) => (zl(a, e) && (r.baseAmount += Number(a.totalAmount ?? 0)), r),
    { baseAmount: 0, amount: 0 }
  );
}
function Yl(t, e) {
  const r = v(t.tax.originCode || "0");
  if (Ua(e.emitter.taxRegimeCode)) {
    const n = t.tax.csosn || "102";
    return `<ICMS><ICMSSN102><orig>${r}</orig><CSOSN>${v(n)}</CSOSN></ICMSSN102></ICMS>`;
  }
  const a = t.tax.icmsCst || "00";
  return ["40", "41", "50"].includes(a) ? `<ICMS><ICMS40><orig>${r}</orig><CST>${v(a)}</CST></ICMS40></ICMS>` : `<ICMS><ICMS00><orig>${r}</orig><CST>${v(a)}</CST><modBC>3</modBC><vBC>${pe(t.totalAmount)}</vBC><pICMS>0.00</pICMS><vICMS>0.00</vICMS></ICMS00></ICMS>`;
}
function Kl(t) {
  const e = t.tax.pisCst || "49";
  return ["04", "05", "06", "07", "08", "09"].includes(e) ? `<PIS><PISNT><CST>${v(e)}</CST></PISNT></PIS>` : ["01", "02"].includes(e) ? `<PIS><PISAliq><CST>${v(e)}</CST><vBC>${pe(t.totalAmount)}</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISAliq></PIS>` : `<PIS><PISOutr><CST>${v(e)}</CST><vBC>0.00</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISOutr></PIS>`;
}
function Wl(t) {
  const e = t.tax.cofinsCst || "49";
  return ["04", "05", "06", "07", "08", "09"].includes(e) ? `<COFINS><COFINSNT><CST>${v(e)}</CST></COFINSNT></COFINS>` : ["01", "02"].includes(e) ? `<COFINS><COFINSAliq><CST>${v(e)}</CST><vBC>${pe(t.totalAmount)}</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSAliq></COFINS>` : `<COFINS><COFINSOutr><CST>${v(e)}</CST><vBC>0.00</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSOutr></COFINS>`;
}
function Ql(t, e, r) {
  const a = t.id || String(e + 1), n = Gl(t.gtin), o = t.discountAmount > 0 ? `<vDesc>${pe(t.discountAmount)}</vDesc>` : "", s = r.environment === "homologation" && e === 0 ? Pl : t.description;
  return `<det nItem="${e + 1}">
<prod>
<cProd>${v(a)}</cProd>
<cEAN>${v(n)}</cEAN>
<xProd>${v(s)}</xProd>
<NCM>${v(J(t.tax.ncm))}</NCM>
${t.tax.cest ? `<CEST>${v(J(t.tax.cest))}</CEST>` : ""}
<CFOP>${v(J(t.tax.cfop))}</CFOP>
<uCom>${v(t.unit)}</uCom>
<qCom>${Rn(t.quantity)}</qCom>
<vUnCom>${pe(t.unitPrice)}</vUnCom>
<vProd>${pe(t.grossAmount)}</vProd>
<cEANTrib>${v(n)}</cEANTrib>
<uTrib>${v(t.unit)}</uTrib>
<qTrib>${Rn(t.quantity)}</qTrib>
<vUnTrib>${pe(t.unitPrice)}</vUnTrib>
${o}
<indTot>1</indTot>
</prod>
<imposto>
${Yl(t, r)}
${Kl(t)}
${Wl(t)}
</imposto>
</det>`;
}
function Jl(t, e) {
  const r = J(t == null ? void 0 : t.cpfCnpj);
  if (!r) return "";
  const a = r.length === 14 ? "CNPJ" : "CPF", n = e === "homologation" ? Bl : t == null ? void 0 : t.name, o = n ? `<xNome>${v(n)}</xNome>` : "";
  return `<dest>
<${a}>${r}</${a}>
${o}
<indIEDest>9</indIEDest>
</dest>`;
}
function as(t, e) {
  const r = t.reduce((o, s) => o + rs(s), 0), a = Q(e), n = r - a;
  return { paidAmountCents: r, finalAmountCents: a, changeAmountCents: n };
}
function Zl(t, e) {
  const r = as(t, e);
  return `<pag>${t.map((n) => {
    const o = Vl(n.method), s = o === "99" && n.description ? `<xPag>${v(n.description)}</xPag>` : "";
    return `<detPag><indPag>0</indPag><tPag>${o}</tPag>${s}<vPag>${Sn(rs(n))}</vPag>${Hl(o)}</detPag>`;
  }).join("")}${r.changeAmountCents > 0 ? `<vTroco>${Sn(r.changeAmountCents)}</vTroco>` : ""}</pag>`;
}
function eE(t) {
  return t ? `<infRespTec>
<CNPJ>${J(t.cnpj)}</CNPJ>
<xContato>${v(t.contactName)}</xContato>
<email>${v(t.email)}</email>
<fone>${J(t.phone)}</fone>
${t.csrtId ? `<idCSRT>${v(t.csrtId)}</idCSRT>` : ""}
${t.csrtHash ? `<hashCSRT>${v(t.csrtHash)}</hashCSRT>` : ""}
</infRespTec>` : "";
}
function tE(t, e) {
  const r = ts(t, e), { publicConsultUrl: a } = es(t.environment);
  return `<infNFeSupl><qrCode><![CDATA[${r}]]></qrCode><urlChave>${v(a)}</urlChave></infNFeSupl>`;
}
function rE(t) {
  const e = [], r = [], { input: a, effectiveItems: n } = t, o = (C, S, U) => e.push({ code: C, message: S, field: U, severity: "error" }), s = (C, S, U) => r.push({ code: C, message: S, field: U, severity: "warning" });
  t.accessKey.accessKey.length !== 44 && o("ACCESS_KEY_INVALID", "Chave de acesso deve ter 44 digitos.", "accessKey"), a.items.length || o("ITEMS_REQUIRED", "NFC-e deve possuir ao menos um item.", "items"), a.payments.length || o("PAYMENTS_REQUIRED", "NFC-e exige grupo de pagamento.", "payments"), J(a.fiscalContext.emitter.cnpj) || o("EMITTER_CNPJ_REQUIRED", "CNPJ do emitente e obrigatorio.", "fiscalContext.emitter.cnpj"), J(a.fiscalContext.emitter.address.cityIbgeCode) || o("CMUNFG_REQUIRED", "Codigo IBGE do municipio de fato gerador e obrigatorio.", "fiscalContext.emitter.address.cityIbgeCode"), Zo(a.fiscalContext.cscId) || o("CSC_ID_REQUIRED", "CSC ID e obrigatorio para gerar QR Code NFC-e.", "fiscalContext.cscId"), String(a.fiscalContext.cscToken ?? "").trim() || o("CSC_TOKEN_REQUIRED", "CSC Token e obrigatorio para gerar QR Code NFC-e.", "fiscalContext.cscToken"), a.items.forEach((C, S) => {
    J(C.tax.ncm).length !== 8 && o("ITEM_NCM_INVALID", "NCM deve ter 8 digitos.", `items[${S}].tax.ncm`), J(C.tax.cfop).length !== 4 && o("ITEM_CFOP_INVALID", "CFOP deve ter 4 digitos.", `items[${S}].tax.cfop`), Q(C.discountAmount) > Q(C.grossAmount) && o("ITEM_DISCOUNT_EXCEEDS_GROSS", "Desconto do item nao pode ser maior que o valor bruto.", `items[${S}].discountAmount`), Ua(a.fiscalContext.emitter.taxRegimeCode) && C.tax.csosn && !["102", "103", "300", "400"].includes(C.tax.csosn) && s("ITEM_CSOSN_LIMITED_SUPPORT", `CSOSN ${C.tax.csosn} sera serializado no grupo ICMSSN102; valide a regra fiscal antes de transmitir.`, `items[${S}].tax.csosn`);
  });
  const i = Q(a.totals.productsAmount), u = Q(a.totals.finalAmount), c = Q(a.totals.discountAmount), l = ba(n), E = n.reduce((C, S) => C + Q(S.totalAmount), 0);
  c !== l && o("TOTAL_DISCOUNT_DIFFERS_FROM_ITEMS", "Desconto total da NFC-e deve ser igual a soma dos descontos dos itens.", "totals.discountAmount"), i - c !== u && o("TOTAL_FINAL_AMOUNT_INVALID", "Valor final deve ser valor dos produtos menos desconto total.", "totals.finalAmount"), E !== u && o("ITEM_TOTALS_DIFFERS_FROM_FINAL_AMOUNT", "Somatorio liquido dos itens deve ser igual ao valor final da NFC-e.", "items");
  const m = as(a.payments, a.totals.finalAmount);
  m.paidAmountCents < m.finalAmountCents && o("PAYMENTS_TOTAL_UNDERPAID", "A soma dos pagamentos da NFC-e e menor que o valor total da nota.", "payments");
  const f = Math.max(m.changeAmountCents, 0);
  return Q(a.totals.changeAmount) !== f && o("PAYMENTS_CHANGE_INVALID", "Troco informado diverge de soma(detPag/vPag) - vNF.", "totals.changeAmount"), { ok: e.length === 0, errors: e, warnings: r };
}
function aE(t) {
  const { input: e, accessKey: r } = t, a = e.fiscalContext, n = a.emitter, o = n.address, s = a.environment === "production" ? "1" : "2", i = 1, u = t.effectiveItems, c = jl(u, a), l = ba(u) / 100;
  return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="${Ml}">
<infNFe versao="4.00" Id="NFe${r.accessKey}">
<ide>
<cUF>${r.ufCode}</cUF>
<cNF>${r.numericCode}</cNF>
<natOp>${v(e.sale.natureOperation || "VENDA")}</natOp>
<mod>65</mod>
<serie>${e.sale.series}</serie>
<nNF>${e.sale.number}</nNF>
<dhEmi>${v(ql(e.sale.issuedAt))}</dhEmi>
<tpNF>1</tpNF>
<idDest>1</idDest>
<cMunFG>${J(o.cityIbgeCode)}</cMunFG>
<tpImp>4</tpImp>
<tpEmis>${i}</tpEmis>
<cDV>${r.checkDigit}</cDV>
<tpAmb>${s}</tpAmb>
<finNFe>1</finNFe>
<indFinal>1</indFinal>
<indPres>1</indPres>
<procEmi>0</procEmi>
<verProc>${v(xl)}</verProc>
</ide>
<emit>
<CNPJ>${J(n.cnpj)}</CNPJ>
<xNome>${v(n.legalName)}</xNome>
${n.tradeName ? `<xFant>${v(n.tradeName)}</xFant>` : ""}
<enderEmit>
<xLgr>${v(o.street)}</xLgr>
<nro>${v(o.number)}</nro>
<xBairro>${v(o.neighborhood)}</xBairro>
<cMun>${J(o.cityIbgeCode)}</cMun>
<xMun>${v(o.city)}</xMun>
<UF>${v(o.state)}</UF>
<CEP>${J(o.zipCode)}</CEP>
<cPais>1058</cPais>
<xPais>BRASIL</xPais>
</enderEmit>
<IE>${J(n.stateRegistration)}</IE>
<CRT>${v(n.taxRegimeCode)}</CRT>
</emit>
${Jl(e.customer, a.environment)}
${u.map((E, m) => Ql(E, m, a)).join("")}
<total>
<ICMSTot>
<vBC>${pe(c.baseAmount)}</vBC>
<vICMS>${pe(c.amount)}</vICMS>
<vICMSDeson>0.00</vICMSDeson>
<vFCP>0.00</vFCP>
<vBCST>0.00</vBCST>
<vST>0.00</vST>
<vFCPST>0.00</vFCPST>
<vFCPSTRet>0.00</vFCPSTRet>
<vProd>${pe(e.totals.productsAmount)}</vProd>
<vFrete>0.00</vFrete>
<vSeg>0.00</vSeg>
<vDesc>${pe(l)}</vDesc>
<vII>0.00</vII>
<vIPI>0.00</vIPI>
<vIPIDevol>0.00</vIPIDevol>
<vPIS>0.00</vPIS>
<vCOFINS>0.00</vCOFINS>
<vOutro>0.00</vOutro>
<vNF>${pe(e.totals.finalAmount)}</vNF>
</ICMSTot>
</total>
<transp><modFrete>9</modFrete></transp>
${Zl(e.payments, e.totals.finalAmount)}
${e.sale.additionalInfo ? `<infAdic><infCpl>${v(e.sale.additionalInfo)}</infCpl></infAdic>` : ""}
${eE(e.technicalResponsible)}
</infNFe>
${tE(a, r.accessKey)}
</NFe>`;
}
class nE {
  build(e) {
    const r = Fl.generate({
      uf: e.fiscalContext.uf,
      issuedAt: e.sale.issuedAt,
      cnpj: e.fiscalContext.emitter.cnpj,
      model: 65,
      series: e.sale.series,
      number: e.sale.number,
      emissionType: 1,
      environment: e.fiscalContext.environment
    }), a = $l(e.items, e.totals.discountAmount), n = { accessKey: r, input: e, effectiveItems: a }, o = rE(n);
    if (!o.ok)
      return {
        accessKey: r.accessKey,
        numericCode: r.numericCode,
        checkDigit: r.checkDigit,
        xml: "",
        qrCodeUrl: null,
        validation: o
      };
    const s = ts(e.fiscalContext, r.accessKey);
    return {
      accessKey: r.accessKey,
      numericCode: r.numericCode,
      checkDigit: r.checkDigit,
      xml: Xl(aE(n)),
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
const ns = new nE();
class oE {
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
    const a = r ?? this.repository.createPendingDocument(e), n = ke.resolve(e.companyId), o = Ta.validateAuthorizeReadiness(n, e);
    if (!o.ok)
      throw new h({
        code: "FISCAL_READINESS_FAILED",
        message: o.errors.map((u) => u.message).join(" | "),
        category: "VALIDATION",
        details: o
      });
    const s = ke.resolveProviderConfig(e.companyId);
    Ll.validateAuthorizeRequest(e, s), this.repository.updateStatus(a.id, "PENDING");
    const i = ns.buildAuthorizeXml(e, n);
    if (!i.validation.ok) {
      const u = i.validation.errors.map((c) => c.message).join(" | ");
      throw this.repository.updateStatus(a.id, "ERROR", "NFCE_XML_BUILD_FAILED", u), new h({
        code: "NFCE_XML_BUILD_FAILED",
        message: u,
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
      const c = await this.resolveProvider(s).authorizeNfce(e, s), l = {
        ...c,
        issuedAt: c.issuedAt ?? e.issuedAt,
        accessKey: i.accessKey,
        xmlBuilt: c.xmlBuilt ?? i.xml,
        qrCodeUrl: c.qrCodeUrl ?? i.qrCodeUrl ?? null
      };
      if (l.status === "AUTHORIZED") {
        const E = this.repository.markAsAuthorized(a.id, l), m = await this.danfeService.generate(E);
        this.repository.updateDanfePath(E.id, m.danfePath);
      } else
        this.repository.markAsRejected(a.id, l);
      return l;
    } catch (u) {
      const c = ce(u, "FISCAL_AUTHORIZE_FAILED");
      if (this.repository.updateStatus(a.id, "ERROR", c.code, c.message), e.offlineFallbackMode === "queue" || c.retryable)
        return await this.queueService.enqueue({
          saleId: e.saleId,
          documentId: a.id,
          operation: "AUTHORIZE_NFCE",
          idempotencyKey: e.idempotencyKey,
          payload: e
        }), this.repository.updateStatus(a.id, "QUEUED", c.code, c.message), {
          status: "QUEUED",
          provider: s.provider,
          statusCode: c.code,
          statusMessage: c.message
        };
      throw c;
    }
  }
  async cancelNfce(e) {
    const r = this.repository.findById(e.documentId);
    if (!r)
      throw new h({
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
    const a = ke.resolveProviderConfig(r.companyId), o = await this.resolveProvider(a).cancelNfce(e, a);
    return this.repository.markAsCancelled(r.id, e, o), o;
  }
  async consultStatusByAccessKey(e) {
    const r = this.configService.getConfig(), n = await this.resolveProvider(r).consultStatus({ accessKey: e }, r), o = this.repository.findByAccessKey(e);
    return o && this.repository.updateStatus(o.id, n.status, n.statusCode, n.statusMessage), n;
  }
  async runStatusServiceDiagnostic() {
    const e = this.configService.getConfig(), r = `fiscal:test-status:${Date.now()}`;
    _.info(`[FiscalDiagnostic] Criando job ${r} para NFeStatusServico4.`);
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
      throw new h({
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
const wa = new Jc();
wa.ensureSchema();
const os = new Vc(), ss = new Al(), Fa = new Mc(), sE = new Uc();
let vr;
function iE(t) {
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
function cE(t) {
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
const is = new gl(wa, async (t) => {
  const e = t.payload;
  if (t.operation === "AUTHORIZE_NFCE") {
    const r = await vr.authorizeNfce(e);
    return iE(r);
  }
  if (t.operation === "CANCEL_NFCE") {
    const r = await vr.cancelNfce(e);
    return cE(r);
  }
  if (t.operation === "TEST_STATUS_NFCE") {
    const r = ke.resolveProviderConfig();
    _.info(`[FiscalDiagnostic] Iniciando NFeStatusServico4 provider=${r.provider} ambiente=${r.environment} uf=${r.uf ?? "SP"}.`), await Fa.assertCertificateReady(r), _.info("[FiscalDiagnostic] Certificado validado com sucesso.");
    const n = await ss.resolve(r).testStatusServico(r);
    return _.info(`[FiscalDiagnostic] NFeStatusServico4 finalizado url=${n.url} cStat=${n.statusCode ?? "sem cStat"} xMotivo=${n.statusMessage}.`), {
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
vr = new oE(
  wa,
  is,
  Fa,
  sE,
  os,
  (t) => ss.resolve(t)
);
const Ie = vr, uE = os, cs = is, dE = Fa, Ln = ke, lE = Ta, On = Wc;
let yn = !1;
function EE(t = 15e3) {
  yn || (yn = !0, setInterval(() => {
    cs.processNext();
  }, t));
}
function Yr(t) {
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
class mE {
  createPending(e) {
    const r = d.prepare(`
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
    return r ? (d.prepare(`
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
    const r = d.prepare("SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1").get(e);
    return r ? Yr(r) : null;
  }
  findBySaleId(e) {
    const r = d.prepare("SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1").get(e);
    return r ? Yr(r) : null;
  }
  findByAccessKey(e) {
    const r = d.prepare("SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1").get(e);
    return r ? Yr(r) : null;
  }
  markCancelled(e, r, a) {
    d.prepare(`
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
const tt = new mE(), ye = {
  DRAFT: "DRAFT",
  QUEUED: "QUEUED",
  SIGNING: "SIGNING",
  TRANSMITTING: "TRANSMITTING",
  AUTHORIZED: "AUTHORIZED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  CONTINGENCY: "CONTINGENCY",
  ERROR: "ERROR"
}, Ye = {
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
class pE {
  getOrReserveForSale(e, r) {
    const a = tt.findBySaleId(e);
    return a ? {
      series: a.series,
      number: a.number
    } : fe.reserveNextNfceNumber(r);
  }
}
const TE = new pE();
function bn(t) {
  return {
    "01": "DINHEIRO",
    "03": "CREDITO",
    "04": "DEBITO",
    10: "VOUCHER",
    17: "PIX"
  }[t] ?? "OUTROS";
}
function Un(t) {
  return t === 1 ? "production" : "homologation";
}
function _E(t) {
  return t.length === 0 ? "OUTROS" : new Set(t.map((r) => r.method)).size === 1 ? t[0].method : "OUTROS";
}
function pt(t, e, r = "") {
  return String(t ?? e ?? "").trim() || r;
}
function fE(t) {
  return ["1", "4"].includes(String(t.taxRegimeCode ?? "").trim());
}
function NE(t) {
  const e = String(t ?? "").trim();
  if (["1", "2", "3", "4"].includes(e))
    return e;
  throw new Error(`CRT/regime tributario invalido na company legada: ${e || "vazio"}.`);
}
function wn(t, e) {
  return fE(t) ? {
    csosn: e.csosn ?? "102",
    icmsCst: e.icms_cst
  } : {
    csosn: null,
    icmsCst: e.icms_cst ?? "00"
  };
}
function AE(t) {
  const e = String(t ?? "").trim().toUpperCase();
  return e === "AC" ? "-05:00" : ["AM", "MS", "MT", "RO", "RR"].includes(e) ? "-04:00" : "-03:00";
}
function gE(t) {
  const e = new Date(Date.now() - 12e4), r = (n) => String(n).padStart(2, "0"), a = AE(t);
  return `${e.getFullYear()}-${r(e.getMonth() + 1)}-${r(e.getDate())}T${r(e.getHours())}:${r(e.getMinutes())}:${r(e.getSeconds())}${a}`;
}
class hE {
  loadActiveCompany() {
    return d.prepare(`
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
    const e = fe.findActive();
    if (e)
      return e;
    const r = this.loadActiveCompany();
    if (!r)
      throw new Error("Nenhuma store ativa encontrada e não existe company ativa para criar o espelho fiscal.");
    return fe.create({
      code: "MAIN",
      name: r.nome_fantasia,
      legalName: r.razao_social,
      cnpj: r.cnpj,
      stateRegistration: r.inscricao_estadual,
      taxRegimeCode: NE(r.crt),
      environment: Un(r.ambiente_emissao),
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
    const r = d.prepare(`
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
    return d.prepare(`
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
    return d.prepare(`
      SELECT id, tpag, valor, valor_recebido, troco, descricao_outro
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id ASC
    `).all(e);
  }
  buildAuthorizeRequest(e, r, a, n) {
    const o = this.loadLegacySale(e), s = fe.findById(r);
    if (!s)
      throw new Error(`Store fiscal ${r} não encontrada para emissão.`);
    const i = this.loadLegacyItems(e), u = this.loadLegacyPayments(e).map((l) => ({
      method: bn(l.tpag),
      amount: Number(l.valor ?? 0),
      receivedAmount: l.valor_recebido != null ? Number(l.valor_recebido) : void 0,
      changeAmount: l.troco != null ? Number(l.troco) : void 0,
      description: l.descricao_outro ?? null
    })), c = gE(s.addressState);
    return {
      saleId: o.id,
      companyId: s.id,
      number: n,
      series: a,
      environment: Un(o.ambiente),
      paymentMethod: _E(u),
      payments: u,
      issuedAt: c,
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
      items: i.map((l) => {
        const E = wn(s, l);
        return {
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
            cfop: pt(l.cfop, null, "5102"),
            cest: l.cest,
            originCode: pt(l.origin_code, null, "0"),
            csosn: E.csosn,
            icmsCst: E.icmsCst,
            pisCst: l.pis_cst ?? "49",
            cofinsCst: l.cofins_cst ?? "49"
          }
        };
      }),
      totals: {
        productsAmount: Number(o.valor_produtos ?? 0),
        discountAmount: Number(o.valor_desconto ?? 0),
        finalAmount: Number(o.valor_total ?? 0),
        receivedAmount: u.reduce((l, E) => l + Number(E.receivedAmount ?? E.amount ?? 0), 0),
        changeAmount: u.reduce((l, E) => l + Number(E.changeAmount ?? 0), 0) || Number(o.valor_troco ?? 0)
      },
      additionalInfo: `Venda PDV ${o.id}`,
      offlineFallbackMode: "queue",
      idempotencyKey: `nfce-sale-${o.id}`
    };
  }
  mirrorLegacySale(e) {
    const r = this.resolveActiveStore(), a = this.loadLegacySale(e), n = this.loadLegacyItems(e), o = this.loadLegacyPayments(e), s = `legacy-sale:${e}`, u = _r.findByExternalReference(s) ?? _r.create({
      storeId: r.id,
      customerName: a.cliente_nome ?? null,
      customerDocument: a.cpf_cliente ?? a.cnpj_cliente ?? null,
      status: "PAID",
      subtotalAmount: Number(a.valor_produtos ?? 0),
      discountAmount: Number(a.valor_desconto ?? 0),
      totalAmount: Number(a.valor_total ?? 0),
      changeAmount: Number(a.valor_troco ?? 0),
      externalReference: s,
      items: n.map((m) => {
        const f = wn(r, m);
        return {
          productId: m.produto_id ?? m.codigo_produto,
          description: m.nome_produto,
          unit: m.unidade_comercial,
          quantity: Number(m.quantidade_comercial ?? 0),
          unitPrice: Number(m.valor_unitario_comercial ?? 0),
          grossAmount: Number(m.valor_bruto ?? 0),
          discountAmount: Number(m.valor_desconto ?? 0),
          totalAmount: Number(m.subtotal ?? 0),
          ncm: m.ncm ?? null,
          cfop: pt(m.cfop, null, "5102"),
          cest: m.cest,
          originCode: pt(m.origin_code, null, "0"),
          taxSnapshot: {
            ncm: m.ncm,
            cfop: pt(m.cfop, null, "5102"),
            cest: m.cest,
            originCode: pt(m.origin_code, null, "0"),
            csosn: f.csosn,
            icmsCst: f.icmsCst,
            pisCst: m.pis_cst ?? "49",
            cofinsCst: m.cofins_cst ?? "49"
          }
        };
      }),
      payments: o.map((m) => ({
        method: bn(m.tpag),
        amount: Number(m.valor ?? 0),
        receivedAmount: m.valor_recebido != null ? Number(m.valor_recebido) : Number(m.valor ?? 0),
        changeAmount: Number(m.troco ?? 0),
        integrationReference: m.descricao_outro ?? null
      }))
    }), c = TE.getOrReserveForSale(u.sale.id, r.id), l = this.buildAuthorizeRequest(e, r.id, c.series, c.number), E = tt.upsertBySale({
      saleId: u.sale.id,
      storeId: r.id,
      series: c.series,
      number: c.number,
      environment: l.environment,
      status: ye.DRAFT,
      issuedDatetime: l.issuedAt,
      contingencyType: l.offlineFallbackMode === "queue" ? "queue" : null,
      provider: null
    });
    return {
      request: l,
      store: r,
      mirroredSale: u,
      mirroredFiscalDocument: E
    };
  }
  findMirroredSaleByLegacyId(e) {
    return _r.findByExternalReference(`legacy-sale:${e}`);
  }
}
const Kr = new hE();
function Fn(t) {
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
class IE {
  create(e) {
    const r = d.prepare(`
      INSERT INTO fiscal_events (
        fiscal_document_id, event_type, payload_json, response_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      e.fiscalDocumentId,
      e.eventType,
      e.payload ? sa(e.payload) : null,
      e.response ? sa(e.response) : null,
      e.status
    );
    return this.findById(Number(r.lastInsertRowid));
  }
  findById(e) {
    const r = d.prepare("SELECT * FROM fiscal_events WHERE id = ? LIMIT 1").get(e);
    return r ? Fn(r) : null;
  }
  listByFiscalDocument(e) {
    return d.prepare(`
      SELECT * FROM fiscal_events
      WHERE fiscal_document_id = ?
      ORDER BY created_at DESC, id DESC
    `).all(e).map(Fn);
  }
}
const Ke = new IE();
class CE {
  generateXml(e) {
    const r = Kr.mirrorLegacySale(e), a = {
      ...r.request,
      saleId: r.mirroredSale.sale.id,
      companyId: r.store.id,
      idempotencyKey: `nfce-sale-${r.mirroredSale.sale.id}`
    }, n = ke.resolve(r.store.id), o = Ta.validateAuthorizeReadiness(n, a);
    if (!o.ok) {
      const u = o.errors.map((c) => c.message).join(" | ");
      return tt.upsertBySale({
        saleId: r.mirroredSale.sale.id,
        storeId: r.store.id,
        series: a.series,
        number: a.number,
        environment: a.environment,
        status: ye.ERROR,
        issuedDatetime: a.issuedAt,
        rejectionCode: "FISCAL_READINESS_FAILED",
        rejectionReason: u
      }), {
        success: !1,
        saleId: e,
        fiscal: {
          status: "ERROR",
          statusCode: "FISCAL_READINESS_FAILED",
          statusMessage: u,
          documentId: r.mirroredFiscalDocument.id
        },
        validation: o
      };
    }
    const s = ns.buildAuthorizeXml(a, n), i = tt.upsertBySale({
      saleId: r.mirroredSale.sale.id,
      storeId: r.store.id,
      series: a.series,
      number: a.number,
      environment: a.environment,
      status: s.validation.ok ? ye.DRAFT : ye.ERROR,
      issuedDatetime: a.issuedAt,
      accessKey: s.accessKey,
      xml: s.xml || null,
      rejectionCode: s.validation.ok ? null : "NFCE_XML_BUILD_FAILED",
      rejectionReason: s.validation.ok ? null : s.validation.errors.map((u) => u.message).join(" | ")
    });
    return Ke.create({
      fiscalDocumentId: i.id,
      eventType: Ye.XML_GENERATED,
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
      const r = Kr.mirrorLegacySale(e), a = {
        ...r.request,
        saleId: r.mirroredSale.sale.id,
        companyId: r.store.id,
        idempotencyKey: `nfce-sale-${r.mirroredSale.sale.id}`
      };
      Ke.create({
        fiscalDocumentId: r.mirroredFiscalDocument.id,
        eventType: Ye.AUTHORIZATION_REQUESTED,
        payload: { legacySaleId: e, request: a },
        status: ye.TRANSMITTING
      });
      const n = await Ie.authorizeNfce(a), o = tt.findBySaleId(r.mirroredSale.sale.id);
      return o && (n.xmlSigned && Ke.create({
        fiscalDocumentId: o.id,
        eventType: Ye.XML_SIGNED,
        payload: {
          legacySaleId: e,
          accessKey: n.accessKey,
          provider: n.provider
        },
        status: ye.SIGNING
      }), Ke.create({
        fiscalDocumentId: o.id,
        eventType: Ye.AUTHORIZATION_RESPONSE,
        payload: { legacySaleId: e, request: a },
        response: n,
        status: n.status
      }), n.status === "AUTHORIZED" && Ke.create({
        fiscalDocumentId: o.id,
        eventType: Ye.AUTHORIZED,
        payload: { legacySaleId: e, accessKey: n.accessKey },
        response: n,
        status: ye.AUTHORIZED
      }), n.status === "REJECTED" && Ke.create({
        fiscalDocumentId: o.id,
        eventType: Ye.REJECTED,
        payload: { legacySaleId: e, accessKey: n.accessKey },
        response: n,
        status: ye.REJECTED
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
      const a = ce(r, "ISSUE_FISCAL_SALE_FAILED"), n = Kr.findMirroredSaleByLegacyId(e), o = n ? tt.findBySaleId(n.sale.id) : tt.findBySaleId(e);
      return o && Ke.create({
        fiscalDocumentId: o.id,
        eventType: Ye.PROVIDER_ERROR,
        payload: { legacySaleId: e },
        response: {
          status: "ERROR",
          statusCode: a.code,
          statusMessage: a.message
        },
        status: ye.ERROR
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
const us = new CE();
let ds = null;
function Mn(t) {
  ds = t;
}
function Ma() {
  return ds;
}
const DE = {
  admin: ["admin", "administrador", "administrator", "dono", "owner"],
  manager: ["gerente", "gestor", "manager", "supervisor"],
  cashier: ["caixa", "operador", "operador de caixa", "atendente", "vendedor"],
  stock: ["estoque", "almoxarife"],
  unknown: []
}, vE = {
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
function SE(t) {
  const e = String(t ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [r, a] of Object.entries(DE))
    if (a.includes(e)) return r;
  return "unknown";
}
function RE(t) {
  return vE[SE(t)];
}
function ls(t, e) {
  return RE(t).includes(e);
}
function LE(t) {
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
function Es() {
  const t = Ma();
  return t ? d.prepare(`
    SELECT u.id, u.nome, u.funcao, u.ativo
    FROM sessions s
    INNER JOIN usuarios u ON u.id = s.user_id
    WHERE s.id = ?
      AND s.active = 1
    LIMIT 1
  `).get(t) ?? null : null;
}
function N(t) {
  const e = Es();
  if (!e || !e.ativo)
    throw new Error("Sessão inválida ou usuário inativo.");
  if (!ls(e.funcao, t))
    throw new Error(LE(t));
  return e;
}
function et(t) {
  const e = Es();
  return !!(e && e.ativo && ls(e.funcao, t));
}
function OE() {
  p.handle("fiscal:get-runtime-config", async () => (N("fiscal:manage"), Ie.getConfig())), p.handle("fiscal:get-context", async (t, e) => (N("fiscal:manage"), Ln.resolve(e))), p.handle("fiscal:get-active-store", async () => (N("fiscal:manage"), On.getActiveStore())), p.handle("fiscal:save-active-store", async (t, e) => {
    try {
      return N("fiscal:manage"), {
        success: !0,
        data: On.saveActiveStore(e)
      };
    } catch (r) {
      const a = ce(r, "FISCAL_STORE_SAVE_FAILED");
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
    N("fiscal:manage");
    const r = Ln.resolve(e);
    return lE.validateContext(r);
  }), p.handle("fiscal:save-runtime-config", async (t, e) => {
    try {
      return N("fiscal:manage"), await Ie.saveConfig(e);
    } catch (r) {
      const a = ce(r, "FISCAL_CONFIG_SAVE_FAILED");
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
  }), p.handle("fiscal:get-certificate-info", async () => (N("fiscal:manage"), dE.getCertificateInfo(uE.getConfig()))), p.handle("fiscal:authorize-nfce", async (t, e) => {
    try {
      return N("fiscal:manage"), {
        success: !0,
        data: await Ie.authorizeNfce(e)
      };
    } catch (r) {
      const a = ce(r, "FISCAL_AUTHORIZE_FAILED");
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
      return N("fiscal:manage"), {
        success: !0,
        data: us.generateXml(e)
      };
    } catch (r) {
      const a = ce(r, "FISCAL_XML_BUILD_FAILED");
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
      return N("fiscal:manage"), {
        success: !0,
        data: await Ie.cancelNfce(e)
      };
    } catch (r) {
      const a = ce(r, "FISCAL_CANCEL_FAILED");
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
      return N("fiscal:manage"), {
        success: !0,
        data: await Ie.consultStatusByAccessKey(e)
      };
    } catch (r) {
      const a = ce(r, "FISCAL_CONSULT_FAILED");
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
      return N("fiscal:manage"), {
        success: !0,
        data: await Ie.getDanfe(e)
      };
    } catch (r) {
      const a = ce(r, "FISCAL_DANFE_FAILED");
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
  }), p.handle("fiscal:get-queue-summary", async () => (N("fiscal:manage"), Ie.getQueueSummary())), p.handle("fiscal:list-queue", async (t, e = 20) => (N("fiscal:manage"), Ie.listQueue(e))), p.handle("fiscal:reprocess-queue-item", async (t, e) => {
    try {
      return N("fiscal:manage"), {
        success: !0,
        data: await Ie.reprocessQueueItem(e)
      };
    } catch (r) {
      const a = ce(r, "FISCAL_REPROCESS_FAILED");
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
      return N("fiscal:manage"), _.info("[FiscalIPC] fiscal:process-next-queue-item recebido."), {
        success: !0,
        data: await cs.processNext()
      };
    } catch (t) {
      const e = ce(t, "FISCAL_PROCESS_QUEUE_FAILED");
      return _.error(`[FiscalIPC] Falha em fiscal:process-next-queue-item: ${e.code} - ${e.message}`), {
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
      return N("fiscal:manage"), _.info("[FiscalIPC] fiscal:run-status-diagnostic recebido."), {
        success: !0,
        data: await Ie.runStatusServiceDiagnostic()
      };
    } catch (t) {
      const e = ce(t, "FISCAL_STATUS_DIAGNOSTIC_FAILED");
      return _.error(`[FiscalIPC] Falha em fiscal:run-status-diagnostic: ${e.code} - ${e.message}`), {
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
function xn(t) {
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
function Pn(t) {
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
function yE(t) {
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
function bE(t) {
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
class UE {
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
    const n = d.prepare(`
      SELECT *
      FROM printed_documents
      WHERE document_type = ?
        AND reference_type = ?
        AND reference_id = ?
      LIMIT 1
    `).get(e, r, a);
    return n ? xn(n) : null;
  }
  findById(e) {
    const r = d.prepare(`
      SELECT *
      FROM printed_documents
      WHERE id = ?
      LIMIT 1
    `).get(e);
    return r ? xn(r) : null;
  }
  upsertDocument(e) {
    const r = this.findByReference(e.documentType, e.referenceType, e.referenceId);
    if (r)
      return d.prepare(`
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
    const a = d.prepare(`
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
    d.prepare(`
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
    d.prepare(`
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
    const r = d.prepare(`
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
    ), a = d.prepare(`
      SELECT *
      FROM print_jobs
      WHERE id = ?
      LIMIT 1
    `).get(r.lastInsertRowid);
    return Pn(a);
  }
  listDocumentJobs(e) {
    return d.prepare(`
      SELECT *
      FROM print_jobs
      WHERE printed_document_id = ?
      ORDER BY id DESC
    `).all(e).map(Pn);
  }
  getDefaultPrinter() {
    const e = d.prepare(`
      SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path,
             notes, is_default, installed_at, paper_width_mm, content_width_mm, base_font_size_px, line_height, receipt_settings_json
      FROM printers
      WHERE is_default = 1
      LIMIT 1
    `).get();
    return e ? this.mapPrinter(e) : null;
  }
  findPrinterById(e) {
    const r = d.prepare(`
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
    d.prepare(`
      INSERT INTO printer_logs (printer_id, message)
      VALUES (?, ?)
    `).run(e, r);
  }
  loadSaleReceiptData(e) {
    const r = d.prepare(`
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
    const a = d.prepare(`
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
    `).all(e), n = d.prepare(`
      SELECT
        tpag,
        valor,
        valor_recebido,
        troco
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id
    `).all(e), o = d.prepare(`
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
      storeAddress: bE(r),
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
        paymentLabel: yE(s.tpag),
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
    const a = d.prepare(`
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
    const r = d.prepare(`
      SELECT COUNT(*) AS total
      FROM printed_documents
      WHERE sale_id = ?
        AND document_type = 'SALE_RECEIPT'
    `).get(e);
    return Number(r.total ?? 0) > 0;
  }
  logInfo(e) {
    _.info(`[printing] ${e}`);
  }
}
const M = new UE();
class wE {
  async printHtml(e) {
    const r = Number(e.paperWidthMm ?? 80), a = Math.max(360, Math.round(r / 25.4 * 96) + 48), n = new W({
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
          (u, c) => {
            if (!u) {
              i(new Error(c || "Falha desconhecida na impressão."));
              return;
            }
            s();
          }
        );
      });
    } catch (o) {
      throw _.error(`[printing] erro ao imprimir "${e.title}": ${o instanceof Error ? o.message : String(o)}`), o;
    } finally {
      n.isDestroyed() || n.destroy();
    }
  }
}
const Bn = new wE();
function w(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function ae(t) {
  return t.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function Wr(t) {
  if (!t) return "—";
  const e = new Date(t);
  return Number.isNaN(e.getTime()) ? t : e.toLocaleString("pt-BR");
}
function FE(t) {
  if (!(t != null && t.receipt_settings_json)) return {};
  try {
    return JSON.parse(t.receipt_settings_json);
  } catch {
    return {};
  }
}
function ME(t) {
  return t.templateMode === "custom";
}
function xE(t) {
  return {
    paperWidthMm: Number((t == null ? void 0 : t.paper_width_mm) ?? 80),
    contentWidthMm: Number((t == null ? void 0 : t.content_width_mm) ?? 76),
    baseFontSizePx: Number((t == null ? void 0 : t.base_font_size_px) ?? 14),
    lineHeight: Number((t == null ? void 0 : t.line_height) ?? 1.55)
  };
}
function Xn(t, e, r) {
  const a = xE(r), n = Math.max((a.paperWidthMm - a.contentWidthMm) / 2, 0);
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${w(t)}</title>
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
class PE {
  renderSaleReceipt(e, r) {
    var u, c;
    const a = FE(r), n = ME(a), o = e.items.map((l) => `
      <div class="item">
        <div class="item-name">${w(l.description)}</div>
        <div class="item-meta">
          <span>${l.quantity.toFixed(3).replace(".", ",")} x ${ae(l.unitPrice)}</span>
          <span class="strong">${ae(l.totalAmount)}</span>
        </div>
        ${l.discountAmount > 0 ? `<div class="muted">Desconto: ${ae(l.discountAmount)}</div>` : ""}
        ${(!n || a.showItemCodes !== !1) && l.code ? `<div class="muted">Cod.: ${w(l.code)}</div>` : ""}
      </div>
    `).join(""), s = e.payments.map((l) => `
      <div class="row">
        <span class="label">${w(l.paymentLabel)}</span>
        <span class="value">${ae(l.amount)}</span>
      </div>
    `).join(""), i = `
      <div class="center">
        ${n && a.showLogo && a.logoPath ? `<div class="footer-note">LOGO: ${w(a.logoPath)}</div>` : ""}
        <div class="strong">${w(n && ((u = a.headerTitle) == null ? void 0 : u.trim()) || e.storeName)}</div>
        ${(!n || a.showLegalName !== !1) && e.storeLegalName && e.storeLegalName !== e.storeName ? `<div>${w(e.storeLegalName)}</div>` : ""}
        ${(!n || a.showDocument !== !1) && e.storeDocument ? `<div>CNPJ: ${w(e.storeDocument)}</div>` : ""}
        ${(!n || a.showAddress !== !1) && e.storeAddress ? `<div>${w(e.storeAddress)}</div>` : ""}
        ${n && a.headerMessage ? `<div class="footer-note">${w(a.headerMessage)}</div>` : ""}
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Venda</span><span class="value">#${e.saleId}</span></div>
      <div class="row"><span class="label">Data/Hora</span><span class="value">${w(Wr(e.movedAt ?? e.emittedAt))}</span></div>
      ${!n || a.showOperator !== !1 ? `<div class="row"><span class="label">Operador</span><span class="value">${w(e.operatorName ?? "Não informado")}</span></div>` : ""}
      <div class="row"><span class="label">PDV</span><span class="value">${w(e.pdvId ?? "—")}</span></div>
      ${!n || a.showCustomer !== !1 ? `<div class="row"><span class="label">Cliente</span><span class="value">${w(e.customerName ?? "Consumidor final")}</span></div>` : ""}
      ${(!n || a.showCustomer !== !1) && e.customerDocument ? `<div class="row"><span class="label">Documento</span><span class="value">${w(e.customerDocument)}</span></div>` : ""}

      <div class="separator"></div>
      ${o}
      <div class="separator"></div>

      <div class="row"><span class="label">Subtotal</span><span class="value">${ae(e.subtotalAmount)}</span></div>
      ${e.discountAmount > 0 ? `<div class="row"><span class="label">Descontos</span><span class="value">${ae(e.discountAmount)}</span></div>` : ""}
      <div class="row"><span class="label strong">TOTAL</span><span class="value">${ae(e.totalAmount)}</span></div>
      ${e.changeAmount > 0 ? `<div class="row"><span class="label">Troco</span><span class="value">${ae(e.changeAmount)}</span></div>` : ""}

      ${!n || a.showPaymentBreakdown !== !1 ? `
        <div class="separator"></div>
        <div class="strong">Pagamentos</div>
        ${s}
      ` : ""}

      ${(!n || a.showFiscalSection !== !1) && e.fiscal ? `
        <div class="separator"></div>
        <div class="strong">Situação fiscal</div>
        <div class="row"><span class="label">Status</span><span class="value">${w(e.fiscal.status ?? "—")}</span></div>
        ${e.fiscal.protocol ? `<div class="row"><span class="label">Protocolo</span><span class="value">${w(e.fiscal.protocol)}</span></div>` : ""}
        ${e.fiscal.accessKey ? `<div class="footer-note mono">Chave: ${w(e.fiscal.accessKey)}</div>` : ""}
      ` : ""}

      ${e.notes ? `<div class="footer-note">Obs.: ${w(e.notes)}</div>` : ""}
      ${n && a.footerMessage ? `<div class="footer-note">${w(a.footerMessage)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        ${w(n && ((c = a.thankYouMessage) == null ? void 0 : c.trim()) || "Documento impresso pelo Galberto PDV")}<br />
        Guarde este comprovante para conferência.
      </div>
    `;
    return Xn(`Cupom de venda #${e.saleId}`, i, r);
  }
  renderCashReceipt(e, r) {
    const a = e.documentType === "CASH_CLOSING_RECEIPT", n = a ? "Comprovante de Fechamento de Caixa" : "Comprovante de Abertura de Caixa", o = `
      <div class="center">
        <div class="strong">${w(n)}</div>
      </div>

      <div class="separator"></div>

      <div class="row"><span class="label">Sessão</span><span class="value">#${e.cashSessionId}</span></div>
      <div class="row"><span class="label">Operador</span><span class="value">${w(e.operatorName ?? "Não informado")}</span></div>
      <div class="row"><span class="label">PDV</span><span class="value">${w(e.pdvId)}</span></div>
      <div class="row"><span class="label">Aberto em</span><span class="value">${w(Wr(e.openedAt))}</span></div>
      ${a ? `<div class="row"><span class="label">Fechado em</span><span class="value">${w(Wr(e.closedAt))}</span></div>` : ""}

      <div class="separator"></div>

      <div class="row"><span class="label">Fundo inicial</span><span class="value">${ae(e.openingAmount)}</span></div>
      ${a ? `
        <div class="row"><span class="label">Vendas em dinheiro</span><span class="value">${ae(e.totalSalesCash)}</span></div>
        <div class="row"><span class="label">Sangrias</span><span class="value">${ae(e.totalWithdrawals)}</span></div>
        <div class="row"><span class="label">Valor esperado</span><span class="value">${ae(e.expectedAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Valor contado</span><span class="value">${ae(e.closingAmount ?? 0)}</span></div>
        <div class="row"><span class="label">Diferença</span><span class="value">${ae(e.differenceAmount ?? 0)}</span></div>
      ` : ""}

      ${e.openingNotes ? `<div class="footer-note">Obs. abertura: ${w(e.openingNotes)}</div>` : ""}
      ${a && e.closingNotes ? `<div class="footer-note">Obs. fechamento: ${w(e.closingNotes)}</div>` : ""}

      <div class="separator"></div>
      <div class="center footer-note">
        Documento impresso pelo Galberto PDV<br />
        Conferência operacional de caixa.
      </div>
    `;
    return Xn(n, o, r);
  }
  renderFromStoredDocument(e) {
    return e.contentHtml;
  }
}
const Gt = new PE();
function Qr(t, e, r) {
  const n = {
    SALE_RECEIPT: "cupom da venda",
    CASH_OPENING_RECEIPT: "comprovante de abertura de caixa",
    CASH_CLOSING_RECEIPT: "comprovante de fechamento de caixa"
  }[t];
  return e === "printed" ? `${n} impresso${r ? ` em ${r}` : ""}.` : e === "skipped" ? `Nenhuma impressora padrão configurada para imprimir o ${n}.` : `Falha ao imprimir o ${n}.`;
}
class BE {
  async printTestReceipt(e) {
    const r = M.findPrinterById(e);
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
    const a = M.buildTestSaleReceiptData(r, {}), n = Gt.renderSaleReceipt(a, r);
    try {
      return await Bn.printHtml({
        html: n,
        printerName: r.name,
        title: `Teste ${r.display_name ?? r.name}`,
        paperWidthMm: r.paper_width_mm
      }), M.appendPrinterLog(r.id, "Impressão de teste enviada."), {
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
      return M.appendPrinterLog(r.id, `Teste de impressão falhou: ${s}`), {
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
    const a = M.loadSaleReceiptData(e), n = M.getDefaultPrinter(), o = {
      ...a,
      fiscal: r.fiscal ?? a.fiscal
    }, s = `Cupom de venda #${e}`, i = Gt.renderSaleReceipt(o, n), u = M.upsertDocument({
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
    return this.dispatchToPrinter(u, r.triggerSource, !1);
  }
  async printCashOpeningReceipt(e, r) {
    const a = M.loadCashReceiptData(e, "CASH_OPENING_RECEIPT");
    return this.printCashReceipt(a, r, !1);
  }
  async printCashClosingReceipt(e, r) {
    const a = M.loadCashReceiptData(e, "CASH_CLOSING_RECEIPT");
    return this.printCashReceipt(a, r, !1);
  }
  async reprintSaleReceipt(e) {
    let r = M.findByReference("SALE_RECEIPT", "SALE", e);
    if (!r)
      return this.printSaleReceipt(e, { triggerSource: "MANUAL" });
    const a = M.getDefaultPrinter();
    try {
      const n = JSON.parse(r.payloadJson);
      r = M.upsertDocument({
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
        contentHtml: Gt.renderSaleReceipt(n, a),
        lastError: r.lastError
      });
    } catch {
      r = M.upsertDocument({
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
    const n = M.getDefaultPrinter(), o = e.documentType === "CASH_OPENING_RECEIPT" ? `Abertura de caixa #${e.cashSessionId}` : `Fechamento de caixa #${e.cashSessionId}`, s = Gt.renderCashReceipt(e, n), i = M.upsertDocument({
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
    const n = M.getDefaultPrinter();
    if (!n) {
      M.markDocumentFailed(e.id, "PENDING", "Nenhuma impressora padrão configurada.", null);
      const o = M.createPrintJob({
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
        message: Qr(e.documentType, "skipped"),
        jobId: o.id,
        reprint: a
      };
    }
    try {
      await Bn.printHtml({
        html: Gt.renderFromStoredDocument(e),
        printerName: n.name,
        title: e.title,
        paperWidthMm: n.paper_width_mm
      }), M.markDocumentPrinted(e.id, n.id), M.appendPrinterLog(n.id, `${e.title} enviado para impressão.`);
      const o = M.createPrintJob({
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
        message: Qr(e.documentType, "printed", n.display_name ?? n.name),
        jobId: o.id,
        reprint: a
      };
    } catch (o) {
      const s = o instanceof Error ? o.message : "Falha desconhecida na impressão.";
      M.markDocumentFailed(e.id, "FAILED", s, n.id), M.appendPrinterLog(n.id, `${e.title} falhou: ${s}`);
      const i = M.createPrintJob({
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
        message: `${Qr(e.documentType, "failed")} ${s}`,
        jobId: i.id,
        reprint: a
      };
    }
  }
}
const rr = new BE();
function XE(t) {
  const e = Number((t == null ? void 0 : t.valorDesconto) ?? (t == null ? void 0 : t.valor_desconto) ?? 0), r = Array.isArray(t == null ? void 0 : t.itens) ? t.itens.some((a) => Number((a == null ? void 0 : a.valor_desconto) ?? (a == null ? void 0 : a.valorDesconto) ?? 0) > 0) : !1;
  return e > 0 || r;
}
function Jr(t) {
  if (XE(t) && !et("discounts:apply"))
    throw new Error("Somente gerente ou administrador pode conceder descontos.");
}
function kE() {
  p.handle("vendas:finalizar-com-baixa-estoque", async (t, e) => {
    Jr(e), Gi(e);
    const r = typeof e == "number" ? e : e.vendaId, a = await us.execute(r);
    let n;
    try {
      n = await rr.printSaleReceipt(r, {
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
  }), p.handle("vendas:get", (t, e) => ji(e)), p.handle("vendas:cancelar", (t, e) => qi(e)), p.handle("vendas:buscarPorId", (t, e) => Yi(e)), p.handle("vendas:finalizada-pendente-pagamento", (t, e) => (Jr(e), $a(e, "ABERTA_PAGAMENTO", (e == null ? void 0 : e.id) ?? null))), p.handle("vendas:pausar", (t, e) => (Jr(e), $a(e, "PAUSADA", (e == null ? void 0 : e.id) ?? null)));
}
let Tt = null, _t = null, ft = null, Nt = null, At = null, Oe = null, gt = null, We = null, Qe = null;
const Ce = import.meta.dirname;
process.env.APP_ROOT = y.join(Ce, "..");
function $E() {
  p.handle("app:open-external-url", async (c, l) => (await Gn.openExternal(l), !0)), p.on("window:open:sales-search", () => {
    if (We && !We.isDestroyed()) {
      We.focus();
      return;
    }
    t();
  });
  function t() {
    We = new W({
      title: "Vendas",
      width: 600,
      height: 530,
      center: !0,
      maximizable: !1,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), We.maximize(), G ? We.loadURL(`${G}#/sales/search`) : We.loadFile(y.join("dist/index.html"), {
      hash: "/sales/search"
    });
  }
  function e() {
    Qe = new W({
      title: "Galberto PDV",
      width: 1280,
      height: 820,
      center: !0,
      maximizable: !0,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), Qe.maximize(), G ? Qe.loadURL(`${G}#/pdv`) : Qe.loadFile(y.join("dist/index.html"), {
      hash: "/pdv"
    });
  }
  function r(c) {
    Tt = new W({
      width: 764,
      height: 717,
      title: `Venda #${c}`,
      maximizable: !1,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), G ? Tt.loadURL(`${G}#/vendas/${c}`) : Tt.loadFile(y.join("dist/index.html"), {
      hash: `/vendas/${c}`
    });
  }
  function a() {
    Oe = new W({
      title: "Search Product",
      maximizable: !0,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), G ? Oe.loadURL(`${G}#/pdv/products/search`) : Oe.loadFile(y.join("dist/index.html"), {
      hash: "/pdv/products/search"
    });
  }
  function n(c) {
    _t = new W({
      width: 764,
      height: 717,
      title: `Usuario #${c}`,
      maximizable: !1,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), G ? _t.loadURL(`${G}#/config/usuarios/${c}`) : _t.loadFile(y.join("dist/index.html"), {
      hash: `/config/usuarios/${c}`
    });
  }
  function o(c) {
    ft = new W({
      width: 900,
      height: 760,
      title: `Produto #${c}`,
      maximizable: !1,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), G ? ft.loadURL(`${G}#/products/${c}`) : ft.loadFile(y.join("dist/index.html"), {
      hash: `/products/${c}`
    });
  }
  function s() {
    gt = new W({
      width: 764,
      height: 717,
      title: "Config PDV",
      maximizable: !1,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), G ? gt.loadURL(`${G}#/pdv/config/app`) : gt.loadFile(y.join("dist/index.html"), {
      hash: "/pdv/config/app"
    });
  }
  p.on("open-search-sales-window", () => {
    if (Oe && !Oe.isDestroyed()) {
      Oe.focus();
      return;
    }
    t();
  }), p.on("window:open:config", () => {
    if (et("config:access")) {
      if (gt && !gt.isDestroyed()) {
        gt.focus();
        return;
      }
      s();
    }
  }), p.on("window:open:pdv", () => {
    if (et("pdv:access")) {
      if (Qe && !Qe.isDestroyed()) {
        Qe.focus();
        return;
      }
      e();
    }
  }), p.on("window:open:products-search", () => {
    if (Oe && !Oe.isDestroyed()) {
      Oe.focus();
      return;
    }
    a();
  }), p.on("vendas:criar-janela-ver-vendas", (c, l) => {
    if (Tt && !Tt.isDestroyed()) {
      Tt.focus();
      return;
    }
    r(l);
  }), p.on("usuarios:criar-janela-ver-usuario", (c, l) => {
    if (et("users:manage")) {
      if (_t && !_t.isDestroyed()) {
        _t.focus();
        return;
      }
      n(l);
    }
  }), p.on("open:product-details-window", (c, l) => {
    if (et("products:view")) {
      if (ft && !ft.isDestroyed()) {
        ft.focus();
        return;
      }
      o(String(l));
    }
  }), p.on("window:open:create-user", () => {
    if (et("users:manage")) {
      if (Nt && !Nt.isDestroyed()) {
        Nt.focus();
        return;
      }
      i();
    }
  }), p.on("window:open:edit-user", (c, l) => {
    if (et("users:manage")) {
      if (At && !At.isDestroyed()) {
        At.focus();
        return;
      }
      u(l);
    }
  });
  function i() {
    Nt = new W({
      width: 764,
      height: 717,
      title: "Cadastrar Usuario",
      maximizable: !1,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), G ? Nt.loadURL(`${G}#/config/usuarios/cadastrar_usuario`) : Nt.loadFile(y.join("dist/index.html"), {
      hash: "/config/usuarios/cadastrar_usuario"
    });
  }
  function u(c) {
    At = new W({
      width: 764,
      height: 717,
      title: "Editar Usuario",
      maximizable: !1,
      webPreferences: {
        preload: y.join(Ce, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }), G ? At.loadURL(`${G}#/config/users/edit_user/${c}`) : At.loadFile(y.join("dist/index.html"), {
      hash: `/config/users/edit_user/${c}`
    });
  }
}
function qE() {
  p.handle("produtos:get", (t, e) => Ki(e)), p.handle("get-products-by-id", (t, e) => {
    if (!e) throw new Error("ID inválido");
    return pa(e);
  }), p.handle("produtos:buscar-por-nome", (t, e) => {
    if (!e) throw new Error("Nome Invalido");
    return rc(e);
  }), p.handle("produtos:buscar-por-codigo-de-barras", (t, e) => {
    if (!e) throw new Error("Codigo de Barras invalido");
    return ac(e);
  }), p.handle("suggest-product-by-term", (t, e) => nc(e)), p.handle("produtos:create-local", (t, e) => Zi(e)), p.handle("produtos:update-local", (t, e, r) => {
    if (!e) throw new Error("ID inválido");
    return ec(e, r);
  }), p.handle("produtos:soft-delete-local", (t, e) => {
    if (!e) throw new Error("ID inválido");
    return tc(e);
  }), p.handle("categories:list-local", (t, e) => oc(e)), p.handle("categories:create-local", (t, e) => sc(e)), p.handle("categories:update-local", (t, e, r) => {
    if (!e) throw new Error("ID inválido");
    return ic(e, r);
  }), p.handle("categories:soft-delete-local", (t, e) => {
    if (!e) throw new Error("ID inválido");
    return cc(e);
  }), p.handle("stock:list-products", (t, e) => Wi(e)), p.handle("stock:get-product", (t, e) => {
    if (!e) throw new Error("Produto inválido");
    return ro(e);
  }), p.handle("stock:create-movement", (t, e) => Qi(e)), p.handle("stock:list-movements", (t, e) => ao(e)), p.handle("stock:list-movements-by-product", (t, e, r) => {
    if (!e) throw new Error("Produto inválido");
    return Ji(e, r);
  });
}
function GE() {
  p.handle("printer:buscar-impressoras", async () => (N("printers:manage"), W.getAllWindows()[0].webContents.getPrintersAsync())), p.handle("printer:add-impressora", (t, e) => (N("printers:manage"), uc(e))), p.handle("printer:listar-cadastradas", () => (N("printers:manage"), dc())), p.handle("printer:get-padrao", () => lc()), p.handle("printer:remover", (t, e) => (N("printers:manage"), pc(e))), p.handle("printer:definir-padrao", (t, e) => (N("printers:manage"), Tc(e))), p.handle("printer:atualizar-layout", (t, e, r) => (N("printers:manage"), Ec(e, r))), p.handle("printer:atualizar-personalizacao", (t, e, r) => (N("printers:manage"), mc(e, r))), p.handle("printer:test-print", (t, e) => (N("printers:manage"), rr.printTestReceipt(e))), p.handle("printer:reprint-sale-receipt", (t, e) => (N("sales:view"), rr.reprintSaleReceipt(e)));
}
function ms(t) {
  d.prepare(`
    UPDATE sessions
    SET active = 0,
        logout_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(t);
}
function VE() {
  p.handle("auth:login", (t, e, r) => {
    const a = Ys(e, r);
    return Mn(a.sessionId), a;
  }), p.handle("auth:buscar-usuario", (t, e) => {
    if (!e) throw new Error("ID inválido");
    return N("users:manage"), fc(e);
  }), p.handle("app:logoff-with-confirm", async () => {
    _.info("Logoff solicitado pelo usuario");
    const { response: t } = await Vn.showMessageBox({
      type: "question",
      buttons: ["cancelar", "sair"],
      defaultId: 1,
      cancelId: 0,
      message: "Tem certeza que deseja encerrar sessao?"
    });
    if (t === 1) {
      const e = Ma();
      return e && (ms(e), Mn(null)), _.info("logoff aprovado pelo usuario"), !0;
    }
    return !1;
  });
}
function HE() {
  p.handle("salvar-foto-usuario", async (t, e) => {
    N("users:manage");
    const r = Ae.getPath("userData"), a = y.join(r, "fotos");
    Br.existsSync(a) || Br.mkdirSync(a);
    const n = y.extname(e.nomeArquivo || ""), o = y.basename(e.nomeArquivo || "foto", n).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40), s = y.join(a, `${Date.now()}-${o}${n}`);
    return Br.writeFileSync(s, Buffer.from(e.buffer)), s;
  }), p.handle("update-user", (t, e) => (N("users:manage"), Ic(e))), p.handle("disable-user", (t, e) => (N("users:manage"), Cc(e))), p.handle("enable-user", (t, e) => (N("users:manage"), Dc(e))), p.handle("user:update-password", (t, e, r) => (N("users:manage"), gc(e, r))), p.handle("get-users", (t, e) => (N("users:manage"), Nc(e))), p.handle("usuarios:add", (t, e) => (N("users:manage"), Ac(e))), p.handle("delete-user", (t, e) => (N("users:manage"), hc(e)));
}
function zE() {
  p.handle("open-cash-session", async (t, e) => {
    console.log("Abrindo caixa com dados: ", e);
    const r = Vi(e);
    let a;
    try {
      a = await rr.printCashOpeningReceipt(r.id, "AUTO");
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
    const r = zi(e);
    let a;
    try {
      a = await rr.printCashClosingReceipt(r.id, "AUTO");
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
  }), p.handle("get-open-cash-session", async (t, e) => vc(e)), p.handle("register-cash-withdrawal", async (t, e) => (N("cash:withdraw"), Hi(e))), p.on("pdv:selecionar-produto", (t, e) => {
    for (const r of W.getAllWindows())
      r.webContents.send("pdv:produto-selecionado", e);
  }), p.on("pdv:retomar-venda", (t, e) => {
    for (const r of W.getAllWindows())
      r.webContents.send("pdv:venda-retomada", e);
  });
}
function jE(t = 32) {
  return Ea.randomBytes(t).toString("hex");
}
function Zr(t, e) {
  return Buffer.from(`${t}:${e}`, "utf8").toString("base64");
}
const ea = {
  clientId: "544f921fc8bd37fa2a319af77786addf385afffd",
  clientSecret: "ee219a1ca80750c753d0629753ff51992354d4c7a4dcf1d877ca55a4b7db",
  redirectUri: "http://127.0.0.1:47831/callback/bling"
};
function ta(t, e) {
  if (!t.trim())
    throw new Error(`Configuração OAuth do Bling ausente: ${e}`);
  return t;
}
function Tr() {
  return {
    clientId: ta(ea.clientId, "clientId"),
    clientSecret: ta(ea.clientSecret, "clientSecret"),
    redirectUri: ta(ea.redirectUri, "redirectUri")
  };
}
class YE {
  getByIntegrationId(e) {
    const a = d.prepare(`
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
    d.prepare(`
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
    d.prepare(`
      DELETE FROM integrations
      WHERE integration_id = ?
    `).run(e);
  }
  isConnected(e) {
    return !!d.prepare(`
      SELECT 1
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(e);
  }
}
const Je = new YE(), KE = "https://www.bling.com.br/Api/v3/oauth/authorize", kn = "https://api.bling.com.br/Api/v3/oauth/token", WE = "https://api.bling.com.br/oauth/revoke";
function QE(t) {
  const e = new aa(t);
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
class JE {
  async getStatus() {
    const e = Je.getByIntegrationId("bling");
    if (!e)
      return {
        connected: !1,
        expiresAt: null
      };
    try {
      await this.getValidAccessToken();
      const r = Je.getByIntegrationId("bling");
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
    const { clientId: e, redirectUri: r } = Tr(), a = jE(24), n = await this.requestAuthorizationCode({
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
    const { clientId: e, clientSecret: r } = Tr(), a = Je.getByIntegrationId("bling");
    if (!a)
      return {
        success: !0,
        message: "Bling já estava desconectado."
      };
    try {
      const n = new URLSearchParams({
        token: a.refreshToken
      });
      await fetch(WE, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Zr(e, r)}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: n.toString()
      });
    } catch (n) {
      console.warn("[BlingOAuthService.disconnect] falha ao revogar remotamente:", n);
    }
    return Je.delete("bling"), {
      success: !0,
      message: "Bling desconectado com sucesso."
    };
  }
  async getValidAccessToken() {
    const e = Je.getByIntegrationId("bling");
    if (!e)
      throw new Error("Bling não está conectado.");
    if (!(new Date(e.expiresAt).getTime() <= Date.now() + 6e4))
      return e.accessToken;
    await this.refreshAccessToken(e.refreshToken);
    const n = Je.getByIntegrationId("bling");
    if (!n)
      throw new Error("Falha ao renovar token do Bling.");
    return n.accessToken;
  }
  async requestAuthorizationCode(e) {
    const { hostname: r, port: a, pathname: n } = QE(e.redirectUri), o = new aa(KE);
    return o.searchParams.set("response_type", "code"), o.searchParams.set("client_id", e.clientId), o.searchParams.set("state", e.state), o.searchParams.set("redirect_uri", e.redirectUri), await new Promise((s, i) => {
      let u = !1;
      const c = (m, f) => {
        clearTimeout(f), m.close();
      }, l = Rs.createServer((m, f) => {
        try {
          if (!m.url)
            throw new Error("Callback sem URL.");
          const C = new aa(m.url, `http://${r}:${a}`);
          if (C.pathname !== n) {
            f.statusCode = 404, f.end("Not found");
            return;
          }
          const S = C.searchParams.get("error"), U = C.searchParams.get("code"), F = C.searchParams.get("state");
          if (S) {
            f.statusCode = 400, f.end("Autorização recusada ou inválida."), u || (u = !0, c(l, E), i(new Error(`Bling retornou erro no callback: ${S}`)));
            return;
          }
          if (!U) {
            f.statusCode = 400, f.end("Authorization code não recebido."), u || (u = !0, c(l, E), i(new Error("Authorization code não recebido.")));
            return;
          }
          if (F !== e.state) {
            f.statusCode = 400, f.end("State inválido."), u || (u = !0, c(l, E), i(new Error("State inválido no callback do Bling.")));
            return;
          }
          f.statusCode = 200, f.setHeader("Content-Type", "text/html; charset=utf-8"), f.end(`
            <html>
              <body style="font-family: Arial, sans-serif; padding: 24px;">
                <h2>Integração concluída</h2>
                <p>Você já pode fechar esta janela e voltar ao sistema.</p>
              </body>
            </html>
          `), u || (u = !0, c(l, E), s(U));
        } catch (C) {
          u || (u = !0, c(l, E), i(C instanceof Error ? C : new Error("Erro desconhecido no callback.")));
        }
      }), E = setTimeout(() => {
        u || (u = !0, c(l, E), i(new Error("Tempo esgotado aguardando autorização do Bling.")));
      }, 12e4);
      l.listen(a, r, async () => {
        try {
          await Gn.openExternal(o.toString());
        } catch (m) {
          u || (u = !0, c(l, E), i(
            m instanceof Error ? m : new Error("Falha ao abrir navegador para autorização.")
          ));
        }
      }), l.on("error", (m) => {
        u || (u = !0, c(l, E), i(m instanceof Error ? m : new Error("Erro ao iniciar servidor local.")));
      });
    });
  }
  async exchangeCodeForToken(e) {
    const { clientId: r, clientSecret: a, redirectUri: n } = Tr(), o = new URLSearchParams({
      grant_type: "authorization_code",
      code: e,
      redirect_uri: n
    }), s = await fetch(kn, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Zr(r, a)}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "enable-jwt": "1"
      },
      body: o.toString()
    }), i = await s.text();
    if (!s.ok)
      throw new Error(`Falha ao trocar code por token no Bling: ${s.status} - ${i}`);
    const u = JSON.parse(i);
    this.persistToken(u);
  }
  async refreshAccessToken(e) {
    const { clientId: r, clientSecret: a } = Tr(), n = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: e
    }), o = await fetch(kn, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Zr(r, a)}`,
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
    Je.save(a);
  }
}
const ps = new JE(), ZE = "https://api.bling.com.br/Api/v3";
class em {
  /**
   * Método genérico GET para a API da Bling.
   *
   * Permite passar query params dinamicamente.
   */
  async get(e, r) {
    const a = await ps.getValidAccessToken(), n = new URL(`${ZE}${e}`);
    r && Object.entries(r).forEach(([i, u]) => {
      u != null && n.searchParams.append(i, String(u));
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
const ht = new em();
function Ts() {
  return Ea.randomUUID();
}
function ra() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
class tm {
  get(e, r) {
    const a = d.prepare(`
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
    d.prepare(`
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
      Ts(),
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
    const a = ra(), n = this.get(e, r);
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
    const n = ra(), o = this.get(e, r);
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
    const n = ra(), o = this.get(e, r);
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
const $n = new tm();
class rm {
  start(e) {
    const r = Ts();
    return d.prepare(`
      INSERT INTO sync_logs (
        id, integration_id, resource, mode, status,
        started_at, items_processed, items_created, items_updated, items_failed
      ) VALUES (?, ?, ?, ?, 'running', ?, 0, 0, 0, 0)
    `).run(r, e.integrationId, e.resource, e.mode, e.startedAt), r;
  }
  finish(e) {
    d.prepare(`
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
    return d.prepare(`
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
const qn = new rm(), Vt = "Integração Bling desativada nesta versão local. O catálogo é gerenciado no SQLite do PDV.";
function am() {
  p.handle("integrations:status", async (t, e) => (N("integrations:manage"), e !== "bling" ? { connected: !1 } : await ps.getStatus())), p.handle("integrations:connect", async (t, e) => (N("integrations:manage"), e !== "bling" ? { success: !1, message: `Integração ${e} ainda não implementada.` } : { success: !1, message: Vt })), p.handle("integrations:disconnect", async (t, e) => (N("integrations:manage"), e !== "bling" ? { success: !1, message: `Integração ${e} ainda não implementada.` } : { success: !1, message: Vt })), p.handle("integrations:bling:sync-all", async () => (N("integrations:manage"), { success: !1, message: Vt })), p.handle("integrations:bling:sync", async () => (N("integrations:manage"), { success: !1, message: Vt })), p.handle("integrations:bling:sync-categories", async () => (N("integrations:manage"), { success: !1, message: Vt })), p.handle("integrations:bling:sync-status", () => (N("integrations:manage"), $n.get("bling", "products"))), p.handle("integrations:bling:sync-status-categories", () => (N("integrations:manage"), $n.get("bling", "categories"))), p.handle("integrations:bling:sync-logs", () => (N("integrations:manage"), qn.listByIntegration("bling", "products", 10))), p.handle("integrations:bling:sync-logs-categories", () => (N("integrations:manage"), qn.listByIntegration("bling", "categories", 10))), p.handle("integrations:bling:test", async () => (N("integrations:manage"), await ht.getProducts({ page: 1, limit: 5 }))), p.handle("integrations:bling:debug-product", async (t, e) => {
    if (N("integrations:manage"), e != null && e.id)
      return await ht.getProductById(e.id);
    if (e != null && e.code) {
      const r = await ht.getProductByCode(e.code), a = Array.isArray(r.data) ? r.data[0] : null;
      return a != null && a.id ? {
        list: r,
        detail: await ht.getProductById(a.id)
      } : { data: null, list: r };
    }
    throw new Error("Informe id ou code para diagnosticar produto do Bling.");
  }), p.handle("integrations:bling:test-categories", async () => (N("integrations:manage"), await ht.getCategories({ page: 1, limit: 5 }))), p.handle("integrations:bling:test-icmp", async () => (N("integrations:manage"), await ht.ping()));
}
const _s = import.meta.dirname;
process.env.APP_ROOT = y.join(_s, "..");
const G = process.env.VITE_DEV_SERVER_URL, _m = y.join(process.env.APP_ROOT, "dist-electron"), fs = y.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = G ? y.join(process.env.APP_ROOT, "public") : fs;
let me = null;
function Ns() {
  me = new W({
    icon: y.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: y.join(_s, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), me.webContents.on("did-finish-load", () => {
    me == null || me.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), me.webContents.on("did-fail-load", (t, e, r) => {
    _.error(`Renderer falhou ao carregar: [${e}] ${r}`);
  }), me.webContents.on("render-process-gone", (t, e) => {
    _.error(`Renderer process encerrado: ${e.reason}`);
  }), G ? me.loadURL(G) : me.loadFile(y.join(fs, "index.html")), me.maximize(), me.on(
    "close",
    () => {
    }
  );
}
Ae.on("before-quit", () => {
  const t = Ma();
  t && ms(t);
});
Ae.on("window-all-closed", () => {
  process.platform !== "darwin" && (Ae.quit(), me = null);
});
Ae.on("activate", () => {
  W.getAllWindows().length === 0 && Ns();
});
p.on("app:fechar-janela", () => {
  const t = W.getFocusedWindow();
  t && t.close();
});
p.handle("app:quit-with-confirm", async () => {
  _.info("Encerramento solicitado pelo usuário");
  const { response: t } = await Vn.showMessageBox({
    type: "question",
    buttons: ["Cancelar", "Sair"],
    defaultId: 1,
    cancelId: 0,
    message: "Tem certeza que deseja sair do sistema?"
  });
  return t === 1 ? (Ae.quit(), !0) : !1;
});
Ae.whenReady().then(() => {
  ui(), EE(), $E(), OE(), kE(), qE(), GE(), VE(), HE(), zE(), am(), Ns(), _.info("Criado janela principal do App");
});
export {
  _m as MAIN_DIST,
  fs as RENDERER_DIST,
  G as VITE_DEV_SERVER_URL
};
