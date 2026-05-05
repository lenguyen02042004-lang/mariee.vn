import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createNotification({
  profile_id,
  sender_id,
  type,
  title,
  message,
  link
}: {
  profile_id: string
  sender_id?: string
  type: string
  title: string
  message?: string
  link?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      profile_id,
      sender_id,
      type,
      title,
      message,
      link
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return null
  }

  // Attempt to send email if user has email notification enabled (future feature)
  // For now, we attempt to send if RESEND_API_KEY exists
  if (process.env.RESEND_API_KEY) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', profile_id)
        .single()

      if (profile?.email) {
        await resend.emails.send({
          from: '1HUB <pulse@1hub.pro>',
          to: profile.email,
          subject: title,
          html: `
            <div style="font-family: serif; background: #0A0A0A; color: #FAFAFA; padding: 40px;">
              <h1 style="color: #D4AF37; font-style: italic;">${title}</h1>
              <p style="color: #94A3B8; font-size: 16px;">${message}</p>
              ${link ? `<a href="${process.env.NEXT_PUBLIC_APP_URL}${link}" style="display: inline-block; background: #FAFAFA; color: #0A0A0A; padding: 12px 24px; border-radius: 99px; text-decoration: none; margin-top: 20px;">Inspect Heritage</a>` : ''}
              <p style="margin-top: 40px; font-size: 10px; color: #475569; letter-spacing: 2px;">1HUB: THE SYNERGY NETWORK</p>
            </div>
          `
        })
      }
    } catch (emailErr) {
      console.error('Email delivery failed:', emailErr)
    }
  }

  return data
}

export async function getNotifications(profile_id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
