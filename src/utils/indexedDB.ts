export interface IndexInfo {
  name: string;
  keyPath: string | string[];
  unique: boolean;
  multiEntry: boolean;
}

export interface StoreInfo {
  name: string;
  keyPath: string | string[] | null;
  autoIncrement: boolean;
  indexes: IndexInfo[];
}

export interface DatabaseInfo {
  name: string;
  version: number;
  stores: StoreInfo[];
}

export interface QueryOptions {
  indexName?: string;
  range?: IDBKeyRange;
  direction?: IDBCursorDirection;
  limit?: number;
  offset?: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbName: string = '';
  private version: number = 1;

  constructor() {}

  async getDatabaseList(): Promise<DatabaseInfo[]> {
    try {
      const databases = await indexedDB.databases();
      const dbList: DatabaseInfo[] = [];
      
      for (const dbInfo of databases) {
        if (dbInfo.name && dbInfo.version) {
          try {
            const stores = await this.getStoresInfo(dbInfo.name, dbInfo.version);
            dbList.push({
              name: dbInfo.name,
              version: dbInfo.version,
              stores
            });
          } catch (e) {
            dbList.push({
              name: dbInfo.name,
              version: dbInfo.version,
              stores: []
            });
          }
        }
      }
      
      return dbList;
    } catch (error) {
      console.error('获取数据库列表失败:', error);
      return [];
    }
  }

  private async getStoresInfo(dbName: string, version: number): Promise<StoreInfo[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      
      request.onsuccess = () => {
        const db = request.result;
        const stores: StoreInfo[] = [];
        
        const storeNames = db.objectStoreNames;
        for (let i = 0; i < storeNames.length; i++) {
          const storeName = storeNames[i];
          try {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            
            const indexes: IndexInfo[] = [];
            const indexNames = store.indexNames;
            for (let j = 0; j < indexNames.length; j++) {
              const indexName = indexNames[j];
              const index = store.index(indexName);
              indexes.push({
                name: index.name,
                keyPath: index.keyPath,
                unique: index.unique,
                multiEntry: index.multiEntry
              });
            }
            
            stores.push({
              name: store.name,
              keyPath: store.keyPath,
              autoIncrement: store.autoIncrement,
              indexes
            });
          } catch (e) {
            console.error(`获取表 ${storeName} 信息失败:`, e);
          }
        }
        
        db.close();
        resolve(stores);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async connect(dbName: string, version?: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      
      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.dbName = dbName;
        this.version = this.db.version;
        resolve(this.db);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async createDatabase(dbName: string, stores?: StoreInfo[]): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (stores && stores.length > 0) {
          for (const store of stores) {
            if (!db.objectStoreNames.contains(store.name)) {
              const objectStore = db.createObjectStore(store.name, {
                keyPath: store.keyPath || undefined,
                autoIncrement: store.autoIncrement
              });
              
              if (store.indexes && store.indexes.length > 0) {
                for (const index of store.indexes) {
                  if (!objectStore.indexNames.contains(index.name)) {
                    objectStore.createIndex(index.name, index.keyPath, {
                      unique: index.unique,
                      multiEntry: index.multiEntry
                    });
                  }
                }
              }
            }
          }
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        this.db = db;
        this.dbName = dbName;
        this.version = db.version;
        resolve(db);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteDatabase(dbName: string): Promise<void> {
    if (this.db && this.dbName === dbName) {
      this.db.close();
      this.db = null;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onblocked = () => {
        reject(new Error('数据库被其他连接阻塞，请关闭所有标签页后重试'));
      };
    });
  }

  async createStore(storeInfo: StoreInfo): Promise<void> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    const newVersion = this.db.version + 1;
    const dbName = this.dbName;
    
    this.db.close();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, newVersion);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(storeInfo.name)) {
          const objectStore = db.createObjectStore(storeInfo.name, {
            keyPath: storeInfo.keyPath || undefined,
            autoIncrement: storeInfo.autoIncrement
          });
          
          if (storeInfo.indexes && storeInfo.indexes.length > 0) {
            for (const index of storeInfo.indexes) {
              if (!objectStore.indexNames.contains(index.name)) {
                objectStore.createIndex(index.name, index.keyPath, {
                  unique: index.unique,
                  multiEntry: index.multiEntry
                });
              }
            }
          }
        } else {
          reject(new Error(`表 ${storeInfo.name} 已存在`));
        }
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.version = newVersion;
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteStore(storeName: string): Promise<void> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    const newVersion = this.db.version + 1;
    const dbName = this.dbName;
    
    this.db.close();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, newVersion);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (db.objectStoreNames.contains(storeName)) {
          db.deleteObjectStore(storeName);
        } else {
          reject(new Error(`表 ${storeName} 不存在`));
        }
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.version = newVersion;
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async createIndex(storeName: string, indexInfo: IndexInfo): Promise<void> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    const newVersion = this.db.version + 1;
    const dbName = this.dbName;
    
