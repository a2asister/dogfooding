import { openDB } from 'idb';

const DB_NAME = 'DesignerPortfolioDB';
const DB_VERSION = 1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDB(): Promise<any> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('designers')) {
        const designerStore = db.createObjectStore('designers', { keyPath: 'id' });
        designerStore.createIndex('by-email', 'email', { unique: true });
      }

      if (!db.objectStoreNames.contains('workExperiences')) {
        const weStore = db.createObjectStore('workExperiences', { keyPath: 'id' });
        weStore.createIndex('by-designer', 'designerId');
      }

      if (!db.objectStoreNames.contains('portfolioCategories')) {
        const pcStore = db.createObjectStore('portfolioCategories', { keyPath: 'id' });
        pcStore.createIndex('by-sort-order', 'sortOrder');
      }

      if (!db.objectStoreNames.contains('portfolios')) {
        const pStore = db.createObjectStore('portfolios', { keyPath: 'id' });
        pStore.createIndex('by-category', 'categoryId');
        pStore.createIndex('by-published', ['isPublished', 'sortOrder']);
        pStore.createIndex('by-top', ['isTop', 'sortOrder']);
        pStore.createIndex('by-views', 'viewCount', { unique: false });
      }

      if (!db.objectStoreNames.contains('caseStudies')) {
        const csStore = db.createObjectStore('caseStudies', { keyPath: 'id' });
        csStore.createIndex('by-featured', ['isFeatured', 'sortOrder']);
        csStore.createIndex('by-tags', 'tags', { multiEntry: true });
        csStore.createIndex('by-views', 'viewCount', { unique: false });
      }

      if (!db.objectStoreNames.contains('servicePackages')) {
        const spStore = db.createObjectStore('servicePackages', { keyPath: 'id' });
        spStore.createIndex('by-active', ['isActive', 'sortOrder']);
        spStore.createIndex('by-price', 'price');
      }

      if (!db.objectStoreNames.contains('orders')) {
        const oStore = db.createObjectStore('orders', { keyPath: 'id' });
        oStore.createIndex('by-order-number', 'orderNumber', { unique: true });
        oStore.createIndex('by-status', 'status');
        oStore.createIndex('by-payment-status', 'paymentStatus');
        oStore.createIndex('by-created', 'createdAt');
        oStore.createIndex('by-client-email', 'clientEmail');
      }

      if (!db.objectStoreNames.contains('orderHistories')) {
        const ohStore = db.createObjectStore('orderHistories', { keyPath: 'id' });
        ohStore.createIndex('by-order', 'orderId');
      }

      if (!db.objectStoreNames.contains('chatSessions')) {
        const csStore = db.createObjectStore('chatSessions', { keyPath: 'id' });
        csStore.createIndex('by-active', 'isActive');
        csStore.createIndex('by-last-message', 'lastMessageTime');
        csStore.createIndex('by-unread', 'unreadCount');
      }

      if (!db.objectStoreNames.contains('chatMessages')) {
        const cmStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
        cmStore.createIndex('by-session', 'sessionId');
        cmStore.createIndex('by-session-time', ['sessionId', 'createdAt']);
        cmStore.createIndex('by-read', ['sessionId', 'isRead']);
      }

      if (!db.objectStoreNames.contains('quickReplies')) {
        const qrStore = db.createObjectStore('quickReplies', { keyPath: 'id' });
        qrStore.createIndex('by-category', 'category');
        qrStore.createIndex('by-active', ['isActive', 'sortOrder']);
      }

      if (!db.objectStoreNames.contains('reviews')) {
        const rStore = db.createObjectStore('reviews', { keyPath: 'id' });
        rStore.createIndex('by-order', 'orderId', { unique: true });
        rStore.createIndex('by-rating', 'rating');
        rStore.createIndex('by-pinned', ['isPinned', 'createdAt']);
        rStore.createIndex('by-featured', ['isFeatured', 'createdAt']);
        rStore.createIndex('by-created', 'createdAt');
      }

      if (!db.objectStoreNames.contains('materialCategories')) {
        const mcStore = db.createObjectStore('materialCategories', { keyPath: 'id' });
        mcStore.createIndex('by-sort-order', 'sortOrder');
      }

      if (!db.objectStoreNames.contains('materials')) {
        const mStore = db.createObjectStore('materials', { keyPath: 'id' });
        mStore.createIndex('by-category', 'categoryId');
        mStore.createIndex('by-price', 'price');
        mStore.createIndex('by-downloads', 'downloadCount');
        mStore.createIndex('by-tags', 'tags', { multiEntry: true });
        mStore.createIndex('by-active', 'isActive');
      }

      if (!db.objectStoreNames.contains('userFavorites')) {
        const ufStore = db.createObjectStore('userFavorites', { keyPath: 'id' });
        ufStore.createIndex('by-user', 'userId');
        ufStore.createIndex('by-user-item', ['userId', 'itemType', 'itemId'], { unique: true });
      }

      if (!db.objectStoreNames.contains('downloadRecords')) {
        const drStore = db.createObjectStore('downloadRecords', { keyPath: 'id' });
        drStore.createIndex('by-user', 'userId');
        drStore.createIndex('by-material', 'materialId');
        drStore.createIndex('by-time', 'downloadTime');
      }

      if (!db.objectStoreNames.contains('analytics')) {
        const aStore = db.createObjectStore('analytics', { keyPath: 'id' });
        aStore.createIndex('by-date', 'date', { unique: true });
        aStore.createIndex('by-created', 'createdAt');
      }

      if (!db.objectStoreNames.contains('visitors')) {
        const vStore = db.createObjectStore('visitors', { keyPath: 'id' });
        vStore.createIndex('by-session', 'sessionId');
        vStore.createIndex('by-time', 'visitTime');
        vStore.createIndex('by-device', 'device');
      }

      if (!db.objectStoreNames.contains('users')) {
        const uStore = db.createObjectStore('users', { keyPath: 'id' });
        uStore.createIndex('by-username', 'username', { unique: true });
        uStore.createIndex('by-email', 'email', { unique: true });
        uStore.createIndex('by-role', 'role');
        uStore.createIndex('by-active', 'isActive');
      }

      if (!db.objectStoreNames.contains('subUsers')) {
        const suStore = db.createObjectStore('subUsers', { keyPath: 'id' });
        suStore.createIndex('by-parent', 'parentUserId');
        suStore.createIndex('by-username', 'username', { unique: true });
        suStore.createIndex('by-email', 'email', { unique: true });
        suStore.createIndex('by-active', 'isActive');
      }

      if (!db.objectStoreNames.contains('operationLogs')) {
        const olStore = db.createObjectStore('operationLogs', { keyPath: 'id' });
        olStore.createIndex('by-user', 'userId');
        olStore.createIndex('by-module', 'module');
        olStore.createIndex('by-action', 'action');
        olStore.createIndex('by-time', 'createdAt');
      }

      if (!db.objectStoreNames.contains('loginRecords')) {
        const lrStore = db.createObjectStore('loginRecords', { keyPath: 'id' });
        lrStore.createIndex('by-user', 'userId');
        lrStore.createIndex('by-device', 'deviceId');
        lrStore.createIndex('by-successful', 'isSuccessful');
        lrStore.createIndex('by-time', 'loginTime');
      }
    },
  });

  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([
    'designers', 'workExperiences', 'portfolioCategories', 'portfolios',
    'caseStudies', 'servicePackages', 'orders', 'orderHistories',
    'chatSessions', 'chatMessages', 'quickReplies', 'reviews',
    'materialCategories', 'materials', 'userFavorites', 'downloadRecords',
    'analytics', 'visitors', 'users', 'subUsers', 'operationLogs', 'loginRecords'
  ], 'readwrite');

  for (const storeName of tx.storeNames) {
    await tx.objectStore(storeName).clear();
  }

  await tx.done;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
}
