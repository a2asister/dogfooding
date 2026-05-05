<template>
  <div class="lottery-home">
    <div class="lottery-section" v-loading="loading">
      <div class="lottery-card">
        <div class="lottery-header">
          <h2 class="lottery-title">
            <el-icon><Trophy /></el-icon>
            {{ currentLottery?.name || '幸运大抽奖' }}
          </h2>
          <div class="lottery-info">
            <span class="info-item">
              <el-icon><Coin /></el-icon>
              消耗 {{ currentLottery?.costPerDraw || 10 }} 积分/次
            </span>
            <span class="info-item">
              <el-icon><Timer /></el-icon>
              剩余 {{ currentLottery?.remainingDraws || 100 }} 次
            </span>
          </div>
        </div>

        <div class="lottery-wheel-wrapper">
          <div class="lottery-wheel-container">
            <div 
              class="lottery-wheel" 
              :style="wheelStyle"
              ref="wheelRef"
            >
              <svg viewBox="0 0 400 400" class="wheel-svg">
                <g v-for="(prize, index) in displayPrizes" :key="index">
                  <path
                    :d="getSlicePath(index, displayPrizes.length)"
                    :fill="getSliceColor(index)"
                    stroke="#fff"
                    stroke-width="3"
                  />
                  <text
                    :transform="getTextTransform(index, displayPrizes.length)"
                    text-anchor="middle"
                    class="prize-text"
                  >
                    <tspan x="0" dy="-8" class="prize-name">{{ prize.name }}</tspan>
                    <tspan x="0" dy="18" class="prize-value">{{ getPrizeValueText(prize) }}</tspan>
                  </text>
                </g>
                <circle cx="200" cy="200" r="40" fill="url(#centerGradient)" />
                <circle cx="200" cy="200" r="30" fill="url(#buttonGradient)" />
                <text x="200" y="205" text-anchor="middle" class="center-text">抽奖</text>
              </svg>
              <defs>
                <linearGradient id="centerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ff8c00;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ee5a24;stop-opacity:1" />
                </linearGradient>
              </defs>
            </div>
            <div class="wheel-pointer"></div>
          </div>

          <div class="lottery-controls">
            <div class="draw-count">
              <span class="label">今日剩余抽奖次数</span>
              <span class="value">{{ remainingDraws }} 次</span>
            </div>
            <el-button 
              type="primary" 
              size="large"
              :loading="drawing"
              :disabled="remainingDraws <= 0 || drawing"
              @click="handleDraw"
              class="draw-button"
            >
              <el-icon><Promotion /></el-icon>
              开始抽奖
            </el-button>
            <el-button size="large" @click="handleDraw10" :disabled="remainingDraws < 10">
              连抽10次
            </el-button>
          </div>
        </div>
      </div>

      <div class="prizes-section">
        <h3 class="section-title">
          <el-icon><Goods /></el-icon>
          奖品列表
        </h3>
        <div class="prizes-grid">
          <div v-for="(prize, index) in displayPrizes" :key="index" class="prize-card">
            <div class="prize-icon" :style="{ background: getSliceColor(index) }">
              <el-icon :size="28">{{ getPrizeIcon(prize.type) }}</el-icon>
            </div>
            <div class="prize-info">
              <div class="prize-card-name">{{ prize.name }}</div>
              <div class="prize-card-value">{{ getPrizeValueText(prize) }}</div>
              <div class="prize-card-prob">概率 {{ (prize.probability * 100).toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog 
      v-model="resultVisible" 
      title="抽奖结果" 
      width="400px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="result-content" v-if="lastResult">
        <div class="result-icon" :style="{ background: lastResult.prizeType === 'none' ? '#95a5a6' : '#ff6b6b' }">
          <el-icon :size="64">{{ lastResult.prizeType === 'none' ? 'CircleClose' : 'Trophy' }}</el-icon>
        </div>
        <div class="result-title">{{ lastResult.prizeName }}</div>
        <div class="result-desc" v-if="lastResult.prizeType !== 'none'">
          恭喜您获得 {{ lastResult.prizeName }}！
        </div>
        <div class="result-desc" v-else>
          很遗憾，这次没有中奖，再来一次吧！
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="resultVisible = false" :loading="drawing">
          {{ remainingDraws > 0 ? '再抽一次' : '确定' }}
        </el-button>
        <el-button @click="resultVisible = false; $router.push('/records')">
          查看记录
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Trophy, Coin, Timer, Promotion, Goods, CircleClose } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3006/api';
const USER_ID = 'user_001';
const LOTTERY_ID = 'lottery_001';

const loading = ref(false);
const drawing = ref(false);
const currentLottery = ref(null);
const remainingDraws = ref(3);
const wheelRotation = ref(0);
const resultVisible = ref(false);
const lastResult = ref(null);
const wheelRef = ref(null);

const defaultPrizes = [
  { id: 1, name: '一等奖', type: 'product', value: 'iPhone 15 Pro', probability: 0.01 },
  { id: 2, name: '二等奖', type: 'coupon', value: 200, probability: 0.05 },
  { id: 3, name: '三等奖', type: 'points', value: 500, probability: 0.10 },
  { id: 4, name: '四等奖', type: 'coupon', value: 50, probability: 0.15 },
  { id: 5, name: '五等奖', type: 'points', value: 100, probability: 0.20 },
  { id: 6, name: '六等奖', type: 'coupon', value: 10, probability: 0.25 },
  { id: 7, name: '谢谢参与', type: 'none', value: 0, probability: 0.20 },
  { id: 8, name: '再来一次', type: 'extra_draw', value: 1, probability: 0.04 }
];

const displayPrizes = computed(() => currentLottery.value?.prizes || defaultPrizes);

const wheelStyle = computed(() => ({
  transform: `rotate(${wheelRotation.value}deg)`,
  transition: drawing.value ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
}));

const getSlicePath = (index, total) => {
  const centerX = 200;
  const centerY = 200;
  const radius = 180;
  const anglePerSlice = (2 * Math.PI) / total;
  const startAngle = index * anglePerSlice - Math.PI / 2;
  const endAngle = (index + 1) * anglePerSlice - Math.PI / 2;
  
  const x1 = centerX + radius * Math.cos(startAngle);
  const y1 = centerY + radius * Math.sin(startAngle);
  const x2 = centerX + radius * Math.cos(endAngle);
  const y2 = centerY + radius * Math.sin(endAngle);
  
  const largeArc = anglePerSlice > Math.PI ? 1 : 0;
  
  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};

const getTextTransform = (index, total) => {
  const centerX = 200;
  const centerY = 200;
  const radius = 130;
  const anglePerSlice = (2 * Math.PI) / total;
  const midAngle = index * anglePerSlice + anglePerSlice / 2 - Math.PI / 2;
  
  const x = centerX + radius * Math.cos(midAngle);
  const y = centerY + radius * Math.sin(midAngle);
  const rotation = (midAngle + Math.PI / 2) * (180 / Math.PI);
  
  return `translate(${x}, ${y}) rotate(${rotation})`;
};

const getSliceColor = (index) => {
  const colors = [
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'
  ];
  return colors[index % colors.length];
};

const getPrizeValueText = (prize) => {
  switch (prize.type) {
    case 'product':
      return prize.value;
    case 'coupon':
      return `¥${prize.value} 优惠券`;
    case 'points':
      return `${prize.value} 积分`;
    case 'extra_draw':
      return `额外 ${prize.value} 次`;
    default:
      return '谢谢参与';
  }
};

const getPrizeIcon = (type) => {
  switch (type) {
    case 'product':
      return 'Trophy';
    case 'coupon':
      return 'Ticket';
    case 'points':
      return 'Coin';
    case 'extra_draw':
      return 'Promotion';
    default:
      return 'CircleClose';
  }
};

const loadLottery = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE}/lotteries/${LOTTERY_ID}`);
    if (response.data.success) {
      currentLottery.value = response.data.data;
    }
  } catch (error) {
    console.error('加载抽奖活动失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleDraw = async () => {
  if (remainingDraws.value <= 0) {
    ElMessage.warning('今日抽奖次数已用完');
    return;
  }

  drawing.value = true;
  try {
    const response = await axios.post(`${API_BASE}/lotteries/${LOTTERY_ID}/draw`, {
      userId: USER_ID
    });

    if (response.data.success) {
      const result = response.data.data;
      lastResult.value = result;
      remainingDraws.value -= 1;

      const prizeIndex = displayPrizes.value.findIndex(p => p.id === result.prizeId);
      if (prizeIndex >= 0) {
        const anglePerSlice = 360 / displayPrizes.value.length;
        const targetAngle = 360 - (prizeIndex * anglePerSlice + anglePerSlice / 2);
        const fullRotations = 5 * 360;
        wheelRotation.value += fullRotations + targetAngle - (wheelRotation.value % 360);
      }

      setTimeout(() => {
        resultVisible.value = true;
        drawing.value = false;
      }, 4000);
    }
  } catch (error) {
    drawing.value = false;
    if (error.response?.data?.error) {
      ElMessage.error(error.response.data.error);
    } else {
      ElMessage.error('抽奖失败，请稍后重试');
    }
    console.error(error);
  }
};

const handleDraw10 = () => {
  ElMessage.info('连续抽奖功能开发中...');
};

onMounted(() => {
  loadLottery();
});
</script>

<style scoped>
.lottery-home {
  padding-bottom: 40px;
}

.lottery-section {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
}

.lottery-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.lottery-header {
  margin-bottom: 24px;
  text-align: center;
}

.lottery-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.lottery-title .el-icon {
  color: #ff6b6b;
}

.lottery-info {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6c757d;
}

.lottery-wheel-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lottery-wheel-container {
  position: relative;
  width: 320px;
  height: 320px;
  margin-bottom: 24px;
}

.lottery-wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ffd93d);
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
}

.wheel-svg {
  width: 100%;
  height: 100%;
}

.prize-text {
  font-size: 12px;
  fill: #fff;
  font-weight: 600;
}

.prize-name {
  font-size: 14px;
}

.prize-value {
  font-size: 11px;
  opacity: 0.9;
}

.center-text {
  font-size: 14px;
  font-weight: 700;
  fill: #fff;
}

.wheel-pointer {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-top: 32px solid #ff6b6b;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  z-index: 10;
}

.wheel-pointer::after {
  content: '';
  position: absolute;
  top: -38px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: #ff6b6b;
  border-radius: 50%;
}

.lottery-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.draw-count {
  text-align: center;
}

.draw-count .label {
  display: block;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}

.draw-count .value {
  font-size: 24px;
  font-weight: 700;
  color: #ff6b6b;
}

.draw-button {
  width: 200px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border: none;
  font-size: 18px;
  font-weight: 600;
}

.draw-button:hover {
  background: linear-gradient(135deg, #ee5a24, #ff6b6b);
}

.prizes-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  color: #4facfe;
}

.prizes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prize-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: transform 0.2s;
}

.prize-card:hover {
  transform: translateX(4px);
}

.prize-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.prize-info {
  flex: 1;
}

.prize-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 2px;
}

.prize-card-value {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 2px;
}

.prize-card-prob {
  font-size: 11px;
  color: #999;
}

.result-content {
  text-align: center;
  padding: 20px;
}

.result-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.result-desc {
  font-size: 14px;
  color: #6c757d;
}

@media (max-width: 1200px) {
  .lottery-section {
    grid-template-columns: 1fr;
  }
}
</style>
