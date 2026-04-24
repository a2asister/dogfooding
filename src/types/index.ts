export interface Equipment {
  id: string;
  name: string;
  description: string;
  simpleDescription: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  icon: string;
  color: string;
  flowStep: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirement: string;
}

export interface FlowStep {
  id: string;
  name: string;
  description: string;
  equipmentId: string;
  animationKey: string;
}
