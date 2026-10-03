import Image from 'next/image';
import styles from '@/app/(database)/components/database-tile.module.css';
import { DatabaseItem } from '@/types/database-item';

export default function DatabaseTile({
    name,
    type,
    statsAmount,
    statsType,
    upgradeAmount,
    upgradeItem,
    imagePath,
    listings,
    available,
}: DatabaseItem) {
    return (
        <div
            className={`${styles.item} ${available ? '' : styles.unavailable}`}
        >
            <div className={styles.header}>
                <h1 className={styles.title}>{name}</h1>
                <h2 className={`${styles.text} ${styles.light}`}>{type}</h2>
                {!available && <p className={styles.badge}>Unavailable</p>}
            </div>

            <div className={styles.image}>
                {imagePath && (
                    <Image
                        src={`https://cdn.equinoxmap.app${imagePath}`}
                        alt={name}
                        fill
                        sizes="256px"
                        style={{ objectFit: 'contain' }}
                        unoptimized
                    />
                )}
            </div>

            <div className={styles.information}>
                {(statsAmount !== undefined || statsType) && (
                    <div className={styles.entry}>
                        <h2 className={styles.text}>Stats:</h2>
                        <p className={`${styles.text} ${styles.rightAlign}`}>
                            +{statsAmount} {statsType}
                        </p>
                    </div>
                )}

                {listings.map(
                    ({ shop, faction, level, bundle, cost, currency }) => (
                        <div
                            key={`${shop}-${bundle}-${level}-${currency}`}
                            className={styles.listing}
                        >
                            {level !== undefined && (
                                <div className={styles.entry}>
                                    <h2 className={styles.text}>Reputation:</h2>
                                    <p
                                        className={`${styles.text} ${styles.rightAlign}`}
                                    >
                                        {level}
                                    </p>
                                </div>
                            )}

                            {faction && (
                                <div className={styles.entry}>
                                    <h2 className={styles.text}>Faction:</h2>
                                    <p
                                        className={`${styles.text} ${styles.rightAlign}`}
                                    >
                                        {faction}
                                    </p>
                                </div>
                            )}

                            <div className={styles.entry}>
                                <h2 className={styles.text}>
                                    {bundle !== undefined
                                        ? 'Bundle Cost:'
                                        : 'Cost:'}
                                </h2>
                                <p
                                    className={`${styles.text} ${styles.rightAlign}`}
                                >
                                    {cost} {currency}
                                </p>
                            </div>

                            {bundle && (
                                <div className={styles.entry}>
                                    <h2 className={styles.text}>Bundle:</h2>
                                    <p
                                        className={`${styles.text} ${styles.rightAlign}`}
                                    >
                                        {bundle}
                                    </p>
                                </div>
                            )}

                            <div className={styles.entry}>
                                <h2 className={styles.text}>Shop:</h2>
                                <p
                                    className={`${styles.text} ${styles.rightAlign}`}
                                >
                                    {shop}
                                </p>
                            </div>
                        </div>
                    )
                )}

                {(upgradeAmount !== undefined || upgradeItem) && (
                    <div className={styles.entry}>
                        <h2 className={styles.text}>Upgrade:</h2>
                        <p className={`${styles.text} ${styles.rightAlign}`}>
                            {upgradeAmount} {upgradeItem}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
