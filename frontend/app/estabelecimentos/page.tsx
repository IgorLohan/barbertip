'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

interface Estabelecimento {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface Category {
  _id: string;
  name: string;
  active?: boolean;
}

interface ServiceItem {
  _id: string;
  name: string;
  companyId?: string;
}

export default function EstabelecimentosPage() {
  const [estabQuery, setEstabQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Estabelecimento[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Estabelecimento[]>([]);
  const [searched, setSearched] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceNames, setServiceNames] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceName, setSelectedServiceName] = useState<string>('');
  const [showCityFilterDropdown, setShowCityFilterDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get<Category[]>('/service-companies').then((res) => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    api.get<ServiceItem[]>('/service').then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      const names = [...new Set(list.map((s) => s.name))].sort();
      setServiceNames(names);
    }).catch(() => setServiceNames([]));
  }, []);

  useEffect(() => {
    const q = estabQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      api
        .get<Estabelecimento[]>('/company-search', { params: { q } })
        .then((res) => setSuggestions(Array.isArray(res.data) ? res.data : []))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [estabQuery]);

  useEffect(() => {
    const q = cityQuery.trim();
    if (q.length < 2) {
      setCitySuggestions([]);
      return;
    }
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    cityDebounceRef.current = setTimeout(() => {
      api
        .get<string[]>('/cidades', { params: { q } })
        .then((res) => setCitySuggestions(Array.isArray(res.data) ? res.data : []))
        .catch(() => setCitySuggestions([]));
    }, 300);
    return () => {
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    };
  }, [cityQuery]);

  const hasFilters = selectedCategoryId || selectedServiceName || cityQuery.trim();
  const canSearch = estabQuery.trim().length >= 2 || hasFilters;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearch) return;
    setLoading(true);
    setSearched(true);
    const params: Record<string, string> = { q: estabQuery.trim() };
    if (selectedCategoryId) params.categoryId = selectedCategoryId;
    if (selectedServiceName) params.serviceName = selectedServiceName;
    if (cityQuery.trim()) params.city = cityQuery.trim();
    api
      .get<Estabelecimento[]>('/company-search', { params })
      .then((res) => setResults(Array.isArray(res.data) ? res.data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  const clearFilters = () => {
    setSelectedCategoryId('');
    setSelectedServiceName('');
    setCityQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="BarberTip"
                width={180}
                height={51}
                className="object-contain h-10 sm:h-12"
              />
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors text-sm sm:text-base"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Encontrar estabelecimentos
        </h1>
        <p className="text-gray-600 mb-6">
          Busque por nome do estabelecimento ou serviço e, se quiser, filtre por cidade.
        </p>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Painel de filtros (área à esquerda) */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </h2>

              {/* Categorias (ServiceCompanies) */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Categoria</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Serviços */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Serviço</label>
                <select
                  value={selectedServiceName}
                  onChange={(e) => setSelectedServiceName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Todos</option>
                  {serviceNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Estado / Cidade */}
              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Cidade ou estado</label>
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setShowCityFilterDropdown(true);
                  }}
                  onFocus={() => setShowCityFilterDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityFilterDropdown(false), 180)}
                  placeholder="Ex.: Recife, PE"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                {showCityFilterDropdown && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 max-h-48 overflow-auto">
                    {citySuggestions.slice(0, 10).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setCityQuery(c);
                          setShowCityFilterDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {(selectedCategoryId || selectedServiceName || cityQuery.trim()) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full py-2 text-sm font-medium text-primary-700 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Busca + resultados */}
          <div className="flex-1 min-w-0">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-0 bg-white rounded-tr-xl rounded-bl-xl shadow-lg border border-gray-200 overflow-visible mb-8"
            >
              <div className="flex-1 relative flex items-center sm:border-r border-gray-200">
                <span className="absolute left-4 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={estabQuery}
                  onChange={(e) => setEstabQuery(e.target.value)}
                  placeholder="Estabelecimento ou serviço"
                  className="w-full pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded-tr-xl sm:rounded-tr-none sm:rounded-bl-xl border-0 text-sm sm:text-base"
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 max-h-48 overflow-auto">
                    {suggestions.slice(0, 10).map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          setEstabQuery(c.name);
                          setSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 relative flex items-center sm:border-r border-gray-200">
                <span className="absolute left-4 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 180)}
                  placeholder="Cidade ou estado"
                  className="w-full pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded-none border-0 text-sm sm:text-base"
                />
                {showCityDropdown && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 max-h-48 overflow-auto">
                    {citySuggestions.slice(0, 10).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setCityQuery(c);
                          setShowCityDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-2"
                      >
                        <span className="text-gray-400 shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </span>
                        {c}
                      </button>
                    ))}
                    <p className="px-4 py-2 text-right text-xs text-gray-400">Sugestões de cidades</p>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !canSearch}
                className="px-6 sm:px-8 py-3.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold uppercase text-sm tracking-wide transition-colors rounded-bl-xl rounded-tr-xl sm:rounded-bl-none"
              >
                {loading ? 'Buscando…' : 'BUSCAR'}
              </button>
            </form>

            {searched && (
              <section>
                {loading ? null : results.length === 0 ? (
                  <p className="text-gray-600">Nenhum estabelecimento encontrado. Tente outros termos ou filtros.</p>
                ) : (
                  <ul className="space-y-4">
                    {results.map((c) => (
                      <li
                        key={c._id}
                        className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h2 className="font-semibold text-gray-900 text-lg">{c.name}</h2>
                            {c.address && (
                              <p className="text-sm text-gray-600 mt-1">{c.address}</p>
                            )}
                            {c.phone && (
                              <p className="text-sm text-gray-600 mt-0.5">{c.phone}</p>
                            )}
                          </div>
                          <Link
                            href={`/agendar?estabelecimento=${encodeURIComponent(c.name)}`}
                            className="inline-flex items-center justify-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-lg text-sm transition-colors shrink-0"
                          >
                            Agendar
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
