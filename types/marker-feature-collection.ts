import { TMarkerFeature } from './marker-feature';

export type TMarkerFeatureCollection = {
    type: 'FeatureCollection';
    features: TMarkerFeature[];
};
