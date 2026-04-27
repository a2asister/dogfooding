// 游戏状态
const gameState = {
    currentPoem: null,
    filledBlanks: {},
    totalBlanks: 0,
    correctBlanks: 0,
    mistakes: 0,
    selectedWord: null,
    currentBlankIndex: 0,
    isPlaying: false
};

// DOM元素
const elements = {
    poemTitle: document.getElementById('poem-title'),
    poemAuthor: document.getElementById('poem-author'),
    poemContent: document.getElementById('poem-content'),
    wordBank: document.getElementById('word-bank'),
    currentLevel: document.getElementById('current-level'),
    gradeInfo: document.getElementById('grade-info'),
    encouragement: document.getElementById('encouragement'),
    hintBtn: document.getElementById('hint-btn'),
    resetBtn: document.getElementById('reset-btn'),
    infoBtn: document.getElementById('info-btn'),
    successModal: document.getElementById('success-modal'),
    infoModal: document.getElementById('info-modal'),
    errorToast: document.getElementById('error-toast'),
    errorMessage: document.getElementById('error-message'),
    starRating: document.getElementById('star-rating'),
    successMessage: document.getElementById('success-message'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    infoModalBtn: document.getElementById('info-modal-btn'),
    closeInfoBtn: document.getElementById('close-info-btn'),
    infoTitle: document.getElementById('info-title'),
    infoContent: document.getElementById('info-content'),
    celebrationAnimation: document.getElementById('celebration-animation')
};

// 鼓励语句
const encouragements = [
    "加油！你一定能行！",
    "太棒了！继续努力！",
    "你做得很好！",
    "真聪明！再试一个！",
    "加油！就快完成了！",
    "你是最棒的！"
];

// 通关鼓励语
const successMessages = [
    "太棒了！你完美地完成了这首诗词的填写！",
    "太厉害了！你是真正的诗词小达人！",
    "做得太好了！继续保持这种学习热情！",
    "非常棒！你对这首诗词的掌握非常好！",
    "太优秀了！你是我们的诗词小明星！"
];

// 错误提示语
const errorMessages = [
    "填错了，再试一次吧！",
    "不对哦，再想想看！",
    "这个字不对，换一个试试！",
    "别灰心，再试一次！",
    "没关系，继续加油！"
];

// 初始化游戏
function initGame() {
    gameState.currentPoem = getCurrentPoem();
    if (!gameState.currentPoem) {
        showAllLevelsCompleted();
        return;
    }
    
    resetGameState();
    renderPoem();
    renderWordBank();
    updateLevelInfo();
    updateEncouragement();
}

// 重置游戏状态
function resetGameState() {
    gameState.filledBlanks = {};
    gameState.totalBlanks = gameState.currentPoem.blanks.length;
    gameState.correctBlanks = 0;
    gameState.mistakes = 0;
    gameState.selectedWord = null;
    gameState.currentBlankIndex = 0;
}

// 渲染诗词
function renderPoem() {
    const poem = gameState.currentPoem;
    elements.poemTitle.textContent = poem.title;
    elements.poemAuthor.textContent = poem.author;
    
    elements.poemContent.innerHTML = '';
    
    // 创建诗词行
    poem.lines.forEach((line, lineIndex) => {
        const lineElement = document.createElement('div');
        lineElement.className = 'poem-line';
        
        // 检查当前行是否有填空
        const blanksInLine = poem.blanks.filter(blank => blank.lineIndex === lineIndex);
        
        if (blanksInLine.length === 0) {
            // 没有填空的行
            lineElement.textContent = line;
        } else {
            // 有填空的行，需要拆分
            let currentIndex = 0;
            const sortedBlanks = blanksInLine.sort((a, b) => a.charIndex - b.charIndex);
            
            sortedBlanks.forEach((blank, blankIndex) => {
                // 添加填空前的文字
                if (blank.charIndex > currentIndex) {
                    const textBefore = line.substring(currentIndex, blank.charIndex);
                    lineElement.appendChild(document.createTextNode(textBefore));
                }
                
                // 创建填空元素
                const blankElement = createBlankElement(blank, lineIndex, blankIndex);
                lineElement.appendChild(blankElement);
                
                currentIndex = blank.charIndex + 1;
            });
            
            // 添加填空后的文字
            if (currentIndex < line.length) {
                const textAfter = line.substring(currentIndex);
                lineElement.appendChild(document.createTextNode(textAfter));
            }
        }
        
        elements.poemContent.appendChild(lineElement);
    });
}

// 创建填空元素
function createBlankElement(blank, lineIndex, blankIndex) {
    const blankElement = document.createElement('span');
    blankElement.className = 'blanks';
    blankElement.dataset.lineIndex = lineIndex;
    blankElement.dataset.blankIndex = blankIndex;
    blankElement.dataset.correctChar = blank.correctChar;
    blankElement.dataset.blankId = `${lineIndex}-${blankIndex}`;
    
    // 添加拖放事件
    blankElement.addEventListener('dragover', handleDragOver);
    blankElement.addEventListener('dragleave', handleDragLeave);
    blankElement.addEventListener('drop', handleDrop);
    blankElement.addEventListener('click', handleBlankClick);
    
    return blankElement;
}

// 渲染汉字库
function renderWordBank() {
    const poem = gameState.currentPoem;
    elements.wordBank.innerHTML = '';
    
    // 收集所有正确的汉字
    const correctChars = poem.blanks.map(blank => blank.correctChar);
    
    // 收集一些干扰汉字（从诗词中随机选择）
    const allChars = poem.lines.join('').split('');
    const uniqueChars = [...new Set(allChars)];
    const distractors = uniqueChars.filter(char => !correctChars.includes(char));
    
    // 随机选择一些干扰字
    const numDistractors = Math.min(3, distractors.length);
    const selectedDistractors = [];
    for (let i = 0; i < numDistractors; i++) {
        if (distractors.length > 0) {
            const randomIndex = Math.floor(Math.random() * distractors.length);
            selectedDistractors.push(distractors.splice(randomIndex, 1)[0]);
        }
    }
    
    // 合并正确字和干扰字
    const allWords = [...correctChars, ...selectedDistractors];
    
    // 打乱顺序
    shuffleArray(allWords);
    
    // 创建汉字按钮
    allWords.forEach((char, index) => {
        const wordButton = document.createElement('button');
        wordButton.className = 'word-button';
        wordButton.textContent = char;
        wordButton.dataset.char = char;
        wordButton.dataset.index = index;
        wordButton.draggable = true;
        
        // 添加事件
        wordButton.addEventListener('click', handleWordClick);
        wordButton.addEventListener('dragstart', handleDragStart);
        wordButton.addEventListener('dragend', handleDragEnd);
        
        elements.wordBank.appendChild(wordButton);
    });
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 更新关卡信息
function updateLevelInfo() {
    const levelNumber = currentLevelIndex + 1;
    elements.currentLevel.textContent = `第 ${levelNumber} 关`;
    elements.gradeInfo.textContent = gameState.currentPoem.grade;
}

// 更新鼓励语
function updateEncouragement() {
    const randomIndex = Math.floor(Math.random() * encouragements.length);
    elements.encouragement.textContent = encouragements[randomIndex];
}

// 处理汉字按钮点击
function handleWordClick(event) {
    const button = event.target;
    if (button.classList.contains('used')) return;
    
    // 找到下一个空的填空位置
    const nextBlank = findNextEmptyBlank();
    if (!nextBlank) return;
    
    // 尝试填充汉字
    tryFillBlank(nextBlank, button);
}

// 处理填空位置点击
function handleBlankClick(event) {
    const blank = event.currentTarget;
    if (blank.classList.contains('has-character')) return;
    
    // 如果已经选中了汉字，就填充
    if (gameState.selectedWord) {
        tryFillBlank(blank, gameState.selectedWord);
        gameState.selectedWord = null;
        return;
    }
    
    // 高亮当前填空位置
    highlightBlank(blank);
}

// 处理拖拽开始
function handleDragStart(event) {
    const button = event.target;
    if (button.classList.contains('used')) {
        event.preventDefault();
        return;
    }
    
    button.classList.add('dragging');
    gameState.selectedWord = button;
    event.dataTransfer.setData('text/plain', button.dataset.char);
    event.dataTransfer.setData('index', button.dataset.index);
}

// 处理拖拽结束
function handleDragEnd(event) {
    const button = event.target;
    button.classList.remove('dragging');
    gameState.selectedWord = null;
}

// 处理拖拽经过
function handleDragOver(event) {
    event.preventDefault();
    const blank = event.currentTarget;
    if (!blank.classList.contains('has-character')) {
        blank.classList.add('highlight');
    }
}

// 处理拖拽离开
function handleDragLeave(event) {
    const blank = event.currentTarget;
    blank.classList.remove('highlight');
}

// 处理放置
function handleDrop(event) {
    event.preventDefault();
    const blank = event.currentTarget;
    blank.classList.remove('highlight');
    
    if (blank.classList.contains('has-character')) return;
    
    // 获取拖拽的汉字
    const char = event.dataTransfer.getData('text/plain');
    const index = event.dataTransfer.getData('index');
    
    // 找到对应的按钮
    const button = document.querySelector(`.word-button[data-index="${index}"]`);
    if (!button || button.classList.contains('used')) return;
    
    // 尝试填充汉字
    tryFillBlank(blank, button);
}

// 尝试填充汉字
function tryFillBlank(blank, button) {
    const blankId = blank.dataset.blankId;
    const correctChar = blank.dataset.correctChar;
    const selectedChar = button.dataset.char;
    
    // 检查是否正确
    if (selectedChar === correctChar) {
        // 正确
        fillBlank(blank, selectedChar, blankId);
        markButtonAsUsed(button);
        gameState.correctBlanks++;
        gameState.filledBlanks[blankId] = selectedChar;
        
        // 显示成功动画
        showSuccessAnimation(blank);
        
        // 检查是否完成
        checkLevelCompletion();
    } else {
        // 错误
        gameState.mistakes++;
        showError(blank, button);
    }
}

// 填充填空位置
function fillBlank(blank, char, blankId) {
    const charElement = document.createElement('span');
    charElement.className = 'character';
    charElement.textContent = char;
    blank.appendChild(charElement);
    blank.classList.add('has-character');
    blank.dataset.filledChar = char;
}

// 标记按钮为已使用
function markButtonAsUsed(button) {
    button.classList.add('used');
}

// 显示成功动画
function showSuccessAnimation(blank) {
    blank.classList.add('success-animation');
    setTimeout(() => {
        blank.classList.remove('success-animation');
    }, 600);
    
    // 更新鼓励语
    updateEncouragement();
}

// 显示错误
function showError(blank, button) {
    // 显示错误提示
    const randomIndex = Math.floor(Math.random() * errorMessages.length);
    elements.errorMessage.textContent = errorMessages[randomIndex];
    elements.errorToast.classList.remove('hidden');
    elements.errorToast.classList.add('active');
    
    // 添加错误动画
    blank.classList.add('error-animation');
    
    // 3秒后隐藏提示
    setTimeout(() => {
        elements.errorToast.classList.remove('active');
        setTimeout(() => {
            elements.errorToast.classList.add('hidden');
        }, 300);
        blank.classList.remove('error-animation');
    }, 2000);
}

// 找到下一个空的填空位置
function findNextEmptyBlank() {
    const blanks = document.querySelectorAll('.blanks:not(.has-character)');
    if (blanks.length === 0) return null;
    
    // 按顺序返回第一个空的填空位置
    return blanks[0];
}

// 高亮填空位置
function highlightBlank(blank) {
    // 移除所有高亮
    document.querySelectorAll('.blanks').forEach(b => {
        b.classList.remove('highlight');
    });
    
    // 添加高亮
    blank.classList.add('highlight');
    
    // 2秒后移除高亮
    setTimeout(() => {
        blank.classList.remove('highlight');
    }, 2000);
}

// 检查关卡是否完成
function checkLevelCompletion() {
    if (gameState.correctBlanks >= gameState.totalBlanks) {
        // 关卡完成
        setTimeout(() => {
            completeLevel();
        }, 500);
    }
}

// 完成关卡
function completeLevel() {
    // 播放诗词朗读
    playPoemAudio();
    
    // 显示背景动画
    showBackgroundAnimation();
    
    // 计算星级评分
    const stars = calculateStars();
    
    // 显示成功模态框
    showSuccessModal(stars);
}

// 计算星级评分
function calculateStars() {
    // 根据错误次数计算星级
    if (gameState.mistakes === 0) {
        return 3; // 3星 - 完美
    } else if (gameState.mistakes <= 2) {
        return 2; // 2星 - 很好
    } else {
        return 1; // 1星 - 不错
    }
}

// 显示成功模态框
function showSuccessModal(stars) {
    // 设置星级
    elements.starRating.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = 'star' + (i < stars ? ' filled' : '');
        star.textContent = '★';
        elements.starRating.appendChild(star);
        
        // 延迟显示动画
        if (i < stars) {
            setTimeout(() => {
                star.classList.add('filled');
            }, 300 * (i + 1));
        }
    }
    
    // 设置成功消息
    const randomIndex = Math.floor(Math.random() * successMessages.length);
    elements.successMessage.textContent = successMessages[randomIndex];
    
    // 创建庆祝动画
    createCelebrationAnimation();
    
    // 显示模态框
    elements.successModal.classList.remove('hidden');
    setTimeout(() => {
        elements.successModal.classList.add('active');
    }, 10);
    
    // 检查是否有下一关
    if (!hasNextLevel()) {
        elements.nextLevelBtn.textContent = '🏆 完成所有关卡';
    } else {
        elements.nextLevelBtn.textContent = '▶️ 下一关';
    }
}

// 创建庆祝动画
function createCelebrationAnimation() {
    elements.celebrationAnimation.innerHTML = '';
    
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        elements.celebrationAnimation.appendChild(confetti);
    }
}

