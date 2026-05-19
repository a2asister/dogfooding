<template>
  <Layout>
    <div class="promotion-page">
      <div class="page-header">
        <div>
          <h1>推广中心</h1>
          <p>为您的作品购买流量推广，提升曝光和互动</p>
        </div>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建推广
        </el-button>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon views">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalPromotions }}</div>
            <div class="stat-label">推广次数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ activePromotions }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon budget">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ totalSpent }}</div>
            <div class="stat-label">累计消耗</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon views-total">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalViews }}</div>
            <div class="stat-label">累计曝光</div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2>我的推广</h2>
          <el-radio-group v-model="filterStatus" @change="fetchPromotions">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="active">进行中</el-radio-button>
            <el-radio-button value="completed">已完成</el-radio-button>
            <el-radio-button value="paused">已暂停</el-radio-button>
          </el-radio-group>
        </div>

        <div v-loading="loading" class="promotion-list">
          <div v-if="promotions.length === 0 && !loading" class="empty">
            <el-empty description="暂无推广记录" />
          </div>

          <el-table :data="promotions" border stripe>
            <el-table-column prop="note.title" label="推广作品" min-width="200">
              <template #default="{ row }">
                <div class="note-cell" @click="$router.push(`/note/${row.noteId}`)">
                  <el-image
                    v-if="row.note?.images?.length"
                    :src="row.note.images[0]"
                    fit="cover"
                    style="width: 48px; height: 48px; border-radius: 6px; margin-right: 12px"
                  />
                  <span>{{ row.note?.title || '未命名作品' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="推广类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getPlanTypeColor(row.planType)" size="small">
                  {{ getPlanTypeText(row.planType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="预算" width="100">
              <template #default="{ row }">¥{{ row.budget }}</template>
            </el-table-column>
            <el-table-column label="已消耗" width="100">
              <template #default="{ row }">¥{{ row.spentAmount }}</template>
            </el-table-column>
            <el-table-column label="目标曝光" width="100">
              <template #default="{ row }">{{ row.targetViews }}</template>
            </el-table-column>
            <el-table-column label="当前曝光" width="100">
              <template #default="{ row }">{{ row.currentViews }}</template>
            </el-table-column>
            <el-table-column label="进度" width="150">
              <template #default="{ row }">
                <el-progress
                  :percentage="Math.min(Math.round((row.currentViews / row.targetViews) * 100), 100)"
                  :stroke-width="8"
                />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'active'"
                  type="warning"
                  link
                  size="small"
                  @click="handlePause(row)"
                >
                  暂停
                </el-button>
                <el-button
                  v-if="row.status === 'paused'"
                  type="success"
                  link
                  size="small"
                  @click="handleResume(row)"
                >
                  恢复
                </el-button>
                <el-button
                  v-if="row.status === 'active' || row.status === 'paused'"
                  type="danger"
                  link
                  size="small"
                  @click="handleCancel(row)"
                >
                  终止
                </el-button>
                <el-button type="primary" link size="small" @click="handleViewDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="fetchPromotions"
              @current-change="fetchPromotions"
            />
          </div>
        </div>
      </div>

      <el-dialog v-model="showCreateDialog" title="创建推广" width="600px" @close="resetForm">
        <el-form ref="formRef" :model="promotionForm" :rules="formRules" label-width="100px">
          <el-form-item label="选择作品" prop="noteId">
            <el-select v-model="promotionForm.noteId" placeholder="请选择要推广的作品" style="width: 100%" @change="onNoteChange">
              <el-option
                v-for="note in myNotes"
                :key="note.id"
                :label="note.title"
                :value="note.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="推广类型" prop="planType">
            <el-radio-group v-model="promotionForm.planType">
              <el-radio value="views_boost">
                <div class="plan-option">
                  <div class="plan-name">浏览量提升</div>
                  <div class="plan-desc">快速增加作品浏览量</div>
                </div>
              </el-radio>
              <el-radio value="likes_boost">
                <div class="plan-option">
                  <div class="plan-name">点赞量提升</div>
                  <div class="plan-desc">提升作品点赞和互动</div>
                </div>
              </el-radio>
              <el-radio value="followers_boost">
                <div class="plan-option">
                  <div class="plan-name">粉丝增长</div>
                  <div class="plan-desc">吸引更多粉丝关注</div>
                </div>
              </el-radio>
              <el-radio value="hot_promotion">
                <div class="plan-option">
                  <div class="plan-name">热门推广</div>
                  <div class="plan-desc">全站推荐，冲击热门</div>
                </div>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="推广预算" prop="budget">
            <el-input-number
              v-model="promotionForm.budget"
              :min="10"
              :max="10000"
              :step="10"
              style="width: 100%"
            />
            <div class="budget-tip">
              预计获得 {{ promotionForm.budget * 100 }} 次曝光
            </div>
          </el-form-item>
          <el-form-item label="推广时长" prop="durationHours">
            <el-radio-group v-model="promotionForm.durationHours">
              <el-radio :value="24">24小时</el-radio>
              <el-radio :value="48">48小时</el-radio>
              <el-radio :value="72">72小时</el-radio>
              <el-radio :value="168">7天</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">
            创建推广 (¥{{ promotionForm.budget }})
          </el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="showDetailDialog" title="推广详情" width="600px">
        <div v-if="selectedPromotion" class="promotion-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="推广作品">
              {{ selectedPromotion.note?.title || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="推广类型">
              {{ getPlanTypeText(selectedPromotion.planType) }}
            </el-descriptions-item>
            <el-descriptions-item label="推广预算">¥{{ selectedPromotion.budget }}</el-descriptions-item>
            <el-descriptions-item label="已消耗">¥{{ selectedPromotion.spentAmount }}</el-descriptions-item>
            <el-descriptions-item label="目标曝光">{{ selectedPromotion.targetViews }}</el-descriptions-item>
            <el-descriptions-item label="当前曝光">{{ selectedPromotion.currentViews }}</el-descriptions-item>
            <el-descriptions-item label="推广时长">{{ selectedPromotion.durationHours }}小时</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(selectedPromotion.status)">
                {{ getStatusText(selectedPromotion.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
              {{ selectedPromotion.startTime ? formatTime(selectedPromotion.startTime) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="结束时间">
              {{ selectedPromotion.endTime ? formatTime(selectedPromotion.endTime) : '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <h4 style="margin: 20px 0 10px">推广效果</h4>
          <div class="effect-stats">
            <div class="effect-item">
              <div class="effect-label">曝光完成度</div>
              <div class="effect-value">
                {{ Math.min(Math.round((selectedPromotion.currentViews / selectedPromotion.targetViews) * 100), 100) }}%
              </div>
              <el-progress
                :percentage="Math.min(Math.round((selectedPromotion.currentViews / selectedPromotion.targetViews) * 100), 100)"
                :stroke-width="6"
              />
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus,
  View,
  VideoPlay,
  Wallet,
  DataLine,
} from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import { getPromotionList, createPromotion, pausePromotion, resumePromotion, cancelPromotion } from '@/api/promotion';
import { getNoteList } from '@/api/note';
import type { Promotion, Note } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const promotions = ref<Promotion[]>([]);
const myNotes = ref<Note[]>([]);
const filterStatus = ref('');
const showCreateDialog = ref(false);
const showDetailDialog = ref(false);
const selectedPromotion = ref<Promotion | null>(null);

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

const promotionForm = ref({
  noteId: '',
  planType: 'views_boost' as 'views_boost' | 'likes_boost' | 'followers_boost' | 'hot_promotion',
  budget: 100,
  durationHours: 24,
});

const formRules = {
  noteId: [{ required: true, message: '请选择推广作品', trigger: 'change' }],
  planType: [{ required: true, message: '请选择推广类型', trigger: 'change' }],
  budget: [{ required: true, message: '请输入推广预算', trigger: 'blur' }],
  durationHours: [{ required: true, message: '请选择推广时长', trigger: 'change' }],
};

const totalPromotions = computed(() => pagination.value.total);
const activePromotions = computed(() => promotions.value.filter(p => p.status === 'active').length);
const totalSpent = computed(() => promotions.value.reduce((sum, p) => sum + p.spentAmount, 0));
const totalViews = computed(() => promotions.value.reduce((sum, p) => sum + p.currentViews, 0));

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const getPlanTypeText = (type: string) => {
  const map: Record<string, string> = {
    views_boost: '浏览量提升',
    likes_boost: '点赞量提升',
    followers_boost: '粉丝增长',
    hot_promotion: '热门推广',
  };
  return map[type] || type;
};

const getPlanTypeColor = (type: string) => {
  const map: Record<string, string> = {
    views_boost: 'primary',
    likes_boost: 'danger',
    followers_boost: 'success',
    hot_promotion: 'warning',
  };
  return map[type] || '';
};

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    active: 'success',
    paused: 'warning',
    completed: 'primary',
    cancelled: 'info',
    failed: 'danger',
  };
  return map[status] || '';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待开始',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    cancelled: '已终止',
    failed: '失败',
  };
  return map[status] || status;
};

const fetchPromotions = async () => {
  loading.value = true;
  try {
    const res = await getPromotionList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      status: filterStatus.value,
    });
    promotions.value = res?.list || [];
    pagination.value.total = res?.total || 0;
  } catch (error) {
    console.error('获取推广列表失败:', error);
    ElMessage.error('获取推广列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchMyNotes = async () => {
  try {
    const res = await getNoteList({ page: 1, pageSize: 100 });
    myNotes.value = res.list;
  } catch (error) {
    console.error('获取作品列表失败:', error);
  }
};

const onNoteChange = () => {
  // 可以在这里显示作品预览
};

const handleCreate = async () => {
  try {
    await createPromotion(promotionForm.value);
    ElMessage.success('推广创建成功');
    showCreateDialog.value = false;
    fetchPromotions();
  } catch (error) {
    console.error('创建推广失败:', error);
    ElMessage.error('创建推广失败');
  }
};

const handlePause = async (promotion: Promotion) => {
  try {
    await pausePromotion(promotion.id);
    ElMessage.success('推广已暂停');
    fetchPromotions();
  } catch (error) {
    console.error('暂停推广失败:', error);
    ElMessage.error('操作失败');
  }
};

const handleResume = async (promotion: Promotion) => {
  try {
    await resumePromotion(promotion.id);
    ElMessage.success('推广已恢复');
    fetchPromotions();
  } catch (error) {
    console.error('恢复推广失败:', error);
    ElMessage.error('操作失败');
  }
};

const handleCancel = async (promotion: Promotion) => {
  try {
    await ElMessageBox.confirm('确定要终止这个推广吗？剩余预算将退还到您的账户。', '终止确认', {
      type: 'warning',
    });
    await cancelPromotion(promotion.id);
    ElMessage.success('推广已终止');
    fetchPromotions();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('终止推广失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

const handleViewDetail = (promotion: Promotion) => {
  selectedPromotion.value = promotion;
  showDetailDialog.value = true;
};

const resetForm = () => {
  promotionForm.value = {
    noteId: '',
    planType: 'views_boost',
    budget: 100,
    durationHours: 24,
  };
};

onMounted(() => {
  fetchPromotions();
  fetchMyNotes();
});
</script>

<style lang="scss" scoped>
.promotion-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;

      &.views {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      &.active {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
      &.budget {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }
      &.views-total {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }

    .stat-info {
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        line-height: 1.2;
      }
      .stat-label {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }
}

.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }
}

.note-cell {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #333;

  &:hover {
    color: #409eff;
  }
}

.budget-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.plan-option {
  .plan-name {
    font-weight: 500;
    color: #333;
  }
  .plan-desc {
    font-size: 12px;
    color: #999;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty {
  padding: 60px 0;
}

.effect-stats {
  .effect-item {
    margin-bottom: 16px;

    .effect-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .effect-value {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }
  }
}
</style>
