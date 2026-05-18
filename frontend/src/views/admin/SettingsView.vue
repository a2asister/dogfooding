<template>
  <div class="settings-manage">
    <div class="settings-card card">
      <div class="card-header">
        <h3>系统基础设置</h3>
      </div>
      <el-form :model="settings" label-width="150px">
        <el-form-item label="网站名称">
          <el-input v-model="settings.site_name" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="网站Logo">
          <el-input v-model="settings.site_logo" placeholder="请输入Logo URL" />
        </el-form-item>
        <el-form-item label="备案信息">
          <el-input v-model="settings.icp" placeholder="请输入备案号" />
        </el-form-item>
        <el-form-item label="版权信息">
          <el-input v-model="settings.copyright" placeholder="请输入版权信息" />
        </el-form-item>
      </el-form>
      <div class="card-footer">
        <el-button type="primary" @click="saveSettings" :loading="submitting">保存设置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { settingApi } from '../../api'

const submitting = ref(false)
const settings = reactive({
  site_name: '',
  site_logo: '',
  icp: '',
  copyright: ''
})

const loadSettings = async (): Promise<void> => {
  try {
    const result = await settingApi.getFullList()
    result.forEach((item) => {
      if (item.key in settings) {
        ;(settings as Record<string, string>)[item.key] = item.value
      }
    })
  } catch {
    settings.site_name = ''
    settings.site_logo = ''
    settings.icp = ''
    settings.copyright = ''
  }
}

const saveSettings = async (): Promise<void> => {
  submitting.value = true
  try {
    await settingApi.batchUpdate({
      site_name: settings.site_name,
      site_logo: settings.site_logo,
      icp: settings.icp,
      copyright: settings.copyright
    })
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
.settings-manage {
  max-width: 800px;
}

.settings-card {
  padding: 32px;

  .card-header {
    margin-bottom: 24px;

    h3 {
      font-size: 20px;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .card-footer {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
  }
}

:deep(.el-input__wrapper) {
  background: var(--bg-dark);
  box-shadow: 0 0 0 1px var(--border-color) inset;
  color: var(--text-primary);

  &:hover, &.is-focus {
    box-shadow: 0 0 0 1px var(--secondary-color) inset;
  }
}
</style>
