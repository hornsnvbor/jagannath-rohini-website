import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { getAnnouncements, type Announcement } from '@/lib/api';

export default function AnnouncementsBar() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    getAnnouncements()
      .then((list) => setItems(list.filter((a) => a.active)))
      .catch(() => setItems([]));
  }, []);

  const visible = items.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <section className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
        {visible.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">{a.title}</p>
              {a.body && <p className="text-sm text-amber-800/90">{a.body}</p>}
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(a.id))}
              className="text-amber-600 hover:text-amber-800 p-1"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
