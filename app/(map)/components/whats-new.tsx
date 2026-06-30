'use client';

import { useEffect } from 'react';
import 'driver.js/dist/driver.css';
import { useMenuState } from '@/app/(map)/context/menu-state-context';
import { shouldShowWhatsNew } from '@/app/(map)/config/tour-config';

export default function WhatsNew() {
    const {
        tutorialDoneAt,
        whatsNewSeenAt,
        setWhatsNewSeenAt,
        isLocalStorageReady,
    } = useMenuState();

    useEffect(() => {
        if (!isLocalStorageReady) return;
        if (!shouldShowWhatsNew(tutorialDoneAt, whatsNewSeenAt)) return;

        (async () => {
            const { driver } = await import('driver.js');
            const driverObj = driver({
                showProgress: true,
                overlayClickBehavior: () => {},
                onDestroyed: () => {
                    setWhatsNewSeenAt(new Date().toISOString());
                },
                steps: [
                    {
                        popover: {
                            title: "What's New?",
                            description:
                                "Learn what's new on equinoxmap.app, the interactive map for Equinox: Homecoming.",
                        },
                    },
                    {
                        disableActiveInteraction: true,
                        element: '#mapChooser',
                        popover: {
                            title: 'Switch Maps',
                            description:
                                'equinoxmap.app finally supports all ride islands! Use the dropdown to switch maps.',
                        },
                    },
                ],
            });

            requestAnimationFrame(() => driverObj.drive());
        })();

        return () => {};
    }, [
        isLocalStorageReady,
        tutorialDoneAt,
        whatsNewSeenAt,
        setWhatsNewSeenAt,
    ]);

    return null;
}
