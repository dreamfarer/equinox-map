import { ReactNode } from 'react';
import { DevModeContextProvider } from '@/app/provider/dev-mode-context-provider';
import { MapContextProvider } from '@/app/provider/map-context-provider';
import MapWrapper from '@/app/components/map-wrapper';
import { MarkerContextProvider } from '@/app/provider/marker-provider';
import mapsJson from '@/data/maps.json';
import markersJson from '@/data/markers.json';
import popupsJson from '@/data/popups.json';
import type { MapMetadataRecord } from '@/types/map-metadata';
import { TMarkerFeatureCollection } from '@/types/marker';
import { TPopups } from '@/types/popup';
import { PopupProvider } from '@/app/context/popup-context';
const mapMetadata: MapMetadataRecord = mapsJson;
const markers = markersJson as TMarkerFeatureCollection;
const popups: TPopups = popupsJson

export default function WithMapLayout({ children }: { children: ReactNode }) {
  return (
    <MapContextProvider mapMetadata={mapMetadata}>
      <PopupProvider>
          <MarkerContextProvider markers={markers} popups={popups}>
            <DevModeContextProvider>
              <MapWrapper />
              {children}
            </DevModeContextProvider>
          </MarkerContextProvider>
      </PopupProvider>
    </MapContextProvider>
  );
}
