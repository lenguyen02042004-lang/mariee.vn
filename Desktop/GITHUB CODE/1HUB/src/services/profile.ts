'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateReputation, getLevelFromScore, VoteData } from '@/lib/reputation'
import { revalidatePath } from 'next/cache'

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateProfile(userId: string, formData: FormData) {
  const supabase = await createClient()
  
  const updates = {
    full_name: formData.get('full_name') as string,
    bio: formData.get('bio') as string,
    major: formData.get('major') as string,
    minor: formData.get('minor') as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/profile')
  return { success: true }
}

/**
 * Syncs the reputation score and level based on all verified projects/votes
 */
export async function syncReputation(userId: string) {
  const supabase = await createClient()

  // 1. Fetch all votes for this user's case studies
  // Note: This logic assumes a join between votes and case_studies
  const { data: votesData, error: votesError } = await supabase
    .from('votes')
    .select(`
      voter_level,
      case_studies!inner (
        profile_id,
        project_id,
        project_members!inner (
          role
        )
      )
    `)
    .eq('case_studies.profile_id', userId)

  if (votesError) throw new Error(votesError.message)

  // 2. Format data for the reputation engine
  const votes: VoteData[] = votesData.map((v: any) => ({
    voterLevel: v.voter_level,
    role: v.case_studies.project_members.role
  }))

  // 3. Get unique project count for consistency multiplier
  const projectCount = new Set(votesData.map((v: any) => v.case_studies.project_id)).size

  // 4. Calculate new score
  const newScore = calculateReputation(votes, projectCount)
  const newLevel = getLevelFromScore(newScore)

  // 5. Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      reputation_score: newScore,
      current_level: newLevel
    })
    .eq('id', userId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/profile')
  return { score: newScore, level: newLevel }
}
