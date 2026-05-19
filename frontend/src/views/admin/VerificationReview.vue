<template>
  <div class="verification-review">
    <div class="page-header">
      <h2>达人认证审核</h2>
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="审核状态" style="width: 140px" @change="fetchVerifications">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="已过期" value="expired" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-select v-model="filterType" placeholder="认证类型" style="width: 140px" @change="fetchVerifications">
          <el-option label="全部" value="" />
          <el-option label="个人认证" value="personal" />
          <el-option label="机构认证" value="organization" />
          <el-option label="专家认证" value="expert" />
          <el-option label="名人认证" value="celebrity" />
        </el-select>
        <el-button type="primary" @click="fetchVerifications">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="verification-list">
      <el-table :data="verifications" border stripe>
        <el-table-column prop="type" label="认证类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="申请人" width="150">
          <template #default="{ row }">
            <span v-if="row.user">{{ row.user.nickname }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="organizationName" label="机构名称" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.organizationName">{{ row.organizationName }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="认证等级" width="100">
          <template #default="{ row }">
            <span v-if="row.level">Lv.{{ row.level }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewer" label="审核人" width="120">
          <template #default="{ row }">
            <span v-if="row.reviewer">{{ row.reviewer.nickname }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewVerification(row)">
              查看
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="quickApprove(row)"
              :disabled="row.status !== 'pending'"
            >
              通过
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="quickReject(row)"
              :disabled="row.status !== 'pending'"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="fetchVerifications"
          @current-change="fetchVerifications"
        />
      </div>
    </div>

    <el-dialog v-model="viewDialogVisible" title="认证详情" width="700px">
      <div v-if="currentVerification" class="verification-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="认证类型">
            <el-tag :type="getTypeTagType(currentVerification.type)">
              {{ getTypeName(currentVerification.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentVerification.status)">
              {{ getStatusName(currentVerification.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            <span v-if="currentVerification.user">{{ currentVerification.user.nickname }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatDate(currentVerification.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="真实姓名">
            {{ currentVerification.realName }}
          </el-descriptions-item>
          <el-descriptions-item label="身份证号">
            <span v-if="currentVerification.idCard">{{ maskIdCard(currentVerification.idCard) }}</span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentVerification.organizationName" label="机构名称" :span="2">
            {{ currentVerification.organizationName }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentVerification.organizationLicense" label="机构执照" :span="2">
            <a :href="currentVerification.organizationLicense" target="_blank">查看执照</a>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentVerification.description" label="认证说明" :span="2">
            {{ currentVerification.description }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentVerification.reviewer" label="审核人">
            {{ currentVerification.reviewer.nickname }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentVerification.reviewedAt" label="审核时间">
            {{ formatDate(currentVerification.reviewedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentVerification.reviewNote" label="审核备注" :span="2">
            {{ currentVerification.reviewNote }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentVerification.materials && currentVerification.materials.length > 0" class="materials-section">
          <h4>证明材料</h4>
          <div class="materials-list">
            <div v-for="(material, index) in currentVerification.materials" :key="index" class="material-item">
              <el-image
                v-if="isImageUrl(material.url)"
                :src="material.url"
                :preview-src-list="currentVerification.materials!.filter(m => isImageUrl(m.url)).map(m => m.url)"
                fit="cover"
                class="material-image"
              />
              <a v-else :href="material.url" target="_blank" class="material-link">
                <el-icon><Paperclip /></el-icon>
                {{ material.description || `材料 ${index + 1}` }}
              </a>
              <span v-if="material.description" class="material-desc">{{ material.description }}</span>
            </div>
          </div>
        </div>

        <div v-if="currentVerification.status === 'pending'" class="review-actions">
          <el-form :model="reviewForm" label-width="80px">
            <el-form-item label="认证等级">
              <el-input-number v-model="reviewForm.level" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="徽章文字">
              <el-input v-model="reviewForm.badgeText" placeholder="达人、专家等（选填）" />
            </el-form-item>
            <el-form-item label="有效期(天)">
              <el-input-number v-model="reviewForm.validDays" :min="1" :max="3650" />
              <span class="form-tip">不填则永久有效</span>
            </el-form-item>
            <el-form-item label="审核意见">
              <el-input
                v-model="reviewForm.reviewNote"
                type="textarea"
                :rows="3"
                placeholder="请输入审核意见（选填）"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="handleApprove">审核通过</el-button>
              <el-button type="danger" @click="handleReject">审核拒绝</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCreatorVerifications, reviewVerification } from '@/api/creator';
import type { CreatorVerification } from '@/types';
import { Refresh, Paperclip } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const verifications = ref<CreatorVerification[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterStatus = ref('');
const filterType = ref('');
const viewDialogVisible = ref(false);
const currentVerification = ref<CreatorVerification | null>(null);

const reviewForm = reactive({
  level: 1,
  badgeText: '',
  validDays: 365,
  reviewNote: '',
});

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    personal: '个人认证',
    organization: '机构认证',
    expert: '专家认证',
    celebrity: '名人认证',
  };
  return map[type] || type;
};

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    personal: 'primary',
    organization: 'success',
    expert: 'warning',
    celebrity: 'danger',
  };
  return map[type] || 'info';
};

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    expired: '已过期',
    cancelled: '已取消',
  };
  return map[status] || status;
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    expired: 'info',
    cancelled: 'info',
  };
  return map[status] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const maskIdCard = (idCard: string) => {
  if (idCard.length >= 15) {
    return idCard.substring(0, 6) + '********' + idCard.substring(idCard.length - 4);
  }
  return idCard;
};

const isImageUrl = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);
};

const fetchVerifications = async () => {
  loading.value = true;
  try {
    const res = await getCreatorVerifications({
      status: filterStatus.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    verifications.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取认证列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const viewVerification = (verification: CreatorVerification) => {
  currentVerification.value = verification;
  reviewForm.level = verification.level || 1;
  reviewForm.badgeText = verification.badgeText || '';
  reviewForm.validDays = 365;
  reviewForm.reviewNote = '';
  viewDialogVisible.value = true;
};

const quickApprove = async (verification: CreatorVerification) => {
  try {
    await ElMessageBox.confirm('确定要通过该认证申请吗？', '确认', { type: 'success' });
    await reviewVerification(verification.id, {
      passed: true,
      level: verification.level || 1,
    });
    ElMessage.success('审核通过');
    fetchVerifications();
  } catch (error) {
    console.error('审核失败:', error);
  }
};

const quickReject = async (verification: CreatorVerification) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝认证', {
      inputPlaceholder: '请输入拒绝原因',
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await reviewVerification(verification.id, {
      passed: false,
      reviewNote: reason,
    });
    ElMessage.success('已拒绝');
    fetchVerifications();
  } catch (error) {
    console.error('拒绝失败:', error);
  }
};

const handleApprove = async () => {
  if (!currentVerification.value) return;
  try {
    await reviewVerification(currentVerification.value.id, {
      passed: true,
      reviewNote: reviewForm.reviewNote,
      level: reviewForm.level,
      badgeText: reviewForm.badgeText || undefined,
      validDays: reviewForm.validDays,
    });
    ElMessage.success('审核通过');
    viewDialogVisible.value = false;
    fetchVerifications();
  } catch (error) {
    console.error('审核失败:', error);
  }
};

const handleReject = async () => {
  if (!currentVerification.value) return;
  try {
    await reviewVerification(currentVerification.value.id, {
      passed: false,
      reviewNote: reviewForm.reviewNote,
    });
    ElMessage.success('已拒绝');
    viewDialogVisible.value = false;
    fetchVerifications();
  } catch (error) {
    console.error('拒绝失败:', error);
  }
};

onMounted(() => {
  fetchVerifications();
});
</script>

<style lang="scss" scoped>
.verification-review {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .filter-bar {
      display: flex;
      gap: 12px;
    }
  }

  .verification-list {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .verification-detail {
    .materials-section {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 600;
      }

      .materials-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .material-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .material-image {
            width: 100px;
            height: 100px;
            border-radius: 4px;
            cursor: pointer;
          }

          .material-link {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            background: #f5f7fa;
            border-radius: 4px;
            color: #409eff;
            text-decoration: none;
          }

          .material-desc {
            margin-top: 4px;
            font-size: 12px;
            color: #666;
          }
        }
      }
    }

    .form-tip {
      margin-left: 8px;
      font-size: 12px;
      color: #999;
    }

    .review-actions {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
    }
  }
}
</style>
