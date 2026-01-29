import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import PrelineScript from '@/components/PrelineScript';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BarberTip - Sistema de Agendamento',
  description: 'Sistema de agendamento para barbearias',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
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
