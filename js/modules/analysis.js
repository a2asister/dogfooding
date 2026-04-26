/**
 * 数据复盘模块
 * 展示核心指标、调价效果分析、业绩排行、优化建议
 */

const AnalysisModule = {
    currentPeriod: 30,

    init() {
        this.bindEvents();
        this.loadAnalyticsData();
        this.renderPerformanceTable();
        this.renderChart();
        this.renderSuggestions();
    },

    bindEvents() {
        const periodSelect = document.getElementById('analysisPeriod');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                const customRange = document.getElementById('customDateRange');
                if (customRange) {
                    customRange.style.display = e.target.value === 'custom' ? 'flex' : 'none';
                }
                
                if (e.target.value !== 'custom') {
                    this.currentPeriod = parseInt(e.target.value);
                    this.loadAnalyticsData();
                    this.renderPerformanceTable();
                    this.renderChart();
                    this.renderSuggestions();
                }
            });
        }

        const generateReportBtn = document.getElementById('generateReport');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
    },

    // 加载分析数据
    loadAnalyticsData() {
        const analytics = StorageManager.getAnalyticsData();
        const roomTypes = StorageManager.getRoomTypes();
        const pricingLogs = StorageManager.getPricingLogs();
        
        // 计算实际数据
        const totalRooms = StorageManager.getTotalRooms();
        const bookedRooms = StorageManager.getBookedRooms();
        const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;
        
        // 计算平均房价
        let totalRevenue = 0;
        let totalBooked = 0;
        roomTypes.forEach(rt => {
            if (rt.bookedRooms > 0) {
                totalRevenue += rt.bookedRooms * (rt.currentPrice || rt.basePrice);
                totalBooked += rt.bookedRooms;
            }
        });
        const avgRevenue = totalBooked > 0 ? Math.round(totalRevenue / totalBooked) : 0;
        
        // 计算利润
        let totalProfit = 0;
        roomTypes.forEach(rt => {
            if (rt.bookedRooms > 0) {
                const profitPerRoom = (rt.currentPrice || rt.basePrice) - rt.costPrice;
                totalProfit += rt.bookedRooms * profitPerRoom;
            }
        });

        // 统计调价次数
        const autoCount = pricingLogs.filter(l => l.type === 'auto').length;
        const manualCount = pricingLogs.filter(l => l.type === 'manual').length;

        // 更新显示
        this.updateKPI('avgOccupancy', occupancyRate + '%');
        this.updateKPI('avgRevenue', '¥' + avgRevenue);
        this.updateKPI('totalProfit', '¥' + totalProfit.toLocaleString());
        this.updateKPI('pricingCount', pricingLogs.length);
        
        // 更新自动/手动计数
        const autoCountEl = document.getElementById('autoCount');
        const manualCountEl = document.getElementById('manualCount');
        if (autoCountEl) autoCountEl.textContent = autoCount;
        if (manualCountEl) manualCountEl.textContent = manualCount;

        // 更新趋势数据
        const bookingChange = this.calculateBookingChange();
        const revenueChange = this.calculateRevenueChange();
        const profitChange = this.calculateProfitChange();

        this.updateEffectValue('bookingChange', bookingChange);
        this.updateEffectValue('revenueChange', revenueChange);
        this.updateEffectValue('profitChange', profitChange);

        // 更新趋势箭头
        this.updateTrend('occupancyTrend', occupancyRate - 60);
        this.updateTrend('revenueTrend', avgRevenue - 280);
        this.updateTrend('profitTrend', totalProfit - 40000);
    },

    // 更新KPI显示
    updateKPI(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = value;
        }
    },

    // 更新效果值
    updateEffectValue(elementId, change) {
        const el = document.getElementById(elementId);
        if (el) {
            const prefix = change >= 0 ? '+' : '';
            el.textContent = prefix + change + '%';
            el.className = 'effect-value ' + (change >= 0 ? 'positive' : 'negative');
        }
    },

    // 更新趋势显示
    updateTrend(elementId, change) {
        const el = document.getElementById(elementId);
        if (el) {
            const isUp = change >= 0;
            const arrow = isUp ? '↑' : '↓';
            const absChange = Math.abs(Math.round(change));
            el.innerHTML = `<span class="${isUp ? 'trend-up' : 'trend-down'}">${arrow} ${absChange}%</span>`;
        }
    },

    // 计算预订量变化
    calculateBookingChange() {
        const analytics = StorageManager.getAnalyticsData();
        return analytics.bookingChange || 0;
    },

    // 计算营收变化
    calculateRevenueChange() {
        const analytics = StorageManager.getAnalyticsData();
        return analytics.revenueChange || 0;
    },

    // 计算利润变化
    calculateProfitChange() {
        const analytics = StorageManager.getAnalyticsData();
        return analytics.profitChange || 0;
    },

    // 渲染业绩排行表
    renderPerformanceTable() {
        const tbody = document.querySelector('#roomPerformanceTable tbody');
        if (!tbody) return;

        const roomTypes = StorageManager.getRoomTypes();
        const pricingLogs = StorageManager.getPricingLogs();
        
        if (roomTypes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;color:#999;padding:40px;">
                        暂无房型数据
                    </td>
                </tr>
            `;
            return;
        }

        // 计算各房型业绩
        const performanceData = roomTypes.map(rt => {
            const bookingRate = rt.totalRooms > 0 
                ? Math.round((rt.bookedRooms / rt.totalRooms) * 100) 
                : 0;
            const avgPrice = rt.currentPrice || rt.basePrice;
            const revPAR = Math.round(avgPrice * (bookingRate / 100));
            
            // 计算利润贡献
            const profitPerRoom = avgPrice - rt.costPrice;
            const profitContribution = rt.bookedRooms * profitPerRoom;

            // 计算调价效果
            const roomTypeLogs = pricingLogs.filter(l => l.roomTypeId === rt.id);
            let pricingEffect = 0;
            if (roomTypeLogs.length > 0) {
                // 简化计算：总价格变化百分比
                pricingEffect = roomTypeLogs.reduce((sum, log) => sum + log.changePercent, 0) / roomTypeLogs.length;
            }

            return {
                roomType: rt,
                bookingRate,
                avgPrice,
                revPAR,
                profitContribution,
                pricingEffect
            };
        });

        // 按利润贡献排序
        performanceData.sort((a, b) => b.profitContribution - a.profitContribution);

        tbody.innerHTML = performanceData.map((data, index) => {
            let rank = index + 1;
            let rankClass = '';
            
            if (rank === 1) rankClass = '🥇';
            else if (rank === 2) rankClass = '🥈';
            else if (rank === 3) rankClass = '🥉';

            const effectClass = data.pricingEffect > 0 ? 'success' : data.pricingEffect < 0 ? 'danger' : 'info';
            const effectPrefix = data.pricingEffect > 0 ? '+' : '';

            return `
                <tr>
                    <td>${rankClass} ${rank}</td>
                    <td><strong>${data.roomType.name}</strong></td>
                    <td>${data.bookingRate}%</td>
                    <td>¥${data.avgPrice}</td>
                    <td>¥${data.revPAR}</td>
                    <td>¥${data.profitContribution.toLocaleString()}</td>
                    <td>
                        <span class="status-tag ${effectClass}">
                            ${effectPrefix}${data.pricingEffect.toFixed(1)}%
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // 渲染图表
    renderChart() {
        const barsContainer = document.getElementById('chartBars');
        if (!barsContainer) return;

        // 生成过去7天的模拟数据
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const values = [65, 72, 68, 75, 82, 88, 78];

        barsContainer.innerHTML = days.map((day, index) => {
            const height = values[index];
            return `
                <div class="chart-bar" style="height: ${height}%;">
                    <div class="chart-bar-label">${day}</div>
                </div>
            `;
        }).join('');
    },

    // 渲染优化建议
    renderSuggestions() {
        const container = document.getElementById('suggestionsContainer');
        if (!container) return;

        const suggestions = this.generateSuggestions();

        if (suggestions.length === 0) {
            container.innerHTML = `
                <div class="suggestion-item">
                    <div class="suggestion-icon">✅</div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">运营状况良好</div>
                        <div class="suggestion-text">当前定价策略效果良好，继续保持现有配置即可。</div>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-icon">${suggestion.icon}</div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-text">${suggestion.text}</div>
                </div>
            </div>
        `).join('');
    },

    // 生成优化建议
    generateSuggestions() {
        const suggestions = [];
        const roomTypes = StorageManager.getRoomTypes();
        const config = StorageManager.getPricingConfig();

        // 检查低出租率房型
        roomTypes.forEach(rt => {
            const bookingRate = rt.totalRooms > 0 
                ? Math.round((rt.bookedRooms / rt.totalRooms) * 100) 
                : 0;
            
            if (bookingRate < 30) {
                suggestions.push({
                    icon: '💡',
                    title: `房型「${rt.name}」出租率偏低`,
                    text: `当前出租率仅 ${bookingRate}%，建议：1) 适当降低价格或设置促销活动；2) 检查是否与周边竞品价格差距过大；3) 考虑优化房型描述和图片展示。`
                });
            }
        });

        // 检查高出租率房型
        roomTypes.forEach(rt => {
            const bookingRate = rt.totalRooms > 0 
                ? Math.round((rt.bookedRooms / rt.totalRooms) * 100) 
                : 0;
            
            if (bookingRate > 85) {
                suggestions.push({
                    icon: '📈',
                    title: `房型「${rt.name}」需求旺盛`,
                    text: `当前出租率已达 ${bookingRate}%，建议：1) 可适当提高价格以获取更高收益；2) 检查是否有价格锁定限制了涨价；3) 考虑是否需要增加该房型的供应量。`
                });
            }
        });

        // 检查阈值配置
        if (config.threshold < 50) {
            suggestions.push({
                icon: '⚠️',
                title: '调价阈值设置较低',
                text: `当前核心预订进度阈值设置为 ${config.threshold}%，建议提高至 55-65% 之间，过低的阈值可能导致过早降价，影响收益。`
            });
        }

        // 检查竞品跟进策略
        if (config.competitorStrategy === 'ignore') {
            suggestions.push({
                icon: '👁️',
                title: '未跟进竞品价格',
                text: '当前设置为不跟进竞品价格，建议关注周边竞品价格动态，适当调整策略以保持市场竞争力。'
            });
        }

        return suggestions;
    },

    // 生成报告
    generateReport() {
        const analytics = StorageManager.getAnalyticsData();
        const roomTypes = StorageManager.getRoomTypes();
        const pricingLogs = StorageManager.getPricingLogs();
        const operationLogs = StorageManager.getOperationLogs();

        const reportData = {
            generatedAt: new Date().toLocaleString('zh-CN'),
            period: this.currentPeriod + '天',
            summary: {
                avgOccupancy: StorageManager.getBookingRate() + '%',
                avgRevenue: this.calculateAvgRevenue(),
                totalProfit: this.calculateTotalProfit(),
                pricingCount: pricingLogs.length,
                autoPricing: pricingLogs.filter(l => l.type === 'auto').length,
                manualPricing: pricingLogs.filter(l => l.type === 'manual').length
            },
            roomPerformance: roomTypes.map(rt => ({
                name: rt.name,
                totalRooms: rt.totalRooms,
                bookedRooms: rt.bookedRooms || 0,
                bookingRate: rt.totalRooms > 0 ? Math.round((rt.bookedRooms / rt.totalRooms) * 100) : 0,
                avgPrice: rt.currentPrice || rt.basePrice,
                costPrice: rt.costPrice
            })),
            recentPricing: pricingLogs.slice(0, 10).map(log => ({
                time: new Date(log.createdAt).toLocaleString('zh-CN'),
                type: log.type === 'auto' ? '自动调价' : '手动调价',
                roomType: log.roomTypeName,
                oldPrice: log.oldPrice,
                newPrice: log.newPrice,
                change: log.reason
            })),
            recentOperations: operationLogs.slice(0, 10).map(log => ({
                time: new Date(log.createdAt).toLocaleString('zh-CN'),
                type: log.type,
                content: log.content,
                operator: log.operator
            }))
        };

        // 创建报告内容
        const reportContent = this.formatReport(reportData);

        // 下载报告
        this.downloadReport(reportContent);
    },

    // 计算平均营收
    calculateAvgRevenue() {
        const roomTypes = StorageManager.getRoomTypes();
        let totalRevenue = 0;
        let totalBooked = 0;
        
        roomTypes.forEach(rt => {
            if (rt.bookedRooms > 0) {
                totalRevenue += rt.bookedRooms * (rt.currentPrice || rt.basePrice);
                totalBooked += rt.bookedRooms;
            }
        });
        
        return totalBooked > 0 ? '¥' + Math.round(totalRevenue / totalBooked) : '¥0';
    },

    // 计算总利润
    calculateTotalProfit() {
        const roomTypes = StorageManager.getRoomTypes();
        let totalProfit = 0;
        
        roomTypes.forEach(rt => {
            if (rt.bookedRooms > 0) {
                const profitPerRoom = (rt.currentPrice || rt.basePrice) - rt.costPrice;
                totalProfit += rt.bookedRooms * profitPerRoom;
            }
        });
        
        return '¥' + totalProfit.toLocaleString();
    },

    // 格式化报告
    formatReport(data) {
        return `
酒店价格与利润配置系统 - 运营分析报告
========================================

生成时间: ${data.generatedAt}
统计周期: 最近 ${data.period}

【核心指标概览】
----------------------------------------
平均出租率: ${data.summary.avgOccupancy}
平均房价 (ADR): ${data.summary.avgRevenue}
累计利润: ${data.summary.totalProfit}

【调价统计】
----------------------------------------
总调价次数: ${data.summary.pricingCount} 次
自动调价: ${data.summary.autoPricing} 次
手动调价: ${data.summary.manualPricing} 次

【房型业绩详情】
----------------------------------------
${data.roomPerformance.map(rt => `
房型: ${rt.name}
  总房数: ${rt.totalRooms} 间
  已预订: ${rt.bookedRooms} 间
  出租率: ${rt.bookingRate}%
  平均房价: ¥${rt.avgPrice}
  保本成本: ¥${rt.costPrice}
`).join('')}

【最近调价记录】
----------------------------------------
${data.recentPricing.length > 0 ? data.recentPricing.map(p => `
[${p.time}] ${p.type}
  房型: ${p.roomType}
  价格: ¥${p.oldPrice} → ¥${p.newPrice}
  原因: ${p.reason}
`).join('') : '  暂无调价记录'}

【最近操作记录】
----------------------------------------
${data.recentOperations.length > 0 ? data.recentOperations.map(o => `
[${o.time}] ${o.type}
  内容: ${o.content}
  操作人: ${o.operator}
`).join('') : '  暂无操作记录'}

========================================
报告生成完毕
`;
    },

    // 下载报告
    downloadReport(content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `酒店运营报告_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('报告已生成并开始下载');
    },

    // 刷新
    refresh() {
        this.loadAnalyticsData();
        this.renderPerformanceTable();
        this.renderChart();
        this.renderSuggestions();
    }
};
