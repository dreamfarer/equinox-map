export type TMarkerFeatureProperties = {
  id: string;
  map: string;
  lng: number;
  lat: number;
  icon: string;
  anchor: 'bottom' | 'center';
  categories: string[];
};

export type TMarkerFeature = {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: TMarkerFeatureProperties;
};
