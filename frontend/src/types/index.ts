export interface Clothing {
  id: string;
  name: string;
  category: string;
  colors: string[];
  imagePath: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  clothingItems: Clothing[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Preference {
  id: string;
  favoriteColors: string[];
  preferredStyles: string[];
  colorScheme: string;
  createdAt: string;
  updatedAt: string;
}
