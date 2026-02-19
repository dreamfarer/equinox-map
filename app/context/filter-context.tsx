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
import { ExpressionSpecification } from 'maplibre-gl';
import {
    loadActiveCategoriesFromLocalStorage,
    saveActiveCategoriesToLocalStorage,
} from '@/lib/storage-utility';

type FilterContextValue = {
    activeCategories: Partial<Record<TCategory, boolean>>;
    setActiveCategories: Dispatch<
        SetStateAction<Partial<Record<TCategory, boolean>>>
    >;
    toggleActiveCategory: (category: TCategory) => void;
    activeCategoryList: TCategory[];
    mapLibreFilterExpression: ExpressionSpecification;
};

type FilterProviderProps = {
    children: ReactNode;
    allCategories: typeof categories;
};

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({
    children,
    allCategories,
}: Readonly<FilterProviderProps>) {
    const [activeCategories, setActiveCategories] = useState<
        Partial<Record<TCategory, boolean>>
    >(
        () =>
            Object.fromEntries(
                allCategories.map((cat) => [cat, true])
            ) as Record<TCategory, boolean>
    );

    const toggleActiveCategory = useCallback((category: TCategory) => {
        setActiveCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
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

    const categoryExpression = useMemo<ExpressionSpecification>(() => {
        if (activeCategoryList.length === 0) {
            return ['boolean', false];
        }
        if (activeCategoryList.length === categories.length) {
            return ['boolean', true];
        }
        return [
            'any',
            ...activeCategoryList.map(
                (cat) =>
                    [
                        'in',
                        cat,
                        ['get', 'categories'],
                    ] as ExpressionSpecification
            ),
        ];
    }, [activeCategoryList]);

    const contextValue = useMemo<FilterContextValue>(
        () => ({
            activeCategories,
            setActiveCategories,
            toggleActiveCategory,
            activeCategoryList,
            mapLibreFilterExpression: categoryExpression,
        }),
        [
            activeCategories,
            toggleActiveCategory,
            activeCategoryList,
            categoryExpression,
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
