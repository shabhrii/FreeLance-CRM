import { supabase } from './supabase'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  let token = useAuthStore.getState().session?.access_token

  if (!token) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      token = session?.access_token
    } catch {}
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'API request failed')
  }

  // Handle empty responses (like for DELETE)
  const text = await response.text()
  return text ? JSON.parse(text) : null
}
