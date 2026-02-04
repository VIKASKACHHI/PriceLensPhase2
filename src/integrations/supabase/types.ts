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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          has_special_offer: boolean
          id: string
          image_url: string | null
          in_stock: boolean
          is_on_sale: boolean
          name: string
          original_price: number | null
          price: number
          restock_date: string | null
          sale_percentage: number | null
          shop_id: string
          show_sale_alert: boolean
          special_offer_description: string | null
          stock_quantity: number | null
          stock_status: Database["public"]["Enums"]["stock_status"]
          updated_at: string
          use_shop_discount: boolean
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          has_special_offer?: boolean
          id?: string
          image_url?: string | null
          in_stock?: boolean
          is_on_sale?: boolean
          name: string
          original_price?: number | null
          price: number
          restock_date?: string | null
          sale_percentage?: number | null
          shop_id: string
          show_sale_alert?: boolean
          special_offer_description?: string | null
          stock_quantity?: number | null
          stock_status?: Database["public"]["Enums"]["stock_status"]
          updated_at?: string
          use_shop_discount?: boolean
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          has_special_offer?: boolean
          id?: string
          image_url?: string | null
          in_stock?: boolean
          is_on_sale?: boolean
          name?: string
          original_price?: number | null
          price?: number
          restock_date?: string | null
          sale_percentage?: number | null
          shop_id?: string
          show_sale_alert?: boolean
          special_offer_description?: string | null
          stock_quantity?: number | null
          stock_status?: Database["public"]["Enums"]["stock_status"]
          updated_at?: string
          use_shop_discount?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string
          apply_discount_to_all: boolean
          category: Database["public"]["Enums"]["shop_category"]
          created_at: string
          general_discount_description: string | null
          has_general_discount: boolean
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          owner_id: string
          owner_name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address: string
          apply_discount_to_all?: boolean
          category: Database["public"]["Enums"]["shop_category"]
          created_at?: string
          general_discount_description?: string | null
          has_general_discount?: boolean
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          owner_id: string
          owner_name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string
          apply_discount_to_all?: boolean
          category?: Database["public"]["Enums"]["shop_category"]
          created_at?: string
          general_discount_description?: string | null
          has_general_discount?: boolean
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          owner_id?: string
          owner_name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      shop_category:
        | "grocery"
        | "electronics"
        | "clothing"
        | "pharmacy"
        | "hardware"
        | "sports"
        | "books"
        | "home_appliances"
        | "other"
      stock_status: "in_stock" | "limited" | "out_of_stock"
      user_type: "customer" | "shopkeeper"
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
      shop_category: [
        "grocery",
        "electronics",
        "clothing",
        "pharmacy",
        "hardware",
        "sports",
        "books",
        "home_appliances",
        "other",
      ],
      stock_status: ["in_stock", "limited", "out_of_stock"],
      user_type: ["customer", "shopkeeper"],
    },
  },
} as const
