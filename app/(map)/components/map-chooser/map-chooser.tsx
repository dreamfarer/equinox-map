'use client';

import styles from '@/app/(map)/components/map-chooser/map-chooser.module.css';

export default function MapChooser() {
    return (
        <button
            id="mapChooserDropdownButton"
            onClick={() => {}}
            className={`${styles.button}`}
            aria-label="Select Map"
        >
            <p>Alderwood</p>
        </button>
    );
}
