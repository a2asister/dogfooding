<template>
  <div>
    <div v-if="loading" class="loading">
      数据加载中...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>总门店数</h3>
          <div class="value">{{ summaryData?.overview.totalStores || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>活跃门店</h3>
          <div class="value">{{ summaryData?.overview.activeStores || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>总客流（进）</h3>
          <div class="value">{{ summaryData?.overview.totalInFlow || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>总客流（出）</h3>
          <div class="value">{{ summaryData?.overview.totalOutFlow || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>库存总价值</h3>
          <div class="value">¥{{ summaryData?.overview.totalInventoryValue || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>库存总数</h3>
          <div class="value">{{ summaryData?.overview.totalInventoryItems || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>总会员数</h3>
          <div class="value">{{ summaryData?.overview.totalMembers || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>活跃会员</h3>
          <div class="value">{{ summaryData?.overview.activeMembers || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>会员总积分</h3>
          <div class="value">{{ summaryData?.overview.totalMemberPoints || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>会员总消费</h3>
          <div class="value">¥{{ summaryData?.overview.totalMemberSpent || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>营销活动数</h3>
          <div class="value">{{ summaryData?.overview.totalPromotions || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>活跃活动</h3>
          <div class="value">{{ summaryData?.overview.activePromotions || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>总员工数</h3>
          <div class="value">{{ summaryData?.overview.totalEmployees || 0 }}</div>
        </div>
        <div class="stat-card">
          <h3>活跃员工</h3>
          <div class="value">{{ summaryData?.overview.activeEmployees || 0 }}</div>
        </div>
      </div>

      <div class="card">
        <h2>各门店数据汇总</h2>
        <table v-if="summaryData?.storeSummaries.length">
          <thead>
            <tr>
              <th>门店名称</th>
              <th>总客流（进）</th>
              <th>总客流（出）</th>
              <th>库存价值</th>
              <th>库存数量</th>
              <th>会员数</th>
              <th>考勤记录数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in summaryData?.storeSummaries" :key="item.storeId">
              <td>{{ item.storeName }}</td>
              <td>{{ item.totalInFlow }}</td>
              <td>{{ item.totalOutFlow }}</td>
              <td>¥{{ item.inventoryValue }}</td>
              <td>{{ item.inventoryItems }}</td>
              <td>{{ item.memberCount }}</td>
              <td>{{ item.attendanceCount }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="loading">暂无门店数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { summaryApi } from '@/api/summary';
import { SummaryData } from '@/types';

const loading = ref(true);
const error = ref('');
const summaryData = ref<SummaryData | null>(null);

const loadSummary = async () => {
  try {
    loading.value = true;
    const response = await summaryApi.getSummary();
    if (response.success && response.data) {
      summaryData.value = response.data;
    } else {
      error.value = response.message || '获取数据失败';
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSummary();
});
</script>
