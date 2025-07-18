export interface EmailPrompt {
  product: string
  audience: string
  objective: string
  tone: string
  cta: string
  length: string
  template: string
}

export interface EmailGenerationResult {
  subjects: string[]
  bodies: string[]
  error?: string
}

export interface AIService {
  isInitialized: boolean
  isInitializing: boolean
  generateEmail: (prompt: EmailPrompt) => Promise<EmailGenerationResult>
  initialize: () => Promise<void>
}

class GeminiAIService implements AIService {
  public isInitialized = false
  public isInitializing = false

  async initialize(): Promise<void> {
    // Gemini API doesn't require initialization, mark as ready
    this.isInitialized = true
  }

  async generateEmail(prompt: EmailPrompt): Promise<EmailGenerationResult> {
    try {
      // Call our Vercel API endpoint
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt)
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          return {
            subjects: [],
            bodies: [],
            error: 'Limit reached, try after 2 minutes'
          }
        }
        
        return {
          subjects: [],
          bodies: [],
          error: errorData.error || `API error: ${response.status}`
        }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Gemini API error:', error)
      return {
        subjects: [],
        bodies: [],
        error: 'Failed to connect to AI service'
      }
    }
  }
}

// Export the AI service instance
let aiService: AIService

// Create service instance
aiService = new GeminiAIService()

export function useAI() {
  return aiService
} 