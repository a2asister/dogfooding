<template>
  <div class="process-container">
    <el-alert 
      :title="disabled ? '请先上传并选择需要处理的图片' : `已选择 ${selectedImages.length} 张图片`"
      :type="disabled ? 'info' : 'success'"
      show-icon
      :closable="false"
      style="margin-bottom: 24px;"
    />
    
    <el-tabs v-model="processType" class="process-tabs">
      <el-tab-pane label="压缩图片" name="compress">
        <div class="process-form">
          <el-form label-width="120px">
            <el-form-item label="压缩质量">
              <el-slider 
                v-model="compressOptions.quality" 
                :min="10" 
                :max="100" 
                :step="10"
                show-input
                show-input-controls
              />
              <el-text type="info" size="small">
                质量越低，文件越小，画质越差
              </el-text>
            </el-form-item>
            
            <el-form-item label="输出格式">
              <el-select v-model="compressOptions.format" placeholder="保持原格式" clearable style="width: 200px">
                <el-option label="JPEG" value="jpeg" />
                <el-option label="PNG" value="png" />
                <el-option label="WEBP" value="webp" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="裁剪图片" name="crop">
        <div class="process-form">
          <el-form label-width="120px">
            <el-form-item label="裁剪尺寸">
              <div class="size-inputs">
                <el-input-number 
                  v-model="cropOptions.width" 
                  :min="1" 
                  :max="9999"
                  placeholder="宽度"
                  style="width: 150px;"
                />
                <span class="separator">×</span>
                <el-input-number 
                  v-model="cropOptions.height" 
                  :min="1" 
                  :max="9999"
                  placeholder="高度"
                  style="width: 150px;"
                />
                <span class="unit">像素</span>
              </div>
            </el-form-item>
            
            <el-form-item label="起始位置">
              <div class="position-inputs">
                <el-input-number 
                  v-model="cropOptions.left" 
                  :min="0" 
                  :max="9999"
                  placeholder="左边距"
                  style="width: 150px;"
                />
                <span class="separator">,</span>
                <el-input-number 
                  v-model="cropOptions.top" 
                  :min="0" 
                  :max="9999"
                  placeholder="上边距"
                  style="width: 150px;"
                />
                <span class="unit">像素</span>
              </div>
            </el-form-item>
            
            <el-form-item label="常用尺寸">
              <div class="preset-sizes">
                <el-tag 
                  v-for="preset in presetSizes" 
                  :key="preset.label"
                  class="preset-tag"
                  @click="applyPreset(preset)"
                  effect="plain"
                >
                  {{ preset.label }} ({{ preset.width }}×{{ preset.height }})
                </el-tag>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="格式转换" name="convert">
        <div class="process-form">
          <el-form label-width="120px">
            <el-form-item label="目标格式">
              <el-select v-model="convertOptions.format" placeholder="请选择目标格式" style="width: 200px">
                <el-option label="JPEG" value="jpeg" />
                <el-option label="PNG" value="png" />
                <el-option label="WEBP" value="webp" />
                <el-option label="GIF" value="gif" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="图片质量">
              <el-slider 
                v-model="convertOptions.quality" 
                :min="10" 
                :max="100" 
                :step="10"
                show-input
                show-input-controls
              />
            </el-form-item>
            
            <el-alert 
              title="格式说明"
              type="info"
              :closable="false"
              style="max-width: 500px;"
            >
              <template #default>
                <div>
                  <p><strong>JPEG:</strong> 适合照片，有损压缩，文件小</p>
                  <p><strong>PNG:</strong> 无损压缩，支持透明，文件较大</p>
                  <p><strong>WEBP:</strong> Google开发，压缩率高，支持透明</p>
                  <p><strong>GIF:</strong> 支持动画，颜色数有限</p>
                </div>
              </template>
            </el-alert>
          </el-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="添加水印" name="watermark">
        <div class="process-form">
          <el-form label-width="120px">
            <el-form-item label="水印文字">
              <el-input 
                v-model="watermarkOptions.text" 
                placeholder="请输入水印文字"
                maxlength="20"
                show-word-limit
                style="width: 300px;"
              />
            </el-form-item>
            
            <el-form-item label="水印位置">
              <el-select v-model="watermarkOptions.position" style="width: 200px">
                <el-option label="左上角" value="northwest" />
                <el-option label="右上角" value="northeast" />
                <el-option label="左下角" value="southwest" />
                <el-option label="右下角" value="southeast" />
                <el-option label="居中" value="center" />
                <el-option label="顶部" value="north" />
                <el-option label="底部" value="south" />
                <el-option label="左侧" value="west" />
                <el-option label="右侧" value="east" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="字体大小">
              <el-slider 
                v-model="watermarkOptions.fontSize" 
                :min="12" 
                :max="120" 
                :step="12"
                show-input
                show-input-controls
              />
            </el-form-item>
            
            <el-form-item label="字体颜色">
              <el-color-picker v-model="watermarkOptions.fontColor" />
            </el-form-item>
            
            <el-form-item label="透明度">
              <el-slider 
                v-model="watermarkOptions.opacity" 
                :min="0.1" 
                :max="1" 
                :step="0.1"
                show-input
                :format-tooltip="(val) => `${Math.round(val * 100)}%`"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <div class="process-actions">
      <el-button 
        type="primary" 
        size="large"
        :loading="processing"
        :disabled="disabled || !canProcess"
        @click="startProcess"
      >
        {{ processing ? '处理中...' : '开始处理' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  selectedImages: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['processSuccess'])

const processType = ref('compress')
const processing = ref(false)

const compressOptions = ref({
  quality: 80,
  format: null
})

const cropOptions = ref({
  width: 800,
  height: 600,
  left: 0,
  top: 0
})

const convertOptions = ref({
  format: 'webp',
  quality: 80
})

const watermarkOptions = ref({
  text: '水印文字',
  position: 'southeast',
  fontSize: 48,
  fontColor: '#ffffff',
  opacity: 0.3
})

const presetSizes = [
  { label: '头像', width: 200, height: 200 },
  { label: '缩略图', width: 300, height: 200 },
  { label: '文章图', width: 800, height: 400 },
  { label: 'Banner', width: 1920, height: 600 },
  { label: '正方形', width: 800, height: 800 }
]

const canProcess = computed(() => {
  if (processType.value === 'watermark') {
    return watermarkOptions.value.text.trim().length > 0
  }
  if (processType.value === 'convert') {
    return convertOptions.value.format !== ''
  }
  return true
})

const applyPreset = (preset) => {
  cropOptions.value.width = preset.width
  cropOptions.value.height = preset.height
  cropOptions.value.left = 0
  cropOptions.value.top = 0
}

const startProcess = async () => {
  if (props.selectedImages.length === 0) {
    ElMessage.warning('请先选择需要处理的图片')
    return
  }
  
  processing.value = true
  
  try {
    let endpoint = ''
    let payload = { imageIds: props.selectedImages }
    
    switch (processType.value) {
      case 'compress':
        endpoint = '/api/images/compress'
        payload = {
          ...payload,
          quality: compressOptions.value.quality,
          format: compressOptions.value.format
        }
        break
      case 'crop':
        endpoint = '/api/images/crop'
        payload = {
          ...payload,
          width: cropOptions.value.width,
          height: cropOptions.value.height,
          left: cropOptions.value.left,
          top: cropOptions.value.top
        }
        break
      case 'convert':
        endpoint = '/api/images/convert'
        payload = {
          ...payload,
          format: convertOptions.value.format,
          quality: convertOptions.value.quality
        }
        break
      case 'watermark':
        endpoint = '/api/images/watermark'
        payload = {
          ...payload,
          watermarkText: watermarkOptions.value.text,
          position: watermarkOptions.value.position,
          opacity: watermarkOptions.value.opacity,
          fontSize: watermarkOptions.value.fontSize,
          fontColor: watermarkOptions.value.fontColor
        }
        break
    }
    
    const response = await axios.post(endpoint, payload)
    
    if (response.data && response.data.success) {
      emit('processSuccess', response.data.processedImages)
    } else {
      throw new Error(response.data?.error || '处理失败')
    }
  } catch (error) {
    console.error('Process error:', error)
    ElMessage.error(error.message || '处理失败，请重试')
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.process-container {
  width: 100%;
}

.process-tabs {
  .el-tabs__header {
    margin-bottom: 24px;
  }
}

.process-form {
  max-width: 600px;
}

.size-inputs,
.position-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  font-size: 18px;
  font-weight: bold;
  color: #909399;
}

.unit {
  color: #909399;
  font-size: 14px;
}

.preset-sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-tag {
  cursor: pointer;
  user-select: none;
}

.preset-tag:hover {
  background-color: #f0f5ff;
  border-color: #667eea;
  color: #667eea;
}

.process-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}
</style>
