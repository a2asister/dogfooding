import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_BASE_PATH = path.join(__dirname, '../../../data');

class Database {
  constructor() {
    this.init();
  }

  async init() {
    await fs.ensureDir(DB_BASE_PATH);
    await this.ensureBaseCollections();
  }

  async ensureBaseCollections() {
    const collections = ['users', 'roles', 'sites', 'permissions'];
    for (const collection of collections) {
      const collectionPath = path.join(DB_BASE_PATH, `${collection}.json`);
      if (!(await fs.pathExists(collectionPath))) {
        await fs.writeJson(collectionPath, [], { spaces: 2 });
      }
    }
    
    await this.initDefaultData();
  }

  async initDefaultData() {
    const users = await this.findAll('users');
    if (users.length === 0) {
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default || bcryptModule;
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await this.create('users', {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@cms.local',
        password: hashedPassword,
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await this.create('roles', {
        id: uuidv4(),
        name: 'super_admin',
        displayName: '超级管理员',
        permissions: ['*'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await this.create('roles', {
        id: uuidv4(),
        name: 'site_admin',
        displayName: '站点管理员',
        permissions: [
          'site:read', 'site:update',
          'model:read', 'model:create', 'model:update', 'model:delete',
          'content:read', 'content:create', 'content:update', 'content:delete', 'content:publish',
          'route:read', 'route:create', 'route:update', 'route:delete'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await this.create('roles', {
        id: uuidv4(),
        name: 'editor',
        displayName: '编辑',
        permissions: [
          'content:read', 'content:create', 'content:update'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  async getSiteDbPath(siteId) {
    const sitePath = path.join(DB_BASE_PATH, 'sites', siteId);
    await fs.ensureDir(sitePath);
    return sitePath;
  }

  async findAll(collection, siteId = null) {
    let filePath;
    if (siteId) {
      const sitePath = await this.getSiteDbPath(siteId);
      filePath = path.join(sitePath, `${collection}.json`);
    } else {
      filePath = path.join(DB_BASE_PATH, `${collection}.json`);
    }
    
    if (!(await fs.pathExists(filePath))) {
      return [];
    }
    
    return await fs.readJson(filePath);
  }

  async findById(collection, id, siteId = null) {
    const items = await this.findAll(collection, siteId);
    return items.find(item => item.id === id);
  }

  async findOne(collection, query, siteId = null) {
    const items = await this.findAll(collection, siteId);
    return items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async find(collection, query, siteId = null) {
    const items = await this.findAll(collection, siteId);
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async create(collection, data, siteId = null) {
    const items = await this.findAll(collection, siteId);
    const newItem = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    items.push(newItem);
    await this.save(collection, items, siteId);
    return newItem;
  }

  async update(collection, id, data, siteId = null) {
    const items = await this.findAll(collection, siteId);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await this.save(collection, items, siteId);
    return items[index];
  }

  async delete(collection, id, siteId = null) {
    const items = await this.findAll(collection, siteId);
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false;
    }
    
    await this.save(collection, filteredItems, siteId);
    return true;
  }

  async save(collection, data, siteId = null) {
    let filePath;
    if (siteId) {
      const sitePath = await this.getSiteDbPath(siteId);
      filePath = path.join(sitePath, `${collection}.json`);
    } else {
      filePath = path.join(DB_BASE_PATH, `${collection}.json`);
    }
    
    await fs.writeJson(filePath, data, { spaces: 2 });
  }
}

export const db = new Database();
export default db;
