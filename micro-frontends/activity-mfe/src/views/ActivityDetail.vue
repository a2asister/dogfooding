<template>
  <div class="activity-detail-page">
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-button type="primary" link @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回列表
          </el-button>
          <span>活动详情</span>
          <div class="header-actions">
            <el-button type="primary" @click="editActivity">
              <el-icon><Edit /></el-icon> 编辑活动
            </el-button>
          </div>
        </div>
      </template>

      <el-skeleton :loading="loading" animated>
        <template #default>
          <el-row :gutter="40">
            <el-col :span="16">
              <div class="activity-banner-section">
                <img 
                  :src="activity.banner || defaultBanner" 
                  class="activity-banner"
                  alt="活动横幅"
                />
              </div>

              <div class="activity-info-section">
                <h1 class="activity-name">{{ activity.name }}</h1>
                <div class="activity-meta">
                  <el-tag :type="getTypeTagType(activity.type)" size="large">
                    {{ getTypeLabel(activity.type) }}
                  </el-tag>
                  <el-tag :type="getStatusTagType(activity.status)" size="large">
                    {{ getStatusLabel(activity.status) }}
                  </el-tag>
                  <span class="priority-badge">
                    优先级: {{ activity.priority }}
                  </span>
                </div>
                <p class="activity-description">{{ activity.description }}</p>
              </div>

              <el-divider content-position="left">活动时间</el-divider>
              <el-row :gutter="20" class="time-section">
                <el-col :span="12">
                  <div class="time-card start">
                    <div class="time-label">开始时间</div>
                    <div class="time-value">{{ activity.formattedStartTime }}</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="time-card end">
                    <div class="time-label">结束时间</div>
                    <div class="time-value">{{ activity.formattedEndTime }}</div>
                  </div>
                </el-col>
              </el-row>

              <el-divider content-position="left">活动规则</el-divider>
              <el-card class="rules-section" shadow="never">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="最低消费金额">
                    <span class="highlight">¥{{ activity.rules?.minOrderAmount || 0 }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="最大优惠金额">
                    <span class="highlight">¥{{ activity.rules?.maxDiscount || 0 }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="折扣比例">
                    <span class="highlight">{{ ((activity.rules?.discount || 0) * 100).toFixed(0) }}折</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="适用分类">
                    {{ (activity.rules?.applicableCategories || []).join(', ') }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="status-card" shadow="never">
                <template #header>
                  <span class="card-title">活动状态</span>
                </template>
                <div class="status-display">
                  <div :class="['status-badge', activity.status]">
                    <el-icon class="status-icon" v-if="activity.status === 'active'">
                      <CircleCheck />
                    </el-icon>
                    <el-icon class="status-icon" v-else-if="activity.status === 'ended'">
                      <CircleClose />
                    </el-icon>
                    <el-icon class="status-icon" v-else-if="activity.status === 'scheduled'">
                      <Clock />
                    </el-icon>
                    <el-icon class="status-icon" v-else>
                      <Document />
                    </el-icon>
                    <span class="status-text">{{ getStatusLabel(activity.status) }}</span>
                  </div>
                </div>
              </el-card>

              <el-card class="info-card" shadow="never">
                <template #header>
                  <span class="card-title">基本信息</span>
                </template>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="活动ID">
                    <el-tag size="small">{{ activity.id }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间">
                    {{ formatDate(activity.createdAt) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="更新时间">
                    {{ formatDate(activity.updatedAt) }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>

              <el-card class="quick-actions-card" shadow="never">
                <template #header>
                  <span class="card-title">快捷操作</span>
                </template>
                <div class="quick-actions">
                  <el-button type="primary" @click="editActivity" block>
                    <el-icon><Edit /></el-icon> 编辑活动
                  </el-button>
                  <el-button type="danger" @click="deleteActivity" block>
                    <el-icon><Delete /></el-icon> 删除活动
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  ArrowLeft, Edit, Delete, CircleCheck, CircleClose, Clock, Document 
} from '@element-plus/icons-vue';
import axios from 'axios';
import { format } from 'date-fns';

const router = useRouter();
const route = useRoute();
const API_BASE = 'http://localhost:3002/api';

const loading = ref(false);
const activity = ref({});
const defaultBanner = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20promotion%20activity%20banner%20colorful&image_size=landscape_16_9';

const getTypeLabel = (type) => {
  const labels = {
    promotion: '促销活动',
    new_user: '新用户专享',
    member: '会员专享',
    flash_sale: '限时秒杀'
  };
  return labels[type] || type;
};

const getTypeTagType = (type) => {
  const types = {
    promotion: 'danger',
    new_user: 'success',
    member: 'warning',
    flash_sale: 'primary'
  };
  return types[type] || 'info';
};

const getStatusLabel = (status) => {
  const labels = {
    active: '活跃中',
    ended: '已结束',
    scheduled: '待开始',
    draft: '草稿'
  };
  return labels[status] || status;
};

const getStatusTagType = (status) => {
  const types = {
    active: 'success',
    ended: 'info',
    scheduled: 'warning',
    draft: 'danger'
  };
  return types[status] || 'info';
};

const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

const goBack = () => {
  router.push('/');
};

const editActivity = () => {
  router.push(`/edit/${route.params.id}`);
};

const loadActivity = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE}/activities/${route.params.id}`);
    if (response.data.success) {
      activity.value = response.data.data;
    }
  } catch (error) {
    ElMessage.error('加载活动详情失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const deleteActivity = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动「${activity.value.name}」吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const response = await axios.delete(`${API_BASE}/activities/${route.params.id}`);
    if (response.data.success) {
      ElMessage.success('删除成功');
      router.push('/');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error(error);
    }
  }
};

onMounted(() => {
  loadActivity();
});
</script>

<style scoped>
.activity-detail-page {
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.detail-card {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.activity-banner-section {
  margin-bottom: 24px;
}

.activity-banner {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.activity-info-section {
  margin-bottom: 24px;
}

.activity-name {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.priority-badge {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

.activity-description {
  font-size: 16px;
  color: #6c757d;
  line-height: 1.8;
  margin: 0;
}

.time-section {
  margin-bottom: 24px;
}

.time-card {
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}

.time-card.start {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.time-card.end {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.time-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.time-value {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.rules-section {
  background: #f5f7fa;
}

.highlight {
  font-weight: 600;
  color: #667eea;
  font-size: 16px;
}

.status-card, .info-card, .quick-actions-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
}

.status-display {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.status-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 48px;
  border-radius: 16px;
}

.status-badge.active {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.status-badge.ended {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.status-badge.scheduled {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.status-badge.draft {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.status-icon {
  font-size: 48px;
  color: white;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
