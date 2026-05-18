<script setup lang="ts">
import { stageNames } from '@/types';

defineProps<{
  frameData: string;
  stage: string;
  progress: number;
}>();
</script>

<template>
  <div class="frame-preview">
    <img :src="frameData" alt="处理帧" />
    <div class="frame-info">
      <div>{{ stageNames[stage as keyof typeof stageNames] || stage }}</div>
      <div style="color: #667eea; font-weight: 600">{{ progress }}%</div>
    </div>
  </div>
</template>
