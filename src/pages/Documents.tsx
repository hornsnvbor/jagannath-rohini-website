import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { FileText, Download } from 'lucide-react';
import { getDocuments, type DocumentItem } from '@/lib/api';

export default function DocumentsPage() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocuments()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const groups = items.reduce<Record<string, DocumentItem[]>>((acc, d) => {
    (acc[d.category] = acc[d.category] || []).push(d);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>Government Documents & Certificates — Jagannath Mandir Rohini</title>
        <meta
          name="description"
          content="Official documents and certificates of Jagannath Mandir Rohini and Sree Neelachala Seva Sangha — society registration, trust documents and more."
        />
      </Helmet>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-temple-dark mb-2">
          Documents & Certificates
        </h1>
        <p className="text-muted-foreground mb-8">
          Official documents of Jagannath Mandir, Rohini and Sree Neelachala Seva Sangha.
        </p>

        {loading && <p className="text-muted-foreground text-sm">Loading documents…</p>}

        {!loading && items.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Documents will appear here once uploaded by the temple committee.
          </p>
        )}

        {!loading && Object.keys(groups).map((cat) => (
          <section key={cat} className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-temple-dark mb-3 capitalize">{cat}</h2>
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
              {groups[cat].map((d) => (
                <a
                  key={d.id}
                  href={d.file_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{d.title}</p>
                      {d.original_name && (
                        <p className="text-xs text-muted-foreground">{d.original_name}</p>
                      )}
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
