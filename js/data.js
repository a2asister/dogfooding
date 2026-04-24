/**
 * 景区智慧管理动态大屏模拟数据
 */

const MOCK_DATA = {
    // 客流数据
    passenger: {
        today: 12845,
        total: 1256890,
        maxCapacity: 50000,
        todayTrend: 12.5,
        totalTrend: 8.2,
        
        // 客流来源地
        sourceMap: [
            { name: '北京', value: 3500 },
            { name: '上海', value: 2800 },
            { name: '广东', value: 1500 },
            { name: '浙江', value: 1200 },
            { name: '江苏', value: 1000 },
            { name: '其他', value: 2845 }
        ],
        
        // 年龄分布
        ageDistribution: [
            { name: '18岁以下', value: 15 },
            { name: '19-30岁', value: 35 },
            { name: '31-45岁', value: 28 },
            { name: '46-60岁', value: 15 },
            { name: '60岁以上', value: 7 }
        ],
        
        // 性别分布
        genderDistribution: [
            { name: '男性', value: 52 },
            { name: '女性', value: 48 }
        ],
        
        // 出行方式
        transportMode: [
            { name: '自驾', value: 45 },
            { name: '跟团', value: 30 },
            { name: '公共交通', value: 20 },
            { name: '其他', value: 5 }
        ],
        
        // 各区域实时客流
        areaFlow: [
            { area: '主入口', current: 2150, capacity: 5000, trend: 'up' },
            { area: '核心景点A', current: 2550, capacity: 3000, trend: 'up' },
            { area: '核心景点B', current: 1800, capacity: 2500, trend: 'down' },
            { area: '游步道', current: 3200, capacity: 8000, trend: 'up' },
            { area: '停车场', current: 1200, capacity: 2000, trend: 'down' },
            { area: '游客中心', current: 850, capacity: 1500, trend: 'stable' },
            { area: '餐饮区', current: 450, capacity: 1000, trend: 'up' },
            { area: '出口', current: 650, capacity: 3000, trend: 'stable' }
        ],
        
        // 小时客流趋势
        hourlyTrend: {
            hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            visitors: [200, 800, 1500, 2200, 2800, 3200, 3500, 3800, 3200, 2500, 1800],
            yesterday: [180, 750, 1400, 2000, 2600, 3000, 3300, 3500, 3000, 2200, 1500]
        }
    },
    
    // 设备运维数据
    equipment: {
        overview: [
            { type: '闸机系统', normal: 28, fault: 2, total: 30 },
            { type: '观光车辆', normal: 15, fault: 1, total: 16 },
            { type: '游船系统', normal: 10, fault: 0, total: 10 },
            { type: '路灯系统', normal: 450, fault: 5, total: 455 },
            { type: '卫生间设施', normal: 32, fault: 1, total: 33 }
        ],
        
        alarms: [
            { id: 1, level: 'high', title: '主入口闸机 #03 故障', time: '10分钟前', status: 'pending' },
            { id: 2, level: 'medium', title: '观光车 #12 电量不足', time: '25分钟前', status: 'pending' },
            { id: 3, level: 'low', title: '卫生间 #08 纸量不足', time: '1小时前', status: 'pending' }
        ],
        
        workorders: {
            pending: 8,
            processing: 5,
            completed: 12,
            trend: [
                { name: '待处理', value: 8 },
                { name: '处理中', value: 5 },
                { name: '已完成', value: 12 }
            ]
        }
    },
    
    // 安全防控数据
    security: {
        monitorCount: 526,
        monitors: [
            { id: '01', name: '主入口 #01', location: '景区南大门入口', status: 'online' },
            { id: '02', name: '核心景点A', location: '核心景区A区入口', status: 'online' },
            { id: '03', name: '游步道B', location: '游步道中段', status: 'online' },
            { id: '04', name: '停车场入口', location: '停车场北门', status: 'online' }
        ],
        
        warnings: [
            { id: 1, level: 'high', title: '核心景区客流预警', desc: '当前客流已达区域承载上限的 85%', area: '核心景点A' }
        ],
        
        heatmapData: []
    },
    
    // 环境监测数据
    environment: {
        airQuality: {
            level: '优',
            pm25: 12,
            pm10: 25,
            aqi: 35
        },
        temperature: 22.5,
        humidity: 65,
        waterQuality: 'Ⅰ类',
        
        // 24小时趋势
        hourlyTrend: {
            hours: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            temperature: [15, 14, 13, 14, 17, 20, 23, 24, 22, 20, 18, 16],
            humidity: [80, 82, 85, 83, 75, 68, 60, 58, 65, 72, 78, 80]
        }
    },
    
    // 营收统计数据
    revenue: {
        today: {
            total: 1256890,
            trend: 15.2
        },
        breakdown: [
            { type: '门票收入', amount: 892450, ratio: 71.0 },
            { type: '餐饮收入', amount: 215680, ratio: 17.2 },
            { type: '文创收入', amount: 108560, ratio: 8.6 },
            { type: '租赁收入', amount: 40200, ratio: 3.2 }
        ],
        
        // 近7天趋势
        weeklyTrend: {
            dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            revenue: [980000, 850000, 920000, 1050000, 1180000, 1520000, 1256890],
            visitors: [8500, 7200, 7800, 9200, 10500, 14200, 12845]
        },
        
        // 业态占比
        categoryRatio: [
            { name: '门票', value: 71 },
            { name: '餐饮', value: 17.2 },
            { name: '文创', value: 8.6 },
            { name: '租赁', value: 3.2 }
        ]
    },
    
    // 人员调度数据
    staff: {
        overview: [
            { type: '安保人员', onDuty: 45, offDuty: 12, total: 57 },
            { type: '保洁人员', onDuty: 38, offDuty: 8, total: 46 },
            { type: '客服人员', onDuty: 15, offDuty: 5, total: 20 }
        ],
        
        schedule: [
            { position: '安保', shift: '早班', time: '08:00-16:00', count: 20, status: 'active' },
            { position: '安保', shift: '中班', time: '12:00-20:00', count: 25, status: 'active' },
            { position: '保洁', shift: '早班', time: '07:00-15:00', count: 18, status: 'active' },
            { position: '客服', shift: '全天', time: '09:00-17:00', count: 15, status: 'active' }
        ],
        
        // 区域分布
        distribution: {
            areas: ['主入口', '核心景点A', '核心景点B', '游步道', '游客中心', '餐饮区', '出口'],
            security: [8, 12, 8, 6, 4, 3, 4],
            cleaner: [4, 6, 5, 8, 4, 7, 4],
            service: [3, 4, 3, 1, 2, 1, 1]
        }
    }
};

