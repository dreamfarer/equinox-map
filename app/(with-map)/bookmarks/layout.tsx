import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bookmarks',
    description:
        'View and manage saved markers on the Equinox: Homecoming interactive map. Track your progress by toggling bookmarks off as you collect.',
    alternates: {
        canonical: '/bookmarks',
    },
    openGraph: {
        url: '/bookmarks',
    },
};

export default function BookmarkLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
