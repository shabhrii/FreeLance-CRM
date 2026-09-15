import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (url: string | undefined): boolean => {
  if (!url || url.includes('[') || url.includes('YOUR-PROJECT-REF')) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://placeholder.supabase.co'
const supabaseAnonKey = rawKey && !rawKey.includes('...') ? rawKey : 'placeholder-anon-key'

if (!isValidUrl(rawUrl)) {
  console.warn('VITE_SUPABASE_URL is not set or contains placeholders. Using placeholder client.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
