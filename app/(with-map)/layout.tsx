import MapWrapper from '../components/map-wrapper';
import Overlay from '../components/overlay';
import { DevModeProvider } from '../context/dev-mode-context';
import { MapProvider } from '../context/map-context';
import { MarkerProvider } from '../context/marker-context';
import { PopupProvider } from '../context/popup-context';
import { IgnoredMarkerProvider } from '@/app/context/ignored-marker-provider';
import { ReactNode } from 'react';

export default function WithMapLayout({ children }: { children: ReactNode }) {
  return (
    <MapProvider>
      <PopupProvider>
        <IgnoredMarkerProvider>
          <MarkerProvider>
            <DevModeProvider>
              <Overlay />
              <MapWrapper />
              {children}
            </DevModeProvider>
          </MarkerProvider>
        </IgnoredMarkerProvider>
      </PopupProvider>
    </MapProvider>
  );
}
