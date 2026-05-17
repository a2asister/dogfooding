<template>
  <div class="admin-settings">
    <div class="page-header">
      <h2>系统配置</h2>
    </div>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>
    
    <template v-else>
      <el-form :model="form" label-width="150px">
        <el-form-item label="站点名称">
          <el-input v-model="form.siteName" />
        </el-form-item>
        <el-form-item label="站点描述">
          <el-input v-model="form.siteDescription" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="是否允许注册">
          <el-switch v-model="form.allowRegister" />
        </el-form-item>
        <el-form-item label="是否需要审核笔记">
          <el-switch v-model="form.requireNoteApproval" />
        </el-form-item>
        <el-form-item label="单用户每日发布上限">
          <el-input-number v-model="form.dailyNoteLimit" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="图片大小限制(MB)">
          <el-input-number v-model="form.imageSizeLimit" :min="1" :max="50" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
        </el-form-item>
      </el-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getSystemConfigs, updateSystemConfig } from '@/api/admin';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const saving = ref(false);
const configs = ref<Record<string, string>>({});

const form = reactive({
  siteName: '图文社区',
  siteDescription: '分享你的精彩瞬间',
  allowRegister: true,
  requireNoteApproval: true,
  dailyNoteLimit: 10,
  imageSizeLimit: 10,
});

const fetchConfigs = async () => {
  loading.value = true;
  try {
    const res = await getSystemConfigs();
    configs.value = res.configs;
    
    if (res.configs.siteName) form.siteName = res.configs.siteName;
    if (res.configs.siteDescription) form.siteDescription = res.configs.siteDescription;
    if (res.configs.allowRegister) form.allowRegister = res.configs.allowRegister === 'true';
    if (res.configs.requireNoteApproval) form.requireNoteApproval = res.configs.requireNoteApproval === 'true';
    if (res.configs.dailyNoteLimit) form.dailyNoteLimit = parseInt(res.configs.dailyNoteLimit);
    if (res.configs.imageSizeLimit) form.imageSizeLimit = parseInt(res.configs.imageSizeLimit);
  } catch (error) {
    console.error('获取配置失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    const updates = [
      { key: 'siteName', value: form.siteName, description: '站点名称' },
      { key: 'siteDescription', value: form.siteDescription, description: '站点描述' },
      { key: 'allowRegister', value: String(form.allowRegister), description: '是否允许注册' },
      { key: 'requireNoteApproval', value: String(form.requireNoteApproval), description: '是否需要审核笔记' },
      { key: 'dailyNoteLimit', value: String(form.dailyNoteLimit), description: '单用户每日发布上限' },
      { key: 'imageSizeLimit', value: String(form.imageSizeLimit), description: '图片大小限制(MB)' },
    ];
    
    for (const update of updates) {
      await updateSystemConfig(update);
    }
    
    ElMessage.success('配置保存成功');
  } catch (error) {
    console.error('保存配置失败:', error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchConfigs();
});
</script>

<style lang="scss" scoped>
.admin-settings {
  .page-header {
    margin-bottom: 20px;
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .loading {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
  }
}

:deep(.el-form) {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}
</style>
