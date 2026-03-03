export type TMarkerFeatureProperties = {
    id: string;
    map: string;
    lng: number;
    lat: number;
    icon: string;
    anchor: string;
    categories: string[];
};

export type TMarkerFeature = {
    type: string;
    id?: string;
    geometry: {
        type: string;
        coordinates: number[];
    };
    properties: TMarkerFeatureProperties;
};
