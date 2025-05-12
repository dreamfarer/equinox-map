import type { NextPage } from 'next';
import styles from './page.module.css';
import Image from 'next/image';

const Popup: NextPage = () => {
  return (
    <div className={styles.popUp}>
      <div className={styles.frame}>
        <b className={styles.title}>Location 1</b>
        <div className={styles.subtitle}>Some more info ...</div>
        <div className={styles.wrapperQuit}>
          <Image
            className={styles.quitIcon}
            loading="lazy"
            fill
            alt=""
            src="/quit.svg"
          />
        </div>
      </div>
      <div className={styles.wrapperArrow}>
        <Image
          className={styles.quitIcon}
          loading="lazy"
          fill
          alt=""
          src="/arrow.svg"
        />
      </div>
    </div>
  );
};

export default Popup;
