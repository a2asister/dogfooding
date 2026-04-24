import type { Equipment } from '../types';

export const equipments: Equipment[] = [
  {
    id: 'fuel',
    name: '燃料',
    description: '燃料是火力发电的能量来源，常见的有煤炭、天然气、石油等。燃料在锅炉中燃烧，释放出化学能转化为热能。',
    simpleDescription: '燃料就像发电的"食物"！把煤炭、天然气这些"食物"放进锅炉里烧，就能产生热量啦~',
    position: { x: 10, y: 40 },
    size: { width: 80, height: 80 },
    icon: 'Flame',
    color: 'primary-orange',
    flowStep: 1
  },
  {
    id: 'boiler',
    name: '锅炉',
    description: '锅炉是一个大型的压力容器，燃料在锅炉内燃烧产生高温火焰和烟气，通过热传递将水加热变成高温高压的蒸汽。',
    simpleDescription: '锅炉就是个"超级大水壶"！燃料在里面燃烧，把水烧开变成滚烫的蒸汽，就像家里烧水产生水蒸气一样~',
    position: { x: 30, y: 35 },
    size: { width: 100, height: 100 },
    icon: 'Kettle',
    color: 'primary-blue',
    flowStep: 2
  },
  {
    id: 'turbine',
    name: '汽轮机',
    description: '汽轮机由固定的喷嘴和转动的叶片组成。高温高压的蒸汽通过喷嘴加速后冲击叶片，使转子高速旋转，将蒸汽的热能转化为机械能。',
    simpleDescription: '汽轮机就像个"超级大风车"！蒸汽吹动叶片让它转起来，就像风吹动风车一样，不过这个"风车"转得特别快哦~',
    position: { x: 55, y: 40 },
    size: { width: 90, height: 90 },
    icon: 'Wind',
    color: 'primary-light-blue',
    flowStep: 3
  },
  {
    id: 'generator',
    name: '发电机',
    description: '发电机主要由定子和转子组成。汽轮机带动发电机的转子旋转，转子上的磁场随转子一起转动，切割定子线圈，根据电磁感应原理产生电流。',
    simpleDescription: '发电机就是发电的"核心机器"！汽轮机带着它转呀转，利用"电磁感应"原理，就产生了我们家里用的电~',
    position: { x: 75, y: 40 },
    size: { width: 85, height: 85 },
    icon: 'Zap',
    color: 'primary-orange',
    flowStep: 4
  },
  {
    id: 'transformer',
    name: '变压器',
    description: '变压器用于改变电压等级。发电机发出的电压较低，需要通过升压变压器升高电压，以便远距离输送，减少输电线路上的能量损耗。',
    simpleDescription: '变压器就像电的"快递打包员"！把电压"打包"升高，这样电就能跑很远的路送到家家户户啦~',
    position: { x: 90, y: 40 },
    size: { width: 75, height: 75 },
    icon: 'Plug',
    color: 'primary-blue',
    flowStep: 5
  }
];
