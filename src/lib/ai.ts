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

// Fallback service for when WebLLM is not available
class FallbackAIService implements AIService {
  public isInitialized = true
  public isInitializing = false

  async initialize(): Promise<void> {
    // No initialization needed for fallback
  }

  async generateEmail(prompt: EmailPrompt): Promise<string> {
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const templates = {
      B2B: {
        subject: `Quick question about ${prompt.product} for ${prompt.audience}`,
        body: `Hi {{first_name}},

I noticed that ${prompt.audience} often struggle with [specific pain point]. At [Company], we've helped similar companies achieve [specific result] with ${prompt.product}.

For example, [Company Example] saw [specific metric improvement] after implementing our solution.

${prompt.cta}

Would you be interested in a brief 15-minute call to discuss how we could help [Company Name] achieve similar results?

Best regards,
[Your Name]`
      },
      SaaS: {
        subject: `${prompt.product} - Free trial for ${prompt.audience}`,
        body: `Hi {{first_name}},

I saw that {{company}} is in the ${prompt.audience} space and thought you might be interested in ${prompt.product}.

We've helped companies like yours:
• [Benefit 1]
• [Benefit 2]  
• [Benefit 3]

${prompt.cta}

Would you like to try a free 14-day trial? I can set you up in less than 5 minutes.

Best,
[Your Name]`
      },
      Services: {
        subject: `Help {{company}} with [specific service area]`,
        body: `Hi {{first_name}},

I've been following {{company}}'s work in [industry] and I'm impressed by [specific achievement].

We specialize in helping ${prompt.audience} with ${prompt.product}. Our recent client [Company] achieved [specific result] in just [timeframe].

${prompt.cta}

Would you be open to a brief conversation about how we could help {{company}} achieve similar results?

Best regards,
[Your Name]`
      }
    }

    const template = templates[prompt.template as keyof typeof templates] || templates.B2B
    
    return `Subject: ${template.subject}

${template.body}`
  }
}

// Create singleton instance
export const aiService: AIService = (() => {
  try {
    return new WebLLMService()
  } catch (error) {
    console.warn('WebLLM not available, using fallback service')
    return new FallbackAIService()
  }
})()

// Hook for React components
export const useAI = () => {
  return aiService
} 