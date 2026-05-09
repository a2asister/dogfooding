import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  getAllData() {
    return api.get('/data').then(res => res.data)
  },
  
  getFolders() {
    return api.get('/folders').then(res => res.data)
  },
  
  createFolder(data) {
    return api.post('/folders', data).then(res => res.data)
  },
  
  updateFolder(id, data) {
    return api.put(`/folders/${id}`, data).then(res => res.data)
  },
  
  deleteFolder(id) {
    return api.delete(`/folders/${id}`).then(res => res.data)
  },
  
  getLists(folderId) {
    const params = folderId ? { folderId } : {}
    return api.get('/lists', { params }).then(res => res.data)
  },
  
  createList(data) {
    return api.post('/lists', data).then(res => res.data)
  },
  
  updateList(id, data) {
    return api.put(`/lists/${id}`, data).then(res => res.data)
  },
  
  deleteList(id) {
    return api.delete(`/lists/${id}`).then(res => res.data)
  },
  
  getTasks(params = {}) {
    return api.get('/tasks', { params }).then(res => res.data)
  },
  
  createTask(data) {
    return api.post('/tasks', data).then(res => res.data)
  },
  
  updateTask(id, data) {
    return api.put(`/tasks/${id}`, data).then(res => res.data)
  },
  
  deleteTask(id) {
    return api.delete(`/tasks/${id}`).then(res => res.data)
  },
  
  getStats(period = 'day') {
    return api.get('/stats', { params: { period } }).then(res => res.data)
  }
}
