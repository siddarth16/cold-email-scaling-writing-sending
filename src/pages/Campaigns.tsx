import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Send, 
  Clock, 
  Users, 
  Mail, 
  BarChart3,
  Play,
  Pause,
  Square,
  Copy,
  Trash2,
  Calendar,
  Settings,
  Eye,
  TestTube,
  Filter,
  Search,
  X,
  BookOpen,
  FileText
} from 'lucide-react'
import { Campaign, useCampaigns } from '../lib/campaigns'
import { useContacts, Contact, getFullName } from '../lib/contacts'
import { PersonalizationEngine } from '../lib/personalization'
import { useTemplates, EmailTemplate } from '../lib/templates'

interface CampaignFormData {
  name: string
  subject: string
  body: string
  contactIds: string[]
  scheduledAt?: string
  selectedTemplate?: string
  settings: {
    enablePersonalization: boolean
    enableTracking: boolean
    sendDelay: number
    testMode: boolean
  }
}

const initialFormData: CampaignFormData = {
  name: '',
  subject: '',
  body: '',
  contactIds: [],
  selectedTemplate: '',
  settings: {
    enablePersonalization: true,
    enableTracking: true,
    sendDelay: 5,
    testMode: false
  }
}

export default function Campaigns() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [testEmail, setTestEmail] = useState('')
  const [showTestModal, setShowTestModal] = useState<string | null>(null)
  const [showContactSelector, setShowContactSelector] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  const campaignManager = useCampaigns()
  const contactManager = useContacts()
  const templateManager = useTemplates()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])

  // Load data
  useEffect(() => {
    setCampaigns(campaignManager.getAllCampaigns())
    setContacts(contactManager.getAllContacts())
    setTemplates(templateManager.getAllTemplates())

    const unsubscribeCampaigns = campaignManager.subscribe(setCampaigns)
    const unsubscribeContacts = contactManager.subscribe(setContacts)
    const unsubscribeTemplates = templateManager.subscribe(setTemplates)

    return () => {
      unsubscribeCampaigns()
      unsubscribeContacts()
      unsubscribeTemplates()
    }
  }, [])

  // Handle template selection
  const handleTemplateSelect = (template: EmailTemplate) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body,
      selectedTemplate: template.id,
      name: prev.name || `Campaign: ${template.name}`
    }))
    templateManager.incrementUsage(template.id)
    setShowTemplateSelector(false)
  }

  const clearTemplate = () => {
    setFormData(prev => ({
      ...prev,
      subject: '',
      body: '',
      selectedTemplate: ''
    }))
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Filter contacts for selection
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contactSearch === '' || 
      getFullName(contact).toLowerCase().includes(contactSearch.toLowerCase()) ||
      contact.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      contact.company.toLowerCase().includes(contactSearch.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => contact.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const campaign = campaignManager.createCampaign({
      ...formData,
      status: 'draft'
    })

    if (campaign) {
      // Prepare emails for the campaign
      campaignManager.prepareCampaignEmails(campaign.id, selectedContacts)
      
      setFormData(initialFormData)
      setSelectedContacts([])
      setShowCreateForm(false)
    }
  }

  // Campaign actions
  const startCampaign = (id: string) => {
    campaignManager.startCampaign(id)
  }

  const pauseCampaign = (id: string) => {
    campaignManager.pauseCampaign(id)
  }

  const resumeCampaign = (id: string) => {
    campaignManager.resumeCampaign(id)
  }

  const cancelCampaign = (id: string) => {
    campaignManager.cancelCampaign(id)
  }

  const duplicateCampaign = (id: string) => {
    campaignManager.duplicateCampaign(id)
  }

  const deleteCampaign = (id: string) => {
    campaignManager.deleteCampaign(id)
  }

  // Send test email
  const sendTestEmail = async (campaignId: string) => {
    if (!testEmail) return
    
    try {
      await campaignManager.sendTestEmail(campaignId, testEmail)
      setShowTestModal(null)
      setTestEmail('')
    } catch (error) {
      console.error('Failed to send test email:', error)
    }
  }

  // Contact selection
  const toggleContact = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id)
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id)
      } else {
        return [...prev, contact]
      }
    })
  }

  const selectAllContacts = () => {
    setSelectedContacts(filteredContacts)
  }

  const clearSelectedContacts = () => {
    setSelectedContacts([])
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'scheduled': return 'bg-blue-500'
      case 'sending': return 'bg-yellow-500'
      case 'completed': return 'bg-green-500'
      case 'paused': return 'bg-orange-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Get all unique tags
  const allTags = [...new Set(contacts.flatMap(c => c.tags))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
          <p className="text-gray-400">Create, schedule, and track your email campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Campaign List */}
      <div className="grid gap-4">
        {filteredCampaigns.map(campaign => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(campaign.status)}`} />
                <div>
                  <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                  <p className="text-gray-400 text-sm">{campaign.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Action buttons based on status */}
                {campaign.status === 'draft' && (
                  <button
                    onClick={() => startCampaign(campaign.id)}
                    className="p-2 text-green-400 hover:text-green-300 transition-colors"
                    title="Start Campaign"
                  >
                    <Play size={16} />
                  </button>
                )}
                
                {campaign.status === 'sending' && (
                  <button
                    onClick={() => pauseCampaign(campaign.id)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Pause Campaign"
                  >
                    <Pause size={16} />
                  </button>
                )}
                
                {campaign.status === 'paused' && (
                  <>
                    <button
                      onClick={() => resumeCampaign(campaign.id)}
                      className="p-2 text-green-400 hover:text-green-300 transition-colors"
                      title="Resume Campaign"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => cancelCampaign(campaign.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Cancel Campaign"
                    >
                      <Square size={16} />
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowTestModal(campaign.id)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Send Test Email"
                >
                  <TestTube size={16} />
                </button>
                
                <button
                  onClick={() => duplicateCampaign(campaign.id)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Duplicate Campaign"
                >
                  <Copy size={16} />
                </button>
                
                <button
                  onClick={() => deleteCampaign(campaign.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete Campaign"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{campaign.stats.totalContacts}</div>
                <div className="text-sm text-gray-400">Total Contacts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">{campaign.stats.sent}</div>
                <div className="text-sm text-gray-400">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{campaign.stats.delivered}</div>
                <div className="text-sm text-gray-400">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{campaign.stats.opened}</div>
                <div className="text-sm text-gray-400">Opened</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round((campaign.stats.sent / Math.max(campaign.stats.totalContacts, 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(campaign.stats.sent / Math.max(campaign.stats.totalContacts, 1)) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Mail size={48} className="mx-auto mb-4 opacity-50" />
            <p>No campaigns found. Create your first campaign to get started!</p>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Campaign</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Template Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">
                    Email Template
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <BookOpen size={14} />
                      {formData.selectedTemplate ? 'Change Template' : 'Select Template'}
                    </button>
                    {formData.selectedTemplate && (
                      <button
                        type="button"
                        onClick={clearTemplate}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {formData.selectedTemplate && (
                  <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <FileText size={14} />
                      <span>Using template: {templates.find(t => t.id === formData.selectedTemplate)?.name}</span>
                    </div>
                  </div>
                )}

                {showTemplateSelector && (
                  <div className="border border-gray-600 rounded-lg p-4 bg-gray-700/50 mb-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {templates.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                          <p>No templates available</p>
                          <p className="text-sm">Create templates using the AI Writer</p>
                        </div>
                      ) : (
                        templates.map(template => (
                          <div
                            key={template.id}
                            className="p-3 bg-gray-600/50 rounded-lg border border-gray-500/50 hover:border-blue-500/50 transition-colors cursor-pointer"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-white text-sm">{template.name}</h4>
                                <p className="text-gray-300 text-xs mt-1 truncate">{template.subject}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                    {template.category}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                                    {template.source}
                                  </span>
                                  {template.usageCount > 0 && (
                                    <span className="text-gray-400 text-xs">
                                      Used {template.usageCount} times
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter campaign name"
                />
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter subject line (supports {{firstName}}, {{company}}, etc.)"
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Body
                </label>
                <textarea
                  required
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Enter email body with personalization tokens"
                />
              </div>

              {/* Contact Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">
                    Select Contacts ({selectedContacts.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowContactSelector(!showContactSelector)}
                    className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 transition-colors"
                  >
                    {showContactSelector ? 'Hide' : 'Show'} Contacts
                  </button>
                </div>

                {showContactSelector && (
                  <div className="border border-gray-600 rounded-lg p-4 bg-gray-700/50">
                    {/* Contact Search */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={selectAllContacts}
                        className="px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearSelectedContacts}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Tag Filters */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          )}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Contact List */}
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredContacts.map(contact => (
                        <div
                          key={contact.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedContacts.some(c => c.id === contact.id)
                              ? 'bg-teal-600/30 border border-teal-500'
                              : 'bg-gray-600/30 hover:bg-gray-600/50'
                          }`}
                          onClick={() => toggleContact(contact)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedContacts.some(c => c.id === contact.id)}
                            onChange={() => toggleContact(contact)}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                          />
                          <div className="flex-1">
                            <div className="text-white font-medium">{getFullName(contact)}</div>
                            <div className="text-gray-400 text-sm">{contact.email} • {contact.company}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Campaign Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings.enablePersonalization}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, enablePersonalization: e.target.checked }
                      }))}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-white">Enable Personalization</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings.enableTracking}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, enableTracking: e.target.checked }
                      }))}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-white">Enable Tracking</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm text-white mb-1">Send Delay (seconds)</label>
                    <input
                      type="number"
                      min="1"
                      max="3600"
                      value={formData.settings.sendDelay}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, sendDelay: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings.testMode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, testMode: e.target.checked }
                      }))}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-white">Test Mode</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedContacts.length === 0}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Send Test Email</h3>
              <button
                onClick={() => setShowTestModal(null)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter test email address"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowTestModal(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendTestEmail(showTestModal)}
                  disabled={!testEmail}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Test
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 