import * as React from 'react'
import { render } from '@react-email/components'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Mariée'
const SENDER_DOMAIN = 'notify.mariee.vn'
const FROM_DOMAIN = 'mariee.vn'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function redact(email: string): string {
  const [l, d] = email.split('@')
  if (!l || !d) return '***'
  return `${l[0]}***@${d}`
}

export interface EnqueueOpts {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, any>
  idempotencyKey?: string
}

/**
 * Server-only helper: renders a registered React Email template and enqueues it
 * onto the `transactional_emails` pgmq queue. Uses the Supabase service role —
 * must not be called from client code. Honors suppression list and per-recipient
 * unsubscribe tokens, matching /lovable/email/transactional/send semantics.
 */
export async function enqueueTransactional(
  opts: EnqueueOpts,
): Promise<{ success: boolean; reason?: string; messageId?: string }> {
  const { templateName, recipientEmail, templateData = {} } = opts
  const template = TEMPLATES[templateName]
  if (!template) {
    console.error('[email] template not in registry', { templateName })
    return { success: false, reason: 'template_not_found' }
  }

  const effective = (template.to || recipientEmail || '').trim()
  if (!effective) return { success: false, reason: 'missing_recipient' }

  const normalized = effective.toLowerCase()
  const messageId = crypto.randomUUID()
  const idempotencyKey = opts.idempotencyKey ?? messageId

  // Suppression check
  const { data: suppressed, error: supErr } = await supabaseAdmin
    .from('suppressed_emails' as any)
    .select('id')
    .eq('email', normalized)
    .maybeSingle()
  if (supErr) {
    console.error('[email] suppression check failed', { error: supErr })
    return { success: false, reason: 'suppression_check_failed' }
  }
  if (suppressed) {
    await supabaseAdmin.from('email_send_log' as any).insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effective,
      status: 'suppressed',
    })
    return { success: false, reason: 'email_suppressed' }
  }

  // Unsubscribe token (one per email)
  let unsubscribeToken: string
  const { data: existing } = await supabaseAdmin
    .from('email_unsubscribe_tokens' as any)
    .select('token, used_at')
    .eq('email', normalized)
    .maybeSingle()

  if (existing && !(existing as any).used_at) {
    unsubscribeToken = (existing as any).token
  } else if (!existing) {
    unsubscribeToken = generateToken()
    await supabaseAdmin
      .from('email_unsubscribe_tokens' as any)
      .upsert(
        { token: unsubscribeToken, email: normalized },
        { onConflict: 'email', ignoreDuplicates: true } as any,
      )
    const { data: stored } = await supabaseAdmin
      .from('email_unsubscribe_tokens' as any)
      .select('token')
      .eq('email', normalized)
      .maybeSingle()
    if (stored) unsubscribeToken = (stored as any).token
  } else {
    // token used but not in suppressed list — treat as suppressed
    await supabaseAdmin.from('email_send_log' as any).insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effective,
      status: 'suppressed',
      error_message: 'Unsubscribe token used',
    })
    return { success: false, reason: 'email_suppressed' }
  }

  // Render
  let html: string
  let text: string
  try {
    const el = React.createElement(template.component, templateData)
    html = await render(el)
    text = await render(el, { plainText: true })
  } catch (err) {
    console.error('[email] render failed', { templateName, error: err })
    await supabaseAdmin.from('email_send_log' as any).insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effective,
      status: 'failed',
      error_message: 'Render failed',
    })
    return { success: false, reason: 'render_failed' }
  }

  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  await supabaseAdmin.from('email_send_log' as any).insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effective,
    status: 'pending',
  })

  const { error: enqErr } = await supabaseAdmin.rpc('enqueue_email' as any, {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: effective,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken!,
      queued_at: new Date().toISOString(),
    },
  } as any)

  if (enqErr) {
    console.error('[email] enqueue failed', { templateName, error: enqErr })
    await supabaseAdmin.from('email_send_log' as any).insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effective,
      status: 'failed',
      error_message: 'Enqueue failed',
    })
    return { success: false, reason: 'enqueue_failed' }
  }

  console.log('[email] enqueued', {
    templateName,
    recipient: redact(effective),
  })
  return { success: true, messageId }
}

/** Fire-and-forget wrapper used inside server fns — never throws. */
export function fireEmail(opts: EnqueueOpts): void {
  enqueueTransactional(opts).catch((err) =>
    console.error('[email] fire failed', { template: opts.templateName, err }),
  )
}

/** Look up an auth user's email by id (admin API). */
export async function getUserEmailById(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (error || !data?.user?.email) return null
    return data.user.email
  } catch {
    return null
  }
}

/** All admin user emails (best-effort). */
export async function getAdminEmails(): Promise<string[]> {
  const { data: roles } = await supabaseAdmin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')
  const ids = (roles ?? []).map((r: any) => r.user_id as string)
  const emails: string[] = []
  for (const id of ids) {
    const e = await getUserEmailById(id)
    if (e) emails.push(e)
  }
  return emails
}