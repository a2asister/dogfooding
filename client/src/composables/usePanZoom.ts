import { ref, reactive, onMounted, onUnmounted } from 'vue';

export function usePanZoom(containerRef: { value: HTMLElement | null }) {
  const scale = ref(1);
  const offset = reactive({ x: 0, y: 0 });
  const isPanning = ref(false);
  const panStart = reactive({ x: 0, y: 0 });
  const lastOffset = reactive({ x: 0, y: 0 });

  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3;

  function getTransform(): string {
    return `translate(${offset.x}px, ${offset.y}px) scale(${scale.value})`;
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('.knowledge-node') ||
      target.closest('.tooltip-popup') ||
      target.tagName === 'BUTTON'
    ) {
      return;
    }
    isPanning.value = true;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
    lastOffset.x = offset.x;
    lastOffset.y = offset.y;
  }

  function onMouseMove(e: MouseEvent) {
    if (!isPanning.value) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    offset.x = lastOffset.x + dx;
    offset.y = lastOffset.y + dy;
  }

  function onMouseUp() {
    isPanning.value = false;
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + delta));

    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleChange = newScale / scale.value;
      offset.x = mouseX - (mouseX - offset.x) * scaleChange;
      offset.y = mouseY - (mouseY - offset.y) * scaleChange;
    }

    scale.value = newScale;
  }

  function resetView() {
    scale.value = 1;
    offset.x = 0;
    offset.y = 0;
  }

  function zoomIn() {
    scale.value = Math.min(MAX_SCALE, scale.value + 0.15);
  }

  function zoomOut() {
    scale.value = Math.max(MIN_SCALE, scale.value - 0.15);
  }

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      containerRef.value.addEventListener('wheel', onWheel, { passive: false });
    }
  });

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('mousedown', onMouseDown);
      containerRef.value.removeEventListener('wheel', onWheel);
    }
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  });

  return {
    scale,
    offset,
    isPanning,
    getTransform,
    resetView,
    zoomIn,
    zoomOut
  };
}
