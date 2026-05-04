export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          current_level: number
          reputation_score: number
          bio: string | null
          major: string | null
          minor: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          current_level?: number
          reputation_score?: number
          bio?: string | null
          major?: string | null
          minor?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          current_level?: number
          reputation_score?: number
          bio?: string | null
          major?: string | null
          minor?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          status: 'in-progress' | 'completed' | 'disputed'
          created_at: string
          updated_at: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          profile_id: string
          role: 'founder' | 'core' | 'rescuer'
          is_verified: boolean
          contribution_timeline: Json | null
          dispute_note: string | null
          created_at: string
        }
      }
    }
  }
}
