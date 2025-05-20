import { Map } from 'maplibre-gl';
import { TCategory } from './category';
import { TPopup } from './popup';
import { TBookmark } from './bookmark';

export type TMarkerLayerContext = {
  enabled: Record<TCategory, boolean>;
  toggleCategory: (category: TCategory) => void;
  setMapInstance: (map: Map) => void;
  popups: TPopup[];
  flyToMarker: (id: string, category?: string) => void;
  showOnlyBookmarks: (enabled: boolean) => void;
  bookmarks: TBookmark[];
  toggleBookmark: (id: string, category: string) => void;
};
