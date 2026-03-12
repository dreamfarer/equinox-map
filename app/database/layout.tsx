import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Equinox: Homecoming Database',
    description:
        'Comprehensive database of character clothes, gear, and horse tack for Equinox: Homecoming. View stats, costs, level requirements, and item details.',
    alternates: {
        canonical: '/database',
    },
    openGraph: {
        title: 'Equinox: Homecoming Database',
        description:
            'Comprehensive database of character clothes, gear, and horse tack for Equinox: Homecoming. View stats, costs, level requirements, and item details.',
        url: '/database',
    },
    robots: { index: true, follow: true },
};

export default function DatabaseLayout({ children }: { children: ReactNode }) {
    return children;
}
