import "./global.css";
import { ReactNode } from "react";

export const metadata = {
  title: `equinoxmap\.app`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
