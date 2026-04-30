const API_BASE = '/api'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = options?.body
    ? { 'Content-Type': 'application/json' }
    : {}
  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}
