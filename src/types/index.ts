export interface Database {
  name: string;
  version: number;
}

export interface Store {
  name: string;
  keyPath: string | string[] | null;
  autoIncrement: boolean;
  indexes: Index[];
}

export interface Index {
  name: string;
  keyPath: string | string[];
  unique: boolean;
  multiEntry: boolean;
}

export interface TableData {
  [key: string]: any;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface CreateStoreForm {
  name: string;
  keyPath: string;
  autoIncrement: boolean;
  indexes: IndexForm[];
}

export interface IndexForm {
  name: string;
  keyPath: string;
  unique: boolean;
  multiEntry: boolean;
}

export interface CreateIndexForm {
  name: string;
  keyPath: string;
  unique: boolean;
  multiEntry: boolean;
}