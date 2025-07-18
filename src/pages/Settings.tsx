import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  Mail, 
  User, 
  Shield, 
  Palette, 
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
  RefreshCw
} from 'lucide-react'
import { SMTPService, SMTPConfig, useSMTP } from '../lib/smtp'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

type SettingsTab = 'smtp' | 'account' | 'theme' | 'data'

interface ThemeSettings {
  mode: 'dark' | 'light'
  primaryColor: string
  accentColor: string
  animation: boolean
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('smtp')
  const [smtpConfig, setSmtpConfig] = useState<Partial<SMTPConfig>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('custom')
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    mode: 'dark',
    primaryColor: '#14b8a6',
    accentColor: '#f59e0b',
    animation: true
  })

  const smtpService = useSMTP()
  const { user } = useAuth()

  // Load settings on component mount
  useEffect(() => {
    const existingConfig = smtpService.getConfig()
    if (existingConfig) {
      setSmtpConfig(existingConfig)
    }

    // Load theme settings
    const savedTheme = localStorage.getItem('coldscale_theme_settings')
    if (savedTheme) {
      setThemeSettings(JSON.parse(savedTheme))
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

  // Save theme settings
  const saveThemeSettings = () => {
    localStorage.setItem('coldscale_theme_settings', JSON.stringify(themeSettings))
    setSaveResult({ success: true, message: 'Theme settings saved successfully!' })
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
    { id: 'smtp', label: 'SMTP Settings', icon: Mail },
    { id: 'account', label: 'Account', icon: User },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'data', label: 'Data', icon: Server }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Configure your account and application preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="flex border-b border-gray-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
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

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="text-purple-400" size={24} />
                <div>
                  <h2 className="text-xl font-semibold text-white">Theme Settings</h2>
                  <p className="text-gray-400">Customize the appearance of your application</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Theme Mode */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Theme Mode
                  </label>
                  <select
                    value={themeSettings.mode}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, mode: e.target.value as 'dark' | 'light' }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light (Coming Soon)</option>
                  </select>
                </div>

                {/* Color Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeSettings.accentColor}
                        onChange={(e) => setThemeSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeSettings.accentColor}
                        onChange={(e) => setThemeSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Animation Settings */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="animations"
                    checked={themeSettings.animation}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, animation: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="animations" className="text-white">
                    Enable animations and transitions
                  </label>
                </div>

                {/* Save Button */}
                <button
                  onClick={saveThemeSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Save size={16} />
                  Save Theme Settings
                </button>
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
    </div>
  )
} 