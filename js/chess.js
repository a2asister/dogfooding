class Piece {
    constructor(type, color, row, col, id) {
        this.type = type;
        this.color = color;
        this.row = row;
        this.col = col;
        this.id = id || Utils.generateId();
        this.isCaptured = false;
    }

    getName() {
        if (this.color === 'red') {
            return CONFIG.redPieces[this.type];
        }
        return CONFIG.blackPieces[this.type];
    }

    clone() {
        const cloned = new Piece(this.type, this.color, this.row, this.col, this.id);
        cloned.isCaptured = this.isCaptured;
        return cloned;
    }
}

class ChessBoard {
    constructor() {
        this.pieces = [];
        this.moveHistory = [];
        this.currentMoveIndex = -1;
        this.capturedPieces = {
            red: [],
            black: []
        };
        this.generalPositions = {
            red: { row: 9, col: 4 },
            black: { row: 0, col: 4 }
        };
        this.initializeBoard();
    }

    initializeBoard() {
        this.pieces = [];
        CONFIG.initialLayout.forEach((layout, index) => {
            const piece = new Piece(
                layout.type,
                layout.color,
                layout.row,
                layout.col,
                `piece_${index}`
            );
            this.pieces.push(piece);
            
            if (layout.type === 'general') {
                this.generalPositions[layout.color] = { row: layout.row, col: layout.col };
            }
        });
        
        this.moveHistory = [];
        this.currentMoveIndex = -1;
        this.capturedPieces = { red: [], black: [] };
    }

    getPieceAt(row, col) {
        return this.pieces.find(p => !p.isCaptured && p.row === row && p.col === col);
    }

    getPiecesByColor(color) {
        return this.pieces.filter(p => !p.isCaptured && p.color === color);
    }

    getGeneralPosition(color) {
        return { ...this.generalPositions[color] };
    }

    isPositionEmpty(row, col) {
        return !this.getPieceAt(row, col);
    }

    hasPieceBetween(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) {
            return true;
        }
        
        const isHorizontal = fromRow === toRow;
        const start = isHorizontal ? Math.min(fromCol, toCol) : Math.min(fromRow, toRow);
        const end = isHorizontal ? Math.max(fromCol, toCol) : Math.max(fromRow, toRow);
        
