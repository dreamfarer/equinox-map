import styles from '@/app/database/page.module.css';

export default function Loading() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.buttonSkeletonLeft} aria-hidden="true" />
                <div className={styles.searchbarSkeleton} />
                <div
                    className={styles.buttonSkeletonRight}
                    aria-hidden="true"
                />
            </div>

            <div className={styles.grid}>
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className={styles.tileSkeleton} />
                ))}
            </div>
        </div>
    );
}
