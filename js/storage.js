/**
 * 酒店价格与利润配置系统 - 数据存储管理
 * 所有数据使用localStorage本地存储
 */

const StorageManager = {
    // 存储键名
    STORAGE_KEYS: {
        ROOM_TYPES: 'hotel_room_types',
        PRICING_COEFFICIENTS: 'hotel_pricing_coefficients',
        PRICING_CONFIG: 'hotel_pricing_config',
        PRICING_LOGS: 'hotel_pricing_logs',
        PRICE_LOCKS: 'hotel_price_locks',
        PROMOTIONS: 'hotel_promotions',
        OPERATION_LOGS: 'hotel_operation_logs',
        BOOKING_DATA: 'hotel_booking_data',
        COMPETITOR_DATA: 'hotel_competitor_data',
        HISTORY_DATA: 'hotel_history_data',
        ANALYTICS_DATA: 'hotel_analytics_data'
    },

    // 默认数据
    DEFAULT_DATA: {
        roomTypes: [
            {
                id: 'rt_1',
                name: '标准间',
                totalRooms: 20,
                basePrice: 280,
                costPrice: 120,
                description: '25㎡，双床1.2m*2，含早餐',
                currentPrice: 280,
                bookedRooms: 8,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'rt_2',
                name: '大床房',
                totalRooms: 15,
                basePrice: 320,
                costPrice: 130,
                description: '30㎡，大床1.8m*1，含早餐',
                currentPrice: 320,
                bookedRooms: 10,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'rt_3',
                name: '豪华套房',
                totalRooms: 5,
                basePrice: 680,
                costPrice: 250,
                description: '50㎡，大床2.0m*1，客厅，迷你吧',
                currentPrice: 680,
                bookedRooms: 2,
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ],
        pricingCoefficients: {
            offSeason: 0.8,
            normalSeason: 1.0,
            peakSeason: 1.3,
            weekday: 0.95,
            weekend: 1.1,
            holiday: 1.5,
            event: 1.2
        },
        pricingConfig: {
            threshold: 65,
            belowThresholdAdjust: 5,
            aboveThresholdAdjust: 8,
            abnormalAdjust: 3,
            competitorStrategy: 'follow',
            autoPricing: true
        },
        pricingLogs: [],
        priceLocks: [],
        promotions: [],
        operationLogs: [],
        bookingData: {
            todayBookings: 3,
            bookingSpeed: 'normal',
            lastBookingTime: null
        },
        competitorData: [
            {
                id: 'comp_1',
                hotelName: '如家快捷酒店',
                roomType: '标准间',
                listedPrice: 268,
                historicalAvgPrice: 280,
                priceChange: -4.3,
                isValid: true,
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'comp_2',
                hotelName: '汉庭酒店',
                roomType: '标准间',
                listedPrice: 278,
                historicalAvgPrice: 290,
                priceChange: -4.1,
                isValid: true,
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'comp_3',
                hotelName: '7天连锁',
                roomType: '标准间',
                listedPrice: 99,
                historicalAvgPrice: 260,
                priceChange: -61.9,
                isValid: false,
                filterReason: '短期秒杀活动',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'comp_4',
                hotelName: '锦江之星',
                roomType: '大床房',
                listedPrice: 310,
                historicalAvgPrice: 320,
                priceChange: -3.1,
                isValid: true,
                lastUpdated: new Date().toISOString()
            }
        ],
        historyData: {
            samePeriodLastYear: {
                occupancyRate: 72,
                avgRevenue: 295,
                totalRevenue: 88500
            },
            samePeriodLastMonth: {
                occupancyRate: 68,
                avgRevenue: 285,
                totalRevenue: 85500
            }
        },
        analyticsData: {
            period: 30,
            startDate: null,
            endDate: null,
            avgOccupancy: 65,
            avgRevenue: 280,
            totalProfit: 45000,
            pricingCount: 12,
            autoCount: 8,
            manualCount: 4,
            bookingChange: 5.2,
            revenueChange: 3.8,
            profitChange: 6.1
        }
    },

    // 将下划线命名转换为驼峰命名
    toCamelCase(str) {
        return str.toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    },

    // 检查数据类型是否正确
    isDataTypeCorrect(storedData, defaultData) {
        if (defaultData === null || defaultData === undefined) return true;
        if (storedData === null || storedData === undefined) return false;
        
        const storedType = Array.isArray(storedData) ? 'array' : typeof storedData;
        const defaultType = Array.isArray(defaultData) ? 'array' : typeof defaultData;
        
        return storedType === defaultType;
    },

    // 初始化存储
    init() {
        for (const [key, value] of Object.entries(this.STORAGE_KEYS)) {
            const dataKey = this.toCamelCase(key);
            const defaultData = this.DEFAULT_DATA[dataKey] || [];
            
            const storedData = this.load(value, null);
            
            if (storedData === null || !this.isDataTypeCorrect(storedData, defaultData)) {
                this.save(value, defaultData);
            }
        }
    },

    // 保存数据
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    },

    // 读取数据
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    },

    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },

    // 清空所有数据
    clearAll() {
        for (const key of Object.values(this.STORAGE_KEYS)) {
            localStorage.removeItem(key);
        }
    },

    // 导出所有数据
    exportAll() {
        const allData = {};
        for (const [keyName, storageKey] of Object.entries(this.STORAGE_KEYS)) {
            allData[keyName] = this.load(storageKey);
        }
        return allData;
    },

    // 导入数据
    importAll(data) {
        try {
            for (const [keyName, value] of Object.entries(data)) {
                const storageKey = this.STORAGE_KEYS[keyName];
                if (storageKey) {
                    this.save(storageKey, value);
                }
            }
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    },

    // 房型数据操作
    getRoomTypes() {
        return this.load(this.STORAGE_KEYS.ROOM_TYPES, this.DEFAULT_DATA.roomTypes);
    },

    saveRoomTypes(roomTypes) {
        return this.save(this.STORAGE_KEYS.ROOM_TYPES, roomTypes);
    },

    addRoomType(roomType) {
        const roomTypes = this.getRoomTypes();
        roomType.id = 'rt_' + Date.now();
        roomType.createdAt = new Date().toISOString();
        roomType.currentPrice = roomType.basePrice;
        roomType.bookedRooms = 0;
        roomType.status = 'active';
        roomTypes.push(roomType);
        return this.saveRoomTypes(roomTypes);
    },

    updateRoomType(id, updates) {
        const roomTypes = this.getRoomTypes();
        const index = roomTypes.findIndex(rt => rt.id === id);
        if (index !== -1) {
            roomTypes[index] = { ...roomTypes[index], ...updates };
            return this.saveRoomTypes(roomTypes);
        }
        return false;
    },

    deleteRoomType(id) {
        const roomTypes = this.getRoomTypes();
        const filtered = roomTypes.filter(rt => rt.id !== id);
        return this.saveRoomTypes(filtered);
    },

    // 调价系数操作
    getPricingCoefficients() {
        return this.load(this.STORAGE_KEYS.PRICING_COEFFICIENTS, this.DEFAULT_DATA.pricingCoefficients);
    },

    savePricingCoefficients(coeffs) {
        return this.save(this.STORAGE_KEYS.PRICING_COEFFICIENTS, coeffs);
    },

    // 调价配置操作
    getPricingConfig() {
        return this.load(this.STORAGE_KEYS.PRICING_CONFIG, this.DEFAULT_DATA.pricingConfig);
    },

    savePricingConfig(config) {
        return this.save(this.STORAGE_KEYS.PRICING_CONFIG, config);
    },

    // 调价日志操作
    getPricingLogs() {
        return this.load(this.STORAGE_KEYS.PRICING_LOGS, []);
    },

    addPricingLog(log) {
        const logs = this.getPricingLogs();
        log.id = 'pl_' + Date.now();
        log.createdAt = new Date().toISOString();
        logs.unshift(log);
        return this.save(this.STORAGE_KEYS.PRICING_LOGS, logs);
    },

    // 价格锁定操作
    getPriceLocks() {
        return this.load(this.STORAGE_KEYS.PRICE_LOCKS, []);
    },

    addPriceLock(lock) {
        const locks = this.getPriceLocks();
        lock.id = 'lock_' + Date.now();
        lock.createdAt = new Date().toISOString();
        lock.status = 'active';
        locks.push(lock);
        return this.save(this.STORAGE_KEYS.PRICE_LOCKS, locks);
    },

    updatePriceLock(id, updates) {
        const locks = this.getPriceLocks();
        const index = locks.findIndex(l => l.id === id);
        if (index !== -1) {
            locks[index] = { ...locks[index], ...updates };
            return this.save(this.STORAGE_KEYS.PRICE_LOCKS, locks);
        }
        return false;
    },

    deletePriceLock(id) {
        const locks = this.getPriceLocks();
        const filtered = locks.filter(l => l.id !== id);
        return this.save(this.STORAGE_KEYS.PRICE_LOCKS, filtered);
    },

    // 促销活动操作
    getPromotions() {
        return this.load(this.STORAGE_KEYS.PROMOTIONS, []);
    },

    addPromotion(promotion) {
        const promotions = this.getPromotions();
        promotion.id = 'promo_' + Date.now();
        promotion.createdAt = new Date().toISOString();
        promotion.status = 'active';
        promotions.push(promotion);
        return this.save(this.STORAGE_KEYS.PROMOTIONS, promotions);
    },

    updatePromotion(id, updates) {
        const promotions = this.getPromotions();
        const index = promotions.findIndex(p => p.id === id);
        if (index !== -1) {
            promotions[index] = { ...promotions[index], ...updates };
            return this.save(this.STORAGE_KEYS.PROMOTIONS, promotions);
        }
        return false;
    },

    deletePromotion(id) {
        const promotions = this.getPromotions();
        const filtered = promotions.filter(p => p.id !== id);
        return this.save(this.STORAGE_KEYS.PROMOTIONS, filtered);
    },

    // 操作日志操作
    getOperationLogs() {
        return this.load(this.STORAGE_KEYS.OPERATION_LOGS, []);
    },

    addOperationLog(log) {
        const logs = this.getOperationLogs();
        log.id = 'log_' + Date.now();
        log.createdAt = new Date().toISOString();
        log.operator = '系统管理员';
        logs.unshift(log);
        return this.save(this.STORAGE_KEYS.OPERATION_LOGS, logs);
    },

    // 竞品数据操作
    getCompetitorData() {
        return this.load(this.STORAGE_KEYS.COMPETITOR_DATA, this.DEFAULT_DATA.competitorData);
    },

    getFilteredCompetitorData() {
        const data = this.getCompetitorData();
        return data.filter(item => item.isValid);
    },

    getInvalidCompetitorCount() {
        const data = this.getCompetitorData();
        return data.filter(item => !item.isValid).length;
    },

    // 历史数据操作
    getHistoryData() {
        return this.load(this.STORAGE_KEYS.HISTORY_DATA, this.DEFAULT_DATA.historyData);
    },

    // 分析数据操作
    getAnalyticsData() {
        return this.load(this.STORAGE_KEYS.ANALYTICS_DATA, this.DEFAULT_DATA.analyticsData);
    },

    // 预订数据操作
    getBookingData() {
        return this.load(this.STORAGE_KEYS.BOOKING_DATA, this.DEFAULT_DATA.bookingData);
    },

    // 计算总房数
    getTotalRooms() {
        const roomTypes = this.getRoomTypes();
        return roomTypes.reduce((sum, rt) => sum + (rt.totalRooms || 0), 0);
    },

    // 计算已预订房数
    getBookedRooms() {
        const roomTypes = this.getRoomTypes();
        return roomTypes.reduce((sum, rt) => sum + (rt.bookedRooms || 0), 0);
    },

    // 计算预订率
    getBookingRate() {
        const total = this.getTotalRooms();
        const booked = this.getBookedRooms();
        return total > 0 ? Math.round((booked / total) * 100) : 0;
    },

    // 计算当前价格（考虑系数和锁定）
    calculateCurrentPrice(roomTypeId, date = new Date()) {
        const roomTypes = this.getRoomTypes();
        const roomType = roomTypes.find(rt => rt.id === roomTypeId);
        
        if (!roomType) return null;

        // 检查价格锁定
        const locks = this.getPriceLocks();
        const activeLock = locks.find(lock => {
            if (lock.status !== 'active') return false;
            if (lock.roomTypeId && lock.roomTypeId !== roomTypeId && lock.roomTypeId !== '') return false;
            const lockStart = new Date(lock.startDate);
            const lockEnd = new Date(lock.endDate);
            return date >= lockStart && date <= lockEnd;
        });

        if (activeLock) {
            return activeLock.lockedPrice || roomType.basePrice;
        }

        // 计算基础价格
        let price = roomType.basePrice;
        const coeffs = this.getPricingCoefficients();

        // 应用淡旺季系数
        const seasonCoeff = this.getSeasonCoefficient(date, coeffs);
        price *= seasonCoeff;

        // 应用工作日/周末系数
        const dayCoeff = this.getDayCoefficient(date, coeffs);
        price *= dayCoeff;

        return Math.round(price);
    },

    // 获取季节系数
    getSeasonCoefficient(date, coeffs) {
        const month = date.getMonth();
        if (month >= 2 && month <= 4) return coeffs.normalSeason; // 3-5月平季
        if (month >= 5 && month <= 7) return coeffs.peakSeason; // 6-8月旺季
        if (month >= 8 && month <= 10) return coeffs.normalSeason; // 9-11月平季
        return coeffs.offSeason; // 12-2月淡季
    },

    // 获取工作日/周末系数
    getDayCoefficient(date, coeffs) {
        const day = date.getDay();
        if (day === 0 || day === 6) return coeffs.weekend;
        return coeffs.weekday;
    },

    // 检查是否低于成本价
    isBelowCostPrice(roomTypeId, price) {
        const roomTypes = this.getRoomTypes();
        const roomType = roomTypes.find(rt => rt.id === roomTypeId);
        if (!roomType) return false;
        return price < roomType.costPrice;
    }
};

// 初始化存储
StorageManager.init();
