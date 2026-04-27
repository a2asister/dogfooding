const CONFIG = {
    // 棋盘配置
    board: {
        rows: 10,
        cols: 9,
        cellSize: 60,
        boardPadding: 30
    },

    // 棋子类型
    pieceTypes: {
        GENERAL: 'general',
        ADVISOR: 'advisor',
        ELEPHANT: 'elephant',
        HORSE: 'horse',
        CHARIOT: 'chariot',
        CANNON: 'cannon',
        SOLDIER: 'soldier'
    },

    // 棋子名称（红方）
    redPieces: {
        general: '帅',
        advisor: '仕',
        elephant: '相',
        horse: '马',
        chariot: '车',
        cannon: '炮',
        soldier: '兵'
    },

    // 棋子名称（黑方）
    blackPieces: {
        general: '将',
        advisor: '士',
        elephant: '象',
        horse: '马',
        chariot: '车',
        cannon: '炮',
        soldier: '卒'
    },

    // 初始布局
    initialLayout: [
        { row: 0, col: 0, type: 'chariot', color: 'black' },
        { row: 0, col: 1, type: 'horse', color: 'black' },
        { row: 0, col: 2, type: 'elephant', color: 'black' },
        { row: 0, col: 3, type: 'advisor', color: 'black' },
        { row: 0, col: 4, type: 'general', color: 'black' },
        { row: 0, col: 5, type: 'advisor', color: 'black' },
        { row: 0, col: 6, type: 'elephant', color: 'black' },
        { row: 0, col: 7, type: 'horse', color: 'black' },
        { row: 0, col: 8, type: 'chariot', color: 'black' },
        { row: 2, col: 1, type: 'cannon', color: 'black' },
        { row: 2, col: 7, type: 'cannon', color: 'black' },
        { row: 3, col: 0, type: 'soldier', color: 'black' },
        { row: 3, col: 2, type: 'soldier', color: 'black' },
        { row: 3, col: 4, type: 'soldier', color: 'black' },
        { row: 3, col: 6, type: 'soldier', color: 'black' },
        { row: 3, col: 8, type: 'soldier', color: 'black' },
        { row: 9, col: 0, type: 'chariot', color: 'red' },
        { row: 9, col: 1, type: 'horse', color: 'red' },
        { row: 9, col: 2, type: 'elephant', color: 'red' },
        { row: 9, col: 3, type: 'advisor', color: 'red' },
        { row: 9, col: 4, type: 'general', color: 'red' },
        { row: 9, col: 5, type: 'advisor', color: 'red' },
        { row: 9, col: 6, type: 'elephant', color: 'red' },
        { row: 9, col: 7, type: 'horse', color: 'red' },
        { row: 9, col: 8, type: 'chariot', color: 'red' },
        { row: 7, col: 1, type: 'cannon', color: 'red' },
        { row: 7, col: 7, type: 'cannon', color: 'red' },
        { row: 6, col: 0, type: 'soldier', color: 'red' },
        { row: 6, col: 2, type: 'soldier', color: 'red' },
        { row: 6, col: 4, type: 'soldier', color: 'red' },
        { row: 6, col: 6, type: 'soldier', color: 'red' },
        { row: 6, col: 8, type: 'soldier', color: 'red' }
    ],

    // AI配置
    ai: {
        searchDepth: {
            easy: 1,
            normal: 2,
            hard: 3
        },
        moveTime: {
            easy: 500,
            normal: 1000,
            hard: 2000
        }
    },

    // 游戏设置默认值
    defaultSettings: {
        theme: 'classic',
        pieceStyle: 'traditional',
        scale: 100,
        timerEnabled: true,
        moveTimeLimit: 0,
        totalTimeLimit: 0,
        soundEnabled: true,
        moveAnimation: true,
        captureAnimation: true,
        volume: 70,
        operationMode: 'both',
        showValidMoves: true,
        showThreats: true,
        accidentPrevention: true
    },

    // 存储键名
    storageKeys: {
        settings: 'xiangqi_settings',
        history: 'xiangqi_history',
        currentGame: 'xiangqi_current'
    },

    // 消息类型
    messageTypes: {
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error'
    },

    // 游戏状态
    gameStates: {
        IDLE: 'idle',
        PLAYING: 'playing',
        PAUSED: 'paused',
        CHECKMATE: 'checkmate',
        STALEMATE: 'stalemate',
        DRAW: 'draw',
        RESIGNED: 'resigned'
    }
};
