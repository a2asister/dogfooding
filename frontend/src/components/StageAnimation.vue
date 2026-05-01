<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { babyService } from '@/services/babyService'
import type { BabyProfile, StageConfig, AnimationElement, MonthStage } from '@/types'

interface Props {
  baby: BabyProfile
}

const props = defineProps<Props>()

const animationElements = ref<AnimationElement[]>([])
const showStageInfo = ref(false)

const createRandom = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const generateElementsForStage = (stage: MonthStage): AnimationElement[] => {
  const elements: AnimationElement[] = []
  
  switch (stage) {
    case 'newborn':
      elements.push(
        { type: 'moon', position: { x: 15, y: 8 }, color: '#E6F3FF', size: 50, animation: 'float', delay: 0, duration: 12 },
        { type: 'star', position: { x: 70, y: 10 }, color: '#FFF9E6', size: 25, animation: 'pulse', delay: 0.5, duration: 4 },
        { type: 'star', position: { x: 25, y: 25 }, color: '#FFE6E8', size: 20, animation: 'pulse', delay: 1, duration: 5 },
        { type: 'cloud', position: { x: 5, y: 60 }, color: '#F0FFF8', size: 55, animation: 'float', delay: 0.3, duration: 15 },
        { type: 'cloud', position: { x: 75, y: 55 }, color: '#E6F3FF', size: 45, animation: 'float', delay: 0.8, duration: 18 },
        { type: 'heart', position: { x: 45, y: 75 }, color: '#FFB3BA', size: 30, animation: 'pulse', delay: 1.5, duration: 3 },
        { type: 'star', position: { x: 85, y: 30 }, color: '#FFF9E6', size: 18, animation: 'pulse', delay: 2, duration: 6 },
        { type: 'cloud', position: { x: 50, y: 20 }, color: '#FFE6E8', size: 40, animation: 'float', delay: 2.5, duration: 20 }
      )
      break

    case 'one_month':
    case 'two_months':
      elements.push(
        { type: 'sun', position: { x: 80, y: 5 }, color: '#FFDAB3', size: 55, animation: 'pulse', delay: 0, duration: 6 },
        { type: 'cloud', position: { x: 10, y: 15 }, color: '#FFE6E8', size: 60, animation: 'float', delay: 0.5, duration: 12 },
        { type: 'flower', position: { x: 20, y: 70 }, color: '#FFB3BA', size: 40, animation: 'wiggle', delay: 1, duration: 5 },
        { type: 'sprout', position: { x: 70, y: 75 }, color: '#F0FFF8', size: 35, animation: 'bounce', delay: 1.5, duration: 4 },
        { type: 'cloud', position: { x: 55, y: 30 }, color: '#E6F3FF', size: 50, animation: 'float', delay: 2, duration: 14 },
        { type: 'butterfly', position: { x: 65, y: 40 }, color: '#FFB3BA', size: 28, animation: 'float', delay: 2.5, duration: 8 },
        { type: 'heart', position: { x: 35, y: 50 }, color: '#FFB3BA', size: 25, animation: 'pulse', delay: 3, duration: 4 }
      )
      break

    case 'three_months':
    case 'four_months':
    case 'five_months':
      elements.push(
        { type: 'sun', position: { x: 85, y: 8 }, color: '#FFDAB3', size: 60, animation: 'pulse', delay: 0, duration: 7 },
        { type: 'teddy', position: { x: 15, y: 25 }, color: '#FFDAB3', size: 50, animation: 'bounce', delay: 0.5, duration: 4 },
        { type: 'bunny', position: { x: 70, y: 60 }, color: '#FFE6E8', size: 45, animation: 'bounce-float', delay: 1, duration: 5 },
        { type: 'flower', position: { x: 30, y: 75 }, color: '#FFB3BA', size: 40, animation: 'wiggle', delay: 1.5, duration: 6 },
        { type: 'balloon', position: { x: 60, y: 15 }, color: '#FFB3BA', size: 35, animation: 'float', delay: 2, duration: 10 },
        { type: 'cloud', position: { x: 10, y: 55 }, color: '#E6F3FF', size: 55, animation: 'float', delay: 2.5, duration: 16 },
        { type: 'leaf', position: { x: 80, y: 50 }, color: '#F0FFF8', size: 30, animation: 'swing', delay: 3, duration: 5 },
        { type: 'butterfly', position: { x: 45, y: 35 }, color: '#FFB3BA', size: 30, animation: 'drift', delay: 3.5, duration: 9 }
      )
      break

    case 'six_months':
    case 'seven_months':
    case 'eight_months':
      elements.push(
        { type: 'sun', position: { x: 85, y: 5 }, color: '#FFDAB3', size: 65, animation: 'pulse', delay: 0, duration: 6 },
        { type: 'rainbow', position: { x: 10, y: 10 }, color: '#FFB3BA', size: 55, animation: 'pulse', delay: 0.5, duration: 8 },
        { type: 'elephant', position: { x: 20, y: 65 }, color: '#E6F3FF', size: 50, animation: 'bounce', delay: 1, duration: 5 },
        { type: 'giraffe', position: { x: 75, y: 55 }, color: '#FFDAB3', size: 48, animation: 'bounce-float', delay: 1.5, duration: 6 },
        { type: 'tree', position: { x: 5, y: 70 }, color: '#F0FFF8', size: 55, animation: 'swing', delay: 2, duration: 7 },
        { type: 'bird', position: { x: 60, y: 20 }, color: '#FFE6E8', size: 35, animation: 'float', delay: 2.5, duration: 12 },
        { type: 'apple', position: { x: 45, y: 75 }, color: '#FFB3BA', size: 30, animation: 'bounce', delay: 3, duration: 4 },
        { type: 'flower', position: { x: 85, y: 70 }, color: '#FFB3BA', size: 35, animation: 'wiggle', delay: 3.5, duration: 5 },
        { type: 'cloud', position: { x: 35, y: 15 }, color: '#E6F3FF', size: 50, animation: 'float', delay: 4, duration: 15 }
      )
      break

    case 'nine_months':
    case 'ten_months':
    case 'eleven_months':
      elements.push(
        { type: 'sun', position: { x: 80, y: 8 }, color: '#FFDAB3', size: 60, animation: 'pulse', delay: 0, duration: 7 },
        { type: 'rainbow', position: { x: 15, y: 10 }, color: '#FFB3BA', size: 50, animation: 'pulse', delay: 0.5, duration: 9 },
        { type: 'duck', position: { x: 10, y: 55 }, color: '#FFF9E6', size: 45, animation: 'swing', delay: 1, duration: 5 },
        { type: 'fish', position: { x: 70, y: 60 }, color: '#E6F3FF', size: 40, animation: 'swing', delay: 1.5, duration: 6 },
        { type: 'teddy', position: { x: 30, y: 30 }, color: '#FFDAB3', size: 55, animation: 'bounce', delay: 2, duration: 4 },
        { type: 'bunny', position: { x: 60, y: 35 }, color: '#FFE6E8', size: 45, animation: 'bounce-float', delay: 2.5, duration: 5 },
        { type: 'tree', position: { x: 85, y: 65 }, color: '#F0FFF8', size: 50, animation: 'swing', delay: 3, duration: 7 },
        { type: 'banana', position: { x: 40, y: 75 }, color: '#FFF9E6', size: 35, animation: 'bounce', delay: 3.5, duration: 4 },
        { type: 'cloud', position: { x: 5, y: 20 }, color: '#E6F3FF', size: 45, animation: 'float', delay: 4, duration: 18 }
      )
      break

    case 'one_year':
      elements.push(
        { type: 'sun', position: { x: 85, y: 5 }, color: '#FFDAB3', size: 65, animation: 'pulse', delay: 0, duration: 6 },
        { type: 'rainbow', position: { x: 10, y: 8 }, color: '#FFB3BA', size: 60, animation: 'pulse', delay: 0.5, duration: 8 },
        { type: 'dog', position: { x: 15, y: 60 }, color: '#FFDAB3', size: 50, animation: 'bounce', delay: 1, duration: 5 },
        { type: 'cat', position: { x: 70, y: 55 }, color: '#FFE6E8', size: 48, animation: 'bounce-float', delay: 1.5, duration: 6 },
        { type: 'pig', position: { x: 40, y: 70 }, color: '#FFB3BA', size: 45, animation: 'bounce', delay: 2, duration: 4 },
        { type: 'sheep', position: { x: 85, y: 30 }, color: '#FFE6E8', size: 40, animation: 'float', delay: 2.5, duration: 9 },
        { type: 'cow', position: { x: 5, y: 40 }, color: '#FFF9E6', size: 45, animation: 'swing', delay: 3, duration: 7 },
        { type: 'tree', position: { x: 55, y: 20 }, color: '#F0FFF8', size: 55, animation: 'swing', delay: 3.5, duration: 8 },
        { type: 'balloon', position: { x: 30, y: 15 }, color: '#FFB3BA', size: 40, animation: 'float', delay: 4, duration: 12 },
        { type: 'butterfly', position: { x: 65, y: 45 }, color: '#FFB3BA', size: 32, animation: 'drift', delay: 4.5, duration: 10 }
      )
      break

    case 'toddler':
    default:
      elements.push(
        { type: 'sun', position: { x: 80, y: 5 }, color: '#FFDAB3', size: 70, animation: 'pulse', delay: 0, duration: 7 },
        { type: 'rainbow', position: { x: 10, y: 10 }, color: '#FFB3BA', size: 65, animation: 'pulse', delay: 0.5, duration: 9 },
        { type: 'elephant', position: { x: 15, y: 65 }, color: '#E6F3FF', size: 55, animation: 'bounce', delay: 1, duration: 5 },
        { type: 'giraffe', position: { x: 75, y: 50 }, color: '#FFDAB3', size: 50, animation: 'bounce-float', delay: 1.5, duration: 6 },
        { type: 'tree', position: { x: 5, y: 70 }, color: '#F0FFF8', size: 60, animation: 'swing', delay: 2, duration: 8 },
        { type: 'tree', position: { x: 88, y: 65 }, color: '#F0FFF8', size: 55, animation: 'swing', delay: 2.5, duration: 9 },
        { type: 'dog', position: { x: 35, y: 55 }, color: '#FFDAB3', size: 48, animation: 'bounce', delay: 3, duration: 4 },
        { type: 'cat', position: { x: 55, y: 30 }, color: '#FFE6E8', size: 45, animation: 'bounce-float', delay: 3.5, duration: 5 },
        { type: 'duck', position: { x: 25, y: 20 }, color: '#FFF9E6', size: 40, animation: 'swing', delay: 4, duration: 6 },
        { type: 'fish', position: { x: 65, y: 75 }, color: '#E6F3FF', size: 35, animation: 'swing', delay: 4.5, duration: 7 },
        { type: 'mushroom', position: { x: 45, y: 75 }, color: '#FFB3BA', size: 35, animation: 'bounce', delay: 5, duration: 5 },
        { type: 'apple', position: { x: 80, y: 25 }, color: '#FFB3BA', size: 30, animation: 'bounce', delay: 5.5, duration: 4 },
        { type: 'butterfly', position: { x: 50, y: 40 }, color: '#FFB3BA', size: 35, animation: 'drift', delay: 6, duration: 11 },
        { type: 'cloud', position: { x: 30, y: 10 }, color: '#E6F3FF', size: 50, animation: 'float', delay: 6.5, duration: 20 }
      )
      break
  }

  return elements
}

