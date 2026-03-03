import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { categories, TCategory } from '@/types/category';

export function saveCollectedMarkerIdsToLocalStorage(ids: Set<string>): void {
    saveToLocalStorage('collected-marker-ids', [...ids]);
}

export function loadCollectedMarkerIdsFromLocalStorage(
    allMarkers: TMarkerFeatureCollection
): Set<string> {
    const collectedMarkerIds: string[] | undefined = loadFromLocalStorage(
        'collected-marker-ids'
    );
    if (!collectedMarkerIds) return new Set<string>();
    return new Set<string>(
        collectedMarkerIds.filter((id) =>
            allMarkers.features.some((f) => f.properties.id === id)
        )
    );
}

export function loadActiveCategoriesFromLocalStorage(
    allCategories: typeof categories
): Partial<Record<TCategory, boolean>> {
    const collectedActiveCategories:
        | Partial<Record<TCategory, boolean>>
        | undefined = loadFromLocalStorage('active-categories');
    if (!collectedActiveCategories) {
        return Object.fromEntries(
            allCategories.map((cat) => [cat, true])
        ) as Record<TCategory, boolean>;
    }
    return Object.fromEntries(
        allCategories.map((cat) => [
            cat,
            typeof collectedActiveCategories[cat] === 'boolean'
                ? collectedActiveCategories[cat]
                : true,
        ])
    ) as Record<TCategory, boolean>;
}

export function saveActiveCategoriesToLocalStorage(
    categories: Partial<Record<TCategory, boolean>>
): void {
    saveToLocalStorage('active-categories', categories);
}

function saveToLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return undefined;
    localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage<T>(key: string): T | undefined {
    if (typeof window === 'undefined') return undefined;
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
}
