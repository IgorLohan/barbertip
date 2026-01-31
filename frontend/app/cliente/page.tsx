'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cliente/agendar');
  }, [router]);

  return null;
}
