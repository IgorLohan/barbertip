'use client';

import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import api from '@/lib/api';
import { format, isToday, isTomorrow, isPast, parseISO, getDay, getHours, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

// Função para obter início e fim da semana atual
const getCurrentWeekDates = () => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Segunda-feira como início da semana
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Domingo como fim da semana
  
  return {
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
  };
};

export default function BarbeiroAgendamentosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Inicializar com a semana atual
  const currentWeek = getCurrentWeekDates();
  const [tempFilters, setTempFilters] = useState({
    status: '',
    startDate: currentWeek.startDate,
    endDate: currentWeek.endDate,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    startDate: currentWeek.startDate,
    endDate: currentWeek.endDate,
  });
  const [selectedCell, setSelectedCell] = useState<{ day: string; time: string } | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'BARBEIRO') {
      router.push('/agendar');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'BARBEIRO') {
      loadSchedules();
    }
  }, [appliedFilters, user]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;

      const response = await api.get('/schedules', { params });
      setSchedules(response.data);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setAppliedFilters({ ...tempFilters });
  };

  const handleClearFilters = () => {
    const currentWeek = getCurrentWeekDates();
    setTempFilters({ status: '', startDate: currentWeek.startDate, endDate: currentWeek.endDate });
    setAppliedFilters({ status: '', startDate: currentWeek.startDate, endDate: currentWeek.endDate });
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

  // Agendamentos filtrados por célula selecionada
  const filteredSchedules = useMemo(() => {
    if (!selectedCell) return [];
    
    return schedules.filter((schedule) => {
      const scheduleDate = parseISO(schedule.startAt);
      const scheduleDay = getDay(scheduleDate);
      const scheduleHour = getHours(scheduleDate);
      
      // Mapear dia da semana (0 = Domingo, 6 = Sábado)
      const dayMap: { [key: string]: number } = {
        'Dom': 0,
        'Seg': 1,
        'Ter': 2,
        'Qua': 3,
        'Qui': 4,
        'Sex': 5,
        'Sáb': 6,
      };
      
      const selectedDayIndex = dayMap[selectedCell.day];
      const selectedHour = parseInt(selectedCell.time.replace('h', ''));
      
      return scheduleDay === selectedDayIndex && scheduleHour === selectedHour;
    });
  }, [schedules, selectedCell]);

  // Ordenar agendamentos: próximos primeiro, depois por data
  const sortedSchedules = useMemo(() => {
    return [...filteredSchedules].sort((a, b) => {
      const dateA = parseISO(a.startAt);
      const dateB = parseISO(b.startAt);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredSchedules]);

  // Preparar dados para o heatmap
  const heatmapData = useMemo(() => {
    // Horários do dia (8h às 18h)
    const timeSlots = ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'];
    // Dias da semana (Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
    const days = ['Dom', 'Sáb', 'Sex', 'Qui', 'Qua', 'Ter', 'Seg'];
    
    // Inicializar matriz de dados
    const dataMatrix: number[][] = days.map(() => new Array(timeSlots.length).fill(0));
    
    // Contar agendamentos por dia da semana e horário
    schedules.forEach((schedule) => {
      const scheduleDate = parseISO(schedule.startAt);
      const dayOfWeek = getDay(scheduleDate); // 0 = Domingo, 6 = Sábado
      const hour = getHours(scheduleDate);
      
      // Encontrar o índice do horário (8h = índice 0, 9h = índice 1, etc.)
      const timeIndex = hour - 8;
      
      // Mapear dia da semana para o índice correto (Dom=0, Seg=6, Ter=5, etc.)
      const dayIndex = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      
      if (timeIndex >= 0 && timeIndex < timeSlots.length && dayIndex >= 0 && dayIndex < days.length) {
        dataMatrix[dayIndex][timeIndex]++;
      }
    });
    
    // Converter para formato do ApexCharts
    const series = days.map((day, dayIndex) => ({
      name: day,
      data: dataMatrix[dayIndex],
    }));
    
    return { series, timeSlots, days };
  }, [schedules]);

  if (user?.role !== 'BARBEIRO') {
    return null;
  }

  return (
    <Layout>
      {(authLoading || loading) && <Loading text="Carregando agendamentos..." />}
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Meus Agendamentos</h1>
            <p className="mt-2 text-gray-600">Gerencie e acompanhe todos os seus agendamentos</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </label>
              <select
                value={tempFilters.status}
                onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
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
                value={tempFilters.startDate}
                onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
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
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={tempFilters.endDate}
                  onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                  title="Pesquisar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {(appliedFilters.status || appliedFilters.startDate || appliedFilters.endDate) && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar filtros
              </button>
            </div>
          )}
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

        {/* Heatmap de Agendamentos */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Distribuição de Agendamentos</h2>
          </div>
          {typeof window !== 'undefined' && (
            <Chart
              type="heatmap"
              height={350}
              options={{
                chart: {
                  type: 'heatmap',
                  toolbar: { show: false },
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  offsetX: 0,
                  offsetY: 0,
                  events: {
                    dataPointSelection: function(event: any, chartContext: any, opts: any) {
                      const { seriesIndex, dataPointIndex } = opts;
                      const day = heatmapData.days[seriesIndex];
                      const time = heatmapData.timeSlots[dataPointIndex];
                      setSelectedCell({ day, time });
                    },
                  },
                },
                dataLabels: {
                  enabled: true,
                  style: {
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    colors: ['#374151'],
                  },
                  formatter: function (val: number) {
                    return val.toString();
                  },
                },
                stroke: {
                  width: 2,
                  colors: ['#9ca3af'],
                },
                plotOptions: {
                  heatmap: {
                    shadeIntensity: 0.6,
                    radius: 4,
                    useFillColorAsStroke: true,
                    colorScale: {
                      ranges: [
                        { from: 0, to: 0, color: '#f9fafb', name: 'Nenhum' },
                        { from: 1, to: 1, color: '#fef3c7', name: 'Baixo' },
                        { from: 2, to: 2, color: '#fde68a', name: 'Médio' },
                        { from: 3, to: 3, color: '#fbbf24', name: 'Alto' },
                        { from: 4, to: 999, color: '#f59e0b', name: 'Muito Alto' },
                      ],
                    },
                  },
                },
                xaxis: {
                  categories: heatmapData.timeSlots,
                  labels: {
                    style: {
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      colors: ['#4b5563'],
                    },
                  },
                  axisBorder: { 
                    show: true,
                    color: '#e5e7eb',
                  },
                  axisTicks: { 
                    show: true,
                    color: '#e5e7eb',
                  },
                },
                yaxis: {
                  labels: {
                    style: {
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      colors: ['#4b5563'],
                    },
                    offsetX: 10,
                    offsetY: 0,
                  },
                },
                legend: {
                  show: false,
                },
                tooltip: {
                  custom: function (props: any) {
                    const { seriesIndex, dataPointIndex, w } = props;
                    const value = w.globals.series[seriesIndex][dataPointIndex];
                    const day = heatmapData.days[seriesIndex];
                    const time = heatmapData.timeSlots[dataPointIndex];
                    return `
                      <div class="bg-white border border-gray-200 rounded-lg shadow-xl p-4" style="font-family: Inter, system-ui, sans-serif;">
                        <div class="text-base font-bold text-gray-900 mb-1">${day} ${time}</div>
                        <div class="text-sm text-gray-600">${value} agendamento${value !== 1 ? 's' : ''}</div>
                      </div>
                    `;
                  },
                  style: {
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  },
                },
                grid: {
                  show: true,
                  borderColor: '#9ca3af',
                  strokeDashArray: 0,
                  position: 'back',
                  xaxis: {
                    lines: {
                      show: true,
                    },
                  },
                  yaxis: {
                    lines: {
                      show: true,
                    },
                  },
                  row: {
                    colors: undefined,
                    opacity: 1,
                  },
                  column: {
                    colors: undefined,
                    opacity: 1,
                  },
                  padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 20,
                  },
                },
              }}
              series={heatmapData.series}
            />
          )}
        </div>

        {/* Lista de Agendamentos */}
        {selectedCell && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">
                  Agendamentos - {selectedCell.day} {selectedCell.time}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sortedSchedules.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">Nenhum agendamento encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros para ver mais resultados</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {sortedSchedules.map((schedule) => {
              const statusColors = getStatusColor(schedule.status);
              const scheduleDate = parseISO(schedule.startAt);
              const dateLabel = getDateLabel(schedule.startAt);

              return (
                <div
                  key={schedule._id}
                  className={`flex-1 min-w-[400px] bg-white rounded-xl shadow-lg border-2 ${statusColors.border} overflow-hidden transform transition-all hover:shadow-xl ${statusColors.bg}`}
                >
                  <div className="p-6">
                    {/* Header do Card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statusColors.badge}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusColors.icon} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{schedule.serviceId.name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors.badge} mt-1`}>
                            {getStatusLabel(schedule.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Informações em Layout Horizontal */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Cliente</p>
                          <p className="font-semibold text-sm text-gray-900">{schedule.clientId.name}</p>
                          <p className="text-xs text-gray-500">{schedule.clientId.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Data/Hora</p>
                          <p className="font-semibold text-sm text-gray-900">{dateLabel}</p>
                          <p className="text-xs text-gray-500">
                            {format(scheduleDate, "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Duração</p>
                          <p className="font-semibold text-sm text-gray-900">{schedule.serviceId.duration} min</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Valor</p>
                          <p className="font-bold text-base text-gray-900">R$ {schedule.serviceId.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Status */}
                    {schedule.status !== 'CONCLUIDO' && schedule.status !== 'CANCELADO' && (
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Alterar Status</label>
                        <div className="flex flex-wrap gap-2">
                          {schedule.status !== 'CONFIRMADO' && (
                            <button
                              onClick={() => handleStatusChange(schedule._id, 'CONFIRMADO')}
                              disabled={updatingStatus === schedule._id}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Confirmar
                            </button>
                          )}
                          {schedule.status !== 'CONCLUIDO' && (
                            <button
                              onClick={() => handleStatusChange(schedule._id, 'CONCLUIDO')}
                              disabled={updatingStatus === schedule._id}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Concluir
                            </button>
                          )}
                          {schedule.status !== 'CANCELADO' && (
                            <button
                              onClick={() => handleStatusChange(schedule._id, 'CANCELADO')}
                              disabled={updatingStatus === schedule._id}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancelar
                            </button>
                          )}
                          {schedule.status !== 'AGENDADO' && schedule.status !== 'CONFIRMADO' && (
                            <button
                              onClick={() => handleStatusChange(schedule._id, 'AGENDADO')}
                              disabled={updatingStatus === schedule._id}
                              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Reagendar
                            </button>
                          )}
                        </div>
                        {updatingStatus === schedule._id && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span>Atualizando...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
              })} 
            </div>
          )}
          </div>
        )}
      </div>
    </Layout>
  );
}
