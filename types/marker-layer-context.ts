import { MarkerCategory, MergedMarker } from './marker';
import { Map } from 'maplibre-gl';

export type MarkerLayerContextType = {
  enabled: Record<MarkerCategory, boolean>;
  toggleCategory: (category: MarkerCategory) => void;
  setMapInstance: (map: Map) => void;
  markers: MergedMarker[];
  flyToMarker: (id: string) => void;
  showOnlyMarkers: (ids: string[] | null) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
};