const stageConfigs: Record<MonthStage, StageConfig> = {
  newborn: {
    stage: 'newborn',
    ageRange: { min: 0, max: 0 },
    label: '新生儿',
    description: '0-1个月的宝宝需要特别的呵护。这个阶段的宝宝大部分时间都在睡眠中，视觉和听觉正在快速发展。',
    animationElements: [],
    recommendedMilestones: ['眼神追随', '对声音有反应', '吸吮反射'],
    colorScheme: { primary: '#FFE6E8', secondary: '#E6F3FF', accent: '#FFF9E6' }
  },
  one_month: {
    stage: 'one_month',
    ageRange: { min: 1, max: 1 },
    label: '1个月',
    description: '宝宝开始探索世界。宝宝的视觉范围扩大，开始对人脸产生更多的表情。',
    animationElements: [],
    recommendedMilestones: ['抬头', '微笑反应', '手脚活动增加'],
    colorScheme: { primary: '#FFE6E8', secondary: '#FFDAB3', accent: '#FFB3BA' }
  },
  two_months: {
    stage: 'two_months',
    ageRange: { min: 2, max: 2 },
    label: '2个月',
    description: '宝宝开始展现更多表情。宝宝开始发出咕咕声，开始与周围世界交流。',
    animationElements: [],
    recommendedMilestones: ['发出咕咕声', '眼神交流', '双手握拳放松'],
    colorScheme: { primary: '#E6F3FF', secondary: '#FFB3BA', accent: '#FFF9E6' }
  },
  three_months: {
    stage: 'three_months',
    ageRange: { min: 3, max: 3 },
    label: '3个月',
    description: '宝宝开始翻身的准备阶段。颈部力量增强，开始尝试翻身。',
    animationElements: [],
    recommendedMilestones: ['翻身准备', '抓握物品', '咯咯笑'],
    colorScheme: { primary: '#FFDAB3', secondary: '#FFB3BA', accent: '#E6F3FF' }
  },
  four_months: {
    stage: 'four_months',
    ageRange: { min: 4, max: 4 },
    label: '4个月',
    description: '宝宝开始认识世界。对自己的名字有反应，喜欢玩手。',
    animationElements: [],
    recommendedMilestones: ['翻身', '大笑', '对名字有反应'],
    colorScheme: { primary: '#E6F3FF', secondary: '#F0FFF8', accent: '#FFDAB3' }
  },
  five_months: {
    stage: 'five_months',
    ageRange: { min: 5, max: 5 },
    label: '5个月',
    description: '宝宝开始坐立准备。背部力量增强，可以支撑坐姿。',
    animationElements: [],
    recommendedMilestones: ['坐立辅助', '传递物品', '发出辅音'],
    colorScheme: { primary: '#FFDAB3', secondary: '#FFF9E6', accent: '#FFB3BA' }
  },
  six_months: {
    stage: 'six_months',
    ageRange: { min: 6, max: 6 },
    label: '6个月',
    description: '宝宝开始添加辅食。可以独坐，开始吃糊状食物。',
    animationElements: [],
    recommendedMilestones: ['独坐', '吃辅食', '模仿声音'],
    colorScheme: { primary: '#FFDAB3', secondary: '#E6F3FF', accent: '#F0FFF8' }
  },
  seven_months: {
    stage: 'seven_months',
    ageRange: { min: 7, max: 7 },
    label: '7个月',
    description: '宝宝开始爬行准备。腹部着地，用手臂支撑。',
    animationElements: [],
    recommendedMilestones: ['爬行准备', '拍手', '理解简单词语'],
    colorScheme: { primary: '#FFDAB3', secondary: '#FFB3BA', accent: '#E6F3FF' }
  },
  eight_months: {
    stage: 'eight_months',
    ageRange: { min: 8, max: 8 },
    label: '8个月',
    description: '宝宝开始探索周围环境。可以爬行，扶站。',
    animationElements: [],
    recommendedMilestones: ['爬行', '扶站', '分离焦虑开始'],
    colorScheme: { primary: '#E6F3FF', secondary: '#F0FFF8', accent: '#FFDAB3' }
  },
  nine_months: {
    stage: 'nine_months',
    ageRange: { min: 9, max: 9 },
    label: '9个月',
    description: '宝宝开始学步准备。可以扶走，挥手再见。',
    animationElements: [],
    recommendedMilestones: ['扶走', '挥手再见', '指向物品'],
    colorScheme: { primary: '#FFDAB3', secondary: '#FFB3BA', accent: '#F0FFF8' }
  },
  ten_months: {
    stage: 'ten_months',
    ageRange: { min: 10, max: 10 },
    label: '10个月',
    description: '宝宝开始独立站。可以独站片刻，说简单单词。',
    animationElements: [],
    recommendedMilestones: ['独站', '说单词', '用手势交流'],
    colorScheme: { primary: '#FFDAB3', secondary: '#E6F3FF', accent: '#FFF9E6' }
  },
  eleven_months: {
    stage: 'eleven_months',
    ageRange: { min: 11, max: 11 },
    label: '11个月',
    description: '宝宝即将迈出第一步。可以牵手走，理解指令。',
    animationElements: [],
    recommendedMilestones: ['牵手走', '理解指令', '模仿动作'],
    colorScheme: { primary: '#FFB3BA', secondary: '#E6F3FF', accent: '#F0FFF8' }
  },
  one_year: {
    stage: 'one_year',
    ageRange: { min: 12, max: 17 },
    label: '1-1.5岁',
    description: '宝宝开始独立行走。可以独走，说多个单词，自己吃饭。',
    animationElements: [],
    recommendedMilestones: ['独走', '说多个单词', '自己吃饭'],
    colorScheme: { primary: '#FFDAB3', secondary: '#E6F3FF', accent: '#FFB3BA' }
  },
  toddler: {
    stage: 'toddler',
    ageRange: { min: 18, max: 36 },
    label: '1.5-3岁',
    description: '宝宝进入幼儿期。可以跑跳，说短句，社交能力发展。',
    animationElements: [],
    recommendedMilestones: ['跑跳', '说短句', '社交能力发展'],
    colorScheme: { primary: '#E6F3FF', secondary: '#F0FFF8', accent: '#FFDAB3' }
  }
}

