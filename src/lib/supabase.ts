import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a conditional Supabase client - only initialize if valid credentials are provided
export const supabase: SupabaseClient | null = (() => {
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - authentication features will be disabled')
    return null
  }
  
  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'coldscale-auth-token',
        storage: window.localStorage
      }
    })
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
    return null
  }
})()

export const isSupabaseConfigured = supabase !== null 