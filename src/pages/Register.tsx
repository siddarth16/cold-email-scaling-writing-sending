import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, CheckCircle, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { isSupabaseConfigured } from '../lib/supabase'

export function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If authentication is disabled, redirect to dashboard
    if (!isSupabaseConfigured) {
      navigate('/app')
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    setLoading(true)
    
    try {
      await signUp(email, password)
      setShowConfirmationModal(true)
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="neo-card p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
              <User size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/70">Join ColdScale and start scaling your outreach</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail size={18} className="text-white/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock size={18} className="text-white/40" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock size={18} className="text-white/40" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-button w-full group flex items-center justify-center gap-2 mt-8"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Email Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="neo-card p-8 w-full max-w-md text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
              <CheckCircle size={32} className="text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email!</h2>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              We've sent a confirmation email to <strong className="text-primary-400">{email}</strong>. 
              Please check your inbox and click the confirmation link to activate your account.
            </p>
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <p className="text-amber-300 text-sm">
                <strong>Important:</strong> Don't forget to check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-white/60 text-sm">After confirming your email, you can sign in below:</p>
              
              <button
                onClick={() => navigate('/login')}
                className="neo-button w-full group flex items-center justify-center gap-2"
              >
                Go to Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="text-white/60 hover:text-white transition-colors text-sm underline"
              >
                I'll confirm later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 