'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Calendar from '@/components/Calendar';

interface Schedule {
  _id: string;
  startAt: string;
  endAt: string;
  status: string;
  clientId?: { name: string; email: string };
  serviceId: { name: string };
  barberId: { userId: { name: string } };
}

interface GerenteStats {
  totalServices: number;
  totalBarbers: number;
  totalSchedules: number;
  schedulesToday: number;
  schedulesThisMonth: number;
  schedulesByStatus: {
    AGENDADO: number;
    CONFIRMADO: number;
    CANCELADO: number;
    CONCLUIDO: number;
  };
}

export default function GerenteDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [gerenteStats, setGerenteStats] = useState<GerenteStats | null>(null);
  const [gerenteSchedules, setGerenteSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.role !== 'GERENTE') {
      if (user?.role === 'ADMIN') router.push('/admin/dashboard');
      else if (user?.role === 'BARBEIRO') router.push('/barbeiro/agendamentos');
      else if (user?.role === 'CLIENTE') router.push('/cliente/agendar');
      else router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'GERENTE') {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [servicesRes, barbersRes, schedulesRes] = await Promise.all([
        api.get('/service'),
        api.get('/barbers'),
        api.get('/schedules'),
      ]);

      const services = servicesRes.data;
      const barbers = barbersRes.data;
      const schedulesData = schedulesRes.data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const schedulesToday = schedulesData.filter((s: any) => {
        const scheduleDate = new Date(s.startAt);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate.getTime() === today.getTime();
      }).length;

      const schedulesThisMonth = schedulesData.filter((s: any) => {
        const scheduleDate = new Date(s.startAt);
        return scheduleDate >= thisMonth;
      }).length;

      const schedulesByStatus = {
        AGENDADO: schedulesData.filter((s: any) => s.status === 'AGENDADO').length,
        CONFIRMADO: schedulesData.filter((s: any) => s.status === 'CONFIRMADO').length,
        CANCELADO: schedulesData.filter((s: any) => s.status === 'CANCELADO').length,
        CONCLUIDO: schedulesData.filter((s: any) => s.status === 'CONCLUIDO').length,
      };

      setGerenteStats({
        totalServices: services.length,
        totalBarbers: barbers.length,
        totalSchedules: schedulesData.length,
        schedulesToday,
        schedulesThisMonth,
        schedulesByStatus,
      });

      const formattedSchedules = schedulesData.map((schedule: any) => ({
        _id: schedule._id,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
        status: schedule.status,
        clientId: schedule.clientId,
        serviceId: schedule.serviceId,
        barberId: schedule.barberId,
      }));
      setGerenteSchedules(formattedSchedules);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'GERENTE') {
    return null;
  }

  return (
    <Layout>
      {(authLoading || loading) && <Loading text="Carregando dashboard..." />}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-w-0 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Gerencial</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Serviços</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{gerenteStats?.totalServices || 0}</p>
              </div>
              <div className="bg-primary-100 rounded-full p-3">
                <svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <Link href="/gerente/servicos" className="text-primary-700 text-sm font-medium mt-4 inline-block hover:text-primary-800">
              Gerenciar serviços →
            </Link>
          </div>

          <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Barbeiros</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{gerenteStats?.totalBarbers || 0}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <Link href="/gerente/barbeiros" className="text-green-600 text-sm font-medium mt-4 inline-block hover:text-green-700">
              Gerenciar barbeiros →
            </Link>
          </div>

          <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{gerenteStats?.schedulesToday || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {gerenteStats?.schedulesThisMonth || 0} este mês
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <Link href="/gerente/agendamentos" className="text-blue-600 text-sm font-medium mt-4 inline-block hover:text-blue-700">
              Ver agendamentos →
            </Link>
          </div>

          <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{gerenteStats?.totalSchedules || 0}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <Link href="/gerente/agendamentos" className="text-purple-600 text-sm font-medium mt-4 inline-block hover:text-purple-700">
              Ver todos →
            </Link>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status dos Agendamentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800">Agendados</p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">{gerenteStats?.schedulesByStatus.AGENDADO || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800">Confirmados</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">{gerenteStats?.schedulesByStatus.CONFIRMADO || 0}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">Cancelados</p>
              <p className="text-2xl font-bold text-red-900 mt-2">{gerenteStats?.schedulesByStatus.CANCELADO || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800">Concluídos</p>
              <p className="text-2xl font-bold text-green-900 mt-2">{gerenteStats?.schedulesByStatus.CONCLUIDO || 0}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4 sm:p-6 overflow-hidden">
          <Calendar schedules={gerenteSchedules} />
        </div>
      </div>
    </Layout>
  );
}
