import React, { useEffect, useRef, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import styles from '@/app/(shared)/components/dropdown/dropdown.module.css';

type MenuPosition = 'top' | 'bottom' | 'left' | 'right';

type Props = {
    options: string[];
    selected: string | undefined;
    onSelect: (value: string) => void;
    size?: string;
    menuPosition?: MenuPosition;
};

const positionClass: Record<MenuPosition, string> = {
    top: styles.contentTop,
    bottom: styles.contentBottom,
    left: styles.contentLeft,
    right: styles.contentRight,
};

const caretRotation: Record<MenuPosition, { closed: string; open: string }> = {
    top: { closed: '0deg', open: '180deg' },
    bottom: { closed: '180deg', open: '0deg' },
    left: { closed: '90deg', open: '-90deg' },
    right: { closed: '-90deg', open: '90deg' },
};

export default function Dropdown({
    options,
    selected,
    onSelect,
    size,
    menuPosition = 'top',
}: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const rotation = caretRotation[menuPosition][open ? 'open' : 'closed'];

    return (
        <div className={styles.dropdown} ref={ref}>
            <button
                className={styles.button}
                style={{
                    ...(size && { fontSize: size }),
                }}
                onClick={() => setOpen((prev) => !prev)}
            >
                {selected}
                <CaretDownIcon
                    size="1em"
                    className={styles.icon}
                    style={{ transform: `rotate(${rotation})` }}
                />
            </button>
            <div
                className={`${styles.content} ${positionClass[menuPosition]} ${open ? '' : styles.hidden}`}
            >
                {options
                    .filter((option) => option !== selected)
                    .map((option) => (
                        <button
                            key={option}
                            className={styles.item}
                            onClick={() => {
                                onSelect(option);
                                setOpen(false);
                            }}
                        >
                            {option}
                        </button>
                    ))}
            </div>
        </div>
    );
}
