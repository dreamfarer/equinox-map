'use client';

import { useRouter } from 'next/navigation';
import styles from '@/app/(map)/components/map-chooser/map-chooser.module.css';
import Dropdown from '@/app/(shared)/components/dropdown/dropdown';
import { useMapContext } from '@/app/(map)/context/map-context';
import { gameVersion, gameVersionUrl } from '@/app/(map)/config/game-version';

export default function MapChooser() {
    const { activeMapName, allMapNames, getMapIdByName } = useMapContext();
    const router = useRouter();

    function onSelect(name: string) {
        const id = getMapIdByName(name);
        if (id) router.replace(id === 'alderwood' ? '/' : `/${id}`);
    }

    return (
        <div className={styles.wrapper}>
            <a
                href={gameVersionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={'outline' + ' ' + styles.patch}
                title="The game version the map and database were last updated for"
            >
                Patch {gameVersion}
            </a>
            <Dropdown
                id="mapChooser"
                options={allMapNames}
                selected={activeMapName ?? 'Alderwood'}
                onSelect={onSelect}
                menuPosition={'bottom'}
                menuOverflowDirection={'left'}
                className={styles.dropdown}
                buttonClassName={'outline' + ' ' + styles.button}
            ></Dropdown>
        </div>
    );
}
