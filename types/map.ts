export type MapMeta = {
  size: [number, number];
  devUrl: string;
  prodUrl: string;
  boundsData: [number, number, number, number];
  boundsImage: [number, number, number, number];
};

export type Maps = Record<string, MapMeta>;
