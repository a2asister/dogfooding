<template>
  <div class="content-container">
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">个人设置</h3>
      </div>
      <div class="card-body">
        <el-form label-position="top" style="max-width: 500px;">
          <el-form-item label="用户名">
            <el-input :value="userStore.user?.username" disabled />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="同步目录">
            <el-input v-model="syncDirectory" placeholder="请输入同步目录路径">
              <template #append>
                <el-button type="primary">选择</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="content-card" style="margin-top: 24px;">
      <div class="card-header">
        <h3 class="card-title">加密设置</h3>
      </div>
      <div class="card-body">
        <el-form label-position="top" style="max-width: 500px;">
          <el-form-item label="端到端加密">
            <el-switch v-model="endToEndEncryption" />
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
              启用后，所有文件将在本地加密后再上传到云端，只有您可以解密这些文件
            </p>
          </el-form-item>
          <el-form-item label="敏感文件自动检测">
            <el-switch v-model="sensitiveDetection" />
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
              自动检测文件中的敏感信息（如密码、银行卡号、身份证号等）并标记为敏感文件
            </p>
          </el-form-item>
          <el-form-item label="敏感文件脱敏">
            <el-switch v-model="sensitiveMasking" :disabled="!sensitiveDetection" />
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
              在分享敏感文件时自动脱敏敏感信息
            </p>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="content-card" style="margin-top: 24px;">
      <div class="card-header">
        <h3 class="card-title">同步设置</h3>
      </div>
      <div class="card-body">
        <el-form label-position="top" style="max-width: 500px;">
          <el-form-item label="自动同步">
            <el-switch v-model="autoSync" />
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
              自动检测文件变化并同步
            </p>
          </el-form-item>
          <el-form-item label="同步模式">
            <el-radio-group v-model="syncMode">
              <el-radio value="two-way">双向同步</el-radio>
              <el-radio value="upload-only">仅上传</el-radio>
              <el-radio value="download-only">仅下载</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="同步优先级">
            <el-radio-group v-model="syncPriority">
              <el-radio value="lan">局域网优先</el-radio>
              <el-radio value="cloud">云端优先</el-radio>
              <el-radio value="both">同时进行</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="文件去重">
            <el-switch v-model="fileDeduplication" />
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
              自动检测并跳过相同内容的文件，节省存储空间
            </p>
          </el-form-item>
          <el-form-item label="增量同步">
            <el-switch v-model="incrementalSync" />
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
              仅同步文件变化的部分，提高同步速度
            </p>
          </el-form-item>
          <el-form-item label="云端双备份">
            <el-switch v-model="cloudBackup" />
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
              在云端保留两份备份，提高数据安全性
            </p>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="content-card" style="margin-top: 24px;">
      <div class="card-header">
        <h3 class="card-title">离线访问</h3>
      </div>
      <div class="card-body">
        <el-form label-position="top" style="max-width: 500px;">
          <el-form-item label="启用离线缓存">
            <el-switch v-model="offlineCache" />
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
              将常用文件缓存到本地，无网络时也可访问
            </p>
          </el-form-item>
          <el-form-item label="缓存大小限制">
            <el-select v-model="cacheSizeLimit" style="width: 200px;">
              <el-option label="1 GB" :value="1" />
              <el-option label="5 GB" :value="5" />
              <el-option label="10 GB" :value="10" />
              <el-option label="无限制" :value="0" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const email = ref('')
const syncDirectory = ref('')
const endToEndEncryption = ref(true)
const sensitiveDetection = ref(true)
const sensitiveMasking = ref(true)
const autoSync = ref(true)
const syncMode = ref('two-way')
const syncPriority = ref('lan')
const fileDeduplication = ref(true)
const incrementalSync = ref(true)
const cloudBackup = ref(true)
const offlineCache = ref(true)
const cacheSizeLimit = ref(5)

const saveSettings = async () => {
  try {
    await userStore.updateProfile({
      email: email.value,
      syncDirectory: syncDirectory.value,
    })
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败')
  }
}

onMounted(() => {
  if (userStore.user) {
    email.value = userStore.user.email
    syncDirectory.value = userStore.user.syncDirectory
  }
})
</script>
