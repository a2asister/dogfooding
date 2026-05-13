<script setup lang="ts">
import { useTripStore } from '../stores/trip';

const store = useTripStore();
</script>

<template>
  <nav class="navbar">
    <div class="nav-brand">
      <span class="brand-icon">🗺️</span>
      <span class="brand-text">行程时间轴</span>
    </div>
    <div class="nav-links">
      <router-link to="/" class="nav-link" active-class="active">时间轴</router-link>
      <router-link to="/trips" class="nav-link" active-class="active">行程管理</router-link>
      <button class="theme-toggle" @click="store.toggleDayNight()">
        {{ store.isDayTime ? '🌙' : '☀️' }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.brand-icon {
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 10px 15px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}
</style>