import { CreateMLCEngine } from '@mlc-ai/web-llm'

export interface EmailPrompt {
  product: string
  audience: string
  objective: string
  tone: string
  cta: string
  length: string
  template: string
}

export interface AIService {
  isInitialized: boolean
  isInitializing: boolean
  generateEmail: (prompt: EmailPrompt) => Promise<string>
  initialize: () => Promise<void>
}

class WebLLMService implements AIService {
  private engine: any = null
  public isInitialized = false
  public isInitializing = false

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return
    
    this.isInitializing = true
    try {
      // Using a smaller model for better performance
      this.engine = await CreateMLCEngine(
        'Llama-3.2-3B-Instruct-q4f32_1-MLC',
        {
          initProgressCallback: (progress) => {
            console.log('AI Model Loading:', progress)
          }
        }
      )
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize AI model:', error)
      throw error
    } finally {
      this.isInitializing = false
    }
  }

  async generateEmail(prompt: EmailPrompt): Promise<string> {
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const toneModifiers = {
      professional: { 
        greeting: ['Hi', 'Hello', 'Good morning', 'Good afternoon'],
        closing: ['Best regards', 'Sincerely', 'Best', 'Kind regards'],
        style: 'formal',
        adjectives: ['efficient', 'streamlined', 'professional', 'reliable', 'proven']
      },
      friendly: { 
        greeting: ['Hello', 'Hi there', 'Hey', 'Hope you\'re doing well'],
        closing: ['Cheers', 'Best wishes', 'Talk soon', 'Looking forward to connecting'],
        style: 'warm',
        adjectives: ['amazing', 'fantastic', 'exciting', 'wonderful', 'great']
      },
      casual: { 
        greeting: ['Hey', 'Hi', 'Hello there', 'Hope you\'re well'],
        closing: ['Thanks', 'Appreciate your time', 'Let me know', 'Talk soon'],
        style: 'relaxed',
        adjectives: ['cool', 'awesome', 'neat', 'pretty good', 'solid']
      },
      persuasive: { 
        greeting: ['Hi', 'Hello', 'I hope this finds you well'],
        closing: ['Looking forward to hearing from you', 'Eager to connect', 'Hope to hear back soon', 'Excited to discuss'],
        style: 'compelling',
        adjectives: ['game-changing', 'revolutionary', 'breakthrough', 'cutting-edge', 'transformative']
      },
      consultative: { 
        greeting: ['Hello', 'Hi', 'Good day', 'I hope you\'re well'],
        closing: ['Happy to discuss further', 'Open to exploring this', 'Would love to share insights', 'Available for a conversation'],
        style: 'advisory',
        adjectives: ['strategic', 'insightful', 'valuable', 'beneficial', 'optimized']
      }
    }

    const modifier = toneModifiers[prompt.tone as keyof typeof toneModifiers] || toneModifiers.professional
    const randomGreeting = modifier.greeting[Math.floor(Math.random() * modifier.greeting.length)]
    const randomClosing = modifier.closing[Math.floor(Math.random() * modifier.closing.length)]
    const randomAdjective = modifier.adjectives[Math.floor(Math.random() * modifier.adjectives.length)]

    // Generate varied content based on length
    const generateContent = () => {
      const baseElements = {
        hook: [
          `I came across {{company}} and was impressed by your work in the ${prompt.audience} space.`,
          `I noticed {{company}} is growing rapidly and thought you might be interested in ${prompt.product}.`,
          `Your role with ${prompt.audience} caught my attention, and I believe ${prompt.product} could be valuable.`,
          `I've been following {{company}}'s success and think there's an opportunity to discuss ${prompt.product}.`,
          `As someone working with ${prompt.audience}, you might find ${prompt.product} interesting.`
        ],
        
        value: [
          `We've helped similar companies achieve:\n• ${Math.floor(Math.random() * 40 + 20)}% reduction in operational costs\n• ${Math.floor(Math.random() * 50 + 30)}% improvement in efficiency\n• ${randomAdjective} ROI within ${Math.floor(Math.random() * 6 + 3)} months`,
          `Companies like {{company}} have seen:\n• ${Math.floor(Math.random() * 60 + 40)}% increase in productivity\n• Streamlined ${prompt.audience} workflows\n• ${randomAdjective} results in just ${Math.floor(Math.random() * 8 + 4)} weeks`,
          `Our ${prompt.product} has delivered:\n• ${Math.floor(Math.random() * 35 + 15)}% cost savings for clients\n• ${randomAdjective} improvements in ${prompt.audience} operations\n• Faster time-to-market by ${Math.floor(Math.random() * 40 + 20)}%`
        ],

        social_proof: [
          `[Company Name] recently achieved a ${Math.floor(Math.random() * 200 + 100)}% increase in ${prompt.objective.toLowerCase()} after implementing our solution.`,
          `We just helped a ${prompt.audience} company similar to {{company}} ${prompt.objective.toLowerCase()} and saw ${randomAdjective} results.`,
          `Our recent client in the ${prompt.audience} sector saw ${Math.floor(Math.random() * 150 + 50)}% improvement in their key metrics.`
        ],

        questions: [
          `Would you be interested in learning how {{company}} could achieve similar results?`,
          `Are you currently facing any challenges with ${prompt.audience} operations that we could help address?`,
          `Would a brief conversation about ${prompt.product} be valuable for {{company}}?`,
          `Is this something that might be relevant for {{company}}'s current priorities?`
        ]
      }

      const hook = baseElements.hook[Math.floor(Math.random() * baseElements.hook.length)]
      const value = baseElements.value[Math.floor(Math.random() * baseElements.value.length)]
      const social = baseElements.social_proof[Math.floor(Math.random() * baseElements.social_proof.length)]
      const question = baseElements.questions[Math.floor(Math.random() * baseElements.questions.length)]

      // Build email based on length
      let body = `${randomGreeting} {{firstName}},\n\n${hook}\n\n`

      if (prompt.length === 'short') {
        // 50-100 words
        body += `${prompt.product} has helped companies like yours ${prompt.objective.toLowerCase()} more effectively.\n\n${prompt.cta}\n\n${question}\n\n${randomClosing},\n[Your Name]`
      } else if (prompt.length === 'medium') {
        // 100-150 words  
        body += `${value}\n\n${prompt.cta}\n\n${question}\n\n${randomClosing},\n[Your Name]\n\nP.S. I'd be happy to share a brief case study if you're interested.`
      } else {
        // 150-200+ words
        body += `${value}\n\n${social}\n\n${prompt.cta}\n\n${question} I'd love to share more details about how we've helped companies in your industry.\n\nWe could start with a quick ${Math.floor(Math.random() * 10 + 10)}-minute call to see if there's a fit.\n\n${randomClosing},\n[Your Name]\n\nP.S. I have a ${randomAdjective} case study from a ${prompt.audience} company that achieved remarkable results - would you like me to send it over?`
      }

      return body
    }

    // Generate subject lines based on template and add variation
    const subjectVariations = {
      'B2B': [
        `Quick question about {{company}}'s ${prompt.audience} strategy`,
        `${randomAdjective} ${prompt.product} solution for {{company}}`,
        `Helping ${prompt.audience} companies like {{company}} ${prompt.objective.toLowerCase()}`,
        `${prompt.product} - ${Math.floor(Math.random() * 50 + 20)}% improvement for ${prompt.audience}`
      ],
      'SaaS': [
        `${prompt.product} - Free trial for {{company}}`,
        `${Math.floor(Math.random() * 30 + 14)}-day free trial: ${prompt.product}`,
        `{{company}} + ${prompt.product} = ${randomAdjective} results`,
        `Quick demo of ${prompt.product} for ${prompt.audience}?`
      ],
      'Services': [
        `Help {{company}} ${prompt.objective.toLowerCase()} with ${prompt.product}`,
        `${prompt.product} consultation for {{company}}`,
        `${randomAdjective} ${prompt.product} results for ${prompt.audience}`,
        `Transform {{company}}'s ${prompt.audience} strategy`
      ],
      'Agency': [
        `Case study: ${Math.floor(Math.random() * 300 + 100)}% increase for [Similar Company]`,
        `How we helped [Client] ${prompt.objective.toLowerCase()} in ${Math.floor(Math.random() * 60 + 30)} days`,
        `${randomAdjective} results for ${prompt.audience} companies`,
        `{{company}} - interested in ${prompt.product} success stories?`
      ],
      'E-commerce': [
        `${Math.floor(Math.random() * 40 + 20)}% off ${prompt.product} for {{company}}`,
        `Special offer: ${prompt.product} for ${prompt.audience}`,
        `Limited time: ${randomAdjective} ${prompt.product} deal`,
        `Boost {{company}}'s sales with ${prompt.product}`
      ],
      'Networking': [
        `Connecting with fellow ${prompt.audience} professional`,
        `{{firstName}}, interested in ${prompt.product} insights?`,
        `${prompt.audience} networking - thought you'd be interested`,
        `Quick chat about ${prompt.product} trends?`
      ]
    }

    const subjects = subjectVariations[prompt.template as keyof typeof subjectVariations] || subjectVariations['B2B']
    const subject = subjects[Math.floor(Math.random() * subjects.length)]
    const body = generateContent()
    
    return `Subject: ${subject}\n\n${body}`
  }
}

