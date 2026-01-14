'use client';
import { useEffect, useRef } from 'react';
import { Map } from 'maplibre-gl';
import { TBookmarkId } from '@/types/bookmark';
import { TMarkerFeature } from '@/types/marker-feature';
import { TCategory } from '@/types/category';
import { TPopups } from '@/types/popup';
import { ActivePopup } from './active-popup';
import { getFilteredPopupCategories } from '../../lib/popup-utility';

const MARKERS_LAYER = 'markers-layer';
const LONG_PRESS_MS = 400;

const popupHandlerAttached = new WeakSet<Map>();
const activePopup = new ActivePopup();

export function useMapPopupHandler(
    map: Map | null,
    popups: TPopups,
    bookmarks: TBookmarkId[],
    toggleBookmark: (id: TBookmarkId) => void,
    activeCategories: TCategory[],
    bookmarkedIds: string[] | null
) {
    const popupsRef = useRef(popups);
    const bookmarksRef = useRef(bookmarks);
    const toggleRef = useRef(toggleBookmark);
    const activeCategoriesRef = useRef(activeCategories);
    const bookmarkedIdsRef = useRef(bookmarkedIds);

    useEffect(() => {
        popupsRef.current = popups;
    }, [popups]);
    useEffect(() => {
        bookmarksRef.current = bookmarks;
    }, [bookmarks]);
    useEffect(() => {
        toggleRef.current = toggleBookmark;
    }, [toggleBookmark]);
    useEffect(() => {
        activeCategoriesRef.current = activeCategories;
    }, [activeCategories]);
    useEffect(() => {
        bookmarkedIdsRef.current = bookmarkedIds;
    }, [bookmarkedIds]);

    useEffect(() => {
        if (!map || popupHandlerAttached.has(map)) return;
        popupHandlerAttached.add(map);

        const openPopup = (feature: TMarkerFeature) => {
            const id = feature.properties.id;
            const isSame = activePopup.isSame(id);
            activePopup.remove();
            if (isSame) return;
            activePopup.render({
                feature,
                popups: popupsRef.current,
                isBookmarkMode: bookmarkedIdsRef.current !== null,
                activeCategories: activeCategoriesRef.current,
                bookmarks: bookmarksRef.current,
                toggleBookmark: toggleRef.current,
                map,
            });
        };

        const getItemCountAndFirstBookmark = (
            markerId: string
        ): { count: number; first: TBookmarkId | null } => {
            const categories = getFilteredPopupCategories(
                markerId,
                popupsRef.current,
                bookmarkedIdsRef.current !== null,
                bookmarksRef.current,
                activeCategoriesRef.current
            );
            if (!categories) return { count: 0, first: null };

            let first: TBookmarkId | null = null;
            let count = 0;
            for (const [catKey, items] of Object.entries(categories)) {
                for (const itemKey of Object.keys(items)) {
                    const bookmarkId =
                        `${markerId}::${catKey}::${itemKey}` as TBookmarkId;
                    if (!first) first = bookmarkId;
                    count += 1;
                }
            }
            return { count, first };
        };

        const handleContextAction = (feature: TMarkerFeature) => {
            const markerId = feature.properties.id as string;
            const { count, first } = getItemCountAndFirstBookmark(markerId);

            if (count === 1 && first) {
                toggleRef.current(first);
            } else if (count > 1) {
                openPopup(feature);
            }
        };

        map.on('click', MARKERS_LAYER, (e) => {
            if (!e.features?.length) return;
            const feature = e.features[0] as unknown as TMarkerFeature;
            openPopup(feature);
        });

        map.on('contextmenu', MARKERS_LAYER, (e) => {
            e.preventDefault();
            if (!e.features?.length) return;
            const feature = e.features[0] as unknown as TMarkerFeature;
            handleContextAction(feature);
        });

        let longPressTimer: number | null = null;

        const clearLongPress = () => {
            if (longPressTimer !== null) {
                window.clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        map.on('touchstart', MARKERS_LAYER, (e) => {
            if (!e.features?.length) return;
            const feature = e.features[0] as unknown as TMarkerFeature;
            const touches = (e.originalEvent as TouchEvent).touches;
            if (touches.length !== 1) return;

            longPressTimer = window.setTimeout(() => {
                handleContextAction(feature);
                longPressTimer = null;
            }, LONG_PRESS_MS);
        });

        map.on('touchmove', clearLongPress);
        map.on('touchend', MARKERS_LAYER, clearLongPress);
        map.on('touchcancel', MARKERS_LAYER, clearLongPress);
    }, [map]);

    useEffect(() => {
        if (!map) return;
        activePopup.update({
            map,
            popups,
            activeCategories,
            bookmarks,
            bookmarkedIds,
            toggleBookmark,
        });
    }, [
        popups,
        activeCategories,
        bookmarks,
        bookmarkedIds,
        toggleBookmark,
        map,
    ]);
}
