export interface ColorScheme {
  id: string;
  name: string;
  colors: string[];
  description?: string;
  isFavorite: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateColorSchemeInput {
  name: string;
  colors: string[];
  description?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  isTemplate?: boolean;
}

export interface UpdateColorSchemeInput extends CreateColorSchemeInput {
  id: string;
}
