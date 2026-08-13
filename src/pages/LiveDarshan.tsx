import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Radio } from 'lucide-react';
import { getLiveStatus, type LiveStatus } from '@/lib/api';

// Fallback: the temple's YouTube channel handle, used to embed the "live tab"
// even when our backend can't confirm live status (e.g. YOUTUBE_API_KEY not
// yet configured). Update this to the real channel handle.
const CHANNEL_HANDLE = 'Jeetendra.Happy-777_Life';

const aartiSchedule = [
  { name: 'Mangala Aarti', time: '5:30 AM' },
  { name: 'Madhyanha Bhoga Aarti', time: '12:00 PM' },
  { name: 'Sandhya Aarti', time: '7:00 PM' },
  { name: 'Shayan Aarti', time: '9:00 PM' },
];

export default function LiveDarshanPage() {
  const [status, setStatus] = useState<LiveStatus | null>(null);

  useEffect(() => {
    getLiveStatus()
      .then(setStatus)
      .catch(() => setStatus({ is_live: false, video_id: null, title: null }));
  }, []);

  return (
    <>
      <Helmet>
        <title>Live Darshan & Aarti — Jagannath Mandir Rohini</title>
        <meta
          name="description"
          content="Watch Live Aarti and Darshan from Jagannath Mandir, Rohini. Daily aarti timings and live YouTube stream."
        />
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-temple-dark mb-2">
          Live Darshan & Aarti
        </h1>
        <p className="text-muted-foreground mb-8">
          Watch live darshan from Jagannath Mandir, Rohini. Jai Jagannath! 🙏
        </p>

        {status?.is_live && (
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <span className="text-red-600 font-bold text-sm tracking-wide uppercase flex items-center gap-1">
              <Radio size={14} /> Live Now — {status.title}
            </span>
          </div>
        )}

        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl bg-temple-dark">
          <iframe
            src={
              status?.video_id
                ? `https://www.youtube.com/embed/${status.video_id}`
                : `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_HANDLE}`
            }
            title="Jagannath Mandir Rohini — Live Darshan"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-heading font-semibold text-temple-dark mb-3">Daily Aarti Timings</h2>
            <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-card">
              {aartiSchedule.map((a) => (
                <li key={a.name} className="flex justify-between px-4 py-3 text-sm">
                  <span>{a.name}</span>
                  <span className="font-semibold text-primary">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-temple-dark mb-3">Not live right now?</h2>
            <p className="text-sm text-muted-foreground">
              The player above automatically shows our next live stream once it begins, or the latest
              uploaded aarti video otherwise. Subscribe on YouTube to get notified the moment we go live.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
