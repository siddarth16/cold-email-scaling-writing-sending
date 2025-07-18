export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  source: 'ai' | 'manual' | 'imported'
  usageCount: number
}

export interface TemplateFilter {
  search: string
  category: string
  tags: string[]
  source?: 'ai' | 'manual' | 'imported'
}

class TemplateManager {
  private templates: EmailTemplate[] = []
  private listeners: ((templates: EmailTemplate[]) => void)[] = []
  private storageKey = 'coldscale_email_templates'

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.templates = JSON.parse(stored)
        this.notifyListeners()
      }
    } catch (error) {
      console.error('Failed to load templates from storage:', error)
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.templates))
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to save templates to storage:', error)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.templates]))
  }

  subscribe(listener: (templates: EmailTemplate[]) => void) {
    this.listeners.push(listener)
    listener([...this.templates])
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  getAllTemplates(): EmailTemplate[] {
    return [...this.templates]
  }

  getTemplateById(id: string): EmailTemplate | undefined {
    return this.templates.find(template => template.id === id)
  }

  createTemplate(templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): EmailTemplate {
    const template: EmailTemplate = {
      ...templateData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    }

    this.templates.unshift(template)
    this.saveToStorage()
    return template
  }

  updateTemplate(id: string, updates: Partial<Omit<EmailTemplate, 'id' | 'createdAt'>>): EmailTemplate | null {
    const index = this.templates.findIndex(template => template.id === id)
    if (index === -1) return null

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveToStorage()
    return this.templates[index]
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(template => template.id === id)
    if (index === -1) return false

    this.templates.splice(index, 1)
    this.saveToStorage()
    return true
  }

  incrementUsage(id: string): void {
    const template = this.templates.find(t => t.id === id)
    if (template) {
      template.usageCount++
      template.updatedAt = new Date().toISOString()
      this.saveToStorage()
    }
  }

  filterTemplates(filter: TemplateFilter): EmailTemplate[] {
    return this.templates.filter(template => {
      // Search filter
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase()
        const matchesSearch = 
          template.name.toLowerCase().includes(searchTerm) ||
          template.subject.toLowerCase().includes(searchTerm) ||
          template.body.toLowerCase().includes(searchTerm) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        
        if (!matchesSearch) return false
      }

      // Category filter
      if (filter.category && filter.category !== 'all') {
        if (template.category !== filter.category) return false
      }

      // Source filter
      if (filter.source && template.source !== filter.source) {
        return false
      }

      // Tags filter
      if (filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => 
          template.tags.some(templateTag => 
            templateTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
        if (!hasMatchingTag) return false
      }

      return true
    })
  }

  getCategories(): string[] {
    const categories = new Set(this.templates.map(template => template.category))
    return Array.from(categories).filter(Boolean)
  }

  getAllTags(): string[] {
    const tags = new Set<string>()
    this.templates.forEach(template => {
      template.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }

  getStats() {
    const total = this.templates.length
    const bySource = {
      ai: this.templates.filter(t => t.source === 'ai').length,
      manual: this.templates.filter(t => t.source === 'manual').length,
      imported: this.templates.filter(t => t.source === 'imported').length
    }
    const totalUsage = this.templates.reduce((sum, t) => sum + t.usageCount, 0)
    const mostUsed = this.templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)

    return {
      total,
      bySource,
      totalUsage,
      mostUsed,
      categories: this.getCategories().length,
      tags: this.getAllTags().length
    }
  }

  exportTemplates(): string {
    return JSON.stringify(this.templates, null, 2)
  }

  importTemplates(jsonData: string): { success: number; errors: string[] } {
    const errors: string[] = []
    let success = 0

    try {
      const importedTemplates = JSON.parse(jsonData)
      
      if (!Array.isArray(importedTemplates)) {
        errors.push('Invalid format: expected an array of templates')
        return { success, errors }
      }

      importedTemplates.forEach((templateData, index) => {
        try {
          // Validate required fields
          if (!templateData.name || !templateData.subject || !templateData.body) {
            errors.push(`Template ${index + 1}: Missing required fields (name, subject, body)`)
            return
          }

          // Create template with proper defaults
          this.createTemplate({
            name: templateData.name,
            subject: templateData.subject,
            body: templateData.body,
            category: templateData.category || 'imported',
            tags: Array.isArray(templateData.tags) ? templateData.tags : [],
            source: 'imported'
          })

          success++
        } catch (error) {
          errors.push(`Template ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

    } catch (error) {
      errors.push('Invalid JSON format')
    }

    return { success, errors }
  }

  duplicateTemplate(id: string): EmailTemplate | null {
    const original = this.getTemplateById(id)
    if (!original) return null

    return this.createTemplate({
      name: `${original.name} (Copy)`,
      subject: original.subject,
      body: original.body,
      category: original.category,
      tags: [...original.tags],
      source: original.source
    })
  }

  bulkDelete(ids: string[]): number {
    const initialCount = this.templates.length
    this.templates = this.templates.filter(template => !ids.includes(template.id))
    this.saveToStorage()
    return initialCount - this.templates.length
  }
}

// Create singleton instance
const templateManager = new TemplateManager()

export function useTemplates() {
  return templateManager
}

// Default templates for new installations
export const DEFAULT_TEMPLATES: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  {
    name: "B2B Introduction",
    subject: "Quick question about {{company}}'s operations",
    body: `Hi {{firstName}},

I came across {{company}} and was impressed by your work in the {{industry}} space.

I thought you might be interested in how we've helped similar companies:
• 30% reduction in operational costs
• 40% improvement in efficiency
• Significant ROI within 3 months

{{cta}}

Would you be open to a brief 15-minute conversation to explore how we could help {{company}} achieve similar results?

Best regards,
[Your Name]`,
    category: "B2B",
    tags: ["introduction", "b2b", "professional"],
    source: "manual"
  },
  {
    name: "SaaS Free Trial",
    subject: "Free trial of {{product}} for {{company}}",
    body: `Hello {{firstName}},

I noticed {{company}} is growing rapidly and thought you might be interested in {{product}}.

We offer:
• 14-day free trial
• No credit card required
• Full feature access
• Dedicated onboarding support

{{cta}}

Would you like to set up a quick demo tailored to {{company}}'s needs?

Cheers,
[Your Name]`,
    category: "SaaS",
    tags: ["trial", "saas", "demo"],
    source: "manual"
  }
] 