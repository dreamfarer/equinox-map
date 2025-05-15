import { MarkerCategory } from './marker-category';

export type Marker = {
  title: string;
  subtitle?: string;
  category: string;
  character?: string;
  map: string;
  icon?: string;
  lng: number;
  lat: number;
};

export type MergedMarker = {
  character: string;
  map: string;
  lng: number;
  lat: number;
  title: string;
  subtitle: string;
  icon: string;
  categories: MarkerCategory[];
};
