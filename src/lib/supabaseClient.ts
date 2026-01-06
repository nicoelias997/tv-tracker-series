import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/Database';

// Get Supabase credentials from environment variables
const getSupabaseUrl = (): string => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('SUPABASE_URL is not set in environment variables');
  }
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('SUPABASE_ANON_KEY is not set in environment variables');
  }
  return key;
};

// Create a single Supabase client for interacting with your database
export const supabase = createClient<Database>(
  getSupabaseUrl(),
  getSupabaseAnonKey(),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);
