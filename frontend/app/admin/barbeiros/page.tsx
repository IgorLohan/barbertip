'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Barber {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  serviceIds: string[];
  workingHours: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Service {
  _id: string;
  name: string;
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export default function BarbeirosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({
    serviceIds: [] as string[],
    workingHours: [] as Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>,
  });
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'GERENTE') router.push('/gerente/barbeiros');
      else if (user.role !== 'ADMIN') router.push('/admin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadBarbers();
      loadUsers();
      loadServices();
    }
  }, [user]);

  const loadBarbers = async () => {
    try {
      const response = await api.get('/barbers');
      setBarbers(response.data);
    } catch (err) {
      console.error('Erro ao carregar barbeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      const barbeiros = response.data.filter((u: User) => u.role === 'BARBEIRO');
      setUsers(barbeiros);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const loadServices = async () => {
    try {
      const response = await api.get('/service');
      setServices(response.data);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let userId = '';

      // Sempre criar novo usuário ao criar barbeiro
      if (!editingBarber) {
        if (!newUserData.name || !newUserData.email || !newUserData.password) {
          alert('Preencha todos os campos obrigatórios (Nome, Email e Senha)');
          return;
        }

        if (newUserData.password.length < 6) {
          alert('A senha deve ter no mínimo 6 caracteres');
          return;
        }

        try {
          const newUser = await api.post('/users', {
            name: newUserData.name,
            email: newUserData.email,
            password: newUserData.password,
            role: 'BARBEIRO',
          });
          userId = newUser.data._id;
        } catch (err: any) {
          alert(err.response?.data?.message || 'Erro ao criar usuário');
          return;
        }
      }

      const payload: any = {};

      // Ao criar, enviar userId do novo usuário criado
      if (!editingBarber) {
        payload.userId = userId;
      }

      // Sempre enviar serviceIds e workingHours (mesmo que vazios para limpar)
      payload.serviceIds = formData.serviceIds;
      
      // Limpar _id dos workingHours antes de enviar (MongoDB adiciona _id que não é esperado pelo DTO)
      payload.workingHours = formData.workingHours.map((wh) => ({
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
      }));

      if (editingBarber) {
        // Validar campos obrigatórios antes de atualizar
        if (!editUserData.name || !editUserData.email) {
          alert('Nome e email são obrigatórios');
          return;
        }

        // Atualizar barbeiro
        await api.patch(`/barbers/${editingBarber._id}`, payload);
        
        // Atualizar usuário se nome, email ou senha foram alterados
        const userUpdatePayload: any = {};
        
        // Atualizar nome se foi alterado
        if (editUserData.name !== editingBarber.userId.name) {
          userUpdatePayload.name = editUserData.name;
        }
        
        // Atualizar email se foi alterado
        if (editUserData.email !== editingBarber.userId.email) {
          userUpdatePayload.email = editUserData.email;
        }
        
        // Atualizar senha apenas se foi preenchida
        if (editUserData.password && editUserData.password.length >= 6) {
          userUpdatePayload.password = editUserData.password;
        } else if (editUserData.password && editUserData.password.length > 0 && editUserData.password.length < 6) {
          alert('A senha deve ter no mínimo 6 caracteres');
          return;
        }
        
        // Sempre atualizar usuário (pelo menos nome e email são obrigatórios)
        await api.patch(`/users/${editingBarber.userId._id}`, {
          name: editUserData.name,
          email: editUserData.email,
          ...userUpdatePayload,
        });
      } else {
        await api.post('/barbers', payload);
      }

      setShowModal(false);
      setEditingBarber(null);
      setFormData({ serviceIds: [], workingHours: [] });
      setNewUserData({ name: '', email: '', password: '' });
      setEditUserData({ name: '', email: '', password: '' });
      loadBarbers();
      loadUsers(); // Recarregar usuários para incluir o novo
    } catch (err: any) {
      alert(err.response?.data?.message || `Erro ao ${editingBarber ? 'atualizar' : 'criar'} barbeiro`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este barbeiro?')) {
      return;
    }

    try {
      await api.delete(`/barbers/${id}`);
      loadBarbers();
    } catch (err) {
      alert('Erro ao remover barbeiro');
    }
  };

  const openNewModal = () => {
    setEditingBarber(null);
    setFormData({ serviceIds: [], workingHours: [] });
    setNewUserData({ name: '', email: '', password: '' });
    setShowModal(true);
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
    // Limpar _id dos workingHours ao carregar para edição
    const cleanWorkingHours = (barber.workingHours || []).map((wh: any) => ({
      dayOfWeek: wh.dayOfWeek,
      startTime: wh.startTime,
      endTime: wh.endTime,
    }));
    
    setFormData({
      serviceIds: barber.serviceIds || [],
      workingHours: cleanWorkingHours,
    });
    setNewUserData({ name: '', email: '', password: '' });
    setEditUserData({
      name: barber.userId.name,
      email: barber.userId.email,
      password: '', // Não carregar senha por segurança
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBarber(null);
    setFormData({ serviceIds: [], workingHours: [] });
    setNewUserData({ name: '', email: '', password: '' });
    setEditUserData({ name: '', email: '', password: '' });
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const addWorkingHour = () => {
    setFormData((prev) => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
      ],
    }));
  };

  const removeWorkingHour = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index),
    }));
  };

  const updateWorkingHour = (
    index: number,
    field: 'dayOfWeek' | 'startTime' | 'endTime',
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((wh, i) =>
        i === index ? { ...wh, [field]: value } : wh,
      ),
    }));
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      {(authLoading || loading) && <Loading text="Carregando barbeiros..." />}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-w-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Barbeiros</h1>
          <button
            onClick={openNewModal}
            className="w-full sm:w-auto bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-md transition-colors"
          >
            Novo Barbeiro
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <div className="min-w-[800px] bg-gray-50/50">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviços
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horários de Trabalho
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {barbers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum barbeiro cadastrado
                  </td>
                </tr>
              ) : (
                barbers.map((barber) => (
                  <tr key={barber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {barber.userId.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{barber.userId.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {barber.serviceIds.length > 0
                          ? `${barber.serviceIds.length} serviço(s)`
                          : 'Nenhum serviço'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {barber.workingHours && barber.workingHours.length > 0 ? (
                          <div className="space-y-1">
                            {barber.workingHours.map((wh, idx) => (
                              <div key={idx} className="text-xs">
                                {DAYS_OF_WEEK[wh.dayOfWeek]}: {wh.startTime} - {wh.endTime}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sem horários configurados</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(barber)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(barber._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Remover"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingBarber && (
              <div className="space-y-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Dados do Usuário</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                    required
                    placeholder="Nome do barbeiro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                    required
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {editingBarber && (
              <div className="space-y-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Barbeiro *
                  </label>
                  <input
                    type="text"
                    value={editUserData.name}
                    onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                    required
                    placeholder="Nome do barbeiro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                    required
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha (deixe em branco para não alterar)
                  </label>
                  <input
                    type="password"
                    value={editUserData.password}
                    onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Preencha apenas se desejar alterar a senha
                  </p>
                </div>
              </div>
            )}

            {services.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serviços (opcional)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {services.map((service) => (
                    <label key={service._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.serviceIds.includes(service._id)}
                        onChange={() => toggleService(service._id)}
                        className="rounded border-gray-300 text-primary-700 focus:ring-primary-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Horários de Trabalho (opcional)
                </label>
                <button
                  type="button"
                  onClick={addWorkingHour}
                  className="text-sm text-primary-700 hover:text-primary-800"
                >
                  + Adicionar horário
                </button>
              </div>
              {formData.workingHours.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {formData.workingHours.map((wh, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <select
                        value={wh.dayOfWeek}
                        onChange={(e) =>
                          updateWorkingHour(index, 'dayOfWeek', parseInt(e.target.value))
                        }
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-600"
                      >
                        {DAYS_OF_WEEK.map((day, idx) => (
                          <option key={idx} value={idx}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={wh.startTime}
                        onChange={(e) => updateWorkingHour(index, 'startTime', e.target.value)}
                        className="px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-primary-600"
                      />
                      <span className="text-sm text-gray-700">até</span>
                      <input
                        type="time"
                        value={wh.endTime}
                        onChange={(e) => updateWorkingHour(index, 'endTime', e.target.value)}
                        className="px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-primary-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeWorkingHour(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-md transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
