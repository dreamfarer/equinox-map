'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import { useMarkerLayerContext } from '../context/marker-layer';
import Results from './filter/results';

const Bookmarks: NextPage = () => {
  const { bookmarkIds, popups, flyToMarker, toggleBookmark } =
    useMarkerLayerContext();

  const bookmarkedItems = bookmarkIds.flatMap((id) => {
    const [markerId, categoryId, itemId] = id.split('::');
    const popup = popups[markerId];
    if (!popup) return [];

    const category = popup[categoryId];
    if (!category) return [];

    const item = category[itemId];
    if (!item) return [];

    return [
      {
        bookmarkId: id,
        markerId,
        categoryId,
        itemId,
        title: item.title,
        subtitle: item.subtitle,
      },
    ];
  });

  return (
    <div className={styles.menu}>
      <div className={styles.scrollArea}>
        <div className={styles.results}>
          {bookmarkedItems.length === 0 && (
            <>
              <div className="noBookmark">No bookmarks yet. (´•︵•`)</div>
              <div className="noBookmark">
                Save markers through the search bar or popups first.
              </div>
            </>
          )}
          <Results
            results={bookmarkedItems}
            bookmarkIds={bookmarkIds}
            onSelect={flyToMarker}
            toggleBookmark={toggleBookmark}
            toggleBookmarks={(ids) => ids.forEach(toggleBookmark)}
          />
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
