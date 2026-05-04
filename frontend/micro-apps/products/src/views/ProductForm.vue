<template>
  <div class="product-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button type="primary" link @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <span>{{ isEdit ? '编辑商品' : '添加商品' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="form-content"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>

            <el-form-item label="商品分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择商品分类" style="width: 100%">
                <el-option label="数码产品" value="digital" />
                <el-option label="服装服饰" value="clothing" />
                <el-option label="食品饮料" value="food" />
                <el-option label="家居用品" value="home" />
                <el-option label="美妆个护" value="beauty" />
              </el-select>
            </el-form-item>

            <el-form-item label="商品价格" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :precision="2"
                placeholder="请输入商品价格"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="商品库存" prop="stock">
              <el-input-number
                v-model="form.stock"
                :min="0"
                placeholder="请输入商品库存"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="商品状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="active">上架</el-radio>
                <el-radio value="inactive">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="images">
            <el-form-item label="商品主图">
              <el-upload
                class="avatar-uploader"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleImageChange"
              >
                <img v-if="form.image" :src="form.image" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">点击上传商品主图，支持 JPG、PNG 格式</div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品描述" name="description">
            <el-form-item label="商品描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="10"
                placeholder="请输入商品详细描述"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <el-form-item class="form-footer">
          <el-button type="primary" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            保存
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Check, Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const activeTab = ref('basic')

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: 'active',
  image: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }]
}

const handleBack = () => {
  router.push('/products')
}

const handleImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.image = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('保存商品数据:', form)
      ElMessage.success(isEdit.value ? '商品修改成功' : '商品添加成功')
      router.push('/products')
    } else {
      return false
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  if (isEdit.value) {
    form.name = 'iPhone 15 Pro Max 256GB 黑色钛金属'
    form.category = 'digital'
    form.price = 9999
    form.stock = 100
    form.status = 'active'
    form.image = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20smartphone%20product%20photo%20on%20white%20background&image_size=square'
    form.description = '这是一款高端智能手机，采用最新的A17 Pro芯片，钛金属边框设计，支持USB-C接口，配备4800万像素主摄，支持ProRes视频录制。'
  }
})
</script>

<style lang="scss" scoped>
.product-form {
  .card-header {
    display: flex;
    align-items: center;

    .el-button {
      margin-right: 20px;
      padding: 0;
    }
  }

  .form-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .avatar-uploader {
    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .avatar {
      width: 178px;
      height: 178px;
      display: block;
      object-fit: cover;
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
      line-height: 178px;
    }
  }

  .upload-tip {
    margin-top: 10px;
    color: #909399;
    font-size: 12px;
  }

  .form-footer {
    margin-top: 30px;
    text-align: center;

    .el-button {
      margin: 0 10px;
    }
  }
}
</style>
