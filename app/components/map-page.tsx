import { MapProvider } from '@/app/context/map-context';
import { MarkerProvider } from '@/app/context/marker-context';
import { FilterProvider } from '@/app/context/filter-context';
import { MenuStateProvider } from '@/app/context/menu-state-context';
import MapWrapper from '@/app/components/map-wrapper';
import Navbar from '@/app/components/navbar';
import Tutorial from '@/app/components/tutorial';
import Menu from '@/app/components/menu';
import mapMetadata from '@/app/data/maps.json';
import popups from '@/app/data/popups.json';
import markers from '@/app/data/markers.json';
import { categories } from '@/types/category';

type MapPageProps = {
    initialMap: string;
};

export default function MapPage({ initialMap }: MapPageProps) {
    return (
        <MenuStateProvider>
            <FilterProvider allCategories={categories}>
                <MapProvider mapMetadata={mapMetadata} initialMap={initialMap}>
                    <MarkerProvider allPopups={popups} allMarkers={markers}>
                        <Navbar />
                        <MapWrapper />
                        <Menu />
                        <Tutorial />
                    </MarkerProvider>
                </MapProvider>
            </FilterProvider>
        </MenuStateProvider>
    );
}
