import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Map from '@/app/(map)/components/map';

export const dynamicParams = false;

type MapSeo = {
    title: string;
    description: string;
};

const maps: Record<string, MapSeo> = {
    'five-sisters-isle': {
        title: 'Five Sisters Isle | Equinox: Homecoming Interactive Map',
        description:
            'Explore the Five Sisters Isle ride-island map in Equinox: Homecoming. Filter, search, collect and track all collectibles and more.',
    },
    'low-coast-trail': {
        title: 'Low Coast Trail | Equinox: Homecoming Interactive Map',
        description:
            'Explore the Low Coast Trail ride-island in Equinox: Homecoming. Filter, search, collect and track all collectibles and more.',
    },
    'high-coast-trail': {
        title: 'High Coast Trail | Equinox: Homecoming Interactive Map',
        description:
            'Explore the High Coast Trail ride-island in Equinox: Homecoming. Filter, search, collect and track all collectibles and more.',
    },
    'sunset-lake': {
        title: 'Sunset Lake | Equinox: Homecoming Interactive Map',
        description:
            'Explore the Sunset Lake ride-island in Equinox: Homecoming. Filter, search, collect and track all collectibles and more.',
    },
};

type PageProps = {
    params: Promise<{ map: string }>;
};

export function generateStaticParams() {
    return Object.keys(maps).map((map) => ({ map }));
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { map } = await params;
    const seo = maps[map];
    if (!seo) return {};
    return {
        title: seo.title,
        description: seo.description,
        alternates: {
            canonical: `/${map}`,
        },
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: `/${map}`,
        },
        robots: { index: true, follow: true },
    };
}

export default async function Page({ params }: PageProps) {
    const { map } = await params;
    if (!maps[map]) notFound();
    return <Map initialMap={map} />;
}
