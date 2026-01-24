import Dropdown from '@/app/components/dropdown';
import styles from '@/app/components/map/popup.module.css';
import { useFilterContext } from '@/app/context/filter-context';
import { useState } from 'react';
import { TCategory } from '@/types/category';
import { usePopupContext } from '@/app/context/popup-context';

export default function Popup() {
    const { activeCategoryList } = useFilterContext();
    const { allPopups, activePopup } = usePopupContext();
    const [shownCategory, setShownCategory] = useState<TCategory | undefined>(
        activeCategoryList[0]
    );

    if (!activePopup) return null;

    const itemsById = shownCategory
        ? allPopups?.[activePopup.id]?.[shownCategory]
        : undefined;

    if (!itemsById) return null;

    return (
        <div className={styles.popup}>
            {activeCategoryList.length > 1 && (
                <Dropdown
                    options={activeCategoryList}
                    selected={shownCategory}
                    onSelect={setShownCategory}
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
