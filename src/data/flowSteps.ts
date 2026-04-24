import type { FlowStep } from '../types';

export const flowSteps: FlowStep[] = [
  {
    id: 'step-1',
    name: '添加燃料',
    description: '把煤炭或天然气送进锅炉的炉膛里，就像给大水壶添柴火~',
    equipmentId: 'fuel',
    animationKey: 'fuel'
  },
  {
    id: 'step-2',
    name: '锅炉加热',
    description: '燃料在锅炉里燃烧，产生高温火焰，把水管里的水烧开变成蒸汽！',
    equipmentId: 'boiler',
    animationKey: 'boiler'
  },
  {
    id: 'step-3',
    name: '推动汽轮机',
    description: '高温高压的蒸汽喷向汽轮机的叶片，让转子高速旋转起来！',
    equipmentId: 'turbine',
    animationKey: 'turbine'
  },
  {
    id: 'step-4',
    name: '发电机发电',
    description: '汽轮机带动发电机一起转动，利用电磁感应原理产生电流！',
    equipmentId: 'generator',
    animationKey: 'generator'
  },
  {
    id: 'step-5',
    name: '升压输送',
    description: '电压经过变压器升高，通过高压输电线送到千家万户！',
    equipmentId: 'transformer',
    animationKey: 'transformer'
  }
];
