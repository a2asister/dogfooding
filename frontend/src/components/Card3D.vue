<template>
  <div class="card-3d-container" @click="flipCard">
    <div class="card-3d" :class="{ flipped: isFlipped }">
      <div class="card-face card-front">
        <slot name="front"></slot>
      </div>
      <div class="card-face card-back">
        <slot name="back"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isFlipped = ref(false)

const flipCard = (): void => {
  isFlipped.value = !isFlipped.value
}

defineExpose({ flipCard })
</script>

<style scoped>
.card-3d-container {
  perspective: 1500px;
  width: 400px;
  height: 550px;
  cursor: pointer;
}

.card-3d {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-3d.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: rotateY(180deg);
}
</style>
