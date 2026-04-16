import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron";
import { logger } from "../../logger/logger";
import { VendaDTO } from '../../../src/types/itemCarrinho'
import { hashSenha } from "./../../auth";
import { seedCnaes } from "./seeds/seedCnaes";
import { runFiscalPersistenceMigrations } from "../../application/fiscal/persistence/migrations/runFiscalPersistenceMigrations";
import { CashRestoreSessionData, CashSessionData, CloseCashSessionData, CashRestoredSession } from "../../../src/types/session.types";
import { SupplierFilter } from "../../../src/types/supplier";
import { Usuario } from "../../../src/types/Usuario";


//import { seedCnaes } from "../../../src/seeds/seedCnaes"

// caminho seguro em Linux, Windows e Mac
const dbPath = path.join(app.getPath("userData"), "galberto.db");
console.log(" Criando/abrindo banco de dados em: ", dbPath);
const db = new Database(dbPath);
export default db;
export type SQLiteDatabase = typeof db;

export function enableForeignKeys() {
  db.exec("PRAGMA foreign_keys = ON;");
  logger.info("-> Foreign keys ativadas");
}

//#region - CRIAÇÃO DAS TABELAS NO SQLite3 ---

// Tabela Products V2 - Criado 09-04-2026 pensando em integracoes com Bling
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
  const columns = db.prepare(`PRAGMA table_info(products)`).all() as Array<{ name: string }>;
  const columnNames = new Set(columns.map(column => column.name));

  if (!columnNames.has('current_stock')) {
    db.exec(`ALTER TABLE products ADD COLUMN current_stock REAL NOT NULL DEFAULT 0;`);
  }

  if (!columnNames.has('minimum_stock')) {
    db.exec(`ALTER TABLE products ADD COLUMN minimum_stock REAL NOT NULL DEFAULT 0;`);
  }
}

