export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          category: string
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string
          slug: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_name?: string | null
          category?: string
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string
          slug: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_name?: string | null
          category?: string
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string
          slug?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      couple_gallery: {
        Row: {
          caption: string | null
          couple_id: string
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          couple_id: string
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          couple_id?: string
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "couple_gallery_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_wishes: {
        Row: {
          couple_id: string
          created_at: string
          guest_name: string
          id: string
          is_approved: boolean
          message: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          guest_name: string
          id?: string
          is_approved?: boolean
          message: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          guest_name?: string
          id?: string
          is_approved?: boolean
          message?: string
        }
        Relationships: []
      }
      couples: {
        Row: {
          bride_name: string
          bride_party_address: string | null
          bride_party_time: string | null
          bride_party_venue: string | null
          ceremony_time: string | null
          cover_image: string | null
          created_at: string
          gift_bride_account: string | null
          gift_bride_bank: string | null
          gift_bride_holder: string | null
          gift_groom_account: string | null
          gift_groom_bank: string | null
          gift_groom_holder: string | null
          groom_name: string
          groom_party_address: string | null
          groom_party_time: string | null
          groom_party_venue: string | null
          hero_image_1: string | null
          hero_image_2: string | null
          hero_image_3: string | null
          id: string
          invitation_bride_url: string | null
          invitation_groom_url: string | null
          is_published: boolean
          owner_id: string | null
          quote: string | null
          reception_time: string | null
          schedule: Json
          slug: string
          story: string | null
          updated_at: string
          venue_address: string | null
          venue_name: string | null
          wedding_date: string | null
          youtube_url: string | null
        }
        Insert: {
          bride_name: string
          bride_party_address?: string | null
          bride_party_time?: string | null
          bride_party_venue?: string | null
          ceremony_time?: string | null
          cover_image?: string | null
          created_at?: string
          gift_bride_account?: string | null
          gift_bride_bank?: string | null
          gift_bride_holder?: string | null
          gift_groom_account?: string | null
          gift_groom_bank?: string | null
          gift_groom_holder?: string | null
          groom_name: string
          groom_party_address?: string | null
          groom_party_time?: string | null
          groom_party_venue?: string | null
          hero_image_1?: string | null
          hero_image_2?: string | null
          hero_image_3?: string | null
          id?: string
          invitation_bride_url?: string | null
          invitation_groom_url?: string | null
          is_published?: boolean
          owner_id?: string | null
          quote?: string | null
          reception_time?: string | null
          schedule?: Json
          slug: string
          story?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          wedding_date?: string | null
          youtube_url?: string | null
        }
        Update: {
          bride_name?: string
          bride_party_address?: string | null
          bride_party_time?: string | null
          bride_party_venue?: string | null
          ceremony_time?: string | null
          cover_image?: string | null
          created_at?: string
          gift_bride_account?: string | null
          gift_bride_bank?: string | null
          gift_bride_holder?: string | null
          gift_groom_account?: string | null
          gift_groom_bank?: string | null
          gift_groom_holder?: string | null
          groom_name?: string
          groom_party_address?: string | null
          groom_party_time?: string | null
          groom_party_venue?: string | null
          hero_image_1?: string | null
          hero_image_2?: string | null
          hero_image_3?: string | null
          id?: string
          invitation_bride_url?: string | null
          invitation_groom_url?: string | null
          is_published?: boolean
          owner_id?: string | null
          quote?: string | null
          reception_time?: string | null
          schedule?: Json
          slug?: string
          story?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          wedding_date?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          id: number
          instructions: string | null
          qr_image_url: string | null
          updated_at: string
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          id?: number
          instructions?: string | null
          qr_image_url?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          id?: number
          instructions?: string | null
          qr_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          created_at: string
          id: string
          key: string
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: string
          key: string
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: string
          key?: string
        }
        Relationships: []
      }
      rsvp: {
        Row: {
          attending: boolean
          couple_id: string
          created_at: string
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          message: string | null
          num_guests: number
          side: string | null
        }
        Insert: {
          attending?: boolean
          couple_id: string
          created_at?: string
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          message?: string | null
          num_guests?: number
          side?: string | null
        }
        Update: {
          attending?: boolean
          couple_id?: string
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          message?: string | null
          num_guests?: number
          side?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          accent_color: string | null
          contact_email: string | null
          contact_phone: string | null
          favicon_url: string | null
          footer_text: string | null
          hero_slides: Json
          hero_youtube_url: string | null
          id: number
          logo_url: string | null
          primary_color: string | null
          site_name: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          hero_slides?: Json
          hero_youtube_url?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string | null
          site_name?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          hero_slides?: Json
          hero_youtube_url?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string | null
          site_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      vendor_leads: {
        Row: {
          created_at: string
          event_date: string | null
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          message: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          event_date?: string | null
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          message?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          event_date?: string | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          message?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_payments: {
        Row: {
          admin_note: string | null
          amount_vnd: number
          created_at: string
          id: string
          plan_id: string
          proof_image_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transfer_code: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          admin_note?: string | null
          amount_vnd: number
          created_at?: string
          id?: string
          plan_id: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transfer_code?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          admin_note?: string | null
          amount_vnd?: number
          created_at?: string
          id?: string
          plan_id?: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transfer_code?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "vendor_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_plans: {
        Row: {
          audience: string
          billing_months: number
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price_vnd: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          audience?: string
          billing_months?: number
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_vnd?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          audience?: string
          billing_months?: number
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_vnd?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      vendor_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          price_text: string | null
          sort_order: number
          title: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price_text?: string | null
          sort_order?: number
          title: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price_text?: string | null
          sort_order?: number
          title?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          started_at: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "vendor_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_subscriptions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_testimonials: {
        Row: {
          author_name: string
          created_at: string
          id: string
          is_approved: boolean
          message: string
          rating: number | null
          vendor_id: string
        }
        Insert: {
          author_name: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message: string
          rating?: number | null
          vendor_id: string
        }
        Update: {
          author_name?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message?: string
          rating?: number | null
          vendor_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          category: string
          city: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          email: string | null
          gallery: Json
          id: string
          is_approved: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          plan_expires_at: string | null
          plan_id: string | null
          price_range: string | null
          published_at: string | null
          published_content: Json | null
          slug: string
          tagline: string | null
          updated_at: string
          website: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          gallery?: Json
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          plan_expires_at?: string | null
          plan_id?: string | null
          price_range?: string | null
          published_at?: string | null
          published_content?: Json | null
          slug: string
          tagline?: string | null
          updated_at?: string
          website?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          gallery?: Json
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          plan_expires_at?: string | null
          plan_id?: string | null
          price_range?: string | null
          published_at?: string | null
          published_content?: Json | null
          slug?: string
          tagline?: string | null
          updated_at?: string
          website?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "vendor_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      rate_limit_check: {
        Args: {
          _bucket: string
          _key: string
          _limit: number
          _window_seconds: number
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vendor" | "user" | "couple"
      blog_category:
        | "news"
        | "tips"
        | "real_stories"
        | "trends"
        | "venues"
        | "other"
      vendor_category:
        | "venue"
        | "photography"
        | "videography"
        | "wedding_planner"
        | "makeup"
        | "attire"
        | "flowers"
        | "catering"
        | "music"
        | "decor"
        | "invitation"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "vendor", "user", "couple"],
      blog_category: [
        "news",
        "tips",
        "real_stories",
        "trends",
        "venues",
        "other",
      ],
      vendor_category: [
        "venue",
        "photography",
        "videography",
        "wedding_planner",
        "makeup",
        "attire",
        "flowers",
        "catering",
        "music",
        "decor",
        "invitation",
        "other",
      ],
    },
  },
} as const
