const Storage = {
    maxHistoryItems: 50,

    getSettings: function() {
        const saved = localStorage.getItem(CONFIG.storageKeys.settings);
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                return { ...CONFIG.defaultSettings, ...settings };
            } catch (e) {
                console.error('读取设置失败:', e);
            }
        }
        return { ...CONFIG.defaultSettings };
    },

    saveSettings: function(settings) {
        try {
            localStorage.setItem(CONFIG.storageKeys.settings, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('保存设置失败:', e);
            return false;
        }
    },

    restoreDefaultSettings: function() {
        localStorage.removeItem(CONFIG.storageKeys.settings);
        return { ...CONFIG.defaultSettings };
    },

    getHistory: function() {
        const saved = localStorage.getItem(CONFIG.storageKeys.history);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('读取历史记录失败:', e);
            }
        }
        return [];
    },

    addHistoryItem: function(gameData) {
        const history = this.getHistory();
        
        const item = {
            id: Utils.generateId(),
            timestamp: Date.now(),
            mode: gameData.mode,
            difficulty: gameData.difficulty,
            playerColor: gameData.playerColor,
            result: gameData.result,
            winner: gameData.winner,
            totalMoves: gameData.totalMoves,
            duration: gameData.duration,
            redCaptures: gameData.redCaptures,
            blackCaptures: gameData.blackCaptures,
            boardState: gameData.boardState,
            moveHistory: gameData.moveHistory
        };

        history.unshift(item);

        if (history.length > this.maxHistoryItems) {
            history.splice(this.maxHistoryItems);
        }

        try {
            localStorage.setItem(CONFIG.storageKeys.history, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('保存历史记录失败:', e);
            return false;
        }
    },

    updateHistoryItem: function(id, updates) {
        const history = this.getHistory();
        const index = history.findIndex(item => item.id === id);
        
        if (index !== -1) {
            history[index] = { ...history[index], ...updates, updatedAt: Date.now() };
            
            try {
                localStorage.setItem(CONFIG.storageKeys.history, JSON.stringify(history));
                return true;
            } catch (e) {
                console.error('更新历史记录失败:', e);
            }
        }
        return false;
    },

    removeHistoryItem: function(id) {
        const history = this.getHistory();
        const index = history.findIndex(item => item.id === id);
        
        if (index !== -1) {
            history.splice(index, 1);
            
            try {
                localStorage.setItem(CONFIG.storageKeys.history, JSON.stringify(history));
                return true;
            } catch (e) {
                console.error('删除历史记录失败:', e);
            }
        }
        return false;
    },

    clearHistory: function() {
        localStorage.removeItem(CONFIG.storageKeys.history);
    },

    getCurrentGame: function() {
        const saved = localStorage.getItem(CONFIG.storageKeys.currentGame);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('读取当前游戏失败:', e);
            }
        }
        return null;
    },

    saveCurrentGame: function(gameData) {
        try {
            const saveData = {
                timestamp: Date.now(),
                mode: gameData.mode,
                difficulty: gameData.difficulty,
                playerColor: gameData.playerColor,
                currentTurn: gameData.currentTurn,
                gameState: gameData.gameState,
                isPaused: gameData.isPaused,
                redTime: gameData.redTime,
                blackTime: gameData.blackTime,
                totalTime: gameData.totalTime,
                boardState: gameData.boardState
            };
            
            localStorage.setItem(CONFIG.storageKeys.currentGame, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('保存当前游戏失败:', e);
            return false;
        }
    },

    clearCurrentGame: function() {
        localStorage.removeItem(CONFIG.storageKeys.currentGame);
    },

    hasSavedGame: function() {
        return localStorage.getItem(CONFIG.storageKeys.currentGame) !== null;
    },

    checkStorageQuota: function() {
        try {
            const testKey = 'storage_test_' + Date.now();
            localStorage.setItem(testKey, '');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError' || 
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                return false;
            }
            return true;
        }
    },

    getStorageUsage: function() {
        let totalSize = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }

        return {
            bytes: totalSize,
            kilobytes: (totalSize / 1024).toFixed(2),
            megabytes: (totalSize / 1024 / 1024).toFixed(2)
        };
    },

    exportHistory: function() {
        const history = this.getHistory();
        return JSON.stringify(history, null, 2);
    },

    importHistory: function(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            
            if (!Array.isArray(imported)) {
                throw new Error('无效的历史记录格式');
            }

            const currentHistory = this.getHistory();
            const merged = [...imported, ...currentHistory];
            
            const uniqueMap = new Map();
            merged.forEach(item => {
                if (!uniqueMap.has(item.id)) {
                    uniqueMap.set(item.id, item);
                }
            });

            const result = Array.from(uniqueMap.values());
            result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            if (result.length > this.maxHistoryItems) {
                result.splice(this.maxHistoryItems);
            }

            localStorage.setItem(CONFIG.storageKeys.history, JSON.stringify(result));
            return { success: true, count: imported.length };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    downloadHistory: function() {
        const data = this.exportHistory();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `xiangqi-history-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    migrateLegacyData: function() {
        const legacyKeys = [
            'chess_game',
            'chess_settings',
            'game_history'
        ];

        let migrated = 0;

        legacyKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    
                    if (key === 'chess_settings') {
                        this.saveSettings(data);
                    } else if (key === 'game_history') {
                        if (Array.isArray(data)) {
                            data.forEach(item => this.addHistoryItem(item));
                        }
                    } else if (key === 'chess_game') {
                        this.saveCurrentGame(data);
                    }

                    localStorage.removeItem(key);
                    migrated++;
                } catch (e) {
                    console.error(`迁移数据失败 (${key}):`, e);
                }
            }
        });

        return migrated;
    },

    clearAll: function() {
        localStorage.removeItem(CONFIG.storageKeys.settings);
        localStorage.removeItem(CONFIG.storageKeys.history);
        localStorage.removeItem(CONFIG.storageKeys.currentGame);
    }
};

window.addEventListener('beforeunload', () => {
    if (typeof game !== 'undefined' && game && game.board) {
        const gameData = {
            mode: game.gameMode,
            difficulty: game.difficulty,
            playerColor: game.playerColor,
            currentTurn: game.currentTurn,
            gameState: game.gameState,
            isPaused: game.isPaused,
            redTime: game.redTime,
            blackTime: game.blackTime,
            totalTime: game.totalTime,
            boardState: game.board.getBoardState()
        };
        Storage.saveCurrentGame(gameData);
    }
});
