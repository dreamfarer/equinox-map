import MapWrapper from '../components/map-wrapper';
import Overlay from '../components/overlay';
import { BookmarkProvider } from '../context/bookmark-context';
import { DevModeProvider } from '../context/dev-mode-context';
import { MapProvider } from '../context/map-context';
import { MarkerProvider } from '../context/marker-context';
import { PopupProvider } from '../context/popup-context';

export default function WithMapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MapProvider>
            <PopupProvider>
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
