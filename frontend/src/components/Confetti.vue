<template>
  <div class="confetti-container">
    <div
      v-for="i in 50"
      :key="i"
      class="confetti-piece"
      :style="{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
      }"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Confetti extends Vue {
  colors = ['#e74c3c', '#f39c12', '#3498db', '#27ae60', '#9b59b6', '#1abc9c'];
}
</script>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation: confettiFall 3s ease-out forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: translateY(25vh) rotate(180deg);
    opacity: 1;
  }
  50% {
    transform: translateY(50vh) rotate(360deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(75vh) rotate(540deg);
    opacity: 0.5;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
