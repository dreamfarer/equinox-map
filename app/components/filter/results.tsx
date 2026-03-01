import Result from '@/app/components/filter/result';
import { useFlyToMarker } from '@/app/hooks/use-fly-to-marker';

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
        <>
            {Array.from(grouped.values()).map(
                ({ title, category, entries }) => {
                    return (
                        <Result
                            key={`${title}::${category}`}
                            title={title}
                            category={category}
                            count={entries.length}
                            onSelect={() => flyToMarker(entries[0].markerId)}
                        />
                    );
                }
            )}
        </>
    );
}
