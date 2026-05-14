export interface Question {
  id: number
  text: string
  options: Array<{ text: string; score: number }>
}

export const questions: Question[] = [
  {
    id: 1,
    text: '在社交聚会中，你通常是怎样的？',
    options: [
      { text: '非常活跃，喜欢成为焦点', score: 4 },
      { text: '比较主动，会和多人交流', score: 3 },
      { text: '比较被动，只和熟悉的人说话', score: 2 },
      { text: '喜欢独处，尽量避免过多社交', score: 1 }
    ]
  },
  {
    id: 2,
    text: '面对压力和挑战时，你的反应是？',
    options: [
      { text: '非常冷静，理性分析解决', score: 4 },
      { text: '有点紧张，但能应对', score: 3 },
      { text: '容易焦虑，需要时间调整', score: 2 },
      { text: '很容易情绪化，感到崩溃', score: 1 }
    ]
  },
  {
    id: 3,
    text: '做决定时，你更倾向于？',
    options: [
      { text: '凭直觉快速决定', score: 4 },
      { text: '参考他人意见后决定', score: 3 },
      { text: '仔细分析利弊再决定', score: 2 },
      { text: '很难做决定，经常犹豫', score: 1 }
    ]
  },
  {
    id: 4,
    text: '你的日常作息和生活习惯是？',
    options: [
      { text: '非常规律，按计划行事', score: 4 },
      { text: '比较规律，有大致安排', score: 3 },
      { text: '不太规律，随性而为', score: 2 },
      { text: '完全随性，没有固定习惯', score: 1 }
    ]
  },
  {
    id: 5,
    text: '当朋友向你倾诉烦恼时，你会？',
    options: [
      { text: '耐心倾听并给予建议', score: 4 },
      { text: '认真倾听，表示理解', score: 3 },
      { text: '听完后转移话题', score: 2 },
      { text: '感到不耐烦，想结束对话', score: 1 }
    ]
  },
  {
    id: 6,
    text: '你对新环境和新事物的适应能力如何？',
    options: [
      { text: '非常快，很快就能融入', score: 4 },
      { text: '比较快，需要一点时间', score: 3 },
      { text: '比较慢，需要较长时间', score: 2 },
      { text: '非常慢，很难适应', score: 1 }
    ]
  }
]

export const temperamentMap: Record<string, { name: string; description: string; tags: string[]; colors: string[] }> = {
  sanguine: {
    name: '多血质',
    description: '你活泼好动、善于交际、思维敏捷、容易接受新事物，但注意力容易转移、兴趣容易变换。你像春天一样充满活力，给周围的人带来快乐和温暖。',
    tags: ['活泼', '开朗', '善交际', '敏捷', '乐观'],
    colors: ['#FF6B6B', '#FFE66D', '#4ECDC4']
  },
  choleric: {
    name: '胆汁质',
    description: '你坦率热情、精力旺盛、容易冲动、脾气急躁，但勇敢果断、行动力强。你像夏天一样热烈，有着强大的能量和爆发力。',
    tags: ['热情', '果断', '勇敢', '直率', '精力充沛'],
    colors: ['#FF4757', '#FF6348', '#FFA502']
  },
  melancholic: {
    name: '抑郁质',
    description: '你心思细腻、观察力敏锐、情感体验深刻、善于觉察别人不易觉察到的细小事物。你像秋天一样深沉内敛，有着丰富的内心世界。',
    tags: ['细腻', '敏锐', '深刻', '内敛', '敏感'],
    colors: ['#5352ED', '#70A1FF', '#A29BFE']
  },
  phlegmatic: {
    name: '粘液质',
    description: '你安静稳重、反应缓慢、沉默寡言、情绪不易外露，但善于忍耐、考虑问题全面细致。你像冬天一样沉稳冷静，给人一种可靠的安全感。',
    tags: ['稳重', '冷静', '耐心', '细致', '可靠'],
    colors: ['#00B894', '#00CEC9', '#81ECEC']
  }
}

export function calculateResult(scores: number[]) {
  const totalScore = scores.reduce((a, b) => a + b, 0)
  const avgScore = totalScore / scores.length
  
  let temperament: string
  if (avgScore >= 3.5) {
    temperament = 'sanguine'
  } else if (avgScore >= 2.8) {
    temperament = 'choleric'
  } else if (avgScore >= 2.0) {
    temperament = 'phlegmatic'
  } else {
    temperament = 'melancholic'
  }
  
  const temperamentData = temperamentMap[temperament]
  const dimensions = {
    '外向性': Math.round((avgScore / 4) * 100),
    '情绪稳定性': Math.round((avgScore / 4) * 90 + 10),
    '决断力': Math.round((avgScore / 4) * 85 + 15),
    '细致度': Math.round((1 - avgScore / 4) * 70 + 30)
  }
  
  return {
    temperament,
    temperamentName: temperamentData.name,
    description: temperamentData.description,
    tags: temperamentData.tags,
    colors: temperamentData.colors,
    scores: dimensions
  }
}
