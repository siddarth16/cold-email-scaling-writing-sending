import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  Mail, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles,
  Code
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/app', icon: Home },
  { name: 'AI Writer', href: '/ai-writer', icon: Sparkles },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Personalization', href: '/personalization', icon: Code },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="relative w-72 h-full bg-dark-800/90 backdrop-blur-xl border-r border-white/10"
        >
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-white">ColdScale</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/60 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col bg-dark-800/50 backdrop-blur-xl border-r border-white/10">
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Mail size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">ColdScale</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2 w-full text-left text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-dark-800/50 backdrop-blur-xl border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white">ColdScale</h1>
          <div className="w-6" />
        </div>

        {/* Demo Mode Banner */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 p-3 text-center">
            <p className="text-amber-400 text-sm">
              <strong>Demo Mode:</strong> Authentication is disabled. Set up Supabase credentials to enable user accounts.
            </p>
          </div>
        )}

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 