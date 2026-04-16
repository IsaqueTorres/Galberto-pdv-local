import type { SQLiteDatabase } from '../../../../infra/database/db';

const MIGRATION_ID = '2026-04-16-fiscal-persistence-v1';

function ensureMigrationsTable(database: SQLiteDatabase) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      executed_at TEXT NOT NULL
    );
  `);
}

function hasMigration(database: SQLiteDatabase, migrationId: string): boolean {
  const row = database
    .prepare(`SELECT 1 FROM schema_migrations WHERE id = ? LIMIT 1`)
    .get(migrationId);

  return Boolean(row);
}

function hasColumn(database: SQLiteDatabase, table: string, column: string): boolean {
  const rows = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function executeMigration(database: SQLiteDatabase) {
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

    database
      .prepare(`INSERT INTO schema_migrations (id, executed_at) VALUES (?, CURRENT_TIMESTAMP)`)
      .run(MIGRATION_ID);
  });

  transaction();
}

function ensureFiscalPersistenceColumns(database: SQLiteDatabase) {
  const statements: string[] = [];

  if (!hasColumn(database, 'fiscal_documents', 'issued_datetime')) {
    statements.push(`ALTER TABLE fiscal_documents ADD COLUMN issued_datetime TEXT`);
  }

  if (!hasColumn(database, 'fiscal_documents', 'xml_authorized')) {
    statements.push(`ALTER TABLE fiscal_documents ADD COLUMN xml_authorized TEXT`);
  }

  if (!hasColumn(database, 'fiscal_documents', 'xml_cancellation')) {
    statements.push(`ALTER TABLE fiscal_documents ADD COLUMN xml_cancellation TEXT`);
  }

  if (statements.length > 0) {
    database.exec(statements.join(';\n'));
  }
}

export function runFiscalPersistenceMigrations(database: SQLiteDatabase) {
  ensureMigrationsTable(database);
  if (!hasMigration(database, MIGRATION_ID)) {
    executeMigration(database);
  }
  ensureFiscalPersistenceColumns(database);
}
