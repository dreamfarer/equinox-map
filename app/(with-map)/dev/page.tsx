'use client';
import Filter from '@/app/components/filter';
import { useDevMode } from '../../context/dev-mode-context';
import { useEffect } from 'react';

export default function DevPage() {
    const { setDevMode } = useDevMode();
    useEffect(() => {
        setDevMode(true);
        return () => setDevMode(false);
    }, [setDevMode]);
    return <Filter />;
}
