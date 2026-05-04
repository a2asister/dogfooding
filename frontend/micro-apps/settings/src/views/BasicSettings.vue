<template>
  <div class="basic-settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>店铺基本设置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="120px"
            class="form-content"
          >
            <el-form-item label="店铺名称" prop="shopName">
              <el-input v-model="basicForm.shopName" placeholder="请输入店铺名称" style="width: 400px" />
            </el-form-item>

            <el-form-item label="店铺Logo">
              <el-upload
                class="logo-uploader"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleLogoChange"
              >
                <img v-if="basicForm.shopLogo" :src="basicForm.shopLogo" class="logo" />
                <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">建议尺寸 200*200px，支持 JPG、PNG 格式</div>
            </el-form-item>

            <el-form-item label="店铺简介">
              <el-input
                v-model="basicForm.shopDescription"
                type="textarea"
                :rows="4"
                placeholder="请输入店铺简介"
                style="width: 600px"
              />
            </el-form-item>

            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="basicForm.contactPhone" placeholder="请输入联系电话" style="width: 400px" />
            </el-form-item>

            <el-form-item label="联系邮箱">
              <el-input v-model="basicForm.contactEmail" placeholder="请输入联系邮箱" style="width: 400px" />
            </el-form-item>

            <el-form-item label="营业状态">
              <el-radio-group v-model="basicForm.businessStatus">
                <el-radio value="open">营业中</el-radio>
                <el-radio value="close">打烊中</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="店铺地址">
              <el-input
                v-model="basicForm.shopAddress"
                type="textarea"
                :rows="2"
                placeholder="请输入店铺地址"
                style="width: 600px"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveBasic">
                <el-icon><Check /></el-icon>
                保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="支付设置" name="payment">
          <el-form
            ref="paymentFormRef"
            :model="paymentForm"
            label-width="120px"
            class="form-content"
          >
            <el-card class="payment-card">
              <template #header>
                <div class="payment-header">
                  <span>支付宝支付</span>
                  <el-switch v-model="paymentForm.alipayEnabled" />
                </div>
              </template>
              <el-form-item label="应用ID" prop="alipayAppId">
                <el-input v-model="paymentForm.alipayAppId" placeholder="请输入支付宝应用ID" style="width: 400px" />
              </el-form-item>
              <el-form-item label="应用私钥">
                <el-input
                  v-model="paymentForm.alipayPrivateKey"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入支付宝应用私钥"
                  style="width: 600px"
                  show-password
                />
              </el-form-item>
              <el-form-item label="支付宝公钥">
                <el-input
                  v-model="paymentForm.alipayPublicKey"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入支付宝公钥"
                  style="width: 600px"
                  show-password
                />
              </el-form-item>
            </el-card>

            <el-card class="payment-card">
              <template #header>
                <div class="payment-header">
                  <span>微信支付</span>
                  <el-switch v-model="paymentForm.wechatEnabled" />
                </div>
              </template>
              <el-form-item label="商户号" prop="wechatMchId">
                <el-input v-model="paymentForm.wechatMchId" placeholder="请输入微信商户号" style="width: 400px" />
              </el-form-item>
              <el-form-item label="AppID">
                <el-input v-model="paymentForm.wechatAppId" placeholder="请输入微信AppID" style="width: 400px" />
              </el-form-item>
              <el-form-item label="API密钥">
                <el-input
                  v-model="paymentForm.wechatApiKey"
                  type="password"
                  placeholder="请输入微信API密钥"
                  style="width: 400px"
                  show-password
                />
              </el-form-item>
            </el-card>

            <el-form-item>
              <el-button type="primary" @click="handleSavePayment">
                <el-icon><Check /></el-icon>
                保存支付设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="配送设置" name="shipping">
          <el-form
            ref="shippingFormRef"
            :model="shippingForm"
            label-width="120px"
            class="form-content"
          >
            <el-card class="shipping-card" v-for="(item, index) in shippingForm.templates" :key="index">
              <template #header>
                <div class="shipping-header">
                  <span>{{ item.name }}</span>
                  <div class="header-actions">
                    <el-button type="primary" link>编辑</el-button>
                    <el-button type="danger" link>删除</el-button>
                  </div>
                </div>
              </template>
              <el-descriptions :column="3" border size="small">
                <el-descriptions-item label="计费方式">
                  <el-tag>{{ item.type === 'weight' ? '按重量' : '按件数' }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="首重/首件">
                  {{ item.firstWeight }}kg / {{ item.firstWeightPrice }}元
                </el-descriptions-item>
                <el-descriptions-item label="续重/续件">
                  {{ item.addWeight }}kg / {{ item.addWeightPrice }}元
                </el-descriptions-item>
                <el-descriptions-item label="包邮条件">
                  {{ item.freeShipping ? `满${item.freeShippingAmount}元包邮` : '不包邮' }}
                </el-descriptions-item>
                <el-descriptions-item label="配送地区">
                  {{ item.area }}
                </el-descriptions-item>
                <el-descriptions-item label="是否启用">
                  <el-tag :type="item.enabled ? 'success' : 'info'">
                    {{ item.enabled ? '已启用' : '已禁用' }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-button type="primary" @click="handleAddShipping">
              <el-icon><Plus /></el-icon>
              添加配送模板
            </el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="员工管理" name="staff">
          <el-table :data="staffForm.staffList" v-loading="loading" stripe border>
            <el-table-column prop="username" label="账号" width="150" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="role" label="角色" width="120">
              <template #default="scope">
                <el-tag :type="getRoleType(scope.row.role)" size="small">
                  {{ getRoleLabel(scope.row.role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="联系电话" width="130" />
            <el-table-column prop="email" label="邮箱" min-width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ scope.row.status === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" link>编辑</el-button>
                <el-button
                  :type="scope.row.status === 'active' ? 'danger' : 'success'"
                  link
                >
                  {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-button type="primary" style="margin-top: 20px" @click="handleAddStaff">
            <el-icon><Plus /></el-icon>
            添加员工
          </el-button>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <el-form
            ref="securityFormRef"
            :model="securityForm"
            label-width="150px"
            class="form-content"
          >
            <el-card class="security-card">
              <template #header>
                <div class="security-header">
                  <span>登录密码</span>
                  <el-button type="primary" link>修改密码</el-button>
                </div>
              </template>
              <p class="security-desc">定期更换密码，提高账户安全性。</p>
            </el-card>

            <el-card class="security-card">
              <template #header>
                <div class="security-header">
                  <span>操作日志</span>
                  <el-button type="primary" link>查看日志</el-button>
                </div>
              </template>
              <p class="security-desc">查看所有操作记录，包括登录、修改等操作。</p>
            </el-card>

            <el-card class="security-card">
              <template #header>
                <div class="security-header">
                  <span>登录限制</span>
                  <el-switch v-model="securityForm.loginLimit" />
                </div>
              </template>
              <p class="security-desc">开启后，同一账号只能在一处登录，异常登录将收到短信提醒。</p>
            </el-card>

            <el-card class="security-card">
              <template #header>
                <div class="security-header">
                  <span>敏感操作验证</span>
                  <el-switch v-model="securityForm.sensitiveVerify" />
                </div>
              </template>
              <p class="security-desc">开启后，进行删除、退款等敏感操作时需要短信验证码验证。</p>
            </el-card>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Check } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('basic')

const basicFormRef = ref(null)
const paymentFormRef = ref(null)
const shippingFormRef = ref(null)
const securityFormRef = ref(null)

const basicForm = reactive({
  shopName: '优品生活专营店',
  shopLogo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20ecommerce%20store%20logo%20minimal%20design&image_size=square',
  shopDescription: '优品生活专营店，专注于为您提供优质的商品和贴心的服务。我们精选全球好物，让品质生活触手可及。',
  contactPhone: '400-888-8888',
  contactEmail: 'service@ypshop.com',
  businessStatus: 'open',
  shopAddress: '北京市朝阳区科技园A座888号'
})

const basicRules = {
  shopName: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const paymentForm = reactive({
  alipayEnabled: true,
  alipayAppId: '2021001123456789',
  alipayPrivateKey: '',
  alipayPublicKey: '',
  wechatEnabled: true,
  wechatMchId: '1234567890',
  wechatAppId: 'wxa1b2c3d4e5f6g7h8',
  wechatApiKey: ''
})

const shippingForm = reactive({
  templates: [
    {
      id: 1,
      name: '默认配送模板',
      type: 'weight',
      firstWeight: 1,
      firstWeightPrice: 10,
      addWeight: 1,
      addWeightPrice: 5,
      freeShipping: true,
      freeShippingAmount: 99,
      area: '全国（除港澳台）',
      enabled: true
    },
    {
      id: 2,
      name: '江浙沪皖特快',
      type: 'count',
      firstWeight: 1,
      firstWeightPrice: 8,
      addWeight: 1,
      addWeightPrice: 3,
      freeShipping: true,
      freeShippingAmount: 59,
      area: '江苏、浙江、上海、安徽',
      enabled: true
    }
  ]
})

const staffForm = reactive({
  staffList: [
    {
      id: 1,
      username: 'admin',
      name: '管理员',
      role: 'admin',
      phone: '13800138001',
      email: 'admin@ypshop.com',
      status: 'active',
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: 2,
      username: 'operator',
      name: '运营员',
      role: 'operator',
      phone: '13800138002',
      email: 'operator@ypshop.com',
      status: 'active',
      createTime: '2024-02-15 14:30:00'
    },
    {
      id: 3,
      username: 'finance',
      name: '财务员',
      role: 'finance',
      phone: '13800138003',
      email: 'finance@ypshop.com',
      status: 'inactive',
      createTime: '2024-03-10 09:15:00'
    }
  ]
})

const securityForm = reactive({
  loginLimit: true,
  sensitiveVerify: true
})

const roleMap = {
  admin: { label: '超级管理员', type: 'danger' },
  operator: { label: '运营员', type: 'primary' },
  finance: { label: '财务员', type: 'warning' },
  customer: { label: '客服员', type: 'success' }
}

const getRoleLabel = (role) => roleMap[role]?.label || role
const getRoleType = (role) => roleMap[role]?.type || 'info'

const handleLogoChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    basicForm.shopLogo = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleSaveBasic = async () => {
  if (!basicFormRef.value) return
  await basicFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('店铺基本设置保存成功')
    }
  })
}

const handleSavePayment = () => {
  ElMessage.success('支付设置保存成功')
}

const handleAddShipping = () => {
  ElMessage.info('添加配送模板功能开发中...')
}

const handleAddStaff = () => {
  ElMessage.info('添加员工功能开发中...')
}

onMounted(() => {
  loading.value = false
})
</script>

<style lang="scss" scoped>
.basic-settings {
  .card-header {
    font-size: 16px;
    font-weight: bold;
  }

  .form-content {
    max-width: 800px;
    padding: 20px 0;
  }

  .logo-uploader {
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

    .logo {
      width: 120px;
      height: 120px;
      display: block;
      object-fit: cover;
    }

    .logo-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 120px;
      height: 120px;
      text-align: center;
      line-height: 120px;
    }
  }

  .upload-tip {
    margin-top: 10px;
    color: #909399;
    font-size: 12px;
  }

  .payment-card,
  .shipping-card,
  .security-card {
    margin-bottom: 20px;

    .payment-header,
    .shipping-header,
    .security-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        .el-button {
          margin-left: 10px;
        }
      }
    }

    .security-desc {
      color: #909399;
      margin: 0;
    }
  }
}
</style>
