import Menu from '../components/menu';
import styles from '../page.module.css';
import MapWrapper from '../components/map-wrapper';
import Navbar from '../components/navbar';
import { MarkerLayerProvider } from '../context/marker-layer';
import { DevModeProvider } from '../context/dev-mode';

export default function DevPage() {
  return (
    <MarkerLayerProvider>
      <DevModeProvider>
        <div className={styles.home}>
          <Navbar />
          <Menu />
          <MapWrapper />
        </div>
      </DevModeProvider>
    </MarkerLayerProvider>
  );
}
