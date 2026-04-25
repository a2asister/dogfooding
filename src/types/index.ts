export interface Point {
  x: number;
  y: number;
}

export interface Chromosome {
  id: string;
  homologousPair: number;
  isMaternal: boolean;
  centromerePosition: Point;
  arms: {
    short: { start: Point; end: Point };
    long: { start: Point; end: Point };
  };
  hasCrossedOver: boolean;
  crossingOverSegments: { start: number; end: number; isMaternal: boolean }[];
  isVisible: boolean;
  opacity: number;
}

export interface Cell {
  id: string;
  position: Point;
  radius: number;
  isParent: boolean;
  isDaughter: boolean;
  isVisible: boolean;
}

export interface MeiosisPhase {
  id: string;
  name: string;
  description: string;
  annotations: string[];
  duration: number;
  order: number;
}

export interface AnimationState {
  currentPhaseId: string;
  phaseProgress: number;
  isPlaying: boolean;
  playbackSpeed: number;
  showAnnotations: boolean;
  isFullscreen: boolean;
}

export interface LocalStorageSettings {
  playbackSpeed: number;
  showAnnotations: boolean;
  lastViewedPhase: string;
}

export const MEIOSIS_PHASES: MeiosisPhase[] = [
  {
    id: 'interphase',
    name: '间期',
    description: '染色体复制，细胞准备减数分裂',
    annotations: ['染色体复制', 'DNA复制', '蛋白质合成'],
    duration: 3000,
    order: 0
  },
  {
    id: 'prophase1',
    name: '前期I',
    description: '同源染色体联会，交叉互换发生',
    annotations: ['同源染色体联会', '四分体形成', '交叉互换'],
    duration: 4000,
    order: 1
  },
  {
    id: 'metaphase1',
    name: '中期I',
    description: '同源染色体排列在赤道板上',
    annotations: ['同源染色体排列', '赤道板', '纺锤体附着'],
    duration: 2500,
    order: 2
  },
  {
    id: 'anaphase1',
    name: '后期I',
    description: '同源染色体分离，移向两极',
    annotations: ['同源染色体分离', '染色体数目减半', '纺锤丝缩短'],
    duration: 3000,
    order: 3
  },
  {
    id: 'telophase1',
    name: '末期I',
    description: '细胞质分裂，形成两个子细胞',
    annotations: ['细胞质分裂', '形成子细胞', '染色体数目减半'],
    duration: 2500,
    order: 4
  },
  {
    id: 'prophase2',
    name: '前期II',
    description: '染色体重新凝聚，纺锤体形成',
    annotations: ['染色体凝聚', '核膜消失', '纺锤体形成'],
    duration: 2000,
    order: 5
  },
  {
    id: 'metaphase2',
    name: '中期II',
    description: '染色体排列在赤道板上',
    annotations: ['染色体排列', '赤道板', '着丝点分裂准备'],
    duration: 2000,
    order: 6
  },
  {
    id: 'anaphase2',
    name: '后期II',
    description: '姐妹染色单体分离，移向两极',
    annotations: ['姐妹染色单体分离', '染色体移动', '着丝点分裂'],
    duration: 2500,
    order: 7
  },
  {
    id: 'telophase2',
    name: '末期II',
    description: '细胞质再次分裂，形成四个子细胞',
    annotations: ['细胞质分裂', '形成四个子细胞', '单倍体配子'],
    duration: 3000,
    order: 8
  }
] as const;

export const CHROMOSOME_COLORS = {
  maternal: '#E53935',
  maternalLight: '#FFCDD2',
  paternal: '#1E88E5',
  paternalLight: '#BBDEFB',
  centromere: '#FDD835',
  crossingOver: '#9C27B0'
} as const;

export const CELL_COLORS = {
  cytoplasm: '#F5F5F5',
  cytoplasmDark: '#E0E0E0',
  nucleus: '#F3E5F5',
  nucleusDark: '#CE93D8',
  membrane: '#616161',
  spindle: '#BDBDBD'
} as const;

export type MeiosisPhaseId = typeof MEIOSIS_PHASES[number]['id'];
