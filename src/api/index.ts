import { FoodItem, Stats, FoodCategory } from '../types'

const API_BASE = '/api'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function getFoods(category?: FoodCategory, month?: string): Promise<FoodItem[]> {
  let url = `${API_BASE}/foods`
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (month) params.append('month', month)
  if (params.toString()) url += `?${params.toString()}`
  return fetchJson<FoodItem[]>(url)
}

export async function getStats(): Promise<Stats> {
  return fetchJson<Stats>(`${API_BASE}/foods/stats`)
}

export async function createFood(food: Omit<FoodItem, 'id'>): Promise<FoodItem> {
  return fetchJson<FoodItem>(`${API_BASE}/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(food)
  })
}

export async function updateFood(id: string, data: Partial<FoodItem>): Promise<FoodItem> {
  return fetchJson<FoodItem>(`${API_BASE}/foods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export async function deleteFood(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/foods/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}
