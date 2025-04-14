import ProtectedRoutes from '@/components/ProtectedRoutes';
import TopNavbar from '@/components/TopNavbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoutes>
      <TopNavbar>{children}</TopNavbar>
    </ProtectedRoutes>
  );
}
