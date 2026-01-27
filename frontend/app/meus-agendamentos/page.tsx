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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Meus Agendamentos</h1>

        {schedules.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Você não possui agendamentos.</p>
          </div>
        ) : (
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
                          <strong>Barbeiro:</strong> {schedule.barberId.userId.name}
                        </p>
                        <p>
                          <strong>Data/Hora:</strong>{' '}
                          {format(new Date(schedule.startAt), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                        <p>
                          <strong>Duração:</strong> {schedule.serviceId.duration} minutos
                        </p>
                        <p>
                          <strong>Preço:</strong> R$ {schedule.serviceId.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {schedule.status !== 'CANCELADO' && schedule.status !== 'CONCLUIDO' && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleCancel(schedule._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Cancelar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
