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
    if (!this.isInitialized) {
      throw new Error('AI model not initialized')
    }

    const systemPrompt = `You are an expert cold email copywriter. Write compelling, personalized cold emails that convert. Follow these guidelines:

1. Keep it concise and scannable
2. Focus on the recipient's pain points and benefits
3. Use a conversational tone
4. Include a clear call-to-action
5. Avoid spam triggers
6. Make it feel personal, not templated

Template styles:
- B2B: Professional, value-focused, ROI-driven
- SaaS: Feature-benefit focused, demo/trial CTAs
- Services: Expertise-focused, consultation CTAs
- Agency: Results-focused, case study mentions
- E-commerce: Product-focused, discount/offer CTAs
- Networking: Relationship-focused, connection CTAs`

    const userPrompt = `Write a ${prompt.template} cold email with these parameters:

Product/Service: ${prompt.product}
Target Audience: ${prompt.audience}
Objective: ${prompt.objective}
Tone: ${prompt.tone}
Call-to-Action: ${prompt.cta}
Length: ${prompt.length}

Generate only the email content (subject line + body). Format as:
Subject: [subject line]

[email body]`

    try {
      const response = await this.engine.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      return response.choices[0]?.message?.content || 'Failed to generate email'
    } catch (error) {
      console.error('Email generation failed:', error)
      throw error
    }
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