import {
    SetStateAction,
    useCallback,
    useMemo,
    useSyncExternalStore,
} from 'react';

type UseLocalStorageOptions<T> = {
    removeOnUndefined?: boolean;
    serialize?: (value: T) => string;
    deserialize?: (raw: string) => T;
};

export function useLocalStorage<T>(
    key: string,
    initialValue?: T,
    options: UseLocalStorageOptions<T> = {}
) {
    const {
        removeOnUndefined = true,
        serialize = JSON.stringify,
        deserialize = JSON.parse as unknown as (raw: string) => T,
    } = options;

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const onStorage = (e: StorageEvent) => {
                if (e.storageArea === localStorage && e.key === key)
                    onStoreChange();
            };
            const onLocalChange = (e: Event) => {
                const ce = e as CustomEvent<{ key: string }>;
                if (ce.detail?.key === key) onStoreChange();
            };
            window.addEventListener('storage', onStorage);
            window.addEventListener(
                'local-storage-change',
                onLocalChange as EventListener
            );
            return () => {
                window.removeEventListener('storage', onStorage);
                window.removeEventListener(
                    'local-storage-change',
                    onLocalChange as EventListener
                );
            };
        },
        [key]
    );

    const parse = useCallback(
        (raw: string | null): T | undefined => {
            if (raw == null) return initialValue;
            try {
                return deserialize(raw);
            } catch {
                return initialValue;
            }
        },
        [initialValue, deserialize]
    );

    // The snapshot is the raw string, because a freshly parsed object or array
    // would never compare equal and React would re-render forever.
    const getSnapshot = useCallback((): string | null => {
        return localStorage.getItem(key);
    }, [key]);

    const getServerSnapshot = useCallback((): string | null => {
        return null;
    }, []);

    const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const value = useMemo(() => parse(raw), [parse, raw]);

    const setValue = useCallback(
        (next: SetStateAction<T | undefined>) => {
            if (typeof window === 'undefined') return;
            const resolved =
                next instanceof Function
                    ? next(parse(localStorage.getItem(key)))
                    : next;
            if (resolved === undefined && removeOnUndefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, serialize(resolved as T));
            }
            window.dispatchEvent(
                new CustomEvent('local-storage-change', { detail: { key } })
            );
        },
        [key, parse, removeOnUndefined, serialize]
    );

    const subscribeNoop = useCallback(() => {
        return () => {};
    }, []);

    const hydrated = useSyncExternalStore(
        subscribeNoop,
        () => true,
        () => false
    );

    return [value, setValue, hydrated] as const;
}
