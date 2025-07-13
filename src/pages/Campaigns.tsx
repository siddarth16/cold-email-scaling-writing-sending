import { motion } from 'framer-motion'
import { Mail, Plus } from 'lucide-react'

export function Campaigns() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-white/70 mt-1">Manage your cold email campaigns</p>
        </div>
        <button className="neo-button inline-flex items-center gap-2">
          <Plus size={20} />
          New Campaign
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neo-card p-12 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Campaign Management</h2>
        <p className="text-white/70 mb-6">
          This feature is coming soon. You'll be able to create, manage, and track your email campaigns here.
        </p>
        <div className="space-y-2 text-white/60">
          <p>✓ AI-powered email generation</p>
          <p>✓ Campaign scheduling</p>
          <p>✓ A/B testing</p>
          <p>✓ Performance tracking</p>
        </div>
      </motion.div>
    </div>
  )
} 