'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Service {
  _id: string;
  name: string;
  duration: number;
  price: number;
}

interface Barber {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
}

export default function AgendarPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadServices();
      loadBarbers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedService && selectedBarber && selectedDate) {
      setSelectedSlot(''); // Limpar slot selecionado ao mudar data/serviço/barbeiro
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot('');
    }
  }, [selectedService, selectedBarber, selectedDate]);

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  const loadBarbers = async () => {
    try {
      const response = await api.get('/barbers');
      setBarbers(response.data);
    } catch (err) {
      console.error('Erro ao carregar barbeiros:', err);
    }
  };

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    setError('');
    try {
      const response = await api.get('/schedules/available-slots', {
        params: {
          barberId: selectedBarber,
          date: selectedDate,
          serviceId: selectedService,
        },
      });
      const slots = response.data || [];
      setAvailableSlots(slots);
      if (slots.length === 0) {
        setError('Não há horários disponíveis para esta data. O barbeiro pode não ter horário de trabalho configurado para este dia ou todos os horários já estão ocupados. Por favor, selecione outra data.');
      }
    } catch (err: any) {
      console.error('Erro ao carregar horários:', err);
      setAvailableSlots([]);
      const errorMessage = err.response?.data?.message || 'Erro ao carregar horários disponíveis';
      setError(errorMessage);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedService || !selectedBarber || !selectedDate || !selectedSlot) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    try {
      // Garantir que o formato da data está correto (ISO string)
      const startAtDate = new Date(selectedSlot);
      if (isNaN(startAtDate.getTime())) {
        setError('Data/hora inválida. Por favor, selecione novamente.');
        setLoading(false);
        return;
      }

      await api.post('/schedules', {
        barberId: selectedBarber,
        serviceId: selectedService,
        startAt: startAtDate.toISOString(),
      });

      setSuccess('Agendamento criado com sucesso!');
      setSelectedSlot('');
      
      // Recarregar horários disponíveis para atualizar a lista
      if (selectedService && selectedBarber && selectedDate) {
        await loadAvailableSlots();
      }
      
      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao criar agendamento';
      setError(errorMessage);
      console.error('Erro ao criar agendamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceData = services.find((s) => s._id === selectedService);

  if (authLoading) {
    return (
      <Layout>
        <div className="text-center py-12">Carregando...</div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Novo Agendamento</h1>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Serviço *
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 bg-white leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - {service.duration}min - R$ {service.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Barbeiro *
              </label>
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 bg-white leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Selecione um barbeiro</option>
                {barbers.map((barber) => (
                  <option key={barber._id} value={barber._id}>
                    {barber.userId.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Data *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 bg-white leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            {selectedService && selectedBarber && selectedDate && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Horário Disponível *
                </label>
                {loadingSlots ? (
                  <div className="text-sm text-gray-500 py-2 flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando horários disponíveis...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => {
                      const slotDate = new Date(slot);
                      const isPast = slotDate < new Date();
                      const isDisabled = isPast;
                      
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedSlot(slot);
                              setError(''); // Limpar erro ao selecionar horário
                            }
                          }}
                          className={`py-2 px-4 rounded border transition-colors ${
                            isDisabled
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : selectedSlot === slot
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                          title={isDisabled ? 'Horário indisponível' : ''}
                        >
                          {format(slotDate, 'HH:mm')}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-2">
                    Nenhum horário disponível para esta data.
                  </div>
                )}
              </div>
            )}

            {selectedServiceData && selectedSlot && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <h3 className="font-bold mb-2 text-gray-900">Resumo do Agendamento</h3>
                <p className="text-gray-900">Serviço: {selectedServiceData.name}</p>
                <p className="text-gray-900">Duração: {selectedServiceData.duration} minutos</p>
                <p className="text-gray-900">Preço: R$ {selectedServiceData.price.toFixed(2)}</p>
                <p className="text-gray-900">
                  Data/Hora:{' '}
                  {format(new Date(selectedSlot), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading || !selectedSlot}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
