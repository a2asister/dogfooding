/**
 * 景区智慧管理动态大屏 - 主逻辑文件
 */

const DashboardApp = {
    // 初始化状态
    isInitialized: false,
    
    // 定时器引用
    timers: {
        timeUpdate: null,
        dataRefresh: null,
        environmentRefresh: null
    },
    
    // 当前选中的监控
    currentMonitor: '01',
    
    // 初始化应用
    init: function() {
        console.log('初始化景区智慧管理动态大屏...');
        
        // 初始化系统时间
        this.initSystemTime();
        
        // 初始化事件监听
        this.initEventListeners();
        
        // 初始化数据刷新
        this.initDataRefresh();
        
        // 更新显示数据
        this.updateDisplayData();
        
        this.isInitialized = true;
        console.log('景区智慧管理动态大屏初始化完成！');
    },
    
    // 初始化系统时间
    initSystemTime: function() {
        this.updateSystemTime();
        
        // 每秒更新时间
        this.timers.timeUpdate = setInterval(() => {
            this.updateSystemTime();
        }, 1000);
    },
    
    // 更新系统时间
    updateSystemTime: function() {
        const timeElement = document.getElementById('systemTime');
        if (timeElement) {
            timeElement.textContent = DataFormatter.formatTime(new Date());
        }
    },
    
    // 初始化事件监听（使用事件委托方式）
    initEventListeners: function() {
        const self = this;
        
        // 使用事件委托绑定所有点击事件
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // 数据导出按钮
            if (target.id === 'exportBtn') {
                self.exportData();
                return;
            }
            
            // 历史查询按钮
            if (target.id === 'historyBtn') {
                self.showHistoryQuery();
                return;
            }
            
            // 应急处置按钮
            if (target.id === 'emergencyBtn') {
                self.showEmergencyModal();
                return;
            }
            
            // 关闭应急处置弹窗
            if (target.id === 'closeEmergencyModal') {
                self.hideEmergencyModal();
                return;
            }
            
            // 查看更多监控点位
            if (target.id === 'expandMonitorBtn') {
                self.showMonitorModal();
                return;
            }
            
            // 关闭监控弹窗
            if (target.id === 'closeMonitorModal') {
                self.hideMonitorModal();
                return;
            }
            
            // 一键调度按钮
            if (target.id === 'dispatchBtn') {
                self.dispatchStaff();
                return;
            }
            
            // 监控项点击
            const monitorItem = target.closest('.monitor-item');
            if (monitorItem) {
                document.querySelectorAll('.monitor-item').forEach(i => i.classList.remove('active'));
                monitorItem.classList.add('active');
                self.showMonitorModal();
                return;
            }
            
            // 监控点位选择
            const monitorSelectItem = target.closest('.monitor-select-item');
            if (monitorSelectItem) {
                document.querySelectorAll('.monitor-select-item').forEach(i => i.classList.remove('active'));
                monitorSelectItem.classList.add('active');
                self.switchMonitor(monitorSelectItem.dataset.id);
                return;
            }
            
            // 应急处置行动按钮
            const emergencyAction = target.closest('.emergency-action');
            if (emergencyAction) {
                const type = emergencyAction.dataset.type;
                self.handleEmergency(type);
                return;
            }
            
            // 刷新按钮
            const refreshBtn = target.closest('.refresh-btn');
            if (refreshBtn) {
                const module = refreshBtn.closest('.module');
                if (module) {
                    self.refreshModule(module);
                }
                return;
            }
            
            // 报警处理按钮
            const alarmHandle = target.closest('.alarm-handle');
            if (alarmHandle) {
                const alarmItem = alarmHandle.closest('.alarm-item');
                if (alarmItem) {
                    self.handleAlarm(alarmItem);
                }
                return;
            }
            
            // 点击弹窗外部关闭
            if (target.classList.contains('modal') && target.classList.contains('show')) {
                target.classList.remove('show');
                return;
            }
        });
        
        // 时间范围选择（change事件）
        document.addEventListener('change', function(e) {
            if (e.target.id === 'timeSelect') {
                DashboardApp.changeTimeRange(e.target.value);
            }
        });
    },
    
    // 初始化数据刷新
    initDataRefresh: function() {
        // 实时数据刷新（30秒）
        this.timers.dataRefresh = setInterval(() => {
            this.refreshRealtimeData();
        }, CONFIG.refreshInterval.realtime);
        
        // 环境数据刷新（2分钟）
        this.timers.environmentRefresh = setInterval(() => {
            this.refreshEnvironmentData();
        }, CONFIG.refreshInterval.environment);
    },
    
    // 更新显示数据
    updateDisplayData: function() {
        // 更新客流统计
        this.updatePassengerStats();
        
        // 更新环境数据
        this.updateEnvironmentStats();
        
        // 更新营收数据
        this.updateRevenueStats();
        
        // 更新设备报警数量
        this.updateEquipmentAlarms();
    },
    
    // 更新客流统计
    updatePassengerStats: function() {
        const passenger = MOCK_DATA.passenger;
        
        const todayVisitors = document.getElementById('todayVisitors');
        if (todayVisitors) {
            todayVisitors.textContent = DataFormatter.formatNumber(passenger.today);
        }
        
        const totalVisitors = document.getElementById('totalVisitors');
        if (totalVisitors) {
            totalVisitors.textContent = DataFormatter.formatNumber(passenger.total);
        }
        
        const maxCapacity = document.getElementById('maxCapacity');
        if (maxCapacity) {
            maxCapacity.textContent = DataFormatter.formatNumber(passenger.maxCapacity);
        }
    },
    
    // 更新环境统计
    updateEnvironmentStats: function() {
        const env = MOCK_DATA.environment;
        
        // 温度、湿度等在 HTML 中已硬编码显示
        // 实际项目中这里应该更新 DOM 元素
    },
    
    // 更新营收统计
    updateRevenueStats: function() {
        const revenue = MOCK_DATA.revenue;
        
        // 营收数据在 HTML 中已硬编码显示
        // 实际项目中这里应该更新 DOM 元素
    },
    
    // 更新设备报警数量
    updateEquipmentAlarms: function() {
        const alarmBadge = document.getElementById('equipmentAlarms');
        if (alarmBadge) {
            const alarmCount = MOCK_DATA.equipment.alarms.filter(a => a.status === 'pending').length;
            alarmBadge.textContent = alarmCount;
        }
    },
    
    // 刷新实时数据
    refreshRealtimeData: function() {
        console.log('刷新实时数据...');
        
        // 更新客流数据
        DataUpdater.updatePassengerData();
        this.updatePassengerStats();
        
        // 随机生成新告警
        const newAlarm = DataUpdater.generateRandomAlarm();
        if (newAlarm) {
            MOCK_DATA.equipment.alarms.unshift(newAlarm);
            this.addNewAlarm(newAlarm);
            this.updateEquipmentAlarms();
        }
        
        // 刷新热力图和区域客流图表
        if (ChartsManager.charts.heatmapChart) {
            const areaFlow = MOCK_DATA.passenger.areaFlow;
            ChartsManager.charts.heatmapChart.setOption({
                series: [
                    {
                        data: areaFlow.map(item => {
                            const ratio = item.current / item.capacity;
                            let color;
                            if (ratio > 0.8) {
                                color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(255, 51, 51, 0.9)' },
                                    { offset: 1, color: 'rgba(255, 51, 51, 0.3)' }
                                ]);
                            } else if (ratio > 0.6) {
                                color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(255, 170, 0, 0.9)' },
                                    { offset: 1, color: 'rgba(255, 170, 0, 0.3)' }
                                ]);
                            } else {
                                color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(0, 102, 255, 0.9)' },
                                    { offset: 1, color: 'rgba(0, 102, 255, 0.3)' }
                                ]);
                            }
                            return {
                                value: item.current,
                                itemStyle: { color: color }
                            };
                        })
                    },
                    {
                        data: areaFlow.map(item => item.capacity)
                    }
                ]
            });
        }
    },
    
    // 刷新环境数据
    refreshEnvironmentData: function() {
        console.log('刷新环境数据...');
        DataUpdater.updateEnvironmentData();
    },
    
    // 添加新告警到列表
    addNewAlarm: function(alarm) {
        const alarmItems = document.querySelector('.alarm-items');
        if (!alarmItems) return;
        
        const levelClass = alarm.level === 'high' ? 'alarm-high' : 
                          alarm.level === 'medium' ? 'alarm-medium' : 'alarm-low';
        
        const levelLabel = alarm.level === 'high' ? '紧急' : 
                          alarm.level === 'medium' ? '一般' : '提示';
        
        const newAlarmHtml = `
            <div class="alarm-item ${levelClass}">
                <div class="alarm-level">${levelLabel}</div>
                <div class="alarm-content">
                    <div class="alarm-title">${alarm.title}</div>
                    <div class="alarm-time">${alarm.time}</div>
                </div>
                <button class="alarm-handle">处理</button>
            </div>
        `;
        
        alarmItems.insertAdjacentHTML('afterbegin', newAlarmHtml);
        
        // 绑定新按钮事件
        const newHandleBtn = alarmItems.querySelector('.alarm-item:first-child .alarm-handle');
        if (newHandleBtn) {
            newHandleBtn.addEventListener('click', (e) => {
                const alarmItem = e.target.closest('.alarm-item');
                if (alarmItem) {
                    this.handleAlarm(alarmItem);
                }
            });
        }
    },
    
    // 处理告警
    handleAlarm: function(alarmItem) {
        alarmItem.style.opacity = '0.5';
        alarmItem.style.pointerEvents = 'none';
        
        const handleBtn = alarmItem.querySelector('.alarm-handle');
        if (handleBtn) {
            handleBtn.textContent = '处理中...';
            handleBtn.disabled = true;
        }
        
        // 模拟处理过程
        setTimeout(() => {
            alarmItem.style.display = 'none';
            this.updateEquipmentAlarms();
            this.showNotification('告警已处理', 'success');
        }, 1500);
    },
    
    // 刷新模块数据
    refreshModule: function(module) {
        module.classList.add('data-highlight');
        
        setTimeout(() => {
            module.classList.remove('data-highlight');
        }, 2000);
        
        this.showNotification('数据已刷新', 'info');
    },
    
    // 数据导出
    exportData: function() {
        console.log('导出数据...');
        
        // 模拟导出过程
        const exportData = {
            exportTime: new Date().toISOString(),
            passenger: MOCK_DATA.passenger,
            revenue: MOCK_DATA.revenue,
            equipment: MOCK_DATA.equipment,
            environment: MOCK_DATA.environment,
            staff: MOCK_DATA.staff
        };
        
        // 创建下载链接
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `景区数据_${DataFormatter.formatTime(new Date()).replace(/[:\s]/g, '_')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('数据导出成功', 'success');
    },
    
    // 显示历史查询
    showHistoryQuery: function() {
        console.log('显示历史查询...');
        this.showNotification('历史查询功能开发中...', 'info');
    },
    
    // 显示应急处置弹窗
    showEmergencyModal: function() {
        const modal = document.getElementById('emergencyModal');
        if (modal) {
            modal.classList.add('show');
        }
    },
    
    // 隐藏应急处置弹窗
    hideEmergencyModal: function() {
        const modal = document.getElementById('emergencyModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },
    
    // 显示监控弹窗
    showMonitorModal: function() {
        const modal = document.getElementById('monitorModal');
        if (modal) {
            modal.classList.add('show');
        }
    },
    
    // 隐藏监控弹窗
    hideMonitorModal: function() {
        const modal = document.getElementById('monitorModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },
    
    // 切换监控
    switchMonitor: function(monitorId) {
        this.currentMonitor = monitorId;
        console.log(`切换到监控: ${monitorId}`);
        
        // 更新监控详情
        const monitors = MOCK_DATA.security.monitors;
        const monitor = monitors.find(m => m.id === monitorId);
        
        if (monitor) {
            const placeholder = document.querySelector('.monitor-placeholder.large');
            if (placeholder) {
                placeholder.textContent = `${monitor.name} 实时画面`;
            }
            
            // 更新信息面板
            const infoValues = document.querySelectorAll('.monitor-info-detail .info-value');
            if (infoValues.length >= 5) {
                infoValues[0].textContent = monitor.name;
                infoValues[1].textContent = monitor.location;
                infoValues[2].textContent = monitor.status === 'online' ? '在线' : '离线';
                if (infoValues[2].textContent === '在线') {
                    infoValues[2].classList.add('online');
                } else {
                    infoValues[2].classList.remove('online');
                }
            }
        }
    },
    
    // 人员调度
    dispatchStaff: function() {
        console.log('一键调度...');
        this.showNotification('人员调度功能开发中...', 'info');
    },
    
    // 处理应急事件
    handleEmergency: function(type) {
        console.log(`处理应急事件: ${type}`);
        
        const typeNames = {
            'missing': '游客走失',
            'fault': '设备故障',
            'safety': '安全隐患',
            'medical': '医疗急救'
        };
        
        this.showNotification(`${typeNames[type] || '应急'}预案已启动`, 'warning');
        
        // 自动关闭弹窗
        setTimeout(() => {
            this.hideEmergencyModal();
        }, 2000);
    },
    
    // 改变时间范围
    changeTimeRange: function(range) {
        console.log(`切换时间范围: ${range}`);
        
        // 模拟数据切换
        const rangeNames = {
            'today': '今日',
            'week': '本周',
            'month': '本月'
        };
        
        this.showNotification(`已切换到${rangeNames[range]}数据`, 'info');
        
        // 实际项目中这里应该重新加载数据并刷新图表
    },
    
    // 显示通知
    showNotification: function(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            zIndex: '9999',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        });
        
        // 设置背景色
        const bgColors = {
            'success': 'linear-gradient(135deg, #00cc88, #009966)',
            'warning': 'linear-gradient(135deg, #ffaa00, #ff6600)',
            'danger': 'linear-gradient(135deg, #ff3333, #cc0000)',
            'info': 'linear-gradient(135deg, #0066ff, #0044cc)'
        };
        notification.style.background = bgColors[type] || bgColors['info'];
        
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },
    
    // 销毁应用
    dispose: function() {
        console.log('销毁应用...');
        
        // 清除所有定时器
        Object.keys(this.timers).forEach(key => {
            if (this.timers[key]) {
                clearInterval(this.timers[key]);
                this.timers[key] = null;
            }
        });
        
        // 销毁图表
        if (ChartsManager) {
            ChartsManager.dispose();
        }
        
        this.isInitialized = false;
    }
};

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        DashboardApp.init();
    });
} else {
    DashboardApp.init();
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    DashboardApp.dispose();
});
