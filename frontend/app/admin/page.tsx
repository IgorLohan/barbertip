'use client';

import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN' && user.role !== 'GERENTE' && user.role !== 'BARBEIRO') {
      router.push('/agendar');
    }
  }, [user, loading, router]);

  if (user && user.role !== 'ADMIN' && user.role !== 'GERENTE' && user.role !== 'BARBEIRO') {
    return null;
  }

  return (
    <Layout>
      {loading && <Loading text="Carregando..." />}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Painel Administrativo</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {(user?.role === 'ADMIN' || user?.role === 'GERENTE') && (
            <>
              <Link
                href="/admin/servicos"
                className="bg-white shadow rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Serviços</h2>
                <p className="text-gray-600 text-sm sm:text-base">Gerenciar serviços oferecidos</p>
              </Link>

              <Link
                href="/admin/barbeiros"
                className="bg-white shadow rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Barbeiros</h2>
                <p className="text-gray-600 text-sm sm:text-base">Gerenciar barbeiros</p>
              </Link>
            </>
          )}

          <Link
            href="/admin/agendamentos"
            className="bg-white shadow rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Agendamentos</h2>
            <p className="text-gray-600 text-sm sm:text-base">Visualizar e gerenciar agendamentos</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
