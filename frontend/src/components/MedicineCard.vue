<template>
  <div class="card-wrapper" :class="{ 'reminding': isReminding, 'completed': isCompleted }">
    <div class="particles" v-if="isReminding">
      <span v-for="n in 12" :key="n" class="particle" :style="{ '--delay': n * 0.1 + 's' }"></span>
    </div>
    <div class="card-container" @click="flipCard">
      <div class="card" :class="{ flipped: isFlipped }">
        <div class="card-front">
          <div class="medicine-image">
            <img :src="medicine.image" :alt="medicine.name" />
          </div>
          <h3 class="medicine-name">{{ medicine.name }}</h3>
          <p class="dosage">{{ medicine.dosage }}</p>
          <div class="time-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ medicine.time }}</span>
          </div>
          <p class="hint">点击查看详情</p>
        </div>
        <div class="card-back">
          <div class="back-content">
            <h4>药品说明</h4>
            <p class="description">{{ medicine.description }}</p>
            <h4>注意事项</h4>
            <p class="precautions">{{ medicine.precautions }}</p>
            <p class="hint">点击返回</p>
          </div>
        </div>
      </div>
    </div>
    <button v-if="!isCompleted" class="take-btn" @click.stop="takeMedicine">
      <span v-if="!taking">确认服药</span>
      <span v-else class="check-mark">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path
            class="check-path"
            d="M8 20 L16 28 L32 12"
            fill="none"
            stroke="white"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Vue from 'vue';
import type { Medicine } from '@/types';

@Component
export default class MedicineCard extends Vue {
  @Prop({ required: true }) medicine!: Medicine;
  @Prop({ default: false }) isReminding!: boolean;

  isFlipped = false;
  isCompleted = false;
  taking = false;

  flipCard() {
    if (!this.isCompleted) {
      this.isFlipped = !this.isFlipped;
    }
  }

  takeMedicine() {
    if (this.taking) return;
    this.taking = true;
    setTimeout(() => {
      this.isCompleted = true;
      this.$emit('taken', this.medicine);
    }, 1000);
  }
}
</script>

<style scoped lang="scss">
.card-wrapper {
  position: relative;
  transition: all 0.5s ease;

  &.completed {
    transform: scale(0.8);
    opacity: 0.6;
    pointer-events: none;
  }

  &.reminding {
    animation: pulse 2s ease-in-out infinite;
  }
}

.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(255, 215, 0, 0.8);
  border-radius: 50%;
  animation: float 2s ease-in-out infinite;
  animation-delay: var(--delay);

  @for $i from 1 through 12 {
    &:nth-child(#{$i}) {
      top: calc(50% + #{sin($i * 30deg) * 150px});
      left: calc(50% + #{cos($i * 30deg) * 150px});
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0;
  }
  50% {
    transform: translate(calc(var(--delay) * 20px), calc(var(--delay) * -30px)) scale(1.5);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 40px 20px rgba(255, 215, 0, 0.3);
  }
}

.card-container {
  perspective: 1000px;
  width: 320px;
  height: 420px;
  cursor: pointer;
}

.card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);

  &.flipped {
    transform: rotateY(180deg);
  }
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  background: white;
  overflow: hidden;
}

.card-front {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
}

.medicine-image {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.medicine-name {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.dosage {
  color: #666;
  font-size: 1rem;
  margin-bottom: 15px;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.hint {
  color: #999;
  font-size: 0.85rem;
  margin-top: auto;
}

.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.back-content {
  padding: 30px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;

  h4 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.1rem;
  }

  .description,
  .precautions {
    color: #555;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  .hint {
    text-align: center;
    margin-top: auto;
  }
}

.take-btn {
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 15px 30px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(17, 153, 142, 0.4);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(17, 153, 142, 0.5);
  }
}

.check-mark {
  display: inline-block;
}

.check-path {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: drawCheck 0.6s ease forwards;
}

@keyframes drawCheck {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
