import { Note } from '../entities/Note';

export interface HotScoreConfig {
  likeWeight: number;
  favoriteWeight: number;
  commentWeight: number;
  shareWeight: number;
  viewWeight: number;
  timeDecay: number;
}

const defaultConfig: HotScoreConfig = {
  likeWeight: 1.0,
  favoriteWeight: 1.5,
  commentWeight: 2.0,
  shareWeight: 2.5,
  viewWeight: 0.1,
  timeDecay: 0.05,
};

export const calculateHotScore = (note: Note, config: Partial<HotScoreConfig> = {}): number => {
  const mergedConfig = { ...defaultConfig, ...config };
  
  const now = new Date();
  const createdAt = new Date(note.createdAt);
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  const baseScore =
    note.likeCount * mergedConfig.likeWeight +
    note.favoriteCount * mergedConfig.favoriteWeight +
    note.commentCount * mergedConfig.commentWeight +
    note.shareCount * mergedConfig.shareWeight +
    note.viewCount * mergedConfig.viewWeight;

  const timeDecayFactor = Math.exp(-mergedConfig.timeDecay * hoursSinceCreation);

  const hotScore = baseScore * timeDecayFactor;

  return Math.round(hotScore * 100) / 100;
};

export const updateHotScores = async (notes: Note[]): Promise<Note[]> => {
  return notes.map(note => {
    note.hotScore = calculateHotScore(note);
    return note;
  });
};
