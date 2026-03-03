import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: '/filter',
                destination: '/',
                permanent: false,
            },
            {
                source: '/bookmarks',
                destination: '/',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
