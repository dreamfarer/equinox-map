'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import Result from './filter/result';
import { useMarkerLayerContext } from '../context/marker-layer';

const Bookmarks: NextPage = () => {
  const { bookmarks, popups, flyToMarker, toggleBookmark } =
    useMarkerLayerContext();

  const bookmarkedMarkers = bookmarks.flatMap((bookmark) => {
    const popup = popups.find((p) => p.id === bookmark.id);
    if (!popup) return [];

    const categoryPayload = popup.categories[bookmark.category];
    if (!categoryPayload) return [];

    return categoryPayload.items.map((item) => ({
      id: bookmark.id,
      category: bookmark.category,
      title: item.title ?? '',
      subtitle: item.subtitle,
    }));
  });

  return (
    <div className={styles.menu}>
      <div className={styles.scrollArea}>
        <div className={styles.results}>
          {bookmarkedMarkers.length === 0 && (
            <>
              <div className="noBookmark">No bookmarks yet. (´•︵•`)</div>
              <div className="noBookmark">
                Save markers through the search bar or popups first.
              </div>
            </>
          )}
          {bookmarkedMarkers.map((m, i) => (
            <Result
              key={`${m.id}-${m.category}-${i}`}
              title={m.title}
              category={m.category}
              isBookmarked={true}
              onSelect={() => flyToMarker(m.id, m.category)}
              onToggleBookmark={() => toggleBookmark(m.id, m.category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