const currentStage = computed<StageConfig>(() => {
  const ageMonths = babyService.calculateAgeMonths(props.baby.birthDate)
  
  for (const [key, config] of Object.entries(stageConfigs)) {
    if (ageMonths >= config.ageRange.min && ageMonths <= config.ageRange.max) {
      stageConfigs[key as MonthStage].animationElements = generateElementsForStage(key as MonthStage)
      return stageConfigs[key as MonthStage]
    }
  }
  
  stageConfigs.toddler.animationElements = generateElementsForStage('toddler')
  return stageConfigs.toddler
})

const getAnimationClass = (animation: string) => {
  switch (animation) {
    case 'float': return 'animate-float'
    case 'bounce': return 'animate-bounce-soft'
    case 'bounce-float': return 'animate-bounce-float'
    case 'pulse': return 'animate-pulse-gentle'
    case 'wiggle': return 'animate-wiggle'
    case 'spin': return 'animate-spin-gentle'
    case 'swing': return 'animate-swing'
    case 'drift': return 'animate-drift'
    default: return 'animate-float'
  }
}

const getElementIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    cloud: '☁️',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    flower: '🌸',
    butterfly: '🦋',
    teddy: '🧸',
    balloon: '🎈',
    rainbow: '🌈',
    bunny: '🐰',
    elephant: '🐘',
    giraffe: '🦒',
    leaf: '🍃',
    sprout: '🌱',
    tree: '🌳',
    heart: '💖',
    starfish: '⭐',
    bird: '🐦',
    fish: '🐟',
    duck: '🦆',
    cow: '🐄',
    pig: '🐷',
    sheep: '🐑',
    cat: '🐱',
    dog: '🐶',
    apple: '🍎',
    banana: '🍌',
    cherry: '🍒',
    mushroom: '🍄'
  }
  return iconMap[type] || '✨'
}

