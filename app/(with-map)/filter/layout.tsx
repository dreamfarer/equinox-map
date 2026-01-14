import { Metadata } from 'next';

export const metadata: Metadata = {
    alternates: {
        canonical: '/filter',
    },
    openGraph: {
        url: '/filter',
    },
};

export default function FilterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
