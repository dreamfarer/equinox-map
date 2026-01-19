'use client';

import Filter from '@/app/components/filter';
import { useDevMode } from '../../context/dev-mode-context';
import { useEffect } from 'react';

export default function DevPage() {
    const { setIsDevMode } = useDevMode();
    useEffect(() => {
        setIsDevMode(true);
        return () => setIsDevMode(false);
    });
    return <Filter />;
}
