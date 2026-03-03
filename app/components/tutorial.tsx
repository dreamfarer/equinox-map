'use client';

import { useEffect } from 'react';
import 'driver.js/dist/driver.css';
import { useMenuState } from '@/app/context/menu-state-context';
import { useMarkerContext } from '@/app/context/marker-context';
import { useFlyToMarker } from '@/app/hooks/use-fly-to-marker';
import { flushSync } from 'react-dom';

export default function Tutorial() {
    const {
        isTutorialDone,
        setIsTutorialDone,
        isLocalStorageReady,
        setActiveMenuName,
        setIsMenuOpen,
        isMobile,
    } = useMenuState();
    const { setCollectedMarkerIds } = useMarkerContext();
    const flyToMarker = useFlyToMarker();

    useEffect(() => {
        if (!isLocalStorageReady) return;
        if (isTutorialDone) return;

        (async () => {
            const { driver } = await import('driver.js');
            const driverObj = driver({
                showProgress: true,
                overlayClickBehavior: () => {},
                onDestroyed: () => {
                    setIsTutorialDone(true);
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
                        element: '.category',
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
                        element: '#informationButton',
                        popover: {
                            title: 'Information',
                            description:
                                'Open the info page. Find help, report bugs, view credits, or restart this tour.',
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
        isTutorialDone,
        setActiveMenuName,
        setCollectedMarkerIds,
        setIsMenuOpen,
        setIsTutorialDone,
    ]);

    return null;
}
