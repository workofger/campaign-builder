import { useState, useEffect, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import * as authService from '@/services/authService';
import type { UserProfile } from '@/services/authService';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const loadProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    setState((prev) => ({ ...prev, profile }));
  }, []);

  useEffect(() => {
    authService.getSession().then(async (session) => {
      if (session?.user) {
        const profile = await authService.getProfile();
        setState({ user: session.user, session, profile, loading: false });
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    });

    const subscription = authService.onAuthStateChange(async (session) => {
      if (session?.user) {
        const profile = await authService.getProfile();
        setState({ user: session.user, session, profile, loading: false });
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { session } = await authService.signInWithEmail(email, password);
    if (session?.user) {
      const profile = await authService.getProfile();
      setState({ user: session.user, session, profile, loading: false });
    }
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setState({ user: null, session: null, profile: null, loading: false });
  }, []);

  return {
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: !!state.session,
    isAdmin: state.profile?.role === 'admin',
    signInWithGoogle,
    signInWithEmail,
    signOut,
    refreshProfile: loadProfile,
  };
}
