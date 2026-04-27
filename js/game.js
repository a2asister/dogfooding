const game = {
    board: null,
    gameMode: 'pvp',
    difficulty: 'normal',
    playerColor: 'red',
    currentTurn: 'red',
    gameState: 'idle',
    isPaused: false,
    selectedPiece: null,
    settings: null,
    timerInterval: null,
    redTime: 0,
    blackTime: 0,
    totalTime: 0,
    lastMove: null,
    currentHistoryId: null,
    previousScreen: 'menu',
    isReviewMode: false,
    autoPlayInterval: null,

    initialize: function() {
        this.settings = Storage.getSettings();
        this.applySettings();
        UI.initialize();
        AI.setDifficulty(this.difficulty);
        
        const savedGame = Storage.getCurrentGame();
        if (savedGame && savedGame.gameState === 'playing') {
            this.showResumeDialog(savedGame);
        }

        Storage.migrateLegacyData();
    },

    applySettings: function() {
        if (this.settings) {
            UI.applyTheme(this.settings.theme);
            UI.setBoardScale(this.settings.scale);
        }
    },

    showResumeDialog: function(savedGame) {
        const date = new Date(savedGame.timestamp).toLocaleString('zh-CN');
        UI.showDialog(
            '恢复对局',
            `<p>检测到未完成的对局：</p>
             <p>时间：${date}</p>
             <p>模式：${savedGame.mode === 'pvp' ? '双人对战' : '人机对战'}</p>
             <p>当前回合：${savedGame.currentTurn === 'red' ? '红方' : '黑方'}</p>
             <p>是否恢复此对局？</p>`,
            [
                {
                    text: '恢复对局',
                    type: 'primary',
                    onClick: () => this.resumeGame(savedGame)
                },
                {
                    text: '开始新局',
                    type: 'secondary',
                    onClick: () => {
                        Storage.clearCurrentGame();
                    }
                }
            ]
        );
    },

    startGame: function(mode) {
        this.gameMode = mode;
        
        if (mode === 'pvc') {
            const selectedDifficulty = document.querySelector('.difficulty-card.selected');
            this.difficulty = selectedDifficulty ? selectedDifficulty.dataset.difficulty : 'normal';
            AI.setDifficulty(this.difficulty);

            const selectedColor = document.querySelector('.color-btn.selected');
            const colorChoice = selectedColor ? selectedColor.dataset.color : 'red';
            
            if (colorChoice === 'random') {
                this.playerColor = Math.random() < 0.5 ? 'red' : 'black';
            } else {
                this.playerColor = colorChoice;
            }
        }

        this.board = new ChessBoard();
        this.currentTurn = 'red';
        this.gameState = 'playing';
        this.isPaused = false;
        this.selectedPiece = null;
        this.redTime = 0;
        this.blackTime = 0;
        this.totalTime = 0;
        this.lastMove = null;
        this.isReviewMode = false;

        UI.showScreen('game');
        this.renderGame();
        this.startTimer();
        this.updatePlayerNames();

        Storage.clearCurrentGame();

        if (mode === 'pvc' && this.playerColor === 'black') {
            setTimeout(() => {
                this.requestAIMove();
            }, 500);
        }
    },

    resumeGame: function(savedGame) {
        this.gameMode = savedGame.mode;
        this.difficulty = savedGame.difficulty || 'normal';
        this.playerColor = savedGame.playerColor || 'red';
        this.currentTurn = savedGame.currentTurn;
        this.gameState = savedGame.gameState;
        this.isPaused = savedGame.isPaused || false;
        this.redTime = savedGame.redTime || 0;
        this.blackTime = savedGame.blackTime || 0;
        this.totalTime = savedGame.totalTime || 0;

        AI.setDifficulty(this.difficulty);

        this.board = new ChessBoard();
        if (savedGame.boardState) {
            this.board.loadBoardState(savedGame.boardState);
        }

        UI.showScreen('game');
        this.renderGame();
        this.startTimer();
        this.updatePlayerNames();
    },

    updatePlayerNames: function() {
        const redName = document.getElementById('red-player-name');
        const blackName = document.getElementById('black-player-name');

        if (this.gameMode === 'pvp') {
            if (redName) redName.textContent = '红方';
            if (blackName) blackName.textContent = '黑方';
        } else {
            if (this.playerColor === 'red') {
                if (redName) redName.textContent = '你 (红方)';
                if (blackName) blackName.textContent = 'AI (黑方)';
            } else {
                if (redName) redName.textContent = 'AI (红方)';
                if (blackName) blackName.textContent = '你 (黑方)';
            }
        }
    },

    renderGame: function() {
        UI.renderPieces(this.board);
        UI.updateTurnIndicator(this.currentTurn);
        this.updateStats();
        UI.updateCapturedPieces(this.board.capturedPieces);
        UI.updateMoveHistory(this.board.moveHistory, this.board.currentMoveIndex);
        UI.updateTimers(this.redTime, this.blackTime);

        UI.updateButtonStates({
            isPaused: this.isPaused,
            canUndo: this.board.currentMoveIndex >= 0,
            canHint: this.gameState === 'playing' && !this.isPaused
        });

        if (this.lastMove) {
            UI.highlightLastMove(
                this.lastMove.fromRow,
                this.lastMove.fromCol,
                this.lastMove.toRow,
                this.lastMove.toCol
            );
        }

        const redInCheck = Rules.isInCheck(this.board, 'red');
        const blackInCheck = Rules.isInCheck(this.board, 'black');

        if (redInCheck) {
            UI.highlightCheck('red');
            UI.updatePlayerStatus('red', '将军');
        } else {
            UI.updatePlayerStatus('red', '');
        }

        if (blackInCheck) {
            UI.highlightCheck('black');
            UI.updatePlayerStatus('black', '将军');
        } else {
            UI.updatePlayerStatus('black', '');
        }
    },

    updateStats: function() {
        UI.updateStats({
            totalMoves: this.board.moveHistory.length,
            duration: Utils.formatTime(this.totalTime),
            redCaptures: this.board.capturedPieces.black.length,
            blackCaptures: this.board.capturedPieces.red.length
        });
    },

    startTimer: function() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        if (!this.settings.timerEnabled) return;

        this.timerInterval = setInterval(() => {
            if (this.gameState !== 'playing' || this.isPaused) return;

            this.totalTime++;

            if (this.currentTurn === 'red') {
                this.redTime++;
            } else {
                this.blackTime++;
            }

            UI.updateTimers(this.redTime, this.blackTime);
            this.updateStats();
        }, 1000);
    },

    stopTimer: function() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    handleBoardClick: function(row, col) {
        if (this.gameState !== 'playing' || this.isPaused || this.isReviewMode) return;

        if (this.gameMode === 'pvc' && this.currentTurn !== this.playerColor) {
            UI.showMessage('等待对方落子...', 'info');
            return;
        }

        const clickedPiece = this.board.getPieceAt(row, col);

        if (this.selectedPiece) {
            if (clickedPiece && clickedPiece.color === this.currentTurn) {
                this.selectPiece(clickedPiece);
                return;
            }

            this.tryMovePiece(this.selectedPiece, row, col);
        } else {
            if (clickedPiece && clickedPiece.color === this.currentTurn) {
                this.selectPiece(clickedPiece);
            }
        }
    },

    handlePieceDrop: function(piece, row, col) {
        if (this.gameState !== 'playing' || this.isPaused || this.isReviewMode) return;

        if (this.gameMode === 'pvc' && piece.color !== this.playerColor) {
            UI.showMessage('不能移动对方棋子', 'warning');
            return;
        }

        this.tryMovePiece(piece, row, col);
    },

    selectPiece: function(piece) {
        if (this.gameState !== 'playing' || this.isPaused) return;

        if (piece.color !== this.currentTurn) {
            UI.showMessage('现在不是你的回合！', 'warning');
            return;
        }

        this.selectedPiece = piece;
        const validMoves = this.board.getValidMoves(piece);
        
        if (this.settings.showValidMoves) {
            UI.selectPiece(piece, validMoves);
        } else {
            UI.selectPiece(piece, []);
        }

        if (this.lastMove) {
            UI.highlightLastMove(
                this.lastMove.fromRow,
                this.lastMove.fromCol,
                this.lastMove.toRow,
                this.lastMove.toCol
            );
        }
    },

    tryMovePiece: function(piece, toRow, toCol) {
        if (piece.row === toRow && piece.col === toCol) {
            UI.clearSelection();
            this.selectedPiece = null;
            return;
        }

        const validation = Rules.validateMove(this.board, piece, toRow, toCol);
        
        if (!validation.valid) {
            UI.showMessage(validation.message, 'error');
            return;
        }

        const targetPiece = this.board.getPieceAt(toRow, toCol);
        const result = this.board.movePiece(piece.row, piece.col, toRow, toCol, false);

        if (result.success) {
            this.lastMove = {
                fromRow: piece.row,
                fromCol: piece.col,
                toRow,
                toCol
            };

            this.playMoveSound(targetPiece);
            this.animateMove(piece, targetPiece);

            UI.clearSelection();
            this.selectedPiece = null;

            this.currentTurn = this.currentTurn === 'red' ? 'black' : 'red';
            this.renderGame();

            this.checkGameEnd(result);

            if (this.gameState === 'playing' && this.gameMode === 'pvc') {
                if (this.currentTurn !== this.playerColor) {
                    setTimeout(() => {
                        this.requestAIMove();
                    }, 300);
                }
            }
        }
    },

    requestAIMove: function() {
        if (this.gameState !== 'playing' || this.isPaused) return;

        UI.showMessage('AI思考中...', 'info');

        setTimeout(() => {
            const move = AI.getBestMove(this.board, this.currentTurn);
            
            if (move) {
                const targetPiece = this.board.getPieceAt(move.toRow, move.toCol);
                const result = this.board.movePiece(
                    move.fromRow,
                    move.fromCol,
                    move.toRow,
                    move.toCol,
                    false
                );

                if (result.success) {
                    this.lastMove = {
                        fromRow: move.fromRow,
                        fromCol: move.fromCol,
                        toRow: move.toRow,
                        toCol: move.toCol
                    };

                    this.playMoveSound(targetPiece);
                    this.currentTurn = this.currentTurn === 'red' ? 'black' : 'red';
                    this.renderGame();
                    this.checkGameEnd(result);
                }
            }
        }, 200);
    },

    checkGameEnd: function(result) {
        if (result.isCheckmate) {
            this.endGame('checkmate', this.currentTurn === 'red' ? 'black' : 'red');
        } else if (result.isStalemate) {
            this.endGame('stalemate', null);
        } else if (Rules.isDraw(this.board)) {
            this.endGame('draw', null);
        }
    },

    endGame: function(reason, winner) {
        this.gameState = 'game_over';
        this.stopTimer();

        let result, message;

        if (reason === 'checkmate') {
            result = winner === this.playerColor || this.gameMode === 'pvp' ? 'win' : 'lose';
            message = winner === 'red' ? '红方将死黑方！' : '黑方将死红方！';
        } else if (reason === 'stalemate') {
            result = 'draw';
            message = '困毙！无子可动。';
        } else if (reason === 'draw') {
            result = 'draw';
            message = '双方无力再战，和棋！';
        } else if (reason === 'resigned') {
            result = winner === this.playerColor ? 'win' : 'lose';
            message = '一方认输';
        } else if (reason === 'agreed_draw') {
            result = 'draw';
            message = '双方同意和棋';
        }

        const stats = {
            totalMoves: this.board.moveHistory.length,
            duration: Utils.formatTime(this.totalTime),
            redCaptures: this.board.capturedPieces.black.length,
            blackCaptures: this.board.capturedPieces.red.length
        };

        UI.showGameOver(result, winner, stats);

        this.saveToHistory(result, winner, reason);
        Storage.clearCurrentGame();
    },

    saveToHistory: function(result, winner, reason) {
        const historyData = {
            mode: this.gameMode,
            difficulty: this.difficulty,
            playerColor: this.playerColor,
            result: result,
            winner: winner,
            totalMoves: this.board.moveHistory.length,
            duration: Utils.formatTime(this.totalTime),
            redCaptures: this.board.capturedPieces.black.length,
            blackCaptures: this.board.capturedPieces.red.length,
            boardState: this.board.getBoardState(),
            moveHistory: this.board.moveHistory
        };

        Storage.addHistoryItem(historyData);
    },

    playMoveSound: function(isCapture) {
        if (!this.settings.soundEnabled) return;
    },

    animateMove: function(piece, capturedPiece) {
        if (!this.settings.moveAnimation) return;

        const pieceElement = document.querySelector(`[data-piece-id="${piece.id}"]`);
        if (pieceElement) {
            pieceElement.classList.add('animate-move');
            setTimeout(() => {
                pieceElement.classList.remove('animate-move');
            }, 300);
        }

        if (capturedPiece && this.settings.captureAnimation) {
            const capturedElement = document.querySelector(`[data-piece-id="${capturedPiece.id}"]`);
            if (capturedElement) {
                capturedElement.classList.add('animate-capture');
            }
        }
    },

    togglePause: function() {
        if (this.gameState !== 'playing') return;

        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            UI.showMessage('游戏已暂停', 'info');
        } else {
            UI.showMessage('游戏继续', 'success');
        }

        this.renderGame();
    },

    showResignConfirm: function() {
        if (this.gameState !== 'playing') return;

        UI.showDialog(
            '确认认输',
            '<p>确定要认输吗？这将结束当前对局。</p>',
            [
                {
                    text: '确认认输',
                    type: 'primary',
                    onClick: () => this.resign()
                },
                {
                    text: '取消',
                    type: 'secondary'
                }
            ]
        );
    },

    resign: function() {
        const winner = this.currentTurn === 'red' ? 'black' : 'red';
        this.endGame('resigned', winner);
    },

    showDrawConfirm: function() {
        if (this.gameState !== 'playing') return;

        if (this.gameMode === 'pvp') {
            UI.showDialog(
                '和棋申请',
                '<p>确定要申请和棋吗？</p>',
                [
                    {
                        text: '确认和棋',
                        type: 'primary',
                        onClick: () => this.endGame('agreed_draw', null)
                    },
                    {
                        text: '取消',
                        type: 'secondary'
                    }
                ]
            );
        } else {
            UI.showDialog(
                '和棋',
                '<p>确定要与AI和棋吗？</p>',
                [
                    {
                        text: '确认和棋',
                        type: 'primary',
                        onClick: () => this.endGame('agreed_draw', null)
                    },
                    {
                        text: '取消',
                        type: 'secondary'
                    }
                ]
            );
        }
    },

    showUndoConfirm: function() {
        if (this.gameState !== 'playing' || this.board.currentMoveIndex < 0) return;

        if (this.gameMode === 'pvc') {
            UI.showDialog(
                '悔棋申请',
                '<p>确定要悔棋吗？悔棋将撤销双方各一步。</p>',
                [
                    {
                        text: '确认悔棋',
                        type: 'primary',
                        onClick: () => this.undoForAI()
                    },
                    {
                        text: '取消',
                        type: 'secondary'
                    }
                ]
            );
        } else {
            this.undoMove();
        }
    },

    undoMove: function() {
        const result = this.board.undoMove();
        
        if (result.success) {
            this.currentTurn = this.currentTurn === 'red' ? 'black' : 'red';
            this.lastMove = this.board.moveHistory.length > 0 
                ? this.board.moveHistory[this.board.moveHistory.length - 1]
                : null;
            this.renderGame();
            UI.showMessage('已悔棋', 'success');
        }
    },

    undoForAI: function() {
        if (this.board.currentMoveIndex < 0) return;

        this.undoMove();

        if (this.board.currentMoveIndex >= 0 && this.gameMode === 'pvc') {
            this.undoMove();
        }
    },

    showHint: function() {
        if (this.gameState !== 'playing' || this.isPaused) return;

        if (this.gameMode === 'pvc' && this.currentTurn !== this.playerColor) {
            UI.showMessage('等待对方落子...', 'info');
            return;
        }

        const hintMove = AI.getHintMove(this.board, this.currentTurn);
        
        if (hintMove) {
            const validMoves = [
                { row: hintMove.fromRow, col: hintMove.fromCol, isCapture: false },
                { row: hintMove.toRow, col: hintMove.toCol, isCapture: hintMove.isCapture }
            ];

            UI.clearHighlights();
            UI.highlightLastMove(hintMove.fromRow, hintMove.fromCol, hintMove.toRow, hintMove.toCol);
            UI.showMessage('提示：点击高亮位置', 'info');
        }
    },

    showRestartConfirm: function() {
        if (this.gameState === 'idle') return;

        UI.showDialog(
            '重新开始',
            '<p>确定要重新开始吗？当前进度将丢失。</p>',
            [
                {
                    text: '确认重开',
                    type: 'primary',
                    onClick: () => {
                        if (this.gameState === 'playing') {
                            this.saveToHistory('draw', null, 'abandoned');
                        }
                        Storage.clearCurrentGame();
                        this.showScreen('menu');
                    }
                },
                {
                    text: '取消',
                    type: 'secondary'
                }
            ]
        );
    },

    goToMove: function(index) {
        if (index < 0 || index >= this.board.moveHistory.length) return;

        const targetIndex = index === -1 ? this.board.moveHistory.length - 1 : index;
        
        const result = this.board.goToMove(targetIndex);
        
        if (result.success) {
            this.isReviewMode = true;
            this.renderGame();
        }
    },

    prevMove: function() {
        if (this.board.currentMoveIndex < 0) return;
        this.goToMove(this.board.currentMoveIndex - 1);
    },

    nextMove: function() {
        if (this.board.currentMoveIndex >= this.board.moveHistory.length - 1) return;
        this.goToMove(this.board.currentMoveIndex + 1);
    },

    autoPlay: function() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            UI.showMessage('自动演示已停止', 'info');
            return;
        }

        if (this.board.moveHistory.length === 0) {
            UI.showMessage('没有走棋记录可演示', 'warning');
            return;
        }

        this.board.goToMove(-1);
        let currentIndex = 0;

        this.autoPlayInterval = setInterval(() => {
            if (currentIndex < this.board.moveHistory.length) {
                this.board.redoMove();
                this.renderGame();
                currentIndex++;
            } else {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }, 1000);

        UI.showMessage('开始自动演示', 'info');
    },

    saveGame: function() {
        if (this.gameState !== 'playing') {
            UI.showMessage('当前没有进行中的对局', 'warning');
            return;
        }

        const gameData = {
            mode: this.gameMode,
            difficulty: this.difficulty,
            playerColor: this.playerColor,
            currentTurn: this.currentTurn,
            gameState: this.gameState,
            isPaused: this.isPaused,
            redTime: this.redTime,
            blackTime: this.blackTime,
            totalTime: this.totalTime,
            boardState: this.board.getBoardState()
        };

        if (Storage.saveCurrentGame(gameData)) {
            UI.showMessage('对局已保存', 'success');
        } else {
            UI.showMessage('保存失败', 'error');
        }
    },

    showDifficultySelect: function() {
        UI.showScreen('difficulty');
    },

    showHistory: function() {
        const history = Storage.getHistory();
        UI.refreshHistoryList(history);
        UI.showScreen('history');
    },

    refreshHistory: function() {
        const modeFilter = document.getElementById('filter-mode')?.value || 'all';
        const resultFilter = document.getElementById('filter-result')?.value || 'all';
        
        let history = Storage.getHistory();

        if (modeFilter !== 'all') {
            history = history.filter(item => item.mode === modeFilter);
        }

        if (resultFilter !== 'all') {
            history = history.filter(item => item.result === resultFilter);
        }

        UI.refreshHistoryList(history);
    },

    loadHistoryGame: function(index) {
        const history = Storage.getHistory();
        if (index < 0 || index >= history.length) return;

        const item = history[index];
        
        this.board = new ChessBoard();
        if (item.boardState) {
            this.board.loadBoardState(item.boardState);
        }

        this.gameMode = item.mode;
        this.difficulty = item.difficulty;
        this.playerColor = item.playerColor;
        this.currentTurn = 'red';
        this.gameState = 'reviewing';
        this.isReviewMode = true;
        this.redTime = 0;
        this.blackTime = 0;
        this.totalTime = 0;

        AI.setDifficulty(this.difficulty);

        UI.showScreen('game');
        this.updatePlayerNames();
        this.renderGame();
        this.board.goToMove(-1);
        this.renderGame();

        UI.showMessage('复盘模式 - 可查看走棋记录', 'info');
    },

    showSettings: function() {
        this.previousScreen = document.querySelector('.screen.active')?.id?.replace('-screen', '') || 'menu';
        UI.loadSettingsToUI(this.settings);
        UI.showScreen('settings');
    },

    goBackFromSettings: function() {
        UI.showScreen(this.previousScreen);
    },

    saveSettings: function() {
        const themeSelect = document.getElementById('setting-theme');
        const scaleSlider = document.getElementById('setting-scale');
        const timerCheckbox = document.getElementById('setting-timer');
        const soundCheckbox = document.getElementById('setting-sound');
        const moveAnimationCheckbox = document.getElementById('setting-move-animation');
        const captureAnimationCheckbox = document.getElementById('setting-capture-animation');
        const volumeSlider = document.getElementById('setting-volume');
        const operationSelect = document.getElementById('setting-operation');
        const showMovesCheckbox = document.getElementById('setting-show-moves');
        const showThreatsCheckbox = document.getElementById('setting-show-threats');
        const accidentCheckbox = document.getElementById('setting-accident-prevention');

        this.settings = {
            theme: themeSelect?.value || 'classic',
            scale: parseInt(scaleSlider?.value || 100),
            timerEnabled: timerCheckbox?.checked ?? true,
            soundEnabled: soundCheckbox?.checked ?? true,
            moveAnimation: moveAnimationCheckbox?.checked ?? true,
            captureAnimation: captureAnimationCheckbox?.checked ?? true,
            volume: parseInt(volumeSlider?.value || 70),
            operationMode: operationSelect?.value || 'both',
            showValidMoves: showMovesCheckbox?.checked ?? true,
            showThreats: showThreatsCheckbox?.checked ?? true,
            accidentPrevention: accidentCheckbox?.checked ?? true
        };

        Storage.saveSettings(this.settings);
        this.applySettings();

        UI.showMessage('设置已保存', 'success');
        UI.showScreen(this.previousScreen);
    },

    restoreDefaults: function() {
        UI.showDialog(
            '恢复默认设置',
            '<p>确定要恢复所有默认设置吗？</p>',
            [
                {
                    text: '确认恢复',
                    type: 'primary',
                    onClick: () => {
                        this.settings = Storage.restoreDefaultSettings();
                        UI.loadSettingsToUI(this.settings);
                        this.applySettings();
                        UI.showMessage('已恢复默认设置', 'success');
                    }
                },
                {
                    text: '取消',
                    type: 'secondary'
                }
            ]
        );
    },

    showScreen: function(screenName) {
        UI.showScreen(screenName);
    },

    playAgain: function() {
        UI.hideGameOver();
        this.showScreen('menu');
    },

    reviewGame: function() {
        UI.hideGameOver();
        this.isReviewMode = true;
        this.gameState = 'reviewing';
        this.board.goToMove(-1);
        this.renderGame();
    },

    closeDialog: function() {
        UI.closeDialog();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    game.initialize();
});
