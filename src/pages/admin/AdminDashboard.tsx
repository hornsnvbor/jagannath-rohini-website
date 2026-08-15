import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Image, Megaphone, FileText, Video, LogOut,
  Plus, Trash2, RefreshCw, ChevronDown, ChevronUp, CheckCircle, Upload, Eye, Palette,
} from 'lucide-react';
import {
  adminLogout, deleteAnnouncement, deleteDocument, deleteGalleryItem, getAdminMemberships,
  getAdminSeva, getAnnouncements, getDainikSubmissions, getDocuments, getGalleryItems,
  getSiteSettings, getSocietySubmissions, createAnnouncement, uploadDocument,
  uploadGalleryItem, updateSiteSettings, uploadLogo, type Announcement, type DocumentItem,
  type GalleryItem, type SiteSettings, type SocietySubmission, type DainikSubmission,
} from '../../lib/api';

type Tab = 'submissions' | 'gallery' | 'announcements' | 'documents' | 'live' | 'branding';

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'submissions', label: 'Submissions', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'live', label: 'Live & Timings', icon: Video },
  { id: 'branding', label: 'Logo & Branding', icon: Palette },
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-gray-50 flex items-center gap-2">
        <h3 className="font-semibold text-temple-dark">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function SubTable({ rows, columns }: { rows: Record<string, unknown>[]; columns: { key: string; label: string }[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!rows.length) return <p className="text-sm text-muted-foreground">No submissions yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
            {columns.map((c) => (
              <th key={c.key} className="py-2 pr-4 font-medium">{c.label}</th>
            ))}
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <FragmentRow key={String(r.id)} row={r} columns={columns} open={openId === String(r.id)} onToggle={() => setOpenId(openId === String(r.id) ? null : String(r.id))} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRow({ row, columns, open, onToggle }: { row: Record<string, unknown>; columns: { key: string; label: string }[]; open: boolean; onToggle: () => void }) {
  const extra = Object.entries(row).filter(([k]) => !columns.some((c) => c.key === k) && k !== 'id');
  return (
    <>
      <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={onToggle}>
        {columns.map((c) => (
          <td key={c.key} className="py-2.5 pr-4 text-gray-800">{String(row[c.key] ?? '—')}</td>
        ))}
        <td className="py-2.5">{open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</td>
      </tr>
      {open && (
        <tr className="border-b bg-gray-50/60">
          <td colSpan={columns.length + 1} className="py-3 px-4">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {extra.map(([k, v]) => {
                if (v === null || v === undefined || v === '') return null;
                return (
                  <div key={k} className="text-xs">
                    <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}: </span>
                    <span className="text-gray-800">{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</span>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('submissions');
  const [loading, setLoading] = useState(true);

  // submissions
  const [society, setSociety] = useState<SocietySubmission[]>([]);
  const [dainik, setDainik] = useState<DainikSubmission[]>([]);
  const [memberships, setMemberships] = useState<Record<string, unknown>[]>([]);
  const [seva, setSeva] = useState<Record<string, unknown>[]>([]);

  // gallery
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [gTitle, setGTitle] = useState('');
  const [gCategory, setGCategory] = useState('general');
  const [gFile, setGFile] = useState<File | null>(null);

  // announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [aTitle, setATitle] = useState('');
  const [aBody, setABody] = useState('');
  const [aActive, setAActive] = useState(true);

  // documents
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [dTitle, setDTitle] = useState('');
  const [dCategory, setDCategory] = useState('government');
  const [dFile, setDFile] = useState<File | null>(null);

  // live & timings
  const [settings, setSettings] = useState<SiteSettings>({
    live_stream: '', timings: [], festivals: [], under_construction: false, donate_banner: '', logo_url: '',
  });
  const [liveInput, setLiveInput] = useState('');
  const [timingsInput, setTimingsInput] = useState('');
  const [festivalsInput, setFestivalsInput] = useState('');

  // branding / logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const refreshSubmissions = useCallback(async () => {
    let unauthenticated = false;
    const safe = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        return await fn();
      } catch (err: any) {
        if (err?.status === 401) unauthenticated = true;
        return null;
      }
    };
    const [s, d, m, sv] = await Promise.all([
      safe(getSocietySubmissions),
      safe(getDainikSubmissions),
      safe(getAdminMemberships),
      safe(getAdminSeva),
    ]);
    if (unauthenticated) {
      navigate('/admin/login', { replace: true });
      return;
    }
    setSociety((s as SocietySubmission[]) || []);
    setDainik((d as DainikSubmission[]) || []);
    setMemberships(m || []);
    setSeva(sv || []);
  }, [navigate]);

  const refreshGallery = useCallback(async () => {
    try { setGallery(await getGalleryItems()); } catch { /* ignore */ }
  }, []);

  const refreshAnnouncements = useCallback(async () => {
    try { setAnnouncements(await getAnnouncements()); } catch { /* ignore */ }
  }, []);

  const refreshDocuments = useCallback(async () => {
    try { setDocuments(await getDocuments()); } catch { /* ignore */ }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const s = await getSiteSettings();
      setSettings(s);
      setLogoUrl(s.logo_url || '');
      setLiveInput(s.live_stream || '');
      setTimingsInput((s.timings || []).map((t) => `${t.name}\t${t.time}`).join('\n'));
      setFestivalsInput((s.festivals || []).map((f) => `${f.name}\t${f.date}`).join('\n'));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([
        refreshSubmissions(), refreshGallery(), refreshAnnouncements(), refreshDocuments(), refreshSettings(),
      ]);
      setLoading(false);
    })();
  }, [refreshSubmissions, refreshGallery, refreshAnnouncements, refreshDocuments, refreshSettings]);

  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gFile) return alert('Please choose an image');
    setBusy(true);
    try {
      await uploadGalleryItem(gTitle || 'Gallery Photo', gCategory, gFile);
      setGTitle(''); setGFile(null);
      await refreshGallery();
      flash('Photo uploaded');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTitle.trim()) return alert('Title is required');
    setBusy(true);
    try {
      await createAnnouncement({ title: aTitle, body: aBody || undefined, active: aActive });
      setATitle(''); setABody(''); setAActive(true);
      await refreshAnnouncements();
      flash('Announcement added');
    } catch (err: any) {
      alert(err.message || 'Failed to add announcement');
    } finally {
      setBusy(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dFile) return alert('Please choose a PDF');
    if (!dTitle.trim()) return alert('Title is required');
    setBusy(true);
    try {
      await uploadDocument(dTitle, dCategory, dFile);
      setDTitle(''); setDFile(null);
      await refreshDocuments();
      flash('Document uploaded');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleUploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return alert('Please choose a logo image');
    setBusy(true);
    try {
      const res = await uploadLogo(logoFile);
      setLogoUrl(res.logo_url);
      setLogoFile(null);
      flash('Logo updated — it will appear on the site immediately');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const s = await updateSiteSettings({ live_stream: liveInput.trim() });
      setSettings(s);
      flash('Live stream saved');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const parsePairs = (raw: string): { name: string; time: string }[] =>
    raw.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const [name, ...rest] = l.split('\t');
      return { name: name || '', time: rest.join('\t') || '' };
    }).filter((x) => x.name);

  const handleSaveTimings = async () => {
    setBusy(true);
    try {
      const s = await updateSiteSettings({ timings: parsePairs(timingsInput) });
      setSettings(s);
      flash('Timings saved');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveFestivals = async () => {
    setBusy(true);
    try {
      const s = await updateSiteSettings({ festivals: parsePairs(festivalsInput) });
      setSettings(s);
      flash('Festival calendar saved');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleUnderConstruction = async () => {
    setBusy(true);
    try {
      const s = await updateSiteSettings({ under_construction: !settings.under_construction });
      setSettings(s);
      flash('Saved');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try { await adminLogout(); } catch { /* ignore */ }
    navigate('/admin/login', { replace: true });
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel…</p>
      </div>
    );
  }

  const societyColumns = [
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'membership_type', label: 'Type' },
    { key: 'payment_status', label: 'Status' },
  ];
  const dainikColumns = [
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'payment_status', label: 'Status' },
  ];
  const membershipColumns = [
    { key: 'full_name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
  ];
  const sevaColumns = [
    { key: 'full_name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'seva_type', label: 'Seva' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-temple-dark text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            <h1 className="font-bold">Jagannath Mandir — Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshSubmissions}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-2 flex flex-wrap gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 text-sm rounded-t-lg flex items-center gap-1.5 transition ${
                  tab === t.id ? 'bg-gray-50 text-temple-dark font-medium' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {notice && (
          <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <CheckCircle className="w-4 h-4" /> {notice}
          </div>
        )}

        {tab === 'submissions' && (
          <div className="space-y-6">
            <SectionCard title={`Society Membership (${society.length})`}>
              <SubTable rows={society as unknown as Record<string, unknown>[]} columns={societyColumns} />
            </SectionCard>
            <SectionCard title={`Dainik Sewa Membership (${dainik.length})`}>
              <SubTable rows={dainik as unknown as Record<string, unknown>[]} columns={dainikColumns} />
            </SectionCard>
            <SectionCard title={`Membership Requests (${memberships.length})`}>
              <SubTable rows={memberships} columns={membershipColumns} />
            </SectionCard>
            <SectionCard title={`Seva Requests (${seva.length})`}>
              <SubTable rows={seva} columns={sevaColumns} />
            </SectionCard>
          </div>
        )}

        {tab === 'gallery' && (
          <div className="space-y-6">
            <SectionCard title="Upload Photo">
              <form onSubmit={handleUploadGallery} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input className={inputCls} value={gTitle} onChange={(e) => setGTitle(e.target.value)} placeholder="e.g. Rath Yatra 2026" />
                  </div>
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <input className={inputCls} value={gCategory} onChange={(e) => setGCategory(e.target.value)} placeholder="general / festival / aarti" />
                  </div>
                </div>
                <div>
                  <FieldLabel>Image (JPG/PNG/GIF/WebP)</FieldLabel>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setGFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white"
                  />
                  {gFile && <p className="text-xs text-green-600 mt-1">Selected: {gFile.name}</p>}
                </div>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50">
                  <Upload className="w-4 h-4" /> Upload
                </button>
              </form>
            </SectionCard>
            <SectionCard title={`Gallery (${gallery.length})`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((g) => (
                  <div key={g.id} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={g.image_url} alt={g.title} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={async () => { if (confirm('Delete this photo?')) { await deleteGalleryItem(g.id); refreshGallery(); } }}
                        className="p-2 bg-red-600 rounded-full text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs px-2 py-1 truncate">{g.title}</p>
                  </div>
                ))}
              </div>
              {gallery.length === 0 && <p className="text-sm text-muted-foreground">No photos yet.</p>}
            </SectionCard>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="space-y-6">
            <SectionCard title="Add Announcement">
              <form onSubmit={handleAddAnnouncement} className="space-y-3">
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <input className={inputCls} value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="e.g. Rath Yatra 2026 — 16 July" required />
                </div>
                <div>
                  <FieldLabel>Body</FieldLabel>
                  <textarea className={inputCls} rows={3} value={aBody} onChange={(e) => setABody(e.target.value)} placeholder="Announcement details…" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={aActive} onChange={(e) => setAActive(e.target.checked)} className="accent-primary" />
                  Show on homepage
                </label>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50">
                  <Plus className="w-4 h-4" /> Add Announcement
                </button>
              </form>
            </SectionCard>
            <SectionCard title={`Announcements (${announcements.length})`}>
              <ul className="divide-y divide-border">
                {announcements.map((a) => (
                  <li key={a.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{a.title}</p>
                      {a.body && <p className="text-sm text-muted-foreground mt-0.5">{a.body}</p>}
                    </div>
                    <button
                      onClick={async () => { if (confirm('Delete this announcement?')) { await deleteAnnouncement(a.id); refreshAnnouncements(); } }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
            </SectionCard>
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-6">
            <SectionCard title="Upload Document (Government/Trust PDF)">
              <form onSubmit={handleUploadDocument} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input className={inputCls} value={dTitle} onChange={(e) => setDTitle(e.target.value)} placeholder="e.g. Society Registration Certificate" required />
                  </div>
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <input className={inputCls} value={dCategory} onChange={(e) => setDCategory(e.target.value)} placeholder="government / trust / receipt" />
                  </div>
                </div>
                <div>
                  <FieldLabel>PDF file</FieldLabel>
                  <input
                    type="file" accept=".pdf,application/pdf"
                    onChange={(e) => setDFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white"
                  />
                  {dFile && <p className="text-xs text-green-600 mt-1">Selected: {dFile.name}</p>}
                </div>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50">
                  <Upload className="w-4 h-4" /> Upload Document
                </button>
              </form>
            </SectionCard>
            <SectionCard title={`Documents (${documents.length})`}>
              <ul className="divide-y divide-border">
                {documents.map((d) => (
                  <li key={d.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.category} · {d.original_name || ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.file_url && (
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-primary hover:bg-primary/10 rounded" title="View">
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={async () => { if (confirm('Delete this document?')) { await deleteDocument(d.id); refreshDocuments(); } }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {documents.length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}
            </SectionCard>
          </div>
        )}

        {tab === 'live' && (
          <div className="space-y-6">
            <SectionCard title="Live Darshan Stream">
              <form onSubmit={handleSaveLive} className="space-y-3">
                <FieldLabel>YouTube video id / link / channel live URL</FieldLabel>
                <input className={inputCls} value={liveInput} onChange={(e) => setLiveInput(e.target.value)} placeholder="e.g. dQw4w9WgXcQ or https://www.youtube.com/watch?v=…" />
                <p className="text-xs text-muted-foreground">Leave empty to fall back to automatic detection from the temple YouTube channel.</p>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50">
                  Save Live Stream
                </button>
              </form>
            </SectionCard>

            <SectionCard title="Aarti Timings">
              <FieldLabel>One timing per line: Name (TAB) Time</FieldLabel>
              <textarea className={inputCls} rows={6} value={timingsInput} onChange={(e) => setTimingsInput(e.target.value)} placeholder={'Mangala Aarti\t5:30 AM\nMadhyanha Bhoga Aarti\t12:00 PM'} />
              <button onClick={handleSaveTimings} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50">
                Save Timings
              </button>
            </SectionCard>

            <SectionCard title="Festival Calendar">
              <FieldLabel>One festival per line: Name (TAB) Date</FieldLabel>
              <textarea className={inputCls} rows={6} value={festivalsInput} onChange={(e) => setFestivalsInput(e.target.value)} placeholder={'Rath Yatra\t16 July 2026\nJanmashtami\t4 Sep 2026'} />
              <button onClick={handleSaveFestivals} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50">
                Save Festivals
              </button>
            </SectionCard>

            <SectionCard title="Donation / Under-Construction Banner">
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                <input type="checkbox" checked={settings.under_construction} onChange={handleToggleUnderConstruction} className="accent-primary" />
                Show "temple under construction — donate any amount" banner on the Donate page
              </label>
              <p className="text-xs text-muted-foreground">The banner appears on the Donate page when enabled.</p>
            </SectionCard>
          </div>
        )}

        {tab === 'branding' && (
          <div className="space-y-6">
            <SectionCard title="Header Logo">
              <form onSubmit={handleUploadLogo} className="space-y-3">
                {logoUrl && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Current logo (shown in the header):</p>
                    <img src={logoUrl} alt="Current logo" className="h-16 w-auto object-contain border border-border rounded-lg p-1 bg-white" />
                  </div>
                )}
                <div>
                  <FieldLabel>Logo image (PNG/JPG/WebP with transparent background recommended)</FieldLabel>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white"
                  />
                  {logoFile && <p className="text-xs text-green-600 mt-1">Selected: {logoFile.name}</p>}
                </div>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50">
                  <Upload className="w-4 h-4" /> Change Logo
                </button>
              </form>
            </SectionCard>
            <p className="text-xs text-muted-foreground">
              Tip: Use the existing <code className="bg-gray-100 px-1 rounded">horizontal.png</code> style logo for the best fit. The logo scales up in the header and keeps transparency.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
