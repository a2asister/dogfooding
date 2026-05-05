<template>
  <div class="group-buy-detail">
    <div class="back-bar">
      <el-button type="primary" link @click="goBack">
        <el-icon><ArrowLeft /></el-icon> 返回列表
      </el-button>
    </div>

    <div class="detail-content" v-loading="loading">
      <div v-if="item" class="detail-card">
        <el-row :gutter="40">
          <el-col :span="12">
            <div class="image-section">
              <div class="main-image-wrapper">
                <img :src="item.productImage" class="main-image" :alt="item.productName" />
                <div class="status-badge" :class="item.status">
                  <span v-if="item.status === 'active'">拼团中</span>
                  <span v-else>即将开始</span>
                </div>
                <div class="group-badge">{{ item.groupSize }}人团</div>
              </div>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="info-section">
              <h1 class="product-title">{{ item.productName }}</h1>
              <p class="product-subtitle">{{ item.description }}</p>
              
              <div class="price-section">
                <div class="price-row">
                  <span class="group-price">¥{{ item.groupPrice }}</span>
                  <span class="original-price">¥{{ item.originalPrice }}</span>
                </div>
                <div class="saving-info">
                  立省 ¥{{ item.originalPrice - item.groupPrice }} ({{ item.discountPercent }}% OFF)
                </div>
              </div>

              <el-divider />

              <div class="group-status-section">
                <div class="group-status-header">
                  <span class="group-status-label">拼团进度</span>
                  <span class="group-status-value">{{ item.currentGroups }} 个团进行中</span>
                </div>
                <div class="group-progress">
                  <div class="progress-item" v-for="(group, index) in displayGroups" :key="index">
                    <div class="group-avatars">
                      <el-avatar v-for="n in item.groupSize" :key="n" :size="24" class="group-avatar">
                        {{ String.fromCharCode(65 + n - 1) }}
                      </el-avatar>
                    </div>
                    <div class="group-info">
                      <span class="group-text">还差 {{ item.groupSize - 1 }} 人成团</span>
                      <el-button type="primary" link size="small" @click="joinGroup(group)">
                        去拼团
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <el-divider />

              <div class="action-section">
                <div class="group-size-info">
                  <span class="group-size-label">成团人数</span>
                  <span class="group-size-value">{{ item.groupSize }} 人</span>
                  <span class="limit-hint">每人限购 {{ item.limitPerUser }} 件</span>
                </div>

                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    size="large" 
                    :loading="joining"
                    :disabled="item.status !== 'active'"
                    @click="handleJoinGroup"
                    class="join-button"
                  >
                    <el-icon><UserFilled /></el-icon>
                    {{ item.status === 'active' ? '立即开团' : getStatusText(item.status) }}
                  </el-button>
                  <el-button size="large" @click="addToCart">
                    <el-icon><Star /></el-icon> 关注
                  </el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div class="description-section">
          <h3 class="section-title">商品详情</h3>
          <div class="description-content">
            <p>{{ item.description }}</p>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="商品分类">{{ item.category }}</el-descriptions-item>
              <el-descriptions-item label="活动时间">
                {{ item.formattedStartTime }} 至 {{ item.formattedEndTime }}
              </el-descriptions-item>
              <el-descriptions-item label="原价">¥{{ item.originalPrice }}</el-descriptions-item>
              <el-descriptions-item label="拼团价">¥{{ item.groupPrice }}</el-descriptions-item>
              <el-descriptions-item label="成团人数">{{ item.groupSize }} 人</el-descriptions-item>
              <el-descriptions-item label="已拼">{{ item.soldStock }} 件</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>

      <el-empty v-else-if="!loading" description="拼团活动不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, UserFilled, Star } from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const API_BASE = 'http://localhost:3004/api';

const loading = ref(false);
const joining = ref(false);
const item = ref(null);
const displayGroups = ref([]);

const getStatusText = (status) => {
  const texts = {
    active: '立即开团',
    scheduled: '即将开始'
  };
  return texts[status] || '活动结束';
};

const goBack = () => {
  router.push('/');
};

const loadGroupBuy = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE}/group-buys/${route.params.id}`);
    if (response.data.success) {
      item.value = response.data.data;
      displayGroups.value = item.value.currentGroups ? [{}, {}] : [{}];
    }
  } catch (error) {
    console.error('加载拼团详情失败:', error);
    ElMessage.error('加载拼团详情失败');
  } finally {
    loading.value = false;
  }
};

const handleJoinGroup = async () => {
  if (item.value.status !== 'active') {
    ElMessage.warning('该拼团活动当前不可参与');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认参与「${item.value.productName}」的拼团活动？`,
      '确认开团',
      {
        confirmButtonText: '确认开团',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    joining.value = true;
    const response = await axios.post(
      `${API_BASE}/group-buys/${route.params.id}/join`,
      {
        userId: 'user_001'
      }
    );

    if (response.data.success) {
      ElMessage.success('开团成功！等待其他成员加入...');
      loadGroupBuy();
    }
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.error) {
        ElMessage.error(error.response.data.error);
      } else {
        ElMessage.error('参与拼团失败，请稍后重试');
      }
      console.error(error);
    }
  } finally {
    joining.value = false;
  }
};

const joinGroup = (group) => {
  ElMessage.success('已加入拼团');
};

const addToCart = () => {
  ElMessage.success('已添加关注');
};

onMounted(() => {
  loadGroupBuy();
});
</script>

<style scoped>
.group-buy-detail {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #5a67d8 100%);
  padding-bottom: 40px;
}

.back-bar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.detail-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.image-section {
  position: relative;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #f5f7fa;
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.status-badge.active {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  animation: pulse 1.5s infinite;
}

.status-badge.scheduled {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.group-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
}

.info-section {
  padding: 10px 0;
}

.product-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.product-subtitle {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 20px 0;
}

.price-section {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.group-price {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
}

.original-price {
  font-size: 18px;
  color: #95a5a6;
  text-decoration: line-through;
}

.saving-info {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

.group-status-section {
  margin-bottom: 20px;
}

.group-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-status-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 600;
}

.group-status-value {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

.group-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.group-avatars {
  display: flex;
  gap: -8px;
}

.group-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.group-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-text {
  font-size: 14px;
  color: #6c757d;
}

.group-size-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.group-size-label {
  font-size: 14px;
  color: #6c757d;
}

.group-size-value {
  font-size: 16px;
  color: #667eea;
  font-weight: 600;
}

.limit-hint {
  font-size: 12px;
  color: #95a5a6;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.join-button {
  flex: 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.join-button:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.description-content p {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.8;
  margin-bottom: 16px;
}
</style>
