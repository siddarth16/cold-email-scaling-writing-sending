import { motion } from 'framer-motion'
import { Mail, Users, TrendingUp, Eye, Plus, Send, Sparkles, Code, Settings, BarChart3, Target, Activity, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCampaigns } from '../lib/campaigns'
import { useContacts } from '../lib/contacts'
import { useSMTP } from '../lib/smtp'
import { useEffect, useState } from 'react'

export function Dashboard() {
  const campaignManager = useCampaigns()
  const contactManager = useContacts()
  const smtpService = useSMTP()
  
  const [campaigns, setCampaigns] = useState(campaignManager.getAllCampaigns())
  const [contacts, setContacts] = useState(contactManager.getAllContacts())
  const [smtpStats, setSmtpStats] = useState(smtpService.getStats())

  useEffect(() => {
    const unsubscribeCampaigns = campaignManager.subscribe(setCampaigns)
    const unsubscribeContacts = contactManager.subscribe(setContacts)
    
    return () => {
      unsubscribeCampaigns()
      unsubscribeContacts()
    }
  }, [])

  // Calculate real stats
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'sending').length
  const totalContacts = contacts.length
  const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0)
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.stats.delivered, 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + c.stats.opened, 0)
  const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0

  const stats = [
    {
      label: 'Total Campaigns',
      value: totalCampaigns.toString(),
      change: `${activeCampaigns} active`,
      icon: Mail,
      color: 'from-teal-500 to-teal-600'
    },
    {
      label: 'Total Contacts',
      value: totalContacts.toLocaleString(),
      change: `${contacts.filter(c => c.tags.includes('lead')).length} leads`,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Emails Sent',
      value: totalSent.toLocaleString(),
      change: `${totalDelivered} delivered`,
      icon: Send,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Open Rate',
      value: `${openRate.toFixed(1)}%`,
      change: `${totalOpened} opened`,
      icon: Eye,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const quickActions = [
    {
      title: 'AI Email Writer',
      description: 'Generate compelling emails with AI',
      icon: Sparkles,
      href: '/ai-writer',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Create Campaign',
      description: 'Start a new cold email campaign',
      icon: Plus,
      href: '/campaigns',
      color: 'from-copper-500 to-copper-600'
    },
    {
      title: 'Manage Contacts',
      description: 'Import and organize your contacts',
      icon: Users,
      href: '/contacts',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Personalization',
      description: 'Create personalized email templates',
      icon: Code,
      href: '/personalization',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'View Analytics',
      description: 'Track campaign performance',
      icon: BarChart3,
      href: '/analytics',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Settings',
      description: 'Configure SMTP and preferences',
      icon: Settings,
      href: '/settings',
      color: 'from-gray-500 to-gray-600'
    }
  ]

  // Recent activity from actual data
  const recentActivity = []
  
  // Add campaign activities
  campaigns.slice(0, 3).forEach(campaign => {
    if (campaign.stats.sent > 0) {
      recentActivity.push({
        action: `Campaign "${campaign.name}" sent ${campaign.stats.sent} emails`,
        time: new Date(campaign.startedAt || campaign.createdAt).toLocaleDateString(),
        icon: Mail,
        color: 'text-teal-400'
      })
    }
  })

  // Add contact activities
  const recentContacts = contacts.slice(-2)
  recentContacts.forEach(contact => {
    recentActivity.push({
      action: `Added contact ${contact.firstName} ${contact.lastName} from ${contact.company}`,
      time: new Date(contact.createdAt).toLocaleDateString(),
      icon: Users,
      color: 'text-blue-400'
    })
  })

  // Add SMTP activity
  if (smtpStats.lastSentAt) {
    recentActivity.push({
      action: `SMTP sent ${smtpStats.totalSent} emails total`,
      time: new Date(smtpStats.lastSentAt).toLocaleDateString(),
      icon: Send,
      color: 'text-emerald-400'
    })
  }

  // Default activities if no data
  if (recentActivity.length === 0) {
    recentActivity.push(
      {
        action: 'Welcome to ColdScale! Start by creating your first campaign',
        time: 'Now',
        icon: Sparkles,
        color: 'text-teal-400'
      },
      {
        action: 'Import your contacts to get started with email campaigns',
        time: 'Now',
        icon: Users,
        color: 'text-blue-400'
      }
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/70 mt-1">Welcome back to your cold email command center</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-teal-400 text-sm mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          >
            <Link to={action.href} className="block">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-teal-500/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                    <p className="text-white/70 text-sm">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Performance Overview */}
      {totalCampaigns > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Performance Overview</h2>
            <Link to="/analytics" className="text-teal-400 hover:text-teal-300 transition-colors">
              View Details →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{totalSent}</div>
              <div className="text-gray-400">Total Sent</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{totalDelivered}</div>
              <div className="text-gray-400">Delivered</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{totalOpened}</div>
              <div className="text-gray-400">Opened</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-blue-400" size={20} />
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        </div>
        
        <div className="space-y-4">
          {recentActivity.slice(0, 4).map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-gray-700/30">
              <div className={`p-2 rounded-lg bg-gray-700/50 ${activity.color}`}>
                <activity.icon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white/80">{activity.action}</p>
                <span className="text-white/50 text-sm">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 