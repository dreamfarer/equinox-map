export type MapMetadata = {
  size: [number, number];
  devUrl: string;
  prodUrl: string;
  boundsData: [number, number, number, number];
  boundsImage: [number, number, number, number];
};

export type MapMetadataRecord = Record<string, MapMetadata>;
