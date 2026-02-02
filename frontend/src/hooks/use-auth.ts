'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setAuthToken } from '@/lib/api-client';

export function useAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [session?.accessToken]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    accessToken: session?.accessToken,
    user: session?.user,
  };
}
