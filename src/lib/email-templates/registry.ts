import type { ComponentType } from 'react'
import { template as vendorNewLead } from './vendor-new-lead'
import { template as coupleNewRsvp } from './couple-new-rsvp'
import { template as coupleNewWish } from './couple-new-wish'
import { template as adminNewPayment } from './admin-new-payment'
import { template as vendorPaymentReviewed } from './vendor-payment-reviewed'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'vendor-new-lead': vendorNewLead,
  'couple-new-rsvp': coupleNewRsvp,
  'couple-new-wish': coupleNewWish,
  'admin-new-payment': adminNewPayment,
  'vendor-payment-reviewed': vendorPaymentReviewed,
}
