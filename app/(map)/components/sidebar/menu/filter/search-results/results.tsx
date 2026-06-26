import { useFlyToMarker } from '@/app/(map)/hooks/use-fly-to-marker';
import styles from '@/app/(map)/components/sidebar/menu/filter/search-results/results.module.css';

type MarkerSearchResult = {
    markerId: string;
    categoryId: string;
    itemId: string;
    title: string;
    subtitle?: string;
};

type Props = {
    results: MarkerSearchResult[];
};

export default function Results({ results }: Props) {
    const flyToMarker = useFlyToMarker();
    const grouped = new Map<
        string,
        {
            title: string;
            category: string;
            entries: { markerId: string; categoryId: string; itemId: string }[];
        }
    >();

    for (const result of results) {
        const key = `${result.title}::${result.categoryId}`;
        if (!grouped.has(key)) {
            grouped.set(key, {
                title: result.title,
                category: result.categoryId,
                entries: [],
            });
        }
        grouped.get(key)!.entries.push({
            markerId: result.markerId,
            categoryId: result.categoryId,
            itemId: result.itemId,
        });
    }

    return (
        <div className={styles.results}>
            {Array.from(grouped.values()).map(
                ({ title, category, entries }) => {
                    return (
                        <button
                            key={`${title}::${category}`}
                            className={styles.result}
                            onClick={() => flyToMarker(entries[0].markerId)}
                        >
                            <p>
                                {title}{' '}
                                {entries.length && entries.length > 1 && (
                                    <span>({entries.length})</span>
                                )}
                            </p>
                            <h3>{category}</h3>
                        </button>
                    );
                }
            )}
        </div>
    );
}
