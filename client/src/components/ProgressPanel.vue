<script setup lang="ts">
import { usePhotoStore } from '@/stores/photo';
import { ElProgress } from 'element-plus';
import { stageNames } from '@/types';
import { getProgress } from '@/websocket';
import { ref, onMounted, onUnmounted } from 'vue';

const store = usePhotoStore();
const currentProgress = ref<Map<string, number>>(new Map());

let timer: number | null = null;

onMounted((): void => {
  timer = window.setInterval((): void => {
    for (const photo of store.processingPhotos) {
      const progress = getProgress(photo.id);
      if (progress) {
        currentProgress.value.set(photo.id, progress.progress);
      }
    }
  }, 200);
});

onUnmounted((): void => {
  if (timer !== null) {
    window.clearInterval(timer);
  }
});

const stages: Array<'preprocess' | 'denoise' | 'texture' | 'colorize' | 'postprocess'> = [
  'preprocess',
  'denoise',
  'texture',
  'colorize',
  'postprocess',
];

function getStageStatus(photoId: string, stage: string): 'pending' | 'active' | 'completed' {
  const progress = currentProgress.value.get(photoId) ?? 0;
  const stageIndex = stages.indexOf(stage as typeof stages[number]);
  const stageProgress = (stageIndex + 1) * 20;

  if (progress >= stageProgress) {
    return 'completed';
  } else if (progress >= stageIndex * 20) {
    return 'active';
  }
  return 'pending';
}
</script>

<template>
  <div class="card">
    <h2 class="section-title">处理进度</h2>
    <div v-for="photo in store.processingPhotos" :key="photo.id" style="margin-bottom: 20px">
      <div style="margin-bottom: 12px; font-size: 14px; color: #333">
        {{ photo.originalName }}
      </div>
      <div class="progress-stages">
        <span
          v-for="stage in stages"
          :key="stage"
          class="stage-badge"
          :class="{
            active: getStageStatus(photo.id, stage) === 'active',
            completed: getStageStatus(photo.id, stage) === 'completed',
          }"
        >
          {{ stageNames[stage] }}
        </span>
      </div>
      <ElProgress
        :percentage="currentProgress.get(photo.id) ?? photo.progress"
        :stroke-width="8"
        :show-text="true"
      />
    </div>
  </div>
</template>
