'use client';
import { useEffect, useRef } from 'react';
import { Map } from 'maplibre-gl';
import { TBookmarkId } from '@/types/bookmark';
import { TMarkerFeature } from '@/types/marker-feature';
import { TCategory } from '@/types/category';
import { TPopups } from '@/types/popup';
import { ActivePopup } from './active-popup';
import { getFilteredPopupCategories } from '../../lib/popup-utility';

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

    map.on('click', 'markers-layer', (event) => {
      if (!event.features?.length) return;
      const feature = event.features[0] as unknown as TMarkerFeature;
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
    });

    map.on('contextmenu', 'markers-layer', (event) => {
      event.originalEvent?.preventDefault();
      if (!event.features?.length) return;

      const feature = event.features[0] as unknown as TMarkerFeature;
      const id = feature.properties.id;

      const categories = getFilteredPopupCategories(
        id,
        popupsRef.current,
        bookmarkedIdsRef.current !== null,
        bookmarksRef.current,
        activeCategoriesRef.current
      );

      if (!categories || Object.keys(categories).length === 0) return;

      let totalItems = 0;
      let firstCat = '';
      let firstItemId = '';

      for (const [cat, items] of Object.entries(categories)) {
        const itemKeys = Object.keys(items);
        if (itemKeys.length) {
          if (totalItems === 0) {
            firstCat = cat;
            firstItemId = itemKeys[0];
          }
          totalItems += itemKeys.length;
        }
      }

      if (totalItems === 1 && firstCat && firstItemId) {
        const bookmarkId: TBookmarkId = `${id}::${firstCat}::${firstItemId}`;
        toggleRef.current(bookmarkId);
        return;
      }

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
    });
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
  }, [popups, activeCategories, bookmarks, bookmarkedIds, toggleBookmark, map]);
}