const toggleStageInfo = () => {
  showStageInfo.value = !showStageInfo.value
}

watch(
  () => props.baby,
  () => {
    animationElements.value = currentStage.value.animationElements
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  animationElements.value = currentStage.value.animationElements
})
</script>

<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      v-for="(element, index) in animationElements"
      :key="index"
      :class="getAnimationClass(element.animation)"
      class="absolute transition-all duration-1000 ease-in-out"
      :style="{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        fontSize: `${element.size}px`,
        opacity: 0.12,
        animationDelay: `${element.delay}s`,
        animationDuration: `${element.duration}s`,
        zIndex: 0,
        willChange: 'transform'
      }"
    >
      {{ getElementIcon(element.type) }}
    </div>
  </div>
</template>

<style scoped>
.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-bounce-soft {
  animation: bounce-soft 4s ease-in-out infinite;
}

.animate-bounce-float {
  animation: bounce-float 3s ease-in-out infinite;
}

.animate-pulse-gentle {
  animation: pulse-gentle 6s ease-in-out infinite;
}

.animate-wiggle {
  animation: wiggle 5s ease-in-out infinite;
}

.animate-spin-gentle {
  animation: spin-gentle 15s linear infinite;
}

.animate-swing {
  animation: swing 4s ease-in-out infinite;
}

.animate-drift {
  animation: drift 10s ease-in-out infinite;
}
</style>
