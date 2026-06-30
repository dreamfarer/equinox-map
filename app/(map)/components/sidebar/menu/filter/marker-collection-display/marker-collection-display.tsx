'use client';

import styles from '@/app/(map)/components/sidebar/menu/filter/marker-collection-display/marker-collection-display.module.css';
import { useMarkerContext } from '@/app/(map)/context/marker-context';

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
                <p>Collected Markers</p>
                <div className={styles.progressBox}>
                    <p>{activeCollectedMarkerCount}</p>
                    <p>of</p>
                    <p>{activeMarkerCount}</p>
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
