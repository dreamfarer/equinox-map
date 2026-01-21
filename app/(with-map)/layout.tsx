import { ReactNode } from 'react';
import MapWrapper from '@/app/components/map-wrapper';
import Overlay from '@/app/components/overlay';
import { BookmarkProvider } from '@/app/context/bookmark-context';
import { DevModeProvider } from '@/app/context/dev-mode-context';
import { MapProvider } from '@/app/context/map-context';
import { MarkerProvider } from '@/app/context/marker-context';
import { PopupProvider } from '@/app/context/popup-context';
import { FilterProvider } from '@/app/context/filter-context';
import mapMetadata from '@/app/data/maps.json';
import popups from '@/app/data/popups.json';

export default function WithMapLayout({ children }: { children: ReactNode }) {
    return (
        <FilterProvider>
            <MapProvider mapMetadata={mapMetadata}>
                <PopupProvider popups={popups}>
                    <BookmarkProvider>
                        <MarkerProvider>
                            <DevModeProvider>
                                <Overlay />
                                <MapWrapper />
                                {children}
                            </DevModeProvider>
                        </MarkerProvider>
                    </BookmarkProvider>
                </PopupProvider>
            </MapProvider>
        </FilterProvider>
    );
}
