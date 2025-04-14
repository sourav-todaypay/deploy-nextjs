'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthStatus, useAuth } from '@/providers/AuthProvider';
import { Spinner } from './Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { authStatus } = useAuth();

  useEffect(() => {
    if (authStatus === AuthStatus.AuthRequired) {
      router.replace('/signin');
    }
  }, [authStatus, router]);

  if (
    authStatus === AuthStatus.Unknown ||
    authStatus === AuthStatus.ValidateAccess
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
