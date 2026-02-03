import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';

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

function saveToLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage<T>(key: string): T | undefined {
    if (typeof window === 'undefined') return undefined;
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : undefined;
}
