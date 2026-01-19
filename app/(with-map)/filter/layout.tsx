import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    alternates: {
        canonical: '/filter',
    },
    openGraph: {
        url: '/filter',
    },
};

export default function FilterLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
