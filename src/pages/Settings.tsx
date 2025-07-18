import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  Mail, 
  User, 
  Shield, 
  Server,
  Save,
  TestTube,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  BookOpen,
  ExternalLink,
  Play,
  HelpCircle
} from 'lucide-react'
import { SMTPService, SMTPConfig, useSMTP } from '../lib/smtp'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

type SettingsTab = 'smtp' | 'account' | 'setup' | 'data'

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('smtp')
  const [smtpConfig, setSmtpConfig] = useState<Partial<SMTPConfig>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('custom')

  const smtpService = useSMTP()
  const { user } = useAuth()

  // Load settings on component mount
  useEffect(() => {
    const existingConfig = smtpService.getConfig()
    if (existingConfig) {
      setSmtpConfig(existingConfig)
    }
  }, [])

  // Handle SMTP configuration changes
  const handleSmtpChange = (field: keyof SMTPConfig, value: string | number | boolean) => {
    setSmtpConfig(prev => ({ ...prev, [field]: value }))
  }

  // Load preset configuration
  const loadPreset = (preset: string) => {
    const presets = SMTPService.getPresetConfigs()
    if (presets[preset]) {
      setSmtpConfig(prev => ({ ...prev, ...presets[preset] }))
      setSelectedPreset(preset)
    }
  }

  // Test SMTP connection
  const testConnection = async () => {
    setIsTestingConnection(true)
    setTestResult(null)

    try {
      const errors = SMTPService.validateConfig(smtpConfig)
      if (errors.length > 0) {
        setTestResult({ success: false, message: errors.join(', ') })
        return
      }

      // Save temporarily to test
      smtpService.saveConfig(smtpConfig as SMTPConfig)
      const success = await smtpService.testConnection()
      
      setTestResult({ 
        success, 
        message: success ? 'Connection successful!' : 'Connection failed'
      })
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Save SMTP configuration
  const saveSmtpConfig = async () => {
    setIsSaving(true)
    setSaveResult(null)

    try {
      const errors = SMTPService.validateConfig(smtpConfig)
      if (errors.length > 0) {
        setSaveResult({ success: false, message: errors.join(', ') })
        return
      }

      smtpService.saveConfig(smtpConfig as SMTPConfig)
      setSaveResult({ success: true, message: 'SMTP configuration saved successfully!' })
    } catch (error) {
      setSaveResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to save configuration'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Export data
  const exportData = () => {
    const data = {
      campaigns: JSON.parse(localStorage.getItem('coldscale_campaigns') || '[]'),
      contacts: JSON.parse(localStorage.getItem('coldscale_contacts') || '[]'),
      templates: JSON.parse(localStorage.getItem('coldscale_personalization_templates') || '[]'),
      smtp: JSON.parse(localStorage.getItem('coldscale_smtp_config') || '{}'),
      theme: JSON.parse(localStorage.getItem('coldscale_theme_settings') || '{}')
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coldscale-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import data
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.campaigns) localStorage.setItem('coldscale_campaigns', JSON.stringify(data.campaigns))
        if (data.contacts) localStorage.setItem('coldscale_contacts', JSON.stringify(data.contacts))
        if (data.templates) localStorage.setItem('coldscale_personalization_templates', JSON.stringify(data.templates))
        if (data.smtp) localStorage.setItem('coldscale_smtp_config', JSON.stringify(data.smtp))
        if (data.theme) localStorage.setItem('coldscale_theme_settings', JSON.stringify(data.theme))
        
        setSaveResult({ success: true, message: 'Data imported successfully! Please refresh the page.' })
      } catch (error) {
        setSaveResult({ success: false, message: 'Failed to import data. Invalid file format.' })
      }
    }
    reader.readAsText(file)
  }

  // Clear all data
  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('coldscale_campaigns')
      localStorage.removeItem('coldscale_contacts')
      localStorage.removeItem('coldscale_personalization_templates')
      localStorage.removeItem('coldscale_smtp_config')
      localStorage.removeItem('coldscale_theme_settings')
      
      setSaveResult({ success: true, message: 'All data cleared successfully!' })
    }
  }

  const tabs = [
    { id: 'smtp', name: 'SMTP Settings', icon: Mail },
    { id: 'account', name: 'Account', icon: User },
    { id: 'setup', name: 'Gmail Setup', icon: BookOpen },
    { id: 'data', name: 'Data Management', icon: Server },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/70 mt-1">Configure your account and email settings</p>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="flex space-x-1 bg-gray-800/30 backdrop-blur-sm rounded-xl p-1 border border-gray-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="neo-card p-8">
        {/* Gmail Setup Instructions */}
        {activeTab === 'setup' && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-blue-400" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-white">Gmail Automation Setup</h2>
                <p className="text-gray-400">Step-by-step guide to set up automated cold email campaigns</p>
              </div>
            </div>

            {/* Setup Steps */}
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Enable 2-Factor Authentication</h3>
                    <p className="text-gray-300 mb-3">
                      First, you need to enable 2-factor authentication on your Gmail account to generate app passwords.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Go to your Google Account settings
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Navigate to Security → 2-Step Verification
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Follow the setup process to enable 2FA
                      </div>
                    </div>
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Open Google Security Settings
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Generate App Password</h3>
                    <p className="text-gray-300 mb-3">
                      Create a specific app password for ColdScale to access your Gmail account securely.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Go to Google Account → Security → App passwords
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Select "Mail" as the app and "Other" as the device
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Name it "ColdScale" and generate the password
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Copy the 16-character password (you'll need this for SMTP)
                      </div>
                    </div>
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Generate App Password
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Configure SMTP Settings</h3>
                    <p className="text-gray-300 mb-3">
                      Use these settings in the SMTP tab to connect your Gmail account.
                    </p>
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">SMTP Server:</span>
                          <span className="text-white ml-2 font-mono">smtp.gmail.com</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Port:</span>
                          <span className="text-white ml-2 font-mono">587</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Security:</span>
                          <span className="text-white ml-2">TLS/STARTTLS</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Username:</span>
                          <span className="text-white ml-2">your.email@gmail.com</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Password:</span>
                        <span className="text-white ml-2">Use the 16-character app password</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('smtp')}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Configure SMTP Settings
                      <SettingsIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Test & Launch Campaigns</h3>
                    <p className="text-gray-300 mb-3">
                      Test your configuration and start sending automated cold email campaigns.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Use the "Test Connection" button in SMTP settings
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Import your contacts or add them manually
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Create your first campaign with AI-generated emails
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Play size={12} />
                        Monitor performance in the Analytics dashboard
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="text-blue-400 mt-1" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Best Practices</h3>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Start with small test campaigns (10-20 emails) to verify deliverability</li>
                      <li>• Keep daily sending limits reasonable (50-100 emails/day for new accounts)</li>
                      <li>• Always personalize emails with recipient names and company information</li>
                      <li>• Monitor spam rates and adjust content if emails go to spam folders</li>
                      <li>• Use different email templates to avoid being flagged as automated</li>
                      <li>• Include proper unsubscribe links and respect opt-out requests</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-400 mt-1" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Important Notes</h3>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Gmail has daily sending limits (500 emails/day for personal accounts)</li>
                      <li>• Always comply with CAN-SPAM Act and GDPR regulations</li>
                      <li>• Never send unsolicited emails to purchased lists</li>
                      <li>• Monitor your sender reputation to avoid being blacklisted</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMTP Settings */}
        {activeTab === 'smtp' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="text-teal-400" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-white">SMTP Configuration</h2>
                <p className="text-gray-400">Configure your email server settings for sending campaigns</p>
              </div>
            </div>

            {/* Preset Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Email Provider Preset
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => loadPreset(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="custom">Custom Configuration</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="yahoo">Yahoo</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SMTP Host */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpConfig.host || ''}
                  onChange={(e) => handleSmtpChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* SMTP Port */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={smtpConfig.port || ''}
                  onChange={(e) => handleSmtpChange('port', parseInt(e.target.value))}
                  placeholder="587"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={smtpConfig.username || ''}
                  onChange={(e) => handleSmtpChange('username', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={smtpConfig.password || ''}
                    onChange={(e) => handleSmtpChange('password', e.target.value)}
                    placeholder="your-app-password"
                    className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* From Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={smtpConfig.fromEmail || ''}
                  onChange={(e) => handleSmtpChange('fromEmail', e.target.value)}
                  placeholder="sender@yourdomain.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* From Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={smtpConfig.fromName || ''}
                  onChange={(e) => handleSmtpChange('fromName', e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Secure Connection */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="secure"
                checked={smtpConfig.secure || false}
                onChange={(e) => handleSmtpChange('secure', e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <label htmlFor="secure" className="text-white">
                Use SSL/TLS (recommended for port 465)
              </label>
            </div>

            {/* Test & Save Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <TestTube size={16} className={isTestingConnection ? 'animate-spin' : ''} />
                Test Connection
              </button>
              <button
                onClick={saveSmtpConfig}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                <Save size={16} className={isSaving ? 'animate-spin' : ''} />
                Save Configuration
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                testResult.success ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
              }`}>
                {testResult.success ? <Check size={16} /> : <X size={16} />}
                {testResult.message}
              </div>
            )}
          </div>
        )}

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-blue-400" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-white">Account Settings</h2>
                <p className="text-gray-400">Manage your account preferences and authentication</p>
              </div>
            </div>

            {/* Authentication Status */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="text-yellow-400" size={20} />
                <span className="text-lg font-medium text-white">Authentication Status</span>
              </div>
              
              {isSupabaseConfigured ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check size={16} />
                    <span>Supabase authentication is configured</span>
                  </div>
                  {user && (
                    <div className="text-gray-400">
                      Logged in as: {user.email}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle size={16} />
                    <span>Demo mode - Authentication disabled</span>
                  </div>
                  <div className="text-gray-400">
                    Add Supabase credentials to enable full authentication
                  </div>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || 'demo@coldscale.com'}
                    disabled
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={isSupabaseConfigured ? 'Authenticated' : 'Demo'}
                    disabled
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Management */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Server className="text-green-400" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-white">Data Management</h2>
                <p className="text-gray-400">Export, import, and manage your application data</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Export Data */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Export Data</h3>
                <p className="text-gray-400 mb-4">
                  Download all your campaigns, contacts, and settings as a JSON file
                </p>
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Export All Data
                </button>
              </div>

              {/* Import Data */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Import Data</h3>
                <p className="text-gray-400 mb-4">
                  Import previously exported data or migrate from another installation
                </p>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                  <Upload size={16} />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Clear Data */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Clear All Data</h3>
                <p className="text-gray-400 mb-4">
                  Permanently delete all campaigns, contacts, and settings
                </p>
                <button
                  onClick={clearAllData}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Result */}
        {saveResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mt-6 ${
            saveResult.success ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
          }`}>
            {saveResult.success ? <Check size={16} /> : <X size={16} />}
            {saveResult.message}
          </div>
        )}
      </div>
    </div>
  )
} 