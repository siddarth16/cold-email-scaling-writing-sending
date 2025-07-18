import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Save, 
  Download,
  Settings,
  Zap,
  Mail,
  Target,
  MessageCircle,
  Clock,
  PenTool,
  ChevronDown,
  BookOpen,
  X
} from 'lucide-react'
import { useAI, EmailPrompt } from '../lib/ai'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { useTemplates } from '../lib/templates'

// Custom Dropdown Component
function CustomDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select option" 
}: {
  value: string
  onChange: (value: string) => void
  options: { id: string; name: string; description?: string }[]
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find(option => option.id === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 
                 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500 
                 transition-all duration-200 flex items-center justify-between"
      >
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-gray-800/95 backdrop-blur-md border border-white/10 
                      rounded-lg shadow-xl max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id)
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/10 
                       transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="font-medium">{option.name}</div>
              {option.description && (
                <div className="text-sm text-white/60 mt-1">{option.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AIWriter() {
  const ai = useAI()
  const templateManager = useTemplates()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [templateTags, setTemplateTags] = useState('')
  
  const [prompt, setPrompt] = useState<EmailPrompt>({
    product: '',
    audience: '',
    objective: '',
    tone: 'professional',
    cta: '',
    length: 'medium',
    template: 'B2B'
  })

  const templates = [
    { id: 'B2B', name: 'B2B Sales', icon: Target, description: 'Professional, value-focused outreach' },
    { id: 'SaaS', name: 'SaaS Product', icon: Zap, description: 'Feature-benefit focused with trial CTAs' },
    { id: 'Services', name: 'Services', icon: PenTool, description: 'Expertise-focused consultation requests' },
    { id: 'Agency', name: 'Agency', icon: MessageCircle, description: 'Results-focused with case studies' },
    { id: 'E-commerce', name: 'E-commerce', icon: Download, description: 'Product-focused with offers' },
    { id: 'Networking', name: 'Networking', icon: Mail, description: 'Relationship-focused connections' }
  ]

  const tones = [
    { id: 'professional', name: 'Professional', description: 'Formal and business-focused' },
    { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and conversational' },
    { id: 'persuasive', name: 'Persuasive', description: 'Compelling and action-oriented' },
    { id: 'consultative', name: 'Consultative', description: 'Advisory and helpful' }
  ]

  const lengths = [
    { id: 'short', name: 'Short', description: '50-100 words' },
    { id: 'medium', name: 'Medium', description: '100-150 words' },
    { id: 'long', name: 'Long', description: '150-200 words' }
  ]

  useEffect(() => {
    if (!ai.isInitialized && !ai.isInitializing) {
      setIsInitializing(true)
      ai.initialize()
        .then(() => {
          toast.success('AI model initialized successfully!')
        })
        .catch((error) => {
          console.error('AI initialization failed:', error)
          toast.error('AI model failed to initialize, using fallback')
        })
        .finally(() => {
          setIsInitializing(false)
        })
    }
  }, [ai])

  const handleGenerate = async () => {
    if (!prompt.product || !prompt.audience || !prompt.objective || !prompt.cta) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    try {
      const result = await ai.generateEmail(prompt)
      setGeneratedEmail(result)
      toast.success('Email generated successfully!')
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate email. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail)
    toast.success('Email copied to clipboard!')
  }

  const regenerateEmail = () => {
    if (!prompt.product || !prompt.audience || !prompt.objective || !prompt.cta) {
      toast.error('Please fill in all required fields')
      return
    }
    handleGenerate()
  }

  const saveAsTemplate = () => {
    if (!generatedEmail) {
      toast.error('No email to save')
      return
    }

    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    // Parse subject and body from generated email
    const lines = generatedEmail.split('\n')
    const subjectLine = lines.find(line => line.startsWith('Subject:'))
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : 'Generated Email'
    const bodyStartIndex = lines.findIndex(line => line.startsWith('Subject:')) + 1
    const body = lines.slice(bodyStartIndex).join('\n').trim()

    const tags = templateTags.split(',').map(tag => tag.trim()).filter(tag => tag)

    templateManager.createTemplate({
      name: templateName,
      subject,
      body,
      category: templateCategory || prompt.template,
      tags: [...tags, 'ai-generated', prompt.tone, prompt.length],
      source: 'ai'
    })

    toast.success('Template saved successfully!')
    setShowSaveTemplate(false)
    setTemplateName('')
    setTemplateCategory('')
    setTemplateTags('')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-primary-400" />
            AI Email Writer
          </h1>
          <p className="text-white/70 mt-1">Generate compelling cold emails with AI</p>
        </div>
        {ai.isInitialized && (
          <div className="text-sm text-green-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            AI Initialized
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          {/* Email Parameters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="neo-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Email Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Product/Service *
                </label>
                <input
                  type="text"
                  value={prompt.product}
                  onChange={(e) => setPrompt({ ...prompt, product: e.target.value })}
                  placeholder="e.g., CRM Software, Marketing Services"
                  className="neo-input"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Target Audience *
                </label>
                <input
                  type="text"
                  value={prompt.audience}
                  onChange={(e) => setPrompt({ ...prompt, audience: e.target.value })}
                  placeholder="e.g., Small business owners, Marketing managers"
                  className="neo-input"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Objective *
                </label>
                <input
                  type="text"
                  value={prompt.objective}
                  onChange={(e) => setPrompt({ ...prompt, objective: e.target.value })}
                  placeholder="e.g., Schedule a demo, Get a response, Book a call"
                  className="neo-input"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Call-to-Action *
                </label>
                <input
                  type="text"
                  value={prompt.cta}
                  onChange={(e) => setPrompt({ ...prompt, cta: e.target.value })}
                  placeholder="e.g., Book a 15-minute call, Try our free trial"
                  className="neo-input"
                />
              </div>
            </div>
          </motion.div>

          {/* Template Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="neo-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Template Style</h3>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setPrompt({ ...prompt, template: template.id })}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    prompt.template === template.id
                      ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <template.icon size={16} />
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <p className="text-xs opacity-70">{template.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tone and Length - Fixed Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="neo-card p-6"
          >
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Tone</label>
                <CustomDropdown
                  value={prompt.tone}
                  onChange={(value) => setPrompt({ ...prompt, tone: value })}
                  options={tones}
                  placeholder="Select tone"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Length</label>
                <CustomDropdown
                  value={prompt.length}
                  onChange={(value) => setPrompt({ ...prompt, length: value })}
                  options={lengths}
                  placeholder="Select length"
                />
              </div>
            </div>

            {/* Generate Button - Moved inside this card to prevent layout issues */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isInitializing || !prompt.product || !prompt.audience || !prompt.objective || !prompt.cta}
              className="neo-button w-full group flex items-center justify-center gap-2 py-4"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner />
                  Generating AI Email...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                  Generate Email with AI
                </>
              )}
            </button>

            {(!prompt.product || !prompt.audience || !prompt.objective || !prompt.cta) && (
              <p className="text-yellow-400 text-sm mt-2 text-center">
                Please fill in all required fields to generate email
              </p>
            )}
          </motion.div>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="neo-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Mail size={20} />
                Generated Email
              </h2>
              {generatedEmail && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={regenerateEmail}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Regenerate email"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={() => setShowSaveTemplate(true)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Save as template"
                  >
                    <BookOpen size={18} />
                  </button>
                </div>
              )}
            </div>

            {generatedEmail ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <pre className="text-white/90 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {generatedEmail}
                  </pre>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <button
                    onClick={copyToClipboard}
                    className="neo-button flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy Email
                  </button>
                  <button
                    onClick={() => setShowSaveTemplate(true)}
                    className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
                  >
                    <BookOpen size={16} />
                    Save as Template
                  </button>
                  <button
                    onClick={regenerateEmail}
                    className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60 mb-2">No email generated yet</p>
                <p className="text-white/40 text-sm">Fill in the parameters and click "Generate Email with AI" to get started</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800/95 backdrop-blur-md border border-white/10 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Save as Template</h3>
              <button
                onClick={() => setShowSaveTemplate(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., B2B Cold Outreach v1"
                  className="neo-input"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  placeholder={`e.g., ${prompt.template} (default)`}
                  className="neo-input"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                  placeholder="e.g., outreach, professional, follow-up"
                  className="neo-input"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={saveAsTemplate}
                  disabled={!templateName.trim()}
                  className="neo-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Template
                </button>
                <button
                  onClick={() => setShowSaveTemplate(false)}
                  className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 