'use client';
import { useEffect, useRef } from 'react';
import { Map } from 'maplibre-gl';
import { TBookmarkId } from '@/types/bookmark';
import { TMarkerFeature } from '@/types/marker-feature';
import { TCategory } from '@/types/category';
import { TPopups } from '@/types/popup';
import { ActivePopup } from './active-popup';

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
