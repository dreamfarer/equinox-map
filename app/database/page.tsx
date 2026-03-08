import styles from '@/app/database/page.module.css';
import DatabaseItem from '@/app/database/components/database-item';

export default function DatabasePage() {
    return (
        <div className={styles.page}>
            <div className={styles.grid}>
                <DatabaseItem
                    name={'Western Saddle (White)'}
                    category={'Saddle'}
                    statsAmount={40}
                    statsType={'Riding'}
                    level={6}
                    faction={'Alderwood Equestrians'}
                    cost={300}
                    currency={'Silver Sols'}
                    shop={"Wendy's Tack Shop"}
                    upgradeAmount={12}
                    upgradeItem={'Apples'}
                    imagePath={'/icon/64/kathy.webp'}
                />
            </div>
        </div>
    );
}
