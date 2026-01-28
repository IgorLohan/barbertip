'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fechar menu mobile ao trocar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fechar ao redimensionar para desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  let menuItems: Array<{ href: string; label: string; icon: JSX.Element }> = [];

  if (user?.role === 'CLIENTE') {
    menuItems = [
      { href: '/agendar', label: 'Agendar', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
      { href: '/meus-agendamentos', label: 'Meus Agendamentos', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    ];
  } else if (user?.role === 'BARBEIRO') {
    menuItems = [
      { href: '/barbeiro/agendamentos', label: 'Meus Agendamentos', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
    ];
  } else if (user?.role === 'ADMIN') {
    menuItems = [
      { href: '/admin/dashboard', label: 'Dashboard', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
      { href: '/admin/empresas', label: 'Empresas', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
      { href: '/admin/usuarios', label: 'Usuários', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    ];
  } else if (user?.role === 'GERENTE') {
    menuItems = [
      { href: '/admin/dashboard', label: 'Dashboard', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
      { href: '/admin/servicos', label: 'Serviços', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
      { href: '/admin/barbeiros', label: 'Barbeiros', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
      { href: '/admin/agendamentos', label: 'Agendamentos', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
    ];
  }

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className="flex items-center justify-between p-4 border-b md:border-b-0">
        {(isExpanded || isMobile) && <h1 className="text-lg md:text-xl font-bold text-primary-600 truncate">BarberTip</h1>}
        {!isMobile && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors hidden md:flex"
            aria-label={isExpanded ? 'Recolher menu' : 'Expandir menu'}
          >
            <svg className={`w-6 h-6 text-gray-700 transition-transform ${isExpanded ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Fechar menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const showLabel = isExpanded || isMobile;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              title={!showLabel ? item.label : ''}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {showLabel && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        {(isExpanded || isMobile) && (
          <div className="mb-4 px-4 py-2">
            <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors ${(!isExpanded && !isMobile) ? 'justify-center' : ''}`}
          title={(!isExpanded && !isMobile) ? 'Sair' : ''}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {(isExpanded || isMobile) && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Overlay mobile */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setMobileMenuOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setMobileMenuOpen(false)}
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Sidebar desktop: sempre visível em md+ */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-2 bottom-2 rounded-r-2xl bg-white/95 backdrop-blur-sm shadow-lg transition-all duration-300 ease-in-out z-30 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        <NavContent isMobile={false} />
      </aside>

      {/* Drawer mobile */}
      <aside
        className={`fixed left-0 top-2 bottom-2 w-[min(100vw-2rem,280px)] max-w-full rounded-r-2xl bg-white shadow-xl z-30 md:hidden flex flex-col transition-transform duration-200 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent isMobile />
      </aside>

      {/* Header mobile: hamburger + título */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-sm border-b z-10 flex items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold text-primary-600 truncate">BarberTip</span>
      </header>

      {/* Main */}
      <main
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          isExpanded ? 'md:ml-64' : 'md:ml-20'
        } ${mobileMenuOpen ? 'md:ml-0' : ''} pt-14 md:pt-0`}
      >
        <div className="max-w-7xl mx-auto py-4 md:py-6 px-3 sm:px-4 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
