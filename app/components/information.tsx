import styles from '@/app/components/information.module.css';
import { useMenuState } from '@/app/context/menu-state-context';

export default function Information() {
    const { setIsTutorialDone } = useMenuState();
    return (
        <>
            <h1>Need Help, found a bug or want to contribute?</h1>
            <p>
                Don&#39;t hesitate to{' '}
                <a
                    className={styles.link}
                    href="https://github.com/dreamfarer/equinox-map/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    open an issue
                </a>{' '}
                on GitHub and I will gladly try to assist you. Questions, bug
                reports and contributions are always warmly welcome!
            </p>
            <button
                className={styles.button}
                onClick={() =>
                    window.open(
                        'https://github.com/dreamfarer/equinox-map/issues/new',
                        '_blank',
                        'noopener,noreferrer'
                    )
                }
            >
                Open Issue
            </button>
            <h1>Acknowledgements</h1>
            <p>
                Thanks to CookieFox, Laika, lil big guy, LupinchenBrause, 𝔉𝔢𝔢𝔩𝔦,
                Onyx, Snowhawk, Sugertoxity, Yumemi, zaaap! and, of course, Blue
                Scarab Entertainment, the studio behind Equinox: Homecoming —
                without you wonderful people, this interactive map would not
                have been possible. Visit{' '}
                <a
                    className={styles.link}
                    href="https://github.com/dreamfarer/equinox-map"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>{' '}
                for further details.
            </p>
            <button
                className={styles.button}
                onClick={() =>
                    window.open(
                        'https://github.com/dreamfarer/equinox-map/',
                        '_blank',
                        'noopener,noreferrer'
                    )
                }
            >
                Open Source Code
            </button>
            <button
                className={styles.button}
                onClick={() => setIsTutorialDone(undefined)}
            >
                Restart Tutorial
            </button>
        </>
    );
}
