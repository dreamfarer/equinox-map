import { Map } from 'maplibre-gl';
import { TCategory } from './category';
import { TPopups } from './popup';
import { TBookmarkId } from './bookmark';
import { Maps } from './map';
import { TMarkerFeatureCollection } from './marker-feature-collection';

export type TMarkerLayerContext = {
  enabled: Record<TCategory, boolean>;
  popups: TPopups;
  markers: TMarkerFeatureCollection | null;
  maps: Maps | null;
  bookmarkIds: TBookmarkId[];
  showOnlyBookmarks: boolean;
  categoryBookmarkMap: Record<string, string[]>;
  flyToMarker: (id: string, category?: string) => void;
  setShowOnlyBookmarks: (enabled: boolean) => void;
  toggleBookmark: (id: TBookmarkId) => void;
  toggleBookmarks: (categoryId: string) => void;
  toggleCategory: (category: TCategory) => void;
  setMapInstance: (map: Map) => void;
};
