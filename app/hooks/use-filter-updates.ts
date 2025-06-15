import {
  computeFilteredMarkersAndExpression,
  safelyRemovePopup,
} from '@/lib/marker-layer-utility';
import { TCategory } from '@/types/category';
import { ExtendedMap } from '@/types/extended-map';
import { TPopups } from '@/types/popup';
import { ExpressionSpecification, Map } from 'maplibre-gl';
import { useEffect } from 'react';

export function useFilterUpdates(
  map: Map | null,
  enabled: Record<TCategory, boolean>,
  bookmarkedIds: string[] | null,
  popups: TPopups,
  onUpdate?: (result: {
    filtered: TPopups;
    expression: ExpressionSpecification | null;
    activeCategories: TCategory[];
  }) => void
) {
  useEffect(() => {
    if (!map) return;

    const result = computeFilteredMarkersAndExpression(
      enabled,
      bookmarkedIds,
      popups
    );

    onUpdate?.(result);

    requestAnimationFrame(() => {
      if (map.getLayer('markers-layer')) {
        const activeId = (map as ExtendedMap).__activePopupMarkerId;
        const isPopupStillValid = activeId
          ? Object.hasOwn(result.filtered, activeId)
          : true;
        if (!isPopupStillValid) safelyRemovePopup(map);
        map.setFilter('markers-layer', result.expression);
      }
    });
  }, [map, enabled, bookmarkedIds, popups, onUpdate]);
}
