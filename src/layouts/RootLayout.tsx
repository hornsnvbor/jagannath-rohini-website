import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router-dom';

import TempleHeader from '@/components/temple/TempleHeader';
import TempleFooter from '@/components/temple/TempleFooter';
import Website from '@/layouts/Website';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Website>
      <Helmet>
        <title>Jagannath Mandir Rohini — Sree Neelachala Seva Sangha, New Delhi</title>
        <meta
          name="description"
          content="Official website of Jagannath Mandir, Rohini, New Delhi. Book Annaprasad, Rituals, and stay updated on Rath Yatra 2026 and temple events."
        />
        <link rel="icon" href="/assets/other/d0ad580cca853845851f7ca483f01998.png" sizes="192x192" />
      </Helmet>
      <ScrollRestoration />
      <TempleHeader />
      {children}
      <TempleFooter />
    </Website>
  );
}
