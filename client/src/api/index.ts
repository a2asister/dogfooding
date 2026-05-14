const API_BASE = 'http://localhost:4873/api'

export async function saveAssessment(userId: string, answers: any[], result: any) {
  const response = await fetch(`${API_BASE}/assessment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, answers, result })
  })
  return response.json()
}

export async function getHistory(userId: string) {
  const response = await fetch(`${API_BASE}/assessment/history?userId=${encodeURIComponent(userId)}`)
  return response.json()
}

export async function getTagStats(userId: string) {
  const response = await fetch(`${API_BASE}/assessment/tag-stats?userId=${encodeURIComponent(userId)}`)
  return response.json()
}
