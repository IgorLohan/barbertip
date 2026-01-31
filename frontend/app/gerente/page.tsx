'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GerentePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/gerente/dashboard');
  }, [router]);

  return null;
}
