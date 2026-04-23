const questions = [
    {
        id: 1,
        text: "当你参加聚会时，你通常会：",
        options: [
            { text: "主动与陌生人交谈，成为焦点", scores: { A: 3, B: 1, C: 2, D: 1 } },
            { text: "先观察，找到合适的人才加入对话", scores: { A: 1, B: 2, C: 3, D: 1 } },
            { text: "待在角落，更喜欢一对一交流", scores: { A: 1, B: 2, C: 1, D: 3 } },
            { text: "看心情，有时候外向有时候安静", scores: { A: 2, B: 3, C: 2, D: 2 } }
        ]
    },
    {
        id: 2,
        text: "做决策时，你更倾向于：",
        options: [
            { text: "凭直觉快速决定", scores: { A: 2, B: 1, C: 1, D: 3 } },
            { text: "仔细分析所有可能性", scores: { A: 1, B: 3, C: 2, D: 1 } },
            { text: "参考他人意见", scores: { A: 1, B: 1, C: 3, D: 2 } },
            { text: "拖延，让事情自然发展", scores: { A: 2, B: 1, C: 2, D: 3 } }
        ]
    },
    {
        id: 3,
        text: "你的房间通常是：",
        options: [
            { text: "井井有条，每件东西都有固定位置", scores: { A: 1, B: 3, C: 1, D: 1 } },
            { text: "有点乱，但我知道东西在哪", scores: { A: 2, B: 2, C: 2, D: 3 } },
            { text: "看起来乱，其实有自己的系统", scores: { A: 1, B: 2, C: 3, D: 2 } },
            { text: "经常整理，也经常变乱", scores: { A: 2, B: 3, C: 1, D: 2 } }
        ]
    },
    {
        id: 4,
        text: "面对压力时，你会：",
        options: [
            { text: "更加努力工作，直面挑战", scores: { A: 3, B: 1, C: 1, D: 2 } },
            { text: "需要独处时间来恢复", scores: { A: 1, B: 2, C: 3, D: 1 } },
            { text: "找朋友倾诉，寻求支持", scores: { A: 2, B: 1, C: 1, D: 3 } },
            { text: "有时候积极应对，有时候逃避", scores: { A: 2, B: 2, C: 2, D: 2 } }
        ]
    },
    {
        id: 5,
        text: "你对未来的看法是：",
        options: [
            { text: "充满期待，计划满满", scores: { A: 3, B: 1, C: 1, D: 1 } },
            { text: "走一步看一步", scores: { A: 1, B: 2, C: 2, D: 3 } },
            { text: "比较务实，做好最坏打算", scores: { A: 1, B: 3, C: 1, D: 1 } },
            { text: "心情好就乐观，心情不好就悲观", scores: { A: 2, B: 1, C: 3, D: 2 } }
        ]
    },
    {
        id: 6,
        text: "在团队中，你更像是：",
        options: [
            { text: "领导者，带动大家前进", scores: { A: 3, B: 1, C: 1, D: 1 } },
            { text: "执行者，认真完成任务", scores: { A: 1, B: 3, C: 2, D: 1 } },
            { text: "调和者，让团队和谐", scores: { A: 1, B: 1, C: 3, D: 2 } },
            { text: "创意者，提供新想法", scores: { A: 2, B: 1, C: 1, D: 3 } }
        ]
    },
    {
        id: 7,
        text: "你的社交方式是：",
        options: [
            { text: "朋友遍天下，社交圈很广", scores: { A: 3, B: 1, C: 1, D: 2 } },
            { text: "几个真心好友，不追求数量", scores: { A: 1, B: 2, C: 3, D: 1 } },
            { text: "根据场合切换，工作和生活分开", scores: { A: 2, B: 3, C: 2, D: 1 } },
            { text: "有时候喜欢热闹，有时候喜欢安静", scores: { A: 2, B: 1, C: 2, D: 3 } }
        ]
    },
    {
        id: 8,
        text: "面对批评时，你会：",
        options: [
            { text: "据理力争，捍卫自己", scores: { A: 3, B: 1, C: 1, D: 2 } },
            { text: "认真反思，有则改之", scores: { A: 1, B: 3, C: 1, D: 1 } },
            { text: "感到受伤，但默默承受", scores: { A: 1, B: 1, C: 3, D: 1 } },
            { text: "有时候无所谓，有时候很在意", scores: { A: 2, B: 2, C: 2, D: 3 } }
        ]
    },
    {
        id: 9,
        text: "你的工作/学习风格是：",
        options: [
            { text: "效率优先，快速完成", scores: { A: 3, B: 1, C: 1, D: 1 } },
            { text: "追求完美，注重细节", scores: { A: 1, B: 3, C: 1, D: 1 } },
            { text: "需要团队合作，互相讨论", scores: { A: 1, B: 1, C: 3, D: 2 } },
            { text: "灵感来了效率高，否则拖延", scores: { A: 1, B: 1, C: 1, D: 3 } }
        ]
    },
    {
        id: 10,
        text: "你认为最了解你的人是：",
        options: [
            { text: "我自己", scores: { A: 1, B: 2, C: 1, D: 3 } },
            { text: "最好的朋友", scores: { A: 1, B: 1, C: 3, D: 2 } },
            { text: "家人", scores: { A: 2, B: 1, C: 3, D: 1 } },
            { text: "不同的人了解不同的我", scores: { A: 2, B: 2, C: 2, D: 3 } }
        ]
    }
];

