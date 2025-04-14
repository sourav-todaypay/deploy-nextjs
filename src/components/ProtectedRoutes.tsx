'use client';
import { useAuth } from '@/providers/AuthProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user } = useAuth();

  return <>{user && children}</>;
}
