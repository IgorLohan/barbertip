'use client';

import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Schedule {
  _id: string;
  startAt: string;
  endAt: string;
  status: string;
  clientId: {
    name: string;
    email: string;
  };
  serviceId: {
    name: string;
    duration: number;
    price: number;
  };
  barberId: {
    userId: {
      name: string;
    };
  };
}

export default function BarbeiroAgendamentosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!authLoading && user && user.role !== 'BARBEIRO') {
      router.push('/agendar');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'BARBEIRO') {
      loadSchedules();
    }
  }, [filters, user]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/schedules', { params });
      setSchedules(response.data);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setUpdatingStatus(id);
      await api.patch(`/schedules/${id}/status`, { status });
      await loadSchedules();
    } catch (err) {
      alert('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-800',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        };
      case 'CONFIRMADO':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        };
      case 'CANCELADO':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-800',
          icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        };
      case 'CONCLUIDO':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-800',
          icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        };
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      AGENDADO: 'Agendado',
      CONFIRMADO: 'Confirmado',
      CANCELADO: 'Cancelado',
      CONCLUIDO: 'Concluído',
    };
    return labels[status] || status;
  };

  const getDateLabel = (date: string) => {
    const scheduleDate = parseISO(date);
    if (isToday(scheduleDate)) return 'Hoje';
    if (isTomorrow(scheduleDate)) return 'Amanhã';
    if (isPast(scheduleDate)) return 'Passado';
    return format(scheduleDate, "dd 'de' MMMM", { locale: ptBR });
  };

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = schedules.length;
    const agendado = schedules.filter((s) => s.status === 'AGENDADO').length;
    const confirmado = schedules.filter((s) => s.status === 'CONFIRMADO').length;
    const concluido = schedules.filter((s) => s.status === 'CONCLUIDO').length;
    const cancelado = schedules.filter((s) => s.status === 'CANCELADO').length;
    const hoje = schedules.filter((s) => isToday(parseISO(s.startAt))).length;

    return {
      total,
      agendado,
      confirmado,
      concluido,
      cancelado,
      hoje,
    };
  }, [schedules]);

  // Ordenar agendamentos: próximos primeiro, depois por data
  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => {
      const dateA = parseISO(a.startAt);
      const dateB = parseISO(b.startAt);
      return dateA.getTime() - dateB.getTime();
    });
  }, [schedules]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Carregando agendamentos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (user?.role !== 'BARBEIRO') {
    return null;
  }

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Meus Agendamentos</h1>
            <p className="mt-2 text-gray-600">Gerencie e acompanhe todos os seus agendamentos</p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Agendamentos</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Agendados</p>
                <p className="text-3xl font-bold mt-2">{stats.agendado}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Hoje</p>
                <p className="text-3xl font-bold mt-2">{stats.hoje}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
              >
                <option value="">Todos os status</option>
                <option value="AGENDADO">Agendado</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Data Final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
              />
            </div>
          </div>
          {(filters.status || filters.startDate || filters.endDate) && (
            <button
              onClick={() => setFilters({ status: '', startDate: '', endDate: '' })}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar filtros
            </button>
          )}
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          {sortedSchedules.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">Nenhum agendamento encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros para ver mais resultados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedSchedules.map((schedule) => {
              const statusColors = getStatusColor(schedule.status);
              const scheduleDate = parseISO(schedule.startAt);
              const dateLabel = getDateLabel(schedule.startAt);

              return (
                <div
                  key={schedule._id}
                  className={`bg-white rounded-xl shadow-lg border-2 ${statusColors.border} overflow-hidden transform transition-all hover:shadow-xl hover:scale-[1.02] ${statusColors.bg}`}
                >
                  <div className="p-6">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${statusColors.badge}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusColors.icon} />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{schedule.serviceId.name}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors.badge} mt-1`}>
                              {getStatusLabel(schedule.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informações do Cliente */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">{schedule.clientId.name}</p>
                          <p className="text-sm text-gray-600">{schedule.clientId.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">{dateLabel}</p>
                          <p className="text-sm text-gray-600">
                            {format(scheduleDate, "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-600">Duração</p>
                          <p className="font-semibold text-gray-900">{schedule.serviceId.duration} minutos</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-600">Valor</p>
                          <p className="font-bold text-lg text-gray-900">R$ {schedule.serviceId.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Seletor de Status */}
                    <div className="pt-4 border-t border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Alterar Status</label>
                      <select
                        value={schedule.status}
                        onChange={(e) => handleStatusChange(schedule._id, e.target.value)}
                        disabled={updatingStatus === schedule._id}
                        className={`w-full px-4 py-3 border-2 ${statusColors.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 font-medium ${
                          updatingStatus === schedule._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <option value="AGENDADO">Agendado</option>
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="CANCELADO">Cancelado</option>
                        <option value="CONCLUIDO">Concluído</option>
                      </select>
                      {updatingStatus === schedule._id && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Atualizando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
