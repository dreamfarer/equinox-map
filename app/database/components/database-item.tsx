import Image from 'next/image';
import styles from '@/app/database/components/database-item.module.css';

type Props = {
    name: string;
    category: string;
    statsAmount?: number;
    statsType?: string;
    level?: number;
    faction?: string;
    cost?: number;
    currency?: string;
    shop?: string;
    upgradeAmount?: number;
    upgradeItem?: string;
    imagePath: string;
};

export default function DatabaseItem({
    name,
    category,
    statsAmount,
    statsType,
    level,
    faction,
    cost,
    currency,
    shop,
    upgradeAmount,
    upgradeItem,
    imagePath,
}: Props) {
    return (
        <div className={styles.item}>
            <div className={styles.header}>
                <h1 className={styles.title}>{name}</h1>
                <h2 className={`${styles.text} ${styles.light}`}>{category}</h2>
            </div>

            <div className={styles.image}>
                <Image
                    src={imagePath}
                    alt={name}
                    fill
                    style={{ objectFit: 'contain' }}
                />
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

                {level !== undefined && (
                    <div className={styles.entry}>
                        <h2 className={styles.text}>Reputation:</h2>
                        <p className={`${styles.text} ${styles.rightAlign}`}>
                            {level}
                        </p>
                    </div>
                )}

                {faction && (
                    <div className={styles.entry}>
                        <h2 className={styles.text}>Faction:</h2>
                        <p className={`${styles.text} ${styles.rightAlign}`}>
                            {faction}
                        </p>
                    </div>
                )}

                {(cost !== undefined || currency) && (
                    <div className={styles.entry}>
                        <h2 className={styles.text}>Cost:</h2>
                        <p className={`${styles.text} ${styles.rightAlign}`}>
                            {cost} {currency}
                        </p>
                    </div>
                )}

                {shop && (
                    <div className={styles.entry}>
                        <h2 className={styles.text}>Shop:</h2>
                        <p className={`${styles.text} ${styles.rightAlign}`}>
                            {shop}
                        </p>
                    </div>
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
