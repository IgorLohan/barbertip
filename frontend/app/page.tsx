'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Redirecionar baseado no role do usuário
        if (user?.role === 'ADMIN' || user?.role === 'GERENTE') {
          router.push('/admin/dashboard');
        } else if (user?.role === 'BARBEIRO') {
          router.push('/barbeiro/agendamentos');
        } else {
          router.push('/agendar');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  return <Loading fullScreen text="Carregando..." />;
}
