'use client';

import { useRouter } from 'next/navigation';
import styles from '@/app/(map)/components/map-chooser/map-chooser.module.css';
import Dropdown from '@/app/(shared)/components/dropdown/dropdown';
import { useMapContext } from '@/app/(map)/context/map-context';

export default function MapChooser() {
    const { activeMapName, allMapNames, getMapIdByName } = useMapContext();
    const router = useRouter();

    function onSelect(name: string) {
        const id = getMapIdByName(name);
        if (id) router.replace(id === 'alderwood' ? '/' : `/${id}`);
    }

    return (
        <Dropdown
            options={allMapNames}
            selected={activeMapName ?? 'Alderwood'}
            onSelect={onSelect}
            menuPosition={'bottom'}
            menuOverflowDirection={'left'}
            className={styles.dropdownWrapper}
            buttonClassName={'outline' + ' ' + styles.button}
        ></Dropdown>
    );
}
