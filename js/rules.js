const Rules = {
    validateMove: function(board, piece, toRow, toCol) {
        if (!Utils.isInBoard(toRow, toCol)) {
            return { valid: false, message: '目标位置超出棋盘范围' };
        }

        if (piece.row === toRow && piece.col === toCol) {
            return { valid: false, message: '不能原地不动' };
        }

        const targetPiece = board.getPieceAt(toRow, toCol);
        if (targetPiece && targetPiece.color === piece.color) {
            return { valid: false, message: '不能吃掉己方棋子' };
        }

        let result;
        switch (piece.type) {
            case 'general':
                result = this.validateGeneralMove(board, piece, toRow, toCol);
                break;
            case 'advisor':
                result = this.validateAdvisorMove(board, piece, toRow, toCol);
                break;
            case 'elephant':
                result = this.validateElephantMove(board, piece, toRow, toCol);
                break;
            case 'horse':
                result = this.validateHorseMove(board, piece, toRow, toCol);
                break;
            case 'chariot':
                result = this.validateChariotMove(board, piece, toRow, toCol);
                break;
            case 'cannon':
                result = this.validateCannonMove(board, piece, toRow, toCol);
                break;
            case 'soldier':
                result = this.validateSoldierMove(board, piece, toRow, toCol);
                break;
            default:
                result = { valid: false, message: '未知的棋子类型' };
        }

        if (!result.valid) {
            return result;
        }

        if (this.wouldBeInCheck(board, piece, toRow, toCol)) {
            return { valid: false, message: '不能送将！' };
        }

        if (piece.type === 'general') {
            if (this.wouldFaceGeneral(board, piece, toRow, toCol)) {
                return { valid: false, message: '将帅不能对面！' };
            }
        }

        return { valid: true };
    },

    validateGeneralMove: function(board, piece, toRow, toCol) {
        const isRed = piece.color === 'red';
        const inPalace = isRed 
            ? Utils.isInRedPalace(toRow, toCol)
            : Utils.isInBlackPalace(toRow, toCol);
        
        if (!inPalace) {
            return { valid: false, message: '将/帅不能走出九宫格' };
        }

        const rowDiff = Math.abs(toRow - piece.row);
        const colDiff = Math.abs(toCol - piece.col);

        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
            return { valid: false, message: '将/帅每次只能走一格' };
        }

        return { valid: true };
    },

    validateAdvisorMove: function(board, piece, toRow, toCol) {
        const isRed = piece.color === 'red';
        const inPalace = isRed 
            ? Utils.isInRedPalace(toRow, toCol)
            : Utils.isInBlackPalace(toRow, toCol);
        
        if (!inPalace) {
            return { valid: false, message: '士/仕不能走出九宫格' };
        }

        const rowDiff = Math.abs(toRow - piece.row);
        const colDiff = Math.abs(toCol - piece.col);

        if (!(rowDiff === 1 && colDiff === 1)) {
            return { valid: false, message: '士/仕只能斜走一格' };
        }

        return { valid: true };
    },

    validateElephantMove: function(board, piece, toRow, toCol) {
        const isRed = piece.color === 'red';
        
        if (isRed) {
            if (Utils.hasCrossedRiverRed(toRow)) {
                return { valid: false, message: '相不能过河' };
            }
        } else {
            if (Utils.hasCrossedRiverBlack(toRow)) {
                return { valid: false, message: '象不能过河' };
            }
        }

        const rowDiff = Math.abs(toRow - piece.row);
        const colDiff = Math.abs(toCol - piece.col);

        if (!(rowDiff === 2 && colDiff === 2)) {
            return { valid: false, message: '象/相走田字' };
        }

        const eyeRow = (piece.row + toRow) / 2;
        const eyeCol = (piece.col + toCol) / 2;
        
        if (!board.isPositionEmpty(eyeRow, eyeCol)) {
            return { valid: false, message: '象眼被塞住' };
        }

        return { valid: true };
    },

    validateHorseMove: function(board, piece, toRow, toCol) {
        const rowDiff = Math.abs(toRow - piece.row);
        const colDiff = Math.abs(toCol - piece.col);

        if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
            return { valid: false, message: '马走日字' };
        }

        if (rowDiff === 2) {
            const legRow = piece.row + (toRow > piece.row ? 1 : -1);
            if (!board.isPositionEmpty(legRow, piece.col)) {
                return { valid: false, message: '马腿被绊住' };
            }
        } else {
            const legCol = piece.col + (toCol > piece.col ? 1 : -1);
            if (!board.isPositionEmpty(piece.row, legCol)) {
                return { valid: false, message: '马腿被绊住' };
            }
        }

        return { valid: true };
    },

    validateChariotMove: function(board, piece, toRow, toCol) {
        const sameRow = Utils.isSameRow(piece.row, toRow);
        const sameCol = Utils.isSameCol(piece.col, toCol);

        if (!sameRow && !sameCol) {
            return { valid: false, message: '车走直线' };
        }

        if (board.hasPieceBetween(piece.row, piece.col, toRow, toCol)) {
            return { valid: false, message: '车不能越子' };
        }

        return { valid: true };
    },

    validateCannonMove: function(board, piece, toRow, toCol) {
        const sameRow = Utils.isSameRow(piece.row, toRow);
        const sameCol = Utils.isSameCol(piece.col, toCol);

        if (!sameRow && !sameCol) {
            return { valid: false, message: '炮走直线' };
        }

        const piecesBetween = board.countPiecesBetween(piece.row, piece.col, toRow, toCol);
        const targetPiece = board.getPieceAt(toRow, toCol);

        if (targetPiece) {
            if (piecesBetween !== 1) {
                return { valid: false, message: '炮打隔山子' };
            }
        } else {
            if (piecesBetween !== 0) {
                return { valid: false, message: '炮移动时不能越子' };
            }
        }

        return { valid: true };
    },

    validateSoldierMove: function(board, piece, toRow, toCol) {
        const isRed = piece.color === 'red';
        const rowDiff = toRow - piece.row;
        const colDiff = Math.abs(toCol - piece.col);

        if (colDiff > 1) {
            return { valid: false, message: '兵/卒不能横向走两格' };
        }

        if (Math.abs(rowDiff) > 1) {
            return { valid: false, message: '兵/卒不能纵向走两格' };
        }

        if (isRed) {
            if (rowDiff > 0) {
                return { valid: false, message: '兵不能后退' };
            }
            
            if (!Utils.hasCrossedRiverRed(piece.row)) {
                if (colDiff !== 0) {
                    return { valid: false, message: '未过河的兵不能横走' };
                }
            }
        } else {
            if (rowDiff < 0) {
                return { valid: false, message: '卒不能后退' };
            }
            
            if (!Utils.hasCrossedRiverBlack(piece.row)) {
                if (colDiff !== 0) {
                    return { valid: false, message: '未过河的卒不能横走' };
                }
            }
        }

        if (rowDiff === 0 && colDiff === 0) {
            return { valid: false, message: '不能原地不动' };
        }

        return { valid: true };
    },

    isInCheck: function(board, color) {
        const generalPos = board.getGeneralPosition(color);
        const opponentColor = color === 'red' ? 'black' : 'red';
        const opponentPieces = board.getPiecesByColor(opponentColor);

        for (const piece of opponentPieces) {
            const validation = this.validateAttackWithoutCheck(board, piece, generalPos.row, generalPos.col);
            if (validation.valid) {
                return true;
            }
        }

        return false;
    },

    validateAttackWithoutCheck: function(board, piece, toRow, toCol) {
        if (!Utils.isInBoard(toRow, toCol)) {
            return { valid: false };
        }

        if (piece.row === toRow && piece.col === toCol) {
            return { valid: false };
        }

        switch (piece.type) {
            case 'general':
                return this.validateGeneralAttack(board, piece, toRow, toCol);
            case 'advisor':
                return this.validateAdvisorMove(board, piece, toRow, toCol);
            case 'elephant':
                return this.validateElephantMove(board, piece, toRow, toCol);
            case 'horse':
                return this.validateHorseMove(board, piece, toRow, toCol);
            case 'chariot':
                return this.validateChariotMove(board, piece, toRow, toCol);
            case 'cannon':
                return this.validateCannonMove(board, piece, toRow, toCol);
            case 'soldier':
                return this.validateSoldierMove(board, piece, toRow, toCol);
            default:
                return { valid: false };
        }
    },

    validateGeneralAttack: function(board, piece, toRow, toCol) {
        const isRed = piece.color === 'red';
        
        const rowDiff = Math.abs(toRow - piece.row);
        const colDiff = Math.abs(toCol - piece.col);

        if (rowDiff === 0 && colDiff > 0) {
            const targetPiece = board.getPieceAt(toRow, toCol);
            if (targetPiece && targetPiece.type === 'general' && targetPiece.color !== piece.color) {
                if (!board.hasPieceBetween(piece.row, piece.col, toRow, toCol)) {
                    return { valid: true };
                }
            }
        }

        const inPalace = isRed 
            ? Utils.isInRedPalace(toRow, toCol)
            : Utils.isInBlackPalace(toRow, toCol);
        
        if (!inPalace) {
            return { valid: false };
        }

        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
            return { valid: false };
        }

        return { valid: true };
    },

    wouldBeInCheck: function(board, piece, toRow, toCol) {
        const testBoard = board.clone();
        
        const testPiece = testBoard.pieces.find(p => p.id === piece.id);
        if (!testPiece) return true;

        const targetPiece = testBoard.getPieceAt(toRow, toCol);
        if (targetPiece) {
            targetPiece.isCaptured = true;
        }

        testPiece.row = toRow;
        testPiece.col = toCol;

        if (testPiece.type === 'general') {
            testBoard.generalPositions[testPiece.color] = { row: toRow, col: toCol };
        }

        return this.isInCheck(testBoard, piece.color);
    },

    wouldFaceGeneral: function(board, piece, toRow, toCol) {
        const testBoard = board.clone();
        
        const testPiece = testBoard.pieces.find(p => p.id === piece.id);
        if (!testPiece) return false;

        const targetPiece = testBoard.getPieceAt(toRow, toCol);
        if (targetPiece) {
            targetPiece.isCaptured = true;
        }

        testPiece.row = toRow;
        testPiece.col = toCol;
        testBoard.generalPositions[piece.color] = { row: toRow, col: toCol };

        const redGeneral = testBoard.generalPositions.red;
        const blackGeneral = testBoard.generalPositions.black;

        if (redGeneral.col === blackGeneral.col) {
            const piecesBetween = testBoard.countPiecesBetween(
                redGeneral.row, redGeneral.col,
                blackGeneral.row, blackGeneral.col
            );
            return piecesBetween === 0;
        }

        return false;
    },

    isCheckmate: function(board, color) {
        if (!this.isInCheck(board, color)) {
            return false;
        }

        const pieces = board.getPiecesByColor(color);
        
        for (const piece of pieces) {
            const validMoves = this.getAllValidMovesForPiece(board, piece);
            
            for (const move of validMoves) {
                const testBoard = board.clone();
                const testPiece = testBoard.pieces.find(p => p.id === piece.id);
                
                if (!testPiece) continue;

                const targetPiece = testBoard.getPieceAt(move.row, move.col);
                if (targetPiece) {
                    targetPiece.isCaptured = true;
                }

                testPiece.row = move.row;
                testPiece.col = move.col;
                
                if (testPiece.type === 'general') {
                    testBoard.generalPositions[testPiece.color] = { row: move.row, col: move.col };
                }

                if (!this.isInCheck(testBoard, color)) {
                    return false;
                }
            }
        }

        return true;
    },

    isStalemate: function(board, color) {
        if (this.isInCheck(board, color)) {
            return false;
        }

        const pieces = board.getPiecesByColor(color);
        
        for (const piece of pieces) {
            const validMoves = this.getAllValidMovesForPiece(board, piece);
            
            if (validMoves.length > 0) {
                return false;
            }
        }

        return true;
    },

    getAllValidMovesForPiece: function(board, piece) {
        const moves = [];
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const validation = this.validateMove(board, piece, row, col);
                if (validation.valid) {
                    moves.push({ row, col });
                }
            }
        }
        
        return moves;
    },

    isDraw: function(board) {
        const redPieces = board.getPiecesByColor('red');
        const blackPieces = board.getPiecesByColor('black');

        if (this.isInsufficientMaterial(redPieces) && this.isInsufficientMaterial(blackPieces)) {
            return true;
        }

        return false;
    },

    isInsufficientMaterial: function(pieces) {
        const hasGeneral = pieces.some(p => p.type === 'general');
        if (!hasGeneral) return false;

        const nonGeneralPieces = pieces.filter(p => p.type !== 'general');

        if (nonGeneralPieces.length === 0) return true;

        if (nonGeneralPieces.length === 1) {
            const piece = nonGeneralPieces[0];
            return piece.type === 'advisor' || piece.type === 'elephant';
        }

        if (nonGeneralPieces.length === 2) {
            const types = nonGeneralPieces.map(p => p.type);
            if (types.includes('advisor') && types.includes('advisor')) return true;
            if (types.includes('elephant') && types.includes('elephant')) return true;
            if (types.includes('advisor') && types.includes('elephant')) return true;
        }

        return false;
    },

    evaluateBoard: function(board, color) {
        let score = 0;
        
        const pieceValues = {
            general: 10000,
            chariot: 900,
            horse: 400,
            cannon: 450,
            elephant: 200,
            advisor: 200,
            soldier: 100
        };

        const pieces = board.getPiecesByColor(color);
        const opponentColor = color === 'red' ? 'black' : 'red';
        const opponentPieces = board.getPiecesByColor(opponentColor);

        for (const piece of pieces) {
            score += pieceValues[piece.type];
            
            score += this.getPositionBonus(piece, color);
        }

        for (const piece of opponentPieces) {
            score -= pieceValues[piece.type];
            
            score -= this.getPositionBonus(piece, opponentColor);
        }

        if (this.isInCheck(board, opponentColor)) {
            score += 50;
        }

        if (this.isCheckmate(board, opponentColor)) {
            score += 10000;
        }

        if (this.isInCheck(board, color)) {
            score -= 50;
        }

        if (this.isCheckmate(board, color)) {
            score -= 10000;
        }

        return score;
    },

    getPositionBonus: function(piece, color) {
        let bonus = 0;
        const isRed = color === 'red';
        
        switch (piece.type) {
            case 'soldier':
                if (isRed) {
                    if (Utils.hasCrossedRiverRed(piece.row)) {
                        bonus += 20;
                    }
                    bonus += (9 - piece.row) * 2;
                } else {
                    if (Utils.hasCrossedRiverBlack(piece.row)) {
                        bonus += 20;
                    }
                    bonus += piece.row * 2;
                }
                bonus += (4 - Math.abs(piece.col - 4)) * 2;
                break;

            case 'horse':
                const horseMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                let validHorseMoves = 0;
                for (const [dr, dc] of horseMoves) {
                    if (Utils.isInBoard(piece.row + dr, piece.col + dc)) {
                        validHorseMoves++;
                    }
                }
                bonus += validHorseMoves * 3;
                bonus += (4 - Math.abs(piece.col - 4)) * 2;
                break;

            case 'cannon':
                bonus += (4 - Math.abs(piece.col - 4)) * 2;
                break;

            case 'chariot':
                bonus += (4 - Math.abs(piece.col - 4)) * 3;
                if (isRed) {
                    bonus += (9 - piece.row) * 2;
                } else {
                    bonus += piece.row * 2;
                }
                break;
        }

        return bonus;
    }
};
