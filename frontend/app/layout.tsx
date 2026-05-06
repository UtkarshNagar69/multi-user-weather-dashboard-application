import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'WeatherBoard — Multi-User Weather Dashboard',
  description:
    'A secure, multi-tenant weather dashboard. Track real-time weather conditions for any city, save favorites, and monitor global weather in one place.',
  keywords: ['weather', 'dashboard', 'forecast', 'real-time weather', 'city weather'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-animated" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
