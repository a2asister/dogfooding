import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const adapter = new JSONFile(path.join(DB_DIR, 'db.json'));

const defaultData = {
  products: []
};

const db = new Low(adapter, defaultData);

await db.read();

function insertProduct(product) {
  db.data.products.unshift(product);
  db.write();
  return { changes: 1 };
}

function updateProduct(id, product) {
  const index = db.data.products.findIndex((p) => p.id === id);
  if (index === -1) return { changes: 0 };
  
  const existing = db.data.products[index];
  db.data.products[index] = {
    ...existing,
    ...product
  };
  db.write();
  return { changes: 1 };
}

function deleteProduct(id) {
  const index = db.data.products.findIndex((p) => p.id === id);
  if (index === -1) return { changes: 0 };
  
  db.data.products.splice(index, 1);
  db.write();
  return { changes: 1 };
}

function getProductById(id) {
  return db.data.products.find((p) => p.id === id) || null;
}

function getAllProducts() {
  return [...db.data.products];
}

function getProductsPaginated(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const total = db.data.products.length;
  const products = db.data.products.slice(offset, offset + limit);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export {
  db,
  insertProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  getProductsPaginated
};
