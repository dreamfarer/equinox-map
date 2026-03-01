import Dropdown from '@/app/components/dropdown';
import styles from '@/app/components/map/popup.module.css';
import { useFilterContext } from '@/app/context/filter-context';
import { useMemo, useState } from 'react';
import { TCategory } from '@/types/category';
import { useMarkerContext } from '@/app/context/marker-context';

export default function Popup() {
    const { activeCategoryList } = useFilterContext();
    const { allPopups, activePopup } = useMarkerContext();
    const [selectedCategory, setSelectedCategory] = useState<
        TCategory | undefined
    >(undefined);

    const effectiveCategories = useMemo(() => {
        if (!activePopup) return [];
        const popupCats = allPopups?.[activePopup.featureId] ?? {};
        return activeCategoryList.filter((cat) => cat in popupCats);
    }, [activeCategoryList, activePopup, allPopups]);

    const shownCategory = useMemo(() => {
        if (
            selectedCategory &&
            effectiveCategories.includes(selectedCategory)
        ) {
            return selectedCategory;
        }
        return effectiveCategories[0];
    }, [selectedCategory, effectiveCategories]);

    if (!activePopup) return null;

    const itemsById = shownCategory
        ? allPopups?.[activePopup.featureId]?.[shownCategory]
        : undefined;

    if (!itemsById) return null;

    return (
        <div className={styles.popup}>
            {effectiveCategories.length > 1 && (
                <Dropdown
                    options={effectiveCategories}
                    selected={shownCategory}
                    onSelect={setSelectedCategory}
                />
            )}

            <div className={styles.content}>
                <div className={styles.scroll}>
                    {Object.entries(itemsById).map(([itemId, item]) => (
                        <div key={itemId} className={styles.item}>
                            <div className={styles.header}>
                                {item.title && (
                                    <div className={styles.title}>
                                        {item.title}
                                    </div>
                                )}
                            </div>
                            {item.subtitle && (
                                <div className={styles.subtitle}>
                                    {item.subtitle}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
