export type Rarity = 'normal' | 'rare' | 'legendary';

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: Rarity;
  element: string;
  gridPosition: number;
  isUnlocked: boolean;
  createdAt: string;
}

export interface CollectionStats {
  total: number;
  collected: number;
}
