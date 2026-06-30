'use client';

import { useEffect } from 'react';
import 'driver.js/dist/driver.css';
import { useMenuState } from '@/app/(map)/context/menu-state-context';
import { useMarkerContext } from '@/app/(map)/context/marker-context';
import { useFlyToMarker } from '@/app/(map)/hooks/use-fly-to-marker';
import { flushSync } from 'react-dom';
import { shouldShowTutorial } from '@/app/(map)/config/tour-config';

export default function Tutorial() {
    const {
        tutorialDoneAt,
        setTutorialDoneAt,
        setWhatsNewSeenAt,
        isLocalStorageReady,
        setActiveMenuName,
        setIsMenuOpen,
        isMobile,
    } = useMenuState();
    const { setCollectedMarkerIds } = useMarkerContext();
    const flyToMarker = useFlyToMarker();

    useEffect(() => {
        if (!isLocalStorageReady) return;
        if (!shouldShowTutorial(tutorialDoneAt)) return;

        (async () => {
            const { driver } = await import('driver.js');
            const driverObj = driver({
                showProgress: true,
                overlayClickBehavior: () => {},
                onDestroyed: () => {
                    const now = new Date().toISOString();
                    setTutorialDoneAt(now);
                    setWhatsNewSeenAt(now);
                },
                steps: [
                    {
                        popover: {
                            title: 'Welcome to the Map Tour',
                            description:
                                'Learn how to use equinoxmap.app, the interactive map for Equinox: Homecoming.',
                            onPopoverRender: () => {
                                setActiveMenuName('filter');
                                setIsMenuOpen(true);
                                setCollectedMarkerIds(new Set());
                            },
                        },
                    },
                    {
                        element: '#toggleAllCategories',
                        popover: {
                            title: 'Toggle All Markers',
                            description:
                                'Turn all markers on or off. Give it a try.',
                        },
                    },
                    {
                        element: '#category',
                        popover: {
                            title: 'Toggle Categories',
                            description:
                                'Press a category or subcategory to show or hide its markers.',
                        },
                    },
                    {
                        element: '#map',
                        popover: {
                            title: 'Marker Details',
                            description:
                                'Click a marker to view details. Use the dropdown to switch categories. Click again to close.',
                            onPopoverRender: () => {
                                flyToMarker('kathy');
                            },
                        },
                    },
                    {
                        element: '#map',
                        popover: {
                            title: 'Collect Markers',
                            description: isMobile
                                ? 'Long-press to collect. Pinch to zoom.'
                                : 'Right-click to collect. Scroll to zoom.',
                            onNextClick: async () => {
                                setCollectedMarkerIds((prev) =>
                                    new Set(prev).add('kathy')
                                );
                                flushSync(() => {});
                                driverObj.moveNext();
                            },
                        },
                    },
                    {
                        element: '#buttonGroupHorizontal',
                        popover: {
                            title: 'Reset Collection',
                            description: 'Clear all collected markers.',
                        },
                    },
                    {
                        element: '#searchBar',
                        popover: {
                            title: 'Search',
                            description:
                                'Search markers, titles, subtitles, and content.',
                            onNextClick: async () => {
                                if (isMobile) return driverObj.moveTo(9);
                                return driverObj.moveNext();
                            },
                        },
                    },
                    {
                        element: '#filterButton',
                        popover: {
                            title: 'Filter Menu',
                            description: 'Open or close the filter menu.',
                        },
                    },
                    {
                        disableActiveInteraction: true,
                        element: '#mapChooser',
                        popover: {
                            title: 'Switch Maps',
                            description:
                                'Use the dropdown to switch between the main island, Alderwood, and all ride islands.',
                        },
                    },
                    {
                        element: '#informationButton',
                        popover: {
                            title: 'Information',
                            description:
                                'Open the info page. Find help, report bugs, view credits, or restart this tour.',
                        },
                    },
                    {
                        disableActiveInteraction: true,
                        element: '#navigateToDatabaseButton',
                        popover: {
                            title: 'Database',
                            description:
                                'Visit the comprehensive database of character clothes, gear, and horse tack. View stats, costs, level requirements, and item details.',
                        },
                    },
                    {
                        popover: {
                            title: 'Enjoy!',
                            description: isMobile
                                ? 'Scroll to the end to find help, report bugs, view credits, or restart the tour. Enjoy equinoxmap.app! <3'
                                : 'That’s it! Enjoy equinoxmap.app! <3',
                        },
                    },
                ],
            });

            requestAnimationFrame(() => driverObj.drive());
        })();

        return () => {};
    }, [
        flyToMarker,
        isLocalStorageReady,
        isMobile,
        tutorialDoneAt,
        setActiveMenuName,
        setCollectedMarkerIds,
        setIsMenuOpen,
        setTutorialDoneAt,
        setWhatsNewSeenAt,
    ]);

    return null;
}
