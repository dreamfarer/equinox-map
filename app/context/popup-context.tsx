'use client';

import { loadPopups } from '@/lib/popup-utility';
import { TPopups } from '@/types/popup';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type TPopupContext = {
    popups: TPopups;
};

const PopupContext = createContext<TPopupContext | null>(null);

export function PopupProvider({ children }: { children: React.ReactNode }) {
    const [popups, setPopups] = useState<TPopups>({});

    useEffect(() => {
        const load = async () => {
            setPopups(await loadPopups());
        };
        load();
    }, []);

    const contextValue = useMemo<TPopupContext>(
        () => ({
            popups,
        }),
        [popups]
    );

    return (
        <PopupContext.Provider value={contextValue}>
            {children}
        </PopupContext.Provider>
    );
}

export function usePopupContext() {
    const context = useContext(PopupContext);
    if (!context)
        throw new Error('usePopupContext must be used inside <PopupProvider>');
    return context;
}
