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

export default function MeusAgendamentosPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) {
      return;
    }

    try {
      await api.patch(`/schedules/${id}/status`, { status: 'CANCELADO' });
      loadSchedules();
    } catch (err) {
      alert('Erro ao cancelar agendamento');
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

  return (
    <Layout>
      {loading && <Loading text="Carregando agendamentos..." />}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Meus Agendamentos</h1>

        {schedules.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 sm:p-8 text-center">
            <p className="text-gray-500 text-sm sm:text-base">Você não possui agendamentos.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <li key={schedule._id} className="px-4 sm:px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">
                          {schedule.serviceId.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            schedule.status,
                          )}`}
                        >
                          {schedule.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <p><strong>Barbeiro:</strong> {schedule.barberId.userId.name}</p>
                        <p><strong>Data/Hora:</strong> {format(new Date(schedule.startAt), "dd/MM/yyyy 'às' HH:mm")}</p>
                        <p><strong>Duração:</strong> {schedule.serviceId.duration} min · <strong>Preço:</strong> R$ {schedule.serviceId.price.toFixed(2)}</p>
                      </div>
                    </div>
                    {schedule.status !== 'CANCELADO' && schedule.status !== 'CONCLUIDO' && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleCancel(schedule._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Cancelar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
