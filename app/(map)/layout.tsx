import { ReactNode } from 'react';
import { MapProvider } from '@/app/(map)/context/map-context';
import { MarkerProvider } from '@/app/(map)/context/marker-context';
import { FilterProvider } from '@/app/(map)/context/filter-context';
import { MenuStateProvider } from '@/app/(map)/context/menu-state-context';
import Navbar from '@/app/(map)/components/sidebar/navigation/navbar';
import Tutorial from '@/app/(map)/components/tutorial';
import Menu from '@/app/(map)/components/sidebar/menu/menu';
import popups from '@/app/data/popups.json';
import markers from '@/app/data/markers.json';
import { categories } from '@/types/category';
import MapChooser from '@/app/(map)/components/map-chooser/map-chooser';

export default function MapLayout({ children }: { children: ReactNode }) {
    return (
        <MenuStateProvider>
            <FilterProvider allCategories={categories}>
                <MapProvider>
                    <MarkerProvider allPopups={popups} allMarkers={markers}>
                        <MapChooser />
                        <Navbar />
                        {children}
                        <Menu />
                        <Tutorial />
                    </MarkerProvider>
                </MapProvider>
            </FilterProvider>
        </MenuStateProvider>
    );
}
