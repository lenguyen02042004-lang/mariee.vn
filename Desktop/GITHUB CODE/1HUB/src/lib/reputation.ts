/**
 * 1HUB Reputation Engine (The Brain)
 * Formula: R = sum(V * W * M) * C * T
 */

export interface VoteData {
  voterLevel: number; // 1 to 7 (1 is Master)
  role: 'founder' | 'core' | 'rescuer';
}

export function calculateReputation(votes: VoteData[], projectCount: number = 1): number {
  // 1. Calculate Base Score sum(V * W * M)
  const baseScore = votes.reduce((total, vote) => {
    // V = 1 (Standard Vote Value)
    const V = 1;

    // W = Weight based on level (Reverse scale: L1=10, L7=1)
    const W = 11 - vote.voterLevel;

    // M = Multiplier (Rescuer gets 2x impact)
    const M = vote.role === 'rescuer' ? 2 : 1;

    return total + (V * W * M);
  }, 0);

  // 2. Consistency Multiplier (C)
  // Reward members who complete multiple projects successfully
  const C = projectCount > 3 ? 1.2 : 1.0;

  // 3. Time Decay (T)
  // For simplicity in Phase 2, we set T = 1.0
  // Future: T = Math.exp(-0.1 * yearsPassed)
  const T = 1.0;

  return baseScore * C * T;
}

export function getLevelFromScore(score: number): number {
  if (score >= 1000) return 1; // Master
  if (score >= 500) return 2;
  if (score >= 250) return 3;
  if (score >= 100) return 4;
  if (score >= 50) return 5;
  if (score >= 10) return 6;
  return 7; // Entry Level
}