        for (let i = start + 1; i < end; i++) {
            const row = isHorizontal ? fromRow : i;
            const col = isHorizontal ? i : fromCol;
            if (this.getPieceAt(row, col)) {
                return true;
            }
        }
        return false;
    }

    countPiecesBetween(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) {
            return -1;
        }
        
        const isHorizontal = fromRow === toRow;
        const start = isHorizontal ? Math.min(fromCol, toCol) : Math.min(fromRow, toRow);
        const end = isHorizontal ? Math.max(fromCol, toCol) : Math.max(fromRow, toRow);
        
        let count = 0;
        for (let i = start + 1; i < end; i++) {
            const row = isHorizontal ? fromRow : i;
            const col = isHorizontal ? i : fromCol;
            if (this.getPieceAt(row, col)) {
                count++;
            }
        }
        return count;
    }

    movePiece(fromRow, fromCol, toRow, toCol, validate = true) {
        const piece = this.getPieceAt(fromRow, fromCol);
        if (!piece) {
            return { success: false, error: '没有找到棋子' };
        }

        if (validate) {
            const validation = Rules.validateMove(this, piece, toRow, toCol);
            if (!validation.valid) {
                return { success: false, error: validation.message };
            }
        }

        const capturedPiece = this.getPieceAt(toRow, toCol);
        const moveRecord = {
            id: Utils.generateId(),
            piece: piece.clone(),
            fromRow,
            fromCol,
            toRow,
            toCol,
            captured: capturedPiece ? capturedPiece.clone() : null,
            timestamp: Date.now(),
            notation: Utils.generateMoveNotation(piece, fromRow, fromCol, toRow, toCol, !!capturedPiece)
        };

        if (capturedPiece) {
            capturedPiece.isCaptured = true;
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
        }

        piece.row = toRow;
        piece.col = toCol;

        if (piece.type === 'general') {
            this.generalPositions[piece.color] = { row: toRow, col: toCol };
        }

        if (this.currentMoveIndex < this.moveHistory.length - 1) {
            this.moveHistory = this.moveHistory.slice(0, this.currentMoveIndex + 1);
        }
        this.moveHistory.push(moveRecord);
        this.currentMoveIndex = this.moveHistory.length - 1;

        return {
            success: true,
            move: moveRecord,
            captured: capturedPiece,
            isCheck: Rules.isInCheck(this, piece.color === 'red' ? 'black' : 'red'),
            isCheckmate: Rules.isCheckmate(this, piece.color === 'red' ? 'black' : 'red'),
            isStalemate: Rules.isStalemate(this, piece.color === 'red' ? 'black' : 'red')
        };
    }

    undoMove() {
        if (this.currentMoveIndex < 0) {
            return { success: false, error: '没有可撤销的走棋' };
        }

        const move = this.moveHistory[this.currentMoveIndex];
        
        const piece = this.getPieceAt(move.toRow, move.toCol);
        if (piece && piece.id === move.piece.id) {
            piece.row = move.fromRow;
            piece.col = move.fromCol;
            
            if (piece.type === 'general') {
                this.generalPositions[piece.color] = { row: move.fromRow, col: move.fromCol };
            }
        }

        if (move.captured) {
            const capturedIndex = this.capturedPieces[move.captured.color].findIndex(
                p => p.id === move.captured.id
            );
            if (capturedIndex !== -1) {
                this.capturedPieces[move.captured.color].splice(capturedIndex, 1);
            }
            
            const capturedPiece = this.pieces.find(p => p.id === move.captured.id);
            if (capturedPiece) {
                capturedPiece.isCaptured = false;
            }
        }

        this.currentMoveIndex--;

        return {
            success: true,
            move: move
        };
    }

    redoMove() {
        if (this.currentMoveIndex >= this.moveHistory.length - 1) {
            return { success: false, error: '没有可重做的走棋' };
        }

        this.currentMoveIndex++;
        const move = this.moveHistory[this.currentMoveIndex];

        const piece = this.getPieceAt(move.fromRow, move.fromCol);
        if (piece && piece.id === move.piece.id) {
            piece.row = move.toRow;
            piece.col = move.toCol;
            
            if (piece.type === 'general') {
                this.generalPositions[piece.color] = { row: move.toRow, col: move.toCol };
            }
        }

        if (move.captured) {
            const capturedPiece = this.pieces.find(p => p.id === move.captured.id);
            if (capturedPiece) {
                capturedPiece.isCaptured = true;
            }
        }

        return {
            success: true,
            move: move
        };
    }

    goToMove(index) {
        if (index < -1 || index >= this.moveHistory.length) {
            return { success: false, error: '无效的步数索引' };
        }

        const targetIndex = index;
        
        while (this.currentMoveIndex > targetIndex) {
            this.undoMove();
        }
        
        while (this.currentMoveIndex < targetIndex) {
            this.redoMove();
        }

        return { success: true };
    }

    getValidMoves(piece) {
        const moves = [];
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const validation = Rules.validateMove(this, piece, row, col);
                if (validation.valid) {
                    const targetPiece = this.getPieceAt(row, col);
                    moves.push({
                        row,
                        col,
                        isCapture: !!targetPiece,
                        capturedPiece: targetPiece
                    });
                }
            }
        }
        
        return moves;
    }

    getAllValidMoves(color) {
        const pieces = this.getPiecesByColor(color);
        const allMoves = [];
        
        for (const piece of pieces) {
            const moves = this.getValidMoves(piece);
            for (const move of moves) {
                allMoves.push({
                    piece,
                    fromRow: piece.row,
                    fromCol: piece.col,
                    toRow: move.row,
                    toCol: move.col,
                    isCapture: move.isCapture,
                    capturedPiece: move.capturedPiece
                });
            }
        }
        
        return allMoves;
    }

    clone() {
        const cloned = new ChessBoard();
        cloned.pieces = this.pieces.map(p => p.clone());
        cloned.moveHistory = Utils.deepClone(this.moveHistory);
        cloned.currentMoveIndex = this.currentMoveIndex;
        cloned.capturedPieces = {
            red: this.capturedPieces.red.map(p => p.clone()),
            black: this.capturedPieces.black.map(p => p.clone())
        };
        cloned.generalPositions = {
            red: { ...this.generalPositions.red },
            black: { ...this.generalPositions.black }
        };
        return cloned;
    }

    getBoardState() {
        return {
            pieces: this.pieces.map(p => ({
                id: p.id,
                type: p.type,
                color: p.color,
                row: p.row,
                col: p.col,
                isCaptured: p.isCaptured
            })),
            moveHistory: Utils.deepClone(this.moveHistory),
            currentMoveIndex: this.currentMoveIndex,
            capturedPieces: {
                red: this.capturedPieces.red.map(p => ({ ...p })),
                black: this.capturedPieces.black.map(p => ({ ...p }))
            },
            generalPositions: {
                red: { ...this.generalPositions.red },
                black: { ...this.generalPositions.black }
            }
        };
    }

    loadBoardState(state) {
        try {
            this.pieces = state.pieces.map(p => {
                const piece = new Piece(p.type, p.color, p.row, p.col, p.id);
                piece.isCaptured = p.isCaptured;
                return piece;
            });
            this.moveHistory = Utils.deepClone(state.moveHistory);
            this.currentMoveIndex = state.currentMoveIndex;
            this.capturedPieces = {
                red: state.capturedPieces.red.map(p => {
                    const piece = new Piece(p.type, p.color, p.row, p.col, p.id);
                    piece.isCaptured = true;
                    return piece;
                }),
                black: state.capturedPieces.black.map(p => {
                    const piece = new Piece(p.type, p.color, p.row, p.col, p.id);
                    piece.isCaptured = true;
                    return piece;
                })
            };
            this.generalPositions = {
                red: { ...state.generalPositions.red },
                black: { ...state.generalPositions.black }
            };
            return true;
        } catch (e) {
            console.error('加载棋盘状态失败:', e);
            return false;
        }
    }
}
