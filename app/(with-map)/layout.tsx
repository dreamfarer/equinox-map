import MapWrapper from '../components/map-wrapper';
import Overlay from '../components/overlay';
import { DevModeProvider } from '../context/dev-mode';
import { MarkerLayerProvider } from '../context/marker-layer';

export default function WithMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarkerLayerProvider>
      <DevModeProvider>
        <Overlay />
        <MapWrapper />
        {children}
      </DevModeProvider>
    </MarkerLayerProvider>
  );
}
