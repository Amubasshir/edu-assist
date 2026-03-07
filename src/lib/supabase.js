import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdaokpndtgzsknxzlqri.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYW9rcG5kdGd6c2tueHpscXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4Njc0NTYsImV4cCI6MjA4ODQ0MzQ1Nn0.vJulVCEPFU5SDTEIcIImILb2qLajHTsQSsQN9wjDZG8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
