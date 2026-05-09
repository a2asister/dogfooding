const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const STYLES_FILE = path.join(DATA_DIR, 'styles.json');
const SCENES_FILE = path.join(DATA_DIR, 'scenes.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const GENERATED_FILE = path.join(DATA_DIR, 'generated.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STYLES_FILE)) {
    fs.writeFileSync(STYLES_FILE, JSON.stringify([
      { id: 'healing', name: '治愈', keywords: ['温暖', '宁静', '治愈', '温柔', '阳光', '惬意'] },
      { id: 'niche', name: '小众', keywords: ['独特', '小众', '个性', '不随波逐流', '真实', '自我'] },
      { id: 'premium', name: '高级', keywords: ['精致', '质感', '优雅', '品味', '低调', '奢华'] },
      { id: 'humor', name: '幽默', keywords: ['有趣', '搞怪', '欢乐', '轻松', '俏皮', '好笑'] },
      { id: 'literary', name: '文艺', keywords: ['诗意', '浪漫', '文艺', '唯美', '感性', '细腻'] },
      { id: 'energetic', name: '活力', keywords: ['元气', '活力', '青春', '热情', '开心', '积极'] },
      { id: 'minimalist', name: '极简', keywords: ['简约', '干净', '纯粹', '留白', '自然', '真实'] },
      { id: 'romantic', name: '浪漫', keywords: ['甜蜜', '浪漫', '心动', '爱情', '温柔', '美好'] }
    ], null, 2));
  }

  if (!fs.existsSync(SCENES_FILE)) {
    fs.writeFileSync(SCENES_FILE, JSON.stringify([
      { id: 'moments', name: '朋友圈', icon: '📱' },
      { id: 'xiaohongshu', name: '小红书', icon: '📕' },
      { id: 'video', name: '短视频', icon: '🎬' },
      { id: 'poster', name: '海报', icon: '🎨' },
      { id: 'essay', name: '随笔', icon: '✍️' },
      { id: 'birthday', name: '生日祝福', icon: '🎂' },
      { id: 'travel', name: '旅行', icon: '✈️' },
      { id: 'food', name: '美食', icon: '🍜' },
      { id: 'workout', name: '健身', icon: '💪' },
      { id: 'study', name: '学习', icon: '📚' }
    ], null, 2));
  }

  if (!fs.existsSync(TEMPLATES_FILE)) {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify([
      { id: 1, scene: 'moments', style: 'healing', content: '今天的阳光真好，像被温柔包裹着一样 ☀️', wordCount: 20 },
      { id: 2, scene: 'moments', style: 'healing', content: '生活需要慢一点，给自己多一点呼吸的空间 🌿', wordCount: 22 },
      { id: 3, scene: 'moments', style: 'healing', content: '一杯热茶，一本好书，这就是我想要的生活 🍵', wordCount: 21 },
      { id: 4, scene: 'moments', style: 'niche', content: '不迎合，不将就，做最真实的自己 ✨', wordCount: 18 },
      { id: 5, scene: 'moments', style: 'niche', content: '在这个喧嚣的世界里，保持一份独特的安静 🌙', wordCount: 24 },
      { id: 6, scene: 'moments', style: 'premium', content: '精致，是对生活最基本的尊重 🌹', wordCount: 16 },
      { id: 7, scene: 'moments', style: 'premium', content: '质感生活，从不将就开始 ✨', wordCount: 14 },
      { id: 8, scene: 'moments', style: 'humor', content: '今天的我，还是那个开心的小傻子 😄', wordCount: 17 },
      { id: 9, scene: 'moments', style: 'humor', content: '人生苦短，必须性感 💃', wordCount: 10 },
      { id: 10, scene: 'moments', style: 'literary', content: '岁月静好，现世安稳，这就是最美好的时光 🌸', wordCount: 22 },
      { id: 11, scene: 'moments', style: 'literary', content: '在时光的河流里，打捞起那些闪闪发光的记忆 📸', wordCount: 26 },
      { id: 12, scene: 'moments', style: 'energetic', content: '今天也要元气满满地向前冲！💪', wordCount: 15 },
      { id: 13, scene: 'moments', style: 'energetic', content: '保持热爱，奔赴山海 🌊', wordCount: 10 },
      { id: 14, scene: 'moments', style: 'minimalist', content: '少即是多，简单即美 🍃', wordCount: 10 },
      { id: 15, scene: 'moments', style: 'minimalist', content: '生活需要留白 🌾', wordCount: 8 },
      { id: 16, scene: 'moments', style: 'romantic', content: '遇见你的那一刻，我的世界都亮了 💫', wordCount: 18 },
      { id: 17, scene: 'moments', style: 'romantic', content: '喜欢你，是我做过最勇敢的事 ❤️', wordCount: 16 },

      { id: 18, scene: 'xiaohongshu', style: 'healing', content: '🌿 治愈系日常｜今天被生活温柔以待\n\n发现生活中的小确幸，其实幸福就在身边\n\n#治愈系 #生活记录 #慢生活', wordCount: 45 },
      { id: 19, scene: 'xiaohongshu', style: 'healing', content: '☕️ 宅家的松弛感｜一个人的下午茶时光\n\n偶尔也需要给自己放个假\n\n#居家生活 #下午茶 #松弛感', wordCount: 42 },
      { id: 20, scene: 'xiaohongshu', style: 'niche', content: '🎨 小众审美｜不被定义的美\n\n拒绝跟风，做自己的审美官\n\n#小众风格 #审美提升 #独特', wordCount: 40 },
      { id: 21, scene: 'xiaohongshu', style: 'premium', content: '✨ 质感生活｜从细节处体现品味\n\n精致，不是奢侈，而是一种生活态度\n\n#品质生活 #精致女孩 #生活仪式感', wordCount: 43 },
      { id: 22, scene: 'xiaohongshu', style: 'humor', content: '😂 日常搞笑｜今天又被自己蠢到了\n\n生活需要点笑料，不然太无聊了\n\n#搞笑日常 #快乐源泉 #今日份快乐', wordCount: 41 },
      { id: 23, scene: 'xiaohongshu', style: 'literary', content: '📝 文艺独白｜那些想说又没说出口的话\n\n文字是最好的表达方式\n\n#文艺风 #心情日记 #文字控', wordCount: 40 },

      { id: 24, scene: 'video', style: 'healing', content: '🌈 治愈vlog｜记录生活里的小美好\n\n每一个平凡的日子都值得被记录\n\n✨ 喜欢的话记得点赞关注哦~', wordCount: 44 },
      { id: 25, scene: 'video', style: 'energetic', content: '🔥 今天也是元气满满的一天！\n\n跟着节奏动起来，快乐就是这么简单\n\n💪 一起加油吧！', wordCount: 38 },
      { id: 26, scene: 'video', style: 'humor', content: '😂 挑战全网最搞笑的日常\n\n保证让你笑到停不下来\n\n🎬 喜欢的话双击关注哦~', wordCount: 36 },

      { id: 27, scene: 'poster', style: 'healing', content: '每一天都是新的开始\n\n保持热爱，保持期待\n\n. 生活值得被温柔以待 .', wordCount: 32 },
      { id: 28, scene: 'poster', style: 'premium', content: 'LESS IS MORE\n\n简约不简单\n\n. 质感人生 .', wordCount: 22 },
      { id: 29, scene: 'poster', style: 'romantic', content: '遇见你\n是我最美的意外\n\n. LOVE IS IN THE AIR .', wordCount: 20 },

      { id: 30, scene: 'essay', style: 'literary', content: '时光匆匆，岁月如歌。那些曾经以为念念不忘的事情，就在我们念念不忘的过程中，被我们遗忘了。\n\n但总有些东西，会在记忆深处，闪闪发光。\n\n也许这就是生命最美的样子——\n\n带着遗憾，却依然热爱。', wordCount: 95 },
      { id: 31, scene: 'essay', style: 'healing', content: '最近突然明白，幸福其实很简单。\n\n是清晨的第一缕阳光，是午后的一杯热茶，是傍晚的一阵微风。\n\n我们总是在追逐远方，却忽略了身边的美好。\n\n慢一点，再慢一点。\n\n生活，就在当下。', wordCount: 88 },

      { id: 32, scene: 'birthday', style: 'healing', content: '🎂 又长大一岁啦\n\n愿所有的美好都如期而至\n\n生日快乐，亲爱的自己 ❤️', wordCount: 30 },
      { id: 33, scene: 'birthday', style: 'energetic', content: '🎉 HAPPY BIRTHDAY!\n\n新的一岁，新的开始\n\n冲鸭！💪', wordCount: 25 },
      { id: 34, scene: 'birthday', style: 'romantic', content: '🌹 生日快乐\n\n感谢生命中有你\n\n未来的日子，一起走吧 ❤️', wordCount: 28 },

      { id: 35, scene: 'travel', style: 'healing', content: '✈️ 旅行的意义\n\n不是你去了多少地方\n而是那些让你心动的瞬间\n\n📍 在路上，遇见更好的自己', wordCount: 42 },
      { id: 36, scene: 'travel', style: 'energetic', content: '🌍 世界那么大，我想去看看\n\n背起行囊，说走就走\n\n出发！🚀', wordCount: 30 },
      { id: 37, scene: 'travel', style: 'literary', content: '📖 读万卷书，行万里路\n\n每一次出发，都是一次心灵的洗礼\n\n旅途愉快 🌿', wordCount: 35 },

      { id: 38, scene: 'food', style: 'healing', content: '🍜 美食是最好的治愈\n\n没有什么是一顿美食解决不了的\n\n如果有，那就两顿 😋', wordCount: 33 },
      { id: 39, scene: 'food', style: 'humor', content: '🍰 减肥是明天的事\n\n今天先吃饱再说\n\n毕竟，唯有美食不可辜负 😂', wordCount: 34 },
      { id: 40, scene: 'food', style: 'premium', content: '✨ 味蕾的盛宴\n\n每一口都是享受\n\n精致生活，从美食开始 🍷', wordCount: 30 },

      { id: 41, scene: 'workout', style: 'energetic', content: '💪 今天的汗水\n是明天的骄傲\n\n坚持就是胜利！🔥', wordCount: 24 },
      { id: 42, scene: 'workout', style: 'healing', content: '🏃‍♀️ 运动让我更快乐\n\n释放压力，放空自己\n\n运动后的感觉真的很棒 ✨', wordCount: 31 },

      { id: 43, scene: 'study', style: 'healing', content: '📚 学习是一种投资\n\n今天的努力\n是明天的底气\n\n加油！🌟', wordCount: 28 },
      { id: 44, scene: 'study', style: 'energetic', content: '📝 知识点+1\n\n今天也是热爱学习的一天\n\n冲鸭！💡', wordCount: 26 },
      { id: 45, scene: 'study', style: 'literary', content: '✍️ 书中自有黄金屋\n\n在文字的世界里\n遇见更好的自己 📖', wordCount: 28 }
    ], null, 2));
  }

  if (!fs.existsSync(GENERATED_FILE)) {
    fs.writeFileSync(GENERATED_FILE, JSON.stringify([], null, 2));
  }
}

