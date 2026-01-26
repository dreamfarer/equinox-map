import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Development',
    description:
        'Place debug markers on the Equinox: Homecoming interactive map and log their coordinates to the console.',
    alternates: {
        canonical: '/dev',
    },
    openGraph: {
        url: '/dev',
    },
};

export default function DevelopmentLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
