'use client';

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useMemo,
    useCallback,
} from 'react';
import { categories, TCategory } from '@/types/category';
import { useLocalStorage } from '@/app/(map)/hooks/use-local-storage';
import mapCategories from '@/app/data/map-categories.json';

type FilterContextValue = {
    activeCategories: Partial<Record<TCategory, boolean>>;
    setActiveCategories: Dispatch<
        SetStateAction<Partial<Record<TCategory, boolean>>>
    >;
    toggleActiveCategory: (category: TCategory) => void;
    activeCategoryList: TCategory[];
    setAllCategories: (show: boolean) => void;
    allCategories: typeof categories;
    getCategoriesForMap: (mapId: string) => TCategory[];
};

type FilterProviderProps = {
    children: ReactNode;
    allCategories: typeof categories;
};

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

function buildCategoryState(
    categories: readonly TCategory[],
    value: boolean
): Record<TCategory, boolean> {
    return Object.fromEntries(categories.map((cat) => [cat, value])) as Record<
        TCategory,
        boolean
    >;
}

// Categories without a stored choice are shown.
function resolveCategoryState(
    categories: readonly TCategory[],
    stored: Partial<Record<TCategory, boolean>> | undefined
): Record<TCategory, boolean> {
    return Object.fromEntries(
        categories.map((cat) => {
            const value = stored?.[cat];
            return [cat, typeof value === 'boolean' ? value : true];
        })
    ) as Record<TCategory, boolean>;
}

export function FilterProvider({
    children,
    allCategories,
}: Readonly<FilterProviderProps>) {
    const [storedCategories, setStoredCategories] =
        useLocalStorage<Partial<Record<TCategory, boolean>>>(
            'active-categories'
        );

    const activeCategories = useMemo<Partial<Record<TCategory, boolean>>>(
        () => resolveCategoryState(allCategories, storedCategories),
        [allCategories, storedCategories]
    );

    const setActiveCategories = useCallback<
        Dispatch<SetStateAction<Partial<Record<TCategory, boolean>>>>
    >(
        (action) => {
            setStoredCategories((stored) =>
                action instanceof Function
                    ? action(resolveCategoryState(allCategories, stored))
                    : action
            );
        },
        [allCategories, setStoredCategories]
    );

    const setAllCategories = useCallback(
        (show: boolean) => {
            setActiveCategories(buildCategoryState(allCategories, show));
        },
        [allCategories, setActiveCategories]
    );

    const toggleActiveCategory = useCallback(
        (category: TCategory) => {
            setActiveCategories((prev) => ({
                ...prev,
                [category]: !prev[category],
            }));
        },
        [setActiveCategories]
    );

    const getCategoriesForMap = useCallback((mapId: string): TCategory[] => {
        return Object.keys(
            (mapCategories as Record<string, Record<string, number>>)[mapId] ??
                {}
        ) as TCategory[];
    }, []);

    const activeCategoryList = useMemo<TCategory[]>(() => {
        return (
            Object.entries(activeCategories) as [
                TCategory,
                boolean | undefined,
            ][]
        )
            .filter(([, enabled]) => enabled === true)
            .map(([cat]) => cat);
    }, [activeCategories]);

    const contextValue = useMemo<FilterContextValue>(
        () => ({
            activeCategories,
            setActiveCategories,
            toggleActiveCategory,
            activeCategoryList,
            setAllCategories,
            allCategories,
            getCategoriesForMap,
        }),
        [
            activeCategories,
            setActiveCategories,
            toggleActiveCategory,
            activeCategoryList,
            setAllCategories,
            allCategories,
            getCategoriesForMap,
        ]
    );

    return <FilterContext value={contextValue}>{children}</FilterContext>;
}

export function useFilterContext() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error(
            'useFilterContext must be used inside <FilterProvider>'
        );
    }
    return context;
}
