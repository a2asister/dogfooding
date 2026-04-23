const Utils = {
    lerp: function(start, end, factor) {
        return start + (end - start) * factor;
    },
    
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    map: function(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    
    randomRange: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    getWindSpeedData: function(level) {
        const levels = CONFIG.windSpeed.levels;
        const index = Math.floor(level) - 1;
        if (index >= 0 && index < levels.length) {
            return levels[index];
        }
        return levels[CONFIG.windSpeed.defaultLevel - 1];
    },
    
    formatNumber: function(num, decimals = 1) {
        return num.toFixed(decimals);
    },
    
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
    
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

const EventEmitter = {
    events: {},
    
    on: function(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },
    
    off: function(event, callback) {
        if (!this.events[event]) return;
        
        if (callback) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        } else {
            delete this.events[event];
        }
    },
    
    emit: function(event, data) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            callback(data);
        });
    }
};
