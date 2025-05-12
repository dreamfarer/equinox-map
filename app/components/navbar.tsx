import type { NextPage } from 'next';
import Image from 'next/image';
import Moon from './moon';
import styles from './navbar.module.css';

const Navbar: NextPage = () => {
  return (
    <div className={styles.navbar}>
      <div className={styles.cluster}>
        <div className={styles.wrapperLogoFrame}>
          <Image
            className={styles.logoFrameIcon}
            loading="lazy"
            fill
            alt=""
            src="/logo-frame.svg"
          />
        </div>
        <div className={styles.wrapperButtonActive}>
          <Image
            className={styles.buttonActiveIcon}
            loading="lazy"
            fill
            alt=""
            src="/button-active.svg"
          />
        </div>
      </div>
      <div className={styles.cluster}>
        <div className={styles.wrapperButtonInactive}>
          <Image
            className={styles.logoFrameIcon}
            loading="lazy"
            fill
            alt=""
            src="/button-inactive.svg"
          />
        </div>
        <div className={styles.buttonInactive}>
          <Moon size={48} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
