import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { ContactImportResult, useContacts } from '../lib/contacts'
import { toast } from 'react-hot-toast'

interface ContactImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactImportModal({ isOpen, onClose }: ContactImportModalProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [importResult, setImportResult] = useState<ContactImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contactManager = useContacts()

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setIsImporting(true)
    try {
      const result = await contactManager.importFromCSV(file)
      setImportResult(result)
    } catch (error) {
      toast.error('Failed to import contacts')
    } finally {
      setIsImporting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleConfirmImport = () => {
    if (importResult) {
      contactManager.addImportedContacts(importResult.contacts)
      toast.success(`Successfully imported ${importResult.contacts.length} contacts`)
      onClose()
      setImportResult(null)
    }
  }

  const handleClose = () => {
    onClose()
    setImportResult(null)
  }

  const downloadTemplate = () => {
    const template = `firstName,lastName,email,company,position,phone,website,notes,tags
John,Doe,john@example.com,Acme Corp,Marketing Manager,+1-555-0123,https://acme.com,Sample contact,prospect;qualified
Jane,Smith,jane@techco.com,TechCo,CEO,,https://techco.com,Follow up next week,client;priority`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl neo-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Upload size={24} />
                Import Contacts
              </h2>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {!importResult ? (
              <div className="space-y-6">
                {/* File Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-white/20 hover:border-primary-500/50'
                  } ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText size={48} className="mx-auto mb-4 text-white/60" />
                  <p className="text-white text-lg font-medium mb-2">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-white/60 text-sm">
                    Supports CSV files with contact information
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {/* Template Download */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Need a template?</p>
                    <p className="text-white/60 text-sm">Download our CSV template to get started</p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                  >
                    Download Template
                  </button>
                </div>

                {/* Format Requirements */}
                <div className="space-y-2">
                  <h3 className="text-white font-medium">Required CSV Format:</h3>
                  <div className="text-white/70 text-sm space-y-1">
                    <p>• <strong>firstName</strong> - First name (required)</p>
                    <p>• <strong>lastName</strong> - Last name (required)</p>
                    <p>• <strong>email</strong> - Email address (required)</p>
                    <p>• <strong>company</strong> - Company name</p>
                    <p>• <strong>position</strong> - Job title</p>
                    <p>• <strong>phone</strong> - Phone number</p>
                    <p>• <strong>website</strong> - Website URL</p>
                    <p>• <strong>notes</strong> - Additional notes</p>
                    <p>• <strong>tags</strong> - Comma-separated tags</p>
                  </div>
                </div>

                {isImporting && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                    <span className="ml-3 text-white">Importing contacts...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Import Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <CheckCircle size={20} />
                      <span className="font-medium">Success</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{importResult.contacts.length}</p>
                    <p className="text-white/60 text-sm">Contacts imported</p>
                  </div>

                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <Users size={20} />
                      <span className="font-medium">Duplicates</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{importResult.duplicates.length}</p>
                    <p className="text-white/60 text-sm">Skipped duplicates</p>
                  </div>

                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <AlertCircle size={20} />
                      <span className="font-medium">Errors</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{importResult.errors.length}</p>
                    <p className="text-white/60 text-sm">Failed imports</p>
                  </div>
                </div>

                {/* Error Details */}
                {importResult.errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-red-400 font-medium mb-2">Import Errors:</h4>
                    <div className="space-y-1 text-sm text-white/70 max-h-32 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <p key={index}>• {error}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={importResult.contacts.length === 0}
                    className="neo-button px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import {importResult.contacts.length} Contacts
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 