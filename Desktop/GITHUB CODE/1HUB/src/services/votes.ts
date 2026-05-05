'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notifications'

export async function castVote(caseStudyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Get voter details (Level)
  const { data: voter } = await supabase
    .from('profiles')
    .select('current_level')
    .eq('id', user.id)
    .single()

  if (!voter) throw new Error('Voter profile not found')
  if (voter.current_level > 3) throw new Error('Only Masters and Experts (L1-L3) can Endorse Heritage.')

  // 2. Calculate weight (W = 11 - level)
  const weight = 11 - voter.current_level

  // 3. Insert vote
  const { error } = await supabase
    .from('votes')
    .insert({
      voter_id: user.id,
      case_study_id: caseStudyId,
      voter_level: voter.current_level,
      weight: weight
    })

  if (error) {
    if (error.code === '23505') throw new Error('You have already endorsed this logic.')
    throw error
  }

  // 4. Get case study owner to notify them
  const { data: caseStudy } = await supabase
    .from('case_studies')
    .select('profile_id, title')
    .eq('id', caseStudyId)
    .single()

  if (caseStudy) {
    await createNotification({
      profile_id: caseStudy.profile_id,
      sender_id: user.id,
      type: 'vote',
      title: 'Heritage Endorsed',
      message: `A Level ${voter.current_level} Specialist has endorsed your logic for "${caseStudy.title}".`,
      link: `/projects/${caseStudyId}` // Correct link would be the project page
    })
  }

  return { success: true }
}
