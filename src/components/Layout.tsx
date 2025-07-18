import { useState, useEffect } from 'react'
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
  Code,
  ChevronRight,
  Activity
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { useCampaigns } from '../lib/campaigns'
import { useContacts } from '../lib/contacts'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/app', 
    icon: Home, 
    description: 'Overview & analytics',
    badge: null
  },
  { 
    name: 'AI Writer', 
    href: '/ai-writer', 
    icon: Sparkles, 
    description: 'Generate AI emails',
    badge: 'AI'
  },
  { 
    name: 'Campaigns', 
    href: '/campaigns', 
    icon: Mail, 
    description: 'Email campaigns',
    badge: null
  },
  { 
    name: 'Contacts', 
    href: '/contacts', 
    icon: Users, 
    description: 'Manage recipients',
    badge: null
  },
  { 
    name: 'Personalization', 
    href: '/personalization', 
    icon: Code, 
    description: 'Custom templates',
    badge: null
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3, 
    description: 'Performance metrics',
    badge: null
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings, 
    description: 'Configuration',
    badge: null
  },
]

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const location = useLocation()
  
  // Dynamic stats
  const campaignManager = useCampaigns()
  const contactManager = useContacts()
  const [campaigns, setCampaigns] = useState(campaignManager.getAllCampaigns())
  const [contacts, setContacts] = useState(contactManager.getAllContacts())

  useEffect(() => {
    const unsubscribeCampaigns = campaignManager.subscribe(setCampaigns)
    const unsubscribeContacts = contactManager.subscribe(setContacts)
    
    return () => {
      unsubscribeCampaigns()
      unsubscribeContacts()
    }
  }, [campaignManager, contactManager])

  // Calculate real-time stats
  const totalCampaigns = campaigns.length
  const totalContacts = contacts.length
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.stats.delivered, 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + c.stats.opened, 0)
  const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="relative w-80 h-full neo-card border-r border-white/10"
          style={{ borderRadius: 0 }}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mail size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ColdScale</h1>
                <p className="text-xs text-white/60">Email Platform</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-md'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={20} className={isActive ? 'text-primary-400' : 'text-white/60 group-hover:text-white'} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-accent-500 text-white rounded-md font-medium">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={16} className={`transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
            >
              <LogOut size={20} className="text-white/60 group-hover:text-red-400 transition-colors" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col h-full neo-card border-r border-white/10" style={{ borderRadius: 0 }}>
          {/* Desktop Header */}
          <div className="flex items-center gap-4 px-6 py-6 border-b border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-xl">
              <Mail size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">ColdScale</h1>
              <p className="text-sm text-white/60">Email Scaling Platform</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-white/70">System Online</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-md'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r"></div>
                    )}
                    
                    <div className={`p-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-primary-500/20' 
                        : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Icon size={20} className={isActive ? 'text-primary-400' : 'text-white/60 group-hover:text-white'} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                    </div>
                    
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-accent-500 text-white rounded-lg font-medium shadow-sm">
                        {item.badge}
                      </span>
                    )}
                    
                    <ChevronRight size={16} className={`transition-all duration-200 ${
                      isActive ? 'rotate-90 text-primary-400' : 'group-hover:translate-x-1 text-white/40'
                    }`} />
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Quick Stats */}
          <div className="px-6 py-4 border-t border-white/10">
            <div className="text-xs text-white/60 mb-3 font-medium">QUICK STATS</div>
            <div className="grid grid-cols-3 gap-3">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-lg font-bold text-white">{totalCampaigns}</div>
                <div className="text-xs text-white/60">Campaigns</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="text-lg font-bold text-white">{totalContacts}</div>
                <div className="text-xs text-white/60">Contacts</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="text-lg font-bold text-white">{openRate}%</div>
                <div className="text-xs text-white/60">Open Rate</div>
              </motion.div>
            </div>
          </div>

          {/* Desktop Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
                <LogOut size={16} className="text-white/60 group-hover:text-red-400 transition-colors" />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 neo-card border-b border-white/10" style={{ borderRadius: 0 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">ColdScale</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Demo Mode Banner */}
        {!isSupabaseConfigured && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30 p-4"
          >
            <div className="flex items-center justify-center gap-2">
              <Activity size={16} className="text-amber-400" />
              <p className="text-amber-400 text-sm font-medium">
                <strong>Demo Mode:</strong> Authentication is disabled. Set up Supabase credentials to enable user accounts.
              </p>
            </div>
          </motion.div>
        )}

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 