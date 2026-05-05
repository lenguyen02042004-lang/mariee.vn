'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notifications'

export async function initiateHandshake(receiver_id: string, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('synergy_handshakes')
    .insert({
      sender_id: user.id,
      receiver_id,
      message
    })
    .select()
    .single()

  if (error) throw error

  await createNotification({
    profile_id: receiver_id,
    sender_id: user.id,
    type: 'synergy_proposal',
    title: 'New Synergy Handshake',
    message: `A specialist has proposed a synergy: "${message.substring(0, 50)}..."`,
    link: `/dashboard/synergy`
  })

  return data
}

export async function respondToHandshake(handshake_id: string, status: 'accepted' | 'declined') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: handshake, error: fetchErr } = await supabase
    .from('synergy_handshakes')
    .select('*')
    .eq('id', handshake_id)
    .single()

  if (fetchErr || !handshake) throw new Error('Handshake not found')

  const { error: updateErr } = await supabase
    .from('synergy_handshakes')
    .update({ status })
    .eq('id', handshake_id)

  if (updateErr) throw updateErr

  if (status === 'accepted') {
    // 1. Create a joint project
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .insert({
        owner_id: handshake.receiver_id,
        title: 'New Joint Heritage',
        description: `Collaboration initiated via Synergy Handshake: ${handshake.message}`,
        status: 'in-progress'
      })
      .select()
      .single()

    if (projErr) throw projErr

    // 2. Add both users as members
    await supabase.from('project_members').insert([
      { project_id: project.id, profile_id: handshake.sender_id, role: 'core', is_verified: true },
      { project_id: project.id, profile_id: handshake.receiver_id, role: 'founder', is_verified: true }
    ])

    // 3. Notify sender
    await createNotification({
      profile_id: handshake.sender_id,
      sender_id: user.id,
      type: 'handshake_accepted',
      title: 'Synergy Consecrated',
      message: 'Your handshake was accepted. A new project has been initialized.',
      link: `/projects/${project.id}`
    })
  } else {
    // Notify sender of decline
    await createNotification({
      profile_id: handshake.sender_id,
      sender_id: user.id,
      type: 'handshake_declined',
      title: 'Handshake Declined',
      message: 'Your synergy proposal was not accepted at this time.',
      link: `/synergy`
    })
  }

  return { success: true }
}
