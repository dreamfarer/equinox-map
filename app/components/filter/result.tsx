import { BookmarkSimpleIcon } from '@phosphor-icons/react';
import styles from './result.module.css';

type Props = {
  title: string;
  subtitle?: string;
  category: string;
  count?: number;
  isBookmarked: boolean;
  onSelect: () => void;
  onToggleBookmark: () => void;
};

export default function Result({
  title,
  category,
  count,
  isBookmarked,
  onSelect,
  onToggleBookmark,
}: Props) {
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark();
  };

  return (
    <div className={styles.result} onClick={onSelect}>
      <div className={styles.information}>
        <div className={styles.title}>
          {title} {count && count > 1 && <span>({count})</span>}
        </div>
        <div className={styles.subtitle}>{category}</div>
      </div>
      <button
        className={styles.button}
        onClick={handleBookmark}
        aria-label={
          isBookmarked ? 'Remove bookmark from marker' : 'Bookmark marker'
        }
      >
        {isBookmarked ? (
          <BookmarkSimpleIcon size="2em" weight="fill" />
        ) : (
          <BookmarkSimpleIcon size="2em" />
        )}
      </button>
    </div>
  );
}
