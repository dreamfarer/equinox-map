import { BookmarkSimple } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import styles from './popup.module.css';

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
};

export default function Popup({
  id,
  title,
  subtitle,
  isBookmarked,
  onToggleBookmark,
}: Props) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  useEffect(() => {
    const handler = (e: Event) => {
      const { bookmarks } =
        (e as CustomEvent<{ bookmarks: string[] }>).detail ?? {};
      if (Array.isArray(bookmarks)) setBookmarked(bookmarks.includes(id));
    };
    window.addEventListener('bookmark-changed', handler);
    return () => window.removeEventListener('bookmark-changed', handler);
  }, [id]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(id);
    setBookmarked((prev) => !prev);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <button
          className={styles.bookmark}
          onClick={handleBookmark}
          aria-label={
            bookmarked ? 'Remove bookmark from marker' : 'Bookmark marker'
          }
        >
          {bookmarked ? (
            <BookmarkSimple size="1.5rem" weight="fill" />
          ) : (
            <BookmarkSimple size="1.5rem" />
          )}
        </button>
      </div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </div>
  );
}
