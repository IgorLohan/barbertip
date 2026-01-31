'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
}

interface Company {
  _id: string;
  name: string;
  address?: string;
  endereco?: string;
  linkendereco?: string;
  phone?: string;
  active: boolean;
  monthlyFee?: number;
  serviceId?: string | { _id: string; name: string };
  serviceIds?: string[] | { _id: string; name: string }[];
}

export default function EmpresasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    endereco: '',
    linkendereco: '',
    phone: '',
    active: true,
    monthlyFee: '',
    serviceIds: [] as string[],
  });
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadCompanies();
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const response = await api.get<Category[]>('/service-companies');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        address: formData.address || undefined,
        endereco: formData.endereco || undefined,
        linkendereco: formData.linkendereco || undefined,
        phone: formData.phone || undefined,
        active: formData.active,
        monthlyFee: formData.monthlyFee ? parseFloat(formData.monthlyFee) : 0,
        serviceIds: formData.serviceIds?.length ? formData.serviceIds : undefined,
      };

      if (editingCompany) {
        await api.patch(`/companies/${editingCompany._id}`, payload);
      } else {
        await api.post('/companies', payload);
      }

      setShowModal(false);
      setEditingCompany(null);
      setFormData({ name: '', address: '', endereco: '', linkendereco: '', phone: '', active: true, monthlyFee: '', serviceIds: [] });
      setSubmitError('');
      loadCompanies();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao salvar empresa';
      setSubmitError(Array.isArray(msg) ? msg.join(' ') : msg);
    } finally {
      setSaving(false);
    }
  };

  const getCompanyServiceIds = (company: Company): string[] => {
    if (company.serviceIds?.length) {
      return company.serviceIds.map((s) =>
        typeof s === 'object' && s !== null && '_id' in s ? (s as { _id: string })._id : String(s)
      );
    }
    if (company.serviceId) {
      const id = typeof company.serviceId === 'object' && company.serviceId !== null && '_id' in company.serviceId
        ? (company.serviceId as { _id: string })._id
        : String(company.serviceId);
      return id ? [id] : [];
    }
    return [];
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      address: company.address || '',
      endereco: company.endereco || '',
      linkendereco: company.linkendereco || '',
      phone: company.phone || '',
      active: company.active,
      monthlyFee: company.monthlyFee?.toString() || '',
      serviceIds: getCompanyServiceIds(company),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover esta empresa?')) {
      return;
    }

    try {
      await api.delete(`/companies/${id}`);
      loadCompanies();
    } catch (err) {
      alert('Erro ao remover empresa');
    }
  };

  const openNewModal = () => {
    setEditingCompany(null);
    setFormData({ name: '', address: '', endereco: '', linkendereco: '', phone: '', active: true, monthlyFee: '', serviceIds: [] });
    setSubmitError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setFormData({ name: '', address: '', endereco: '', linkendereco: '', phone: '', active: true, monthlyFee: '', serviceIds: [] });
    setSubmitError('');
  };

  const getCategoryNames = (company: Company): string => {
    const ids = getCompanyServiceIds(company);
    if (!ids.length) return '-';
    const names = ids.map((id) => {
      const ref = company.serviceIds?.find((s) => (typeof s === 'object' ? (s as { _id: string })._id : s) === id);
      if (ref && typeof ref === 'object' && 'name' in ref) return (ref as { name: string }).name;
      return categories.find((c) => c._id === id)?.name ?? id;
    });
    return names.join(', ');
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(categoryId)
        ? prev.serviceIds.filter((id) => id !== categoryId)
        : [...prev.serviceIds, categoryId],
    }));
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      {(authLoading || loading) && <Loading text="Carregando empresas..." />}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-w-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Empresas</h1>
          <button
            onClick={openNewModal}
            className="w-full sm:w-auto bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-md transition-colors"
          >
            Nova Empresa
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <div className="min-w-[800px] bg-gray-50/50">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensalidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma empresa cadastrada
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{getCategoryNames(company)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{company.address || company.endereco || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{company.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {company.monthlyFee?.toFixed(2).replace('.', ',') || '0,00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(company._id)}
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
          title={editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                required
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria (tipo de estabelecimento)
              </label>
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50/50 max-h-40 overflow-y-auto space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma categoria cadastrada</p>
                ) : (
                  categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2">
                      <input
                        type="checkbox"
                        checked={formData.serviceIds.includes(cat._id)}
                        onChange={() => toggleCategory(cat._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                      <span className="text-sm text-gray-900">{cat.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                placeholder="Rua, número, bairro, cidade, estado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço complementar
              </label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                placeholder="Complemento ou referência"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link do endereço (Google Maps, etc.)
              </label>
              <input
                type="url"
                value={formData.linkendereco}
                onChange={(e) => setFormData({ ...formData, linkendereco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor da Mensalidade (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-primary-600 focus:border-primary-700"
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Empresa ativa</span>
              <button
                type="button"
                role="switch"
                aria-checked={formData.active}
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  formData.active ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md transition-colors disabled:opacity-50"
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
