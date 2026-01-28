import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import PrelineScript from '@/components/PrelineScript';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BarberTip - Sistema de Agendamento',
  description: 'Sistema de agendamento para barbearias',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden">
      <body className={`${inter.className} bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 min-h-screen overflow-x-hidden`}>
        <AuthProvider>{children}</AuthProvider>
        <PrelineScript />
      </body>
    </html>
  );
}
