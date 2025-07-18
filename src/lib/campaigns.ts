import { Contact } from './contacts'
import { PersonalizationEngine } from './personalization'

export interface Campaign {
  id: string
  name: string
  subject: string
  body: string
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'cancelled'
  contactIds: string[]
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  settings: {
    enablePersonalization: boolean
    enableTracking: boolean
    sendDelay: number // seconds between emails
    testMode: boolean
  }
  stats: {
    totalContacts: number
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    failed: number
  }
  createdAt: string
  updatedAt: string
}

export interface CampaignEmail {
  id: string
  campaignId: string
  contactId: string
  subject: string
  body: string
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
  scheduledAt: string
  sentAt?: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  errorMessage?: string
  trackingId?: string
}

export interface CampaignFilter {
  status: string
  search: string
  dateRange?: {
    start: string
    end: string
  }
}

export class CampaignManager {
  private campaigns: Campaign[] = []
  private campaignEmails: CampaignEmail[] = []
  private listeners: Array<(campaigns: Campaign[]) => void> = []

  constructor() {
    this.loadFromStorage()
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private saveToStorage(): void {
    localStorage.setItem('coldscale_campaigns', JSON.stringify(this.campaigns))
    localStorage.setItem('coldscale_campaign_emails', JSON.stringify(this.campaignEmails))
  }

  private loadFromStorage(): void {
    const storedCampaigns = localStorage.getItem('coldscale_campaigns')
    const storedEmails = localStorage.getItem('coldscale_campaign_emails')
    
    if (storedCampaigns) {
      this.campaigns = JSON.parse(storedCampaigns)
    }
    
    if (storedEmails) {
      this.campaignEmails = JSON.parse(storedEmails)
    }
  }

  subscribe(listener: (campaigns: Campaign[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.campaigns))
  }

  getAllCampaigns(): Campaign[] {
    return [...this.campaigns]
  }

  getCampaign(id: string): Campaign | undefined {
    return this.campaigns.find(c => c.id === id)
  }

  createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Campaign {
    const newCampaign: Campaign = {
      ...campaign,
      id: this.generateId(),
      stats: {
        totalContacts: campaign.contactIds.length,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        failed: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.campaigns.push(newCampaign)
    this.saveToStorage()
    this.notify()
    return newCampaign
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
    const index = this.campaigns.findIndex(c => c.id === id)
    if (index === -1) return null

    this.campaigns[index] = {
      ...this.campaigns[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveToStorage()
    this.notify()
    return this.campaigns[index]
  }

  deleteCampaign(id: string): boolean {
    const index = this.campaigns.findIndex(c => c.id === id)
    if (index === -1) return false

    // Also delete associated emails
    this.campaignEmails = this.campaignEmails.filter(e => e.campaignId !== id)
    this.campaigns.splice(index, 1)
    this.saveToStorage()
    this.notify()
    return true
  }

  duplicateCampaign(id: string): Campaign | null {
    const original = this.getCampaign(id)
    if (!original) return null

    const duplicate = {
      ...original,
      name: `${original.name} (Copy)`,
      status: 'draft' as const,
      scheduledAt: undefined,
      startedAt: undefined,
      completedAt: undefined,
      stats: {
        totalContacts: original.contactIds.length,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        failed: 0
      }
    }

    delete (duplicate as any).id
    delete (duplicate as any).createdAt
    delete (duplicate as any).updatedAt

    return this.createCampaign(duplicate)
  }

  filterCampaigns(filter: CampaignFilter): Campaign[] {
    return this.campaigns.filter(campaign => {
      // Status filter
      if (filter.status && filter.status !== 'all' && campaign.status !== filter.status) {
        return false
      }

      // Search filter
      if (filter.search && !campaign.name.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }

      // Date range filter
      if (filter.dateRange) {
        const campaignDate = new Date(campaign.createdAt)
        const startDate = new Date(filter.dateRange.start)
        const endDate = new Date(filter.dateRange.end)
        
        if (campaignDate < startDate || campaignDate > endDate) {
          return false
        }
      }

      return true
    })
  }

  // Campaign Email Management
  prepareCampaignEmails(campaignId: string, contacts: Contact[]): CampaignEmail[] {
    const campaign = this.getCampaign(campaignId)
    if (!campaign) return []

    const emails: CampaignEmail[] = contacts.map(contact => {
      const personalizedSubject = campaign.settings.enablePersonalization
        ? PersonalizationEngine.personalizeSubject(campaign.subject, contact)
        : campaign.subject

      const personalizedBody = campaign.settings.enablePersonalization
        ? PersonalizationEngine.personalizeBody(campaign.body, contact)
        : campaign.body

      return {
        id: this.generateId(),
        campaignId,
        contactId: contact.id,
        subject: personalizedSubject,
        body: personalizedBody,
        status: 'pending',
        scheduledAt: campaign.scheduledAt || new Date().toISOString(),
        trackingId: campaign.settings.enableTracking ? this.generateId() : undefined
      }
    })

    this.campaignEmails.push(...emails)
    this.saveToStorage()
    return emails
  }

  getCampaignEmails(campaignId: string): CampaignEmail[] {
    return this.campaignEmails.filter(e => e.campaignId === campaignId)
  }

  updateCampaignEmail(id: string, updates: Partial<CampaignEmail>): CampaignEmail | null {
    const index = this.campaignEmails.findIndex(e => e.id === id)
    if (index === -1) return null

    this.campaignEmails[index] = {
      ...this.campaignEmails[index],
      ...updates
    }

    this.saveToStorage()
    this.updateCampaignStats(this.campaignEmails[index].campaignId)
    return this.campaignEmails[index]
  }

  private updateCampaignStats(campaignId: string): void {
    const campaign = this.getCampaign(campaignId)
    if (!campaign) return

    const emails = this.getCampaignEmails(campaignId)
    const stats = {
      totalContacts: emails.length,
      sent: emails.filter(e => e.status === 'sent' || e.status === 'delivered' || e.status === 'opened' || e.status === 'clicked').length,
      delivered: emails.filter(e => e.status === 'delivered' || e.status === 'opened' || e.status === 'clicked').length,
      opened: emails.filter(e => e.status === 'opened' || e.status === 'clicked').length,
      clicked: emails.filter(e => e.status === 'clicked').length,
      bounced: emails.filter(e => e.status === 'bounced').length,
      failed: emails.filter(e => e.status === 'failed').length
    }

    this.updateCampaign(campaignId, { stats })
  }

  // Campaign Actions
  startCampaign(id: string): boolean {
    const campaign = this.getCampaign(id)
    if (!campaign || campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return false
    }

    this.updateCampaign(id, {
      status: 'sending',
      startedAt: new Date().toISOString()
    })

    return true
  }

  pauseCampaign(id: string): boolean {
    const campaign = this.getCampaign(id)
    if (!campaign || campaign.status !== 'sending') {
      return false
    }

    this.updateCampaign(id, { status: 'paused' })
    return true
  }

  resumeCampaign(id: string): boolean {
    const campaign = this.getCampaign(id)
    if (!campaign || campaign.status !== 'paused') {
      return false
    }

    this.updateCampaign(id, { status: 'sending' })
    return true
  }

  cancelCampaign(id: string): boolean {
    const campaign = this.getCampaign(id)
    if (!campaign) return false

    this.updateCampaign(id, {
      status: 'cancelled',
      completedAt: new Date().toISOString()
    })

    return true
  }

  completeCampaign(id: string): boolean {
    const campaign = this.getCampaign(id)
    if (!campaign) return false

    this.updateCampaign(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    })

    return true
  }

  // Test functionality
  sendTestEmail(campaignId: string, testEmail: string): Promise<boolean> {
    // This would normally integrate with SMTP service
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Test email sent to ${testEmail} for campaign ${campaignId}`)
        resolve(true)
      }, 1000)
    })
  }

  // Statistics
  getCampaignStats() {
    const total = this.campaigns.length
    const active = this.campaigns.filter(c => c.status === 'sending').length
    const completed = this.campaigns.filter(c => c.status === 'completed').length
    const totalEmailsSent = this.campaigns.reduce((sum, c) => sum + c.stats.sent, 0)
    const totalEmailsDelivered = this.campaigns.reduce((sum, c) => sum + c.stats.delivered, 0)
    const averageOpenRate = this.campaigns.length > 0 
      ? this.campaigns.reduce((sum, c) => sum + (c.stats.opened / Math.max(c.stats.delivered, 1)), 0) / this.campaigns.length
      : 0

    return {
      total,
      active,
      completed,
      totalEmailsSent,
      totalEmailsDelivered,
      averageOpenRate: Math.round(averageOpenRate * 100)
    }
  }
}

// Global campaign manager instance
export const campaignManager = new CampaignManager()

// React hook for using campaign manager
export const useCampaigns = () => {
  return campaignManager
} 