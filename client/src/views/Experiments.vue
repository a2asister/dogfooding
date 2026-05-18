<template>
  <div class="container" style="padding: 40px 20px;">
    <h1 style="margin-bottom: 20px;">实验中心</h1>
    <p style="color: var(--text-secondary); margin-bottom: 30px;">选择一个实验开始模拟</p>

    <div class="experiment-grid">
      <div
        v-for="exp in experiments"
        :key="exp.type"
        class="experiment-card"
        @click="goToExperiment(exp.type)"
      >
        <div class="experiment-icon">{{ exp.icon }}</div>
        <div class="experiment-name">{{ exp.name }}</div>
        <div class="experiment-description">{{ exp.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { ExperimentType } from '@/types';

const router = useRouter();

const experiments: Array<{ type: ExperimentType; name: string; description: string; icon: string }> = [
  {
    type: 'free_fall',
    name: '自由落体运动',
    description: '研究重力作用下物体的自由下落运动，测量重力加速度。可调节物体质量、初始高度和重力加速度参数。',
    icon: '🍎',
  },
  {
    type: 'projectile',
    name: '抛体运动',
    description: '模拟平抛、斜抛运动，分析初速度和角度对轨迹的影响。支持实时轨迹预测。',
    icon: '🎯',
  },
  {
    type: 'collision',
    name: '弹性碰撞',
    description: '研究动量守恒定律，模拟不同质量物体的碰撞过程。支持调节弹性系数和物体质量。',
    icon: '💥',
  },
  {
    type: 'pendulum',
    name: '单摆运动',
    description: '分析简谐运动规律，研究摆长和重力对周期的影响。支持阻尼振动模拟。',
    icon: '⏱️',
  },
  {
    type: 'orbital',
    name: '天体运动',
    description: '模拟万有引力作用下的行星轨道运动。可调节中心天体质量、卫星质量和轨道参数。',
    icon: '🌍',
  },
];

const goToExperiment = (type: ExperimentType): void => {
  router.push(`/simulate/${type}`);
};
</script>
