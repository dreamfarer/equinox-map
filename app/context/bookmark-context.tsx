'use client';

import {
    createContext,
    useContext,
    useMemo,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { TBookmarkId } from '@/types/bookmark';
import {
    getCategoryBookmarkMap,
    loadBookmarks,
    saveBookmarks,
} from '@/lib/bookmark-utility';
import { useMenuState } from './menu-state-context';
import { usePopupContext } from './popup-context';

type TBookmarkContext = {
    bookmarkIds: TBookmarkId[];
    categoryBookmarkMap: Record<string, string[]>;
    bookmarkedMarkerIds: string[] | null;
    toggleBookmark: (id: TBookmarkId) => void;
    toggleBookmarks: (categoryId: string) => void;
    clearBookmarks: () => void;
};

const BookmarkContext = createContext<TBookmarkContext | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
    const [bookmarkIds, setBookmarkIds] =
        useState<TBookmarkId[]>(loadBookmarks);
    const { activeMenuName } = useMenuState();
    const { popups } = usePopupContext();

    const categoryBookmarkMap = useMemo(
        () => getCategoryBookmarkMap(popups),
        [popups]
    );

    const bookmarkedMarkerIds = useMemo(() => {
        if (activeMenuName !== 'bookmarks') return null;
        return Array.from(new Set(bookmarkIds.map((id) => id.split('::')[0])));
    }, [activeMenuName, bookmarkIds]);

    useEffect(() => {
        saveBookmarks(bookmarkIds);
    }, [bookmarkIds]);

    const toggleBookmark = useCallback((id: TBookmarkId) => {
        setBookmarkIds((prev) =>
            prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
        );
    }, []);

    const toggleBookmarks = useCallback(
        (categoryId: string) => {
            const ids = categoryBookmarkMap[categoryId] || [];
            setBookmarkIds((prev) => {
                const current = new Set(prev);
                const anyBookmarked = ids.some((id) => current.has(id));
                return anyBookmarked
                    ? prev.filter((id) => !ids.includes(id))
                    : [...new Set([...prev, ...ids])];
            });
        },
        [categoryBookmarkMap]
    );

    const clearBookmarks = useCallback(() => {
        setBookmarkIds([]);
    }, []);

    const value = useMemo<TBookmarkContext>(
        () => ({
            bookmarkIds,
            categoryBookmarkMap,
            bookmarkedMarkerIds,
            toggleBookmark,
            toggleBookmarks,
            clearBookmarks,
        }),
        [
            bookmarkIds,
            categoryBookmarkMap,
            bookmarkedMarkerIds,
            toggleBookmark,
            toggleBookmarks,
            clearBookmarks,
        ]
    );

    return (
        <BookmarkContext.Provider value={value}>
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarkContext() {
    const context = useContext(BookmarkContext);
    if (!context)
        throw new Error(
            'useBookmarkContext must be used inside <BookmarkProvider>'
        );
    return context;
}
