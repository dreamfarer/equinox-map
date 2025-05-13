import './global.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Equinox: Homecoming Interactive Map',
  description:
    'Explore quests, resources, races and more with this interactive map for Equinox: Homecoming.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      {
        url: '/android-chrome-192x192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        url: '/android-chrome-512x512.png',
        type: 'image/png',
        sizes: '512x512',
      },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
