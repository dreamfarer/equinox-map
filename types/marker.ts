export const markerCategories = ['characters', 'vendors'] as const;
export type MarkerCategory = (typeof markerCategories)[number];

export type Marker = {
  title: string;
  subtitle?: string;
  id?: string;
  foreignId?: string;
  map: string;
  icon?: string;
  lng: number;
  lat: number;
};

export type MergedMarker = {
  title: string;
  subtitle?: string;
  id: string;
  foreignId?: string;
  map: string;
  icon?: string;
  lng: number;
  lat: number;
  categories: MarkerCategory[];
};

export type MarkerFeature = {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    map: string;
    title: string;
    subtitle: string;
    icon: string;
    categories: string[];
  };
};

export type MarkerFeatureCollection = {
  type: 'FeatureCollection';
  features: MarkerFeature[];
};
