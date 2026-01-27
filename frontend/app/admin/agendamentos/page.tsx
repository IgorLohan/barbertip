'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { format } from 'date-fns';

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

export default function AgendamentosPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

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
      case 'AGENDADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMADO':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      case 'CONCLUIDO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Agendamentos</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              >
                <option value="">Todos</option>
                <option value="AGENDADO">Agendado</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Data Inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Data Final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <li key={schedule._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {schedule.serviceId.name}
                      </h3>
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          schedule.status,
                        )}`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>
                        <strong>Cliente:</strong> {schedule.clientId.name} ({schedule.clientId.email})
                      </p>
                      <p>
                        <strong>Barbeiro:</strong> {schedule.barberId.userId.name}
                      </p>
                      <p>
                        <strong>Data/Hora:</strong>{' '}
                        {format(new Date(schedule.startAt), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                      <p>
                        <strong>Preço:</strong> R$ {schedule.serviceId.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <select
                      value={schedule.status}
                      onChange={(e) => handleStatusChange(schedule._id, e.target.value)}
                      className="shadow appearance-none border rounded py-2 px-3 text-gray-700 text-sm"
                    >
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
