<template>
  <div class="activity-form-page">
    <el-card class="form-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-button type="primary" link @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回列表
          </el-button>
          <span>{{ isEdit ? '编辑活动' : '新建活动' }}</span>
          <div></div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="activity-form"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="活动名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入活动名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="活动类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择活动类型" style="width: 100%">
                <el-option label="促销活动" value="promotion" />
                <el-option label="新用户专享" value="new_user" />
                <el-option label="会员专享" value="member" />
                <el-option label="限时秒杀" value="flash_sale" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ssZ"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ssZ"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动横幅">
          <el-upload
            class="banner-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleBannerChange"
          >
            <img v-if="formData.banner" :src="formData.banner" class="banner-preview" />
            <div v-else class="banner-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">点击上传横幅图片</div>
              <div class="upload-hint">建议尺寸: 1200 x 400 像素</div>
            </div>
          </el-upload>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-slider
                v-model="formData.priority"
                :min="1"
                :max="100"
                :marks="priorityMarks"
                show-input
              />
              <div class="priority-hint">数字越小优先级越高</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="待开始" value="scheduled" />
                <el-option label="活跃中" value="active" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">活动规则配置</el-divider>

        <el-card class="rules-card" shadow="never">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="最低消费">
                <el-input-number
                  v-model="formData.rules.minOrderAmount"
                  :min="0"
                  :precision="2"
                  placeholder="0"
                  style="width: 100%"
                />
                <span class="unit">元</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大优惠">
                <el-input-number
                  v-model="formData.rules.maxDiscount"
                  :min="0"
                  :precision="2"
                  placeholder="0"
                  style="width: 100%"
                />
                <span class="unit">元</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="折扣比例">
                <el-slider
                  v-model="formData.rules.discount"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  show-input
                  :format-tooltip="(val) => `${(val * 100).toFixed(0)}折`"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submitForm" size="large">
            <el-icon><Check /></el-icon> 保存活动
          </el-button>
          <el-button size="large" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Plus, Check } from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const API_BASE = 'http://localhost:3002/api';

const formRef = ref(null);
const submitting = ref(false);
const isEdit = computed(() => !!route.params.id);

const priorityMarks = {
  1: '最高',
  25: '高',
  50: '中',
  75: '低',
  100: '最低'
};

const formData = reactive({
  name: '',
  type: '',
  description: '',
  startTime: '',
  endTime: '',
  banner: '',
  priority: 50,
  status: 'draft',
  rules: {
    minOrderAmount: 0,
    maxDiscount: 0,
    discount: 0,
    applicableCategories: ['all']
  }
});

const rules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
};

const goBack = () => {
  router.push('/');
};

const handleBannerChange = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    formData.banner = e.target.result;
  };
  reader.readAsDataURL(file.raw);
};

const loadActivity = async () => {
  if (!isEdit.value) return;
  
  try {
    const response = await axios.get(`${API_BASE}/activities/${route.params.id}`);
    if (response.data.success) {
      const activity = response.data.data;
      formData.name = activity.name;
      formData.type = activity.type;
      formData.description = activity.description || '';
      formData.startTime = activity.startTime;
      formData.endTime = activity.endTime;
      formData.banner = activity.banner || '';
      formData.priority = activity.priority || 50;
      formData.status = activity.status || 'draft';
      formData.rules = {
        minOrderAmount: activity.rules?.minOrderAmount || 0,
        maxDiscount: activity.rules?.maxDiscount || 0,
        discount: activity.rules?.discount || 0,
        applicableCategories: activity.rules?.applicableCategories || ['all']
      };
    }
  } catch (error) {
    ElMessage.error('加载活动信息失败');
    console.error(error);
  }
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    submitting.value = true;
    try {
      const data = {
        ...formData,
        rules: formData.rules
      };
      
      let response;
      if (isEdit.value) {
        response = await axios.put(`${API_BASE}/activities/${route.params.id}`, data);
      } else {
        response = await axios.post(`${API_BASE}/activities`, data);
      }
      
      if (response.data.success) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
        router.push('/');
      }
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败');
      console.error(error);
    } finally {
      submitting.value = false;
    }
  });
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.rules = {
    minOrderAmount: 0,
    maxDiscount: 0,
    discount: 0,
    applicableCategories: ['all']
  };
};

onMounted(() => {
  loadActivity();
});
</script>

<style scoped>
.activity-form-page {
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.form-card {
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

.activity-form {
  max-width: 900px;
}

.banner-uploader {
  width: 100%;
  height: 200px;
}

.banner-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.banner-placeholder:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.priority-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.rules-card {
  background: #f5f7fa;
  margin-bottom: 20px;
}

.unit {
  margin-left: 8px;
  color: #909399;
}
</style>
