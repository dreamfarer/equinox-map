export type MapMetadata = {
    name: string;
    tileSize: number;
    size: number[];
    devUrl: string;
    prodUrl: string;
    boundsData: number[];
    boundsImage: number[];
    minZoom: number;
    maxZoom: number;
    maxOverscaledZoom: number;
    initZoom: number;
    backgroundColor: string;
    attribution: string;
};

export type MapMetadataRecord = Record<string, MapMetadata>;
