import db from '../../../../infra/database/db';

export class FiscalTransactionManager {
  run<T>(callback: () => T): T {
    const transaction = db.transaction(callback);
    return transaction();
  }
}

export const fiscalTransactionManager = new FiscalTransactionManager();

