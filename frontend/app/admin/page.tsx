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
    if (!loading && user) {
      if (user.role === 'GERENTE') router.push('/gerente/dashboard');
      else if (user.role !== 'ADMIN' && user.role !== 'BARBEIRO') router.push('/cliente/agendar');
    }
  }, [user, loading, router]);

  if (user && user.role !== 'ADMIN' && user.role !== 'BARBEIRO') {
    return null;
  }

  return (
    <Layout>
      {loading && <Loading text="Carregando..." />}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-w-0 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Painel Administrativo</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {user?.role === 'ADMIN' && (
            <>
              <Link
                href="/admin/servicos"
                className="border border-gray-100 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-gray-200 transition-all bg-gray-50/50"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Serviços</h2>
                <p className="text-gray-600 text-sm sm:text-base">Gerenciar serviços oferecidos</p>
              </Link>

              <Link
                href="/admin/barbeiros"
                className="border border-gray-100 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-gray-200 transition-all bg-gray-50/50"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Barbeiros</h2>
                <p className="text-gray-600 text-sm sm:text-base">Gerenciar barbeiros</p>
              </Link>
            </>
          )}

          <Link
            href="/admin/agendamentos"
            className="border border-gray-100 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-gray-200 transition-all bg-gray-50/50"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Agendamentos</h2>
            <p className="text-gray-600 text-sm sm:text-base">Visualizar e gerenciar agendamentos</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
