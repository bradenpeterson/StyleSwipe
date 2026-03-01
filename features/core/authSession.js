import { supabase } from '../../lib/supabase';

export async function requireAccessToken() {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error('Not authenticated');
  }
  return token;
}
