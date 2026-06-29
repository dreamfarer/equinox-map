'use client';

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useMemo,
    useState,
    useCallback,
    useEffect,
} from 'react';
import { categories, TCategory } from '@/types/category';
import {
    loadActiveCategoriesFromLocalStorage,
    saveActiveCategoriesToLocalStorage,
} from '@/lib/storage-utility';
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

export function FilterProvider({
    children,
    allCategories,
}: Readonly<FilterProviderProps>) {
    const [activeCategories, setActiveCategories] = useState<
        Partial<Record<TCategory, boolean>>
    >(() => buildCategoryState(allCategories, true));

    const setAllCategories = useCallback(
        (show: boolean) => {
            setActiveCategories(buildCategoryState(allCategories, show));
        },
        [allCategories]
    );

    const toggleActiveCategory = useCallback((category: TCategory) => {
        setActiveCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    }, []);

    const getCategoriesForMap = useCallback((mapId: string): TCategory[] => {
        return Object.keys(
            (mapCategories as Record<string, Record<string, number>>)[mapId] ??
                {}
        ) as TCategory[];
    }, []);

    useEffect(() => {
        setActiveCategories(
            loadActiveCategoriesFromLocalStorage(allCategories)
        );
    }, [allCategories]);

    useEffect(() => {
        saveActiveCategoriesToLocalStorage(activeCategories);
    }, [activeCategories]);

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
