import { motion } from 'framer-motion'
import { Users, Upload } from 'lucide-react'

export function Contacts() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
          <p className="text-white/70 mt-1">Manage your contact database</p>
        </div>
        <button className="neo-button inline-flex items-center gap-2">
          <Upload size={20} />
          Import CSV
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neo-card p-12 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Users size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Contact Management</h2>
        <p className="text-white/70 mb-6">
          This feature is coming soon. You'll be able to import, organize, and segment your contacts here.
        </p>
        <div className="space-y-2 text-white/60">
          <p>✓ CSV import/export</p>
          <p>✓ Contact segmentation</p>
          <p>✓ Duplicate detection</p>
          <p>✓ Custom fields</p>
        </div>
      </motion.div>
    </div>
  )
} 