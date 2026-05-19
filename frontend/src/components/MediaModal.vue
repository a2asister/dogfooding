<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="video-modal-content">
        <button class="close-btn" @click="handleClose">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div v-if="type === 'video'" class="video-wrapper">
          <video
            ref="videoRef"
            :src="src"
            :poster="poster"
            controls
            autoplay
            playsinline
          ></video>
        </div>
        
        <div v-else-if="type === 'image'" class="image-wrapper">
          <img :src="src" :alt="title" />
        </div>
        
        <div v-if="title" class="media-title">{{ title }}</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

interface Props {
  visible: boolean
  type: 'video' | 'image'
  src: string
  title?: string
  poster?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)

const handleClose = (): void => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  emit('update:visible', false)
}

const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape' && props.visible) {
    handleClose()
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown)
  } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown)
    }
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s var(--ease-smooth);
  padding: 40px;
}

.video-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: scaleIn 0.4s var(--ease-bounce);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--ease-smooth);
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
}

.video-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  video {
    display: block;
    max-width: 100%;
    max-height: 80vh;
    border-radius: 12px;
  }
}

.image-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  img {
    display: block;
    max-width: 100%;
    max-height: 80vh;
    border-radius: 12px;
  }
}

.media-title {
  margin-top: 16px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
