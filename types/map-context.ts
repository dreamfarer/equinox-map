import { Map } from 'maplibre-gl';
import { MapMetadataRecord } from './map-metadata';

export type TMapContext = {
  mapInstance: Map | null;
  mapMetadata: MapMetadataRecord | null;
  setMapInstance: (map: Map) => void;
};
