const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const fs = require('fs');
const path = require('path');

const app = new Koa();
const router = new Router();

const DATA_DIR = path.join(__dirname, 'data');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const EXCHANGE_RATES_FILE = path.join(DATA_DIR, 'exchange-rates.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile(filePath, defaultData) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      return defaultData;
    }
  }
  return defaultData;
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

router.get('/api/exchange-rates', async (ctx) => {
  let rates = readJsonFile(EXCHANGE_RATES_FILE, null);
  const now = Date.now();
  
  if (!rates || (now - rates.timestamp > 24 * 60 * 60 * 1000)) {
    const baseCurrencies = ['USD', 'CNY', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'HKD', 'SGD', 'KRW'];
    const currencyRates = {};
    
    baseCurrencies.forEach(currency => {
      currencyRates[currency] = {};
      baseCurrencies.forEach(target => {
        if (currency === target) {
          currencyRates[currency][target] = 1;
        }
      });
    });
    
    currencyRates.USD.CNY = 7.25;
    currencyRates.USD.EUR = 0.92;
    currencyRates.USD.GBP = 0.79;
    currencyRates.USD.JPY = 149.50;
    currencyRates.USD.AUD = 1.54;
    currencyRates.USD.CAD = 1.37;
    currencyRates.USD.HKD = 7.82;
    currencyRates.USD.SGD = 1.34;
    currencyRates.USD.KRW = 1350.00;
    
    currencyRates.CNY.USD = 1 / 7.25;
    currencyRates.CNY.EUR = 0.92 / 7.25;
    currencyRates.CNY.GBP = 0.79 / 7.25;
    currencyRates.CNY.JPY = 149.50 / 7.25;
    
    currencyRates.EUR.USD = 1 / 0.92;
    currencyRates.EUR.CNY = 7.25 / 0.92;
    
    rates = {
      timestamp: now,
      rates: currencyRates,
      source: '本地模拟数据'
    };
    
    writeJsonFile(EXCHANGE_RATES_FILE, rates);
  }
  
  ctx.body = {
    success: true,
    data: rates
  };
});

router.post('/api/exchange-rates/refresh', async (ctx) => {
  const baseCurrencies = ['USD', 'CNY', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'HKD', 'SGD', 'KRW'];
  const currencyRates = {};
  
  baseCurrencies.forEach(currency => {
    currencyRates[currency] = {};
    baseCurrencies.forEach(target => {
      if (currency === target) {
        currencyRates[currency][target] = 1;
      }
    });
  });
  
  const jitter = 1 + (Math.random() - 0.5) * 0.02;
  currencyRates.USD.CNY = 7.25 * jitter;
  currencyRates.USD.EUR = 0.92 * jitter;
  currencyRates.USD.GBP = 0.79 * jitter;
  currencyRates.USD.JPY = 149.50 * jitter;
  currencyRates.USD.AUD = 1.54 * jitter;
  currencyRates.USD.CAD = 1.37 * jitter;
  currencyRates.USD.HKD = 7.82 * jitter;
  currencyRates.USD.SGD = 1.34 * jitter;
  currencyRates.USD.KRW = 1350.00 * jitter;
  
  currencyRates.CNY.USD = 1 / currencyRates.USD.CNY;
  currencyRates.CNY.EUR = currencyRates.USD.EUR / currencyRates.USD.CNY;
  currencyRates.CNY.GBP = currencyRates.USD.GBP / currencyRates.USD.CNY;
  currencyRates.CNY.JPY = currencyRates.USD.JPY / currencyRates.USD.CNY;
  
  currencyRates.EUR.USD = 1 / currencyRates.USD.EUR;
  currencyRates.EUR.CNY = currencyRates.USD.CNY / currencyRates.USD.EUR;
  
  const rates = {
    timestamp: Date.now(),
    rates: currencyRates,
    source: '模拟实时更新'
  };
  
  writeJsonFile(EXCHANGE_RATES_FILE, rates);
  
  ctx.body = {
    success: true,
    data: rates,
    message: '汇率数据已更新'
  };
});

router.get('/api/favorites', async (ctx) => {
  const favorites = readJsonFile(FAVORITES_FILE, []);
  ctx.body = {
    success: true,
    data: favorites
  };
});

router.post('/api/favorites', async (ctx) => {
  const { category, fromUnit, toUnit } = ctx.request.body;
  let favorites = readJsonFile(FAVORITES_FILE, []);
  
  const exists = favorites.find(f => 
    f.category === category && 
    f.fromUnit === fromUnit && 
    f.toUnit === toUnit
  );
  
  if (!exists) {
    favorites.unshift({
      id: Date.now(),
      category,
      fromUnit,
      toUnit,
      createdAt: Date.now()
    });
    
    favorites = favorites.slice(0, 20);
    writeJsonFile(FAVORITES_FILE, favorites);
  }
  
  ctx.body = {
    success: true,
    data: favorites
  };
});

router.delete('/api/favorites/:id', async (ctx) => {
  let favorites = readJsonFile(FAVORITES_FILE, []);
  const id = parseInt(ctx.params.id);
  
  favorites = favorites.filter(f => f.id !== id);
  writeJsonFile(FAVORITES_FILE, favorites);
  
  ctx.body = {
    success: true,
    data: favorites
  };
});

router.get('/api/history', async (ctx) => {
  const history = readJsonFile(HISTORY_FILE, []);
  ctx.body = {
    success: true,
    data: history
  };
});

router.post('/api/history', async (ctx) => {
  const { category, fromUnit, toUnit, fromValue, toValue } = ctx.request.body;
  let history = readJsonFile(HISTORY_FILE, []);
  
  history.unshift({
    id: Date.now(),
    category,
    fromUnit,
    toUnit,
    fromValue,
    toValue,
    createdAt: Date.now()
  });
  
  history = history.slice(0, 50);
  writeJsonFile(HISTORY_FILE, history);
  
  ctx.body = {
    success: true,
    data: history
  };
});

router.delete('/api/history', async (ctx) => {
  writeJsonFile(HISTORY_FILE, []);
  ctx.body = {
    success: true,
    data: []
  };
});

app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`单位换算工具后端服务运行在 http://localhost:${PORT}`);
});
