export interface Radical {
  id: string;
  name: string;
  strokeCount: number;
  pathData: string;
  position: { x: number; y: number };
  isErrorProne?: boolean;
}

export interface Character {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  radicals: Radical[];
  totalStrokes: number;
  structure: string;
}

export interface PracticeRecord {
  id: string;
  characterId: string;
  character: string;
  timestamp: number;
  correct: boolean;
  errors: string[];
  duration: number;
}

export interface Note {
  id: string;
  characterId: string;
  content: string;
  timestamp: number;
}

export interface ErrorCharacter {
  id: string;
  characterId: string;
  character: string;
  errorCount: number;
  lastError: number;
}
