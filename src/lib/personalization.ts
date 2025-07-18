import { Contact, getFullName } from './contacts'

export interface PersonalizationToken {
  key: string
  label: string
  description: string
  example: string
}

export const PERSONALIZATION_TOKENS: PersonalizationToken[] = [
  {
    key: 'firstName',
    label: 'First Name',
    description: 'Contact\'s first name',
    example: 'John'
  },
  {
    key: 'lastName',
    label: 'Last Name',
    description: 'Contact\'s last name',
    example: 'Doe'
  },
  {
    key: 'fullName',
    label: 'Full Name',
    description: 'Contact\'s full name',
    example: 'John Doe'
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Contact\'s email address',
    example: 'john.doe@company.com'
  },
  {
    key: 'company',
    label: 'Company',
    description: 'Contact\'s company name',
    example: 'Acme Corp'
  },
  {
    key: 'position',
    label: 'Position',
    description: 'Contact\'s job title',
    example: 'Marketing Manager'
  },
  {
    key: 'industry',
    label: 'Industry',
    description: 'Company industry',
    example: 'Technology'
  },
  {
    key: 'location',
    label: 'Location',
    description: 'Contact\'s location',
    example: 'New York, NY'
  }
]

export class PersonalizationEngine {
  /**
   * Replace tokens in text with actual contact data
   */
  static personalizeText(text: string, contact: Contact): string {
    let personalizedText = text

    // Replace each token with actual contact data
    personalizedText = personalizedText.replace(/\{\{firstName\}\}/g, contact.firstName || 'there')
    personalizedText = personalizedText.replace(/\{\{lastName\}\}/g, contact.lastName || '')
    personalizedText = personalizedText.replace(/\{\{fullName\}\}/g, getFullName(contact) || contact.firstName || 'there')
    personalizedText = personalizedText.replace(/\{\{email\}\}/g, contact.email || '')
    personalizedText = personalizedText.replace(/\{\{company\}\}/g, contact.company || 'your company')
    personalizedText = personalizedText.replace(/\{\{position\}\}/g, contact.position || '')
    personalizedText = personalizedText.replace(/\{\{industry\}\}/g, contact.industry || '')
    personalizedText = personalizedText.replace(/\{\{location\}\}/g, contact.location || '')

    return personalizedText
  }

  /**
   * Extract all tokens from text
   */
  static extractTokens(text: string): string[] {
    const tokenRegex = /\{\{([^}]+)\}\}/g
    const tokens: string[] = []
    let match

    while ((match = tokenRegex.exec(text)) !== null) {
      if (!tokens.includes(match[1])) {
        tokens.push(match[1])
      }
    }

    return tokens
  }

  /**
   * Validate if all tokens in text are supported
   */
  static validateTokens(text: string): { valid: boolean; unsupportedTokens: string[] } {
    const extractedTokens = this.extractTokens(text)
    const supportedTokens = PERSONALIZATION_TOKENS.map(token => token.key)
    const unsupportedTokens = extractedTokens.filter(token => !supportedTokens.includes(token))

    return {
      valid: unsupportedTokens.length === 0,
      unsupportedTokens
    }
  }

  /**
   * Get available tokens for autocomplete
   */
  static getAvailableTokens(): PersonalizationToken[] {
    return PERSONALIZATION_TOKENS
  }

  /**
   * Format token for display in editor
   */
  static formatToken(key: string): string {
    return `{{${key}}}`
  }

  /**
   * Get preview data for demonstration
   */
  static getPreviewContact(): Contact {
    return {
      id: 'preview',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@acmecorp.com',
      company: 'Acme Corp',
      position: 'Marketing Manager',
      industry: 'Technology',
      location: 'New York, NY',
      tags: ['lead', 'enterprise'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Generate personalized subject line
   */
  static personalizeSubject(subject: string, contact: Contact): string {
    return this.personalizeText(subject, contact)
  }

  /**
   * Generate personalized email body
   */
  static personalizeBody(body: string, contact: Contact): string {
    return this.personalizeText(body, contact)
  }

  /**
   * Check if text contains any personalization tokens
   */
  static hasTokens(text: string): boolean {
    return /\{\{[^}]+\}\}/.test(text)
  }

  /**
   * Get token usage statistics
   */
  static getTokenStats(text: string): Record<string, number> {
    const tokens = this.extractTokens(text)
    const stats: Record<string, number> = {}

    tokens.forEach(token => {
      const regex = new RegExp(`\\{\\{${token}\\}\\}`, 'g')
      const matches = text.match(regex)
      stats[token] = matches ? matches.length : 0
    })

    return stats
  }
} 