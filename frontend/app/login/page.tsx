'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirecionar baseado no role do usuário
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'GERENTE') {
        router.push('/gerente/dashboard');
      } else if (userData.role === 'BARBEIRO') {
        router.push('/barbeiro/agendamentos');
      } else {
        router.push('/cliente/agendar');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-6 sm:py-12 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-5 sm:p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image
              src="/logo.png"
              alt="BarberTip Logo"
              width={500}
              height={143}
              className="object-contain h-32 sm:h-36 md:h-40 lg:h-44"
              priority
            />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
            Faça login na sua conta
          </h2>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2.5 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-primary-600 focus:border-primary-700 focus:z-10 text-base sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2.5 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-b-md focus:outline-none focus:ring-primary-600 focus:border-primary-700 focus:z-10 text-base sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 sm:py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