function syncLegacyProductsMirror() {
  db.exec(`
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

// Tabela Categories V2 - Criado 09-04-2026 pensando em integracoes com Bling
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
  // LEGADO TEMPORARIO:
  // `documentos_fiscais` pertence ao fluxo fiscal anterior do ERP/PDV.
  // A partir da consolidacao atual, a fonte oficial de documento/status fiscal
  // passa a ser `fiscal_documents` na camada `electron/application/fiscal/persistence`.
  // Esta tabela permanece apenas para compatibilidade historica e leitura eventual,
  // sem receber nova logica fiscal.
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
      is_default INTEGER DEFAULT 0,
      installed_at TEXT,
      notes TEXT
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'printers' checada/criada");
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
  db.exec(sqlComand)
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
      opened_at TEXT NOT NULL,
      closed_at TEXT
    );
  `;
  db.exec(sqlComand);
  logger.info("-> Tabela 'cash_register_sessions' checada/criada")
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
  } catch {}

  try {
    db.exec(`ALTER TABLE venda_pagamento ADD COLUMN valor_recebido REAL NOT NULL DEFAULT 0`);
  } catch {}

  try {
    db.exec(`ALTER TABLE venda_pagamento ADD COLUMN troco REAL NOT NULL DEFAULT 0`);
  } catch {}
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

    // TESTE REAL
    const test = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();

    console.log("Tabela existe?", test);

  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
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

    // TESTE REAL
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

    // TESTE REAL
    const test = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='integrations';
    `).get();

    console.log("Tabela existe?", test);

  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
}

//#endregion

//#region - EXECUTA AUTOMATICAMENTE FUNCOES DE CRIACAO/CHECAGEM DAS TABELAS
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
createTablePrinterLogs();
createTableSession();
createTableCnaes();
seedCnaes(db); // Funcao que realiza seed de cnaes na tabela Cnaes
createTableTaxProfile();
createTableSaleItemTaxSnapshot();
createTableStockMoviments();
createTableVendaPagamento();
ensureVendaPagamentoColumns();
createTableDocumentosFiscais();
createTableCashRegisterSessions();
createTableCashRegisterMovements();
createTableIntegrations();
createTableSyncState();
createTableSyncLogs();
runFiscalPersistenceMigrations(db);

//#endregion

//#region - FUNCOES PARA ATUAR NA PAGINA PDV RAPIDO

function getSaleDefaults() {
  const company = db.prepare(`
    SELECT ambiente_emissao, serie_nfce
    FROM company
    WHERE ativo = 1
    LIMIT 1
  `).get() as { ambiente_emissao?: number; serie_nfce?: number } | undefined;

  const ambiente = company?.ambiente_emissao ?? 2;
  const serie = company?.serie_nfce ?? 1;

  const nextNumberRow = db.prepare(`
    SELECT COALESCE(MAX(numero), 0) + 1 AS nextNumber
    FROM vendas
    WHERE modelo_documento = 65 AND serie = ? AND ambiente = ?
  `).get(serie, ambiente) as { nextNumber: number };

  return {
    ambiente,
    serie,
    numero: nextNumberRow.nextNumber,
    naturezaOperacao: 'VENDA PDV',
    modeloDocumento: 65,
  };
}

function getSaleItemSnapshot(productId: string | number) {
  const product = db.prepare(`
    SELECT id, barcode, name, unit, sale_price_cents
    FROM products
    WHERE id = ? AND deleted_at IS NULL
    LIMIT 1
  `).get(productId) as {
    id: string;
    barcode: string | null;
    name: string;
    unit: string | null;
    sale_price_cents: number;
  } | undefined;

  if (!product) {
    throw new Error(`Produto não encontrado para venda: ${productId}`);
  }

  return {
    codigoProduto: product.barcode || product.id,
    nomeProduto: product.name,
    gtin: product.barcode,
    unidade: product.unit || 'UN',
    precoUnitario: Number(product.sale_price_cents ?? 0) / 100,
    ncm: '',
    cfop: '5102',
    cest: null,
  };
}

function replaceSaleItems(vendaId: number, itens: Array<{
  produto_id: string | number;
  nome?: string;
  preco_venda?: number;
  quantidade?: number;
  estoque_atual?: number;
  valor_bruto?: number;
  valor_desconto?: number;
  subtotal: number;
}>) {
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

export function salvarVendaPendente(
  venda: VendaDTO & { cpf_cliente?: string | null; consumidor_identificado?: boolean },
  status: 'ABERTA_PAGAMENTO' | 'FINALIZADA' | 'PAUSADA',
  vendaId?: number | null,
): number {
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
        venda.consumidor_identificado ? venda.cpf_cliente ?? null : 'Consumidor final',
        valorProdutos,
        valorDesconto,
        valorTotal,
        persistedSaleId,
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
        venda.consumidor_identificado ? venda.cpf_cliente ?? null : 'Consumidor final',
        venda.cpf_cliente ?? null,
        valorProdutos,
        valorDesconto,
        valorTotal,
      );

      persistedSaleId = result.lastInsertRowid as number;
    }

    replaceSaleItems(persistedSaleId, venda.itens);
    return persistedSaleId;
  });

  return transaction();
}

function mapPaymentTypeToFiscalCode(meioPagamento: string) {
  const paymentTypeMap: Record<string, string> = {
    DINHEIRO: '01',
    CHEQUE: '02',
    CREDITO: '03',
    DEBITO: '04',
    VOUCHER: '10',
    PIX: '17',
  };

  return paymentTypeMap[meioPagamento] ?? '99';
}

function getCashSessionSummaryById(sessionId: number) {
  const stmt = db.prepare(`
    SELECT
      s.id,
      s.operator_id,
      s.pdv_id,
      s.opening_cash_amount,
      s.opened_at,
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

  const session = stmt.get(sessionId) as CashRestoredSession | undefined;

  if (!session) {
    return null;
  }

  return {
    ...session,
    total_sangrias: Number(session.total_sangrias ?? 0),
    total_vendas_dinheiro: Number(session.total_vendas_dinheiro ?? 0),
    expected_cash_amount:
      Number(session.opening_cash_amount ?? 0) +
      Number(session.total_vendas_dinheiro ?? 0) -
      Number(session.total_sangrias ?? 0),
  };
}

function registrarPagamentoVenda(
  vendaId: number,
  paymentData?: {
    cashSessionId?: number | null;
    meioPagamento?: string | null;
    valorPago?: number | null;
    troco?: number | null;
  },
) {
  if (!paymentData?.meioPagamento) {
    return;
  }

  const sale = db.prepare(`
    SELECT valor_total
    FROM vendas
    WHERE id = ?
    LIMIT 1
  `).get(vendaId) as { valor_total: number } | undefined;

  if (!sale) {
    throw new Error(`Venda não encontrada para registrar pagamento: ${vendaId}`);
  }

  db.prepare(`DELETE FROM venda_pagamento WHERE venda_id = ?`).run(vendaId);

  const valorVenda = Number(sale.valor_total ?? 0);
  const troco = Number(paymentData.troco ?? 0);
  const valorRecebido =
    paymentData.meioPagamento === 'DINHEIRO'
      ? Number(paymentData.valorPago ?? valorVenda)
      : valorVenda;

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
    null,
  );
}

