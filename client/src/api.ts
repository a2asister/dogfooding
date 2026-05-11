import type { Character, CollectionStats } from './types';

const API_BASE = '/api';

export async function getAllCharacters(): Promise<Character[]> {
  const response = await fetch(`${API_BASE}/characters`);
  if (!response.ok) {
    throw new Error('Failed to fetch characters');
  }
  return response.json();
}

export async function getCollectedIds(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/collections/collected-ids`);
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function collectCharacter(characterId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/collections/${characterId}/collect`, {
    method: 'POST',
  });
  return response.ok;
}

export async function checkCollected(characterId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/collections/${characterId}/check`);
  if (!response.ok) {
    return false;
  }
  return response.json();
}

export async function getCollectionStats(): Promise<CollectionStats> {
  const response = await fetch(`${API_BASE}/collections/stats`);
  if (!response.ok) {
    return { total: 0, collected: 0 };
  }
  return response.json();
}
