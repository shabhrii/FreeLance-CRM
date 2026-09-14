import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  setUser: (user: User | null, session: any | null) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user, session) => set({ user, session, loading: false }),
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user || null, session, loading: false })
    
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, session })
    })
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  }
}))
