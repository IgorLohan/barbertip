'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Service {
  _id: string;
  name: string;
  duration: number;
  price: number;
}

export default function ServicosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
  });

  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN' && user.role !== 'GERENTE') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'GERENTE') {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        await api.patch(`/services/${editingService._id}`, formData);
      } else {
        await api.post('/services', formData);
      }

      setShowModal(false);
      setEditingService(null);
      setFormData({ name: '', duration: '', price: '' });
      loadServices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar serviço');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este serviço?')) {
      return;
    }

    try {
      await api.delete(`/services/${id}`);
      loadServices();
    } catch (err) {
      alert('Erro ao remover serviço');
    }
  };

  const openNewModal = () => {
    setEditingService(null);
    setFormData({ name: '', duration: '', price: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', duration: '', price: '' });
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'GERENTE') {
    return null;
  }

  return (
    <Layout>
      {(authLoading || loading) && <Loading text="Carregando serviços..." />}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-w-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Serviços</h1>
          <button
            onClick={openNewModal}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Novo Serviço
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <div className="min-w-[600px] bg-gray-50/50">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum serviço cadastrado
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{service.duration} minutos</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
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
          title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração (minutos)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
                min="0"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
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
