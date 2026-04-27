import db from '../../../../infra/database/db';
import type { CreateStoreInput, StoreRecord, UpsertActiveStoreInput } from '../types/schema.types';
import { booleanToInt } from '../utils/db.utils';

type StoreRow = {
  id: number;
  code: string;
  name: string;
  legal_name: string;
  cnpj: string;
  state_registration: string;
  tax_regime_code: string;
  environment: StoreRecord['environment'];
  csc_id: string | null;
  csc_token: string | null;
  default_series: number;
  next_nfce_number: number;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  address_city_ibge_code: string;
  active: number;
  created_at: string;
  updated_at: string;
};

function mapStore(row: StoreRow): StoreRecord {
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
    updatedAt: row.updated_at,
  };
}

export class StoreRepository {
  create(input: CreateStoreInput): StoreRecord {
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
      booleanToInt(input.active ?? true),
    );

    return this.findById(Number(result.lastInsertRowid)) as StoreRecord;
  }

  findById(id: number): StoreRecord | null {
    const row = db.prepare(`SELECT * FROM stores WHERE id = ? LIMIT 1`).get(id) as StoreRow | undefined;
    return row ? mapStore(row) : null;
  }

  findActive(): StoreRecord | null {
    const row = db.prepare(`
      SELECT * FROM stores
      WHERE active = 1
      ORDER BY id ASC
      LIMIT 1
    `).get() as StoreRow | undefined;

    return row ? mapStore(row) : null;
  }

  upsertActive(input: UpsertActiveStoreInput): StoreRecord {
    const current = input.id ? this.findById(input.id) : this.findActive();
    if (!current) {
      return this.create({ ...input, code: input.code || 'MAIN', active: true });
    }

    db.prepare(`
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
      input.code || current.code || 'MAIN',
      input.name,
      input.legalName,
      input.cnpj,
      input.stateRegistration,
      input.taxRegimeCode,
      input.environment,
      input.cscId ?? null,
      input.cscToken ?? current.cscToken ?? null,
      input.defaultSeries ?? current.defaultSeries,
      input.nextNfceNumber ?? current.nextNfceNumber,
      input.addressStreet,
      input.addressNumber,
      input.addressNeighborhood,
      input.addressCity,
      input.addressState,
      input.addressZipCode,
      input.addressCityIbgeCode,
      booleanToInt(input.active ?? true),
      current.id
    );

    return this.findById(current.id) as StoreRecord;
  }

  updateFiscalConfiguration(
    storeId: number,
    input: {
      environment?: StoreRecord['environment'];
      cscId?: string | null;
      cscToken?: string | null;
      defaultSeries?: number | null;
    }
  ): StoreRecord {
    const current = this.findById(storeId);
    if (!current) {
      throw new Error(`Store ${storeId} não encontrada.`);
    }

    db.prepare(`
      UPDATE stores
      SET
        environment = ?,
        csc_id = ?,
        csc_token = ?,
        default_series = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      input.environment ?? current.environment,
      input.cscId ?? current.cscId ?? null,
      input.cscToken ?? current.cscToken ?? null,
      input.defaultSeries && input.defaultSeries > 0 ? input.defaultSeries : current.defaultSeries,
      storeId
    );

    return this.findById(storeId) as StoreRecord;
  }

  reserveNextNfceNumber(storeId: number): { series: number; number: number } {
    const transaction = db.transaction(() => {
      const current = db.prepare(`
        SELECT default_series, next_nfce_number
        FROM stores
        WHERE id = ?
        LIMIT 1
      `).get(storeId) as { default_series: number; next_nfce_number: number } | undefined;

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
        number: current.next_nfce_number,
      };
    });

    return transaction();
  }
}

export const storeRepository = new StoreRepository();