// 播放诗词朗读
function playPoemAudio() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(gameState.currentPoem.audioText);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
    }
}

// 显示背景动画
function showBackgroundAnimation() {
    // 这里可以添加更复杂的背景动画
    // 简单实现：改变背景颜色
    const body = document.body;
    const originalBackground = body.style.background;
    
    // 随机选择一个渐变背景
    const backgrounds = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    body.style.background = randomBackground;
    
    // 5秒后恢复原背景
    setTimeout(() => {
        body.style.background = originalBackground;
    }, 5000);
}

// 显示诗词释义
function showPoemInfo() {
    const poem = gameState.currentPoem;
    
    // 设置标题
    elements.infoTitle.textContent = `${poem.title} - ${poem.author}`;
    
    // 设置内容
    elements.infoContent.innerHTML = `
        <h3>诗词原文</h3>
        <p>${poem.lines.join('<br>')}</p>
        
        <h3>诗词释义</h3>
        <p>${poem.explanation.content.replace(/\n/g, '<br>')}</p>
        
        <h3>作者简介</h3>
        <p>${poem.explanation.authorInfo}</p>
    `;
    
    // 显示模态框
    elements.infoModal.classList.remove('hidden');
    setTimeout(() => {
        elements.infoModal.classList.add('active');
    }, 10);
}

