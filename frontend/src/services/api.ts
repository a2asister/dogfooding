export interface Photo {
  id: number;
  url: string;
  title: string;
  albumId: number;
  depth: number;
}

export interface Album {
  id: number;
  name: string;
  cover: string | null;
  photos: Photo[];
}

export interface ViewHistoryItem {
  id: number;
  photoId: number;
  photoUrl: string;
  photoTitle: string;
  viewedAt: string;
}

const API_BASE = 'http://localhost:4321/api';

export const api = {
  async getAlbums(): Promise<Album[]> {
    const response = await fetch(`${API_BASE}/albums`);
    if (!response.ok) {
      throw new Error('Failed to fetch albums');
    }
    return response.json();
  },

  async getAlbum(id: number): Promise<Album> {
    const response = await fetch(`${API_BASE}/albums/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch album');
    }
    return response.json();
  },

  async createAlbum(data: { name: string; cover?: string }): Promise<Album> {
    const response = await fetch(`${API_BASE}/albums`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create album');
    }
    return response.json();
  },

  async updateAlbum(id: number, data: { name?: string; cover?: string }): Promise<Album> {
    const response = await fetch(`${API_BASE}/albums/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update album');
    }
    return response.json();
  },

  async addPhoto(albumId: number, data: { url: string; title: string; depth?: number }): Promise<Photo> {
    const response = await fetch(`${API_BASE}/albums/${albumId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to add photo');
    }
    return response.json();
  },

  async batchAddPhotos(albumId: number, photos: Array<{ url: string; title: string; depth?: number }>): Promise<Photo[]> {
    const response = await fetch(`${API_BASE}/albums/${albumId}/photos/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photos),
    });
    if (!response.ok) {
      throw new Error('Failed to batch add photos');
    }
    return response.json();
  },

  async getViewHistory(limit = 10): Promise<ViewHistoryItem[]> {
    const response = await fetch(`${API_BASE}/view-history?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch view history');
    }
    return response.json();
  },

  async addViewHistory(data: { photoId: number; photoUrl: string; photoTitle: string }): Promise<ViewHistoryItem> {
    const response = await fetch(`${API_BASE}/view-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to add view history');
    }
    return response.json();
  },

  async clearViewHistory(): Promise<void> {
    const response = await fetch(`${API_BASE}/view-history`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to clear view history');
    }
  },
};
