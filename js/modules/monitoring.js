/**
 * 实时数据监测模块
 * 显示库存状态、历史数据、竞品价格监测
 */

const MonitoringModule = {
    lastUpdateTime: null,

    init() {
        this.bindEvents();
        this.refreshData();
    },

    bindEvents() {
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    },

    refreshData() {
        this.updateDashboardCards();
        this.renderInventoryTable();
        this.renderHistoryData();
        this.renderCompetitorTable();
        this.updateLastUpdateTime();
    },

    // 更新仪表板卡片
    updateDashboardCards() {
        const totalRooms = StorageManager.getTotalRooms();
        const bookedRooms = StorageManager.getBookedRooms();
        const availableRooms = totalRooms - bookedRooms;
        const bookingRate = StorageManager.getBookingRate();
        const bookingData = StorageManager.getBookingData();

        const totalEl = document.getElementById('totalInventory');
        const availableEl = document.getElementById('availableRooms');
        const bookingRateEl = document.getElementById('bookingRate');
        const todayBookingsEl = document.getElementById('todayBookings');

        if (totalEl) totalEl.textContent = totalRooms;
        if (availableEl) availableEl.textContent = availableRooms;
        if (bookingRateEl) bookingRateEl.textContent = bookingRate + '%';
        if (todayBookingsEl) todayBookingsEl.textContent = bookingData.todayBookings || 0;
    },

    // 渲染库存表格
    renderInventoryTable() {
        const tbody = document.querySelector('#inventoryTable tbody');
        if (!tbody) return;

        const roomTypes = StorageManager.getRoomTypes();
        
        if (roomTypes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;color:#999;padding:40px;">
                        暂无房型数据
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = roomTypes.map(rt => {
            const bookingRate = rt.totalRooms > 0 ? Math.round((rt.bookedRooms / rt.totalRooms) * 100) : 0;
            const remaining = rt.totalRooms - rt.bookedRooms;
            
            let statusClass = 'success';
            let statusText = '正常';
            
            if (bookingRate >= 90) {
                statusClass = 'danger';
                statusText = '紧张';
            } else if (bookingRate >= 65) {
                statusClass = 'warning';
                statusText = '良好';
            } else if (bookingRate < 30) {
                statusClass = 'info';
                statusText = '空置';
            }

            return `
                <tr>
                    <td><strong>${rt.name}</strong></td>
                    <td>${rt.totalRooms}</td>
                    <td>${rt.bookedRooms || 0}</td>
                    <td>${remaining}</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span>${bookingRate}%</span>
                            <div style="flex:1;max-width:100px;height:8px;background:#e9ecef;border-radius:4px;overflow:hidden;">
                                <div style="width:${bookingRate}%;height:100%;background:${bookingRate >= 65 ? '#28a745' : '#6c757d'};"></div>
                            </div>
                        </div>
                    </td>
                    <td><span class="status-tag ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
    },

    // 渲染历史数据
    renderHistoryData() {
        const container = document.getElementById('historyDataContainer');
        if (!container) return;

        const historyData = StorageManager.getHistoryData();
        const currentBookingRate = StorageManager.getBookingRate();

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
                <div style="background:#f8f9fa;padding:20px;border-radius:8px;">
                    <h4 style="margin-bottom:15px;color:#555;font-size:14px;">与去年同期对比</h4>
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                        <span style="color:#999;">出租率</span>
                        <span style="font-weight:600;">
                            ${currentBookingRate}% 
                            <span style="color:${currentBookingRate >= historyData.samePeriodLastYear.occupancyRate ? '#28a745' : '#dc3545'};margin-left:10px;">
                                ${currentBookingRate >= historyData.samePeriodLastYear.occupancyRate ? '↑' : '↓'} 
                                ${Math.abs(currentBookingRate - historyData.samePeriodLastYear.occupancyRate)}%
                            </span>
                        </span>
                    </div>
                    <div style="font-size:12px;color:#999;">
                        去年同期: ${historyData.samePeriodLastYear.occupancyRate}%
                    </div>
                </div>
                <div style="background:#f8f9fa;padding:20px;border-radius:8px;">
                    <h4 style="margin-bottom:15px;color:#555;font-size:14px;">与上月对比</h4>
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                        <span style="color:#999;">出租率</span>
                        <span style="font-weight:600;">
                            ${currentBookingRate}% 
                            <span style="color:${currentBookingRate >= historyData.samePeriodLastMonth.occupancyRate ? '#28a745' : '#dc3545'};margin-left:10px;">
                                ${currentBookingRate >= historyData.samePeriodLastMonth.occupancyRate ? '↑' : '↓'} 
                                ${Math.abs(currentBookingRate - historyData.samePeriodLastMonth.occupancyRate)}%
                            </span>
                        </span>
                    </div>
                    <div style="font-size:12px;color:#999;">
                        上月同期: ${historyData.samePeriodLastMonth.occupancyRate}%
                    </div>
                </div>
            </div>
        `;
    },

    // 渲染竞品价格表格
    renderCompetitorTable() {
        const tbody = document.querySelector('#competitorTable tbody');
        const filteredCountEl = document.getElementById('filteredCount');
        if (!tbody) return;

        const competitorData = StorageManager.getCompetitorData();
        const validData = StorageManager.getFilteredCompetitorData();
        const invalidCount = StorageManager.getInvalidCompetitorCount();

        if (filteredCountEl) {
            filteredCountEl.textContent = invalidCount;
        }

        if (validData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;color:#999;padding:40px;">
                        暂无有效竞品数据
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = validData.map(item => {
            const changeClass = item.priceChange > 0 ? 'danger' : item.priceChange < 0 ? 'success' : 'info';
            const changePrefix = item.priceChange > 0 ? '+' : '';

            return `
                <tr>
                    <td><strong>${item.hotelName}</strong></td>
                    <td>${item.roomType}</td>
                    <td>¥${item.listedPrice}</td>
                    <td>¥${item.historicalAvgPrice}</td>
                    <td>
                        <span class="status-tag ${changeClass}">
                            ${changePrefix}${item.priceChange}%
                        </span>
                    </td>
                    <td>
                        <span class="status-tag success">有效</span>
                    </td>
                </tr>
            `;
        }).join('');

        // 显示被过滤的数据（可选）
        if (invalidCount > 0) {
            const invalidData = competitorData.filter(item => !item.isValid);
            invalidData.forEach(item => {
                tbody.innerHTML += `
                    <tr style="opacity:0.5;background:#f8f9fa;">
                        <td><strong>${item.hotelName}</strong></td>
                        <td>${item.roomType}</td>
                        <td>¥${item.listedPrice}</td>
                        <td>¥${item.historicalAvgPrice}</td>
                        <td>
                            <span class="status-tag danger">
                                ${item.priceChange > 0 ? '+' : ''}${item.priceChange}%
                            </span>
                        </td>
                        <td>
                            <span class="status-tag warning" title="${item.filterReason}">已过滤</span>
                        </td>
                    </tr>
                `;
            });
        }
    },

    // 更新最后更新时间
    updateLastUpdateTime() {
        this.lastUpdateTime = new Date();
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            const timeStr = this.formatTime(this.lastUpdateTime);
            lastUpdateEl.textContent = `最后更新: ${timeStr}`;
        }
    },

    // 格式化时间
    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    // 模拟实时数据更新（每30秒）
    startRealTimeUpdates() {
        setInterval(() => {
            this.simulateBookingUpdate();
            this.refreshData();
        }, 30000);
    },

    // 模拟预订数据更新
    simulateBookingUpdate() {
        const roomTypes = StorageManager.getRoomTypes();
        if (roomTypes.length === 0) return;

        // 随机选择一个房型增加预订
        const randomIndex = Math.floor(Math.random() * roomTypes.length);
        const rt = roomTypes[randomIndex];
        
        if (rt.bookedRooms < rt.totalRooms && Math.random() > 0.7) {
            rt.bookedRooms = (rt.bookedRooms || 0) + 1;
            StorageManager.saveRoomTypes(roomTypes);

            // 更新今日预订数
            const bookingData = StorageManager.getBookingData();
            bookingData.todayBookings = (bookingData.todayBookings || 0) + 1;
            bookingData.lastBookingTime = new Date().toISOString();
            StorageManager.save(StorageManager.STORAGE_KEYS.BOOKING_DATA, bookingData);
        }
    },

    // 刷新
    refresh() {
        this.refreshData();
    }
};
