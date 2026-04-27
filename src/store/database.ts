import Dexie, { Table } from 'dexie';
import { Spreadsheet, OperationRecord, TableVersion, OperationLog } from '../types';

export class SpreadsheetDatabase extends Dexie {
  spreadsheets!: Table<Spreadsheet>;
  operationHistory!: Table<OperationRecord>;
  versions!: Table<TableVersion>;
  logs!: Table<OperationLog>;

  constructor() {
    super('SpreadsheetDB');
    
    this.version(1).stores({
      spreadsheets: 'id, name, createdAt, updatedAt',
      operationHistory: 'id, timestamp, userId',
      versions: 'id, timestamp, tableId',
      logs: 'id, tableId, userId, timestamp'
    });
  }
}

export const db = new SpreadsheetDatabase();
