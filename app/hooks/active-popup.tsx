import maplibregl, { Offset, Popup as MapLibrePopup } from 'maplibre-gl';
import { Root, createRoot } from 'react-dom/client';
import Popup from '../components/map/popup';
import {
    calculatePopupOffset,
    createCategoriesKey,
    getFilteredPopupCategories,
} from '../../lib/popup-utility';
import { TMarkerFeature } from '@/types/marker-feature';
import { TCategoryPayloads, TPopups } from '@/types/popup';
import { TBookmarkId } from '@/types/bookmark';
import { ExtendedMap } from '@/types/extended-map';
import { TCategory } from '@/types/category';

interface RenderArgs {
    feature: TMarkerFeature;
    popups: TPopups;
    isBookmarkMode: boolean;
    activeCategories: TCategory[];
    bookmarks: TBookmarkId[];
    toggleBookmark: (id: TBookmarkId) => void;
    map: maplibregl.Map;
}

interface UpdateArgs {
    map: maplibregl.Map;
    popups: TPopups;
    activeCategories: TCategory[];
    bookmarks: TBookmarkId[];
    bookmarkedIds: string[] | null;
    toggleBookmark: (id: TBookmarkId) => void;
}

export function getBookmarkedItemIds(
    markerId: string,
    bookmarks: TBookmarkId[]
): string[] {
    return bookmarks
        .filter((b) => b.startsWith(`${markerId}::`))
        .map((b) => b.split('::').slice(1).join('::'));
}

export class ActivePopup {
    private mapLibrePopup: MapLibrePopup | null = null;
    private root: Root | null = null;
    private markerId: string | null = null;

    isSame(markerId: string) {
        return markerId === this.markerId;
    }

    remove() {
        this.mapLibrePopup?.remove();
        this.root?.unmount();
        this.mapLibrePopup = null;
        this.root = null;
        this.markerId = null;
    }

    private internalRender(
        map: maplibregl.Map,
        markerId: string,
        coordinates: [number, number],
        anchor: string,
        categories: TCategoryPayloads,
        bookmarks: TBookmarkId[],
        toggleBookmark: RenderArgs['toggleBookmark'],
        initialCategory: string
    ) {
        const container = document.createElement('div');
        const root = createRoot(container);
        const categoriesKey = createCategoriesKey(categories);
        const bookmarkedItems = getBookmarkedItemIds(markerId, bookmarks);

        root.render(
            <Popup
                key={categoriesKey}
                id={markerId}
                categories={categories}
                bookmarkedItems={bookmarkedItems}
                toggleBookmark={toggleBookmark}
                initialCategory={initialCategory}
            />
        );

        const popupInstance = new MapLibrePopup({
            closeButton: false,
            className: 'equinox-popup',
            offset: calculatePopupOffset(
                anchor as 'center' | 'bottom'
            ) as Offset,
        })
            .setDOMContent(container)
            .setLngLat(coordinates)
            .addTo(map);

        popupInstance.on('close', () => this.remove());

        this.mapLibrePopup = popupInstance;
        this.root = root;
        this.markerId = markerId;

        const extMap = map as ExtendedMap;
        extMap.__activePopupRoot = root;
        extMap.__activePopupInstance = popupInstance;
        extMap.__activePopupMarkerId = markerId;
    }

    render({
        feature,
        popups,
        isBookmarkMode,
        activeCategories,
        bookmarks,
        toggleBookmark,
        map,
    }: RenderArgs) {
        const { id, anchor } = feature.properties;
        const coordinates = feature.geometry.coordinates;

        const categories = getFilteredPopupCategories(
            id,
            popups,
            isBookmarkMode,
            bookmarks,
            activeCategories
        );
        if (!categories || Object.keys(categories).length === 0) return;

        const defaultCategory = Object.keys(categories)[0];
        const requestedCategory =
            (map as ExtendedMap).__requestedCategoryForPopup ?? defaultCategory;

        this.internalRender(
            map,
            id,
            coordinates,
            anchor,
            categories,
            bookmarks,
            toggleBookmark,
            requestedCategory
        );
    }

    update({
        popups,
        activeCategories,
        bookmarks,
        bookmarkedIds,
        toggleBookmark,
    }: UpdateArgs) {
        if (!this.root || !this.markerId) return;

        const isBookmarkMode = bookmarkedIds !== null;
        const categories = getFilteredPopupCategories(
            this.markerId,
            popups,
            isBookmarkMode,
            bookmarks,
            activeCategories
        );
        if (!categories || Object.keys(categories).length === 0) return;

        const defaultCategory = Object.keys(categories)[0];
        const bookmarkedItems = getBookmarkedItemIds(this.markerId, bookmarks);
        const categoriesKey = createCategoriesKey(categories);

        this.root.render(
            <Popup
                key={categoriesKey}
                id={this.markerId}
                categories={categories}
                bookmarkedItems={bookmarkedItems}
                toggleBookmark={toggleBookmark}
                initialCategory={defaultCategory}
            />
        );
    }
}