// Funcao para criar uma venda cancelada
export function cancelarVenda(venda: any) {
  db.prepare('BEGIN').run()
  try {
    const saleDefaults = getSaleDefaults();
    const valorProdutos = Number(venda.valor_produtos ?? venda.total ?? 0);
    const valorDesconto = Number(venda.valor_desconto ?? 0);
    const valorTotal = Number(venda.total ?? 0);

    const vendaResult = db
      .prepare(`
        INSERT INTO vendas(
          data_emissao, data_movimento, status, natureza_operacao, modelo_documento,
          serie, numero, ambiente, valor_produtos, valor_desconto, valor_total
        )
        VALUES(datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        'CANCELADA',
        saleDefaults.naturezaOperacao,
        saleDefaults.modeloDocumento,
        saleDefaults.serie,
        saleDefaults.numero,
        saleDefaults.ambiente,
        valorProdutos,
        valorDesconto,
        valorTotal,
      )

    const vendaId = vendaResult.lastInsertRowid

    replaceSaleItems(vendaId as number, venda.itens)

    db.prepare('COMMIT').run()

    return { sucesso: true, vendaId }
  } catch (error) {
    db.prepare('ROLLBACK').run()
    throw error
  }
}

// Funcao que baixa o estoque quando vende um produto no carrinho
export function finalizarVendaComBaixaEstoque(
  vendaPayload:
    | number
    | {
        vendaId: number;
        cashSessionId?: number | null;
        meioPagamento?: string | null;
        valorPago?: number | null;
        troco?: number | null;
        valorTotal?: number | null;
        valorProdutos?: number | null;
        valorDesconto?: number | null;
      },
): void {
  const vendaId = typeof vendaPayload === 'number' ? vendaPayload : vendaPayload.vendaId;
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
  )

  const transaction = db.transaction(() => {
    const itens = selectItens.all(vendaId) as Array<{ produto_id: string; quantidade: number }>;
    const vendaAtual = buscarValoresVenda.get(vendaId) as {
      valor_produtos: number;
      valor_desconto: number;
      valor_total: number;
    } | undefined;

    if (!vendaAtual) {
      throw new Error(`Venda não encontrada: ${vendaId}`);
    }

    for (const item of itens) {
      const saldo = selectSaldo.get(item.produto_id) as { current_stock: number } | undefined;

      if (!saldo) {
        throw new Error(`Produto da venda não encontrado: ${item.produto_id}`);
      }

      if (Number(saldo.current_stock ?? 0) < Number(item.quantidade ?? 0)) {
        throw new Error(`Estoque insuficiente para o produto ${item.produto_id}`);
      }

      atualizarEstoque.run(item.quantidade, item.produto_id);
      atualizarEstoqueLegado.run(item.quantidade, item.produto_id);
    }

    const valorProdutos = typeof vendaPayload === 'number'
      ? Number(vendaAtual.valor_produtos ?? 0)
      : Number(vendaPayload.valorProdutos ?? vendaAtual.valor_produtos ?? 0);
    const valorDesconto = typeof vendaPayload === 'number'
      ? Number(vendaAtual.valor_desconto ?? 0)
      : Number(vendaPayload.valorDesconto ?? vendaAtual.valor_desconto ?? 0);
    const valorTotal = typeof vendaPayload === 'number'
      ? Number(vendaAtual.valor_total ?? 0)
      : Number(vendaPayload.valorTotal ?? vendaAtual.valor_total ?? 0);
    const valorTroco = typeof vendaPayload === 'number' ? 0 : Number(vendaPayload.troco ?? 0);

    atualizarVenda.run(
      valorProdutos,
      valorDesconto,
      valorTotal,
      valorTroco,
      vendaId,
    )

    registrarPagamentoVenda(
      vendaId,
      typeof vendaPayload === 'number' ? undefined : vendaPayload,
    );
  })

  transaction()
}

// Funcao que insere venda
export function inserirVenda(
  venda: VendaDTO,
  status: 'ABERTA_PAGAMENTO' | 'FINALIZADA' | 'PAUSADA'
): number {
  return salvarVendaPendente(venda, status);
}

// Funcao que registra abertura de caixa
export function insertCashSession(data: CashSessionData): CashRestoredSession {
  const stmt = db.prepare(`
    INSERT INTO cash_register_sessions
      (operator_id, pdv_id, status, opening_cash_amount, opened_at)
    VALUES(?, ?, 'OPEN', ?, datetime('now'))
      `);

  const result = stmt.run(
    data.operator_id,
    data.pdv_id,
    data.opening_cash_amount
  );

  const session = getCashSessionSummaryById(result.lastInsertRowid as number);

  if (!session) {
    throw new Error("Sessão de caixa não encontrada após abertura.");
  }

  return session;
}

export function registerCashWithdrawal(data: {
  cash_session_id: number;
  operator_id: string;
  pdv_id: string;
  movement_type: 'SANGRIA';
  amount: number;
  reason?: string;
}): CashRestoredSession {
  const openSession = db.prepare(`
    SELECT id
    FROM cash_register_sessions
    WHERE id = ?
      AND operator_id = ?
      AND pdv_id = ?
      AND status = 'OPEN'
    LIMIT 1
  `).get(data.cash_session_id, data.operator_id, data.pdv_id) as { id: number } | undefined;

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
    data.reason?.trim() || null,
  );

  const updatedSession = getCashSessionSummaryById(data.cash_session_id);

  if (!updatedSession) {
    throw new Error("Não foi possível recarregar a sessão após a sangria.");
  }

  return updatedSession;
}


export function closeCashSession(data: CloseCashSessionData): void {
  const stmt = db.prepare(`
    UPDATE cash_register_sessions
    SET
    status = 'CLOSED',
      closing_cash_amount = ?,
      closed_at = datetime('now')
      
    WHERE operator_id = ?
      AND pdv_id = ?
        AND status = 'OPEN'
          `);

  const result = stmt.run(
    data.closing_cash_amount,
    data.operator_id,
    data.pdv_id
  );

  if (result.changes === 0) {
    throw new Error("Nenhum caixa aberto foi encontrado para fechamento.");
  }
}


//#endregion

//#region - FUNCOES PARA ATUAR COM VENDAS NA PAGINA VENDAS

// Funcao para paginacao + filtro na pagina vendas
export function listarVendas({ venda_id, data, status, page = 1, limit = 20 }: {
  venda_id?: any
  data?: any
  status?: number
  page?: number
  limit?: number
}
) {

  const offset = (page - 1) * limit

  let where = []
  let params: any[] = []
  const statusMap: Record<number, string> = { 1: 'FINALIZADA', 2: 'CANCELADA', 3: 'ABERTA_PAGAMENTO', 4: 'ORCAMENTO', 5: 'PAUSADA' }

  if (venda_id) {
    where.push('CAST(id AS TEXT) LIKE ?')
    params.push(`%${venda_id}%`)
  }

  if (data) {
    where.push('date(data_emissao) = date(?)')
    params.push(data)
  }
  if (status !== undefined) {
    where.push('status = ?')
    params.push(statusMap[status])
  }

  const whereClause = where.length
    ? `WHERE ${where.join(' AND ')} `
    : ''

  const stmt = db
    .prepare(`
    SELECT * FROM vendas
      ${whereClause}
      ORDER BY id DESC
    LIMIT ? OFFSET ?
      `)
    .all(...params, limit, offset)

  const total = db
    .prepare(`
      SELECT COUNT(*) as total
      FROM vendas
      ${whereClause}
    `)
    .get(...params) as { total: number }

  return {
    data: stmt,
    page,
    limit,
    total: total.total
  }
}

export function buscarVendaPorId(vendaId: number) {
  const venda = db
    .prepare(`
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
      `)
    .get(vendaId)

  if (!venda) return null

  const itens = db
    .prepare(`
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
      `)
    .all(vendaId)

  return {
    ...venda,
    itens,
  }
}
//#endregion

//#region - FUNCOES PARA ATUAR COM PRODUTOS NA PAGINA PRODUTOS

// Funcao para paginacao + filtro na pagina produtos
export function listarProdutos({ nome, codigo, ativo, page = 1, limit = 20 }: {
  nome?: string
  codigo?: string
  ativo?: number
  page?: number
  limit?: number
}) {

  const offset = (page - 1) * limit

  let where = []
  let params: any[] = []

  if (nome) {
    where.push('name LIKE ?')
    params.push(`%${nome}%`)
  }

  if (codigo) {
    where.push('(barcode LIKE ? OR sku LIKE ?)')
    params.push(`%${codigo}%`, `%${codigo}%`)
  }

  if (ativo !== undefined) {
    where.push('active = ?')
    params.push(ativo)
  }

  const data = db
    .prepare(`
      SELECT
        id,
        barcode AS codigo_barras,
        name AS nome,
        ROUND(sale_price_cents / 100.0, 2) AS preco_venda,
        current_stock AS estoque_atual,
        active AS ativo
      FROM products
      WHERE deleted_at IS NULL
      ${where.length ? `AND ${where.join(' AND ')}` : ''}
      ORDER BY name
    LIMIT ? OFFSET ?
      `)
    .all(...params, limit, offset)

  const total = db
    .prepare(`
      SELECT COUNT(*) as total
      FROM products
      WHERE deleted_at IS NULL
      ${where.length ? `AND ${where.join(' AND ')}` : ''}
    `)
    .get(...params) as { total: number }

  return {
    data,
    page,
    limit,
    total: total.total
  }
}

export function select_product_by_id(id: number | string) {
  const stmt = db.prepare(`
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
  `);
  return stmt.get(id);
}

// Funcao para buscar produtos por ID
export function buscarProdutosPorNome(termo: string) {
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
      `)

  return stmt.all(`%${termo}%`)
}

// Funcao para buscar produtos por Codigo de Barras
export function buscarProdutoPorCodigoBarras(codigo: string) {
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

//#endregion

//#region - FUNCOES PARA ATUAR COM ESTOQUE NA PAGINA PRODUTOS
export function selectSuggestionProduct(term: string) {
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

  return rows.map((product: any) => ({
    id: product.id,
    internalCode: product.sku ?? '',
    name: product.name,
    brand: '',
    gtin: product.barcode ?? '',
    unitOfMeasure: product.unit ?? 'UN',
    currentStock: Number(product.current_stock ?? 0),
    minimumStock: Number(product.minimum_stock ?? 0),
    avgCost: Number(product.cost_price_cents ?? 0) / 100,
    ncm: product.ncm ?? '',
    cfop: product.cfop ?? '',
    controlsExpiration: false,
    controlsBatch: false,
  }));
}

// Funcao para obter os perfis fiscais cadastrados, para popular dropdown de perfil fiscal na pagina produtos
export function getTaxProfiles() {
  const stmt = db.prepare(`SELECT * FROM tax_profiles ORDER BY name`);
  return stmt.all();
}

//#endregion

//#region - FUNCOES PARA ATUAR COM CLIENTES NA PAGINA CLIENTES


// Funcao para paginacao + filtro na pagina clientes
export function listarClientes({
  nome,
  cpf,
  cnpj,
  page = 1,
  limit = 20
}: {
  nome?: string
  cpf?: string
  cnpj?: string
  page?: number
  limit?: number
}) {
  const offset = (page - 1) * limit

  const where: string[] = []
  const params: any[] = []

  if (nome) {
    where.push('nome LIKE ?')
    params.push(`% ${nome}% `)
  }

  if (cpf) {
    where.push('cpf LIKE ?')
    params.push(`% ${cpf}% `)
  }

  if (cnpj) {
    where.push('cnpj LIKE ?')
    params.push(`% ${cnpj}% `)
  }

  const whereClause = where.length
    ? `WHERE ${where.join(' AND ')} `
    : ''

  const data = db
    .prepare(`
      SELECT id, nome, cpf, cnpj, telefone, email
      FROM clientes
      ${whereClause}
      ORDER BY nome
    LIMIT ? OFFSET ?
      `)
    .all(...params, limit, offset)

  const total = db
    .prepare(`
      SELECT COUNT(*) as total
      FROM clientes
      ${whereClause}
    `)
    .get(...params) as { total: number }

  return {
    data,
    page,
    limit,
    total: total.total
  }
}

// Funcao para pesquisar cliente
export function buscarCliente(CPF: number) {
  const stmt = db.prepare(`SELECT * FROM clientes WHERE cpf = ? `);
  return stmt.get(CPF);
}

// Funcao para buscar cliente pelo ID, para abrir janela "ver" no formulario da pagina clientes
export function buscarClientePorId(id: number) {
  const stmt = db.prepare(`
    SELECT *
      FROM clientes
    WHERE id = ?
      `)

  return stmt.get(id)
}

//#endregion

//#region - FUNCOES PARA ATUAR COM A FORNECEDORES NA PAGINA FORNECEDORES

// Funcao que lista os todos fornecedores na tabela fornecedores
// Pode ser usada indiscriminadamente, mas a ideia principal é para popular dropdown de fornecedores em outros formulários
export function getSuppliers() {
  const stmt = db.prepare(`SELECT * FROM fornecedores ORDER BY razao_social`);
  return stmt.all();
}

// Funcao de filtrar fornecedores, essa funcao pode receber um ID ou um objeto de filtro, para popular a tabela de fornecedores na pagina fornecedores
// Quando recebe um ID, retorna o fornecedor com aquele ID, caso receba um objeto de filtro, retorna os fornecedores que se encaixam naquele filtro, com paginacao
// o ID é usado principalmente para buscar o fornecedore na janela "ver ou detalhes" no formulario da pagina fornecedores, enquanto o filtro é usado para popular a tabela de fornecedores
export function selectSupplier(
  dataOrId: SupplierFilter | number,
  page = 1,
  limit = 20
) {
  const where: string[] = [];
  const params: any[] = [];
  const offset = (page - 1) * limit;

  const data: SupplierFilter =
    typeof dataOrId === "number" ? { id: dataOrId } : dataOrId;

  if (data.id) {
    where.push("id = ?");
    params.push(data.id);
  }

  if (data.CNPJ) {
    where.push("cnpj = ?");
    params.push(data.CNPJ);
  }

  if (data.nome_fantasia) {
    where.push("nome_fantasia = ?");
    params.push(data.nome_fantasia);
  }

  if (data.razao_social) {
    where.push("razao_social = ?");
    params.push(data.razao_social);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")} ` : "";

  const rows = db
    .prepare(`
    SELECT *
      FROM fornecedores
      ${whereClause}
      ORDER BY id DESC
    LIMIT ? OFFSET ?
      `)
    .all(...params, limit, offset);

  const totalRow = db
    .prepare(`
      SELECT COUNT(*) as total
      FROM fornecedores
      ${whereClause}
    `)
    .get(...params) as { total: number };

  return {
    data: rows,
    page,
    limit,
    total: totalRow.total,
  };
}


//#endregion

//#region FUNCOES PARA ATUAR COM FISCAL NA PAGINA FISCAL

export function selectCompanyFiscalSettings() {
  const stmt = db.prepare(`SELECT * FROM company WHERE ativo = 1`);
  const configuracoes = stmt.get();
  if (!configuracoes) return null;
  return {
    ...configuracoes
  };
}

console.log(db);

//#endregion

//#region FUNCOES PARA ATUAR COM HARDWARES, IMPRESSORA, ETC.
export function addPrinter(dados: any) {
  // Se a nova impressora for padrão, remove o padrão das outras
  if (dados.is_default === 1) {
    db.prepare(`UPDATE printers SET is_default = 0 WHERE is_default = 1`).run();
  }

  const stmt = db.prepare(`
    INSERT INTO printers(name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path, notes, is_default)
    VALUES(@selectedPrinter, @display_name, @brand, @model, @connection_type, @driver_name, @driver_version,
      @photo_path, @notes, @is_default)
      `);

  stmt.run(dados);
}

export function listarPrinters() {
  const stmt = db.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, driver_name, driver_version, photo_path, notes, is_default, installed_at
    FROM printers
    ORDER BY is_default DESC, id DESC
      `);
  return stmt.all();
}

export function getPrinterPadrao() {
  const stmt = db.prepare(`
    SELECT id, name, display_name, brand, model, connection_type, is_default
    FROM printers
    WHERE is_default = 1
    LIMIT 1
  `);
  return stmt.get();
}

export function removerPrinter(id: number) {
  const stmt = db.prepare(`DELETE FROM printers WHERE id = ? `);
  return stmt.run(id);
}

export function definirPrinterPadrao(id: number) {
  const transaction = db.transaction(() => {
    db.prepare(`UPDATE printers SET is_default = 0 WHERE is_default = 1`).run();
    db.prepare(`UPDATE printers SET is_default = 1 WHERE id = ? `).run(id);
  });
  transaction();
}

// #endregion

//#region FUNCOES PARA ATUAR COM USUARIOS

export function criarUsuarioAdmin() {
  // Verifica se já existe algum usuário
  const existe = db.prepare(`SELECT COUNT(*) as total FROM usuarios`).get() as { total: number };

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

export function buscarUsuario(id: number) {
  const stmt = db.prepare(`
    SELECT id, nome, funcao, email, username, ativo
    FROM usuarios
    WHERE id = ?
      `);
  return stmt.get(id);
}

export function selectUsers({ name, role, login, ativo, page = 1, limit = 20 }: {
  name?: string
  role?: string
  login?: string
  ativo?: boolean
  page: number
  limit: number
}) {

  const offset = (page - 1) * limit

  let where = []
  let params: any[] = []

  if (name) {
    where.push('nome LIKE ?')
    params.push(`% ${name}% `)
  }

  if (role) {
    where.push('funcao LIKE ?')
    params.push(`% ${role}% `)
  }
  if (login) {
    where.push('username LIKE ?')
    params.push(`% ${login}% `)
  }
  if (ativo !== undefined) {
    where.push('ativo = ?')
    params.push(ativo)
  }

  const whereClause = where.length
    ? `WHERE ${where.join(' AND ')} `
    : ''

  const data = db
    .prepare(`
      SELECT id, nome, funcao AS role, email, username AS login, ativo
      FROM usuarios
      ${whereClause}
      ORDER BY nome
    LIMIT ? OFFSET ?
      `)
    .all(...params, limit, offset)

  const total = db
    .prepare(`
      SELECT COUNT(*) as total
      FROM usuarios
      ${whereClause}
    `)
    .get(...params) as { total: number }

  return {
    data,
    page,
    limit,
    total: total.total
  }
}

export function addUsuario(dados: {
  nome: string;
  funcao: string;
  email: string;
  username: string;
  password: string;
  ativo: number;
}) {
  const stmt = db.prepare(`
    INSERT INTO usuarios(nome, funcao, email, username, password, ativo)
    VALUES(@nome, @funcao, @email, @username, @password, @ativo)
  `);

  return stmt.run({
    ...dados,
    password: hashSenha(dados.password)
  });
}

export function alterarSenhaUsuario(id: number, newPassword: string) {
  const stmt = db.prepare(`UPDATE usuarios SET password = ? WHERE id = ? `);
  return stmt.run(hashSenha(newPassword), id);
}

export function removerUsuario(id: number) {
  const stmt = db.prepare(`DELETE FROM usuarios WHERE id = ? `);
  return stmt.run(id);
}

export function updateUser(data: Usuario) {
  console.log("Dados chegando no db.ts", data);

  const campos: string[] = [];
  const valores: any[] = [];

  if (data.nome !== undefined) {
    campos.push('nome = ?');
    valores.push(data.nome);
  }

  if (data.email !== undefined) {
    campos.push('email = ?');
    valores.push(data.email);
  }

  if (data.login !== undefined) {
    campos.push('username = ?');
    valores.push(data.login);
  }

  if (data.role !== undefined) {
    campos.push('funcao = ?');
    valores.push(data.role);
  }


  valores.push(data.id);

  const sql = `
  UPDATE usuarios
  SET ${campos.join(', ')}
  WHERE id = ?
      `;

  const stmt = db.prepare(sql);
  stmt.run(...valores);
}

export function disableUser(id: number) {
  const stmt = db.prepare(`UPDATE usuarios SET ativo = 0 WHERE id = ? `);
  return stmt.run(id);
}

export function enableUser(id: number) {
  const stmt = db.prepare(`UPDATE usuarios SET ativo = 1 WHERE id = ? `);
  return stmt.run(id);
}

// Criar usuário admin na inicialização
criarUsuarioAdmin();

//#endregion

//#region - FUNCOES PARA ATUAR COM PDV

export function getOpenCashSession(data: CashRestoreSessionData): CashRestoredSession | null {
  const stmt = db.prepare(`
    SELECT id
      FROM cash_register_sessions
    WHERE pdv_id = ?
      AND operator_id = ?
        AND status = 'OPEN'
    ORDER BY opened_at DESC
    LIMIT 1;
    `);

  const session = stmt.get(data.pdv_id, data.operator_id) as { id: number } | undefined;

  if (!session) {
    return null;
  }

  return getCashSessionSummaryById(session.id);
}


//#endregion
