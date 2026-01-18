import { ReactNode } from 'react';
import MapWrapper from '../components/map-wrapper';
import Overlay from '../components/overlay';
import { BookmarkProvider } from '../context/bookmark-context';
import { DevModeProvider } from '../context/dev-mode-context';
import { MapProvider } from '../context/map-context';
import { MarkerProvider } from '../context/marker-context';
import { PopupProvider } from '../context/popup-context';
import mapMetadata from '../data/maps.json';
import popups from '../data/popups.json';

export default function WithMapLayout({ children }: { children: ReactNode }) {
    return (
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
    );
}
