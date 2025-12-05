'use client';

import { useEffect } from 'react';
import Filter from '@/app/components/filter';
import { useDevModeContext } from '@/app/context/dev-mode-context';

export default function DevPage() {
  const { setDevMode } = useDevModeContext();
  useEffect(() => {
    setDevMode(true);
    return () => setDevMode(false);
  }, [setDevMode]);
  return <Filter />;
}
