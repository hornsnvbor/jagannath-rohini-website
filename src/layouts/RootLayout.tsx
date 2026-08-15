import { Helmet } from '@dr.pogodin/react-helmet';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import TempleHeader from '@/components/temple/TempleHeader';
import TempleFooter from '@/components/temple/TempleFooter';
import Website from '@/layouts/Website';

export default function RootLayout() {
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
      <Outlet />
      <TempleFooter />
    </Website>
  );
}
