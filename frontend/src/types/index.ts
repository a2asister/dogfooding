export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  permissions: string[];
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'excel' | 'code' | 'text';
  content: string;
  tags: string[];
  ownerId: string;
  readPermissions: string[];
  writePermissions: string[];
  lifecycle: {
    status: 'draft' | 'review' | 'published' | 'archived';
    version: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    archivedAt?: string;
  };
  relatedDocs: string[];
}

export interface SearchResult {
  document: Document;
  similarity: number;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
}
