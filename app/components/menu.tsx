import type { NextPage } from 'next';
import styles from './menu.module.css';

export type MenuType = {
  className?: string;
};

const Menu: NextPage<MenuType> = ({ className = '' }) => {
  return (
    <div className={[styles.menu, className].join(' ')}>
      <div className={styles.searchBar}>
        <div className={styles.placeholderText}>Filter ...</div>
      </div>
      <div className={styles.category}>
        <b className={styles.title}>Quests</b>
        <div className={styles.entryRow}>
          <div className={styles.entryLeftActive}>Main Quest</div>
          <div className={styles.entryRightInactive}>Side Quest</div>
        </div>
      </div>
      <div className={styles.categoryActive}>
        <b className={styles.title1}>Collectables</b>
        <div className={styles.entryRow1}>
          <div className={styles.entryLeftActive}>Old Horseshoe</div>
          <div className={styles.entryLeftActive}>Sunflower</div>
        </div>
        <div className={styles.entryRow1}>
          <div className={styles.entryLeftActive}>Eagle Feather</div>
          <div className={styles.entryLeftActive}>Poppy</div>
        </div>
      </div>
      <div className={styles.categoryActive1}>
        <b className={styles.title}>Characters</b>
      </div>
      <div className={styles.categoryActive1}>
        <b className={styles.title}>Races</b>
      </div>
      <div className={styles.themeInactive}>
        <b className={styles.title4}>Fast Travel</b>
      </div>
    </div>
  );
};

export default Menu;
