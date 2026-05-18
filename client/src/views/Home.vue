<template>
  <div class="container" style="padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 60px;">
      <h1 style="font-size: 42px; margin-bottom: 16px;">物理模拟实验平台</h1>
      <p style="font-size: 18px; color: var(--text-secondary); max-width: 600px; margin: 0 auto;">
        基于 WebAssembly 的高性能物理引擎，支持多种物理实验场景的实时模拟与可视化
      </p>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">实验类型</div>
        <div class="stat-value">5</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">WASM 加速</div>
        <div class="stat-value">⚡</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">实时模拟</div>
        <div class="stat-value">60 FPS</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">数据持久化</div>
        <div class="stat-value">SQLite</div>
      </div>
    </div>

    <h2 style="margin: 40px 0 20px; font-size: 24px;">快速开始</h2>
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

    <div style="margin-top: 60px; padding: 30px; background-color: var(--surface-color); border-radius: 12px; border: 1px solid var(--border-color);">
      <h3 style="margin-bottom: 16px;">技术特性</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
        <div>
          <h4 style="margin-bottom: 8px; color: var(--primary-color);">高性能计算</h4>
          <p style="color: var(--text-secondary); font-size: 14px;">
            使用 Rust + WebAssembly 实现物理引擎内核，提供接近原生的计算性能
          </p>
        </div>
        <div>
          <h4 style="margin-bottom: 8px; color: var(--primary-color);">实时可视化</h4>
          <p style="color: var(--text-secondary); font-size: 14px;">
            Canvas 实时渲染粒子运动轨迹，支持动态参数调整
          </p>
        </div>
        <div>
          <h4 style="margin-bottom: 8px; color: var(--primary-color);">实验数据管理</h4>
          <p style="color: var(--text-secondary); font-size: 14px;">
            SQLite 持久化存储实验配置和结果数据
          </p>
        </div>
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
    description: '研究重力作用下物体的自由下落运动，测量重力加速度',
    icon: '🍎',
  },
  {
    type: 'projectile',
    name: '抛体运动',
    description: '模拟平抛、斜抛运动，分析初速度和角度对轨迹的影响',
    icon: '🎯',
  },
  {
    type: 'collision',
    name: '弹性碰撞',
    description: '研究动量守恒定律，模拟不同质量物体的碰撞过程',
    icon: '💥',
  },
  {
    type: 'pendulum',
    name: '单摆运动',
    description: '分析简谐运动规律，研究摆长和重力对周期的影响',
    icon: '⏱️',
  },
  {
    type: 'orbital',
    name: '天体运动',
    description: '模拟万有引力作用下的行星轨道运动',
    icon: '🌍',
  },
];

const goToExperiment = (type: ExperimentType): void => {
  router.push(`/simulate/${type}`);
};
</script>
