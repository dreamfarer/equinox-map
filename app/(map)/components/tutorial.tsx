'use client';

import { useEffect, useEffectEvent } from 'react';
import type { Driver } from 'driver.js';
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

    const shouldShow =
        isLocalStorageReady && shouldShowTutorial(tutorialDoneAt);

    const markDone = useEffectEvent(() => {
        const now = new Date().toISOString();
        setTutorialDoneAt(now);
        setWhatsNewSeenAt(now);
    });

    // Effect events always see the latest render, so the tour can fly to the
    // marker once the map is ready without restarting.
    const flyToKathy = useEffectEvent(() => flyToMarker('kathy'));

    const createTour = useEffectEvent(
        (
            driver: typeof import('driver.js').driver,
            onDestroyed: () => void
        ) => {
            const driverObj = driver({
                showProgress: true,
                overlayClickBehavior: () => {},
                onDestroyed,
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
                                flyToKathy();
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

            return driverObj;
        }
    );

    useEffect(() => {
        if (!shouldShow) return;

        // Strict Mode or a hot reload can run this effect again while a tour is
        // still loading or open. driver.js 1.4 kept one global state, so a second
        // instance restarted the same tour in place. Newer versions keep state per
        // instance, so the previous one has to be torn down or two tours stack.
        let isCancelled = false;
        let driverObj: Driver | undefined;
        let frame: number | undefined;

        (async () => {
            const { driver } = await import('driver.js');
            if (isCancelled) return;
            driverObj = createTour(driver, () => {
                if (!isCancelled) markDone();
            });
            frame = requestAnimationFrame(() => driverObj?.drive());
        })();

        return () => {
            isCancelled = true;
            if (frame !== undefined) cancelAnimationFrame(frame);
            if (driverObj?.isActive()) driverObj.destroy();
        };
    }, [shouldShow]);

    return null;
}
