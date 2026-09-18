'use client';

import { useEffect, useEffectEvent } from 'react';
import type { Driver } from 'driver.js';
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

    const shouldShow =
        isLocalStorageReady &&
        shouldShowWhatsNew(tutorialDoneAt, whatsNewSeenAt);

    const markSeen = useEffectEvent(() => {
        setWhatsNewSeenAt(new Date().toISOString());
    });

    useEffect(() => {
        if (!shouldShow) return;

        // See tutorial.tsx: tear down a tour that is still loading or open
        // before this effect runs again, or two of them end up stacked.
        let isCancelled = false;
        let driverObj: Driver | undefined;
        let frame: number | undefined;

        (async () => {
            const { driver } = await import('driver.js');
            if (isCancelled) return;
            driverObj = driver({
                showProgress: true,
                overlayClickBehavior: () => {},
                onDestroyed: () => {
                    if (!isCancelled) markSeen();
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
