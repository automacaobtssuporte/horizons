import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://faxcfpsyrlnpwvnajkvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZheGNmcHN5cmxucHd2bmFqa3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTM3NjIsImV4cCI6MjA2NTEyOTc2Mn0.OvfeIZhRj_wJX6xT1yPuMOyUv2ExM3ErwtOjdfjB6nk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    lock: false, 
  },
});