<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          熔断平台
        </div>
      </div>
      <nav class="sidebar-nav">
        <div
          v-for="item in navItems"
          :key="item.path"
          :class="['nav-item', { active: isActive(item.path) }]"
          @click="navigateTo(item.path)"
        >
          <component :is="item.icon" class="nav-item-icon" />
          <span>{{ item.name }}</span>
        </div>
      </nav>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

const navigateTo = (path: string) => {
  router.push(path);
};

const DashboardIcon = () => h('svg', {
  class: 'nav-item-icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2'
}, [
  h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }),
]);

const CircuitIcon = () => h('svg', {
  class: 'nav-item-icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2'
}, [
  h('path', { d: 'M18.36 6.64a9 9 0 1 1-12.73 0' }),
  h('path', { d: 'M12 2v4' }),
  h('path', { d: 'M12 18v4' }),
  h('path', { d: 'M4.93 4.93l2.83 2.83' }),
  h('path', { d: 'M16.24 16.24l2.83 2.83' }),
  h('path', { d: 'M2 12h4' }),
  h('path', { d: 'M18 12h4' }),
  h('path', { d: 'M4.93 19.07l2.83-2.83' }),
  h('path', { d: 'M16.24 7.76l2.83-2.83' }),
]);

const RateLimitIcon = () => h('svg', {
  class: 'nav-item-icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2'
}, [
  h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }),
]);

const IsolationIcon = () => h('svg', {
  class: 'nav-item-icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2'
}, [
  h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
  h('line', { x1: '3', y1: '9', x2: '21', y2: '9' }),
  h('line', { x1: '9', y1: '21', x2: '9', y2: '9' }),
]);

const ChaosIcon = () => h('svg', {
  class: 'nav-item-icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2'
}, [
  h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
  h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
  h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }),
]);

const TestIcon = () => h('svg', {
  class: 'nav-item-icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2'
}, [
  h('path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
  h('polyline', { points: '14 2 14 8 20 8' }),
  h('path', { d: 'M16 13H8' }),
  h('path', { d: 'M16 17H8' }),
  h('path', { d: 'M10 9H8' }),
]);

const navItems = [
  { path: '/dashboard', name: '仪表盘', icon: DashboardIcon },
  { path: '/circuit-breakers', name: '熔断器', icon: CircuitIcon },
  { path: '/rate-limiters', name: '限流管理', icon: RateLimitIcon },
  { path: '/isolations', name: '链路隔离', icon: IsolationIcon },
  { path: '/chaos', name: '故障演练', icon: ChaosIcon },
  { path: '/test', name: '测试工具', icon: TestIcon },
];
</script>
