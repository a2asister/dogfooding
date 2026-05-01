export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  permissions: string[];
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'excel' | 'code' | 'text';
  content: string;
  vector: number[];
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

export interface VectorSearchResult {
  document: Document;
  similarity: number;
}

export interface AuthPayload {
  userId: string;
  username: string;
  role: string;
}
