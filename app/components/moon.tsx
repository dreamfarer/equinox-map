import type { NextPage } from 'next';
import Image from 'next/image';
import styles from './moon.module.css';

export type MoonType = {
  className?: string;

  /** Variant props */
  size?: 48;
};

const Moon: NextPage<MoonType> = ({ className = '', size = 48 }) => {
  return (
    <div className={[styles.moon, className].join(' ')} data-size={size}>
      <div className={styles.wrapperIcon}>
        <Image
          className={styles.icon}
          loading="lazy"
          fill
          alt=""
          src="/icon.svg"
        />
      </div>
    </div>
  );
};

export default Moon;
