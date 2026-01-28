'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Calendar from '@/components/Calendar';

interface Company {
  _id: string;
  name: string;
  active: boolean;
  monthlyFee?: number;
}

interface User {
  _id: string;
  role: string;
  companyId?: {
    _id: string;
    name: string;
  };
}

interface Schedule {
  _id: string;
  startAt: string;
  endAt: string;
  status: string;
  clientId?: {
    name: string;
    email: string;
  };
  serviceId: {
    name: string;
  };
  barberId: {
    userId: {
      name: string;
    };
  };
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

interface AdminStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalUsers: number;
  usersByRole: {
    ADMIN: number;
    GERENTE: number;
    BARBEIRO: number;
    CLIENTE: number;
  };
  totalRevenue: number;
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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [gerenteStats, setGerenteStats] = useState<GerenteStats | null>(null);
  const [gerenteSchedules, setGerenteSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN' && user.role !== 'GERENTE') {
      router.push('/agendar');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'GERENTE') {
      if (user?.role === 'ADMIN') {
        loadCompanies();
      }
      loadStats();
    }
  }, [user, selectedCompanyId]);

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  };

  const loadStats = async () => {
    try {
      if (user?.role === 'ADMIN') {
        const params: any = {};
        if (selectedCompanyId) {
          params.companyId = selectedCompanyId;
        }

        const [companiesRes, usersRes, schedulesRes] = await Promise.all([
          api.get('/companies'),
          api.get('/users'),
          api.get('/schedules', { params }),
        ]);

        const companiesData = companiesRes.data;
        const usersData = usersRes.data;
        const schedulesData = schedulesRes.data;

        const activeCompanies = companiesData.filter((c: Company) => c.active).length;
        const inactiveCompanies = companiesData.length - activeCompanies;
        const totalRevenue = companiesData.reduce((sum: number, c: Company) => {
          return sum + (c.monthlyFee || 0);
        }, 0);

        const usersByRole = {
          ADMIN: usersData.filter((u: User) => u.role === 'ADMIN').length,
          GERENTE: usersData.filter((u: User) => u.role === 'GERENTE').length,
          BARBEIRO: usersData.filter((u: User) => u.role === 'BARBEIRO').length,
          CLIENTE: usersData.filter((u: User) => u.role === 'CLIENTE').length,
        };

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

        setAdminStats({
          totalCompanies: companiesData.length,
          activeCompanies,
          inactiveCompanies,
          totalUsers: usersData.length,
          usersByRole,
          totalRevenue,
          totalSchedules: schedulesData.length,
          schedulesToday,
          schedulesThisMonth,
          schedulesByStatus: {
            AGENDADO: 0,
            CONFIRMADO: 0,
            CANCELADO: 0,
            CONCLUIDO: 0,
          },
        });
      } else if (user?.role === 'GERENTE') {
        const [servicesRes, barbersRes, schedulesRes] = await Promise.all([
          api.get('/services'),
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
        // Garantir que os agendamentos estão no formato correto
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
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'GERENTE') {
    return null;
  }

  // Renderizar dashboard do ADMIN
  if (user?.role === 'ADMIN') {
    return (
      <Layout>
        {(authLoading || loading) && <Loading text="Carregando dashboard..." />}
        <div className="min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 min-w-0">
              <label htmlFor="company-select" className="text-sm font-medium text-gray-700 shrink-0">
                Filtrar por Empresa:
              </label>
              <select
                id="company-select"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas as empresas</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards principais - ADMIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{adminStats?.totalCompanies || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {adminStats?.activeCompanies || 0} ativas / {adminStats?.inactiveCompanies || 0} inativas
                  </p>
                </div>
                <div className="bg-primary-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <Link href="/admin/empresas" className="text-primary-600 text-sm font-medium mt-4 inline-block hover:text-primary-700">
                Gerenciar empresas →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{adminStats?.totalUsers || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {adminStats?.usersByRole?.GERENTE || 0} gerentes, {adminStats?.usersByRole?.BARBEIRO || 0} barbeiros, {adminStats?.usersByRole?.CLIENTE || 0} clientes
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <Link href="/admin/usuarios" className="text-green-600 text-sm font-medium mt-4 inline-block hover:text-green-700">
                Gerenciar usuários →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    R$ {adminStats?.totalRevenue?.toFixed(2).replace('.', ',') || '0,00'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Soma das mensalidades</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{adminStats?.schedulesToday || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {adminStats?.schedulesThisMonth || 0} este mês
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos - ADMIN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Pizza - Distribuição de Usuários */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribuição de Usuários</h2>
              {adminStats && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Administradores', value: adminStats.usersByRole.ADMIN, color: '#ef4444' },
                        { name: 'Gerentes', value: adminStats.usersByRole.GERENTE, color: '#a855f7' },
                        { name: 'Barbeiros', value: adminStats.usersByRole.BARBEIRO, color: '#3b82f6' },
                        { name: 'Clientes', value: adminStats.usersByRole.CLIENTE, color: '#22c55e' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#a855f7" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Gráfico de Barras - Empresas Ativas vs Inativas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status das Empresas</h2>
              {adminStats && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Ativas', Quantidade: adminStats.activeCompanies },
                      { name: 'Inativas', Quantidade: adminStats.inactiveCompanies },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Quantidade">
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Estatísticas de usuários por tipo - ADMIN */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Usuários por Tipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800">Administradores</p>
                <p className="text-2xl font-bold text-red-900 mt-2">{adminStats?.usersByRole?.ADMIN || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-800">Gerentes</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">{adminStats?.usersByRole?.GERENTE || 0}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">Barbeiros</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{adminStats?.usersByRole?.BARBEIRO || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800">Clientes</p>
                <p className="text-2xl font-bold text-green-900 mt-2">{adminStats?.usersByRole?.CLIENTE || 0}</p>
              </div>
            </div>
          </div>

        </div>
      </Layout>
    );
  }

  // Renderizar dashboard do GERENTE
  return (
    <Layout>
      {(authLoading || loading) && <Loading text="Carregando dashboard..." />}
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Gerencial</h1>
        </div>

        {/* Cards principais - GERENTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Serviços</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{gerenteStats?.totalServices || 0}</p>
              </div>
              <div className="bg-primary-100 rounded-full p-3">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <Link href="/admin/servicos" className="text-primary-600 text-sm font-medium mt-4 inline-block hover:text-primary-700">
              Gerenciar serviços →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
            <Link href="/admin/barbeiros" className="text-green-600 text-sm font-medium mt-4 inline-block hover:text-green-700">
              Gerenciar barbeiros →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
            <Link href="/admin/agendamentos" className="text-blue-600 text-sm font-medium mt-4 inline-block hover:text-blue-700">
              Ver agendamentos →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
            <Link href="/admin/agendamentos" className="text-purple-600 text-sm font-medium mt-4 inline-block hover:text-purple-700">
              Ver todos →
            </Link>
          </div>
        </div>

        {/* Status dos agendamentos - GERENTE */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
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

        {/* Calendário de Agendamentos - GERENTE */}
        <div className="mb-8">
          <Calendar schedules={gerenteSchedules} />
        </div>
      </div>
    </Layout>
  );
}
