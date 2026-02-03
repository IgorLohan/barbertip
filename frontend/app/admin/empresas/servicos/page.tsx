'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ServicoEmpresa {
  _id: string;
  name: string;
  active: boolean;
}

export default function ServicosEmpresasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ServicoEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ServicoEmpresa | null>(null);
  const [formData, setFormData] = useState({ name: '', active: true });
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const response = await api.get<ServicoEmpresa[]>('/service-companies/all');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar serviços de empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSaving(true);

    try {
      if (editingItem) {
        await api.patch(`/service-companies/${editingItem._id}`, formData);
      } else {
        await api.post('/service-companies', formData);
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', active: true });
      setSubmitError('');
      loadItems();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao salvar';
      setSubmitError(Array.isArray(msg) ? msg.join(' ') : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: ServicoEmpresa) => {
    setEditingItem(item);
    setFormData({ name: item.name, active: item.active ?? true });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este item? A exclusão é definitiva.')) {
      return;
    }

    try {
      await api.delete(`/service-companies/${id}`);
      loadItems();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ name: '', active: true });
    setSubmitError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: '', active: true });
    setSubmitError('');
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      {(authLoading || loading) && <Loading text="Carregando serviços de empresas..." />}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-w-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Serviços de Empresas</h1>
          <button
            onClick={openNewModal}
            className="w-full sm:w-auto bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-md transition-colors"
          >
            Novo tipo
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Tipos de estabelecimento (categorias) usados nas empresas: Barbearia, Cabelos, Unhas, etc.
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <div className="min-w-[400px] bg-gray-50/50">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Nenhum tipo cadastrado
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
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

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingItem ? 'Editar tipo de estabelecimento' : 'Novo tipo de estabelecimento'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{submitError}</div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Barbearia, Cabelos"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                className="rounded border-gray-300 text-primary-700 focus:ring-primary-600"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Ativo
              </label>
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
