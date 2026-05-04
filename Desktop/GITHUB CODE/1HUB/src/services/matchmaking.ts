'use server'

import { createClient } from '@/lib/supabase/server'

export type MatchmakingMode = 'mentor-mentee' | 'peer-to-peer'

interface MatchmakingParams {
  userId: string
  userLevel: number
  major: string
  mode: MatchmakingMode
}

export async function getSynergyMatches({ userId, userLevel, major, mode }: MatchmakingParams) {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, current_level, reputation_score, major, minor')
    .neq('id', userId) // Don't match with self
    .eq('major', major) // Focus on professional alignment

  if (mode === 'mentor-mentee') {
    // Look for Masters/Seniors (L1, L2, L3) regardless of user's current level
    // but typically users seek higher level mentors
    query = query.lte('current_level', 3).order('current_level', { ascending: true })
  } else {
    // Peer-to-Peer: Look for same level (+/- 1)
    query = query
      .gte('current_level', Math.max(1, userLevel - 1))
      .lte('current_level', Math.min(7, userLevel + 1))
      .order('reputation_score', { ascending: false })
  }

  const { data, error } = await query.limit(10)

  if (error) throw new Error(error.message)
  return data
}

/**
 * Note: Future Enhancement - Vector Search
 * To implement true semantic search based on Case Studies:
 * 1. Generate embeddings for Case Study content.
 * 2. Store in pgvector column in Supabase.
 * 3. Use RPC 'match_experts' to find similar profiles.
 */