// 生成热力图模拟数据
function generateHeatmapData() {
    const data = [];
    const areas = CONFIG.areas;
    
    areas.forEach((area, areaIndex) => {
        const density = 0.3 + Math.random() * 0.7;
        data.push({
            area: area.name,
            value: Math.floor(density * 100),
            capacity: area.capacity,
            current: MOCK_DATA.passenger.areaFlow[areaIndex].current
        });
    };
    
    return data;
}

// 初始化热力图数据
MOCK_DATA.security.heatmapData = generateHeatmapData();

// 导出数据格式化函数
const DataFormatter = {
    // 格式化数字
    formatNumber: function(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toLocaleString();
    },
    
    // 格式化货币
    formatCurrency: function(amount) {
        return '¥ ' + amount.toLocaleString();
    },
    
    // 格式化百分比
    formatPercent: function(value, total) {
        return value.toFixed(1) + '%';
    },
    
    // 格式化时间
    formatTime: function(date) {
        const d = date || new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        const second = String(d.getSeconds()).padStart(2, '0');
        return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
    }
};

// 数据模拟实时数据更新函数
const DataUpdater = {
    // 更新实时客流数据
    updatePassengerData: function() {
        const change = Math.floor(Math.random() * 100) - 50;
        MOCK_DATA.passenger.today += change;
        
        MOCK_DATA.passenger.areaFlow.forEach(area => {
            const change = Math.floor(Math.random() * 50) - 25;
            area.current = Math.max(0, area.current + change);
        });
        
        return MOCK_DATA.passenger;
    },
    
    // 更新环境数据
    updateEnvironmentData: function() {
        MOCK_DATA.environment.temperature += (Math.random() - 0.5) * 0.2;
        MOCK_DATA.environment.humidity += (Math.random() - 0.5) * 2;
        MOCK_DATA.environment.humidity = Math.max(30, Math.min(90, MOCK_DATA.environment.humidity));
        
        return MOCK_DATA.environment;
    },
    
    // 随机生成告警
    generateRandomAlarm: function() {
        if (Math.random() < 0.1) {
            const equipmentTypes = ['闸机', '观光车', '路灯', '卫生间'];
            const levels = ['high', 'medium', 'low'];
            const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
            const level = levels[Math.floor(Math.random() * levels.length)];
            const id = Math.floor(Math.random() * 100);
            
            return {
                id,
                level,
                title: `${type} #${String(Math.floor(Math.random() * 20)).padStart(2, '0')} 故障`,
                time: '刚刚',
                status: 'pending'
            };
        }
        return null;
    }
};

// 导出数据（模块化支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MOCK_DATA,
        DataFormatter,
        DataUpdater
    };
}
