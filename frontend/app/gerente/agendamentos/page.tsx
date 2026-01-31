'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Schedule {
  _id: string;
  startAt: string;
  endAt: string;
  status: string;
  clientId: { name: string; email: string };
  serviceId: { name: string; duration: number; price: number };
  barberId: { userId: { name: string } };
}

export default function GerenteAgendamentosPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });

  useEffect(() => {
    loadSchedules();
  }, [filters]);

  const loadSchedules = async () => {
    try {
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
      await api.patch(`/schedules/${id}/status`, { status });
      loadSchedules();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMADO': return 'bg-blue-100 text-blue-800';
      case 'CANCELADO': return 'bg-red-100 text-red-800';
      case 'CONCLUIDO': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      {loading && <Loading text="Carregando agendamentos..." />}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-w-0 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agendamentos</h1>

        <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                <option value="">Todos</option>
                <option value="AGENDADO">Agendado</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Data Inicial</label>
              <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Data Final</label>
              <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <ul className="divide-y divide-gray-200 bg-white">
            {schedules.map((schedule) => (
              <li key={schedule._id} className="px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">{schedule.serviceId.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>{schedule.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      <p><strong>Cliente:</strong> {schedule.clientId.name} ({schedule.clientId.email})</p>
                      <p><strong>Barbeiro:</strong> {schedule.barberId.userId.name}</p>
                      <p><strong>Data/Hora:</strong> {format(new Date(schedule.startAt), "dd/MM/yyyy 'às' HH:mm")}</p>
                      <p><strong>Preço:</strong> R$ {schedule.serviceId.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="sm:ml-4 flex-shrink-0 w-full sm:w-auto">
                    <select value={schedule.status} onChange={(e) => handleStatusChange(schedule._id, e.target.value)} className="shadow border rounded py-2 px-3 text-gray-700 text-sm w-full sm:w-auto min-w-[140px]">
                      <option value="AGENDADO">Agendado</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="CANCELADO">Cancelado</option>
                      <option value="CONCLUIDO">Concluído</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