ensureDataFiles();

function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

function generateCopy(topic, style, scene, wordCount, count) {
  const templates = readJsonFile(TEMPLATES_FILE);
  const styles = readJsonFile(STYLES_FILE);
  const scenes = readJsonFile(SCENES_FILE);

  const selectedStyle = styles.find(s => s.id === style) || styles[0];
  const selectedScene = scenes.find(s => s.id === scene) || scenes[0];

  const styleTemplates = templates.filter(t => t.style === style);
  const sceneTemplates = templates.filter(t => t.scene === scene);
  
  let candidates = [];
  if (styleTemplates.length > 0 && sceneTemplates.length > 0) {
    candidates = templates.filter(t => t.style === style && t.scene === scene);
  }
  if (candidates.length === 0) {
    candidates = styleTemplates.length > 0 ? styleTemplates : templates;
  }

  const results = [];
  const usedIds = new Set();

  for (let i = 0; i < count; i++) {
    let template;
    const availableCandidates = candidates.filter(t => !usedIds.has(t.id));
    
    if (availableCandidates.length > 0) {
      template = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
      usedIds.add(template.id);
    } else {
      template = candidates[Math.floor(Math.random() * candidates.length)];
    }

    let content = template.content;

    if (topic && topic.trim()) {
      const topicVariations = [
        `关于"${topic}"，${content.substring(0, 1).toLowerCase()}${content.substring(1)}`,
        `${topic}｜${content}`,
        `✨ ${topic}\n\n${content}`
      ];
      content = topicVariations[Math.floor(Math.random() * topicVariations.length)];
    }

    if (wordCount && wordCount > 0) {
      const currentLength = content.length;
      if (currentLength < wordCount) {
        const fillers = [
          '\n\n生活就是这样，简单而美好 🌸',
          '\n\n愿你被温柔以待 ❤️',
          '\n\n每一天都值得被记录 ✨',
          '\n\n保持热爱，奔赴山海 🌿'
        ];
        while (content.length < wordCount && fillers.length > 0) {
          const filler = fillers.shift();
          if (content.length + filler.length <= wordCount + 20) {
            content += filler;
          }
        }
      } else if (currentLength > wordCount + 30) {
        const sentences = content.split(/[。！？\n]/);
        let result = '';
        for (const sentence of sentences) {
          if (result.length + sentence.length <= wordCount + 10) {
            result += (result ? '。' : '') + sentence;
          } else {
            break;
          }
        }
        if (result) {
          content = result + '...';
        }
      }
    }

    results.push({
      id: Date.now() + i,
      content: content,
      style: selectedStyle.name,
      scene: selectedScene.name,
      wordCount: content.length,
      createdAt: new Date().toISOString()
    });
  }

  const generated = readJsonFile(GENERATED_FILE);
  generated.unshift(...results);
  writeJsonFile(GENERATED_FILE, generated.slice(0, 100));

  return results;
}

