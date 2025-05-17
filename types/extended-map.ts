import type { Map } from 'maplibre-gl';
import type { Root } from 'react-dom/client';

export interface ExtendedMap extends Map {
  __activePopupInstance: maplibregl.Popup | null;
  __activePopupRoot: Root | null;
  __activePopupMarkerId: string | null;
}
