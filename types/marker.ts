export const markerCategories = [
  'character',
  'shop',
  'dandelion',
  'race',
  'fast-travel',
  'scenic-ride',
  'antler',
  'apple',
  'blackberry',
  'carrot',
  'cave',
  'delphinium',
  'dryad-saddle-mushroom',
  'eagle-feather',
  'fossil',
  'horseshoe',
  'king-boletus-mushroom',
  'moss',
  'poppy',
  'raspberry',
  'raven-feather',
  'seagull-feather',
  'sulfur-shelf-mushroom',
  'sunflower',
  'violet',
  'water-lily',
  'weekly-quests',
] as const;

export type MarkerCategory = (typeof markerCategories)[number];

export type Marker = {
  title?: string;
  subtitle?: string;
  id?: string;
  foreignId?: string;
  map: string;
  icon?: string;
  lng: number;
  lat: number;
};

export type MergedMarker = {
  title?: string;
  subtitle?: string;
  id: string;
  foreignId?: string;
  map: string;
  icon: string;
  lng: number;
  lat: number;
  anchor: 'bottom' | 'center';
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
    anchor: 'bottom' | 'center';
    categories: string[];
  };
};

export type MarkerFeatureCollection = {
  type: 'FeatureCollection';
  features: MarkerFeature[];
};
