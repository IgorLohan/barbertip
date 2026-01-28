'use client';

import { useEffect } from 'react';

export default function PrelineScript() {
  useEffect(() => {
    import('preline/dist/preline.js');
  }, []);

  return null;
}
