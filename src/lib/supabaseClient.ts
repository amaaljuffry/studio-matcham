// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fetch the Supabase URL and Anon Key from environment variables
const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is required. Make sure NEXT_PUBLIC_SUPABASE_URL is set in your .env file.");
}

if (!supabaseAnonKey) {
  throw new Error("Supabase Anon Key is required. Make sure NEXT_PUBLIC_SUPABASE_ANON_KEY is set in your .env file.");
}

// Create and export the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);