<template>
  <div class="water-tank-container" @click="handleClick">
    <div class="water-tank" :class="{ warning: percentage > 80, overflow: percentage >= 100 }">
      <div class="tank-glass"></div>
      <div 
        class="water" 
        :style="{ height: Math.min(percentage, 100) + '%' }"
        :class="waterClass"
      >
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
      </div>
      <div class="tank-measure">
        <div class="measure-mark" v-for="i in 5" :key="i" :style="{ bottom: (i * 20) + '%' }"></div>
      </div>
    </div>
    <div class="percentage-display">
      <span class="percentage-number">{{ percentage.toFixed(1) }}%</span>
      <span class="percentage-label">预算使用</span>
    </div>
    <div class="droplet" v-for="n in dropletCount" :key="n" :style="getDropletStyle(n)"></div>
  </div>
</template>

<script>
export default {
  name: 'WaterTankProgress',
  props: {
    percentage: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dropletCount: 0
    }
  },
  computed: {
    waterClass() {
      if (this.percentage >= 80) return 'water-red'
      if (this.percentage >= 50) return 'water-yellow'
      return 'water-green'
    }
  },
  watch: {
    percentage(newVal) {
      if (newVal >= 100) {
        this.startOverflow()
      } else {
        this.stopOverflow()
      }
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    },
    startOverflow() {
      this.dropletCount = 8
    },
    stopOverflow() {
      this.dropletCount = 0
    },
    getDropletStyle(n) {
      const delay = (n * 0.3) + 's'
      const left = (10 + Math.random() * 80) + '%'
      const duration = (1 + Math.random() * 0.5) + 's'
      return {
        animationDelay: delay,
        left: left,
        animationDuration: duration
      }
    }
  }
}
</script>

<style scoped>
.water-tank-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.water-tank-container:hover {
  transform: scale(1.02);
}

.water-tank {
  position: relative;
  width: 120px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px 10px 20px 20px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.tank-glass {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 100%);
  z-index: 10;
  pointer-events: none;
}

.tank-measure {
  position: absolute;
  top: 0;
  right: 5px;
  bottom: 0;
  width: 20px;
  z-index: 15;
}

.measure-mark {
  position: absolute;
  right: 0;
  width: 10px;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
}

.water {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: height 0.5s ease;
  overflow: hidden;
}

.water-green {
  background: linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
}

.water-yellow {
  background: linear-gradient(180deg, #fde047 0%, #facc15 50%, #eab308 100%);
}

.water-red {
  background: linear-gradient(180deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
}

.wave {
  position: absolute;
  width: 200%;
  height: 100%;
  top: 0;
  left: -50%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 40%;
  animation: wave 3s infinite linear;
}

.wave1 {
  animation-duration: 4s;
  opacity: 0.5;
}

.wave2 {
  animation-duration: 3s;
  opacity: 0.3;
  animation-delay: -1s;
}

.wave3 {
  animation-duration: 2s;
  opacity: 0.2;
  animation-delay: -2s;
}

@keyframes wave {
  0% {
    transform: rotate(0deg) translateY(0);
  }
  50% {
    transform: rotate(180deg) translateY(-5px);
  }
  100% {
    transform: rotate(360deg) translateY(0);
  }
}

.warning .water {
  animation: pulse 1s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

.overflow .water {
  animation: overflow 0.5s ease-in-out infinite alternate;
}

@keyframes overflow {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-5px);
  }
}

.percentage-display {
  text-align: center;
  color: white;
}

.percentage-number {
  display: block;
  font-size: 48px;
  font-weight: bold;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.percentage-label {
  display: block;
  font-size: 16px;
  opacity: 0.9;
  margin-top: 5px;
}

.droplet {
  position: absolute;
  top: 10px;
  width: 10px;
  height: 15px;
  background: #f87171;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: droplet-fall 1.5s infinite ease-in;
  opacity: 0;
  z-index: 100;
}

@keyframes droplet-fall {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  10% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(200px) scale(0.5);
  }
}
</style>