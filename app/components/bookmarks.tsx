'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import Result from './filter/result';
import { useEffect } from 'react';
import { useMarkerLayerContext } from '../context/marker-layer';

const Bookmarks: NextPage = () => {
  const { bookmarks, markers, showOnlyMarkers, flyToMarker, toggleBookmark } =
    useMarkerLayerContext();

  useEffect(() => {
    showOnlyMarkers(bookmarks);
    return () => showOnlyMarkers(null);
  }, [bookmarks, showOnlyMarkers]);

  const bookmarkedMarkers = markers.filter((m) => bookmarks.includes(m.id));

  return (
    <div className={styles.menu}>
      <div className={styles.results}>
        {bookmarkedMarkers.length === 0 && (
          <div className="noBookmark">No bookmarks yet.</div>
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
