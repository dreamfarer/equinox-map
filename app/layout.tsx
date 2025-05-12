import './global.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Equinox: Homecoming Interactive Map',
  description:
    'Explore quests, resources, races and more with this interactive map for Equinox: Homecoming ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
