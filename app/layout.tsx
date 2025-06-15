import './global.css';
import Navbar from './components/navbar';
import { MenuStateProvider } from './context/menu-state';
import { Metadata } from 'next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://equinoxmap.app'),
  title: {
    default: 'Interactive Map – Equinox: Homecoming',
    template: '%s | Interactive Map – Equinox: Homecoming',
  },
  description:
    'An interactive map for Equinox: Homecoming. Filter, search, bookmark and track all collectible resources, quests, races, characters, shops and more.',
  alternates: {
    canonical: 'https://equinoxmap.app/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://equinoxmap.app/',
    siteName: 'Interactive Map – Equinox: Homecoming',
    title: 'Interactive Map – Equinox: Homecoming',
    description:
      'An interactive map for Equinox: Homecoming. Filter, search, bookmark and track all collectible resources, quests, races, characters, shops and more.',
    images: [
      {
        url: 'https://equinoxmap.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Interactive Map – Equinox: Homecoming preview',
      },
    ],
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MenuStateProvider>
          <Navbar />
          {children}
        </MenuStateProvider>
      </body>
    </html>
  );
}
