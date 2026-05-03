const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SKUS_FILE = path.join(DATA_DIR, 'skus.json');
const DISCOUNTS_FILE = path.join(DATA_DIR, 'discounts.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化数据文件
function initDataFiles() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(SKUS_FILE)) {
    fs.writeFileSync(SKUS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(DISCOUNTS_FILE)) {
    fs.writeFileSync(DISCOUNTS_FILE, JSON.stringify([], null, 2));
  }
}

initDataFiles();

// 读取数据
function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取数据文件 ${filePath} 失败:`, error);
    return [];
  }
}

// 写入数据
function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`写入数据文件 ${filePath} 失败:`, error);
    return false;
  }
}

// 产品操作
const ProductStore = {
  getAll: () => readData(PRODUCTS_FILE),
  getById: (id) => {
    const products = readData(PRODUCTS_FILE);
    return products.find(p => p.id === id);
  },
  create: (product) => {
    const products = readData(PRODUCTS_FILE);
    products.push(product);
    return writeData(PRODUCTS_FILE, products);
  },
  update: (id, updatedProduct) => {
    const products = readData(PRODUCTS_FILE);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct };
      return writeData(PRODUCTS_FILE, products);
    }
    return false;
  },
  delete: (id) => {
    const products = readData(PRODUCTS_FILE);
    const filtered = products.filter(p => p.id !== id);
    return writeData(PRODUCTS_FILE, filtered);
  }
};

// SKU操作
const SkuStore = {
  getAll: () => readData(SKUS_FILE),
  getById: (id) => {
    const skus = readData(SKUS_FILE);
    return skus.find(s => s.id === id);
  },
  getByProductId: (productId) => {
    const skus = readData(SKUS_FILE);
    return skus.filter(s => s.productId === productId);
  },
  create: (sku) => {
    const skus = readData(SKUS_FILE);
    skus.push(sku);
    return writeData(SKUS_FILE, skus);
  },
  update: (id, updatedSku) => {
    const skus = readData(SKUS_FILE);
    const index = skus.findIndex(s => s.id === id);
    if (index !== -1) {
      skus[index] = { ...skus[index], ...updatedSku };
      return writeData(SKUS_FILE, skus);
    }
    return false;
  },
  updateStock: (id, newStock) => {
    const skus = readData(SKUS_FILE);
    const index = skus.findIndex(s => s.id === id);
    if (index !== -1) {
      skus[index].stock = newStock;
      return writeData(SKUS_FILE, skus);
    }
    return false;
  },
  delete: (id) => {
    const skus = readData(SKUS_FILE);
    const filtered = skus.filter(s => s.id !== id);
    return writeData(SKUS_FILE, filtered);
  },
  deleteByProductId: (productId) => {
    const skus = readData(SKUS_FILE);
    const filtered = skus.filter(s => s.productId !== productId);
    return writeData(SKUS_FILE, filtered);
  }
};

// 优惠操作
const DiscountStore = {
  getAll: () => readData(DISCOUNTS_FILE),
  getById: (id) => {
    const discounts = readData(DISCOUNTS_FILE);
    return discounts.find(d => d.id === id);
  },
  getActive: () => {
    const discounts = readData(DISCOUNTS_FILE);
    const now = new Date();
    return discounts.filter(d => {
      const start = new Date(d.startDate);
      const end = new Date(d.endDate);
      return d.active && start <= now && end >= now;
    });
  },
  create: (discount) => {
    const discounts = readData(DISCOUNTS_FILE);
    discounts.push(discount);
    return writeData(DISCOUNTS_FILE, discounts);
  },
  update: (id, updatedDiscount) => {
    const discounts = readData(DISCOUNTS_FILE);
    const index = discounts.findIndex(d => d.id === id);
    if (index !== -1) {
      discounts[index] = { ...discounts[index], ...updatedDiscount };
      return writeData(DISCOUNTS_FILE, discounts);
    }
    return false;
  },
  delete: (id) => {
    const discounts = readData(DISCOUNTS_FILE);
    const filtered = discounts.filter(d => d.id !== id);
    return writeData(DISCOUNTS_FILE, filtered);
  }
};

module.exports = {
  ProductStore,
  SkuStore,
  DiscountStore
};