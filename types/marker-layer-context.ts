import { Map } from 'maplibre-gl';
import { TCategory } from './category';
import { TPopups } from './popup';
import { TBookmarkId } from './bookmark';
import { Maps } from './map';
import { TMarkerFeatureCollection } from './marker-feature-collection';

export type TMarkerLayerContext = {
  popups: TPopups;
  markers: TMarkerFeatureCollection | null;
  maps: Maps | null;
  showOnlyBookmarks: boolean;
  enabled: Record<TCategory, boolean>;
  bookmarkIds: TBookmarkId[];
  toggleCategory: (category: TCategory) => void;
  flyToMarker: (id: string, category?: string) => void;
  setMapInstance: (map: Map) => void;
  setShowOnlyBookmarks: (enabled: boolean) => void;
  toggleBookmark: (id: TBookmarkId) => void;
};
