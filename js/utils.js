const Utils = {
    // 格式化时间
    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // 格式化毫秒
    formatMilliseconds: function(ms) {
        return this.formatTime(Math.floor(ms / 1000));
    },

    // 生成唯一ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 深拷贝对象
    deepClone: function(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
        
        return obj;
    },

    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 坐标转换：棋盘坐标到像素坐标
    boardToPixel: function(row, col, cellSize) {
        return {
            x: col * cellSize + cellSize / 2,
            y: row * cellSize + cellSize / 2
        };
    },

    // 坐标转换：像素坐标到棋盘坐标
    pixelToBoard: function(x, y, cellSize) {
        return {
            row: Math.round(y / cellSize),
            col: Math.round(x / cellSize)
        };
    },

    // 检查坐标是否在棋盘范围内
    isInBoard: function(row, col) {
        return row >= 0 && row < 10 && col >= 0 && col < 9;
    },

    // 检查是否在红方九宫格
    isInRedPalace: function(row, col) {
        return row >= 7 && row <= 9 && col >= 3 && col <= 5;
    },

    // 检查是否在黑方九宫格
    isInBlackPalace: function(row, col) {
        return row >= 0 && row <= 2 && col >= 3 && col <= 5;
    },

    // 检查是否过河（对于红方）
    hasCrossedRiverRed: function(row) {
        return row <= 4;
    },

    // 检查是否过河（对于黑方）
    hasCrossedRiverBlack: function(row) {
        return row >= 5;
    },

    // 计算两点之间的曼哈顿距离
    manhattanDistance: function(r1, c1, r2, c2) {
        return Math.abs(r1 - r2) + Math.abs(c1 - c2);
    },

    // 计算两点之间的直线距离
    lineDistance: function(r1, c1, r2, c2) {
        return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(c1 - c2, 2));
    },

    // 检查是否是同一行
    isSameRow: function(r1, r2) {
        return r1 === r2;
    },

    // 检查是否是同一列
    isSameCol: function(c1, c2) {
        return c1 === c2;
    },

    // 检查是否是对角线
    isDiagonal: function(r1, c1, r2, c2) {
        return Math.abs(r1 - r2) === Math.abs(c1 - c2);
    },

    // 生成棋谱记法（简化版）
    generateMoveNotation: function(piece, fromRow, fromCol, toRow, toCol, captured) {
        const colNames = ['九', '八', '七', '六', '五', '四', '三', '二', '一'];
        const colNamesBlack = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        const pieceName = piece.color === 'red' 
            ? CONFIG.redPieces[piece.type] 
            : CONFIG.blackPieces[piece.type];
        
        const fromColName = piece.color === 'red' 
            ? colNames[fromCol] 
            : colNamesBlack[fromCol];
        
        let direction = '';
        let distance = '';
        
        if (fromRow === toRow) {
            direction = '平';
            distance = piece.color === 'red' 
                ? colNames[toCol] 
                : colNamesBlack[toCol];
        } else {
            const rowDiff = Math.abs(fromRow - toRow);
            if (piece.color === 'red') {
                direction = fromRow > toRow ? '进' : '退';
            } else {
                direction = fromRow < toRow ? '进' : '退';
            }
            
            if (piece.type === 'horse' || piece.type === 'elephant' || 
                piece.type === 'advisor' || piece.type === 'general') {
                distance = piece.color === 'red' 
                    ? colNames[toCol] 
                    : colNamesBlack[toCol];
            } else {
                distance = rowDiff.toString();
            }
        }
        
        let notation = pieceName + fromColName + direction + distance;
        if (captured) {
            notation += '（吃）';
        }
        
        return notation;
    },

    // 简单的对象比较
    shallowEqual: function(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
        if (obj1 === null || obj2 === null) return false;
        
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) return false;
        
        for (const key of keys1) {
            if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
                return false;
            }
        }
        
        return true;
    },

    // 数组去重
    uniqueArray: function(arr, key) {
        if (!key) {
            return [...new Set(arr)];
        }
        
        const seen = new Set();
        return arr.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },

    // 随机打乱数组
    shuffleArray: function(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    // 从数组中随机选择一个元素
    randomChoice: function(arr) {
        if (arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // 延迟函数
    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 重试函数
    retry: async function(func, maxAttempts = 3, delayMs = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await func();
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
                await this.delay(delayMs);
            }
        }
    },

    // 简单的事件发射器
    createEventEmitter: function() {
        const events = {};
        
        return {
            on: function(event, callback) {
                if (!events[event]) {
                    events[event] = [];
                }
                events[event].push(callback);
            },
            
            off: function(event, callback) {
                if (!events[event]) return;
                events[event] = events[event].filter(cb => cb !== callback);
            },
            
            emit: function(event, ...args) {
                if (!events[event]) return;
                events[event].forEach(callback => callback(...args));
            },
            
            once: function(event, callback) {
                const onceCallback = (...args) => {
                    this.off(event, onceCallback);
                    callback(...args);
                };
                this.on(event, onceCallback);
            }
        };
    },

    // 性能监控
    performance: {
        measures: {},
        
        start: function(name) {
            this.measures[name] = performance.now();
        },
        
        end: function(name) {
            if (this.measures[name]) {
                const duration = performance.now() - this.measures[name];
                delete this.measures[name];
                return duration;
            }
            return 0;
        },
        
        measure: function(name, func) {
            this.start(name);
            const result = func();
            const duration = this.end(name);
            return { result, duration };
        }
    },

    // 安全的JSON操作
    safeJSON: {
        parse: function(str, defaultValue = null) {
            try {
                return JSON.parse(str);
            } catch (e) {
                return defaultValue;
            }
        },
        
        stringify: function(obj, defaultValue = '') {
            try {
                return JSON.stringify(obj);
            } catch (e) {
                return defaultValue;
            }
        }
    },

    // 颜色工具
    color: {
        // 转换RGB到Hex
        rgbToHex: function(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        },
        
        // 转换Hex到RGB
        hexToRgb: function(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        
        // 调整亮度
        lighten: function(hex, percent) {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return hex;
            
            const amount = Math.round(2.55 * percent);
            return this.rgbToHex(
                Math.min(255, rgb.r + amount),
                Math.min(255, rgb.g + amount),
                Math.min(255, rgb.b + amount)
            );
        },
        
        // 调整暗度
        darken: function(hex, percent) {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return hex;
            
            const amount = Math.round(2.55 * percent);
            return this.rgbToHex(
                Math.max(0, rgb.r - amount),
                Math.max(0, rgb.g - amount),
                Math.max(0, rgb.b - amount)
            );
        }
    }
};
