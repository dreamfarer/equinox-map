'use client';

import { useEffect } from 'react';
import { useDevMode } from '@/app/context/dev-mode-context';

export default function DevPage() {
    const { setIsDevMode } = useDevMode();
    useEffect(() => {
        setIsDevMode(true);
        return () => setIsDevMode(false);
    });
}
