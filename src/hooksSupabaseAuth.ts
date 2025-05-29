import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

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
        const user = data.session.user as User;
        setSession({          user: {
            ...user,
            email: user.email ?? null,
            avatar_url: (user.user_metadata && user.user_metadata.avatar_url) || null,
          },
          accessToken: data.session.access_token,
        });
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        const user = newSession.user as User;
        setSession({          user: {
            ...user,
            email: user.email ?? null,
            avatar_url: (user.user_metadata && user.user_metadata.avatar_url) || null,
          },
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
