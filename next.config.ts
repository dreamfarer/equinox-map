import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: '/filter',
                destination: '/',
                permanent: true,
            },
            {
                source: '/bookmarks',
                destination: '/',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
