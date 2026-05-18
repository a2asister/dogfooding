<template>
  <div class="main-content">
    <aside class="sidebar">
      <div class="section-title">{{ experimentInfo.name }}</div>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
        {{ experimentInfo.description }}
      </p>

      <div class="section-title">模拟控制</div>
      <div class="controls-row">
        <button class="btn btn-primary" @click="toggleSimulation">
          {{ isRunning ? '暂停' : '开始' }}
        </button>
        <button class="btn btn-secondary" @click="resetSimulation">重置</button>
      </div>

      <div v-for="param in experimentInfo.params" :key="param.key" class="slider-container">
        <label class="label">{{ param.label }}</label>
        <input
          type="range"
          class="slider"
          :min="param.min"
          :max="param.max"
          :step="param.step"
          :value="getParamValue(param.key)"
          @input="updateParam(param.key, ($event.target as HTMLInputElement).value)"
        />
        <div class="slider-value">{{ getParamValue(param.key) }} {{ param.unit ?? '' }}</div>
      </div>

      <div class="section-title" style="margin-top: 24px;">显示选项</div>
      <label class="checkbox-container">
        <input type="checkbox" class="checkbox" v-model="showTrail" />
        显示轨迹
      </label>
      <label class="checkbox-container">
        <input type="checkbox" class="checkbox" v-model="showVelocity" />
        显示速度向量
      </label>

      <div class="section-title" style="margin-top: 24px;">数据管理</div>
      <div class="form-group">
        <label class="label">名称</label>
        <input type="text" class="input" v-model="simulationName" placeholder="输入模拟名称" />
      </div>
      <div class="controls-row">
        <button class="btn btn-success" @click="saveSimulation">保存配置</button>
        <button class="btn btn-secondary" @click="recordExperiment">记录实验</button>
      </div>
    </aside>

    <main class="simulation-area">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">粒子数</div>
          <div class="stat-value">{{ particleCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">帧率</div>
          <div class="stat-value">{{ fps }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">运行时间</div>
          <div class="stat-value">{{ elapsedTime.toFixed(1) }}s</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">状态</div>
          <div class="stat-value" :style="{ color: isRunning ? 'var(--secondary-color)' : 'var(--warning-color)' }">
            {{ isRunning ? '运行中' : '已暂停' }}
          </div>
        </div>
      </div>

      <div class="canvas-container">
        <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight"></canvas>
      </div>

      <div v-if="experimentInfo.type === 'projectile'" style="margin-top: 20px;" class="card">
        <h3 style="margin-bottom: 12px;">轨迹预测</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">
          虚线表示基于当前参数预测的运动轨迹
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePhysics } from '@/composables/usePhysics';
import { api } from '@/api';
import type { ExperimentType } from '@/types';

const route = useRoute();
const experimentType = computed((): ExperimentType => route.params['type'] as ExperimentType);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = 900;
const canvasHeight = 600;

const isRunning = ref(false);
const showTrail = ref(true);
const showVelocity = ref(false);
const fps = ref(0);
const elapsedTime = ref(0);
const simulationName = ref('');
const simulationId = ref<number | null>(null);

const params = ref<Record<string, number>>({});

const experimentConfigs: Record<ExperimentType, {
  name: string;
  description: string;
  params: Array<{ key: string; label: string; min: number; max: number; step: number; default: number; unit?: string }>;
}> = {
  free_fall: {
    name: '自由落体运动',
    description: '研究重力作用下物体的自由下落运动，可调节重力加速度、物体质量和初始高度。',
    params: [
      { key: 'gravity', label: '重力加速度', min: 1, max: 30, step: 0.1, default: 9.8, unit: 'm/s²' },
      { key: 'mass', label: '物体质量', min: 1, max: 100, step: 1, default: 10, unit: 'kg' },
      { key: 'height', label: '初始高度', min: 50, max: 500, step: 10, default: 400, unit: 'px' },
      { key: 'radius', label: '物体半径', min: 10, max: 50, step: 5, default: 20, unit: 'px' },
    ],
  },
  projectile: {
    name: '抛体运动',
    description: '模拟平抛、斜抛运动，分析初速度、角度对运动轨迹的影响。',
    params: [
      { key: 'gravity', label: '重力加速度', min: 1, max: 30, step: 0.1, default: 9.8, unit: 'm/s²' },
      { key: 'velocity', label: '初速度', min: 50, max: 500, step: 10, default: 200, unit: 'px/s' },
      { key: 'angle', label: '发射角度', min: 0, max: 90, step: 1, default: 45, unit: '°' },
      { key: 'mass', label: '物体质量', min: 1, max: 100, step: 1, default: 10, unit: 'kg' },
    ],
  },
  collision: {
    name: '弹性碰撞',
    description: '研究动量守恒定律，模拟两个物体的弹性碰撞过程。',
    params: [
      { key: 'mass1', label: '物体1质量', min: 1, max: 100, step: 1, default: 20, unit: 'kg' },
      { key: 'mass2', label: '物体2质量', min: 1, max: 100, step: 1, default: 30, unit: 'kg' },
      { key: 'velocity1', label: '物体1速度', min: 0, max: 300, step: 10, default: 150, unit: 'px/s' },
      { key: 'velocity2', label: '物体2速度', min: -300, max: 0, step: 10, default: -100, unit: 'px/s' },
      { key: 'restitution', label: '弹性系数', min: 0, max: 1, step: 0.05, default: 0.8 },
    ],
  },
  pendulum: {
    name: '单摆运动',
    description: '分析简谐运动规律，研究摆长、重力对运动周期的影响。',
    params: [
      { key: 'length', label: '摆长', min: 100, max: 400, step: 10, default: 250, unit: 'px' },
      { key: 'gravity', label: '重力加速度', min: 1, max: 30, step: 0.1, default: 9.8, unit: 'm/s²' },
      { key: 'angle', label: '初始角度', min: 5, max: 80, step: 5, default: 30, unit: '°' },
      { key: 'damping', label: '阻尼系数', min: 0, max: 0.1, step: 0.005, default: 0.01 },
      { key: 'mass', label: '摆球质量', min: 1, max: 50, step: 1, default: 10, unit: 'kg' },
    ],
  },
  orbital: {
    name: '天体运动',
    description: '模拟万有引力作用下的行星轨道运动，可调节天体质量和轨道参数。',
    params: [
      { key: 'centralMass', label: '中心天体质量', min: 1e20, max: 1e25, step: 1e20, default: 1e24, unit: 'kg' },
      { key: 'satelliteMass', label: '卫星质量', min: 1e10, max: 1e15, step: 1e10, default: 1e12, unit: 'kg' },
      { key: 'distance', label: '初始距离', min: 100, max: 300, step: 10, default: 200, unit: 'px' },
      { key: 'eccentricity', label: '偏心率', min: 0, max: 0.8, step: 0.05, default: 0 },
    ],
  },
};

const experimentInfo = computed(() => {
  const config = experimentConfigs[experimentType.value] ?? experimentConfigs.free_fall;
  return {
    type: experimentType.value,
    ...config,
  };
});

const getParamValue = (key: string): number => {
  const defaultValue = experimentInfo.value.params.find((p) => p.key === key)?.default ?? 0;
  return params.value[key] ?? defaultValue;
};

const updateParam = (key: string, value: string): void => {
  params.value[key] = Number(value);
  if (!isRunning.value) {
    resetSimulation();
  }
};

const { engine, particles, initWasm, updatePhysics } = usePhysics();

const particleCount = computed((): number => particles.value.length);

let animationId: number | null = null;
let lastTime = 0;
let frameCount = 0;
let fpsTime = 0;

const render = (): void => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvasWidth; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }
  for (let y = 0; y < canvasHeight; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

  for (const particle of particles.value) {
    if (showTrail.value && particle.trail.length > 1) {
      ctx.beginPath();
      const first = particle.trail[0];
      if (first) ctx.moveTo(first.x, first.y);
      for (let i = 1; i < particle.trail.length; i++) {
        const point = particle.trail[i];
        if (!point) continue;
        const alpha = i / particle.trail.length;
        ctx.strokeStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineTo(point.x, point.y);
      }
      ctx.strokeStyle = particle.color + '80';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(particle.position.x, particle.position.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff40';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (showVelocity.value) {
      const velScale = 0.3;
      ctx.beginPath();
      ctx.moveTo(particle.position.x, particle.position.y);
      ctx.lineTo(
        particle.position.x + particle.velocity.x * velScale,
        particle.position.y + particle.velocity.y * velScale
      );
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      const arrowSize = 8;
      const angle = Math.atan2(particle.velocity.y, particle.velocity.x);
      ctx.beginPath();
      ctx.moveTo(
        particle.position.x + particle.velocity.x * velScale,
        particle.position.y + particle.velocity.y * velScale
      );
      ctx.lineTo(
        particle.position.x + particle.velocity.x * velScale - arrowSize * Math.cos(angle - Math.PI / 6),
        particle.position.y + particle.velocity.y * velScale - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(
        particle.position.x + particle.velocity.x * velScale,
        particle.position.y + particle.velocity.y * velScale
      );
      ctx.lineTo(
        particle.position.x + particle.velocity.x * velScale - arrowSize * Math.cos(angle + Math.PI / 6),
        particle.position.y + particle.velocity.y * velScale - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }
  }

  if (experimentType.value === 'pendulum') {
    const pivot = { x: canvasWidth / 2, y: 50 };
    const bob = particles.value[0];
    if (bob) {
      ctx.beginPath();
      ctx.moveTo(pivot.x, pivot.y);
      ctx.lineTo(bob.position.x, bob.position.y);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pivot.x, pivot.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();
    }
  }

  if (experimentType.value === 'orbital') {
    const central = particles.value.find((p) => p.fixed);
    if (central) {
      ctx.beginPath();
      ctx.arc(central.position.x, central.position.y, 30, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        central.position.x, central.position.y, 0,
        central.position.x, central.position.y, 30
      );
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }
};

const animate = (timestamp: number): void => {
  if (lastTime === 0) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  frameCount++;
  fpsTime += delta;
  if (fpsTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / fpsTime);
    frameCount = 0;
    fpsTime = 0;
  }

  if (isRunning.value) {
    elapsedTime.value += delta / 1000;
    updatePhysics();
  }

  render();
  animationId = requestAnimationFrame(animate);
};

const setupExperiment = (): void => {
  if (!engine.value) return;

  engine.value.clear_particles();
  const type = experimentType.value;

  if (type === 'free_fall') {
    const mass = getParamValue('mass');
    const height = getParamValue('height');
    const radius = getParamValue('radius');
    engine.value.add_particle(0, canvasWidth / 2, height, 0, 0, mass, radius, '#3b82f6', false);
  } else if (type === 'projectile') {
    const mass = getParamValue('mass');
    const velocity = getParamValue('velocity');
    const angle = (getParamValue('angle') * Math.PI) / 180;
    engine.value.add_particle(
      0,
      50,
      canvasHeight - 50,
      velocity * Math.cos(angle),
      -velocity * Math.sin(angle),
      mass,
      15,
      '#10b981',
      false
    );
  } else if (type === 'collision') {
    engine.value.add_particle(
      0,
      200,
      canvasHeight / 2,
      getParamValue('velocity1'),
      0,
      getParamValue('mass1'),
      20,
      '#ef4444',
      false
    );
    engine.value.add_particle(
      1,
      700,
      canvasHeight / 2,
      getParamValue('velocity2'),
      0,
      getParamValue('mass2'),
      25,
      '#8b5cf6',
      false
    );
  } else if (type === 'pendulum') {
    const length = getParamValue('length');
    const angle = (getParamValue('angle') * Math.PI) / 180;
    const pivotX = canvasWidth / 2;
    const pivotY = 50;
    engine.value.add_particle(
      0,
      pivotX + length * Math.sin(angle),
      pivotY + length * Math.cos(angle),
      0,
      0,
      getParamValue('mass'),
      20,
      '#f59e0b',
      false
    );
  } else if (type === 'orbital') {
    const distance = getParamValue('distance');
    const centralX = canvasWidth / 2;
    const centralY = canvasHeight / 2;
    engine.value.add_particle(0, centralX, centralY, 0, 0, getParamValue('centralMass'), 25, '#fbbf24', true);
    const orbitalSpeed = 150;
    engine.value.add_particle(
      1,
      centralX + distance,
      centralY,
      0,
      -orbitalSpeed,
      getParamValue('satelliteMass'),
      12,
      '#06b6d4',
      false
    );
  }
};

const toggleSimulation = (): void => {
  isRunning.value = !isRunning.value;
};

const resetSimulation = (): void => {
  isRunning.value = false;
  elapsedTime.value = 0;
  lastTime = 0;
  fps.value = 0;
  frameCount = 0;
  fpsTime = 0;
  setupExperiment();
  render();
};

const saveSimulation = async (): Promise<void> => {
  if (!simulationName.value.trim()) {
    alert('请输入模拟名称');
    return;
  }

  try {
    const config = JSON.stringify(params.value);
    if (simulationId.value !== null) {
      await api.updateSimulation(simulationId.value, simulationName.value, config);
    } else {
      const id = await api.createSimulation(simulationName.value, experimentType.value, config);
      simulationId.value = id;
    }
    alert('保存成功！');
  } catch (error: unknown) {
    console.error('Save failed:', error);
    alert('保存失败');
  }
};

const recordExperiment = async (): Promise<void> => {
  if (simulationId.value === null) {
    alert('请先保存模拟配置');
    return;
  }

  const expName = prompt('输入实验名称：');
  if (!expName) return;

  try {
    await api.createExperiment(
      simulationId.value,
      expName,
      JSON.stringify(params.value),
      JSON.stringify({ elapsedTime: elapsedTime.value, particleCount: particleCount.value })
    );
    alert('实验记录已保存！');
  } catch (error: unknown) {
    console.error('Record failed:', error);
    alert('记录失败');
  }
};

watch(
  () => route.query,
  (query): void => {
    if (query['config']) {
      try {
        params.value = JSON.parse(query['config'] as string);
      } catch (error: unknown) {
        console.error('Failed to parse config:', error);
      }
    }
    if (query['name']) {
      simulationName.value = query['name'] as string;
    }
    if (query['id']) {
      simulationId.value = Number(query['id']);
    }
  },
  { immediate: true }
);

onMounted(async (): Promise<void> => {
  await initWasm();
  if (engine.value) {
    engine.value.set_boundary(canvasWidth, canvasHeight, 0.8);
    setupExperiment();
  }
  animationId = requestAnimationFrame(animate);
});

onUnmounted((): void => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});
</script>
