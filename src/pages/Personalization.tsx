import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Building, 
  Mail, 
  Eye, 
  Code, 
  Sparkles,
  Copy,
  Check,
  Plus,
  X
} from 'lucide-react'
import { PersonalizationEngine, PERSONALIZATION_TOKENS } from '../lib/personalization'
import { Contact, getFullName } from '../lib/contacts'
import { useContacts } from '../lib/contacts'

interface PersonalizationTemplate {
  id: string
  name: string
  subject: string
  body: string
  createdAt: string
  updatedAt: string
}

export default function Personalization() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [previewContact, setPreviewContact] = useState<Contact>(PersonalizationEngine.getPreviewContact())
  const [showPreview, setShowPreview] = useState(false)
  const [templates, setTemplates] = useState<PersonalizationTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [showTokenHelper, setShowTokenHelper] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const contactManager = useContacts()
  const contacts = contactManager.getAllContacts()

  // Load templates from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('coldscale_personalization_templates')
    if (stored) {
      setTemplates(JSON.parse(stored))
    }
  }, [])

  // Save templates to localStorage
  const saveTemplates = (newTemplates: PersonalizationTemplate[]) => {
    localStorage.setItem('coldscale_personalization_templates', JSON.stringify(newTemplates))
    setTemplates(newTemplates)
  }

  // Generate personalized preview
  const generatePreview = () => {
    const personalizedSubject = PersonalizationEngine.personalizeSubject(subject, previewContact)
    const personalizedBody = PersonalizationEngine.personalizeBody(body, previewContact)
    return { subject: personalizedSubject, body: personalizedBody }
  }

  // Insert token at cursor position
  const insertToken = (token: string, field: 'subject' | 'body') => {
    const formattedToken = PersonalizationEngine.formatToken(token)
    if (field === 'subject') {
      setSubject(prev => prev + formattedToken)
    } else {
      setBody(prev => prev + formattedToken)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // Save template
  const saveTemplate = () => {
    if (!templateName.trim()) return

    const newTemplate: PersonalizationTemplate = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name: templateName,
      subject,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    saveTemplates([...templates, newTemplate])
    setTemplateName('')
  }

  // Load template
  const loadTemplate = (template: PersonalizationTemplate) => {
    setSubject(template.subject)
    setBody(template.body)
    setSelectedTemplate(template.id)
  }

  // Delete template
  const deleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id))
    if (selectedTemplate === id) {
      setSelectedTemplate(null)
    }
  }

  // Validate tokens
  const subjectValidation = PersonalizationEngine.validateTokens(subject)
  const bodyValidation = PersonalizationEngine.validateTokens(body)

  const preview = generatePreview()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Personalization</h1>
          <p className="text-gray-400">Create personalized email templates with dynamic tokens</p>
        </div>
        <button
          onClick={() => setShowTokenHelper(!showTokenHelper)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Code size={20} />
          Token Helper
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Helper Sidebar */}
        {showTokenHelper && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Available Tokens</h3>
              <div className="space-y-3">
                {PERSONALIZATION_TOKENS.map(token => (
                  <div key={token.key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{token.label}</div>
                      <div className="text-xs text-gray-400">{token.description}</div>
                                             <div className="text-xs text-teal-400 mt-1">{`{{${token.key}}}`}</div>
                    </div>
                    <button
                      onClick={() => insertToken(token.key, 'subject')}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Insert into subject"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Contact Selector */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Preview Contact</h3>
              <select
                value={previewContact.id}
                onChange={(e) => {
                  const contact = contacts.find(c => c.id === e.target.value) || PersonalizationEngine.getPreviewContact()
                  setPreviewContact(contact)
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="preview">Sample Contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {getFullName(contact)} - {contact.company}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {/* Main Editor */}
        <div className={`${showTokenHelper ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          {/* Template Management */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={saveTemplate}
                  disabled={!templateName.trim()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {templates.map(template => (
                  <div key={template.id} className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1">
                    <button
                      onClick={() => loadTemplate(template)}
                      className="text-sm text-white hover:text-teal-400 transition-colors"
                    >
                      {template.name}
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Line Editor */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Subject Line</h3>
              <div className="flex items-center gap-2">
                {!subjectValidation.valid && (
                  <span className="text-red-400 text-sm">
                    Invalid tokens: {subjectValidation.unsupportedTokens.join(', ')}
                  </span>
                )}
                <button
                  onClick={() => copyToClipboard(subject, 'subject')}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'subject' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject line with tokens like {{firstName}}"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Body Editor */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Email Body</h3>
              <div className="flex items-center gap-2">
                {!bodyValidation.valid && (
                  <span className="text-red-400 text-sm">
                    Invalid tokens: {bodyValidation.unsupportedTokens.join(', ')}
                  </span>
                )}
                <button
                  onClick={() => copyToClipboard(body, 'body')}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'body' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter email body with tokens like {{firstName}}, {{company}}, etc."
              rows={12}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Preview Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-6 py-3 bg-copper-600 text-white rounded-lg hover:bg-copper-700 transition-colors"
            >
              <Eye size={20} />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Preview */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-teal-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Preview</h3>
                <span className="text-sm text-gray-400">
                  for {getFullName(previewContact)} ({previewContact.company})
                </span>
              </div>
              
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <div className="text-sm text-gray-600">Subject:</div>
                  <div className="text-lg font-semibold text-gray-900">{preview.subject}</div>
                </div>
                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                  {preview.body}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 