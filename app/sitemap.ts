import type { MetadataRoute } from 'next';

const maps = [
    'five-sisters-isle',
    'low-coast-trail',
    'high-coast-trail',
    'sunset-lake',
];

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://equinoxmap.app/',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...maps.map((map) => ({
            url: `https://equinoxmap.app/${map}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        })),
        {
            url: 'https://equinoxmap.app/database',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];
}
