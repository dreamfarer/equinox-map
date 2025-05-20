import type { Map, Popup } from 'maplibre-gl';
import type { Root } from 'react-dom/client';

export interface ExtendedMap extends Map {
  __activePopupInstance: Popup | null;
  __activePopupRoot: Root | null;
  __activePopupMarkerId: string | null;
  __requestedCategoryForPopup: string | null;
}
