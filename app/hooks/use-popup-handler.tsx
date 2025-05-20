'use client';
import { useEffect, useRef } from 'react';
import maplibregl, { Map, Offset } from 'maplibre-gl';
import { createRoot, Root } from 'react-dom/client';
import Popup from '../components/map/popup';
import { ExtendedMap } from '@/types/extended-map';
import { TPopup } from '@/types/popup';
import { TBookmark } from '@/types/bookmark';
import { TMarkerFeature } from '@/types/marker-feature';
import { TCategory } from '@/types/category';
import {
  calculatePopupOffset,
  getFilteredPopupCategories,
  getBookmarkedCategories,
  createCategoriesKey,
} from '@/lib/popup-utility';

const popupHandlerAttached = new WeakSet<Map>();

export function useMapPopupHandler(
  map: Map | null,
  popups: TPopup[],
  bookmarks: TBookmark[],
  toggleBookmark: (id: string, category: string) => void,
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

    let activePopup: maplibregl.Popup | null = null;
    let activeRoot: Root | null = null;
    let activeMarkerId: string | null = null;

    map.on('click', 'markers-layer', (e) => {
      if (!e.features?.length) return;

      const feature = e.features[0] as unknown as TMarkerFeature;
      const { id, anchor } = feature.properties;
      const coordinates = feature.geometry.coordinates;

      const popupData = popupsRef.current.find((m) => m.id === id);
      if (!popupData) return;

      const isBookmarkMode = bookmarkedIdsRef.current !== null;

      const filteredCategories = getFilteredPopupCategories(
        popupData,
        isBookmarkMode,
        activeCategoriesRef.current,
        bookmarksRef.current
      );

      if (Object.keys(filteredCategories).length === 0) return;

      const defaultCategory = Object.keys(filteredCategories)[0];
      const initialCategory =
        (map as ExtendedMap).__requestedCategoryForPopup ?? defaultCategory;

      if (activePopup && activeMarkerId === id) {
        activePopup.remove();
        activeRoot?.unmount();
        activePopup = null;
        activeRoot = null;
        activeMarkerId = null;
        return;
      }

      if (activePopup) {
        activePopup.remove();
        activeRoot?.unmount();
      }

      const popupInstance = new maplibregl.Popup({
        closeButton: false,
        className: 'equinox-popup',
        offset: calculatePopupOffset(anchor) as Offset,
      });

      const container = document.createElement('div');
      const root = createRoot(container);

      const bookmarkedCategories = getBookmarkedCategories(
        id,
        bookmarksRef.current
      );
      const categoriesKey = createCategoriesKey(filteredCategories);

      root.render(
        <Popup
          key={categoriesKey}
          id={id}
          categories={filteredCategories}
          bookmarkedCategories={bookmarkedCategories}
          onToggleBookmark={(markerId, category) =>
            toggleRef.current(markerId, category)
          }
          initialCategory={initialCategory}
        />
      );

      popupInstance
        .setDOMContent(container)
        .setLngLat(coordinates)
        .addTo(map)
        .on('close', () => {
          root.unmount();
          activePopup = null;
          activeRoot = null;
          activeMarkerId = null;
          (map as ExtendedMap).__activePopupRoot = null;
          (map as ExtendedMap).__activePopupInstance = null;
          (map as ExtendedMap).__activePopupMarkerId = null;
        });

      activePopup = popupInstance;
      activeRoot = root;
      activeMarkerId = id;

      (map as ExtendedMap).__activePopupRoot = root;
      (map as ExtendedMap).__activePopupInstance = popupInstance;
      (map as ExtendedMap).__activePopupMarkerId = id;
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const root = (map as ExtendedMap).__activePopupRoot as Root | null;
    const markerId = (map as ExtendedMap).__activePopupMarkerId as
      | string
      | null;
    if (!root || !markerId) return;

    const popupData = popups.find((p) => p.id === markerId);
    if (!popupData) return;

    const isBookmarkMode = bookmarkedIds !== null;

    const filteredCategories = getFilteredPopupCategories(
      popupData,
      isBookmarkMode,
      activeCategories,
      bookmarks
    );

    if (Object.keys(filteredCategories).length === 0) return;

    const defaultCategory = Object.keys(filteredCategories)[0];
    const bookmarkedCategories = getBookmarkedCategories(markerId, bookmarks);
    const categoriesKey = createCategoriesKey(filteredCategories);

    root.render(
      <Popup
        key={categoriesKey}
        id={markerId}
        categories={filteredCategories}
        bookmarkedCategories={bookmarkedCategories}
        onToggleBookmark={(markerId2, category) =>
          toggleRef.current(markerId2, category)
        }
        initialCategory={defaultCategory}
      />
    );
  }, [activeCategories, bookmarkedIds, bookmarks, popups, map]);
}