function polishCopy(content, style) {
  const styles = readJsonFile(STYLES_FILE);
  const selectedStyle = styles.find(s => s.id === style);
  const keywords = selectedStyle ? selectedStyle.keywords : [];

  const variations = [
    `${content}\n\n✨ ${keywords[Math.floor(Math.random() * keywords.length)]}`,
    `${keywords[Math.floor(Math.random() * keywords.length)]}｜${content}`,
    `${content}\n\n. 生活需要一点${keywords[Math.floor(Math.random() * keywords.length)]} .`,
    `「${keywords[Math.floor(Math.random() * keywords.length)]}」\n${content}`
  ];

  const polished = variations[Math.floor(Math.random() * variations.length)];

  return {
    original: content,
    polished: polished,
    wordCount: polished.length
  };
}

app.get('/api/styles', (req, res) => {
  const styles = readJsonFile(STYLES_FILE);
  res.json(styles);
});

app.get('/api/scenes', (req, res) => {
  const scenes = readJsonFile(SCENES_FILE);
  res.json(scenes);
});

app.post('/api/generate', (req, res) => {
  const { topic, style, scene, wordCount, count = 3 } = req.body;
  
  try {
    const results = generateCopy(topic, style, scene, wordCount, count);
    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({
      success: false,
      message: '生成失败，请重试'
    });
  }
});

app.post('/api/polish', (req, res) => {
  const { content, style } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: '请提供需要润色的文案'
    });
  }

  try {
    const result = polishCopy(content, style);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Polish error:', err);
    res.status(500).json({
      success: false,
      message: '润色失败，请重试'
    });
  }
});

app.get('/api/history', (req, res) => {
  const generated = readJsonFile(GENERATED_FILE);
  res.json({
    success: true,
    data: generated
  });
});

app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params;
  let generated = readJsonFile(GENERATED_FILE);
  generated = generated.filter(item => item.id !== parseInt(id));
  writeJsonFile(GENERATED_FILE, generated);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
