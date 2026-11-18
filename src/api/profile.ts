import { supabase } from '../lib/supabase';
import { normalizeUsername } from '../lib/validation';

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { id: data.id, username: data.username, displayName: data.display_name, createdAt: data.created_at };
}

export async function updateProfile(userId: string, input: { username: string; displayName: string }): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ username: normalizeUsername(input.username), display_name: input.displayName.trim() })
    .eq('id', userId);
  if (error) {
    if (error.code === '23505') throw new Error('That username is taken.');
    throw new Error('Couldn’t save your profile. Check the details and try again.');
  }
}

export async function usernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('username_available', { p_username: normalizeUsername(username) });
  if (error) throw new Error('Couldn’t check that username. Try again.');
  return data === true;
}

export async function emailForUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('email_for_username', { p_username: normalizeUsername(username) });
  if (error) throw new Error('Couldn’t sign you in. Try again.');
  return (data as string | null) ?? null;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_account');
  if (error) throw new Error('Couldn’t delete your account. Try again.');
}
