<template>
  <div class="image-uploader">
    <el-upload
      :action="uploadUrl"
      name="image"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      :headers="uploadHeaders"
      accept="image/*"
    >
      <div v-if="modelValue" class="image-preview">
        <img :src="modelValue" alt="预览图" />
        <div class="image-mask">
          <el-icon><Edit /></el-icon>
          <span>更换图片</span>
        </div>
      </div>
      <div v-else class="upload-placeholder">
        <el-icon class="upload-icon"><Plus /></el-icon>
        <span>点击上传</span>
      </div>
    </el-upload>
    <div v-if="modelValue" class="image-actions">
      <el-button size="small" type="danger" link @click="handleRemove">删除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Plus } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploadUrl = computed(() => '/api/upload/image')

const uploadHeaders = computed(() => ({
  // 如果需要认证可以在这里添加
}))

const beforeUpload = (file: File): boolean => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleSuccess = (response: { code: number; data?: { url: string }; message?: string }): void => {
  if (response.code === 0 && response.data) {
    emit('update:modelValue', response.data.url)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleRemove = (): void => {
  emit('update:modelValue', '')
}
</script>

<style scoped lang="scss">
.image-uploader {
  display: inline-block;

  :deep(.el-upload) {
    display: block;
  }
}

.image-preview {
  position: relative;
  width: 200px;
  height: 150px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s;
    color: #fff;
    cursor: pointer;

    .el-icon {
      font-size: 24px;
    }
  }

  &:hover .image-mask {
    opacity: 1;
  }
}

.upload-placeholder {
  width: 200px;
  height: 150px;
  border: 2px dashed var(--border-color);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-secondary);

  &:hover {
    border-color: var(--secondary-color);
    color: var(--secondary-color);
  }

  .upload-icon {
    font-size: 32px;
  }
}

.image-actions {
  margin-top: 8px;
  text-align: center;
}
</style>
