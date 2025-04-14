'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthStatus, useAuth } from '@/providers/AuthProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authStatus } = useAuth();

  useEffect(() => {
    if (authStatus === AuthStatus.AuthRequired) {
      router.replace('/signin');
    } else {
      router.replace('/merchants');
    }
  }, [authStatus, router]);

  return <>{authStatus === AuthStatus.AuthRequired && children}</>;
}
