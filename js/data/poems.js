const poemsDatabase = [
    {
        id: 1,
        title: "咏鹅",
        author: "骆宾王",
        grade: "一年级上册",
        lines: [
            "鹅，鹅，鹅，",
            "曲项向天歌。",
            "白毛浮绿水，",
            "红掌拨清波。"
        ],
        blanks: [
            { lineIndex: 1, charIndex: 2, correctChar: "向" },
            { lineIndex: 2, charIndex: 3, correctChar: "绿" },
            { lineIndex: 3, charIndex: 3, correctChar: "清" }
        ],
        explanation: {
            content: `这首诗是唐代诗人骆宾王七岁时写的，描绘了白鹅在水中游泳的可爱姿态。

诗的意思是：
鹅呀，鹅呀，弯曲着脖子向着天空歌唱。
洁白的羽毛漂浮在碧绿的水面上，
红红的脚掌拨动着清清的水波。

这首诗通过对鹅的外形、动作和颜色的描写，展现了白鹅在水中嬉戏的生动画面，表达了诗人对鹅的喜爱之情。`,
            authorInfo: `骆宾王（约640年-约684年），唐代著名诗人，与王勃、杨炯、卢照邻合称"初唐四杰"。他从小就非常聪明，七岁时就能写出《咏鹅》这样的好诗，被称为"神童"。`
        },
        audioText: "鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。"
    },
    {
        id: 2,
        title: "画",
        author: "王维",
        grade: "一年级上册",
        lines: [
            "远看山有色，",
            "近听水无声。",
            "春去花还在，",
            "人来鸟不惊。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 2, correctChar: "山" },
            { lineIndex: 1, charIndex: 2, correctChar: "水" },
            { lineIndex: 2, charIndex: 2, correctChar: "花" },
            { lineIndex: 3, charIndex: 2, correctChar: "鸟" }
        ],
        explanation: {
            content: `这首诗是一首谜语诗，谜底就是"画"。诗人通过描绘画中的景物，展现了画作的逼真和美丽。

诗的意思是：
远远看去，山岭有青青的颜色；
走近一听，流水却没有声音。
春天过去了，花儿还在开放；
人走近了，鸟儿也不会受惊飞走。

这首诗通过对比现实中的景物和画中的景物，巧妙地写出了画的特点：画中的景物是静止的、永恒的，不会随着时间和环境的变化而改变。`,
            authorInfo: `王维（约701年-761年），唐代著名诗人、画家。他的诗和画都非常有名，被称为"诗中有画，画中有诗"。他擅长写山水田园诗，描绘自然景色，表达对大自然的热爱之情。`
        },
        audioText: "远看山有色，近听水无声。春去花还在，人来鸟不惊。"
    },
    {
        id: 3,
        title: "静夜思",
        author: "李白",
        grade: "一年级上册",
        lines: [
            "床前明月光，",
            "疑是地上霜。",
            "举头望明月，",
            "低头思故乡。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 2, correctChar: "明" },
            { lineIndex: 1, charIndex: 4, correctChar: "霜" },
            { lineIndex: 2, charIndex: 3, correctChar: "明" },
            { lineIndex: 3, charIndex: 3, correctChar: "故" }
        ],
        explanation: {
            content: `这首诗是唐代诗人李白的代表作之一，表达了诗人在寂静的夜晚思念家乡的情感。

诗的意思是：
床前洒满了明亮的月光，
我怀疑那是地上的白霜。
抬起头望着天上的明月，
低下头思念起远方的家乡。

这首诗通过简单朴素的语言，表达了深深的思乡之情。月光和白霜的比喻，以及抬头望月、低头思乡的动作描写，都非常生动形象，让人感同身受。`,
            authorInfo: `李白（701年-762年），唐代伟大的浪漫主义诗人，被后人称为"诗仙"。他的诗风格豪放、想象丰富，充满了对自由、对大自然的热爱。他一生游历了很多地方，写下了许多脍炙人口的诗篇。`
        },
        audioText: "床前明月光，疑是地上霜。举头望明月，低头思故乡。"
    },
    {
        id: 4,
        title: "春晓",
        author: "孟浩然",
        grade: "一年级下册",
        lines: [
            "春眠不觉晓，",
            "处处闻啼鸟。",
            "夜来风雨声，",
            "花落知多少。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 4, correctChar: "晓" },
            { lineIndex: 1, charIndex: 4, correctChar: "鸟" },
            { lineIndex: 2, charIndex: 2, correctChar: "风" },
            { lineIndex: 3, charIndex: 0, correctChar: "花" }
        ],
        explanation: {
            content: `这首诗是唐代诗人孟浩然的名作，描绘了春天早晨的景象，表达了诗人对春天的喜爱和对落花的惋惜之情。

诗的意思是：
春天的夜晚睡得很沉，不知不觉天已经亮了，
到处都能听到鸟儿欢快的叫声。
想起昨天夜里传来的风声雨声，
不知道有多少花朵被风吹落了。

这首诗通过对春天早晨的描写，展现了春天的生机和美丽，同时也表达了诗人对时光流逝、美好事物短暂的感慨。`,
            authorInfo: `孟浩然（689年-740年），唐代著名诗人，与王维并称"王孟"，是山水田园诗派的代表人物之一。他的诗风格清新自然，多描写山水田园和隐居生活，表达了对大自然的热爱和对自由生活的向往。`
        },
        audioText: "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。"
    },
    {
        id: 5,
        title: "村居",
        author: "高鼎",
        grade: "二年级下册",
        lines: [
            "草长莺飞二月天，",
            "拂堤杨柳醉春烟。",
            "儿童散学归来早，",
            "忙趁东风放纸鸢。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 2, correctChar: "莺" },
            { lineIndex: 1, charIndex: 2, correctChar: "杨" },
            { lineIndex: 2, charIndex: 4, correctChar: "归" },
            { lineIndex: 3, charIndex: 5, correctChar: "纸" }
        ],
        explanation: {
            content: `这首诗是清代诗人高鼎的作品，描绘了春天乡村的美丽景色和孩子们放风筝的欢乐情景。

诗的意思是：
农历二月，青草生长，黄莺飞舞，
杨柳的枝条轻拂着堤岸，仿佛陶醉在春天的烟雾里。
孩子们放学回家很早，
忙着趁着东风放起了风筝。

这首诗通过对春天景色和孩子们活动的描写，展现了春天的生机和活力，表达了诗人对春天的喜爱和对乡村生活的向往。`,
            authorInfo: `高鼎，清代后期诗人，生活在鸦片战争之后。他的诗风格清新自然，多描写自然景物和乡村生活。《村居》是他最著名的作品，这首诗描绘了春天乡村的美丽景色和孩子们放风筝的欢乐情景，深受人们喜爱。`
        },
        audioText: "草长莺飞二月天，拂堤杨柳醉春烟。儿童散学归来早，忙趁东风放纸鸢。"
    },
    {
        id: 6,
        title: "登鹳雀楼",
        author: "王之涣",
        grade: "二年级上册",
        lines: [
            "白日依山尽，",
            "黄河入海流。",
            "欲穷千里目，",
            "更上一层楼。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 2, correctChar: "依" },
            { lineIndex: 1, charIndex: 1, correctChar: "河" },
            { lineIndex: 2, charIndex: 2, correctChar: "千" },
            { lineIndex: 3, charIndex: 1, correctChar: "上" }
        ],
        explanation: {
            content: `这首诗是唐代诗人王之涣的名作，通过描写登上鹳雀楼所见的壮丽景色，表达了诗人积极向上、不断进取的精神。

诗的意思是：
太阳靠着群山慢慢落下，
滔滔黄河向着大海奔流。
想要看到千里之外的景色，
就要再登上更高的一层楼。

这首诗的后两句"欲穷千里目，更上一层楼"是千古名句，告诉我们只有站得高才能看得远，只有不断努力、不断进取，才能达到更高的目标。`,
            authorInfo: `王之涣（688年-742年），唐代著名诗人。他的诗风格豪放、气势磅礴，多描写边塞风光和军旅生活。他的《登鹳雀楼》和《凉州词》都是千古传诵的名篇，展现了他非凡的才华和豪迈的气概。`
        },
        audioText: "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。"
    },
    {
        id: 7,
        title: "望庐山瀑布",
        author: "李白",
        grade: "二年级上册",
        lines: [
            "日照香炉生紫烟，",
            "遥看瀑布挂前川。",
            "飞流直下三千尺，",
            "疑是银河落九天。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 5, correctChar: "紫" },
            { lineIndex: 1, charIndex: 2, correctChar: "瀑" },
            { lineIndex: 2, charIndex: 4, correctChar: "三" },
            { lineIndex: 3, charIndex: 2, correctChar: "银" }
        ],
        explanation: {
            content: `这首诗是唐代诗人李白的代表作之一，描绘了庐山瀑布的壮丽景色，展现了诗人丰富的想象力和豪迈的气概。

诗的意思是：
阳光照在香炉峰上，升起了紫色的烟雾，
远远望去，瀑布就像一条白色的丝带挂在山前。
水流从三千尺的高处飞泻而下，
让人怀疑那是银河从九天之上落了下来。

这首诗通过丰富的想象和夸张的手法，将庐山瀑布的雄伟壮观描绘得淋漓尽致，让人仿佛身临其境，感受到了大自然的神奇和美丽。`,
            authorInfo: `李白（701年-762年），唐代伟大的浪漫主义诗人，被后人称为"诗仙"。他的诗风格豪放、想象丰富，充满了对自由、对大自然的热爱。他一生游历了很多名山大川，写下了许多描绘自然景色的壮丽诗篇。`
        },
        audioText: "日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。"
    },
    {
        id: 8,
        title: "江雪",
        author: "柳宗元",
        grade: "二年级上册",
        lines: [
            "千山鸟飞绝，",
            "万径人踪灭。",
            "孤舟蓑笠翁，",
            "独钓寒江雪。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 2, correctChar: "鸟" },
            { lineIndex: 1, charIndex: 1, correctChar: "径" },
            { lineIndex: 2, charIndex: 2, correctChar: "蓑" },
            { lineIndex: 3, charIndex: 2, correctChar: "寒" }
        ],
        explanation: {
            content: `这首诗是唐代诗人柳宗元的名作，描绘了冬日江边的孤寂景象，表达了诗人孤独、清高的心境。

诗的意思是：
所有的山上，鸟儿都已经飞走了，
所有的路上，都看不到人的踪迹。
只有一条孤独的小船，船上坐着一位披着蓑衣、戴着斗笠的老翁，
独自在寒冷的江面上，冒着大雪钓鱼。

这首诗通过对冬日雪景的描写，营造了一种孤寂、冷清的氛围，同时也表现了诗人在困境中依然保持清高、不屈不挠的精神。`,
            authorInfo: `柳宗元（773年-819年），唐代著名文学家、思想家，唐宋八大家之一。他的诗风格清冷、幽峭，多描写自然景物和抒发个人情感。他的散文也非常有名，与韩愈并称"韩柳"，是唐代古文运动的倡导者之一。`
        },
        audioText: "千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。"
    },
    {
        id: 9,
        title: "望天门山",
        author: "李白",
        grade: "三年级上册",
        lines: [
            "天门中断楚江开，",
            "碧水东流至此回。",
            "两岸青山相对出，",
            "孤帆一片日边来。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 5, correctChar: "江" },
            { lineIndex: 1, charIndex: 1, correctChar: "水" },
            { lineIndex: 2, charIndex: 5, correctChar: "对" },
            { lineIndex: 3, charIndex: 4, correctChar: "日" }
        ],
        explanation: {
            content: `这首诗是唐代诗人李白的作品，描绘了天门山的雄伟景色和长江的壮丽气势，表达了诗人对大自然的热爱之情。

诗的意思是：
天门山从中间断开，楚江奔腾而过，
碧绿的江水向东流去，在这里回旋。
两岸的青山相对耸立，仿佛迎面而来，
一片孤独的帆船，从太阳升起的地方驶来。

这首诗通过对天门山和长江的描写，展现了大自然的雄伟壮观，同时也表现了诗人开阔的胸襟和豪迈的气概。`,
            authorInfo: `李白（701年-762年），唐代伟大的浪漫主义诗人，被后人称为"诗仙"。他的诗风格豪放、想象丰富，充满了对自由、对大自然的热爱。他一生游历了很多名山大川，写下了许多描绘自然景色的壮丽诗篇。`
        },
        audioText: "天门中断楚江开，碧水东流至此回。两岸青山相对出，孤帆一片日边来。"
    },
    {
        id: 10,
        title: "饮湖上初晴后雨",
        author: "苏轼",
        grade: "三年级上册",
        lines: [
            "水光潋滟晴方好，",
            "山色空蒙雨亦奇。",
            "欲把西湖比西子，",
            "淡妆浓抹总相宜。"
        ],
        blanks: [
            { lineIndex: 0, charIndex: 2, correctChar: "潋" },
            { lineIndex: 1, charIndex: 3, correctChar: "蒙" },
            { lineIndex: 2, charIndex: 5, correctChar: "西" },
            { lineIndex: 3, charIndex: 2, correctChar: "浓" }
        ],
        explanation: {
            content: `这首诗是宋代诗人苏轼的名作，描绘了西湖在晴天和雨天的不同景色，表达了诗人对西湖的喜爱之情。

诗的意思是：
晴天时，西湖波光粼粼，景色正好；
雨天时，西湖山色朦胧，也是一番奇妙的景象。
想要把西湖比作美女西施，
无论是淡妆还是浓妆，都非常合适。

这首诗通过巧妙的比喻，将西湖的美丽描绘得淋漓尽致，同时也表现了诗人对西湖的喜爱和赞美之情。`,
            authorInfo: `苏轼（1037年-1101年），宋代著名文学家、书画家，唐宋八大家之一。他的诗风格豪放、清新自然，多描写自然景物和抒发个人情感。他的词也非常有名，开创了豪放词派，对后世影响深远。`
        },
        audioText: "水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。"
    }
];

// 当前关卡索引
let currentLevelIndex = 0;

// 获取当前诗词
function getCurrentPoem() {
    return poemsDatabase[currentLevelIndex];
}

// 获取下一关诗词
function getNextPoem() {
    if (currentLevelIndex < poemsDatabase.length - 1) {
        currentLevelIndex++;
        return getCurrentPoem();
    }
    return null;
}

// 重置关卡
function resetLevel() {
    currentLevelIndex = 0;
}

// 检查是否还有下一关
function hasNextLevel() {
    return currentLevelIndex < poemsDatabase.length - 1;
}
