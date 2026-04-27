const UI = {
    selectedPiece: null,
    validMoves: [],
    lastMove: null,
    cellSize: 60,
    boardPadding: 30,
    isDragging: false,
    dragPiece: null,
    dragOffset: { x: 0, y: 0 },

    initialize: function() {
        this.setupEventListeners();
        this.createBoardGrid();
        this.createInteractionCells();
    },

    setupEventListeners: function() {
        const piecesLayer = document.getElementById('pieces-layer');
        const interactionLayer = document.getElementById('interaction-layer');
        const chessboard = document.getElementById('chessboard');

        chessboard.addEventListener('click', (e) => this.handleBoardClick(e));
        
        piecesLayer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        chessboard.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        this.setupDifficultyListeners();
        this.setupColorListeners();
        this.setupSettingsListeners();
        this.setupButtonListeners();
    },

    setupButtonListeners: function() {
        const addClick = (id, handler) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', handler);
        };

        addClick('btn-pvp', () => game.startGame('pvp'));
        addClick('btn-pvc', () => game.showDifficultySelect());
        addClick('btn-history', () => game.showHistory());
        addClick('btn-settings', () => game.showSettings());

        addClick('btn-start-pvc', () => game.startGame('pvc'));
        addClick('btn-back-menu', () => game.showScreen('menu'));

        addClick('btn-pause', () => game.togglePause());
        addClick('btn-resign', () => game.showResignConfirm());
        addClick('btn-draw', () => game.showDrawConfirm());
        addClick('btn-undo', () => game.showUndoConfirm());
        addClick('btn-hint', () => game.showHint());
        addClick('btn-restart', () => game.showRestartConfirm());

        addClick('btn-first', () => game.goToMove(0));
        addClick('btn-prev', () => game.prevMove());
        addClick('btn-next', () => game.nextMove());
        addClick('btn-last', () => game.goToMove(-1));

        addClick('btn-footer-settings', () => game.showSettings());
        addClick('btn-autoplay', () => game.autoPlay());
        addClick('btn-save', () => game.saveGame());
        addClick('btn-menu', () => game.showScreen('menu'));

        addClick('btn-refresh-history', () => game.refreshHistory());
        addClick('btn-history-back', () => game.showScreen('menu'));

        addClick('btn-save-settings', () => game.saveSettings());
        addClick('btn-restore-defaults', () => game.restoreDefaults());
        addClick('btn-settings-back', () => game.goBackFromSettings());

        addClick('btn-dialog-close', () => game.closeDialog());

        addClick('btn-play-again', () => game.playAgain());
        addClick('btn-review-game', () => game.reviewGame());
        addClick('btn-gameover-menu', () => game.showScreen('menu'));
    },

    setupDifficultyListeners: function() {
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                const difficulty = card.dataset.difficulty;
                AI.setDifficulty(difficulty);
            });
        });
    },

    setupColorListeners: function() {
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    },

    setupSettingsListeners: function() {
        const scaleSlider = document.getElementById('setting-scale');
        const scaleValue = document.getElementById('scale-value');
        
        if (scaleSlider) {
            scaleSlider.addEventListener('input', () => {
                scaleValue.textContent = scaleSlider.value + '%';
            });
        }

        const volumeSlider = document.getElementById('setting-volume');
        const volumeValue = document.getElementById('volume-value');
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                volumeValue.textContent = volumeSlider.value + '%';
            });
        }

        const timerCheckbox = document.getElementById('setting-timer');
        const moveTimeSelect = document.getElementById('setting-move-time');
        const totalTimeSelect = document.getElementById('setting-total-time');
        
        if (timerCheckbox && moveTimeSelect && totalTimeSelect) {
            timerCheckbox.addEventListener('change', () => {
                const disabled = !timerCheckbox.checked;
                moveTimeSelect.disabled = disabled;
                totalTimeSelect.disabled = disabled;
            });
        }
    },

    createBoardGrid: function() {
        const grid = document.getElementById('board-grid');
        if (!grid) return;

        grid.innerHTML = '';

        for (let row = 0; row < 10; row++) {
            const line = document.createElement('div');
            line.className = 'horizontal-line';
            line.style.top = `${row * this.cellSize}px`;
            grid.appendChild(line);
        }

        for (let col = 0; col < 9; col++) {
            if (col === 0 || col === 8) {
                const line = document.createElement('div');
                line.className = 'vertical-line-full';
                line.style.left = `${col * this.cellSize}px`;
                grid.appendChild(line);
            } else {
                const lineTop = document.createElement('div');
                lineTop.className = 'vertical-line-top';
                lineTop.style.left = `${col * this.cellSize}px`;
                grid.appendChild(lineTop);

                const lineBottom = document.createElement('div');
                lineBottom.className = 'vertical-line-bottom';
                lineBottom.style.left = `${col * this.cellSize}px`;
                grid.appendChild(lineBottom);
            }
        }

        this.addDiagonalLines(grid);
        this.addPositionMarkers(grid);
    },

    addDiagonalLines: function(grid) {
        const diagonalBlack1 = document.createElement('div');
        diagonalBlack1.className = 'diagonal-line';
        diagonalBlack1.style.top = `${0 * this.cellSize}px`;
        diagonalBlack1.style.left = `${3 * this.cellSize}px`;
        diagonalBlack1.style.transform = 'rotate(45deg)';
        grid.appendChild(diagonalBlack1);

        const diagonalBlack2 = document.createElement('div');
        diagonalBlack2.className = 'diagonal-line';
        diagonalBlack2.style.top = `${0 * this.cellSize}px`;
        diagonalBlack2.style.left = `${5 * this.cellSize}px`;
        diagonalBlack2.style.transform = 'rotate(135deg)';
        grid.appendChild(diagonalBlack2);

        const diagonalRed1 = document.createElement('div');
        diagonalRed1.className = 'diagonal-line';
        diagonalRed1.style.top = `${7 * this.cellSize}px`;
        diagonalRed1.style.left = `${3 * this.cellSize}px`;
        diagonalRed1.style.transform = 'rotate(45deg)';
        grid.appendChild(diagonalRed1);

        const diagonalRed2 = document.createElement('div');
        diagonalRed2.className = 'diagonal-line';
        diagonalRed2.style.top = `${7 * this.cellSize}px`;
        diagonalRed2.style.left = `${5 * this.cellSize}px`;
        diagonalRed2.style.transform = 'rotate(135deg)';
        grid.appendChild(diagonalRed2);
    },

    addPositionMarkers: function(grid) {
        const markerPositions = [
            { row: 2, col: 1 }, { row: 2, col: 7 },
            { row: 7, col: 1 }, { row: 7, col: 7 },
            { row: 3, col: 0 }, { row: 3, col: 2 }, { row: 3, col: 4 },
            { row: 3, col: 6 }, { row: 3, col: 8 },
            { row: 6, col: 0 }, { row: 6, col: 2 }, { row: 6, col: 4 },
            { row: 6, col: 6 }, { row: 6, col: 8 }
        ];

        markerPositions.forEach(pos => {
            const x = pos.col * this.cellSize;
            const y = pos.row * this.cellSize;
            
            this.addSingleMarker(grid, x, y, 'left');
            this.addSingleMarker(grid, x, y, 'right');
        });
    },

    addSingleMarker: function(grid, x, y, direction) {
        const marker = document.createElement('div');
        marker.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            border: 2px solid var(--board-line);
        `;

        if (direction === 'left') {
            marker.style.right = `${x + 4}px`;
            marker.style.top = `${y - 4}px`;
            marker.style.borderRight = 'none';
            marker.style.borderBottom = 'none';
        } else {
            marker.style.left = `${x + 4}px`;
            marker.style.top = `${y - 4}px`;
            marker.style.borderLeft = 'none';
            marker.style.borderBottom = 'none';
        }

        grid.appendChild(marker);
    },

    createInteractionCells: function() {
        const layer = document.getElementById('interaction-layer');
        if (!layer) return;

        layer.innerHTML = '';

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'interaction-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.cssText = `
                    position: absolute;
                    left: ${col * this.cellSize - this.cellSize / 2}px;
                    top: ${row * this.cellSize - this.cellSize / 2}px;
                    width: ${this.cellSize}px;
                    height: ${this.cellSize}px;
                `;
                layer.appendChild(cell);
            }
        }
    },

    renderPieces: function(board) {
        const layer = document.getElementById('pieces-layer');
        if (!layer) return;

        layer.innerHTML = '';

        const activePieces = board.pieces.filter(p => !p.isCaptured);

        activePieces.forEach(piece => {
            const pieceElement = this.createPieceElement(piece);
            layer.appendChild(pieceElement);
        });
    },

    createPieceElement: function(piece) {
        const element = document.createElement('div');
        element.className = `piece ${piece.color}`;
        element.dataset.pieceId = piece.id;
        element.dataset.row = piece.row;
        element.dataset.col = piece.col;
        element.textContent = piece.getName();

        element.classList.add(`at-row-${piece.row}`);
        element.classList.add(`at-col-${piece.col}`);

        if (this.selectedPiece && this.selectedPiece.id === piece.id) {
            element.classList.add('selected');
        }

        return element;
    },

    handleBoardClick: function(e) {
        const chessboard = document.getElementById('chessboard');
        const rect = chessboard.getBoundingClientRect();
        
        const x = e.clientX - rect.left - this.boardPadding;
        const y = e.clientY - rect.top - this.boardPadding;

        const col = Math.round(x / this.cellSize);
        const row = Math.round(y / this.cellSize);

        if (col < 0 || col > 8 || row < 0 || row > 9) {
            this.clearSelection();
            return;
        }

        if (this.isDragging) return;

        game.handleBoardClick(row, col);
    },

    handleMouseDown: function(e) {
        if (e.button !== 0) return;

        const pieceElement = e.target.closest('.piece');
        if (!pieceElement) return;

        const pieceId = pieceElement.dataset.pieceId;
        const piece = game.board.pieces.find(p => p.id === pieceId);
        
        if (!piece || piece.isCaptured) return;

        if (piece.color !== game.currentTurn) {
            this.showMessage('现在不是你的回合！', 'warning');
            return;
        }

        if (game.gameMode === 'pvc' && piece.color !== game.playerColor) {
            return;
        }

        this.isDragging = true;
        this.dragPiece = piece;
        
        const chessboard = document.getElementById('chessboard');
        const rect = chessboard.getBoundingClientRect();
        
        this.dragOffset = {
            x: e.clientX - rect.left - (piece.col * this.cellSize + this.boardPadding),
            y: e.clientY - rect.top - (piece.row * this.cellSize + this.boardPadding)
        };

        pieceElement.classList.add('dragging');
        
        game.selectPiece(piece);
    },

    handleMouseMove: function(e) {
        if (!this.isDragging || !this.dragPiece) return;

        const pieceElement = document.querySelector(`[data-piece-id="${this.dragPiece.id}"]`);
        if (!pieceElement) return;

        const chessboard = document.getElementById('chessboard');
        const rect = chessboard.getBoundingClientRect();

        const x = e.clientX - rect.left - this.dragOffset.x;
        const y = e.clientY - rect.top - this.dragOffset.y;

        pieceElement.style.transform = `translate(${x - this.boardPadding - this.dragPiece.col * this.cellSize}px, ${y - this.boardPadding - this.dragPiece.row * this.cellSize}px)`;
    },

    handleMouseUp: function(e) {
        if (!this.isDragging || !this.dragPiece) return;

        const pieceElement = document.querySelector(`[data-piece-id="${this.dragPiece.id}"]`);
        if (pieceElement) {
            pieceElement.classList.remove('dragging');
            pieceElement.style.transform = '';
        }

        const chessboard = document.getElementById('chessboard');
        const rect = chessboard.getBoundingClientRect();
        
        const x = e.clientX - rect.left - this.boardPadding;
        const y = e.clientY - rect.top - this.boardPadding;

        const col = Math.round(x / this.cellSize);
        const row = Math.round(y / this.cellSize);

        if (col >= 0 && col <= 8 && row >= 0 && row <= 9) {
            game.handlePieceDrop(this.dragPiece, row, col);
        }

        this.isDragging = false;
        this.dragPiece = null;
    },

    handleTouchStart: function(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const pieceElement = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.piece');
        
        if (!pieceElement) return;

        const pieceId = pieceElement.dataset.pieceId;
        const piece = game.board.pieces.find(p => p.id === pieceId);
        
        if (!piece || piece.isCaptured) return;

        if (piece.color !== game.currentTurn) {
            this.showMessage('现在不是你的回合！', 'warning');
            return;
        }

        if (game.gameMode === 'pvc' && piece.color !== game.playerColor) {
            return;
        }

        this.isDragging = true;
        this.dragPiece = piece;
        
        const chessboard = document.getElementById('chessboard');
        const rect = chessboard.getBoundingClientRect();
        
        this.dragOffset = {
            x: touch.clientX - rect.left - (piece.col * this.cellSize + this.boardPadding),
            y: touch.clientY - rect.top - (piece.row * this.cellSize + this.boardPadding)
        };

        pieceElement.classList.add('dragging');
        game.selectPiece(piece);
    },

    handleTouchMove: function(e) {
        e.preventDefault();
        
        if (!this.isDragging || !this.dragPiece) return;

        const touch = e.touches[0];
        const pieceElement = document.querySelector(`[data-piece-id="${this.dragPiece.id}"]`);
        if (!pieceElement) return;

        const chessboard = document.getElementById('chessboard');
        const rect = chessboard.getBoundingClientRect();

        const x = touch.clientX - rect.left - this.dragOffset.x;
        const y = touch.clientY - rect.top - this.dragOffset.y;

        pieceElement.style.transform = `translate(${x - this.boardPadding - this.dragPiece.col * this.cellSize}px, ${y - this.boardPadding - this.dragPiece.row * this.cellSize}px)`;
    },

    handleTouchEnd: function(e) {
        if (!this.isDragging || !this.dragPiece) return;

        const pieceElement = document.querySelector(`[data-piece-id="${this.dragPiece.id}"]`);
        if (pieceElement) {
            pieceElement.classList.remove('dragging');
            pieceElement.style.transform = '';
        }

        const lastTouch = e.changedTouches[e.changedTouches.length - 1];
        const chessboard = document.getElementById('chessboard');
        const rect = chessboard.getBoundingClientRect();
        
        const x = lastTouch.clientX - rect.left - this.boardPadding;
        const y = lastTouch.clientY - rect.top - this.boardPadding;

        const col = Math.round(x / this.cellSize);
        const row = Math.round(y / this.cellSize);

        if (col >= 0 && col <= 8 && row >= 0 && row <= 9) {
            game.handlePieceDrop(this.dragPiece, row, col);
        }

        this.isDragging = false;
        this.dragPiece = null;
    },

    selectPiece: function(piece, validMoves) {
        this.clearSelection();
        this.selectedPiece = piece;
        this.validMoves = validMoves || [];

        const pieceElement = document.querySelector(`[data-piece-id="${piece.id}"]`);
        if (pieceElement) {
            pieceElement.classList.add('selected');
        }

        this.highlightValidMoves(validMoves);
    },

    clearSelection: function() {
        this.selectedPiece = null;
        this.validMoves = [];

        document.querySelectorAll('.piece.selected').forEach(el => {
            el.classList.remove('selected');
        });

        this.clearHighlights();
    },

    highlightValidMoves: function(moves) {
        this.clearHighlights();
        
        const highlightLayer = document.getElementById('highlight-layer');
        if (!highlightLayer) return;

        moves.forEach(move => {
            const marker = document.createElement('div');
            marker.className = `highlight-marker ${move.isCapture ? 'capture-move' : 'valid-move'}`;
            marker.style.cssText = `
                position: absolute;
                left: ${move.col * this.cellSize - this.cellSize / 2}px;
                top: ${move.row * this.cellSize - this.cellSize / 2}px;
                width: ${this.cellSize}px;
                height: ${this.cellSize}px;
            `;
            highlightLayer.appendChild(marker);
        });
    },

    highlightLastMove: function(fromRow, fromCol, toRow, toCol) {
        const highlightLayer = document.getElementById('highlight-layer');
        if (!highlightLayer) return;

        const fromMarker = document.createElement('div');
        fromMarker.className = 'highlight-marker last-move';
        fromMarker.style.cssText = `
            position: absolute;
            left: ${fromCol * this.cellSize - this.cellSize / 2}px;
            top: ${fromRow * this.cellSize - this.cellSize / 2}px;
            width: ${this.cellSize}px;
            height: ${this.cellSize}px;
        `;
        highlightLayer.appendChild(fromMarker);

        const toMarker = document.createElement('div');
        toMarker.className = 'highlight-marker last-move';
        toMarker.style.cssText = `
            position: absolute;
            left: ${toCol * this.cellSize - this.cellSize / 2}px;
            top: ${toRow * this.cellSize - this.cellSize / 2}px;
            width: ${this.cellSize}px;
            height: ${this.cellSize}px;
        `;
        highlightLayer.appendChild(toMarker);
    },

    highlightCheck: function(color) {
        const highlightLayer = document.getElementById('highlight-layer');
        if (!highlightLayer) return;

        const generalPos = game.board.getGeneralPosition(color);
        if (!generalPos) return;

        const marker = document.createElement('div');
        marker.className = 'highlight-marker check';
        marker.style.cssText = `
            position: absolute;
            left: ${generalPos.col * this.cellSize - this.cellSize / 2}px;
            top: ${generalPos.row * this.cellSize - this.cellSize / 2}px;
            width: ${this.cellSize}px;
            height: ${this.cellSize}px;
        `;
        highlightLayer.appendChild(marker);
    },

    clearHighlights: function() {
        const highlightLayer = document.getElementById('highlight-layer');
        if (highlightLayer) {
            highlightLayer.innerHTML = '';
        }
    },

    updateTurnIndicator: function(color) {
        const indicator = document.getElementById('turn-indicator');
        if (!indicator) return;

        const colorElement = indicator.querySelector('.turn-color');
        const textElement = indicator.querySelector('.turn-text');

        if (colorElement) {
            colorElement.className = `turn-color ${color}`;
        }

        if (textElement) {
            textElement.textContent = color === 'red' ? '红方回合' : '黑方回合';
        }

        document.querySelectorAll('.player-info').forEach(info => {
            info.classList.remove('active');
            if (info.classList.contains(`${color}-player`)) {
                info.classList.add('active');
            }
        });
    },

    updatePlayerStatus: function(color, status) {
        const statusElement = document.getElementById(`${color}-status`);
        if (!statusElement) return;

        statusElement.textContent = status;
        
        if (status === '将军') {
            statusElement.classList.add('check');
        } else {
            statusElement.classList.remove('check');
        }
    },

    updateStats: function(stats) {
        document.getElementById('total-moves').textContent = stats.totalMoves || 0;
        document.getElementById('game-duration').textContent = stats.duration || '00:00';
        document.getElementById('red-captures').textContent = stats.redCaptures || 0;
        document.getElementById('black-captures').textContent = stats.blackCaptures || 0;
    },

    updateCapturedPieces: function(captured) {
        const redCaptured = document.getElementById('red-captured');
        const blackCaptured = document.getElementById('black-captured');

        if (redCaptured) {
            redCaptured.innerHTML = '';
            captured.red.forEach(piece => {
                const el = document.createElement('div');
                el.className = 'captured-piece red';
                el.textContent = CONFIG.redPieces[piece.type];
                redCaptured.appendChild(el);
            });
        }

        if (blackCaptured) {
            blackCaptured.innerHTML = '';
            captured.black.forEach(piece => {
                const el = document.createElement('div');
                el.className = 'captured-piece black';
                el.textContent = CONFIG.blackPieces[piece.type];
                blackCaptured.appendChild(el);
            });
        }
    },

    updateMoveHistory: function(moves, currentIndex) {
        const moveList = document.getElementById('move-list');
        if (!moveList) return;

        moveList.innerHTML = '';

        moves.forEach((move, index) => {
            const item = document.createElement('div');
            item.className = `move-item ${index === currentIndex ? 'current' : ''}`;
            item.dataset.index = index;

            const moveNumber = document.createElement('span');
            moveNumber.className = 'move-number';
            moveNumber.textContent = `${index + 1}.`;

            const moveColor = document.createElement('span');
            moveColor.className = `move-color ${move.piece.color}`;

            const moveText = document.createElement('span');
            moveText.className = 'move-text';
            moveText.textContent = move.notation;

            item.appendChild(moveNumber);
            item.appendChild(moveColor);
            item.appendChild(moveText);

            item.addEventListener('click', () => {
                game.goToMove(index);
            });

            moveList.appendChild(item);
        });

        document.getElementById('current-move-index').textContent = currentIndex + 1;
        document.getElementById('total-moves-count').textContent = moves.length;

        const currentItem = moveList.querySelector('.move-item.current');
        if (currentItem) {
            currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    updateTimers: function(redTime, blackTime) {
        const redTimer = document.getElementById('red-timer');
        const blackTimer = document.getElementById('black-timer');

        if (redTimer) {
            redTimer.textContent = Utils.formatTime(redTime);
        }

        if (blackTimer) {
            blackTimer.textContent = Utils.formatTime(blackTime);
        }
    },

    showMessage: function(message, type = 'info') {
        const messageElement = document.getElementById('game-message');
        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.className = `game-message ${type} show`;

        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 2000);
    },

    showScreen: function(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    },

    showDialog: function(title, content, buttons) {
        const overlay = document.getElementById('dialog-overlay');
        const dialog = document.getElementById('dialog');
        
        if (!overlay || !dialog) return;

        document.getElementById('dialog-title').textContent = title;
        document.getElementById('dialog-content').innerHTML = content;

        const footer = document.getElementById('dialog-footer');
        footer.innerHTML = '';

        if (buttons && buttons.length > 0) {
            buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `menu-btn ${button.type || 'secondary'}`;
                btn.textContent = button.text;
                btn.addEventListener('click', () => {
                    this.closeDialog();
                    if (button.onClick) button.onClick();
                });
                footer.appendChild(btn);
            });
        }

        overlay.classList.remove('hidden');
    },

    closeDialog: function() {
        const overlay = document.getElementById('dialog-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    showGameOver: function(result, winner, stats) {
        const overlay = document.getElementById('game-over-overlay');
        if (!overlay) return;

        const icon = document.getElementById('game-over-icon');
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        const statsContainer = document.getElementById('game-over-stats');

        if (result === 'win') {
            icon.textContent = '🎉';
            title.textContent = `${winner === 'red' ? '红方' : '黑方'}获胜！`;
            title.className = 'game-over-title win';
            message.textContent = '恭喜赢得这盘对局！';
        } else if (result === 'lose') {
            icon.textContent = '😔';
            title.textContent = `${winner === 'red' ? '红方' : '黑方'}获胜`;
            title.className = 'game-over-title lose';
            message.textContent = '继续加油，下次一定能赢！';
        } else {
            icon.textContent = '🤝';
            title.textContent = '和棋';
            title.className = 'game-over-title draw';
            message.textContent = '双方势均力敌，握手言和！';
        }

        if (statsContainer && stats) {
            statsContainer.innerHTML = `
                <div class="game-over-stat">
                    <div class="game-over-stat-label">总步数</div>
                    <div class="game-over-stat-value">${stats.totalMoves}</div>
                </div>
                <div class="game-over-stat">
                    <div class="game-over-stat-label">对局时长</div>
                    <div class="game-over-stat-value">${stats.duration}</div>
                </div>
                <div class="game-over-stat">
                    <div class="game-over-stat-label">红方吃子</div>
                    <div class="game-over-stat-value">${stats.redCaptures}</div>
                </div>
                <div class="game-over-stat">
                    <div class="game-over-stat-label">黑方吃子</div>
                    <div class="game-over-stat-value">${stats.blackCaptures}</div>
                </div>
            `;
        }

        overlay.classList.remove('hidden');
    },

    hideGameOver: function() {
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    setBoardScale: function(scalePercent) {
        const boardWrapper = document.getElementById('board-wrapper');
        if (!boardWrapper) return;

        const scale = scalePercent / 100;
        boardWrapper.style.transform = `scale(${scale})`;
        boardWrapper.style.transformOrigin = 'center center';
    },

    applyTheme: function(themeName) {
        document.body.className = '';
        
        if (themeName !== 'classic') {
            document.body.classList.add(`theme-${themeName}`);
        }
    },

    updateButtonStates: function(state) {
        const pauseBtn = document.getElementById('btn-pause');
        const undoBtn = document.getElementById('btn-undo');
        const hintBtn = document.getElementById('btn-hint');

        if (pauseBtn) {
            const icon = pauseBtn.querySelector('.btn-icon');
            const text = pauseBtn.childNodes[pauseBtn.childNodes.length - 1];
            
            if (state.isPaused) {
                if (icon) icon.textContent = '▶️';
                if (text) text.textContent = '继续';
            } else {
                if (icon) icon.textContent = '⏸️';
                if (text) text.textContent = '暂停';
            }
        }

        if (undoBtn) {
            undoBtn.disabled = state.canUndo !== true;
        }

        if (hintBtn) {
            hintBtn.disabled = state.canHint !== true;
        }
    },

    refreshHistoryList: function(historyItems) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        if (!historyItems || historyItems.length === 0) {
            historyList.innerHTML = '<div class="empty-history">暂无历史对局记录</div>';
            return;
        }

        historyList.innerHTML = '';

        historyItems.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.index = index;

            const info = document.createElement('div');
            info.className = 'history-info';

            const mode = document.createElement('div');
            mode.className = 'history-mode';
            mode.textContent = item.mode === 'pvp' ? '双人对战' : `人机对战 (${item.difficulty || '普通'})`;

            const result = document.createElement('div');
            result.className = `history-result ${item.result}`;
            result.textContent = item.result === 'win' ? '胜利' : 
                               item.result === 'lose' ? '失败' : '和棋';

            const stats = document.createElement('div');
            stats.className = 'history-stats';
            stats.innerHTML = `
                <span>步数: ${item.totalMoves}</span>
                <span>时长: ${item.duration}</span>
            `;

            info.appendChild(mode);
            info.appendChild(result);
            info.appendChild(stats);

            const date = document.createElement('div');
            date.className = 'history-date';
            date.textContent = new Date(item.timestamp).toLocaleString('zh-CN');

            historyItem.appendChild(info);
            historyItem.appendChild(date);

            historyItem.addEventListener('click', () => {
                game.loadHistoryGame(index);
            });

            historyList.appendChild(historyItem);
        });
    },

    loadSettingsToUI: function(settings) {
        if (!settings) return;

        const themeSelect = document.getElementById('setting-theme');
        if (themeSelect && settings.theme) {
            themeSelect.value = settings.theme;
        }

        const scaleSlider = document.getElementById('setting-scale');
        const scaleValue = document.getElementById('scale-value');
        if (scaleSlider && settings.scale) {
            scaleSlider.value = settings.scale;
            if (scaleValue) scaleValue.textContent = settings.scale + '%';
        }

        const timerCheckbox = document.getElementById('setting-timer');
        if (timerCheckbox) {
            timerCheckbox.checked = settings.timerEnabled !== false;
        }

        const soundCheckbox = document.getElementById('setting-sound');
        if (soundCheckbox) {
            soundCheckbox.checked = settings.soundEnabled !== false;
        }

        const moveAnimationCheckbox = document.getElementById('setting-move-animation');
        if (moveAnimationCheckbox) {
            moveAnimationCheckbox.checked = settings.moveAnimation !== false;
        }

        const captureAnimationCheckbox = document.getElementById('setting-capture-animation');
        if (captureAnimationCheckbox) {
            captureAnimationCheckbox.checked = settings.captureAnimation !== false;
        }

        const volumeSlider = document.getElementById('setting-volume');
        const volumeValue = document.getElementById('volume-value');
        if (volumeSlider && settings.volume !== undefined) {
            volumeSlider.value = settings.volume;
            if (volumeValue) volumeValue.textContent = settings.volume + '%';
        }

        const operationSelect = document.getElementById('setting-operation');
        if (operationSelect && settings.operationMode) {
            operationSelect.value = settings.operationMode;
        }

        const showMovesCheckbox = document.getElementById('setting-show-moves');
        if (showMovesCheckbox) {
            showMovesCheckbox.checked = settings.showValidMoves !== false;
        }

        const showThreatsCheckbox = document.getElementById('setting-show-threats');
        if (showThreatsCheckbox) {
            showThreatsCheckbox.checked = settings.showThreats !== false;
        }

        const accidentCheckbox = document.getElementById('setting-accident-prevention');
        if (accidentCheckbox) {
            accidentCheckbox.checked = settings.accidentPrevention !== false;
        }
    }
};
