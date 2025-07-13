import { motion } from 'framer-motion'
import { Mail, Users, TrendingUp, Eye, Plus, Send, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const stats = [
    {
      label: 'Total Campaigns',
      value: '12',
      change: '+2 this month',
      icon: Mail,
      color: 'from-primary-500 to-primary-600'
    },
    {
      label: 'Total Contacts',
      value: '2,847',
      change: '+167 this week',
      icon: Users,
      color: 'from-accent-500 to-accent-600'
    },
    {
      label: 'Emails Sent',
      value: '15,432',
      change: '+1,234 today',
      icon: Send,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Open Rate',
      value: '34.2%',
      change: '+2.4% vs last month',
      icon: Eye,
      color: 'from-blue-500 to-blue-600'
    }
  ]

  const quickActions = [
    {
      title: 'AI Email Writer',
      description: 'Generate compelling emails with AI',
      icon: Sparkles,
      href: '/ai-writer',
      color: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Create Campaign',
      description: 'Start a new cold email campaign',
      icon: Plus,
      href: '/campaigns',
      color: 'from-accent-500 to-accent-600'
    },
    {
      title: 'Import Contacts',
      description: 'Add contacts from CSV file',
      icon: Users,
      href: '/contacts',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'View Analytics',
      description: 'Check campaign performance',
      icon: TrendingUp,
      href: '/analytics',
      color: 'from-blue-500 to-blue-600'
    }
  ]

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
            className="neo-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-primary-400 text-sm mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          >
            <Link to={action.href} className="block">
              <div className="neo-card p-6 hover:border-primary-500/30 transition-all cursor-pointer group">
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="neo-card p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'Campaign "B2B Outreach" sent to 150 contacts', time: '2 hours ago' },
            { action: 'Added 45 new contacts from CSV import', time: '4 hours ago' },
            { action: 'Campaign "Product Launch" achieved 28% open rate', time: '1 day ago' },
            { action: 'Generated new email template using AI', time: '2 days ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <p className="text-white/80">{activity.action}</p>
              <span className="text-white/50 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 