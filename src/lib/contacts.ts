import Papa from 'papaparse'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
  position: string
  phone?: string
  website?: string
  notes?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ContactImportResult {
  contacts: Contact[]
  errors: string[]
  duplicates: Contact[]
}

export interface ContactFilter {
  search: string
  tags: string[]
  company: string
}

export class ContactManager {
  private contacts: Contact[] = []
  private listeners: Array<(contacts: Contact[]) => void> = []

  constructor() {
    this.loadFromStorage()
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private saveToStorage(): void {
    localStorage.setItem('coldscale_contacts', JSON.stringify(this.contacts))
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('coldscale_contacts')
    if (stored) {
      this.contacts = JSON.parse(stored)
    }
  }

  subscribe(listener: (contacts: Contact[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.contacts))
  }

  getAllContacts(): Contact[] {
    return [...this.contacts]
  }

  getContact(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id)
  }

  addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
    const newContact: Contact = {
      ...contact,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.contacts.push(newContact)
    this.saveToStorage()
    this.notify()
    
    return newContact
  }

  updateContact(id: string, updates: Partial<Contact>): Contact | null {
    const index = this.contacts.findIndex(c => c.id === id)
    if (index === -1) return null

    this.contacts[index] = {
      ...this.contacts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveToStorage()
    this.notify()
    
    return this.contacts[index]
  }

  deleteContact(id: string): boolean {
    const index = this.contacts.findIndex(c => c.id === id)
    if (index === -1) return false

    this.contacts.splice(index, 1)
    this.saveToStorage()
    this.notify()
    
    return true
  }

  bulkDelete(ids: string[]): number {
    let deletedCount = 0
    this.contacts = this.contacts.filter(contact => {
      if (ids.includes(contact.id)) {
        deletedCount++
        return false
      }
      return true
    })
    
    this.saveToStorage()
    this.notify()
    
    return deletedCount
  }

  filterContacts(filter: ContactFilter): Contact[] {
    return this.contacts.filter(contact => {
      // Search filter
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase()
        const matchesSearch = 
          contact.firstName.toLowerCase().includes(searchTerm) ||
          contact.lastName.toLowerCase().includes(searchTerm) ||
          contact.email.toLowerCase().includes(searchTerm) ||
          contact.company.toLowerCase().includes(searchTerm) ||
          contact.position.toLowerCase().includes(searchTerm)
        
        if (!matchesSearch) return false
      }

      // Tag filter
      if (filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => contact.tags.includes(tag))
        if (!hasTag) return false
      }

      // Company filter
      if (filter.company) {
        if (contact.company.toLowerCase() !== filter.company.toLowerCase()) {
          return false
        }
      }

      return true
    })
  }

  getAllTags(): string[] {
    const tagSet = new Set<string>()
    this.contacts.forEach(contact => {
      contact.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }

  getAllCompanies(): string[] {
    const companySet = new Set<string>()
    this.contacts.forEach(contact => {
      if (contact.company) {
        companySet.add(contact.company)
      }
    })
    return Array.from(companySet).sort()
  }

  findDuplicates(): Contact[] {
    const emailMap = new Map<string, Contact[]>()
    
    this.contacts.forEach(contact => {
      const email = contact.email.toLowerCase()
      if (!emailMap.has(email)) {
        emailMap.set(email, [])
      }
      emailMap.get(email)!.push(contact)
    })

    const duplicates: Contact[] = []
    emailMap.forEach(contacts => {
      if (contacts.length > 1) {
        duplicates.push(...contacts.slice(1)) // Keep first, mark rest as duplicates
      }
    })

    return duplicates
  }

  async importFromCSV(file: File): Promise<ContactImportResult> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const contacts: Contact[] = []
          const errors: string[] = []
          const duplicates: Contact[] = []

          results.data.forEach((row: any, index) => {
            try {
              // Validate required fields
              if (!row.email || !row.firstName || !row.lastName) {
                errors.push(`Row ${index + 1}: Missing required fields (email, firstName, lastName)`)
                return
              }

              // Check for duplicates
              const existingContact = this.contacts.find(c => 
                c.email.toLowerCase() === row.email.toLowerCase()
              )
              
              if (existingContact) {
                duplicates.push(existingContact)
                return
              }

              // Create contact
              const contact: Contact = {
                id: this.generateId(),
                firstName: row.firstName || '',
                lastName: row.lastName || '',
                email: row.email || '',
                company: row.company || '',
                position: row.position || '',
                phone: row.phone || '',
                website: row.website || '',
                notes: row.notes || '',
                tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }

              contacts.push(contact)
            } catch (error) {
              errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          })

          resolve({ contacts, errors, duplicates })
        },
        error: (error) => {
          resolve({ contacts: [], errors: [error.message], duplicates: [] })
        }
      })
    })
  }

  exportToCSV(): string {
    const csvData = this.contacts.map(contact => ({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      company: contact.company,
      position: contact.position,
      phone: contact.phone || '',
      website: contact.website || '',
      notes: contact.notes || '',
      tags: contact.tags.join(', '),
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    }))

    return Papa.unparse(csvData)
  }

  addImportedContacts(contacts: Contact[]): void {
    this.contacts.push(...contacts)
    this.saveToStorage()
    this.notify()
  }

  getStats() {
    return {
      total: this.contacts.length,
      companies: this.getAllCompanies().length,
      tags: this.getAllTags().length,
      duplicates: this.findDuplicates().length
    }
  }
}

// Global instance
export const contactManager = new ContactManager()

// React hook
export const useContacts = () => {
  return contactManager
} 