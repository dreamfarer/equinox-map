export type MapMetadata = {
  tileSize: number;
  size: [number, number];
  devUrl: string;
  prodUrl: string;
  boundsData: [number, number, number, number];
  boundsImage: [number, number, number, number];
  attribution: string;
};

export type MapMetadataRecord = Record<string, MapMetadata>;
