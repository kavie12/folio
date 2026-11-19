import { supabase } from '../lib/supabase';

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_account');
  if (error) throw new Error('Couldn’t delete your account. Try again.');
}
