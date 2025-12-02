import { useEffect, useState } from 'react';
import styles from './popup.module.css';
import { TCategoryPayloads } from '@/types/popup';
import Dropdown from '../dropdown';

type Props = {
  id: string;
  categories: TCategoryPayloads;
  initialCategory?: string;
};

export default function Popup({
  id,
  categories,
  initialCategory,
}: Props) {
  const categoryKeys = Object.keys(categories);
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && categoryKeys.includes(initialCategory)
      ? initialCategory
      : categoryKeys[0]
  );

  useEffect(() => {
    if (!categoryKeys.includes(activeCategory))
      setActiveCategory(categoryKeys[0]);
  }, [categoryKeys, activeCategory]);

  const activeItems = categories[activeCategory] || {};

  return (
    <div className={styles.popup}>
      {categoryKeys.length > 1 && (
        <Dropdown
          options={categoryKeys}
          selected={activeCategory}
          onSelect={setActiveCategory}
        />
      )}

      <div className={styles.content}>
        <div className={styles.scroll}>
          {Object.entries(activeItems).map(([itemId, item]) => {
            // const bookmarkSuffix = `${activeCategory}::${itemId}`;
            // const bookmarkId: string = `${id}::${bookmarkSuffix}`;
            // const isBookmarked = bookmarkedItems.includes(bookmarkSuffix);

            return (
              <div key={itemId} className={styles.item}>
                <div className={styles.header}>
                  {item.title && (
                    <div className={styles.title}>{item.title}</div>
                  )}
                </div>
                {item.subtitle && (
                  <div className={styles.subtitle}>{item.subtitle}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