// 隐藏诗词释义模态框
function hideInfoModal() {
    elements.infoModal.classList.remove('active');
    setTimeout(() => {
        elements.infoModal.classList.add('hidden');
    }, 300);
}

// 隐藏成功模态框
function hideSuccessModal() {
    elements.successModal.classList.remove('active');
    setTimeout(() => {
        elements.successModal.classList.add('hidden');
    }, 300);
}

// 显示所有关卡完成
function showAllLevelsCompleted() {
    // 这里可以显示一个特殊的完成界面
    elements.poemTitle.textContent = '恭喜通关！';
    elements.poemAuthor.textContent = '你已完成所有关卡';
    elements.poemContent.innerHTML = `
        <div style="text-align: center; font-size: 1.5rem; line-height: 2;">
            <p>🎉 太棒了！</p>
            <p>你已经完成了所有古诗词闯关！</p>
            <p>你是真正的诗词小达人！</p>
        </div>
    `;
    
    elements.wordBank.innerHTML = '';
    elements.currentLevel.textContent = '恭喜通关';
    elements.gradeInfo.textContent = '全部完成';
    
    // 隐藏操作按钮
    document.querySelector('.action-buttons').style.display = 'none';
}

// 提示功能
function showHint() {
    // 找到第一个空的填空位置
    const nextBlank = findNextEmptyBlank();
    if (!nextBlank) return;
    
    // 高亮这个填空位置
    highlightBlank(nextBlank);
    
    // 显示提示信息
    const correctChar = nextBlank.dataset.correctChar;
    elements.encouragement.textContent = `提示：想想看，哪个字是"${correctChar}"呢？`;
    
    // 3秒后恢复正常鼓励语
    setTimeout(() => {
        updateEncouragement();
    }, 3000);
}

