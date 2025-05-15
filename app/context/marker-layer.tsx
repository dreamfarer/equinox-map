'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import maplibregl from 'maplibre-gl';
import { markerCategories, MarkerCategory } from '../../types/marker-category';
import { MergedMarker } from '../../types/marker';
import {
  loadMarkersByCategory,
  mergeMarkersByCharacter,
} from '@/lib/marker-layer-utility';
import styles from '../components/map.module.css';

type MarkerLayerContextType = {
  enabled: Record<MarkerCategory, boolean>;
  toggleCategory: (category: MarkerCategory) => void;
  setMapInstance: (map: maplibregl.Map) => void;
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
  document.querySelectorAll('[data-character]').forEach((el) => el.remove());
}

function renderMarkers(
  markers: MergedMarker[],
  enabled: Record<MarkerCategory, boolean>,
  map: maplibregl.Map,
) {
  markers.forEach((marker) => {
    const shouldShow = marker.categories.some(
      (t) => enabled[t as MarkerCategory],
    );
    if (!shouldShow) return;

    const hasCustomIcon = marker.icon?.trim();
    const iconName = hasCustomIcon ? marker.icon : 'default-marker';
    const iconPath = `/icon/64/${iconName}.webp`;

    const el = document.createElement('div');
    el.className = `${styles.customMarker} ${hasCustomIcon ? styles.withIcon : ''}`;

    el.setAttribute('data-character', marker.character);

    const img = document.createElement('img');
    img.src = iconPath;
    img.alt = marker.title;
    img.className = styles.markerImage;

    el.appendChild(img);

    new maplibregl.Marker({ element: el })
      .setLngLat([marker.lng, marker.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<h3>${marker.title}</h3><p>${marker.subtitle}</p><small>${marker.categories.join(', ')}</small>`,
        ),
      )
      .addTo(map);
  });
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

  const [map, setMap] = useState<maplibregl.Map | null>(null);

  const toggleCategory = (category: MarkerCategory) =>
    setEnabled((prev) => ({ ...prev, [category]: !prev[category] }));

  const setMapInstance = useCallback((m: maplibregl.Map) => {
    setMap(m);
  }, []);

  useEffect(() => {
    if (!map) return;

    (async () => {
      const loaded = await loadMarkersByCategory();
      const merged = mergeMarkersByCharacter(loaded);
      clearExistingMarkers();
      renderMarkers(merged, enabled, map);
    })();
  }, [map, enabled]);

  return (
    <MarkerLayerContext.Provider
      value={{ enabled, toggleCategory, setMapInstance }}
    >
      {children}
    </MarkerLayerContext.Provider>
  );
}
