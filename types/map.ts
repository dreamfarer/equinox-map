export type MapMeta = {
  size: [number, number];
  boundsData: [number, number, number, number];
  boundsImage: [number, number, number, number];
};

export type Maps = Record<string, MapMeta>;
