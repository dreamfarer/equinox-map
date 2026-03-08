import styles from '@/app/database/page.module.css';
import DatabaseItem from '@/app/database/components/database-item';

const items = [
    {
        name: 'Breeches',
        category: 'Lower Body',
        statsAmount: 40,
        statsType: 'Fitness',
        level: 3,
        faction: 'Alderwood Fishing Village',
        cost: 300,
        currency: 'Silver Sols',
        shop: 'Robert Quint',
        upgradeAmount: 12,
        upgradeItem: "Dryad's Saddle Mushrooms",
        imagePath: '/icon/256/lower-body/breeches.webp',
    },
    {
        name: 'English Horse Helmet (Carbon)',
        category: 'Headwear',
        level: 10,
        faction: 'Alderwood Downtown',
        cost: 2000,
        currency: 'Silver Sols',
        shop: "Wendy's Tack Shop",
        imagePath: '/icon/256/headwear/english-horse-helmet-carbon.webp',
    },
    {
        name: 'English Saddle',
        category: 'Saddle',
        statsAmount: 40,
        statsType: 'Agility',
        level: 6,
        faction: 'Alderwood Downtown',
        cost: 600,
        currency: 'Silver Sols',
        shop: "Wendy's Tack Shop",
        upgradeAmount: 12,
        upgradeItem: 'Apples',
        imagePath: '/icon/256/saddle/english-saddle.webp',
    },
    {
        name: 'Puffer Jacket (Green)',
        category: 'Upper Body',
        statsAmount: 40,
        statsType: 'Jumping',
        cost: 10,
        currency: 'Activity Token',
        shop: 'Danny Landor',
        upgradeAmount: 10,
        upgradeItem: 'Activity Token',
        imagePath: '/icon/256/upper-body/puffer-jacket-green.webp',
    },
];

export default function DatabasePage() {
    return (
        <div className={styles.page}>
            <div className={styles.grid}>
                {items.map((item, index) => (
                    <DatabaseItem key={index} {...item} />
                ))}
            </div>
        </div>
    );
}
