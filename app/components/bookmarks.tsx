'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import { useMarkerContext } from '../context/marker-context';
import Results from './filter/results';
import Menu from './menu';
import { useBookmarkContext } from '../context/bookmark-context';
import { usePopupContext } from '../context/popup-context';
import { useFlyToMarker } from '../hooks/use-fly-to-marker';
import { useMapContext } from '../context/map-context';

const Bookmarks: NextPage = () => {
  const { mapInstance } = useMapContext();
  const { popups } = usePopupContext();
  const { bookmarkIds, toggleBookmark } = useBookmarkContext();
  const { markers } = useMarkerContext();
  const flyToMarker = useFlyToMarker(mapInstance, popups, markers);

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
    <Menu>
      <div className={styles.scrollArea}>
        <div className={styles.results}>
          {bookmarkedItems.length === 0 && (
            <>
              <div className={styles.noBookmark}>
                No bookmarks yet. (´•︵•`)
              </div>
              <div className={`${styles.noBookmark} ${styles.subtitle}`}>
                Add bookmarks first via the filter menu, the search bar or
                inside popups.
              </div>
              <div className={`${styles.noBookmark} ${styles.subtitle}`}>
                For single-category markers, use right-click or long-press on
                mobile to quickly toggle the bookmark.
              </div>
              <div className={`${styles.noBookmark} ${styles.subtitle}`}>
                Track your progress by toggling bookmarks off as you collect.
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
    </Menu>
  );
};

export default Bookmarks;
