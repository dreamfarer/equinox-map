'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import Result from './filter/result';
import { useMarkerLayerContext } from '../context/marker-layer';

const Bookmarks: NextPage = () => {
  const { bookmarks, markers, flyToMarker, toggleBookmark } =
    useMarkerLayerContext();

  const bookmarkedMarkers = markers.filter((m) => bookmarks.includes(m.id));

  return (
    <div className={styles.menu}>
      <div className={styles.results}>
        {bookmarkedMarkers.length === 0 && (
          <>
            <div className="noBookmark">No bookmarks yet. (´•︵•`)</div>
            <div className="noBookmark">
              Save markers through the search bar or popups first.
            </div>
          </>
        )}
        {bookmarkedMarkers.map((m) => (
          <Result
            key={m.id}
            marker={m}
            isBookmarked={true}
            onSelect={flyToMarker}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
