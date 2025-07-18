import { CampaignEmail } from './campaigns'
import { Contact } from './contacts'

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
  timestamp: string
}

export interface EmailSendOptions {
  to: string
  subject: string
  body: string
  html?: string
  trackingId?: string
  campaignId?: string
  contactId?: string
}

export class SMTPService {
  private config: SMTPConfig | null = null
  private isConnected = false
  private sendQueue: CampaignEmail[] = []
  private isProcessing = false

  constructor() {
    this.loadConfig()
  }

  // Load SMTP configuration from localStorage
  private loadConfig(): void {
    const stored = localStorage.getItem('coldscale_smtp_config')
    if (stored) {
      this.config = JSON.parse(stored)
    }
  }

  // Save SMTP configuration to localStorage
  saveConfig(config: SMTPConfig): void {
    this.config = config
    localStorage.setItem('coldscale_smtp_config', JSON.stringify(config))
  }

  // Get current SMTP configuration
  getConfig(): SMTPConfig | null {
    return this.config
  }

  // Test SMTP connection
  async testConnection(): Promise<boolean> {
    if (!this.config) {
      throw new Error('SMTP configuration not found')
    }

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real implementation, this would test the actual SMTP connection
      this.isConnected = true
      return true
    } catch (error) {
      this.isConnected = false
      throw error
    }
  }

  // Send a single email
  async sendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
    if (!this.config) {
      return {
        success: false,
        error: 'SMTP configuration not found',
        timestamp: new Date().toISOString()
      }
    }

    try {
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

      // Simulate occasional failures (5% failure rate)
      if (Math.random() < 0.05) {
        return {
          success: false,
          error: 'Temporary server error',
          timestamp: new Date().toISOString()
        }
      }

      // Generate a fake message ID
      const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@coldscale.local`

      // Log the email for demo purposes
      console.log('📧 Email sent:', {
        to: options.to,
        subject: options.subject,
        messageId,
        trackingId: options.trackingId
      })

      return {
        success: true,
        messageId,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  // Send test email
  async sendTestEmail(to: string, subject: string, body: string): Promise<EmailSendResult> {
    return this.sendEmail({
      to,
      subject: `[TEST] ${subject}`,
      body: `This is a test email.\n\nOriginal content:\n${body}`
    })
  }

  // Add emails to send queue
  addToQueue(emails: CampaignEmail[]): void {
    this.sendQueue.push(...emails)
  }

  // Process send queue
  async processQueue(
    onProgress?: (sent: number, total: number, current: CampaignEmail) => void,
    onEmailSent?: (email: CampaignEmail, result: EmailSendResult) => void
  ): Promise<void> {
    if (this.isProcessing || this.sendQueue.length === 0) {
      return
    }

    this.isProcessing = true
    const total = this.sendQueue.length
    let sent = 0

    try {
      while (this.sendQueue.length > 0) {
        const email = this.sendQueue.shift()!
        
        // Skip if already sent
        if (email.status !== 'pending') {
          continue
        }

        // Update progress
        onProgress?.(sent, total, email)

        // Send email
        const result = await this.sendEmail({
          to: email.contactId, // In real implementation, this would be the contact's email
          subject: email.subject,
          body: email.body,
          trackingId: email.trackingId,
          campaignId: email.campaignId,
          contactId: email.contactId
        })

        // Update email status based on result
        if (result.success) {
          email.status = 'sent'
          email.sentAt = result.timestamp
        } else {
          email.status = 'failed'
          email.errorMessage = result.error
        }

        // Notify about email sent
        onEmailSent?.(email, result)

        sent++

        // Add delay between emails to respect rate limits
        if (this.sendQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  // Get queue status
  getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.sendQueue.length,
      processing: this.isProcessing
    }
  }

  // Clear send queue
  clearQueue(): void {
    this.sendQueue = []
  }

  // Pause queue processing
  pauseQueue(): void {
    this.isProcessing = false
  }

  // Resume queue processing
  resumeQueue(): void {
    if (!this.isProcessing && this.sendQueue.length > 0) {
      this.processQueue()
    }
  }

  // Get sending statistics
  getStats(): {
    totalSent: number
    totalFailed: number
    averageDeliveryTime: number
    lastSentAt?: string
  } {
    // This would track actual statistics in a real implementation
    return {
      totalSent: parseInt(localStorage.getItem('coldscale_smtp_sent') || '0'),
      totalFailed: parseInt(localStorage.getItem('coldscale_smtp_failed') || '0'),
      averageDeliveryTime: 1500, // milliseconds
      lastSentAt: localStorage.getItem('coldscale_smtp_last_sent') || undefined
    }
  }

  // Update statistics
  updateStats(sent: number, failed: number): void {
    const currentSent = parseInt(localStorage.getItem('coldscale_smtp_sent') || '0')
    const currentFailed = parseInt(localStorage.getItem('coldscale_smtp_failed') || '0')
    
    localStorage.setItem('coldscale_smtp_sent', (currentSent + sent).toString())
    localStorage.setItem('coldscale_smtp_failed', (currentFailed + failed).toString())
    localStorage.setItem('coldscale_smtp_last_sent', new Date().toISOString())
  }

  // Get default SMTP configurations for popular providers
  static getPresetConfigs(): Record<string, Partial<SMTPConfig>> {
    return {
      gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        fromEmail: 'your-email@gmail.com',
        fromName: 'Your Name'
      },
      outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        fromEmail: 'your-email@outlook.com',
        fromName: 'Your Name'
      },
      yahoo: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        fromEmail: 'your-email@yahoo.com',
        fromName: 'Your Name'
      },
      custom: {
        host: 'smtp.your-provider.com',
        port: 587,
        secure: false,
        fromEmail: 'your-email@your-domain.com',
        fromName: 'Your Name'
      }
    }
  }

  // Validate email address
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Generate tracking pixel HTML
  static generateTrackingPixel(trackingId: string): string {
    return `<img src="https://your-domain.com/track/open/${trackingId}" width="1" height="1" style="display:none;" />`
  }

  // Generate unsubscribe link
  static generateUnsubscribeLink(contactId: string): string {
    return `https://your-domain.com/unsubscribe/${contactId}`
  }

  // Convert plain text to HTML
  static textToHtml(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
  }

  // Validate SMTP configuration
  static validateConfig(config: Partial<SMTPConfig>): string[] {
    const errors: string[] = []

    if (!config.host) errors.push('SMTP host is required')
    if (!config.port) errors.push('SMTP port is required')
    if (!config.username) errors.push('SMTP username is required')
    if (!config.password) errors.push('SMTP password is required')
    if (!config.fromEmail) errors.push('From email is required')
    if (!config.fromName) errors.push('From name is required')

    if (config.fromEmail && !this.isValidEmail(config.fromEmail)) {
      errors.push('From email must be a valid email address')
    }

    if (config.port && (config.port < 1 || config.port > 65535)) {
      errors.push('SMTP port must be between 1 and 65535')
    }

    return errors
  }
}

// Global SMTP service instance
export const smtpService = new SMTPService()

// React hook for using SMTP service
export const useSMTP = () => {
  return smtpService
} 