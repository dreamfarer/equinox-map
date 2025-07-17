import MapWrapper from '../components/map-wrapper';
import Overlay from '../components/overlay';
import { DevModeProvider } from '../context/dev-mode';
import { MapProvider } from '../context/map-context';
import { MarkerProvider } from '../context/marker-context';

export default function WithMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MapProvider>
      <MarkerProvider>
        <DevModeProvider>
          <Overlay />
          <MapWrapper />
          {children}
        </DevModeProvider>
      </MarkerProvider>
    </MapProvider>
  );
}
