'use client';

import { useEffect, useMemo, useRef, useState, PointerEvent } from 'react';
import styles from '@/app/components/menu.module.css';
import { useMenuState } from '@/app/context/menu-state-context';
import Filter from '@/app/components/filter';
import Information from '@/app/components/information';

type SnapPointOptions = {
    top: number;
    mid: number;
    closed: number;
};

type SnapPoint = 'mid' | 'top' | 'closed';

export default function Menu() {
    const { isMenuOpen, activeMenuName, isMobile, setIsMobile } =
        useMenuState();
    const [dragging, setDragging] = useState(false);
    const [snapPoint, setSnapPoint] = useState<SnapPoint>('mid');
    const [dragY, setDragY] = useState<number | null>(null);
    const [vh, setVh] = useState<number | null>(null);
    const startYRef = useRef(0);
    const startTranslateRef = useRef(0);

    const snapPointOptions = useMemo<SnapPointOptions | null>(() => {
        if (vh === null) return null;
        return {
            top: Math.round(vh * 0.08),
            mid: Math.round(vh * 0.45),
            closed: Math.round(vh * 0.92),
        };
    }, [vh]);

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 768px)');
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, [setIsMobile]);

    useEffect(() => {
        const compute = () => setVh(window.innerHeight);
        compute();
        window.addEventListener('resize', compute);
        return () => window.removeEventListener('resize', compute);
    }, []);

    function nearestSnap(current: number): SnapPoint {
        if (!snapPointOptions) return 'mid';
        const candidates: Array<[SnapPoint, number]> = [
            ['top', snapPointOptions.top],
            ['mid', snapPointOptions.mid],
            ['closed', snapPointOptions.closed],
        ];
        let best: SnapPoint = 'mid';
        let bestDist = Infinity;
        for (const [name, val] of candidates) {
            const d = Math.abs(current - val);
            if (d < bestDist) {
                bestDist = d;
                best = name;
            }
        }
        return best;
    }

    const snappedY = snapPointOptions ? snapPointOptions[snapPoint] : 0;
    const effectiveY = dragY ?? snappedY;

    function onPointerDown(e: PointerEvent) {
        if (!isMobile || !snapPointOptions) return;
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        startYRef.current = e.clientY;
        startTranslateRef.current = effectiveY;
        setDragY(effectiveY);
    }

    function onPointerMove(e: PointerEvent) {
        if (!dragging || !isMobile || !snapPointOptions) return;
        const dy = e.clientY - startYRef.current;
        const next = startTranslateRef.current + dy;
        const clamped = Math.max(
            snapPointOptions.top,
            Math.min(snapPointOptions.closed, next)
        );
        setDragY(clamped);
    }

    function onPointerUpOrCancel(e: PointerEvent) {
        if (!dragging || !isMobile || !snapPointOptions) return;
        setDragging(false);
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
        const current = dragY ?? snappedY;
        setDragY(null);
        setSnapPoint(nearestSnap(current));
    }

    const content = useMemo(() => {
        if (isMobile) {
            return (
                <>
                    <Filter />
                    <Information />
                </>
            );
        }
        if (activeMenuName === 'filter') return <Filter />;
        return <Information />;
    }, [activeMenuName, isMobile]);

    return (
        <div
            className={styles.mask}
            style={{
                pointerEvents: !isMenuOpen && !isMobile ? 'none' : 'auto',
            }}
        >
            <div
                className={[
                    styles.menu,
                    !isMenuOpen ? styles.closed : '',
                    dragging ? styles.dragging : '',
                ].join(' ')}
                style={isMobile ? { top: `${effectiveY}px` } : undefined}
            >
                <div
                    className={styles.handleArea}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUpOrCancel}
                    onPointerCancel={onPointerUpOrCancel}
                >
                    <div className={styles.handleBar} />
                </div>
                <div className={styles.scrollArea}>{content}</div>
            </div>
        </div>
    );
}
