<template>
  <div class="share-component">
    <button class="share-btn" @click="showShareMenu = !showShareMenu">
      <span>🔗</span> 分享
    </button>

    <transition name="share-fade">
      <div v-if="showShareMenu" class="share-menu" @click.stop>
        <button
          v-for="platform in platforms"
          :key="platform.key"
          class="share-item"
          @click="shareTo(platform.key)"
        >
          <span class="share-icon">{{ platform.icon }}</span>
          <span class="share-label">{{ platform.label }}</span>
        </button>
      </div>
    </transition>

    <div v-if="showCopySuccess" class="copy-success">
      链接已复制到剪贴板
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  title: string
  url?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  url: () => window.location.href,
  description: ''
})

const emit = defineEmits<{
  (e: 'share'): void
}>()

const showShareMenu = ref(false)
const showCopySuccess = ref(false)

const platforms = [
  { key: 'wechat', label: '微信', icon: '💬' },
  { key: 'weibo', label: '微博', icon: '📢' },
  { key: 'qq', label: 'QQ', icon: '🐧' },
  { key: 'copy', label: '复制链接', icon: '📋' },
  { key: 'twitter', label: 'Twitter', icon: '🐦' }
]

const shareTo = async (platform: string): Promise<void> => {
  const url = encodeURIComponent(props.url)
  const title = encodeURIComponent(props.title)

  let shareUrl = ''

  emit('share')

  switch (platform) {
    case 'wechat':
      ElMessage.info('请使用微信扫一扫分享')
      break
    case 'weibo':
      shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}`
      window.open(shareUrl, '_blank', 'width=600,height=400')
      break
    case 'qq':
      shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&desc=${encodeURIComponent(props.description)}`
      window.open(shareUrl, '_blank', 'width=600,height=400')
      break
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
      window.open(shareUrl, '_blank', 'width=600,height=400')
      break
    case 'copy':
      try {
        await navigator.clipboard.writeText(props.url)
        showCopySuccess.value = true
        setTimeout(() => {
          showCopySuccess.value = false
        }, 2000)
      } catch {
        ElMessage.error('复制失败，请手动复制')
      }
      break
  }

  showShareMenu.value = false
}
</script>

<style scoped lang="scss">
.share-component {
  position: relative;
  display: inline-block;
}

.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s var(--ease-smooth);

  &:hover {
    border-color: var(--secondary-color);
    color: var(--secondary-color);
  }
}

.share-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.share-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s var(--ease-smooth);

  &:hover {
    background: var(--bg-card-hover);
    color: var(--secondary-color);
  }

  .share-icon {
    font-size: 18px;
  }
}

.copy-success {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--accent-green);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
  animation: slideUp 0.3s var(--ease-bounce);
}

.share-fade-enter-active,
.share-fade-leave-active {
  transition: all 0.2s var(--ease-smooth);
}

.share-fade-enter-from,
.share-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
