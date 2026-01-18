'use client';

import { TPopups } from '@/types/popup';
import { createContext, ReactNode, useContext, useMemo } from 'react';

type PopupContextValue = {
    popups: TPopups;
};

type PopupProviderProps = {
    children: ReactNode;
    popups: TPopups;
};

const PopupContext = createContext<PopupContextValue | undefined>(undefined);

export function PopupProvider({ children, popups }: PopupProviderProps) {
    const contextValue = useMemo<PopupContextValue>(
        () => ({
            popups,
        }),
        [popups]
    );

    return <PopupContext value={contextValue}>{children}</PopupContext>;
}

export function usePopupContext() {
    const context = useContext(PopupContext);
    if (!context)
        throw new Error('usePopupContext must be used inside <PopupProvider>');
    return context;
}
