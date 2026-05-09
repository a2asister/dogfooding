const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 8765;

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
const quotesFile = path.join(dataDir, 'quotes.json');
const favoritesFile = path.join(dataDir, 'favorites.json');

const defaultQuotes = {
  情感: [
    { id: 1, text: "心若向阳，无畏悲伤。", author: "佚名" },
    { id: 2, text: "每一个不曾起舞的日子，都是对生命的辜负。", author: "尼采" },
    { id: 3, text: "愿你被这个世界温柔以待。", author: "佚名" },
    { id: 4, text: "生活不止眼前的苟且，还有诗和远方的田野。", author: "高晓松" },
    { id: 5, text: "温柔是世间的宝藏，而你是温柔本身。", author: "佚名" }
  ],
  励志: [
    { id: 6, text: "星光不问赶路人，时光不负有心人。", author: "佚名" },
    { id: 7, text: "你的努力，终将成为别人的望尘莫及。", author: "佚名" },
    { id: 8, text: "把每一天当作生命中最后一天去生活。", author: "史蒂夫·乔布斯" },
    { id: 9, text: "成功不是终点，失败也不是终结，唯有继续前进的勇气才是最重要的。", author: "丘吉尔" },
    { id: 10, text: "梦想还是要有的，万一实现了呢。", author: "马云" }
  ],
  文艺: [
    { id: 11, text: "山河远阔，人间烟火，无一是你，无一不是你。", author: "佚名" },
    { id: 12, text: "愿岁月可回首，且以深情共白头。", author: "佚名" },
    { id: 13, text: "人生若只如初见，何事秋风悲画扇。", author: "纳兰性德" },
    { id: 14, text: "我见青山多妩媚，料青山见我应如是。", author: "辛弃疾" },
    { id: 15, text: "春风十里不如你。", author: "佚名" }
  ],
  哲理: [
    { id: 16, text: "生活不是等待风暴过去，而是学会在雨中跳舞。", author: "维维安·格林" },
    { id: 17, text: "人生就像一盒巧克力，你永远不知道下一块是什么味道。", author: "阿甘正传" },
    { id: 18, text: "万物皆有裂痕，那是光照进来的地方。", author: "莱昂纳德·科恩" },
    { id: 19, text: "你不能改变风向，但你可以调整船帆。", author: "佚名" },
    { id: 20, text: "生命不是要超越别人，而是要超越自己。", author: "佚名" }
  ]
};

async function initData() {
  await fs.ensureDir(dataDir);
  
  if (!(await fs.pathExists(quotesFile))) {
    await fs.writeJson(quotesFile, defaultQuotes);
  }
  
  if (!(await fs.pathExists(favoritesFile))) {
    await fs.writeJson(favoritesFile, { 情感: [], 励志: [], 文艺: [], 哲理: [] });
  }
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

app.get('/api/quote/random', async (req, res) => {
  try {
    const quotes = await fs.readJson(quotesFile);
    const categories = Object.keys(quotes);
    const category = getRandomItem(categories);
    const quote = getRandomItem(quotes[category]);
    res.json({ ...quote, category });
  } catch (error) {
    res.status(500).json({ error: '获取语录失败' });
  }
});

app.get('/api/quote/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const quotes = await fs.readJson(quotesFile);
    if (!quotes[category]) {
      return res.status(404).json({ error: '分类不存在' });
    }
    const quote = getRandomItem(quotes[category]);
    res.json({ ...quote, category });
  } catch (error) {
    res.status(500).json({ error: '获取语录失败' });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { quote, category } = req.body;
    const favorites = await fs.readJson(favoritesFile);
    
    if (!favorites[category]) {
      favorites[category] = [];
    }
    
    const exists = favorites[category].some(f => f.id === quote.id);
    if (!exists) {
      favorites[category].push(quote);
      await fs.writeJson(favoritesFile, favorites);
    }
    
    res.json({ success: true, message: '收藏成功' });
  } catch (error) {
    res.status(500).json({ error: '收藏失败' });
  }
});

app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await fs.readJson(favoritesFile);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: '获取收藏失败' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.json([]);
    }
    
    const quotes = await fs.readJson(quotesFile);
    const results = [];
    
    for (const [category, categoryQuotes] of Object.entries(quotes)) {
      const matched = categoryQuotes.filter(
        q => q.text.includes(keyword) || q.author.includes(keyword)
      );
      results.push(...matched.map(q => ({ ...q, category })));
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: '搜索失败' });
  }
});

app.get('/api/categories', (req, res) => {
  res.json(['情感', '励志', '文艺', '哲理']);
});

async function startServer() {
  await initData();
  app.listen(PORT, () => {
    console.log(`治愈语录后端服务运行在端口 ${PORT}`);
  });
}

startServer();
