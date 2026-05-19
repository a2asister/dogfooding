<template>
  <Layout>
    <div class="verification-page">
      <div class="page-header">
        <h1>达人认证</h1>
        <p>申请认证，获得更多创作者权益</p>
      </div>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <template v-else-if="currentVerification">
        <div class="status-card">
          <el-result
            :icon="currentVerification.status === 'approved' ? 'success' : currentVerification.status === 'rejected' ? 'error' : 'info'"
            :title="getStatusTitle(currentVerification.status)"
            :sub-title="currentVerification.reviewNote || '请耐心等待审核'"
          >
            <template v-if="currentVerification.status === 'approved'" #extra>
              <div class="badge-info">
                <el-tag size="large" type="success">
                  {{ currentVerification.badgeText || '认证创作者' }}
                </el-tag>
                <p class="valid-info">
                  认证等级：Lv.{{ currentVerification.level }}
                  <span v-if="currentVerification.expiresAt">
                    | 有效期至：{{ formatDate(currentVerification.expiresAt) }}
                  </span>
                </p>
              </div>
            </template>
            <template v-else-if="currentVerification.status === 'rejected'" #extra>
              <el-button type="primary" @click="showApplyForm = true">重新申请</el-button>
            </template>
          </el-result>

          <div class="application-details">
            <h3>申请信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="认证类型">
                {{ getTypeName(currentVerification.type) }}
              </el-descriptions-item>
              <el-descriptions-item label="真实姓名">
                {{ currentVerification.realName }}
              </el-descriptions-item>
              <el-descriptions-item v-if="currentVerification.organizationName" label="机构名称">
                {{ currentVerification.organizationName }}
              </el-descriptions-item>
              <el-descriptions-item label="申请时间">
                {{ formatDate(currentVerification.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item v-if="currentVerification.verifiedAt" label="审核时间">
                {{ formatDate(currentVerification.verifiedAt) }}
              </el-descriptions-item>
              <el-descriptions-item v-if="currentVerification.description" label="认证说明" :span="2">
                {{ currentVerification.description }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="apply-card">
          <div class="benefits-section">
            <h2>认证权益</h2>
            <div class="benefits-grid">
              <div class="benefit-item">
                <el-icon size="32" color="#409eff"><Medal /></el-icon>
                <h3>专属标识</h3>
                <p>获得认证创作者标识，彰显身份</p>
              </div>
              <div class="benefit-item">
                <el-icon size="32" color="#67c23a"><TrendCharts /></el-icon>
                <h3>流量扶持</h3>
                <p>优质内容获得更多流量推荐</p>
              </div>
              <div class="benefit-item">
                <el-icon size="32" color="#e6a23c"><Wallet /></el-icon>
                <h3>变现能力</h3>
                <p>开启商品挂载、内容种草等功能</p>
              </div>
              <div class="benefit-item">
                <el-icon size="32" color="#f56c6c"><Service /></el-icon>
                <h3>优先服务</h3>
                <p>专属客服通道，问题优先处理</p>
              </div>
            </div>
          </div>

          <el-form :model="applyForm" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="认证类型" prop="type">
              <el-radio-group v-model="applyForm.type">
                <el-radio value="personal">个人认证</el-radio>
                <el-radio value="organization">机构认证</el-radio>
                <el-radio value="expert">专家认证</el-radio>
                <el-radio value="celebrity">名人认证</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="applyForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>

            <el-form-item label="身份证号" prop="idCard" v-if="applyForm.type === 'personal' || applyForm.type === 'expert'">
              <el-input v-model="applyForm.idCard" placeholder="请输入身份证号" maxlength="18" />
            </el-form-item>

            <el-form-item label="机构名称" prop="organizationName" v-if="applyForm.type === 'organization'">
              <el-input v-model="applyForm.organizationName" placeholder="请输入机构全称" />
            </el-form-item>

            <el-form-item label="机构执照" prop="organizationLicense" v-if="applyForm.type === 'organization'">
              <el-input v-model="applyForm.organizationLicense" placeholder="请上传营业执照照片（URL）" />
            </el-form-item>

            <el-form-item label="认证说明" prop="description">
              <el-input
                v-model="applyForm.description"
                type="textarea"
                :rows="4"
                placeholder="请描述您的专业领域、成就或影响力，50-500字"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="证明材料">
              <el-input
                v-model="materialsText"
                type="textarea"
                :rows="3"
                placeholder="请上传相关证明材料（如：获奖证书、媒体报道、作品链接等，每行一个URL）"
              />
              <p class="tip">每行输入一个材料链接，支持图片、网页等</p>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                提交认证申请
              </el-button>
              <el-button @click="$router.back()">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>

      <el-dialog v-model="showApplyForm" title="重新申请认证" width="600px">
        <el-form :model="applyForm" :rules="rules" ref="formRef" label-width="120px">
          <el-form-item label="认证类型" prop="type">
            <el-radio-group v-model="applyForm.type">
              <el-radio value="personal">个人认证</el-radio>
              <el-radio value="organization">机构认证</el-radio>
              <el-radio value="expert">专家认证</el-radio>
              <el-radio value="celebrity">名人认证</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="applyForm.realName" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item label="认证说明" prop="description">
            <el-input
              v-model="applyForm.description"
              type="textarea"
              :rows="4"
              placeholder="请描述您的专业领域、成就或影响力"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showApplyForm = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { getMyVerification, applyForVerification } from '@/api/creator';
import Layout from '@/components/Layout.vue';
import type { CreatorVerification } from '@/types';
import { Medal, TrendCharts, Wallet, Service } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const showApplyForm = ref(false);
const currentVerification = ref<CreatorVerification | null>(null);
const formRef = ref<FormInstance>();
const materialsText = ref('');

const applyForm = reactive({
  type: 'personal',
  realName: '',
  idCard: '',
  organizationName: '',
  organizationLicense: '',
  description: '',
});

const rules: FormRules = {
  type: [{ required: true, message: '请选择认证类型', trigger: 'change' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确', trigger: 'blur' },
  ],
  organizationName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  description: [
    { required: true, message: '请输入认证说明', trigger: 'blur' },
    { min: 50, message: '认证说明至少50字', trigger: 'blur' },
  ],
};

const getStatusTitle = (status: string) => {
  const map: Record<string, string> = {
    pending: '认证审核中',
    approved: '认证已通过',
    rejected: '认证已驳回',
    expired: '认证已过期',
    cancelled: '认证已取消',
  };
  return map[status] || status;
};

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    personal: '个人认证',
    organization: '机构认证',
    expert: '专家认证',
    celebrity: '名人认证',
  };
  return map[type] || type;
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchVerification = async () => {
  loading.value = true;
  try {
    const res = await getMyVerification();
    currentVerification.value = res.verification;
  } catch (error) {
    console.error('获取认证状态失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    const materials = materialsText.value
      .split('\n')
      .filter((url) => url.trim())
      .map((url, index) => ({
        type: 'image',
        url: url.trim(),
        description: `材料${index + 1}`,
      }));

    submitting.value = true;
    try {
      await applyForVerification({
        type: applyForm.type,
        realName: applyForm.realName,
        idCard: applyForm.idCard || undefined,
        organizationName: applyForm.organizationName || undefined,
        organizationLicense: applyForm.organizationLicense || undefined,
        description: applyForm.description,
        materials: materials.length > 0 ? materials : undefined,
      });
      ElMessage.success('认证申请已提交，请等待审核');
      showApplyForm.value = false;
      await fetchVerification();
    } catch (error) {
      console.error('提交申请失败:', error);
    } finally {
      submitting.value = false;
    }
  });
};

onMounted(() => {
  fetchVerification();
});
</script>

<style lang="scss" scoped>
.verification-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
  }
}

.apply-card,
.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.benefits-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .benefit-item {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 12px 0 8px;
      }

      p {
        font-size: 12px;
        color: #999;
        line-height: 1.5;
      }
    }
  }
}

.tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.application-details {
  margin-top: 30px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }
}

.badge-info {
  text-align: center;

  .valid-info {
    margin-top: 12px;
    color: #666;
    font-size: 14px;
  }
}

.loading {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}
</style>
