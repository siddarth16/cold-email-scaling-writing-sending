import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      // If Supabase is not configured, disable authentication
      setUser(null)
      setLoading(false)
      return
    }

    let isMounted = true

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession()
        
        if (isMounted) {
          if (error) {
            console.warn('Error getting session:', error)
            setUser(null)
          } else {
            setUser(session?.user ?? null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.warn('Failed to initialize auth:', error)
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      toast.error('Authentication not configured. Please set up Supabase credentials.')
      throw new Error('Supabase not configured')
    }

    try {
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('Welcome back!')
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      toast.error('Authentication not configured. Please set up Supabase credentials.')
      throw new Error('Supabase not configured')
    }

    try {
      const { error } = await supabase!.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      toast.success('Account created successfully!')
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      throw error
    }
  }

  const signOut = async () => {
    if (!supabase) {
      toast.error('Authentication not configured.')
      throw new Error('Supabase not configured')
    }

    try {
      const { error } = await supabase!.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      toast.error('Authentication not configured.')
      throw new Error('Supabase not configured')
    }

    try {
      const { error } = await supabase!.auth.resetPasswordForEmail(email)
      if (error) throw error
      toast.success('Password reset email sent!')
    } catch (error) {
      const authError = error as AuthError
      toast.error(authError.message)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 