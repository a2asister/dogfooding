export type CellType = 'text' | 'number' | 'date' | 'dropdown';

export interface CellValidation {
  required: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface ColumnConfig {
  id: string;
  title: string;
  type: CellType;
  width?: number;
  dropdownOptions?: string[];
  validation?: CellValidation;
  readOnly?: boolean;
  hidden?: boolean;
}

export interface RowConfig {
  id: string;
  height?: number;
  hidden?: boolean;
}

export interface CellData {
  value: unknown;
  row: number;
  col: number;
  columnId?: string;
}

export interface CellChange {
  row: number;
  col: number;
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
  userId: string;
}

export interface OperationRecord {
  id: string;
  type: 'cell_edit' | 'row_add' | 'row_delete' | 'col_add' | 'col_delete' | 'col_width' | 'row_height' | 'batch_edit';
  data: CellChange | CellChange[];
  timestamp: number;
  userId: string;
}

export interface TableVersion {
  id: string;
  snapshot: string;
  timestamp: number;
  userId: string;
  description: string;
  changesCount: number;
}

export interface SpreadsheetData {
  data: (string | number | boolean | null)[][];
  colHeaders: string[];
  rowHeaders?: string[];
  columns?: ColumnConfig[];
  rows?: RowConfig[];
  fixedRowsTop?: number;
  fixedColumnsLeft?: number;
  columnWidths?: number[];
  rowHeights?: number[];
}

export interface Spreadsheet {
  id: string;
  name: string;
  data: SpreadsheetData;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
  versions: TableVersion[];
}

export interface User {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { row: number; col: number };
  lastActive: number;
}

export interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface OperationLog {
  id: string;
  tableId: string;
  userId: string;
  operation: string;
  details: string;
  timestamp: number;
}
