const AI = {
    difficulty: 'normal',
    searchDepth: 2,
    moveTime: 1000,
    isThinking: false,
    thinkingCallback: null,
    moveFoundCallback: null,

    setDifficulty: function(difficulty) {
        this.difficulty = difficulty;
        this.searchDepth = CONFIG.ai.searchDepth[difficulty];
        this.moveTime = CONFIG.ai.moveTime[difficulty];
    },

    getBestMove: function(board, color) {
        this.isThinking = true;
        
        if (this.thinkingCallback) {
            this.thinkingCallback();
        }

        const moves = this.getAllMoves(board, color);
        
        if (moves.length === 0) {
            this.isThinking = false;
            return null;
        }

        if (this.difficulty === 'easy') {
            return this.getRandomMove(moves);
        }

        const bestMove = this.minimaxSearch(board, color, this.searchDepth);
        
        this.isThinking = false;
        return bestMove;
    },

    getAllMoves: function(board, color) {
        const moves = [];
        const pieces = board.getPiecesByColor(color);

        for (const piece of pieces) {
            const validMoves = this.getValidMovesForPiece(board, piece);
            for (const move of validMoves) {
                moves.push({
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

        return moves;
    },

    getValidMovesForPiece: function(board, piece) {
        const moves = [];
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const validation = Rules.validateMove(board, piece, row, col);
                if (validation.valid) {
                    const targetPiece = board.getPieceAt(row, col);
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
    },

    getRandomMove: function(moves) {
        if (this.difficulty === 'easy') {
            const captureMoves = moves.filter(m => m.isCapture);
            if (captureMoves.length > 0 && Math.random() < 0.4) {
                return Utils.randomChoice(captureMoves);
            }
        }
        
        return Utils.randomChoice(moves);
    },

    minimaxSearch: function(board, color, depth) {
        const isMaximizing = color === 'black';
        const opponentColor = color === 'red' ? 'black' : 'red';
        
        let bestMove = null;
        let bestScore = isMaximizing ? -Infinity : Infinity;

        const moves = this.getAllMoves(board, color);
        
        if (moves.length === 0) {
            return null;
        }

        const orderedMoves = this.orderMoves(board, moves, color);

        for (const move of orderedMoves) {
            const testBoard = board.clone();
            const result = testBoard.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol, false);
            
            if (result.success) {
                const score = this.minimax(
                    testBoard,
                    depth - 1,
                    -Infinity,
                    Infinity,
                    opponentColor
                );

                if (isMaximizing) {
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = move;
                    }
                } else {
                    if (score < bestScore) {
                        bestScore = score;
                        bestMove = move;
                    }
                }
            }
        }

        return bestMove;
    },

    minimax: function(board, depth, alpha, beta, color) {
        const isMaximizing = color === 'black';
        const opponentColor = color === 'red' ? 'black' : 'red';

        if (depth === 0) {
            return Rules.evaluateBoard(board, 'black');
        }

        const moves = this.getAllMoves(board, color);

        if (moves.length === 0) {
            if (Rules.isInCheck(board, color)) {
                return isMaximizing ? -10000 : 10000;
            }
            return 0;
        }

        const orderedMoves = this.orderMoves(board, moves, color);

        if (isMaximizing) {
            let maxEval = -Infinity;
            
            for (const move of orderedMoves) {
                const testBoard = board.clone();
                const result = testBoard.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol, false);
                
                if (result.success) {
                    const evalScore = this.minimax(testBoard, depth - 1, alpha, beta, opponentColor);
                    maxEval = Math.max(maxEval, evalScore);
                    alpha = Math.max(alpha, evalScore);
                    
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            
            return maxEval;
        } else {
            let minEval = Infinity;
            
            for (const move of orderedMoves) {
                const testBoard = board.clone();
                const result = testBoard.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol, false);
                
                if (result.success) {
                    const evalScore = this.minimax(testBoard, depth - 1, alpha, beta, opponentColor);
                    minEval = Math.min(minEval, evalScore);
                    beta = Math.min(beta, evalScore);
                    
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            
            return minEval;
        }
    },

    orderMoves: function(board, moves, color) {
        const scoredMoves = moves.map(move => {
            let score = 0;
            
            if (move.isCapture) {
                const pieceValues = {
                    general: 10000,
                    chariot: 900,
                    horse: 400,
                    cannon: 450,
                    elephant: 200,
                    advisor: 200,
                    soldier: 100
                };
                
                const attackerValue = pieceValues[move.piece.type];
                const victimValue = pieceValues[move.capturedPiece.type];
                
                score += victimValue - attackerValue / 10;
            }

            if (this.checkThreat(board, move, color)) {
                score += 50;
            }

            if (move.piece.type === 'soldier') {
                const isRed = color === 'red';
                if (isRed && move.toRow < move.fromRow) {
                    score += 5;
                } else if (!isRed && move.toRow > move.fromRow) {
                    score += 5;
                }
            }

            score += Math.random() * 10;

            return { move, score };
        });

        scoredMoves.sort((a, b) => b.score - a.score);

        return scoredMoves.map(sm => sm.move);
    },

    checkThreat: function(board, move, color) {
        const testBoard = board.clone();
        const result = testBoard.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol, false);
        
        if (result.success) {
            const opponentColor = color === 'red' ? 'black' : 'red';
            return Rules.isInCheck(testBoard, opponentColor);
        }
        
        return false;
    },

    thinkAndMove: async function(board, color, callback) {
        if (this.isThinking) return;

        await Utils.delay(300);

        const bestMove = this.getBestMove(board, color);
        
        if (this.moveFoundCallback && bestMove) {
            this.moveFoundCallback(bestMove);
        }

        if (callback && bestMove) {
            callback(bestMove);
        }

        return bestMove;
    },

    getHintMove: function(board, color) {
        const moves = this.getAllMoves(board, color);
        
        if (moves.length === 0) return null;

        const checkMoves = moves.filter(move => {
            const testBoard = board.clone();
            const result = testBoard.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol, false);
            
            if (result.success) {
                const opponentColor = color === 'red' ? 'black' : 'red';
                return Rules.isInCheck(testBoard, opponentColor);
            }
            return false;
        });

        if (checkMoves.length > 0) {
            return Utils.randomChoice(checkMoves);
        }

        const captureMoves = moves.filter(m => m.isCapture);
        if (captureMoves.length > 0) {
            captureMoves.sort((a, b) => {
                const pieceValues = {
                    general: 10000,
                    chariot: 900,
                    horse: 400,
                    cannon: 450,
                    elephant: 200,
                    advisor: 200,
                    soldier: 100
                };
                return pieceValues[b.capturedPiece.type] - pieceValues[a.capturedPiece.type];
            });
            return captureMoves[0];
        }

        return Utils.randomChoice(moves);
    }
};
