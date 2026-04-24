import type { QuizQuestion, Badge } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: '火力发电中，燃料在哪里燃烧？',
    options: ['汽轮机', '锅炉', '发电机', '变压器'],
    correctAnswer: 1,
    explanation: '燃料在锅炉中燃烧，产生的热量用来把水变成蒸汽。锅炉就像一个超级大水壶！'
  },
  {
    id: 'q2',
    question: '以下哪个是火力发电的正确流程？',
    options: [
      '燃料燃烧→蒸汽推动汽轮机→发电机发电→升压输送',
      '发电机发电→燃料燃烧→蒸汽推动汽轮机→升压输送',
      '升压输送→燃料燃烧→蒸汽推动汽轮机→发电机发电',
      '燃料燃烧→发电机发电→蒸汽推动汽轮机→升压输送'
    ],
    correctAnswer: 0,
    explanation: '正确流程是：燃料燃烧产生热量→热量把水变成蒸汽→蒸汽推动汽轮机转动→汽轮机带动发电机发电→电经过升压后送到电网。'
  },
  {
    id: 'q3',
    question: '汽轮机的作用是什么？',
    options: [
      '把水变成蒸汽',
      '把蒸汽的热能转化为旋转的机械能',
      '直接发电',
      '把电压升高'
    ],
    correctAnswer: 1,
    explanation: '汽轮机就像一个超级大风车，蒸汽吹动叶片让它旋转，把蒸汽的热能转化为转子旋转的机械能。'
  },
  {
    id: 'q4',
    question: '发电机发电的原理是什么？',
    options: [
      '燃烧发电',
      '电磁感应',
      '化学反应',
      '摩擦起电'
    ],
    correctAnswer: 1,
    explanation: '发电机利用电磁感应原理发电。汽轮机带动转子旋转，转子上的磁场穿过定子线圈，在线圈中产生感应电流。'
  },
  {
    id: 'q5',
    question: '为什么输电要使用高电压？',
    options: [
      '高电压更安全',
      '高电压可以减少输电线路上的能量损耗',
      '高电压更容易产生',
      '高电压速度更快'
    ],
    correctAnswer: 1,
    explanation: '同样的功率，电压越高，电流就越小。电流小了，输电线路上的发热损耗就会大大减少。这就像用大卡车运货比小电驴效率更高一样！'
  },
  {
    id: 'q6',
    question: '以下哪种不是火力发电常用的燃料？',
    options: ['煤炭', '天然气', '太阳能', '重油'],
    correctAnswer: 2,
    explanation: '太阳能是清洁能源，不是化石燃料，不属于火力发电的燃料。火力发电常用的燃料有煤炭、天然气、石油产品等。'
  },
  {
    id: 'q7',
    question: '火电厂排放的哪种气体是主要的温室气体？',
    options: ['氧气', '二氧化碳', '氮气', '水蒸气'],
    correctAnswer: 1,
    explanation: '二氧化碳（CO2）是主要的温室气体，会加剧全球变暖。这也是为什么我们要发展清洁能源的原因之一。'
  },
  {
    id: 'q8',
    question: '变压器的主要作用是什么？',
    options: [
      '发电',
      '改变电压等级',
      '储存电能',
      '消耗电能'
    ],
    correctAnswer: 1,
    explanation: '变压器的主要作用是改变电压等级。发电时升压以减少输送损耗，到用户端降压以保证安全使用。'
  },
  {
    id: 'q9',
    question: '现代超超临界火电机组的发电效率大约能达到多少？',
    options: ['20%左右', '30%左右', '45%-50%', '80%以上'],
    correctAnswer: 2,
    explanation: '传统火电机组效率约30%-40%，而先进的超超临界机组效率可以达到45%-50%，联合循环机组甚至能达到60%以上！'
  },
  {
    id: 'q10',
    question: '我们家里使用的交流电频率是多少？',
    options: ['25Hz', '50Hz', '100Hz', '220Hz'],
    correctAnswer: 1,
    explanation: '中国电网的交流电频率是50赫兹（Hz），意思是电流方向每秒变化50次。这是因为发电机每分钟转3000转，3000÷60×2=50Hz！'
  },
  {
    id: 'q11',
    question: '以下哪个设备不是火力发电的核心设备？',
    options: ['锅炉', '汽轮机', '发电机', '洗衣机'],
    correctAnswer: 3,
    explanation: '洗衣机是家用电器，不是发电设备。火力发电的核心三大设备是：锅炉、汽轮机、发电机，合称"三大主机"。'
  },
  {
    id: 'q12',
    question: '脱硫装置的作用是什么？',
    options: [
      '提高发电效率',
      '去除烟气中的硫化物，减少酸雨污染',
      '增加发电量',
      '降低噪音'
    ],
    correctAnswer: 1,
    explanation: '脱硫装置可以去除烟气中的硫化物（SOx），这些硫化物如果排放到大气中，会和水蒸气结合形成酸雨，对环境造成危害。'
  }
];

export const initialBadges: Badge[] = [
  {
    id: 'badge-1',
    name: '初学入门',
    description: '答对第一题',
    icon: 'Star',
    unlocked: false,
    requirement: '答对任意一道题'
  },
  {
    id: 'badge-2',
    name: '好学之士',
    description: '答对5道题',
    icon: 'BookOpen',
    unlocked: false,
    requirement: '累计答对5道题'
  },
  {
    id: 'badge-3',
    name: '电力达人',
    description: '答对10道题',
    icon: 'Zap',
    unlocked: false,
    requirement: '累计答对10道题'
  },
  {
    id: 'badge-4',
    name: '发电专家',
    description: '答对全部题目',
    icon: 'Trophy',
    unlocked: false,
    requirement: '答对全部12道题'
  },
  {
    id: 'badge-5',
    name: '探索者',
    description: '查看所有设备详情',
    icon: 'Compass',
    unlocked: false,
    requirement: '点击查看所有5个发电设备'
  },
  {
    id: 'badge-6',
    name: '学霸',
    description: '查看所有知识点',
    icon: 'GraduationCap',
    unlocked: false,
    requirement: '阅读所有6个知识点'
  }
];
