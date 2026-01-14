import Result from './result';

type MarkerSearchResult = {
    markerId: string;
    categoryId: string;
    itemId: string;
    title: string;
    subtitle?: string;
};

type Props = {
    results: MarkerSearchResult[];
    bookmarkIds: string[];
    onSelect: (markerId: string, categoryId: string) => void;
    toggleBookmark: (id: string) => void;
    toggleBookmarks: (ids: string[]) => void;
};

export default function Results({
    results,
    bookmarkIds,
    onSelect,
    toggleBookmark,
    toggleBookmarks,
}: Props) {
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
                    const bookmarkIdsForGroup = entries.map(
                        (e) => `${e.markerId}::${e.categoryId}::${e.itemId}`
                    );

                    const countBookmarked = bookmarkIdsForGroup.filter((id) =>
                        bookmarkIds.includes(id)
                    ).length;

                    const allBookmarked = countBookmarked === entries.length;

                    return (
                        <Result
                            key={`${title}::${category}`}
                            title={title}
                            category={category}
                            count={entries.length}
                            isBookmarked={allBookmarked}
                            onSelect={() =>
                                onSelect(
                                    entries[0].markerId,
                                    entries[0].categoryId
                                )
                            }
                            onToggleBookmark={() =>
                                allBookmarked
                                    ? bookmarkIdsForGroup.forEach(
                                          toggleBookmark
                                      )
                                    : toggleBookmarks(bookmarkIdsForGroup)
                            }
                        />
                    );
                }
            )}
        </>
    );
}
