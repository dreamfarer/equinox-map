import Menu from './components/menu';
import styles from './page.module.css';
import MapWrapper from './components/map-wrapper';
import Navbar from './components/navbar';
import { MarkerLayerProvider } from './context/marker-layer';

export default function Home() {
  return (
    <MarkerLayerProvider>
      <div className={styles.home}>
        <Navbar />
        <Menu />
        <MapWrapper />
      </div>
    </MarkerLayerProvider>
  );
}
