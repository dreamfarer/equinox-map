import { BookmarkSimpleIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import styles from './popup.module.css';
import { TCategoryPayloads } from '@/types/popup';
import { TBookmarkId } from '@/types/bookmark';
import Dropdown from '../dropdown';

type Props = {
  id: string;
  categories: TCategoryPayloads;
  bookmarkedItems: string[];
  toggleBookmark: (id: TBookmarkId) => void;
  initialCategory?: string;
};

export default function Popup({
  id,
  categories,
  bookmarkedItems,
  toggleBookmark,
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
            const bookmarkSuffix = `${activeCategory}::${itemId}`;
            const bookmarkId: TBookmarkId = `${id}::${bookmarkSuffix}`;
            const isBookmarked = bookmarkedItems.includes(bookmarkSuffix);

            return (
              <div key={itemId} className={styles.item}>
                <div className={styles.header}>
                  {item.title && (
                    <div className={styles.title}>{item.title}</div>
                  )}
                  <button
                    className={styles.bookmark}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(bookmarkId);
                    }}
                    aria-label={
                      isBookmarked
                        ? 'Remove bookmark from this item'
                        : 'Bookmark this item'
                    }
                  >
                    {isBookmarked ? (
                      <BookmarkSimpleIcon size="1.5rem" weight="fill" />
                    ) : (
                      <BookmarkSimpleIcon size="1.5rem" />
                    )}
                  </button>
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
