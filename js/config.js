/**
 * 景区智慧管理动态大屏配置文件
 */

const CONFIG = {
    // 项目名称
    projectName: '景区智慧管理动态大屏',
    
    // 版本号
    version: '1.0.0',
    
    // 数据刷新间隔（毫秒）
    refreshInterval: {
        realtime: 30000,      // 实时数据 30秒
        statistics: 60000,     // 统计数据 1分钟
        environment: 120000    // 环境数据 2分钟
    },
    
    // 颜色配置
    colors: {
        primary: '#0066ff',
        primaryDark: '#0044cc',
        primaryLight: '#3388ff',
        secondary: '#00cc88',
        secondaryDark: '#009966',
        secondaryLight: '#33ddaa',
        warning: '#ffaa00',
        danger: '#ff3333',
        success: '#00cc88',
        info: '#0066ff',
        text: {
            primary: '#ffffff',
            secondary: '#aabbcc',
            muted: '#667788'
        },
        bg: {
            dark: '#0a1628',
            card: 'rgba(15, 30, 60, 0.8)',
            hover: 'rgba(255, 255, 255, 0.05)'
        },
        chart: {
            series: [
                '#0066ff',
                '#00cc88',
                '#ffaa00',
                '#ff6600',
                '#ff3333',
                '#9966ff',
                '#ff66cc',
                '#00ccff'
            ],
            gradient: {
                blue: {
                    start: 'rgba(0, 102, 255, 0.8)',
                    end: 'rgba(0, 102, 255, 0.1)'
                },
                green: {
                    start: 'rgba(0, 204, 136, 0.8)',
                    end: 'rgba(0, 204, 136, 0.1)'
                }
            }
        }
    },
    
    // 景区配置
    scenic: {
        name: 'XX风景名胜区',
        maxCapacity: 50000,
        areaCount: 8,
        monitorPoints: 526
    },
    
    // 区域配置
    areas: [
        { id: 'entrance', name: '主入口区域', capacity: 5000 },
        { id: 'core_a', name: '核心景点A', capacity: 3000 },
        { id: 'core_b', name: '核心景点B', capacity: 2500 },
        { id: 'walkway', name: '游步道区域', capacity: 8000 },
        { id: 'parking', name: '停车场', capacity: 2000 },
        { id: 'service', name: '游客中心', capacity: 1500 },
        { id: 'restaurant', name: '餐饮区', capacity: 1000 },
        { id: 'exit', name: '出口区域', capacity: 3000 }
    ],
    
    // 设备类型配置
    equipmentTypes: [
        { id: 'gate', name: '闸机系统', icon: '🚪' },
        { id: 'bus', name: '观光车辆', icon: '🚌' },
        { id: 'boat', name: '游船系统', icon: '🚢' },
        { id: 'light', name: '路灯系统', icon: '💡' },
        { id: 'toilet', name: '卫生间设施', icon: '🚻' }
    ],
    
    // 人员类型配置
    staffTypes: [
        { id: 'security', name: '安保人员', icon: '👮' },
        { id: 'cleaner', name: '保洁人员', icon: '🧹' },
        { id: 'service', name: '客服人员', icon: '💁' }
    ],
    
    // 营收类型配置
    revenueTypes: [
        { id: 'ticket', name: '门票收入', icon: '🎫' },
        { id: 'food', name: '餐饮收入', icon: '🍽' },
        { id: 'shop', name: '文创收入', icon: '🛍' },
        { id: 'rent', name: '租赁收入', icon: '🔑' }
    ],
    
    // 应急类型配置
    emergencyTypes: [
        { id: 'missing', name: '游客走失', icon: '👤' },
        { id: 'fault', name: '设备故障', icon: '⚙' },
        { id: 'safety', name: '安全隐患', icon: '⚠' },
        { id: 'medical', name: '医疗急救', icon: '🏥' }
    ],
    
    // 预警级别
    warningLevels: {
        high: { color: '#ff3333', label: '紧急' },
        medium: { color: '#ff6600', label: '一般' },
        low: { color: '#ffaa00', label: '提示' }
    },
    
    // API配置（预留）
    api: {
        baseUrl: '/api',
        timeout: 10000
    },
    
    // 图表默认配置
    chartDefaults: {
        backgroundColor: 'transparent',
        textStyle: {
            color: '#aabbcc',
            fontSize: 12
        },
        axis: {
            lineColor: 'rgba(255, 255, 255, 0.1)',
            splitLineColor: 'rgba(255, 255, 255, 0.05)'
        }
    }
};

// 导出配置（模块化支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
