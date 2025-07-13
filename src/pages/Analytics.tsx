import { motion } from 'framer-motion'
import { BarChart3, TrendingUp } from 'lucide-react'

export function Analytics() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-white/70 mt-1">Track your campaign performance</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neo-card p-12 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h2>
        <p className="text-white/70 mb-6">
          This feature is coming soon. You'll get detailed insights into your email campaign performance.
        </p>
        <div className="space-y-2 text-white/60">
          <p>✓ Open & click tracking</p>
          <p>✓ Engagement metrics</p>
          <p>✓ A/B test results</p>
          <p>✓ Revenue attribution</p>
        </div>
      </motion.div>
    </div>
  )
} 