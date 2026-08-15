// API base — relative by default so the production single-container deploy
// (frontend + backend on the same origin) works with zero config. For local
// dev set VITE_API_BASE_URL in .env.local, or rely on the Vite /api proxy.
const RAW_BASE: string = (import.meta.env.VITE_API_BASE_URL as string) || '';
const API_BASE = RAW_BASE && RAW_BASE !== '/' ? RAW_BASE.replace(/\/$/, '') : '';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = 'Something went wrong. Please try again.';
    try {
      const body = await res.json();
      detail = body.detail
        ? typeof body.detail === 'string'
          ? body.detail
          : body.detail[0]?.msg || detail
        : detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Donations ----
export interface DonationPayload {
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  donor_pan?: string;
  address?: string;
  cause: string;
  amount: number;
}

export interface DonationOrder {
  id: string;
  razorpay_order_id: string;
  amount: number;
  status: string;
}

export const createDonation = (payload: DonationPayload) =>
  request<DonationOrder>('/api/donations', { method: 'POST', body: JSON.stringify(payload) });

export const verifyDonation = (payload: {
  donation_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => request('/api/donations/verify', { method: 'POST', body: JSON.stringify(payload) });

// ---- Public config ----
export interface PublicConfig {
  razorpay_key_id: string;
  smtp_configured: boolean;
  environment: string;
}

export const getPublicConfig = () => request<PublicConfig>('/api/config');

/** Public Razorpay key id, fetched at runtime from the backend (falls back to
 * a build-time env var for old setups). Safe — key id is public by design. */
export async function getRazorpayPublicKey(): Promise<string> {
  try {
    const cfg = await getPublicConfig();
    if (cfg.razorpay_key_id) return cfg.razorpay_key_id;
  } catch {
    // backend unreachable — fall through to env/build var
  }
  return import.meta.env.VITE_RAZORPAY_KEY_ID || '';
}

// ---- File uploads (membership forms) ----
export const uploadFile = async (file: File): Promise<{ filename: string }> => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', body: fd });
  if (!res.ok) {
    let detail = 'Upload failed. Please try a smaller JPG/PNG/PDF file.';
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return res.json();
};

export interface MembershipOrder {
  id: string;
  razorpay_order_id: string | null;
  razorpay_subscription_id: string | null;
  amount: number;
  status: string;
}

// ---- Society Membership (Form 1) ----
export interface SocietyMembershipPayload {
  membership_type: string;
  name: string;
  father_husband_name?: string;
  gotra?: string;
  dob?: string;
  blood_group?: string;
  residence_address?: string;
  office_address?: string;
  residence_telephone?: string;
  office_telephone?: string;
  mobile: string;
  fax?: string;
  email: string;
  pan?: string;
  occupation_designation?: string;
  introducing_member_name?: string;
  introducing_member_mobile?: string;
  member_photo?: string;
  spouse_photo?: string;
  pan_document?: string;
  aadhaar_document?: string;
  payment_method: string;
  amount_in_words?: string;
  place?: string;
  member_signature?: string;
  terms_accepted: boolean;
}

export const createSocietyOrder = (payload: SocietyMembershipPayload) =>
  request<MembershipOrder>('/api/forms/society', { method: 'POST', body: JSON.stringify(payload) });

export const verifySocietyPayment = (payload: {
  form_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => request('/api/forms/society/verify', { method: 'POST', body: JSON.stringify(payload) });

// ---- Dainik Sewa Membership (Form 2) ----
export interface DainikSewaPayload {
  name: string;
  gotra?: string;
  father_name?: string;
  spouse_name?: string;
  office_address?: string;
  residence_address?: string;
  email: string;
  office_telephone?: string;
  residence_telephone?: string;
  mobile: string;
  self_profession?: string;
  spouse_profession?: string;
  self_dob?: string;
  spouse_dob?: string;
  marriage_anniversary?: string;
  child1_name?: string;
  child1_birthday?: string;
  child2_name?: string;
  child2_birthday?: string;
  child3_name?: string;
  child3_birthday?: string;
  self_blood_group?: string;
  spouse_blood_group?: string;
  temple_contribution?: string;
  photo?: string;
  consent: boolean;
  applicant_signature?: string;
  payment_method: string;
  amount_in_words?: string;
  recurring_consent: boolean;
  auto_payment_consent: boolean;
  recurring_payment_method?: string;
  recurring_start_date?: string;
  place?: string;
}

export const createDainikOrder = (payload: DainikSewaPayload) =>
  request<MembershipOrder>('/api/forms/dainik', { method: 'POST', body: JSON.stringify(payload) });

export const verifyDainikPayment = (payload: {
  form_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => request('/api/forms/dainik/verify', { method: 'POST', body: JSON.stringify(payload) });

export const verifyDainikSubscription = (payload: {
  form_id: string;
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => request('/api/forms/dainik/subscription/verify', { method: 'POST', body: JSON.stringify(payload) });

// ---- Forms ----
export const submitMembership = (payload: {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  occupation?: string;
  family_members?: number;
  message?: string;
}) => request('/api/forms/membership', { method: 'POST', body: JSON.stringify(payload) });

export const submitSeva = (payload: {
  full_name: string;
  phone: string;
  email: string;
  seva_type: string;
  preferred_date?: string;
  notes?: string;
}) => request('/api/forms/seva', { method: 'POST', body: JSON.stringify(payload) });

// ---- Blog ----
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  created_at: string;
}

export const getBlogPosts = () => request<BlogPost[]>('/api/blog');
export const getBlogPost = (slug: string) => request<BlogPost>(`/api/blog/${slug}`);

// ---- Gallery ----
export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
}

export const getGalleryItems = () => request<GalleryItem[]>('/api/gallery');

// ---- Live status ----
export interface LiveStatus {
  is_live: boolean;
  video_id: string | null;
  title: string | null;
  embed_url?: string | null;
}

export const getLiveStatus = () => request<LiveStatus>('/api/live/status');

// ---- Admin auth (httpOnly cookie session) ----
export const adminLogin = (email: string, password: string) =>
  request<{ authenticated: boolean; email: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const adminLogout = () =>
  request<{ authenticated: boolean }>('/api/auth/logout', { method: 'POST' });

export const adminMe = () =>
  request<{ authenticated: boolean; email?: string }>('/api/auth/me');

// ---- Announcements ----
export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  active: boolean;
  created_at: string;
}

export const getAnnouncements = () => request<Announcement[]>('/api/announcements');
export const createAnnouncement = (payload: { title: string; body?: string; active?: boolean }) =>
  request<Announcement>('/api/admin/announcements', { method: 'POST', body: JSON.stringify(payload) });
export const deleteAnnouncement = (id: string) =>
  request<{ message: string }>(`/api/admin/announcements/${id}`, { method: 'DELETE' });

// ---- Government documents ----
export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  file_url: string | null;
  original_name: string | null;
  created_at: string;
}

export const getDocuments = () => request<DocumentItem[]>('/api/documents');
export const uploadDocument = (title: string, category: string, file: File) => {
  const fd = new FormData();
  fd.append('title', title);
  fd.append('category', category);
  fd.append('file', file);
  return request<DocumentItem>('/api/admin/documents', { method: 'POST', body: fd });
};
export const deleteDocument = (id: string) =>
  request<{ message: string }>(`/api/admin/documents/${id}`, { method: 'DELETE' });

// ---- Site settings (live stream / timings / festivals / under-construction) ----
export interface SiteSettings {
  live_stream: string;
  timings: { name: string; time: string }[];
  festivals: { name: string; date: string }[];
  under_construction: boolean;
  donate_banner: string;
}

export const getSiteSettings = () => request<SiteSettings>('/api/site/settings');
export const updateSiteSettings = (payload: Partial<SiteSettings>) =>
  request<SiteSettings>('/api/admin/site/settings', { method: 'PUT', body: JSON.stringify(payload) });

// ---- Admin gallery upload ----
export const uploadGalleryItem = (title: string, category: string, file: File) => {
  const fd = new FormData();
  fd.append('title', title);
  fd.append('category', category);
  fd.append('file', file);
  return request<{ id: string; title: string; image_url: string; category: string }>('/api/admin/gallery', {
    method: 'POST',
    body: fd,
  });
};
export const deleteGalleryItem = (id: string) =>
  request<{ message: string }>(`/api/gallery/${id}`, { method: 'DELETE' });

// ---- Admin submissions ----
export interface SocietySubmission extends Record<string, unknown> {
  id: string;
  name: string;
  mobile: string;
  email: string;
  membership_type: string;
  membership_amount?: number;
  payment_method?: string;
  payment_status?: string;
  created_at?: string;
}

export interface DainikSubmission extends Record<string, unknown> {
  id: string;
  name: string;
  mobile: string;
  email: string;
  one_time_amount?: number;
  payment_method?: string;
  payment_status?: string;
  created_at?: string;
}

export const getSocietySubmissions = () => request<SocietySubmission[]>('/api/forms/society');
export const getDainikSubmissions = () => request<DainikSubmission[]>('/api/forms/dainik');
export const getAdminMemberships = () => request<Record<string, unknown>[]>('/api/admin/members');
export const getAdminSeva = () => request<Record<string, unknown>[]>('/api/admin/seva');
export const getAdminUploads = () => request<Record<string, unknown>[]>('/api/admin/uploads');

export { ApiError };
