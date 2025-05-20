import { BookmarkSimple } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import styles from './popup.module.css';
import { TPopupPayload } from '@/types/popup-payload';

type Props = {
  id: string;
  categories: Record<string, TPopupPayload>;
  bookmarkedCategories: string[];
  onToggleBookmark: (id: string, category: string) => void;
  initialCategory?: string;
};

export default function Popup({
  id,
  categories,
  bookmarkedCategories,
  onToggleBookmark,
  initialCategory,
}: Props) {
  const tabs = Object.keys(categories);

  const [activeCategory, setActiveCategory] = useState(
    initialCategory && tabs.includes(initialCategory)
      ? initialCategory
      : tabs[0]
  );

  useEffect(() => {
    if (!tabs.includes(activeCategory)) setActiveCategory(tabs[0]);
  }, [tabs, activeCategory]);

  const isBookmarked = bookmarkedCategories.includes(activeCategory);
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(id, activeCategory);
  };

  const activeItems = categories[activeCategory]?.items || [];
  const [firstItem, ...restItems] = activeItems;

  return (
    <div className={styles.popup}>
      {tabs.length > 1 && (
        <div className={styles.tabs}>
          {tabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.tab} ${
                cat === activeCategory ? styles.active : ''
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          {firstItem?.title && (
            <div className={styles.title}>{firstItem.title}</div>
          )}
          <button
            className={styles.bookmark}
            onClick={handleBookmark}
            aria-label={
              isBookmarked
                ? 'Remove bookmark from this category'
                : 'Bookmark this category'
            }
          >
            {isBookmarked ? (
              <BookmarkSimple size="1.5rem" weight="fill" />
            ) : (
              <BookmarkSimple size="1.5rem" />
            )}
          </button>
        </div>

        {firstItem?.subtitle && (
          <div className={styles.subtitle}>{firstItem.subtitle}</div>
        )}

        {restItems.map((item, i) => (
          <div key={i}>
            {item.title && <div className={styles.title}>{item.title}</div>}
            {item.subtitle && (
              <div className={styles.subtitle}>{item.subtitle}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
