const API_BASE = '/api'

async function request(url, options = {}) {
  const response = await fetch(API_BASE + url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export function getNotes(params = {}) {
  const queryString = new URLSearchParams(params).toString()
  return request(`/notes${queryString ? '?' + queryString : ''}`)
}

export function createNote(noteData) {
  return request('/notes', {
    method: 'POST',
    body: JSON.stringify(noteData)
  })
}

export function updateNote(id, noteData) {
  return request(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noteData)
  })
}

export function deleteNote(id) {
  return request(`/notes/${id}`, {
    method: 'DELETE'
  })
}

export function batchDeleteNotes(ids) {
  return request('/notes/batch-delete', {
    method: 'POST',
    body: JSON.stringify({ ids })
  })
}

export function batchArchiveNotes(ids, archive = true) {
  return request('/notes/batch-archive', {
    method: 'POST',
    body: JSON.stringify({ ids, archive })
  })
}

export function getTags() {
  return request('/tags')
}

export function createTag(tag) {
  return request('/tags', {
    method: 'POST',
    body: JSON.stringify({ tag })
  })
}

export function deleteTag(tag) {
  return request(`/tags/${encodeURIComponent(tag)}`, {
    method: 'DELETE'
  })
}
