export interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  points: number;
  isUnlocked: boolean;
  question: {
    type: string;
    content: string;
    options?: string[];
    answer: string;
    hints?: string[];
  };
}

export interface Score {
  id: number;
  totalPoints: number;
  completedLevels: number;
  streak: number;
  lastPlayedAt: string;
}

export interface WrongAnswer {
  id: number;
  levelId: number;
  userAnswer: string;
  correctAnswer: string;
  question: string;
  createdAt: string;
}

export interface DailyPractice {
  id: number;
  date: string;
  levelsCompleted: number;
  pointsEarned: number;
  timeSpent: number;
}