    this.db.close();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, newVersion);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (db.objectStoreNames.contains(storeName)) {
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            const store = transaction.objectStore(storeName);
            if (!store.indexNames.contains(indexInfo.name)) {
              store.createIndex(indexInfo.name, indexInfo.keyPath, {
                unique: indexInfo.unique,
                multiEntry: indexInfo.multiEntry
              });
            } else {
              reject(new Error(`索引 ${indexInfo.name} 已存在`));
            }
          }
        } else {
          reject(new Error(`表 ${storeName} 不存在`));
        }
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.version = newVersion;
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteIndex(storeName: string, indexName: string): Promise<void> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    const newVersion = this.db.version + 1;
    const dbName = this.dbName;
    
    this.db.close();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, newVersion);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (db.objectStoreNames.contains(storeName)) {
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            const store = transaction.objectStore(storeName);
            if (store.indexNames.contains(indexName)) {
              store.deleteIndex(indexName);
            } else {
              reject(new Error(`索引 ${indexName} 不存在`));
            }
          }
        } else {
          reject(new Error(`表 ${storeName} 不存在`));
        }
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.version = newVersion;
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async addMany<T>(storeName: string, dataList: T[]): Promise<IDBValidKey[]> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    const results: IDBValidKey[] = [];
    
    for (const data of dataList) {
      const key = await this.add(storeName, data);
      results.push(key);
    }
    
    return results;
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAll<T>(storeName: string, options?: QueryOptions): Promise<T[]> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const target = options?.indexName ? store.index(options.indexName) : store;
      
      const results: T[] = [];
      let count = 0;
      let skipped = 0;
      
      const request = target.openCursor(options?.range, options?.direction);
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (options?.offset && skipped < options.offset) {
            skipped++;
            cursor.continue();
          } else if (options?.limit && count >= options.limit) {
            resolve(results);
          } else {
            results.push(cursor.value as T);
            count++;
            cursor.continue();
          }
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async count(storeName: string, options?: QueryOptions): Promise<number> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const target = options?.indexName ? store.index(options.indexName) : store;
      
      const request = options?.range ? target.count(options.range) : target.count();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async update<T>(storeName: string, data: T, key?: IDBValidKey): Promise<IDBValidKey> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = key !== undefined ? store.put(data, key) : store.put(data);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteMany(storeName: string, keys: IDBValidKey[]): Promise<void> {
    for (const key of keys) {
      await this.delete(storeName, key);
    }
  }

  async clearStore(storeName: string): Promise<void> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async exportStore(storeName: string): Promise<string> {
    const data = await this.getAll(storeName);
    return JSON.stringify(data, null, 2);
  }

  async exportAllStores(): Promise<Record<string, any[]>> {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    
    const result: Record<string, any[]> = {};
    const storeNames = this.db.objectStoreNames;
    
    for (let i = 0; i < storeNames.length; i++) {
      const storeName = storeNames[i];
      result[storeName] = await this.getAll(storeName);
    }
    
    return result;
  }

  async importStore(storeName: string, jsonData: string, clearFirst: boolean = false): Promise<number> {
    const data = JSON.parse(jsonData);
    
    if (!Array.isArray(data)) {
      throw new Error('导入的数据格式不正确，需要是数组格式');
    }
    
    if (clearFirst) {
      await this.clearStore(storeName);
    }
    
    await this.addMany(storeName, data);
    return data.length;
  }

  async importAllStores(data: Record<string, any[]>, clearFirst: boolean = false): Promise<number> {
    let totalCount = 0;
    
    for (const [storeName, storeData] of Object.entries(data)) {
      if (Array.isArray(storeData)) {
        if (clearFirst) {
          await this.clearStore(storeName);
        }
        await this.addMany(storeName, storeData);
        totalCount += storeData.length;
      }
    }
    
    return totalCount;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  getCurrentDatabase(): IDBDatabase | null {
    return this.db;
  }

  getCurrentDbName(): string {
    return this.dbName;
  }

  getCurrentVersion(): number {
    return this.version;
  }
}

export default new IndexedDBManager();