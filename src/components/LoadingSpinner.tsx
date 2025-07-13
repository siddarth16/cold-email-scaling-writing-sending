import { motion } from 'framer-motion'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-primary-500/30 border-t-primary-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
} 