import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { deleteAccount as deleteAccountRpc, emailForUsername, usernameAvailable } from '../api/profile';
import { supabase } from '../lib/supabase';
import { normalizeUsername } from '../lib/validation';

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  username: string;
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  /** `identifier` is an email address or a username. */
  signIn: (identifier: string, password: string) => Promise<void>;
  /** Resolves true if a session started immediately, false if email confirmation is required. */
  signUp: (input: SignUpInput) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      loading,
      signIn: async (identifier, password) => {
        let email = identifier.trim();
        if (!email.includes('@')) {
          const found = await emailForUsername(email);
          // Same message as a wrong password, so usernames can't be probed.
          if (!found) throw new Error('Invalid login credentials');
          email = found;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async ({ email, password, displayName, username }) => {
        const name = normalizeUsername(username);
        if (!(await usernameAvailable(name))) throw new Error('That username is taken.');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { username: name, display_name: displayName.trim() } },
        });
        if (error) throw error;
        return !!data.session;
      },
      resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      },
      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      deleteAccount: async () => {
        await deleteAccountRpc();
        await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined); // user no longer exists server-side
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
