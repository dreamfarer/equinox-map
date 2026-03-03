'use client';

import styles from '@/app/components/marker-collection-display.module.css';
import { useMarkerContext } from '@/app/context/marker-context';

export default function MarkerCollectionDisplay() {
    const { activeMarkerCount, activeCollectedMarkerCount } =
        useMarkerContext();
    const percentage =
        activeMarkerCount > 0
            ? activeCollectedMarkerCount / activeMarkerCount
            : 0;

    return (
        <div className={styles.markerCollectionDisplay}>
            <div className={styles.description}>
                <div className={styles.title}>Collected Markers</div>
                <div className={styles.progressBox}>
                    <div className={styles.current}>
                        {activeCollectedMarkerCount}
                    </div>
                    <div className={styles.of}>of</div>
                    <div className={styles.total}>{activeMarkerCount}</div>
                </div>
            </div>
            <div className={styles.progressBar}>
                <div
                    className={styles.filler}
                    style={{ transform: `scaleX(${percentage})` }}
                />
            </div>
        </div>
    );
}
