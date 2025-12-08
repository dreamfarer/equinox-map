import type { Feature, FeatureCollection, Point } from 'geojson';

export type TMarkerFeatureProperties = {
  id: string;
  map: string;
  lng: number;
  lat: number;
  icon: string;
  anchor: string;
  categories: string[];
};

export type TMarkerFeature = Feature<Point, TMarkerFeatureProperties>;

export type TMarkerFeatureCollection = FeatureCollection<
  Point,
  TMarkerFeatureProperties
>;
