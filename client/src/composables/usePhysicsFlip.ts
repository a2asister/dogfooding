import { ref, computed, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import type { FlipState } from '@/types';

export function usePhysicsFlip(totalPages: number) {
  const flipState = ref<FlipState>({
    isFlipping: false,
    currentPage: 0,
    progress: 0,
    direction: null,
  });

  const startX = ref(0);
  const startY = ref(0);
  const currentX = ref(0);
  const isDragging = ref(false);
  const velocity = ref(0);
  const lastX = ref(0);
  const lastTime = ref(0);

  const bookElement = ref<HTMLElement | null>(null);

  const pageStyle = computed(() => {
    const pageWidth = 400;
    const pageHeight = 600;
    const progress = flipState.value.progress;
    const direction = flipState.value.direction;
    
    const foldAngle = progress * 180;
    const perspective = 1200;
    const bendFactor = Math.sin(progress * Math.PI) * 15;
    
    return {
      pageWidth,
      pageHeight,
      foldAngle,
      perspective,
      bendFactor,
      direction,
    };
  });

  const shadowIntensity = computed(() => {
    const progress = flipState.value.progress;
    return Math.sin(progress * Math.PI) * 0.6;
  });

  function handleDragStart(e: MouseEvent | TouchEvent): void {
    if (flipState.value.isFlipping) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    startX.value = clientX;
    startY.value = clientY;
    currentX.value = clientX;
    lastX.value = clientX;
    lastTime.value = Date.now();
    isDragging.value = true;
    
    if (bookElement.value) {
      const rect = bookElement.value.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      if (relativeX > rect.width / 2) {
        flipState.value.direction = 'next';
      } else {
        flipState.value.direction = 'prev';
      }
    }
  }

  function handleDragMove(e: MouseEvent | TouchEvent): void {
    if (!isDragging.value || flipState.value.isFlipping) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    currentX.value = clientX;
    
    const now = Date.now();
    const deltaTime = now - lastTime.value;
    if (deltaTime > 0) {
      velocity.value = (clientX - lastX.value) / deltaTime;
    }
    lastX.value = clientX;
    lastTime.value = now;
    
    const delta = clientX - startX.value;
    const maxDelta = 400;
    let progress = Math.abs(delta) / maxDelta;
    progress = Math.min(Math.max(progress, 0), 1);
    
    if (flipState.value.direction === 'next' && delta < 0) {
      flipState.value.progress = progress;
    } else if (flipState.value.direction === 'prev' && delta > 0) {
      flipState.value.progress = progress;
    }
  }

  function handleDragEnd(): void {
    if (!isDragging.value) return;
    isDragging.value = false;
    
    const progress = flipState.value.progress;
    const direction = flipState.value.direction;
    const threshold = 0.3 + Math.abs(velocity.value) * 2;
    
    if (progress > threshold && direction) {
      completeFlip(direction);
    } else {
      cancelFlip();
    }
  }

  function completeFlip(direction: 'next' | 'prev'): void {
    flipState.value.isFlipping = true;
    
    const startProgress = flipState.value.progress;
    const duration = (1 - startProgress) * 0.4;
    
    gsap.to(flipState.value, {
      progress: 1,
      duration,
      ease: 'power2.out',
      onComplete: () => {
        if (direction === 'next' && flipState.value.currentPage < totalPages - 1) {
          flipState.value.currentPage++;
        } else if (direction === 'prev' && flipState.value.currentPage > 0) {
          flipState.value.currentPage--;
        }
        flipState.value.progress = 0;
        flipState.value.direction = null;
        flipState.value.isFlipping = false;
      },
    });
  }

  function cancelFlip(): void {
    flipState.value.isFlipping = true;
    
    gsap.to(flipState.value, {
      progress: 0,
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)',
      onComplete: () => {
        flipState.value.direction = null;
        flipState.value.isFlipping = false;
      },
    });
  }

  function nextPage(): void {
    if (flipState.value.isFlipping || flipState.value.currentPage >= totalPages - 1) return;
    flipState.value.direction = 'next';
    completeFlip('next');
  }

  function prevPage(): void {
    if (flipState.value.isFlipping || flipState.value.currentPage <= 0) return;
    flipState.value.direction = 'prev';
    completeFlip('prev');
  }

  function goToPage(pageIndex: number): void {
    if (flipState.value.isFlipping) return;
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    if (pageIndex === flipState.value.currentPage) return;
    
    const direction = pageIndex > flipState.value.currentPage ? 'next' : 'prev';
    flipState.value.currentPage = pageIndex;
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove as EventListener);
    window.addEventListener('touchend', handleDragEnd);
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleDragMove as EventListener);
    window.removeEventListener('touchend', handleDragEnd);
  });

  return {
    flipState,
    pageStyle,
    shadowIntensity,
    bookElement,
    handleDragStart,
    nextPage,
    prevPage,
    goToPage,
  };
}
