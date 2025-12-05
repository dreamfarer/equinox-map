import MapWrapper from '../components/map-wrapper';
import Overlay from '../components/overlay';
import { DevModeProvider } from '../context/dev-mode-context';
import { MapProvider } from '../context/map-context';
import { MarkerProvider } from '../context/marker-context';
import { PopupProvider } from '../context/popup-context';
import { ReactNode } from 'react';
import { CollectedMarkerProvider } from '@/app/context/collected-marker-provider';

export default function WithMapLayout({ children }: { children: ReactNode }) {
  return (
    <MapProvider>
      <PopupProvider>
        <CollectedMarkerProvider>
          <MarkerProvider>
            <DevModeProvider>
              <Overlay />
              <MapWrapper />
              {children}
            </DevModeProvider>
          </MarkerProvider>
        </CollectedMarkerProvider>
      </PopupProvider>
    </MapProvider>
  );
}
