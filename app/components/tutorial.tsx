'use client';

import { useEffect } from 'react';
import 'driver.js/dist/driver.css';
import { useMenuState } from '@/app/context/menu-state-context';

export default function Tutorial() {
    const { isTutorialDone, setIsTutorialDone, isLocalStorageReady } =
        useMenuState();
    useEffect(() => {
        if (!isLocalStorageReady) return;
        if (isTutorialDone) return;

        (async () => {
            const { driver } = await import('driver.js');
            const driverObj = driver({
                allowClose: false,
                showProgress: true,
                onDestroyed: () => {
                    setIsTutorialDone(true);
                },
                steps: [
                    {
                        popover: {
                            title: 'Welcome to the Equinox Interactive Map Tour',
                            description:
                                "In the following steps you'll learn everything equinoxmap.app, the interactive map for Equinox: Homecoming, has to offer.",
                        },
                    },
                    {
                        popover: {
                            title: 'Show/Hide All Markers',
                            description:
                                'Press this button to toggle all markers on/off. Go ahead and try it out.',
                        },
                    },
                    {
                        popover: {
                            title: 'Show/Hide Individual Marker Categories',
                            description:
                                'Press on parent and child categories to turn them on/off individually. Go ahead and try it out.',
                        },
                    },
                    {
                        popover: {
                            title: 'Collect Markers',
                            description:
                                "Right-click a marker on the map to collect it (long-press on mobile). The collection progress is always relative to the marker categories currently active. I've already collected one for you.",
                        },
                    },
                    {
                        popover: {
                            title: 'Reset the Collection',
                            description:
                                'Press this button to reset the marker collection.',
                        },
                    },
                    {
                        popover: {
                            title: 'Search',
                            description:
                                'Search everything including marker names, tiles, sub-tiles and contents.',
                        },
                    },
                    {
                        popover: {
                            title: 'Hide the Menu',
                            description:
                                'Press the burger menu to toggle the menu on/off.',
                        },
                    },
                    {
                        popover: {
                            title: 'Information / FAQ',
                            description:
                                'Press this icon to show the information and FAQ page. From there, you can also restart the tutorial.',
                        },
                    },
                    {
                        popover: {
                            title: 'Enjoy!',
                            description:
                                'Return to the default menu by pressing on the burger menu again. Enjoy equinoxmap.app, much love <3',
                        },
                    },
                ],
            });

            requestAnimationFrame(() => driverObj.drive());
        })();

        return () => {};
    }, [isLocalStorageReady, isTutorialDone, setIsTutorialDone]);

    return null;
}
