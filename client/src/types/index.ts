export interface Book {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  pages: string[];
  totalPages: number;
  author: string;
  category?: string;
  isPublic: boolean;
  isShared?: boolean;
  shareCode?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  createdAt: string;
}

export interface ReadingProgress {
  id: string;
  currentPage: number;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  bookId: string;
  userId: string;
  book?: Book;
  user?: User;
}

export interface FlipState {
  isFlipping: boolean;
  currentPage: number;
  progress: number;
  direction: 'next' | 'prev' | null;
}