// 重置当前关卡
function resetCurrentLevel() {
    gameState.currentPoem = getCurrentPoem();
    if (!gameState.currentPoem) return;
    
    resetGameState();
    renderPoem();
    renderWordBank();
    updateEncouragement();
}

// 下一关
function goToNextLevel() {
    if (!hasNextLevel()) {
        // 没有下一关了
        hideSuccessModal();
        showAllLevelsCompleted();
        return;
    }
    
    // 获取下一关诗词
    const nextPoem = getNextPoem();
    if (!nextPoem) return;
    
    // 隐藏模态框
    hideSuccessModal();
    
    // 初始化新关卡
    initGame();
}

// 再玩一次
function playAgain() {
    hideSuccessModal();
    resetCurrentLevel();
}

// 事件监听器
function setupEventListeners() {
    // 提示按钮
    elements.hintBtn.addEventListener('click', showHint);
    
    // 重置按钮
    elements.resetBtn.addEventListener('click', resetCurrentLevel);
    
    // 诗词释义按钮
    elements.infoBtn.addEventListener('click', showPoemInfo);
    
    // 下一关按钮
    elements.nextLevelBtn.addEventListener('click', goToNextLevel);
    
    // 再玩一次按钮
    elements.playAgainBtn.addEventListener('click', playAgain);
    
    // 模态框中的诗词释义按钮
    elements.infoModalBtn.addEventListener('click', () => {
        hideSuccessModal();
        setTimeout(() => {
            showPoemInfo();
        }, 300);
    });
    
    // 关闭释义模态框
    elements.closeInfoBtn.addEventListener('click', hideInfoModal);
    
    // 点击模态框外部关闭
    elements.successModal.addEventListener('click', (event) => {
        if (event.target === elements.successModal) {
            hideSuccessModal();
        }
    });
    
    elements.infoModal.addEventListener('click', (event) => {
        if (event.target === elements.infoModal) {
            hideInfoModal();
        }
    });
    
    // 键盘事件
    document.addEventListener('keydown', (event) => {
        // ESC键关闭模态框
        if (event.key === 'Escape') {
            if (elements.successModal.classList.contains('active')) {
                hideSuccessModal();
            }
            if (elements.infoModal.classList.contains('active')) {
                hideInfoModal();
            }
        }
        
        // 数字键1-9选择汉字
        if (event.key >= '1' && event.key <= '9') {
            const index = parseInt(event.key) - 1;
            const button = document.querySelector(`.word-button[data-index="${index}"]`);
            if (button && !button.classList.contains('used')) {
                button.click();
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initGame();
});
