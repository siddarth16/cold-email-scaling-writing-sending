import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Mail, 
  Users, 
  Eye, 
  MousePointer,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Target,
  Zap,
  Activity
} from 'lucide-react'
import { useCampaigns } from '../lib/campaigns'
import { useContacts } from '../lib/contacts'
import { useSMTP } from '../lib/smtp'

interface AnalyticsMetric {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ComponentType<any>
  color: string
}

interface CampaignPerformance {
  id: string
  name: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
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

  // Calculate overall metrics
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'sending').length
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length
  const totalContacts = contacts.length
  const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0)
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.stats.delivered, 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + c.stats.opened, 0)
  const totalClicked = campaigns.reduce((sum, c) => sum + c.stats.clicked, 0)
  const totalBounced = campaigns.reduce((sum, c) => sum + c.stats.bounced, 0)

  // Calculate rates
  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
  const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0
  const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
  const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0

  // Key metrics
  const metrics: AnalyticsMetric[] = [
    {
      label: 'Total Campaigns',
      value: totalCampaigns,
      change: '+12%',
      trend: 'up',
      icon: Mail,
      color: 'text-teal-400'
    },
    {
      label: 'Active Campaigns',
      value: activeCampaigns,
      change: '+5%',
      trend: 'up',
      icon: Activity,
      color: 'text-yellow-400'
    },
    {
      label: 'Total Contacts',
      value: totalContacts,
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      label: 'Emails Sent',
      value: totalSent.toLocaleString(),
      change: '+15%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Delivery Rate',
      value: `${deliveryRate.toFixed(1)}%`,
      change: '+2.3%',
      trend: 'up',
      icon: Target,
      color: 'text-emerald-400'
    },
    {
      label: 'Open Rate',
      value: `${openRate.toFixed(1)}%`,
      change: '+1.8%',
      trend: 'up',
      icon: Eye,
      color: 'text-indigo-400'
    },
    {
      label: 'Click Rate',
      value: `${clickRate.toFixed(1)}%`,
      change: '+0.5%',
      trend: 'up',
      icon: MousePointer,
      color: 'text-purple-400'
    },
    {
      label: 'Bounce Rate',
      value: `${bounceRate.toFixed(1)}%`,
      change: '-0.3%',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-red-400'
    }
  ]

  // Campaign performance data
  const campaignPerformance: CampaignPerformance[] = campaigns.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    sent: campaign.stats.sent,
    delivered: campaign.stats.delivered,
    opened: campaign.stats.opened,
    clicked: campaign.stats.clicked,
    bounced: campaign.stats.bounced,
    deliveryRate: campaign.stats.sent > 0 ? (campaign.stats.delivered / campaign.stats.sent) * 100 : 0,
    openRate: campaign.stats.delivered > 0 ? (campaign.stats.opened / campaign.stats.delivered) * 100 : 0,
    clickRate: campaign.stats.opened > 0 ? (campaign.stats.clicked / campaign.stats.opened) * 100 : 0,
    bounceRate: campaign.stats.sent > 0 ? (campaign.stats.bounced / campaign.stats.sent) * 100 : 0
  }))

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-green-400" />
      case 'down': return <TrendingUp size={16} className="text-red-400 rotate-180" />
      case 'stable': return <TrendingUp size={16} className="text-gray-400 rotate-90" />
    }
  }

  // Refresh data
  const refreshData = async () => {
    setIsLoading(true)
    try {
      setCampaigns(campaignManager.getAllCampaigns())
      setContacts(contactManager.getAllContacts())
      setSmtpStats(smtpService.getStats())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your email campaign performance and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gray-700/50 ${metric.color}`}>
                <metric.icon size={24} />
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-sm text-gray-400">{metric.label}</div>
              <div className={`text-sm ${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                {metric.change} from last period
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Performance Overview</h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Metrics</option>
              <option value="sent">Emails Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
            </select>
          </div>
        </div>
        
        {/* Simulated Chart */}
        <div className="h-64 flex items-center justify-center bg-gray-700/20 rounded-lg border border-gray-600/50">
          <div className="text-center text-gray-400">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Performance Chart</p>
            <p className="text-sm">Real-time analytics visualization will appear here</p>
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Campaign Performance</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 font-medium">Campaign</th>
                <th className="pb-3 font-medium">Sent</th>
                <th className="pb-3 font-medium">Delivered</th>
                <th className="pb-3 font-medium">Opened</th>
                <th className="pb-3 font-medium">Clicked</th>
                <th className="pb-3 font-medium">Delivery Rate</th>
                <th className="pb-3 font-medium">Open Rate</th>
                <th className="pb-3 font-medium">Click Rate</th>
                <th className="pb-3 font-medium">Bounce Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaignPerformance.map((campaign, index) => (
                <motion.tr
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-white border-b border-gray-700/50 last:border-b-0"
                >
                  <td className="py-4 font-medium">{campaign.name}</td>
                  <td className="py-4">{campaign.sent.toLocaleString()}</td>
                  <td className="py-4">{campaign.delivered.toLocaleString()}</td>
                  <td className="py-4">{campaign.opened.toLocaleString()}</td>
                  <td className="py-4">{campaign.clicked.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`${campaign.deliveryRate >= 95 ? 'text-green-400' : campaign.deliveryRate >= 85 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {campaign.deliveryRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`${campaign.openRate >= 20 ? 'text-green-400' : campaign.openRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {campaign.openRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`${campaign.clickRate >= 3 ? 'text-green-400' : campaign.clickRate >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {campaign.clickRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`${campaign.bounceRate <= 2 ? 'text-green-400' : campaign.bounceRate <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {campaign.bounceRate.toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {campaignPerformance.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p>No campaign data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-yellow-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Best Performing Campaign</h3>
          </div>
          {campaignPerformance.length > 0 ? (
            <div className="space-y-2">
              {(() => {
                const best = campaignPerformance.reduce((prev, current) => 
                  (prev.openRate > current.openRate) ? prev : current
                )
                return (
                  <div>
                    <div className="text-xl font-bold text-white">{best.name}</div>
                    <div className="text-sm text-gray-400">
                      {best.openRate.toFixed(1)}% open rate • {best.clickRate.toFixed(1)}% click rate
                    </div>
                    <div className="text-sm text-teal-400 mt-2">
                      🎯 {best.sent} emails sent with {best.deliveryRate.toFixed(1)}% delivery rate
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <p className="text-gray-400">No campaign data available</p>
          )}
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {campaigns.slice(0, 3).map((campaign, index) => (
              <div key={campaign.id} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0">
                <div>
                  <div className="text-sm font-medium text-white">{campaign.name}</div>
                  <div className="text-xs text-gray-400">
                    {campaign.status === 'completed' ? 'Completed' : 
                     campaign.status === 'sending' ? 'Sending' : 
                     campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-teal-400">{campaign.stats.sent}</div>
                  <div className="text-xs text-gray-400">sent</div>
                </div>
              </div>
            ))}
            
            {campaigns.length === 0 && (
              <p className="text-gray-400 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 