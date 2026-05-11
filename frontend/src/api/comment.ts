import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Comment {
  id: string;
  content: string;
  author: string;
  parentId: string | null;
  path: string | null;
  depth: number;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  children: Comment[];
}

export interface CreateCommentInput {
  content: string;
  author: string;
  parentId?: string;
}

export async function getComments(): Promise<Comment[]> {
  const response = await api.get('/comments');
  return response.data;
}

export async function getComment(id: string): Promise<Comment> {
  const response = await api.get(`/comments/${id}`);
  return response.data;
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const response = await api.post('/comments', input);
  return response.data;
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/comments/${id}`);
}

export async function toggleLike(id: string): Promise<Comment> {
  const response = await api.post(`/comments/${id}/like`);
  return response.data;
}
