import styles from '@/app/components/information.module.css';
import { useMenuState } from '@/app/context/menu-state-context';

function link(name: string, href: string) {
    return (
        <a
            className={styles.link}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            {name}
        </a>
    );
}

export default function Information() {
    const { setIsTutorialDone } = useMenuState();
    return (
        <>
            <h1>Need Help, found a bug or want to contribute?</h1>
            <p>
                Don&#39;t hesitate to{' '}
                {link(
                    'open an issue',
                    'https://github.com/dreamfarer/equinox-map/issues/new'
                )}{' '}
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
            <h1>Useful Links</h1>
            <ul>
                <li>
                    {' '}
                    {link(
                        'Equinox: Homecoming Wiki',
                        'https://equinox.wiki.gg/'
                    )}{' '}
                </li>
                <li>
                    {' '}
                    {link(
                        'Steam Guide',
                        'https://steamcommunity.com/sharedfiles/filedetails/?id=3479148661'
                    )}{' '}
                    by Kalyss (<em>Kalissya Foxx</em>)
                </li>
                <li>
                    {' '}
                    {link(
                        'Spreadsheet',
                        'https://docs.google.com/spreadsheets/d/1Z8mtky3oH-yWAeqI5qNFBfqj2xNkHoHzNABxqmXiM7E'
                    )}{' '}
                    by {link('Snowhawk', 'https://delphin.social/')}
                </li>
                <li>
                    {link(
                        'Equinox: Homecoming',
                        'https://store.steampowered.com/app/3258290/Equinox_Homecoming/'
                    )}{' '}
                    on Steam
                </li>
                <li>
                    {link(
                        'Source Code',
                        'https://github.com/dreamfarer/equinox-map/'
                    )}{' '}
                    on Github
                </li>
            </ul>
            <h1>Acknowledgements</h1>
            <p>
                Thanks to all members of the discord, especially CookieFox,
                𝔉𝔢𝔢𝔩𝔦, {link('Laika Crafts', 'https://linktr.ee/Laika.Crafts')},
                LupinchenBrause, Onyx, reko,{' '}
                {link('Snowhawk', 'https://delphin.social/')},{' '}
                {link('Sugertoxity', 'https://www.instagram.com/equinox.map/')},
                Yumemi, {link('zaaap!', 'https://beacons.ai/zaaap')}, and, of
                course,{' '}
                {link(
                    'Blue Scarab Entertainment',
                    'https://www.bluescarab.se/'
                )}
                , the studio behind Equinox: Homecoming
            </p>
            <p>
                Without these wonderful people, this interactive map would not
                have been possible. Visit{' '}
                {link('GitHub', 'https://github.com/dreamfarer/equinox-map')}{' '}
                for further details.
            </p>
            <button
                className={styles.button}
                onClick={() => setIsTutorialDone(undefined)}
            >
                Restart Tutorial
            </button>
        </>
    );
}
