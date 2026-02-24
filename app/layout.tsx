import { Metadata } from 'next';
import { DevModeProvider } from '@/app/context/dev-mode-context';
import { MapProvider } from '@/app/context/map-context';
import { MarkerProvider } from '@/app/context/marker-context';
import { FilterProvider } from '@/app/context/filter-context';
import { MenuStateProvider } from '@/app/context/menu-state-context';
import MapWrapper from '@/app/components/map-wrapper';
import Navbar from '@/app/components/navbar';
import mapMetadata from '@/app/data/maps.json';
import popups from '@/app/data/popups.json';
import markers from '@/app/data/markers.json';
import { categories } from '@/types/category';
import '@/app/global.css';
import Menu from '@/app/components/menu';

export const viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL('https://equinoxmap.app'),
    title: {
        default: 'Interactive Map – Equinox: Homecoming',
        template: '%s | Interactive Map – Equinox: Homecoming',
    },
    description:
        'An interactive map for Equinox: Homecoming. Filter, search, bookmark and track all collectible resources, quests, races, characters, shops and more.',
    alternates: {
        canonical: 'https://equinoxmap.app/',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://equinoxmap.app/',
        siteName: 'Interactive Map – Equinox: Homecoming',
        title: 'Interactive Map – Equinox: Homecoming',
        description:
            'An interactive map for Equinox: Homecoming. Filter, search, bookmark and track all collectible resources, quests, races, characters, shops and more.',
        images: [
            {
                url: 'https://equinoxmap.app/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Interactive Map – Equinox: Homecoming preview',
            },
        ],
    },
    manifest: '/site.webmanifest',
    icons: {
        icon: [
            { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
            { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
            {
                url: '/android-chrome-192x192.png',
                type: 'image/png',
                sizes: '192x192',
            },
            {
                url: '/android-chrome-512x512.png',
                type: 'image/png',
                sizes: '512x512',
            },
            { url: '/favicon.ico', type: 'image/x-icon' },
        ],
        apple: '/apple-touch-icon.png',
    },
    robots: { index: false, follow: true },
};

export default function RootLayout() {
    return (
        <html lang="en">
            <body>
                <MenuStateProvider>
                    <FilterProvider allCategories={categories}>
                        <MapProvider mapMetadata={mapMetadata}>
                            <MarkerProvider
                                allPopups={popups}
                                allMarkers={markers}
                            >
                                <DevModeProvider>
                                    <Navbar />
                                    <MapWrapper />
                                    <Menu />
                                </DevModeProvider>
                            </MarkerProvider>
                        </MapProvider>
                    </FilterProvider>
                </MenuStateProvider>
            </body>
        </html>
    );
}
