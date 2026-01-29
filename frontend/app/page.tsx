'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Redirecionar baseado no role do usuário
        if (user?.role === 'ADMIN' || user?.role === 'GERENTE') {
          router.push('/admin/dashboard');
        } else if (user?.role === 'BARBEIRO') {
          router.push('/barbeiro/agendamentos');
        } else {
          router.push('/agendar');
        }
      } else {
        // Mostrar landing page se não estiver autenticado
        setShowLanding(true);
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading || !showLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Preline Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="BarberTip"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold text-primary-700">BarberTip</span>
            </div>
            
            <div className="hidden md:flex items-center gap-x-7">
              <a href="#servicos" className="text-gray-600 hover:text-primary-700 font-medium transition-colors">Serviços</a>
              <a href="#sobre" className="text-gray-600 hover:text-primary-700 font-medium transition-colors">Sobre</a>
              <a href="#contato" className="text-gray-600 hover:text-primary-700 font-medium transition-colors">Contato</a>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-primary-700 font-medium transition-colors text-sm sm:text-base"
              >
                Entrar
              </Link>
              <Link
                href="/login"
                className="py-2 px-3 sm:px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-primary-700 text-white hover:bg-primary-800 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section - Preline Style */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight">
              Agende seu horário na{' '}
              <span className="text-primary-500">barbearia</span> favorita
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-primary-100 mb-6 sm:mb-8 px-2">
              Sistema completo de agendamento online. Rápido, fácil e sempre disponível.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/login"
                className="py-3 sm:py-4 px-6 sm:px-8 inline-flex items-center gap-x-2 text-base sm:text-lg font-semibold rounded-lg border border-transparent bg-white text-primary-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-xl"
              >
                Agendar Agora
                <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
              <Link
                href="#sobre"
                className="py-3 sm:py-4 px-6 sm:px-8 inline-flex items-center gap-x-2 text-base sm:text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Saiba Mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="sobre" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 mb-4">
              <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              Por que escolher
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o BarberTip?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A solução completa para gerenciar sua barbearia e facilitar a vida dos seus clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="p-6 sm:p-8">
                <div className="flex justify-center items-center size-12 bg-blue-100 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Agendamento 24/7</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Seus clientes podem agendar a qualquer hora, de qualquer lugar, sem precisar ligar
                </p>
              </div>
            </div>

            <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="p-6 sm:p-8">
                <div className="flex justify-center items-center size-12 bg-green-100 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Gestão Completa</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Controle total sobre agendamentos, barbeiros, serviços e muito mais em um só lugar
                </p>
              </div>
            </div>

            <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="p-6 sm:p-8">
                <div className="flex justify-center items-center size-12 bg-purple-100 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Aumente sua Receita</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Reduza faltas, otimize horários e aumente a satisfação dos seus clientes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Preline Style */}
      <section className="py-12 sm:py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="flex justify-center items-center size-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">1000+</div>
              <div className="text-xs sm:text-sm text-gray-600">Barbearias</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center size-12 bg-green-100 rounded-lg mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">50k+</div>
              <div className="text-xs sm:text-sm text-gray-600">Clientes</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center size-12 bg-purple-100 rounded-lg mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">200k+</div>
              <div className="text-xs sm:text-sm text-gray-600">Agendamentos</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center size-12 bg-primary-200 rounded-lg mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">4.9/5</div>
              <div className="text-xs sm:text-sm text-gray-600">Avaliação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium bg-primary-100 text-primary-800 mb-4">
              <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
              </svg>
              Serviços
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Serviços Disponíveis
            </h2>
            <p className="text-lg text-gray-600">
              Encontre os melhores profissionais perto de você
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'Corte Masculino', icon: '✂️' },
              { name: 'Barba', icon: '🧔' },
              { name: 'Corte + Barba', icon: '💇' },
              { name: 'Sobrancelha', icon: '👁️' },
              { name: 'Pigmentação', icon: '🎨' },
              { name: 'Relaxamento', icon: '✨' },
              { name: 'Hidratação', icon: '💧' },
              { name: 'Tratamentos', icon: '🔬' },
            ].map((service, idx) => (
              <div
                key={idx}
                className="group flex flex-col justify-center items-center bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{service.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium bg-primary-200 text-primary-800 mb-4">
              <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
              </svg>
              Depoimentos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-gray-600">
              Mais de mil barbearias confiam no BarberTip
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'João Silva',
                role: 'Proprietário - Barbearia Moderna',
                text: 'O BarberTip revolucionou minha barbearia. Agora consigo gerenciar tudo de forma muito mais organizada e meus clientes adoram a facilidade de agendar online.',
                rating: 5,
              },
              {
                name: 'Maria Santos',
                role: 'Cliente',
                text: 'Super prático! Consigo marcar meu horário a qualquer momento, sem precisar ligar. E ainda recebo lembretes. Recomendo muito!',
                rating: 5,
              },
              {
                name: 'Carlos Oliveira',
                role: 'Proprietário - Estilo & Cia',
                text: 'Aumentou muito a organização da minha agenda. Reduzi faltas e consegui otimizar melhor os horários dos meus barbeiros.',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-5 sm:p-6 md:p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-800 mb-4 sm:mb-6">"{testimonial.text}"</p>
                <div className="mt-auto">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Preline Style */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-4">
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium bg-white/10 text-white border border-white/20">
              <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              Comece agora
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Pronto para transformar sua barbearia?
          </h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8">
            Junte-se a centenas de barbearias que já usam o BarberTip
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/login"
                className="py-3 sm:py-4 px-6 sm:px-8 inline-flex items-center gap-x-2 text-base sm:text-lg font-semibold rounded-lg border border-transparent bg-white text-primary-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-xl"
            >
              Começar Agora
              <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
            <Link
              href="#sobre"
              className="py-3 sm:py-4 px-6 sm:px-8 inline-flex items-center gap-x-2 text-base sm:text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Ver Demonstração
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Preline Style */}
      <footer id="contato" className="bg-gray-900 text-gray-300 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Image
                  src="/logo.png"
                  alt="BarberTip"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="text-lg sm:text-xl font-bold text-white">BarberTip</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Sistema completo de agendamento para barbearias. Moderno, rápido e confiável.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Links Rápidos</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <a href="#servicos" className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 transition-colors">Serviços</a>
                </li>
                <li>
                  <a href="#sobre" className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 transition-colors">Sobre</a>
                </li>
                <li>
                  <Link href="/login" className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 transition-colors">Entrar</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Suporte</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <a href="#contato" className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 transition-colors">Central de Ajuda</a>
                </li>
                <li>
                  <a href="#contato" className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 transition-colors">Contato</a>
                </li>
                <li>
                  <a href="#sobre" className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 transition-colors">FAQ</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Redes Sociais</h4>
              <div className="flex gap-3 sm:gap-4">
                <a 
                  href="#" 
                  className="size-8 sm:size-10 inline-flex justify-center items-center gap-x-2 rounded-full border border-gray-800 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" 
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="size-8 sm:size-10 inline-flex justify-center items-center gap-x-2 rounded-full border border-gray-800 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" 
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="size-8 sm:size-10 inline-flex justify-center items-center gap-x-2 rounded-full border border-gray-800 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" 
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs sm:text-sm text-gray-400">
                &copy; {new Date().getFullYear()} BarberTip. Todos os direitos reservados.
              </p>
              <div className="flex gap-x-4">
                <a className="text-xs sm:text-sm text-gray-400 hover:text-gray-200 transition-colors" href="#">Termos</a>
                <a className="text-xs sm:text-sm text-gray-400 hover:text-gray-200 transition-colors" href="#">Privacidade</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
