<template>
  <div class="upload-container">
    <el-upload
      class="upload-dragger"
      drag
      multiple
      name="images"
      :action="uploadUrl"
      :headers="headers"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :file-list="fileList"
      :limit="50"
      accept="image/*"
      list-type="picture"
    >
      <el-icon class="el-icon--upload" :size="48"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        将图片拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 JPG、PNG、GIF、WEBP 等格式，单张最大 50MB，最多可同时上传 50 张
        </div>
      </template>
    </el-upload>
    
    <div class="upload-progress" v-if="fileList.length > 0">
      <el-progress 
        :percentage="uploadPercentage" 
        :status="uploadStatus"
        :stroke-width="8"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  uploadedImages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['uploadSuccess'])

const uploadUrl = '/api/images/upload'
const headers = {}
const fileList = ref([])
const uploadPercentage = ref(0)
const uploadStatus = ref('')

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt50M = file.size / 1024 / 1024 < 50
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  
  if (!isLt50M) {
    ElMessage.error('图片大小不能超过 50MB！')
    return false
  }
  
  uploadPercentage.value = 0
  uploadStatus.value = ''
  return true
}

const handleSuccess = (response, file, fileListParam) => {
  fileList.value = fileListParam
  uploadPercentage.value = 100
  uploadStatus.value = 'success'
  
  if (response && response.success && response.files) {
    emit('uploadSuccess', response.files)
    setTimeout(() => {
      fileList.value = []
    }, 1000)
  }
}

const handleError = (error, file, fileListParam) => {
  fileList.value = fileListParam
  uploadStatus.value = 'exception'
  ElMessage.error('上传失败，请重试')
}
</script>

<style scoped>
.upload-container {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
}

:deep(.el-upload-dragger .el-icon--upload) {
  margin-bottom: 16px;
}

:deep(.el-upload__text) {
  font-size: 16px;
  margin-bottom: 8px;
}

:deep(.el-upload__text em) {
  color: #667eea;
  font-style: normal;
}

:deep(.el-upload__tip) {
  font-size: 13px;
  color: #909399;
}

.upload-progress {
  margin-top: 20px;
}
</style>
