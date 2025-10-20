/**
 * Supabase Client Service
 * Provides a singleton Supabase client for the entire application
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://olgjdqguafidgrutubih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2pkcWd1YWZpZGdydXR1YmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTY4NDgsImV4cCI6MjA3NjE5Mjg0OH0.wgxdXUekbqiORvs9ruHf29looIRWZEaGY2aObCuep5A'; // Public anon key - safe for client-side

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

console.log('[Supabase] Client initialized:', SUPABASE_URL);

export default supabase;
