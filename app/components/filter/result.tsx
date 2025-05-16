import { BookmarkSimple } from '@phosphor-icons/react';
import styles from './result.module.css';
import { MergedMarker } from '@/types/marker';

type Props = {
  marker: MergedMarker;
  isBookmarked: boolean;
  onSelect: (id: string) => void;
  onToggleBookmark: (id: string) => void;
};

export default function Result({
  marker,
  isBookmarked,
  onSelect,
  onToggleBookmark,
}: Props) {
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(marker.id);
  };

  return (
    <div className={styles.result} onClick={() => onSelect(marker.id)}>
      <div className={styles.information}>
        <div className={styles.title}>{marker.title}</div>
        {marker.categories && (
          <div className={styles.subtitle}>{marker.categories.join(', ')}</div>
        )}
      </div>
      <button
        className={styles.button}
        onClick={handleBookmark}
        aria-label={
          isBookmarked ? 'Remove bookmark from marker' : 'Bookmark marker'
        }
      >
        {isBookmarked ? (
          <BookmarkSimple size="2em" weight="fill" />
        ) : (
          <BookmarkSimple size="2em" />
        )}
      </button>
    </div>
  );
}
