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

export default function EstabelecimentosPage() {
  const [estabQuery, setEstabQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Estabelecimento[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Estabelecimento[]>([]);
  const [searched, setSearched] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = estabQuery.trim();
    if (q.length < 2) return;
    setLoading(true);
    setSearched(true);
    api
      .get<Estabelecimento[]>('/company-search', { params: { q } })
      .then((res) => {
        let list = Array.isArray(res.data) ? res.data : [];
        const city = cityQuery.trim().toLowerCase();
        if (city && list.length > 0) {
          list = list.filter(
            (c) =>
              (c.address && c.address.toLowerCase().includes(city)) ||
              (c.name && c.name.toLowerCase().includes(city)),
          );
        }
        setResults(list);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Encontrar estabelecimentos
        </h1>
        <p className="text-gray-600 mb-6">
          Busque por nome do estabelecimento ou serviço e, se quiser, filtre por cidade.
        </p>

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
            disabled={loading || estabQuery.trim().length < 2}
            className="px-6 sm:px-8 py-3.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold uppercase text-sm tracking-wide transition-colors rounded-bl-xl rounded-tr-xl sm:rounded-bl-none"
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>

        {searched && (
          <section>
            {loading ? null : results.length === 0 ? (
              <p className="text-gray-600">Nenhum estabelecimento encontrado. Tente outros termos.</p>
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
      </main>
    </div>
  );
}
