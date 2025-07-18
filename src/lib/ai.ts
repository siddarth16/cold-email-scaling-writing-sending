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
    // Test API connectivity first
    try {
      console.log('Testing API connectivity...')
      const testResponse = await fetch('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log('Test API response status:', testResponse.status)
      if (testResponse.ok) {
        const testData = await testResponse.json()
        console.log('Test API response:', testData)
      } else {
        console.error('Test API failed:', await testResponse.text())
      }
    } catch (error) {
      console.error('Test API error:', error)
    }
    
    // Gemini API doesn't require initialization, mark as ready
    this.isInitialized = true
  }

  async generateEmail(prompt: EmailPrompt): Promise<EmailGenerationResult> {
    try {
      console.log('Making API call to:', '/api/generate-email')
      console.log('Request payload:', JSON.stringify(prompt, null, 2))
      
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers))

      if (!response.ok) {
        const responseText = await response.text()
        console.error('API response error:', responseText)
        
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText }
        }
        
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
          error: errorData.error || `API error: ${response.status} - ${responseText}`
        }
      }

      const result = await response.json()
      console.log('API response success:', result)
      return result
    } catch (error) {
      console.error('AI API error:', error)
      return {
        subjects: [],
        bodies: [],
        error: `Failed to connect to AI service: ${error instanceof Error ? error.message : 'Unknown error'}`
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