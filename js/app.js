/**
 * 酒店价格与利润配置系统 - 主应用入口
 * 负责初始化所有模块和处理全局事件
 */

const HotelPricingSystem = {
    currentModule: 'baseline',

    init() {
        // 显示当前日期
        this.updateCurrentDate();
        
        // 绑定导航事件
        this.bindNavigationEvents();
        
        // 绑定数据导出/导入事件
        this.bindDataEvents();
        
        // 初始化所有模块
        this.initModules();
        
        // 启动实时更新
        this.startRealTimeUpdates();
        
        console.log('酒店价格与利润配置系统已启动');
    },

    // 更新当前日期显示
    updateCurrentDate() {
        const dateEl = document.getElementById('currentDate');
        if (dateEl) {
            const now = new Date();
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            };
            dateEl.textContent = now.toLocaleDateString('zh-CN', options);
        }
    },

    // 绑定导航事件
    bindNavigationEvents() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const moduleName = e.target.dataset.module;
                this.switchModule(moduleName);
            });
        });
    },

    // 切换模块
    switchModule(moduleName) {
        // 更新导航状态
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.module === moduleName);
        });

        // 更新模块显示
        const modules = document.querySelectorAll('.module');
        modules.forEach(module => {
            module.classList.toggle('active', module.id === moduleName + '-module');
        });

        // 刷新对应模块数据
        this.refreshModule(moduleName);
        
        this.currentModule = moduleName;
    },

    // 刷新模块数据
    refreshModule(moduleName) {
        switch (moduleName) {
            case 'baseline':
                if (typeof BaselineModule !== 'undefined') {
                    BaselineModule.refresh();
                }
                break;
            case 'monitoring':
                if (typeof MonitoringModule !== 'undefined') {
                    MonitoringModule.refresh();
                }
                break;
            case 'pricing':
                if (typeof PricingModule !== 'undefined') {
                    PricingModule.refresh();
                }
                break;
            case 'intervention':
                if (typeof InterventionModule !== 'undefined') {
                    InterventionModule.refresh();
                }
                break;
            case 'analysis':
                if (typeof AnalysisModule !== 'undefined') {
                    AnalysisModule.refresh();
                }
                break;
        }
    },

    // 绑定数据导出/导入事件
    bindDataEvents() {
        // 导出数据
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // 导入数据
        const importBtn = document.getElementById('importData');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }
    },

    // 导出数据
    exportData() {
        const allData = StorageManager.exportAll();
        const dataStr = JSON.stringify(allData, null, 2);
        
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hotel_pricing_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('数据导出成功！');
    },

    // 导入数据
    importData() {
        // 创建隐藏的文件输入
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (confirm('确定要导入数据吗？这将覆盖现有数据。')) {
                        StorageManager.importAll(data);
                        alert('数据导入成功！页面将刷新以应用新数据。');
                        location.reload();
                    }
                } catch (error) {
                    alert('数据格式错误，请选择正确的JSON文件。');
                    console.error('导入数据失败:', error);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    },

    // 初始化所有模块
    initModules() {
        // 确保StorageManager已初始化
        if (typeof StorageManager === 'undefined') {
            console.error('StorageManager 未定义');
            return;
        }

        // 初始化各模块
        if (typeof BaselineModule !== 'undefined') {
            BaselineModule.init();
        }
        
        if (typeof MonitoringModule !== 'undefined') {
            MonitoringModule.init();
        }
        
        if (typeof PricingModule !== 'undefined') {
            PricingModule.init();
        }
        
        if (typeof InterventionModule !== 'undefined') {
            InterventionModule.init();
        }
        
        if (typeof AnalysisModule !== 'undefined') {
            AnalysisModule.init();
        }
    },

    // 启动实时更新
    startRealTimeUpdates() {
        // 每分钟更新日期显示
        setInterval(() => {
            this.updateCurrentDate();
        }, 60000);

        // 如果在监测模块，启动实时数据模拟
        if (typeof MonitoringModule !== 'undefined') {
            // 注释掉自动模拟，让用户手动控制
            // MonitoringModule.startRealTimeUpdates();
        }
    },

    // 显示提示消息
    showMessage(message, type = 'info') {
        // 可以在这里实现一个更优雅的消息提示系统
        // 目前使用简单的alert
        alert(message);
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    HotelPricingSystem.init();
});

// 页面可见性变化时处理
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // 页面重新可见时刷新当前模块
        HotelPricingSystem.refreshModule(HotelPricingSystem.currentModule);
    }
});
