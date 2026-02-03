'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Company {
  _id: string;
  name: string;
}

interface Service {
  _id: string;
  name: string;
  duration: number;
  price: number;
  companyId?: string | { _id: string; name: string };
}

export default function ServicosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
    companyId: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchCompanyName, setSearchCompanyName] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'GERENTE') router.push('/gerente/servicos');
      else if (user.role !== 'ADMIN') router.push('/admin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAdminContext();
    }
  }, [user]);

  /** Um único GET: serviços já com empresa incluída (populate) + lista de empresas para o dropdown */
  const loadAdminContext = async () => {
    try {
      const response = await api.get<{ services: Service[]; companies: Company[] }>('/service/admin/context');
      const data = response.data;
      setServices(Array.isArray(data.services) ? data.services : []);
      setCompanies(Array.isArray(data.companies) ? data.companies : []);
    } catch (err) {
      console.error('Erro ao carregar serviços e empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyName = (service: Service): string => {
    const c = service.companyId;
    if (!c) return '-';
    return typeof c === 'object' && c !== null && 'name' in c ? (c as { name: string }).name : '-';
  };

  const filteredServices = searchCompanyName.trim()
    ? services.filter((s) =>
        getCompanyName(s).toLowerCase().includes(searchCompanyName.trim().toLowerCase()),
      )
    : services;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        duration: parseInt(formData.duration, 10),
        price: parseFloat(formData.price),
      };
      if (!editingService && formData.companyId) {
        payload.companyId = formData.companyId;
      }

      if (editingService) {
        await api.patch(`/service/${editingService._id}`, { name: payload.name, duration: payload.duration, price: payload.price });
      } else {
        await api.post('/service', payload);
      }

      setShowModal(false);
      setEditingService(null);
      setFormData({ name: '', duration: '', price: '', companyId: '' });
      setSubmitError('');
      loadAdminContext();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao salvar serviço';
      setSubmitError(Array.isArray(msg) ? msg.join(' ') : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString(),
      companyId: typeof service.companyId === 'object' && service.companyId && '_id' in service.companyId
        ? (service.companyId as { _id: string })._id
        : (service.companyId as string) || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este serviço? A exclusão é definitiva.')) {
      return;
    }

    try {
      await api.delete(`/service/${id}`);
      loadAdminContext();
    } catch (err) {
      alert('Erro ao excluir serviço');
    }
  };

  const openNewModal = () => {
    setEditingService(null);
    setFormData({ name: '', duration: '', price: '', companyId: '' });
    setSubmitError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', duration: '', price: '', companyId: '' });
    setSubmitError('');
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      {(authLoading || loading) && <Loading text="Carregando serviços..." />}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-w-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 shrink-0">Serviços</h1>
          <div className="flex-1 flex justify-center min-w-0 px-2 sm:px-4">
            <input
              type="text"
              value={searchCompanyName}
              onChange={(e) => setSearchCompanyName(e.target.value)}
              placeholder="Pesquisar por nome da empresa"
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            />
          </div>
          <button
            onClick={openNewModal}
            className="w-full sm:w-auto shrink-0 bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-md transition-colors"
          >
            Novo Serviço
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <div className="min-w-[700px] bg-gray-50/50">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
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
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {services.length === 0
                        ? 'Nenhum serviço cadastrado'
                        : 'Nenhum serviço encontrado para esta empresa'}
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getCompanyName(service)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{service.duration} min</div>
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
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(service._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {submitError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{submitError}</div>
            )}
            {!editingService && (
              <div>
                <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <select
                  id="companyId"
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Selecione a empresa</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {editingService && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <p className="text-sm text-gray-600 py-1">{getCompanyName(editingService)}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
                placeholder="Ex: Corte, Barba"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração (minutos)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
                min={0}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
