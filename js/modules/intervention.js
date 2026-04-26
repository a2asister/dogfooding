/**
 * 人工干预管控模块
 * 价格锁定、手动调价、促销配置、操作日志
 */

const InterventionModule = {
    init() {
        this.bindEvents();
        this.renderRoomTypeSelects();
        this.renderPriceLocks();
        this.renderPromotions();
        this.renderOperationLogs();
    },

    bindEvents() {
        // 标签页切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 调价类型切换
        const adjustTypeRadios = document.querySelectorAll('input[name="adjustType"]');
        adjustTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleAdjustType(e.target.value);
            });
        });

        // 价格锁定按钮
        const lockBtn = document.getElementById('lockPriceBtn');
        if (lockBtn) {
            lockBtn.addEventListener('click', () => this.lockPrice());
        }

        // 解除锁定按钮
        const unlockBtn = document.getElementById('unlockPriceBtn');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => this.unlockPrice());
        }

        // 应用手动调整
        const applyAdjustBtn = document.getElementById('applyManualAdjust');
        if (applyAdjustBtn) {
            applyAdjustBtn.addEventListener('click', () => this.applyManualAdjust());
        }

        // 添加促销按钮
        const addPromoBtn = document.getElementById('addPromotion');
        if (addPromoBtn) {
            addPromoBtn.addEventListener('click', () => this.openPromotionModal());
        }

        // 保存促销
        const savePromoBtn = document.getElementById('savePromotion');
        if (savePromoBtn) {
            savePromoBtn.addEventListener('click', () => this.savePromotion());
        }

        // 取消促销
        const cancelPromoBtn = document.getElementById('cancelPromotion');
        if (cancelPromoBtn) {
            cancelPromoBtn.addEventListener('click', () => this.closePromotionModal());
        }

        // 促销类型切换
        const promoTypeSelect = document.getElementById('promotionType');
        if (promoTypeSelect) {
            promoTypeSelect.addEventListener('change', (e) => {
                this.togglePromotionType(e.target.value);
            });
        }

        // 筛选日志
        const filterLogsBtn = document.getElementById('filterLogs');
        if (filterLogsBtn) {
            filterLogsBtn.addEventListener('click', () => this.filterLogs());
        }

        // 统计周期切换
        const analysisPeriod = document.getElementById('analysisPeriod');
        if (analysisPeriod) {
            analysisPeriod.addEventListener('change', (e) => {
                const customRange = document.getElementById('customDateRange');
                if (customRange) {
                    customRange.style.display = e.target.value === 'custom' ? 'flex' : 'none';
                }
            });
        }
    },

    // 切换标签页
    switchTab(tabName) {
        // 更新按钮状态
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // 更新内容显示
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName + '-tab');
        });

        // 刷新对应数据
        if (tabName === 'price-lock') {
            this.renderPriceLocks();
        } else if (tabName === 'promotions') {
            this.renderPromotions();
        } else if (tabName === 'operation-log') {
            this.renderOperationLogs();
        }
    },

    // 切换调价类型
    toggleAdjustType(type) {
        const fixedGroup = document.getElementById('fixedPriceGroup');
        const percentageGroup = document.getElementById('percentageGroup');
        
        if (fixedGroup && percentageGroup) {
            fixedGroup.style.display = type === 'fixed' ? 'block' : 'none';
            percentageGroup.style.display = type === 'percentage' ? 'block' : 'none';
        }
    },

    // 切换促销类型
    togglePromotionType(type) {
        const discountGroup = document.getElementById('promotionDiscountGroup');
        const fixedGroup = document.getElementById('promotionFixedGroup');
        
        if (discountGroup && fixedGroup) {
            discountGroup.style.display = type === 'discount' ? 'flex' : 'none';
            fixedGroup.style.display = type === 'fixed' ? 'flex' : 'none';
        }
    },

    // 渲染房型选择下拉框
    renderRoomTypeSelects() {
        const roomTypes = StorageManager.getRoomTypes();
        const selects = [
            document.getElementById('lockRoomType'),
            document.getElementById('adjustRoomType'),
            document.getElementById('promotionRoomType')
        ];

        selects.forEach(select => {
            if (!select) return;
            
            // 保留第一个选项（全部房型）
            const firstOption = select.querySelector('option');
            select.innerHTML = firstOption ? firstOption.outerHTML : '';
            
            // 添加房型选项
            roomTypes.forEach(rt => {
                const option = document.createElement('option');
                option.value = rt.id;
                option.textContent = rt.name;
                select.appendChild(option);
            });
        });
    },

    // 渲染价格锁定列表
    renderPriceLocks() {
        const tbody = document.querySelector('#locksTable tbody');
        if (!tbody) return;

        const locks = StorageManager.getPriceLocks();
        const roomTypes = StorageManager.getRoomTypes();

        if (locks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;color:#999;padding:40px;">
                        暂无价格锁定记录
                    </td>
                </tr>
            `;
            return;
        }

        const channelNames = {
            'all': '全部渠道',
            'direct': '官网直订',
            'ctrip': '携程',
            'fliggy': '飞猪',
            'meituan': '美团'
        };

        tbody.innerHTML = locks.map(lock => {
            const roomType = roomTypes.find(rt => rt.id === lock.roomTypeId);
            const roomTypeName = roomType ? roomType.name : (lock.roomTypeId === '' ? '全部房型' : '未知');
            
            return `
                <tr>
                    <td>${roomTypeName}</td>
                    <td>${lock.startDate} 至 ${lock.endDate}</td>
                    <td>${channelNames[lock.channel] || lock.channel}</td>
                    <td>¥${lock.lockedPrice || '-'}</td>
                    <td>${lock.reason || '-'}</td>
                    <td>${lock.operator || '系统管理员'}</td>
                    <td>
                        ${lock.status === 'active' ? 
                            `<button class="btn btn-secondary" onclick="InterventionModule.releaseLock('${lock.id}')">解除</button>` :
                            '<span style="color:#999;">已解除</span>'
                        }
                    </td>
                </tr>
            `;
        }).join('');
    },

    // 锁定价格
    lockPrice() {
        const roomTypeId = document.getElementById('lockRoomType').value;
        const startDate = document.getElementById('lockStartDate').value;
        const endDate = document.getElementById('lockEndDate').value;
        const channel = document.getElementById('lockChannel').value;
        const reason = document.getElementById('lockReason').value.trim();

        if (!startDate || !endDate) {
            alert('请选择锁定日期范围');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('开始日期不能晚于结束日期');
            return;
        }

        // 获取当前价格作为锁定价格
        const roomTypes = StorageManager.getRoomTypes();
        let lockedPrice = null;
        
        if (roomTypeId) {
            const roomType = roomTypes.find(rt => rt.id === roomTypeId);
            if (roomType) {
                lockedPrice = StorageManager.calculateCurrentPrice(roomTypeId);
            }
        } else {
            // 全部房型，取第一个房型的价格作为参考
            if (roomTypes.length > 0) {
                lockedPrice = StorageManager.calculateCurrentPrice(roomTypes[0].id);
            }
        }

        const lock = {
            roomTypeId,
            startDate,
            endDate,
            channel,
            lockedPrice,
            reason,
            operator: '系统管理员'
        };

        StorageManager.addPriceLock(lock);
        StorageManager.addOperationLog({
            type: 'lock',
            content: `锁定价格：${reason || '无原因'}`,
            roomType: roomTypeId ? (roomTypes.find(rt => rt.id === roomTypeId)?.name || '未知') : '全部房型',
            priceChange: `锁定至 ¥${lockedPrice}`
        });

        this.renderPriceLocks();
        alert('价格锁定成功');

        // 清空表单
        document.getElementById('lockStartDate').value = '';
        document.getElementById('lockEndDate').value = '';
        document.getElementById('lockReason').value = '';
    },

    // 解除价格锁定
    unlockPrice() {
        const roomTypeId = document.getElementById('lockRoomType').value;
        const startDate = document.getElementById('lockStartDate').value;
        const endDate = document.getElementById('lockEndDate').value;

        if (!startDate || !endDate) {
            alert('请选择要解除锁定的日期范围');
            return;
        }

        const locks = StorageManager.getPriceLocks();
        let releasedCount = 0;

        locks.forEach(lock => {
            if (lock.status !== 'active') return;
            
            const matchRoom = !roomTypeId || lock.roomTypeId === roomTypeId || lock.roomTypeId === '';
            const matchDate = startDate <= lock.endDate && endDate >= lock.startDate;
            
            if (matchRoom && matchDate) {
                StorageManager.updatePriceLock(lock.id, { status: 'released' });
                releasedCount++;
            }
        });

        if (releasedCount > 0) {
            StorageManager.addOperationLog({
                type: 'unlock',
                content: `解除价格锁定`,
                details: `解除 ${releasedCount} 条锁定记录`
            });
            this.renderPriceLocks();
            alert(`已解除 ${releasedCount} 条价格锁定`);
        } else {
            alert('未找到符合条件的锁定记录');
        }
    },

    // 解除单个锁定
    releaseLock(lockId) {
        if (!confirm('确定要解除此价格锁定吗？')) return;

        StorageManager.updatePriceLock(lockId, { status: 'released' });
        
        const locks = StorageManager.getPriceLocks();
        const lock = locks.find(l => l.id === lockId);
        
        if (lock) {
            StorageManager.addOperationLog({
                type: 'unlock',
                content: '解除价格锁定',
                details: `解除 ${lock.reason || '价格锁定'}`
            });
        }

        this.renderPriceLocks();
    },

    // 应用手动调价
    applyManualAdjust() {
        const roomTypeId = document.getElementById('adjustRoomType').value;
        const adjustType = document.querySelector('input[name="adjustType"]:checked').value;
        const startDate = document.getElementById('adjustStartDate').value;
        const endDate = document.getElementById('adjustEndDate').value;
        const reason = document.getElementById('adjustReason').value.trim();

        if (!roomTypeId) {
            alert('请选择房型');
            return;
        }

        const roomTypes = StorageManager.getRoomTypes();
        const roomType = roomTypes.find(rt => rt.id === roomTypeId);
        if (!roomType) {
            alert('房型不存在');
            return;
        }

        const currentPrice = StorageManager.calculateCurrentPrice(roomTypeId);
        let newPrice;
        let changePercent;

        if (adjustType === 'fixed') {
            newPrice = parseFloat(document.getElementById('fixedPrice').value);
            if (!newPrice || newPrice <= 0) {
                alert('请输入有效的固定价格');
                return;
            }
            changePercent = Math.round(((newPrice - currentPrice) / currentPrice) * 100);
        } else {
            const percentage = parseFloat(document.getElementById('percentageAdjust').value);
            if (isNaN(percentage)) {
                alert('请输入有效的调整比例');
                return;
            }
            newPrice = Math.round(currentPrice * (1 + percentage / 100));
            changePercent = percentage;
        }

        // 检查是否低于成本价
        if (newPrice < roomType.costPrice) {
            if (!confirm(`调整后的价格(¥${newPrice})低于成本价(¥${roomType.costPrice})，是否继续？`)) {
                return;
            }
        }

        // 更新价格
        StorageManager.updateRoomType(roomTypeId, { currentPrice: newPrice });

        // 记录调价日志
        StorageManager.addPricingLog({
            type: 'manual',
            roomTypeId,
            roomTypeName: roomType.name,
            oldPrice: currentPrice,
            newPrice,
            changePercent,
            reason: reason || '手动调价'
        });

        // 记录操作日志
        StorageManager.addOperationLog({
            type: 'manual',
            content: `手动调价：${reason || '无原因'}`,
            roomType: roomType.name,
            priceChange: `¥${currentPrice} → ¥${newPrice} (${changePercent > 0 ? '+' : ''}${changePercent}%)`
        });

        alert('价格调整成功');

        // 清空表单
        document.getElementById('fixedPrice').value = '';
        document.getElementById('percentageAdjust').value = '';
        document.getElementById('adjustStartDate').value = '';
        document.getElementById('adjustEndDate').value = '';
        document.getElementById('adjustReason').value = '';
    },

    // 打开促销模态框
    openPromotionModal() {
        const modal = document.getElementById('promotionModal');
        if (!modal) return;

        // 清空表单
        document.getElementById('promotionName').value = '';
        document.getElementById('promotionType').value = 'discount';
        document.getElementById('promotionDiscount').value = '';
        document.getElementById('promotionFixed').value = '';
        document.getElementById('promotionRoomType').value = '';
        document.getElementById('promotionStartDate').value = '';
        document.getElementById('promotionEndDate').value = '';
        document.getElementById('promotionConditions').value = '';

        this.togglePromotionType('discount');
        modal.classList.add('active');
    },

    // 关闭促销模态框
    closePromotionModal() {
        const modal = document.getElementById('promotionModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // 保存促销
    savePromotion() {
        const name = document.getElementById('promotionName').value.trim();
        const type = document.getElementById('promotionType').value;
        const roomTypeId = document.getElementById('promotionRoomType').value;
        const startDate = document.getElementById('promotionStartDate').value;
        const endDate = document.getElementById('promotionEndDate').value;
        const conditions = document.getElementById('promotionConditions').value.trim();

        if (!name) {
            alert('请输入促销名称');
            return;
        }
        if (!startDate || !endDate) {
            alert('请选择活动时间');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('开始日期不能晚于结束日期');
            return;
        }

        let discount = null;
        let fixedAmount = null;

        if (type === 'discount') {
            discount = parseFloat(document.getElementById('promotionDiscount').value);
            if (!discount || discount < 1 || discount > 99) {
                alert('请输入有效的折扣（1-99）');
                return;
            }
        } else if (type === 'fixed') {
            fixedAmount = parseFloat(document.getElementById('promotionFixed').value);
            if (!fixedAmount || fixedAmount <= 0) {
                alert('请输入有效的减免金额');
                return;
            }
        }

        const promotion = {
            name,
            type,
            discount,
            fixedAmount,
            roomTypeId,
            startDate,
            endDate,
            conditions,
            operator: '系统管理员'
        };

        StorageManager.addPromotion(promotion);
        StorageManager.addOperationLog({
            type: 'promotion',
            content: `创建促销：${name}`,
            details: promotion
        });

        this.closePromotionModal();
        this.renderPromotions();
        alert('促销创建成功');
    },

    // 渲染促销列表
    renderPromotions() {
        const container = document.getElementById('promotionsList');
        if (!container) return;

        const promotions = StorageManager.getPromotions();
        const roomTypes = StorageManager.getRoomTypes();

        if (promotions.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;color:#999;padding:40px;">
                    暂无促销活动，点击"新建促销"创建
                </div>
            `;
            return;
        }

        const typeNames = {
            'discount': '折扣优惠',
            'fixed': '固定减价',
            'package': '打包套餐'
        };

        container.innerHTML = promotions.map(promo => {
            const roomType = roomTypes.find(rt => rt.id === promo.roomTypeId);
            const roomTypeName = roomType ? roomType.name : (promo.roomTypeId === '' ? '全部房型' : '未知');
            
            const now = new Date();
            const isActive = now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
            const isUpcoming = now < new Date(promo.startDate);

            let statusClass = 'active';
            let statusText = '进行中';
            if (!isActive && !isUpcoming) {
                statusClass = 'inactive';
                statusText = '已结束';
            } else if (isUpcoming) {
                statusText = '即将开始';
            }

            let discountText = '';
            if (promo.type === 'discount') {
                discountText = `${promo.discount}折`;
            } else if (promo.type === 'fixed') {
                discountText = `立减¥${promo.fixedAmount}`;
            } else {
                discountText = '套餐优惠';
            }

            return `
                <div class="promotion-card ${promo.status === 'inactive' ? 'inactive' : ''}">
                    <div class="promotion-card-header">
                        <h4>${promo.name}</h4>
                        <span class="promotion-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="promotion-card-body">
                        <p><strong>优惠类型：</strong>${typeNames[promo.type] || promo.type}</p>
                        <p><strong>优惠力度：</strong>${discountText}</p>
                        <p><strong>适用房型：</strong>${roomTypeName}</p>
                        <p><strong>活动时间：</strong>${promo.startDate} 至 ${promo.endDate}</p>
                        ${promo.conditions ? `<p><strong>使用条件：</strong>${promo.conditions}</p>` : ''}
                    </div>
                    <div class="promotion-card-footer">
                        <span style="font-size:12px;color:#999;">创建人：${promo.operator || '系统管理员'}</span>
                        <div>
                            ${promo.status !== 'inactive' && isActive ? 
                                `<button class="btn btn-secondary" onclick="InterventionModule.stopPromotion('${promo.id}')">终止</button>` : ''
                            }
                            <button class="btn btn-danger" onclick="InterventionModule.deletePromotion('${promo.id}')">删除</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // 终止促销
    stopPromotion(id) {
        if (!confirm('确定要终止此促销活动吗？')) return;

        StorageManager.updatePromotion(id, { status: 'inactive' });
        
        const promotions = StorageManager.getPromotions();
        const promo = promotions.find(p => p.id === id);
        
        if (promo) {
            StorageManager.addOperationLog({
                type: 'promotion',
                content: `终止促销：${promo.name}`,
                details: promo
            });
        }

        this.renderPromotions();
    },

    // 删除促销
    deletePromotion(id) {
        if (!confirm('确定要删除此促销活动吗？')) return;

        const promotions = StorageManager.getPromotions();
        const promo = promotions.find(p => p.id === id);
        
        StorageManager.deletePromotion(id);
        
        if (promo) {
            StorageManager.addOperationLog({
                type: 'promotion',
                content: `删除促销：${promo.name}`,
                details: promo
            });
        }

        this.renderPromotions();
    },

    // 渲染操作日志
    renderOperationLogs(filters = {}) {
        const tbody = document.querySelector('#operationLogTable tbody');
        if (!tbody) return;

        let logs = StorageManager.getOperationLogs();

        // 筛选
        if (filters.type) {
            logs = logs.filter(log => log.type === filters.type);
        }
        if (filters.startDate) {
            logs = logs.filter(log => new Date(log.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            logs = logs.filter(log => new Date(log.createdAt) <= new Date(filters.endDate + 'T23:59:59'));
        }

        if (logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;color:#999;padding:40px;">
                        暂无操作日志
                    </td>
                </tr>
            `;
            return;
        }

        const typeNames = {
            'create': '创建',
            'update': '更新',
            'delete': '删除',
            'config': '配置',
            'lock': '价格锁定',
            'unlock': '解除锁定',
            'manual': '手动调价',
            'promotion': '促销配置'
        };

        const typeClasses = {
            'create': 'success',
            'update': 'info',
            'delete': 'danger',
            'config': 'info',
            'lock': 'warning',
            'unlock': 'warning',
            'manual': 'warning',
            'promotion': 'success'
        };

        tbody.innerHTML = logs.slice(0, 100).map(log => {
            const time = new Date(log.createdAt);
            const timeStr = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

            return `
                <tr>
                    <td>${timeStr}</td>
                    <td><span class="status-tag ${typeClasses[log.type] || 'info'}">${typeNames[log.type] || log.type}</span></td>
                    <td>${log.content || '-'}</td>
                    <td>${log.roomType || '-'}</td>
                    <td>${log.priceChange || '-'}</td>
                    <td>${log.operator || '系统管理员'}</td>
                </tr>
            `;
        }).join('');
    },

    // 筛选日志
    filterLogs() {
        const type = document.getElementById('logTypeFilter').value;
        const startDate = document.getElementById('logStartDate').value;
        const endDate = document.getElementById('logEndDate').value;

        const filters = {};
        if (type) filters.type = type;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        this.renderOperationLogs(filters);
    },

    // 刷新
    refresh() {
        this.renderRoomTypeSelects();
        this.renderPriceLocks();
        this.renderPromotions();
        this.renderOperationLogs();
    }
};
