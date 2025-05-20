export type TMarkerFeature = {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    map: string;
    lng: number;
    lat: number;
    icon: string;
    anchor: 'bottom' | 'center';
    categories: string[];
  };
};
