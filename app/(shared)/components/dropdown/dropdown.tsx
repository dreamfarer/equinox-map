import React, { useEffect, useRef, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import styles from '@/app/(shared)/components/dropdown/dropdown.module.css';

type MenuPosition = 'top' | 'bottom';

type Props = {
    options: string[];
    selected: string | null;
    onSelect: (value: string) => void;
    id?: string;
    size?: string;
    menuPosition?: MenuPosition;
    menuOverflowDirection?: 'left' | 'right';
    className?: string;
    buttonClassName?: string;
};

const positionClass: Record<MenuPosition, string> = {
    top: styles.contentTop,
    bottom: styles.contentBottom,
};
function getCaretOrientation(
    open: boolean,
    menuPosition: MenuPosition
): React.CSSProperties {
    const flipped = open !== (menuPosition === 'top');
    return flipped ? { transform: 'scale(1, -1)' } : {};
}

function getMenuOverflowStyle(
    menuOverflowDirection: 'left' | 'right'
): React.CSSProperties {
    if (menuOverflowDirection === 'left') {
        return { right: '0' };
    }
    return { left: '0' };
}

export default function Dropdown({
    options,
    selected,
    onSelect,
    id,
    size,
    menuPosition = 'bottom',
    menuOverflowDirection = 'right',
    className = '',
    buttonClassName = '',
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

    return (
        <div className={`${className}`} ref={ref}>
            <button
                id={id}
                className={`${buttonClassName}`}
                style={{
                    ...(size && { fontSize: size }),
                }}
                onClick={() => setOpen((prev) => !prev)}
            >
                {selected}
                <CaretDownIcon
                    size="1em"
                    className={styles.caret}
                    style={getCaretOrientation(open, menuPosition)}
                />
            </button>
            <div
                className={`outline ${styles.content} ${positionClass[menuPosition]} ${open ? '' : styles.hidden}`}
                style={getMenuOverflowStyle(menuOverflowDirection)}
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
