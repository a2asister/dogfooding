/**
 * 智能调价触发模块
 * 基于预订进度自动调价、竞品跟进策略
 */

const PricingModule = {
    autoPricingInterval: null,

    init() {
        this.bindEvents();
        this.loadConfig();
        this.renderPricingLogs();
        this.renderStatusCards();
    },

    bindEvents() {
        // 自动调价开关
        const toggle = document.getElementById('autoPricingToggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                const config = StorageManager.getPricingConfig();
                config.autoPricing = e.target.checked;
                StorageManager.savePricingConfig(config);
                
                if (e.target.checked) {
                    this.startAutoPricing();
                } else {
                    this.stopAutoPricing();
                }
            });
        }

        // 阈值滑块
        const thresholdRange = document.getElementById('thresholdRange');
        const thresholdValue = document.getElementById('thresholdValue');
        if (thresholdRange && thresholdValue) {
            thresholdRange.addEventListener('input', (e) => {
                thresholdValue.textContent = e.target.value + '%';
            });
        }

        // 竞品策略选择
        const strategySelect = document.getElementById('competitorStrategy');
        if (strategySelect) {
            strategySelect.addEventListener('change', (e) => {
                this.updateStrategyDescription(e.target.value);
            });
        }

        // 保存配置
        const saveBtn = document.getElementById('savePricingConfig');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveConfig());
        }
    },

    // 加载配置
    loadConfig() {
        const config = StorageManager.getPricingConfig();
        
        // 自动调价开关
        const toggle = document.getElementById('autoPricingToggle');
        if (toggle) {
            toggle.checked = config.autoPricing;
        }

        // 阈值
        const thresholdRange = document.getElementById('thresholdRange');
        const thresholdValue = document.getElementById('thresholdValue');
        if (thresholdRange && thresholdValue) {
            thresholdRange.value = config.threshold;
            thresholdValue.textContent = config.threshold + '%';
        }

        // 调整幅度
        document.getElementById('belowThresholdAdjust').value = config.belowThresholdAdjust;
        document.getElementById('aboveThresholdAdjust').value = config.aboveThresholdAdjust;
        document.getElementById('abnormalAdjust').value = config.abnormalAdjust;

        // 竞品策略
        const strategySelect = document.getElementById('competitorStrategy');
        if (strategySelect) {
            strategySelect.value = config.competitorStrategy;
            this.updateStrategyDescription(config.competitorStrategy);
        }

        // 启动自动调价
        if (config.autoPricing) {
            this.startAutoPricing();
        }
    },

    // 更新策略描述
    updateStrategyDescription(strategy) {
        const descriptionEl = document.getElementById('strategyDescription');
        if (!descriptionEl) return;

        const descriptions = {
            'follow': '适度跟进：当竞品价格变动超过10%时，调整幅度为竞品的50%',
            'conservative': '保守跟进：当竞品价格变动超过20%时，调整幅度为竞品的30%',
            'aggressive': '积极跟进：当竞品价格变动超过5%时，调整幅度为竞品的80%',
            'ignore': '不跟进：完全忽略竞品价格变动，仅基于自身数据调价'
        };

        descriptionEl.textContent = descriptions[strategy] || descriptions['follow'];
    },

    // 保存配置
    saveConfig() {
        const config = {
            threshold: parseInt(document.getElementById('thresholdRange').value) || 65,
            belowThresholdAdjust: parseInt(document.getElementById('belowThresholdAdjust').value) || 5,
            aboveThresholdAdjust: parseInt(document.getElementById('aboveThresholdAdjust').value) || 8,
            abnormalAdjust: parseInt(document.getElementById('abnormalAdjust').value) || 3,
            competitorStrategy: document.getElementById('competitorStrategy').value || 'follow',
            autoPricing: document.getElementById('autoPricingToggle').checked
        };

        StorageManager.savePricingConfig(config);
        StorageManager.addOperationLog({
            type: 'config',
            content: '更新智能调价配置',
            details: config
        });

        alert('调价配置已保存');
    },

    // 启动自动调价
    startAutoPricing() {
        if (this.autoPricingInterval) {
            clearInterval(this.autoPricingInterval);
        }

        // 每60秒检查一次调价条件
        this.autoPricingInterval = setInterval(() => {
            this.checkAndExecutePricing();
        }, 60000);

        // 立即执行一次
        this.checkAndExecutePricing();
    },

    // 停止自动调价
    stopAutoPricing() {
        if (this.autoPricingInterval) {
            clearInterval(this.autoPricingInterval);
            this.autoPricingInterval = null;
        }
    },

    // 检查并执行调价
    checkAndExecutePricing() {
        const config = StorageManager.getPricingConfig();
        if (!config.autoPricing) return;

        const roomTypes = StorageManager.getRoomTypes();
        const priceChanges = [];

        roomTypes.forEach(rt => {
            if (rt.status !== 'active') return;

            const bookingRate = rt.totalRooms > 0 
                ? Math.round((rt.bookedRooms / rt.totalRooms) * 100) 
                : 0;

            const currentPrice = StorageManager.calculateCurrentPrice(rt.id);
            let newPrice = currentPrice;
            let changeReason = '';

            // 检查价格锁定
            const locks = StorageManager.getPriceLocks();
            const isLocked = locks.some(lock => {
                if (lock.status !== 'active') return false;
                if (lock.roomTypeId && lock.roomTypeId !== rt.id && lock.roomTypeId !== '') return false;
                const now = new Date();
                const lockStart = new Date(lock.startDate);
                const lockEnd = new Date(lock.endDate);
                return now >= lockStart && now <= lockEnd;
            });

            if (isLocked) return;

            // 根据预订率调整
            if (bookingRate < config.threshold) {
                // 低于阈值，降价
                const discount = config.belowThresholdAdjust;
                newPrice = Math.round(currentPrice * (1 - discount / 100));
                changeReason = `预订率${bookingRate}%低于阈值${config.threshold}%，降价${discount}%`;
            } else if (bookingRate > config.threshold + 10) {
                // 远高于阈值，涨价
                const increase = config.aboveThresholdAdjust;
                newPrice = Math.round(currentPrice * (1 + increase / 100));
                changeReason = `预订率${bookingRate}%远高于阈值，涨价${increase}%`;
            }

            // 竞品价格跟进
            if (config.competitorStrategy !== 'ignore') {
                const competitorAdjustment = this.calculateCompetitorAdjustment(rt, config);
                if (competitorAdjustment !== 0) {
                    newPrice = Math.round(newPrice * (1 + competitorAdjustment / 100));
                    changeReason += `，竞品价格调整跟进${competitorAdjustment > 0 ? '+' : ''}${competitorAdjustment}%`;
                }
            }

            // 确保不低于成本价
            if (newPrice < rt.costPrice) {
                newPrice = rt.costPrice;
                changeReason += '（已修正至成本价）';
            }

            // 价格有变化才执行
            if (newPrice !== currentPrice && changeReason) {
                priceChanges.push({
                    roomTypeId: rt.id,
                    roomTypeName: rt.name,
                    oldPrice: currentPrice,
                    newPrice: newPrice,
                    changePercent: Math.round(((newPrice - currentPrice) / currentPrice) * 100),
                    reason: changeReason
                });
            }
        });

        // 执行价格变更
        priceChanges.forEach(change => {
            StorageManager.updateRoomType(change.roomTypeId, {
                currentPrice: change.newPrice
            });

            // 记录调价日志
            StorageManager.addPricingLog({
                type: 'auto',
                roomTypeId: change.roomTypeId,
                roomTypeName: change.roomTypeName,
                oldPrice: change.oldPrice,
                newPrice: change.newPrice,
                changePercent: change.changePercent,
                reason: change.reason
            });
        });

        if (priceChanges.length > 0) {
            this.renderPricingLogs();
            this.renderStatusCards();
        }
    },

    // 计算竞品调整幅度
    calculateCompetitorAdjustment(roomType, config) {
        const competitors = StorageManager.getFilteredCompetitorData();
        const roomTypeCompetitors = competitors.filter(c => 
            c.roomType.includes(roomType.name) || 
            roomType.name.includes(c.roomType)
        );

        if (roomTypeCompetitors.length === 0) return 0;

        // 计算竞品平均价格变化
        const avgChange = roomTypeCompetitors.reduce((sum, c) => sum + c.priceChange, 0) / roomTypeCompetitors.length;
        
        // 根据策略调整
        const strategyFactors = {
            'follow': { threshold: 10, factor: 0.5 },
            'conservative': { threshold: 20, factor: 0.3 },
            'aggressive': { threshold: 5, factor: 0.8 }
        };

        const strategy = strategyFactors[config.competitorStrategy] || strategyFactors['follow'];
        
        if (Math.abs(avgChange) >= strategy.threshold) {
            return Math.round(avgChange * strategy.factor);
        }

        return 0;
    },

    // 渲染调价日志
    renderPricingLogs() {
        const container = document.getElementById('pricingLogContainer');
        if (!container) return;

        const logs = StorageManager.getPricingLogs();
        
        if (logs.length === 0) {
            container.innerHTML = '<div class="empty-log">暂无调价记录</div>';
            return;
        }

        container.innerHTML = logs.slice(0, 50).map(log => {
            const time = new Date(log.createdAt);
            const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
            const changeClass = log.changePercent > 0 ? 'danger' : log.changePercent < 0 ? 'success' : 'info';
            const changePrefix = log.changePercent > 0 ? '+' : '';

            return `
                <div class="log-item">
                    <div class="log-time">${timeStr}</div>
                    <div class="log-content">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                            <h5>${log.roomTypeName}</h5>
                            <span class="log-type ${log.type}">${log.type === 'auto' ? '自动' : '手动'}</span>
                        </div>
                        <p>
                            ¥${log.oldPrice} → ¥${log.newPrice}
                            <span class="status-tag ${changeClass}" style="margin-left:10px;">
                                ${changePrefix}${log.changePercent}%
                            </span>
                        </p>
                        <p style="color:#999;font-size:12px;margin-top:5px;">${log.reason || '无说明'}</p>
                    </div>
                </div>
            `;
        }).join('');
    },

    // 渲染状态卡片
    renderStatusCards() {
        const container = document.getElementById('statusCards');
        if (!container) return;

        const roomTypes = StorageManager.getRoomTypes();
        const config = StorageManager.getPricingConfig();
        
        if (roomTypes.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">暂无房型数据</div>';
            return;
        }

        container.innerHTML = roomTypes.map(rt => {
            const bookingRate = rt.totalRooms > 0 
                ? Math.round((rt.bookedRooms / rt.totalRooms) * 100) 
                : 0;
            const currentPrice = StorageManager.calculateCurrentPrice(rt.id);
            const remaining = rt.totalRooms - rt.bookedRooms;
            
            let statusClass = 'normal';
            let statusText = '正常';
            
            if (bookingRate >= config.threshold + 10) {
                statusClass = 'high';
                statusText = '热销中';
            } else if (bookingRate >= config.threshold) {
                statusClass = 'good';
                statusText = '走势良好';
            } else if (bookingRate < 30) {
                statusClass = 'low';
                statusText = '库存充足';
            }

            // 检查是否锁定
            const locks = StorageManager.getPriceLocks();
            const isLocked = locks.some(lock => {
                if (lock.status !== 'active') return false;
                if (lock.roomTypeId && lock.roomTypeId !== rt.id && lock.roomTypeId !== '') return false;
                const now = new Date();
                const lockStart = new Date(lock.startDate);
                const lockEnd = new Date(lock.endDate);
                return now >= lockStart && now <= lockEnd;
            });

            return `
                <div class="status-card">
                    <div class="status-card-header">
                        <h4>${rt.name}</h4>
                        ${isLocked ? '<span class="status-tag warning">已锁定</span>' : ''}
                    </div>
                    <div class="status-card-body">
                        <div class="status-card-item">
                            <div class="label">当前价格</div>
                            <div class="value">¥${currentPrice}</div>
                        </div>
                        <div class="status-card-item">
                            <div class="label">预订率</div>
                            <div class="value">${bookingRate}%</div>
                        </div>
                        <div class="status-card-item">
                            <div class="label">剩余房量</div>
                            <div class="value">${remaining} 间</div>
                        </div>
                        <div class="status-card-item">
                            <div class="label">状态</div>
                            <div class="value">${statusText}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // 手动触发调价
    triggerManualPricing() {
        this.checkAndExecutePricing();
        alert('已执行调价检查');
    },

    // 刷新
    refresh() {
        this.loadConfig();
        this.renderPricingLogs();
        this.renderStatusCards();
    }
};
