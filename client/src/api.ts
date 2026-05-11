const API_BASE = '/api';

export interface KnowledgeNodeData {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  isLearned: boolean;
  orderIndex: number;
}

export async function fetchKnowledgeTree(): Promise<KnowledgeNodeData[]> {
  const response = await fetch(`${API_BASE}/knowledge`);
  if (!response.ok) {
    throw new Error('Failed to fetch knowledge tree');
  }
  return response.json();
}

export async function updateLearnStatus(id: number, isLearned: boolean): Promise<KnowledgeNodeData> {
  const response = await fetch(`${API_BASE}/knowledge/${id}/learn`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isLearned }),
  });
  if (!response.ok) {
    throw new Error('Failed to update learn status');
  }
  return response.json();
}
