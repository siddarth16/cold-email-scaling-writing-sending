import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Zap, Target, BarChart3, ArrowRight } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Scale Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                  {' '}Cold Emails
                </span>
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Generate, personalize, and send cold email campaigns that convert. 
                Powered by AI, built for scale, completely free.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isSupabaseConfigured ? (
                <>
                  <Link
                    to="/register"
                    className="neo-button group inline-flex items-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/app"
                  className="neo-button group inline-flex items-center gap-2"
                >
                  Try Demo
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              A complete platform for cold email campaigns, from writing to tracking
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mail,
                title: 'AI-Powered Writing',
                description: 'Generate compelling cold emails with our integrated AI assistant'
              },
              {
                icon: Target,
                title: 'Smart Personalization',
                description: 'Automatically personalize emails for each recipient'
              },
              {
                icon: Zap,
                title: 'Bulk Sending',
                description: 'Send thousands of emails with your own SMTP setup'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Track opens, clicks, and replies with detailed insights'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="neo-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="neo-card p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Scale Your Outreach?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of professionals who trust ColdScale for their email campaigns
            </p>
            <Link
              to={isSupabaseConfigured ? "/register" : "/app"}
              className="neo-button group inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              {isSupabaseConfigured ? "Start Your Free Campaign" : "Try Demo Now"}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 