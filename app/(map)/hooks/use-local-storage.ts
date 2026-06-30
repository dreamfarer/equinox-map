import { useCallback, useSyncExternalStore } from 'react';

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

    const getSnapshot = useCallback((): T | undefined => {
        const raw = localStorage.getItem(key);
        if (raw == null) return initialValue;
        try {
            return deserialize(raw);
        } catch {
            return initialValue;
        }
    }, [key, initialValue, deserialize]);

    const getServerSnapshot = useCallback((): T | undefined => {
        return undefined;
    }, []);

    const value = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    const setValue = useCallback(
        (next: T | undefined) => {
            if (typeof window === 'undefined') return;
            if (next === undefined && removeOnUndefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, serialize(next as T));
            }
            window.dispatchEvent(
                new CustomEvent('local-storage-change', { detail: { key } })
            );
        },
        [key, removeOnUndefined, serialize]
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
