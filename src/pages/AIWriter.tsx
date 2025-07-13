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
  PenTool
} from 'lucide-react'
import { useAI, EmailPrompt } from '../lib/ai'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { toast } from 'react-hot-toast'

export function AIWriter() {
  const ai = useAI()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  
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
    { id: 'urgent', name: 'Urgent', description: 'Time-sensitive and direct' },
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
      toast.error('Failed to generate email')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail)
    toast.success('Email copied to clipboard!')
  }

  const saveTemplate = () => {
    // TODO: Implement save functionality
    toast.success('Template saved!')
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
        {isInitializing && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
            <LoadingSpinner />
            <span className="text-primary-400 text-sm">Initializing AI...</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="neo-card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={20} />
              Email Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Product/Service *
                </label>
                <input
                  type="text"
                  value={prompt.product}
                  onChange={(e) => setPrompt({ ...prompt, product: e.target.value })}
                  placeholder="e.g., Marketing automation software"
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

          {/* Tone and Length */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="neo-card p-6"
          >
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Tone</label>
                <select
                  value={prompt.tone}
                  onChange={(e) => setPrompt({ ...prompt, tone: e.target.value })}
                  className="neo-input"
                >
                  {tones.map((tone) => (
                    <option key={tone.id} value={tone.id}>
                      {tone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Length</label>
                <select
                  value={prompt.length}
                  onChange={(e) => setPrompt({ ...prompt, length: e.target.value })}
                  className="neo-input"
                >
                  {lengths.map((length) => (
                    <option key={length.id} value={length.id}>
                      {length.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isInitializing}
              className="neo-button w-full group flex items-center justify-center gap-2 py-4"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                  Generate Email
                </>
              )}
            </button>
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
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
                    title="Copy to clipboard"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
                    title="Regenerate"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={saveTemplate}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
                    title="Save template"
                  >
                    <Save size={16} />
                  </button>
                </div>
              )}
            </div>

            {generatedEmail ? (
              <div className="space-y-4">
                <textarea
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  className="neo-input min-h-[400px] font-mono text-sm"
                  placeholder="Generated email will appear here..."
                />
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock size={14} />
                  <span>
                    {generatedEmail.split(' ').length} words • 
                    {Math.ceil(generatedEmail.length / 500)} min read
                  </span>
                </div>
              </div>
            ) : (
              <div className="min-h-[400px] flex items-center justify-center text-white/50">
                <div className="text-center">
                  <Mail size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Fill in the parameters and click "Generate Email" to create your cold email</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 