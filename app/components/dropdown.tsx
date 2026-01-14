import { useEffect, useRef, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import styles from './dropdown.module.css';

type Props = {
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
};

export default function Dropdown({ options, selected, onSelect }: Props) {
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
        <div className={styles.dropdown} ref={ref}>
            <button
                className={styles.button}
                onClick={() => setOpen((prev) => !prev)}
            >
                {selected}
                <CaretDownIcon size="1em" />
            </button>
            {open && (
                <div className={styles.content}>
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
            )}
        </div>
    );
}
