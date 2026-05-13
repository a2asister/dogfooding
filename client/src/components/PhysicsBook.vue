<template>
  <div 
    ref="bookContainer" 
    class="physics-book"
    :style="{ perspective: `${pageStyle.perspective}px` }"
  >
    <div 
      class="book-3d"
      :style="{ transform: 'rotateY(-5deg)' }"
      @mousedown="handleDragStart"
      @touchstart="handleDragStart"
    >
      <div class="book-spine"></div>
      
      <div class="page-container" :style="{ width: `${pageStyle.pageWidth}px`, height: `${pageStyle.pageHeight}px` }">
        <div 
          v-for="i in Math.min(5, Math.max(0, flipState.currentPage - 2))" 
          :key="`past-${i}`"
          class="page page-past"
          :style="{ 
            zIndex: i,
            transform: `translateZ(${-i * 0.5}px)`,
          }"
        >
          <div class="page-content">
            <img v-if="pages[i]" :src="pages[i]" class="page-image" alt="page" />
          </div>
        </div>

        <div 
          v-if="flipState.currentPage > 0"
          class="page page-under"
          :style="{ zIndex: 10 }"
        >
          <div class="page-content">
            <img v-if="pages[flipState.currentPage - 1]" :src="pages[flipState.currentPage - 1]" class="page-image" alt="page" />
          </div>
        </div>

        <div 
          class="page page-flipping"
          :class="{ 'is-flipping': flipState.isFlipping || flipState.progress > 0 }"
          :style="{ 
            zIndex: 20,
            transformOrigin: flipState.direction === 'next' ? 'left center' : 'right center',
            transform: getFlippingTransform(),
          }"
        >
          <div class="page-content page-front">
            <img v-if="pages[flipState.currentPage]" :src="pages[flipState.currentPage]" class="page-image" alt="page" />
            <div class="page-fold-shadow" :style="{ opacity: shadowIntensity }"></div>
          </div>
          <div class="page-content page-back">
            <img 
              v-if="pages[flipState.direction === 'next' ? flipState.currentPage + 1 : flipState.currentPage - 1]" 
              :src="pages[flipState.direction === 'next' ? flipState.currentPage + 1 : flipState.currentPage - 1]" 
              class="page-image" 
              alt="page" 
            />
            <div class="page-fold-shadow" :style="{ opacity: shadowIntensity * 0.5 }"></div>
          </div>
          <div class="bend-effect" :style="{ transform: `skewY(${pageStyle.bendFactor}deg)` }"></div>
        </div>

        <div 
          v-if="flipState.currentPage < totalPages - 1"
          class="page page-next"
          :style="{ zIndex: 5 }"
        >
          <div class="page-content">
            <img v-if="pages[flipState.currentPage + 1]" :src="pages[flipState.currentPage + 1]" class="page-image" alt="page" />
          </div>
        </div>

        <div 
          v-for="i in Math.min(5, totalPages - flipState.currentPage - 2)" 
          :key="`future-${i}`"
          class="page page-future"
          :style="{ 
            zIndex: 5 - i,
            transform: `translateZ(${i * 0.5}px)`,
          }"
        >
          <div class="page-content">
            <img v-if="pages[flipState.currentPage + 1 + i]" :src="pages[flipState.currentPage + 1 + i]" class="page-image" alt="page" />
          </div>
        </div>
      </div>

      <div 
        class="bookmark"
        :class="{ 'is-bookmarked': isBookmarked }"
        @click="$emit('toggle-bookmark')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    </div>

    <div class="page-indicator">
      {{ flipState.currentPage + 1 }} / {{ totalPages }}
    </div>

    <div class="nav-buttons">
      <button class="nav-btn prev-btn" @click="prevPage" :disabled="flipState.currentPage <= 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="nav-btn next-btn" @click="nextPage" :disabled="flipState.currentPage >= totalPages - 1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePhysicsFlip } from '@/composables/usePhysicsFlip';

interface Props {
  pages: string[];
  isBookmarked?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isBookmarked: false,
});

const emit = defineEmits<{
  'toggle-bookmark': [];
  'page-change': [page: number];
}>();

const totalPages = computed(() => props.pages.length);

const {
  flipState,
  pageStyle,
  shadowIntensity,
  bookElement,
  handleDragStart,
  nextPage,
  prevPage,
} = usePhysicsFlip(totalPages.value);

function getFlippingTransform(): string {
  const progress = flipState.value.progress;
  const direction = flipState.value.direction;
  
  if (!direction || progress === 0) {
    return 'rotateY(0deg)';
  }
  
  const baseAngle = direction === 'next' ? -progress * 180 : progress * 180;
  const bend = Math.sin(progress * Math.PI) * 10;
  
  return `rotateY(${baseAngle}deg) skewY(${direction === 'next' ? -bend : bend}deg)`;
}
</script>

<style lang="scss" scoped>
.physics-book {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.book-3d {
  position: relative;
  transform-style: preserve-3d;
  cursor: grab;
  user-select: none;
  
  &:active {
    cursor: grabbing;
  }
}

.book-spine {
  position: absolute;
  left: -10px;
  top: 0;
  width: 10px;
  height: 100%;
  background: linear-gradient(90deg, #2a2a4a 0%, #3a3a5a 100%);
  border-radius: 4px 0 0 4px;
  box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.3);
}

.page-container {
  position: relative;
  transform-style: preserve-3d;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 15px 30px rgba(0, 0, 0, 0.2),
    inset 0 0 30px rgba(0, 0, 0, 0.1);
  border-radius: 0 8px 8px 0;
  background: #fff;
}

.page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  border-radius: 0 8px 8px 0;
  overflow: hidden;
}

.page-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  backface-visibility: hidden;
}

.page-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-fold-shadow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0) 50%
  );
  pointer-events: none;
}

.page-flipping {
  .page-back {
    transform: rotateY(180deg);
    
    .page-fold-shadow {
      background: linear-gradient(
        -90deg,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0) 50%
      );
    }
  }
}

.bend-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform-origin: center;
}

.bookmark {
  position: absolute;
  top: 0;
  right: 20px;
  width: 40px;
  height: 60px;
  z-index: 100;
  cursor: pointer;
  color: rgba(255, 200, 100, 0.5);
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  
  &.is-bookmarked {
    color: #ffc864;
    animation: bookmarkFloat 2s ease-in-out infinite;
  }
  
  &:hover {
    transform: scale(1.1);
  }
  
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}

@keyframes bookmarkFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-3px) rotate(1deg);
  }
  75% {
    transform: translateY(-2px) rotate(-1deg);
  }
}

.page-indicator {
  margin-top: 30px;
  padding: 10px 25px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.nav-buttons {
  position: absolute;
  bottom: 40px;
  display: flex;
  gap: 20px;
}

.nav-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
}
</style>