const personalityTypes = {
    A: {
        name: "主导型人格",
        icon: "👑",
        description: "你内心住着一个强大的主导者！你自信、果断，喜欢掌控局面。在团队中你往往是领导者，善于快速决策并带领他人前进。你的能量来自于达成目标和克服挑战。",
        traits: ["自信果断", "领导力强", "目标导向", "行动力强", "敢于挑战"]
    },
    B: {
        name: "完美型人格",
        icon: "🔍",
        description: "你内心有一个追求完美的分析师！你做事认真细致，注重细节，喜欢提前计划。你对自己和他人都有较高的标准，追求卓越是你的座右铭。你的理性思维让你在复杂情况下也能保持冷静。",
        traits: ["严谨认真", "追求完美", "理性分析", "计划性强", "注重细节"]
    },
    C: {
        name: "和谐型人格",
        icon: "🕊️",
        description: "你内心有一个渴望和谐的和平使者！你善于理解他人，富有同理心，总是努力维持关系的和谐。你重视团队合作，避免冲突，是朋友圈中的粘合剂。你的温柔和体贴让周围的人感到温暖。",
        traits: ["善解人意", "重视和谐", "富有同理心", "团队合作", "体贴温柔"]
    },
    D: {
        name: "多变型人格",
        icon: "🎭",
        description: "你是一个真正的多重人格拥有者！你的内心世界丰富多彩，不同的情境下会展现出不同的侧面。你适应能力强，能够在不同的角色间灵活切换。你的多变让你充满魅力，也让生活充满惊喜！",
        traits: ["适应力强", "灵活多变", "充满创意", "魅力十足", "难以预测"]
    }
};

let currentQuestion = 0;
let scores = { A: 0, B: 0, C: 0, D: 0 };

// DOM 元素
const welcomePage = document.getElementById('welcome-page');
const questionPage = document.getElementById('question-page');
const resultPage = document.getElementById('result-page');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const progressBar = document.getElementById('progress');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const personalityIcon = document.getElementById('personality-icon');
const personalityType = document.getElementById('personality-type');
const personalityDesc = document.getElementById('personality-desc');
const traitsContainer = document.getElementById('traits-container');

// 初始化
totalQuestionsSpan.textContent = questions.length;

// 显示指定页面
function showPage(pageElement) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    pageElement.classList.add('active');
}

// 开始测试
startBtn.addEventListener('click', () => {
    currentQuestion = 0;
    scores = { A: 0, B: 0, C: 0, D: 0 };
    loadQuestion();
    showPage(questionPage);
});

// 加载问题
function loadQuestion() {
    const question = questions[currentQuestion];
    
    // 更新进度
    const progress = ((currentQuestion) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    currentQuestionSpan.textContent = currentQuestion + 1;
    
    // 更新问题文本
    questionText.textContent = question.text;
    
    // 清空选项
    optionsContainer.innerHTML = '';
    
    // 添加选项
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.text;
        button.addEventListener('click', () => selectOption(option));
        optionsContainer.appendChild(button);
    });
}

// 选择选项
function selectOption(option) {
    // 累加分数
    Object.keys(option.scores).forEach(key => {
        scores[key] += option.scores[key];
    });
    
    // 下一个问题或显示结果
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

// 显示结果
function showResult() {
    // 找出得分最高的人格类型
    let maxScore = -1;
    let maxType = 'A';
    
    Object.keys(scores).forEach(type => {
        if (scores[type] > maxScore) {
            maxScore = scores[type];
            maxType = type;
        }
    });
    
    const result = personalityTypes[maxType];
    
    // 更新结果页面
    personalityIcon.textContent = result.icon;
    personalityType.textContent = result.name;
    personalityDesc.textContent = result.description;
    
    // 添加特质标签
    traitsContainer.innerHTML = '';
    result.traits.forEach(trait => {
        const span = document.createElement('span');
        span.className = 'trait';
        span.textContent = trait;
        traitsContainer.appendChild(span);
    });
    
    // 显示结果页面
    showPage(resultPage);
}

// 重新测试
restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    scores = { A: 0, B: 0, C: 0, D: 0 };
    showPage(welcomePage);
});

// 分享结果
shareBtn.addEventListener('click', () => {
    const shareText = `我刚刚完成了多重人格测试，结果是：${personalityType.textContent}！快来试试吧！`;
    
    if (navigator.share) {
        navigator.share({
            title: '多重人格测试',
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.log('分享失败:', err);
        });
    } else {
        // 如果不支持原生分享，复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('分享内容已复制到剪贴板！');
            }).catch(() => {
                alert('请手动复制分享内容：\n' + shareText);
            });
        } else {
            alert('请手动复制分享内容：\n' + shareText);
        }
    }
});
