const API_BASE = 'http://127.0.0.1:18089/api';

export const notificationApi = {
  async getNotifications(page = 1, pageSize = 20) {
    const response = await fetch(
      `${API_BASE}/notifications?page=${page}&pageSize=${pageSize}`
    );
    return response.json();
  },

  async markAsRead(id) {
    const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT'
    });
    return response.json();
  },

  async markAllAsRead() {
    const response = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT'
    });
    return response.json();
  },

  async deleteNotification(id) {
    const response = await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  async batchDelete(ids) {
    const response = await fetch(`${API_BASE}/notifications/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids })
    });
    return response.json();
  }
};
