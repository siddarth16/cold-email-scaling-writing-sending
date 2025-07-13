import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Mail } from 'lucide-react'

export function Settings() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/70 mt-1">Configure your account and preferences</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neo-card p-12 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <SettingsIcon size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Account Settings</h2>
        <p className="text-white/70 mb-6">
          This feature is coming soon. You'll be able to configure your SMTP settings and preferences here.
        </p>
        <div className="space-y-2 text-white/60">
          <p>✓ SMTP configuration</p>
          <p>✓ Account preferences</p>
          <p>✓ Theme customization</p>
          <p>✓ API keys management</p>
        </div>
      </motion.div>
    </div>
  )
} 