import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  setUser: (user: User | null, session: any | null) => void
  loginDemoUser: (email?: string, name?: string) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

const DEMO_STORAGE_KEY = 'freelanceflow_demo_session'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user, session) => set({ user, session, loading: false }),
  loginDemoUser: (email = 'demo@freelanceflow.com', name = 'Demo Freelancer') => {
    const demoUser = {
      id: 'demo-user-123',
      email,
      app_metadata: {},
      user_metadata: { name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User

    const demoSession = {
      access_token: 'demo-token',
      token_type: 'bearer',
      user: demoUser,
    }

    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user: demoUser, session: demoSession }))
    set({ user: demoUser, session: demoSession, loading: false })
  },
  initialize: async () => {
    // Check if a demo session exists in localStorage
    const cachedDemo = localStorage.getItem(DEMO_STORAGE_KEY)
    if (cachedDemo) {
      try {
        const parsed = JSON.parse(cachedDemo)
        if (parsed.user && parsed.session) {
          set({ user: parsed.user, session: parsed.session, loading: false })
          return
        }
      } catch {
        localStorage.removeItem(DEMO_STORAGE_KEY)
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user || null, session, loading: false })
      
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user || null, session })
      })
    } catch {
      set({ user: null, session: null, loading: false })
    }
  },
  signOut: async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    try {
      await supabase.auth.signOut()
    } catch {}
    set({ user: null, session: null })
  }
}))
