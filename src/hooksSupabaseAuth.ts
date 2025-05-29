import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

export type UserSession = {
  user: {
    id: string;
    email: string | null;
    avatar_url?: string | null;
    [key: string]: any;
  } | null;
  accessToken: string | null;
};

export const useSupabaseAuth = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = supabase.auth.getSession();
    currentSession.then(({ data }) => {
      if (data.session) {
        setSession({
          user: data.session.user,
          accessToken: data.session.access_token,
        });
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        setSession({
          user: newSession.user,
          accessToken: newSession.access_token,
        });
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }, []);

  return { session, loading, signInWithGoogle, signOut };
};
