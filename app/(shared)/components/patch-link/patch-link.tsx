import styles from '@/app/(shared)/components/patch-link/patch-link.module.css';
import {
    gameVersion,
    gameVersionUrl,
} from '@/app/(shared)/config/game-version';

type Props = {
    className?: string;
};

export default function PatchLink({ className = '' }: Props) {
    return (
        <a
            href={gameVersionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`outline ${styles.patch} ${className}`}
            title="The game version the map and database were last updated for"
        >
            Patch {gameVersion}
        </a>
    );
}
