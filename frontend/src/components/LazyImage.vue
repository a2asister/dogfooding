<template>
  <div class="lazy-image" :class="{ loaded: isLoaded, error: hasError }">
    <div v-if="!isLoaded && !hasError" class="image-placeholder skeleton"></div>
    <img
      v-show="isLoaded && !hasError"
      :src="src"
      :alt="alt"
      :class="className"
      @load="onLoad"
      @error="onError"
      loading="lazy"
    />
    <div v-if="hasError" class="image-error">
      <span>📷</span>
      <p>图片加载失败</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  src: string
  alt?: string
  className?: string
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  className: '',
  threshold: 0.1
})

const isLoaded = ref(false)
const hasError = ref(false)
const imgRef = ref<HTMLImageElement | null>(null)
let observer: IntersectionObserver | null = null

const onLoad = (): void => {
  isLoaded.value = true
}

const onError = (): void => {
  hasError.value = true
  isLoaded.value = false
}

onMounted(() => {
  const img = document.createElement('img')
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = props.src
          observer?.disconnect()
        }
      })
    },
    { threshold: props.threshold }
  )

  imgRef.value = img
  observer.observe(img)

  img.onload = () => {
    isLoaded.value = true
  }

  img.onerror = () => {
    hasError.value = true
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped lang="scss">
.lazy-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .image-placeholder {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.02);
    transition: all 0.5s var(--ease-smooth);
  }

  &.loaded img {
    opacity: 1;
    transform: scale(1);
  }

  .image-error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    color: var(--text-muted);

    span {
      font-size: 32px;
      margin-bottom: 8px;
    }

    p {
      font-size: 12px;
    }
  }
}
</style>
