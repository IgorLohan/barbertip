'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BarbeiroPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/barbeiro/agendamentos');
  }, [router]);

  return null;
}
