<template>
  <div class="home-config">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="轮播Banner" name="banners">
        <div class="config-card card">
          <div class="card-header">
            <h3>首页轮播Banner配置</h3>
            <el-button type="primary" size="small" @click="addBannerItem">+ 添加Banner</el-button>
          </div>
          <div v-for="(banner, index) in banners" :key="index" class="config-item">
            <el-input v-model="banner.image" placeholder="图片URL" style="flex: 2" />
            <el-input v-model="banner.title" placeholder="标题" style="flex: 1" />
            <el-input v-model="banner.link" placeholder="跳转链接" style="flex: 1" />
            <el-button type="danger" text @click="removeBannerItem(index)">删除</el-button>
          </div>
          <div class="card-footer">
            <el-button type="primary" @click="saveConfig('banners')">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="游戏亮点" name="highlights">
        <div class="config-card card">
          <div class="card-header">
            <h3>游戏核心亮点配置</h3>
            <el-button type="primary" size="small" @click="addHighlightItem">+ 添加亮点</el-button>
          </div>
          <div v-for="(item, index) in highlights" :key="index" class="config-item">
            <el-input v-model="item.icon" placeholder="图标" style="width: 80px" />
            <el-input v-model="item.title" placeholder="标题" style="flex: 1" />
            <el-input v-model="item.description" placeholder="描述" style="flex: 2" />
            <el-button type="danger" text @click="removeHighlightItem(index)">删除</el-button>
          </div>
          <div class="card-footer">
            <el-button type="primary" @click="saveConfig('highlights')">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="精彩预览" name="previews">
        <div class="config-card card">
          <div class="card-header">
            <h3>精彩预览配置</h3>
            <el-button type="primary" size="small" @click="addPreviewItem">+ 添加预览</el-button>
          </div>
          <div v-for="(item, index) in previews" :key="index" class="config-item">
            <el-input v-model="item.url" placeholder="图片URL" style="flex: 2" />
            <el-input v-model="item.title" placeholder="标题" style="flex: 1" />
            <el-button type="danger" text @click="removePreviewItem(index)">删除</el-button>
          </div>
          <div class="card-footer">
            <el-button type="primary" @click="saveConfig('previews')">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="社群二维码" name="social">
        <div class="config-card card">
          <div class="card-header">
            <h3>社群二维码配置</h3>
            <el-button type="primary" size="small" @click="addSocialItem">+ 添加社群</el-button>
          </div>
          <div v-for="(item, index) in social" :key="index" class="config-item">
            <el-select v-model="item.platform" placeholder="平台" style="width: 120px">
              <el-option label="微信" value="wechat" />
              <el-option label="QQ" value="qq" />
              <el-option label="微博" value="weibo" />
            </el-select>
            <el-input v-model="item.name" placeholder="名称" style="flex: 1" />
            <el-input v-model="item.qrcode" placeholder="二维码图片URL" style="flex: 2" />
            <el-button type="danger" text @click="removeSocialItem(index)">删除</el-button>
          </div>
          <div class="card-footer">
            <el-button type="primary" @click="saveConfig('social')">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { homeApi } from '../../api'

const activeTab = ref('banners')
const banners = ref<{ id: number; image: string; title: string; link: string }[]>([])
const highlights = ref<{ id: number; icon: string; title: string; description: string }[]>([])
const previews = ref<{ id: number; url: string; title: string }[]>([])
const social = ref<{ id: number; platform: string; name: string; qrcode: string }[]>([])

const addBannerItem = (): void => {
  banners.value.push({ id: Date.now(), image: '', title: '', link: '' })
}

const removeBannerItem = (index: number): void => {
  banners.value.splice(index, 1)
}

const addHighlightItem = (): void => {
  highlights.value.push({ id: Date.now(), icon: '', title: '', description: '' })
}

const removeHighlightItem = (index: number): void => {
  highlights.value.splice(index, 1)
}

const addPreviewItem = (): void => {
  previews.value.push({ id: Date.now(), url: '', title: '' })
}

const removePreviewItem = (index: number): void => {
  previews.value.splice(index, 1)
}

const addSocialItem = (): void => {
  social.value.push({ id: Date.now(), platform: '', name: '', qrcode: '' })
}

const removeSocialItem = (index: number): void => {
  social.value.splice(index, 1)
}

const saveConfig = async (moduleName: string): Promise<void> => {
  let configData: unknown
  if (moduleName === 'banners') configData = banners.value
  else if (moduleName === 'highlights') configData = highlights.value
  else if (moduleName === 'previews') configData = previews.value
  else if (moduleName === 'social') configData = social.value

  try {
    await homeApi.updateConfig({
      module_name: moduleName,
      config_data: JSON.stringify(configData)
    })
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  }
}

const loadConfig = async (): Promise<void> => {
  try {
    const configs = await homeApi.getAllConfig()
    configs.forEach((config: unknown) => {
      const cfg = config as { module_name: string; config_data: string }
      if (cfg.module_name === 'banners') {
        banners.value = JSON.parse(cfg.config_data)
      } else if (cfg.module_name === 'highlights') {
        highlights.value = JSON.parse(cfg.config_data)
      } else if (cfg.module_name === 'previews') {
        previews.value = JSON.parse(cfg.config_data)
      } else if (cfg.module_name === 'social') {
        social.value = JSON.parse(cfg.config_data)
      }
    })
  } catch {
    banners.value = []
    highlights.value = []
    previews.value = []
    social.value = []
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.home-config {
  .config-card {
    padding: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        font-size: 18px;
        color: var(--text-primary);
        margin: 0;
      }
    }

    .config-item {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
    }

    .card-footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }
  }
}

:deep(.el-tabs) {
  --el-tabs-header-bg-color: var(--bg-card);
  --el-tabs-active-color: var(--secondary-color);
  --el-tabs-hover-color: var(--secondary-color);
  --el-tabs-item-color: var(--text-secondary);
  --el-tabs-border-color: var(--border-color);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}

:deep(.el-tab-pane) {
  margin-top: 20px;
}

:deep(.el-input__wrapper) {
  background: #1a2332 !important;
  box-shadow: 0 0 0 1px #3a506b inset !important;
  color: #e6f1ff !important;

  &:hover, &.is-focus {
    box-shadow: 0 0 0 1px var(--secondary-color) inset !important;
  }

  .el-input__inner {
    color: #e6f1ff !important;
  }

  .el-input__inner::placeholder {
    color: #6b7a90 !important;
  }
}

:deep(.el-select) {
  background: #1a2332 !important;
  box-shadow: 0 0 0 1px #3a506b inset !important;
  color: #e6f1ff !important;

  .el-input__wrapper {
    background: #1a2332 !important;
    box-shadow: none !important;
  }
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple)) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 600 !important;

  &:hover {
    opacity: 0.9 !important;
    box-shadow: 0 4px 15px rgba(0, 245, 255, 0.3) !important;
  }
}

:deep(.el-button--danger) {
  color: #ff6b6b !important;

  &:hover {
    color: #ff5252 !important;
    background: rgba(255, 107, 107, 0.1) !important;
  }
}
</style>
