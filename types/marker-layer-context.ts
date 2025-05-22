import { Map } from 'maplibre-gl';
import { TCategory } from './category';
import { TPopups } from './popup';
import { TBookmarkId } from './bookmark';

export type TMarkerLayerContext = {
  enabled: Record<TCategory, boolean>;
  toggleCategory: (category: TCategory) => void;
  setMapInstance: (map: Map) => void;
  popups: TPopups;
  flyToMarker: (id: string, category?: string) => void;
  showOnlyBookmarks: boolean;
  setShowOnlyBookmarks: (enabled: boolean) => void;
  bookmarkIds: TBookmarkId[];
  toggleBookmark: (id: TBookmarkId) => void;
};
