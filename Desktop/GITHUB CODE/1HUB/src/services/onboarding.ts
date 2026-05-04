'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  // Check if Supabase is configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co';

  if (!isConfigured) {
    console.log('MOCK MODE: Simulating successful onboarding...');
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    redirect('/dashboard');
    return;
  }

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.warn('SYSTEM: User not authenticated. Bypassing to Dashboard for Sanctuary demonstration.');
    redirect('/dashboard');
    return;
  }

  const major = formData.get('major') as string
  const specialization = formData.get('specialization') as string
  const bio = formData.get('bio') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      major,
      minor: specialization,
      bio,
      current_level: 7, 
      reputation_score: 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  redirect('/dashboard')
}

