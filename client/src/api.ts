import type { User } from './types';

const API_BASE = '/api';

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function followUser(
  id: string
): Promise<{ success: boolean; following: boolean; followerCount: number }> {
  const res = await fetch(`${API_BASE}/follow/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to follow user');
  return res.json();
}

export async function unfollowUser(
  id: string
): Promise<{ success: boolean; following: boolean; followerCount: number }> {
  const res = await fetch(`${API_BASE}/follow/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to unfollow user');
  return res.json();
}
