import Menu from './components/menu';
import styles from './page.module.css';
import MapWrapper from './components/map-wrapper';
import Navbar from './components/navbar';

export default function Home() {
  return (
    <div className={styles.home}>
      <Navbar />
      <Menu />
      <MapWrapper />
    </div>
  );
}
