'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import maplibregl, { Offset } from 'maplibre-gl';
import {
  markerCategories,
  MarkerCategory,
  MergedMarker,
} from '../../types/marker';
import { loadMergedMarkers } from '@/lib/marker-layer-utility';
import styles from '../components/map.module.css';
import { createRoot } from 'react-dom/client';
import { Popup } from '../components/map/popup';

type MarkerLayerContextType = {
  enabled: Record<MarkerCategory, boolean>;
  toggleCategory: (category: MarkerCategory) => void;
  setMapInstance: (map: maplibregl.Map) => void;
  markers: MergedMarker[];
  flyToMarker: (id: string) => void;
  showOnlyMarkers: (ids: string[] | null) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
};

const MarkerLayerContext = createContext<MarkerLayerContextType | null>(null);

export const useMarkerLayerContext = () => {
  const ctx = useContext(MarkerLayerContext);
  if (!ctx)
    throw new Error(
      'useMarkerLayerContext must be used inside MarkerLayerProvider',
    );
  return ctx;
};

function clearExistingMarkers() {
  document.querySelectorAll('[data-id]').forEach((el) => el.remove());
  document.querySelectorAll('.maplibregl-popup').forEach((el) => el.remove());
}

function renderMarkers(
  markers: MergedMarker[],
  enabled: Record<MarkerCategory, boolean>,
  visibleIds: string[] | null,
  map: maplibregl.Map,
) {
  const defaultMarkers: MergedMarker[] = [];
  const customMarkers: MergedMarker[] = [];

  for (const marker of markers) {
    const categoryAllowed = marker.categories.some(
      (t) => enabled[t as MarkerCategory],
    );
    const specificallyVisible = !visibleIds || visibleIds.includes(marker.id);
    const shouldShow = categoryAllowed && specificallyVisible;
    if (!shouldShow) continue;

    if (marker.icon?.trim()) {
      customMarkers.push(marker);
    } else {
      defaultMarkers.push(marker);
    }
  }

  const drawMarker = (marker: MergedMarker) => {
    const hasCustomIcon = Boolean(marker.icon?.trim());
    const iconName = hasCustomIcon ? marker.icon!.trim() : 'default-marker';
    const iconPath = `/icon/64/${iconName}.webp`;

    const el = document.createElement('div');
    el.className = `${styles.customMarker}`;
    el.setAttribute('data-id', marker.id);

    const img = document.createElement('img');
    img.src = iconPath;
    img.alt = marker.title ? marker.title : marker.categories[0];
    img.className = styles.markerImage;
    el.appendChild(img);

    const markerAnchor = hasCustomIcon ? 'center' : 'bottom';
    const popupOffset = hasCustomIcon
      ? {
          top: [0, 20],
          bottom: [0, -20],
          left: [20, 0],
          right: [-20, 0],
          'top-left': [17, 17],
          'top-right': [-17, 17],
          'bottom-left': [17, -17],
          'bottom-right': [-17, -17],
        }
      : {
          top: [0, 5],
          bottom: [0, -40],
          left: [18, -18],
          right: [-18, -18],
          'top-left': [12, 0],
          'top-right': [-12, 0],
          'bottom-left': [14, -32],
          'bottom-right': [-14, -32],
        };

    const popup = new maplibregl.Popup({
      closeButton: false,
      className: 'equinox-popup',
      offset: popupOffset as Offset,
    });

    const popupContainer = document.createElement('div');
    createRoot(popupContainer).render(
      <Popup
        title={marker.title ? marker.title : marker.categories[0]}
        subtitle={marker.subtitle}
        onClose={() => popup.remove()}
      />,
    );
    popup.setDOMContent(popupContainer);

    new maplibregl.Marker({ element: el, anchor: markerAnchor })
      .setLngLat([marker.lng, marker.lat])
      .setPopup(popup)
      .addTo(map);
  };

  defaultMarkers.forEach(drawMarker);
  customMarkers.forEach(drawMarker);
}

export function MarkerLayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState<Record<MarkerCategory, boolean>>(
    Object.fromEntries(
      markerCategories.map((category) => [category, true]),
    ) as Record<MarkerCategory, boolean>,
  );

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id)
        ? prev.filter((b) => b !== id)
        : [...prev, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookmarks', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const [markers, setMarkers] = useState<MergedMarker[]>([]);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [visibleIds, setVisibleIds] = useState<string[] | null>(null);

  const toggleCategory = (category: MarkerCategory) =>
    setEnabled((prev) => ({ ...prev, [category]: !prev[category] }));

  const setMapInstance = useCallback((m: maplibregl.Map) => {
    setMap(m);
  }, []);

  const flyToMarker = useCallback(
    (id: string) => {
      if (!map) return;
      const m = markers.find((mk) => mk.id === id);
      if (!m) return;
      map.flyTo({ center: [m.lng, m.lat], zoom: 6 });
    },
    [map, markers],
  );

  const showOnlyMarkers = useCallback((ids: string[] | null) => {
    setVisibleIds(ids);
  }, []);

  useEffect(() => {
    if (!map) return;

    (async () => {
      if (markers.length === 0) {
        const loaded = await loadMergedMarkers();
        setMarkers(loaded);
        clearExistingMarkers();
        renderMarkers(loaded, enabled, visibleIds, map);
      } else {
        clearExistingMarkers();
        renderMarkers(markers, enabled, visibleIds, map);
      }
    })();
  }, [map, enabled, visibleIds, markers]);

  useEffect(() => {
    if (!map || markers.length === 0) return;
    clearExistingMarkers();
    renderMarkers(markers, enabled, visibleIds, map);
  }, [map, markers, enabled, visibleIds]);

  const ctxValue = useMemo<MarkerLayerContextType>(
    () => ({
      enabled,
      toggleCategory,
      setMapInstance,
      markers,
      flyToMarker,
      showOnlyMarkers,
      bookmarks,
      toggleBookmark,
    }),
    [
      enabled,
      markers,
      bookmarks,
      flyToMarker,
      showOnlyMarkers,
      toggleBookmark,
      setMapInstance,
    ],
  );

  return (
    <MarkerLayerContext.Provider value={ctxValue}>
      {children}
    </MarkerLayerContext.Provider>
  );
}