// Enhanced Fallback service for when WebLLM is not available
class FallbackAIService implements AIService {
  public isInitialized = true
  public isInitializing = false

  async initialize(): Promise<void> {
    // No initialization needed for fallback
  }

  async generateEmail(prompt: EmailPrompt): Promise<string> {
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const toneModifiers = {
      professional: { greeting: 'Hi', closing: 'Best regards', style: 'formal' },
      friendly: { greeting: 'Hello', closing: 'Cheers', style: 'warm' },
      casual: { greeting: 'Hey', closing: 'Thanks', style: 'relaxed' },
      persuasive: { greeting: 'Hi', closing: 'Looking forward to hearing from you', style: 'compelling' },
      consultative: { greeting: 'Hello', closing: 'Happy to discuss further', style: 'advisory' }
    }

    const modifier = toneModifiers[prompt.tone as keyof typeof toneModifiers] || toneModifiers.professional

    const templates = {
      'B2B': {
        subject: `Quick question about improving ${prompt.audience} operations`,
        body: `${modifier.greeting} {{firstName}},

I noticed that many ${prompt.audience} struggle with optimizing their processes, and I thought ${prompt.product} might be relevant for {{company}}.

We've recently helped similar companies achieve:
• 25% reduction in operational costs
• 40% improvement in efficiency
• Significant ROI within 3 months

${prompt.cta}

Would you be open to a brief 15-minute conversation to explore how we could help {{company}} achieve similar results?

${modifier.closing},
[Your Name]

P.S. I'd be happy to share a case study from a company in your industry if that would be helpful.`
      },
      
      'SaaS': {
        subject: `${prompt.product} - Free trial for {{company}}`,
        body: `${modifier.greeting} {{firstName}},

I saw that {{company}} is working with ${prompt.audience}, and I thought you might be interested in ${prompt.product}.

Here's what companies like yours have achieved:
• Streamlined workflows and processes
• Increased team productivity by 35%
• Better data insights and reporting

${prompt.cta}

I'd love to set up a quick demo tailored to {{company}}'s specific needs. Would you have 15 minutes this week?

${modifier.closing},
[Your Name]

P.S. We offer a free 14-day trial - no credit card required.`
      },

      'Services': {
        subject: `Help {{company}} optimize ${prompt.objective.toLowerCase()}`,
        body: `${modifier.greeting} {{firstName}},

I've been following {{company}}'s growth and noticed you're expanding your ${prompt.audience} operations.

With our expertise in ${prompt.product}, we've helped companies like yours:
• Reduce time-to-market by 30%
• Improve operational efficiency
• Scale sustainable growth strategies

${prompt.cta}

Would you be interested in a strategic consultation to discuss how we could support {{company}}'s objectives?

${modifier.closing},
[Your Name]

P.S. I'd be happy to share some insights from our recent work with similar companies.`
      },

      'Agency': {
        subject: `Case study: How we helped [Similar Company] ${prompt.objective.toLowerCase()}`,
        body: `${modifier.greeting} {{firstName}},

I came across {{company}} and was impressed by your approach to ${prompt.audience} engagement.

We recently worked with [Similar Company] and achieved:
• 180% increase in lead generation
• 45% improvement in conversion rates
• 3x ROI within 6 months

The challenge they faced was similar to what many ${prompt.audience} experience with ${prompt.product}.

${prompt.cta}

Would you be interested in a brief call to discuss how we could achieve similar results for {{company}}?

${modifier.closing},
[Your Name]

P.S. I can share the full case study if you're interested in the details.`
      },

      'E-commerce': {
        subject: `Special offer: ${prompt.product} for {{company}}`,
        body: `${modifier.greeting} {{firstName}},

I noticed {{company}} serves ${prompt.audience}, and I thought you'd be interested in our ${prompt.product} solution.

Right now, we're offering:
• 30% discount for new customers
• Free setup and onboarding
• 60-day money-back guarantee

This has helped similar businesses:
• Increase sales by 25%
• Reduce cart abandonment by 40%
• Improve customer satisfaction

${prompt.cta}

This offer expires soon - would you like to schedule a quick demo to see how it works?

${modifier.closing},
[Your Name]

P.S. Limited time offer - only available this month.`
      },

      'Networking': {
        subject: `Connecting with fellow ${prompt.audience} professional`,
        body: `${modifier.greeting} {{firstName}},

I came across your profile and was impressed by your work at {{company}} in the ${prompt.audience} space.

I'm passionate about ${prompt.product} and connecting with like-minded professionals who are driving innovation in our industry.

${prompt.cta}

Would you be open to connecting and sharing insights about trends in ${prompt.audience}? I'd love to learn more about your experience at {{company}}.

${modifier.closing},
[Your Name]

P.S. I recently wrote an article about ${prompt.product} trends that might interest you - happy to share if you'd like.`
      }
    }

    const template = templates[prompt.template as keyof typeof templates] || templates['B2B']
    
    return `Subject: ${template.subject}

${template.body}`
  }
}

// Create a hybrid service that tries WebLLM first, then falls back
class HybridAIService implements AIService {
  private webLLMService = new WebLLMService()
  private fallbackService = new FallbackAIService()
  private shouldUseFallback = false

  get isInitialized() {
    return this.shouldUseFallback ? this.fallbackService.isInitialized : this.webLLMService.isInitialized
  }

  get isInitializing() {
    return this.webLLMService.isInitializing
  }

  async initialize(): Promise<void> {
    try {
      await this.webLLMService.initialize()
      this.shouldUseFallback = false
    } catch (error) {
      console.log('WebLLM initialization failed, using fallback service')
      this.shouldUseFallback = true
      await this.fallbackService.initialize()
    }
  }

  async generateEmail(prompt: EmailPrompt): Promise<string> {
    if (this.shouldUseFallback) {
      return this.fallbackService.generateEmail(prompt)
    }

    try {
      return await this.webLLMService.generateEmail(prompt)
    } catch (error) {
      console.log('WebLLM generation failed, falling back to template service')
      this.shouldUseFallback = true
      return this.fallbackService.generateEmail(prompt)
    }
  }
}

// Export the AI service instance
let aiService: AIService

// Create service instance
aiService = new HybridAIService()

export function useAI() {
  return aiService
} 