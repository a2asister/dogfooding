/**
 * 基准房价配置模块
 * 支持房型配置和调价系数配置
 */

const BaselineModule = {
    currentEditingRoomTypeId: null,

    init() {
        this.bindEvents();
        this.renderRoomTypes();
        this.loadCoefficients();
    },

    bindEvents() {
        // 添加房型按钮
        const addBtn = document.getElementById('addRoomType');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openRoomTypeModal());
        }

        // 模态框关闭按钮
        const modalClose = document.querySelectorAll('.modal-close');
        modalClose.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // 取消添加房型
        const cancelBtn = document.getElementById('cancelRoomType');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModals());
        }

        // 保存房型
        const saveBtn = document.getElementById('saveRoomType');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveRoomType());
        }

        // 保存系数配置
        const saveCoeffBtn = document.getElementById('saveCoefficients');
        if (saveCoeffBtn) {
            saveCoeffBtn.addEventListener('click', () => this.saveCoefficients());
        }

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    },

    // 渲染房型列表
    renderRoomTypes() {
        const container = document.getElementById('roomTypesContainer');
        if (!container) return;

        const roomTypes = StorageManager.getRoomTypes();
        
        if (roomTypes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>暂无房型配置，请点击"添加房型"按钮创建</p>
                </div>
            `;
            return;
        }

        container.innerHTML = roomTypes.map(rt => `
            <div class="room-type-card" data-id="${rt.id}">
                <h4>${rt.name}</h4>
                <div class="room-type-info">
                    <div class="info-item">
                        <div class="info-label">房间总数</div>
                        <div class="info-value">${rt.totalRooms} 间</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">已预订</div>
                        <div class="info-value">${rt.bookedRooms || 0} 间</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">基准售价</div>
                        <div class="info-value">¥${rt.basePrice}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">保本成本</div>
                        <div class="info-value" style="color: ${rt.currentPrice < rt.costPrice ? '#dc3545' : '#28a745'}">¥${rt.costPrice}</div>
                    </div>
                </div>
                ${rt.description ? `<p style="font-size:12px;color:#999;margin-top:10px;">${rt.description}</p>` : ''}
                <div class="room-type-actions">
                    <button class="btn btn-secondary" onclick="BaselineModule.editRoomType('${rt.id}')">编辑</button>
                    <button class="btn btn-danger" onclick="BaselineModule.deleteRoomType('${rt.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },

    // 打开房型模态框
    openRoomTypeModal(roomType = null) {
        const modal = document.getElementById('roomTypeModal');
        if (!modal) return;

        this.currentEditingRoomTypeId = roomType ? roomType.id : null;

        // 填充表单
        if (roomType) {
            document.getElementById('roomTypeName').value = roomType.name || '';
            document.getElementById('roomTypeCount').value = roomType.totalRooms || '';
            document.getElementById('roomTypeBasePrice').value = roomType.basePrice || '';
            document.getElementById('roomTypeCostPrice').value = roomType.costPrice || '';
            document.getElementById('roomTypeDesc').value = roomType.description || '';
        } else {
            document.getElementById('roomTypeName').value = '';
            document.getElementById('roomTypeCount').value = '';
            document.getElementById('roomTypeBasePrice').value = '';
            document.getElementById('roomTypeCostPrice').value = '';
            document.getElementById('roomTypeDesc').value = '';
        }

        modal.classList.add('active');
    },

    // 关闭所有模态框
    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        this.currentEditingRoomTypeId = null;
    },

    // 保存房型
    saveRoomType() {
        const name = document.getElementById('roomTypeName').value.trim();
        const count = parseInt(document.getElementById('roomTypeCount').value);
        const basePrice = parseFloat(document.getElementById('roomTypeBasePrice').value);
        const costPrice = parseFloat(document.getElementById('roomTypeCostPrice').value);
        const description = document.getElementById('roomTypeDesc').value.trim();

        // 验证
        if (!name) {
            alert('请输入房型名称');
            return;
        }
        if (!count || count <= 0) {
            alert('请输入有效的房间数量');
            return;
        }
        if (!basePrice || basePrice <= 0) {
            alert('请输入有效的基准售价');
            return;
        }
        if (!costPrice || costPrice <= 0) {
            alert('请输入有效的保本成本');
            return;
        }
        if (basePrice < costPrice) {
            alert('基准售价不能低于保本成本');
            return;
        }

        const roomTypeData = {
            name,
            totalRooms: count,
            basePrice,
            costPrice,
            description
        };

        if (this.currentEditingRoomTypeId) {
            // 更新
            StorageManager.updateRoomType(this.currentEditingRoomTypeId, roomTypeData);
            StorageManager.addOperationLog({
                type: 'update',
                content: `更新房型配置：${name}`,
                roomType: name
            });
        } else {
            // 新增
            StorageManager.addRoomType(roomTypeData);
            StorageManager.addOperationLog({
                type: 'create',
                content: `新增房型：${name}`,
                roomType: name
            });
        }

        this.closeModals();
        this.renderRoomTypes();
        alert('保存成功');
    },

    // 编辑房型
    editRoomType(id) {
        const roomTypes = StorageManager.getRoomTypes();
        const roomType = roomTypes.find(rt => rt.id === id);
        if (roomType) {
            this.openRoomTypeModal(roomType);
        }
    },

    // 删除房型
    deleteRoomType(id) {
        if (!confirm('确定要删除该房型吗？')) return;

        const roomTypes = StorageManager.getRoomTypes();
        const roomType = roomTypes.find(rt => rt.id === id);
        
        if (roomType) {
            StorageManager.deleteRoomType(id);
            StorageManager.addOperationLog({
                type: 'delete',
                content: `删除房型：${roomType.name}`,
                roomType: roomType.name
            });
            this.renderRoomTypes();
        }
    },

    // 加载调价系数
    loadCoefficients() {
        const coeffs = StorageManager.getPricingCoefficients();
        
        document.getElementById('offSeasonCoeff').value = coeffs.offSeason;
        document.getElementById('normalSeasonCoeff').value = coeffs.normalSeason;
        document.getElementById('peakSeasonCoeff').value = coeffs.peakSeason;
        document.getElementById('weekdayCoeff').value = coeffs.weekday;
        document.getElementById('weekendCoeff').value = coeffs.weekend;
        document.getElementById('holidayCoeff').value = coeffs.holiday;
        document.getElementById('eventCoeff').value = coeffs.event;
    },

    // 保存调价系数
    saveCoefficients() {
        const coeffs = {
            offSeason: parseFloat(document.getElementById('offSeasonCoeff').value) || 0.8,
            normalSeason: parseFloat(document.getElementById('normalSeasonCoeff').value) || 1.0,
            peakSeason: parseFloat(document.getElementById('peakSeasonCoeff').value) || 1.3,
            weekday: parseFloat(document.getElementById('weekdayCoeff').value) || 0.95,
            weekend: parseFloat(document.getElementById('weekendCoeff').value) || 1.1,
            holiday: parseFloat(document.getElementById('holidayCoeff').value) || 1.5,
            event: parseFloat(document.getElementById('eventCoeff').value) || 1.2
        };

        // 验证系数范围
        const allCoeffs = Object.values(coeffs);
        if (allCoeffs.some(c => c < 0 || c > 5)) {
            alert('系数值应在 0-5 之间');
            return;
        }

        StorageManager.savePricingCoefficients(coeffs);
        StorageManager.addOperationLog({
            type: 'config',
            content: '更新调价系数配置',
            details: coeffs
        });

        alert('系数配置已保存');
    },

    // 刷新数据
    refresh() {
        this.renderRoomTypes();
        this.loadCoefficients();
    }
};
