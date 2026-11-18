export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          name_ar?: string;
          description: string;
          image_url: string;
          item_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          name_ar?: string;
          description: string;
          image_url: string;
          item_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          name_ar?: string;
          description?: string;
          image_url?: string;
          item_count?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          name_ar?: string;
          category_slug: string;
          price_mad: number;
          price_eur: number;
          description: string;
          material: string;
          origin: string;
          images: string[];
          rating: number;
          reviews_count: number;
          sizes: number[];
          in_stock: boolean;
          is_featured: boolean;
          badge?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_ar?: string;
          category_slug: string;
          price_mad: number;
          price_eur: number;
          description: string;
          material: string;
          origin?: string;
          images: string[];
          rating?: number;
          reviews_count?: number;
          sizes?: number[];
          in_stock?: boolean;
          is_featured?: boolean;
          badge?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_ar?: string;
          category_slug?: string;
          price_mad?: number;
          price_eur?: number;
          description?: string;
          material?: string;
          origin?: string;
          images?: string[];
          rating?: number;
          reviews_count?: number;
          sizes?: number[];
          in_stock?: boolean;
          is_featured?: boolean;
          badge?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          author_name: string;
          city: string;
          rating: number;
          comment: string;
          product_name: string;
          product_image: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          city: string;
          rating: number;
          comment: string;
          product_name: string;
          product_image: string;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_name?: string;
          city?: string;
          rating?: number;
          comment?: string;
          product_name?: string;
          product_image?: string;
          verified?: boolean;
          created_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          locale: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          locale?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          locale?: string;
          created_at?: string;
        };
      };
      contact_inquiries: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email?: string;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string;
          message?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}
