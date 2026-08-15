// API base — ALWAYS relative `/api`. In production the Vercel `vercel.json`
// rewrite forwards `/api/*` to the Render backend, so the browser only ever
// talks to its own origin. This keeps the httpOnly `admin_session` cookie
// same-site (SameSite=Lax works). For local dev the Vite `/api` proxy targets
// the local FastAPI server, so no env var is needed either.
const API_BASE = '';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ---- Admin auth (JWT bearer token) ----
const TOKEN_KEY = 'admin_token';

export const getAdminToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setAdminToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearAdminToken = (): void => localStorage.removeItem(TOKEN_KEY);
export const isAdminLoggedIn = (): boolean => !!getAdminToken();

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

/** Same as `request`, but attaches the admin Bearer token. Throws ApiError(401)
 * if there's no token, so callers can redirect to /admin/login. */
async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  if (!token) throw new ApiError('Not authenticated', 401);
  try {
    return await request<T>(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) clearAdminToken();
    throw err;
  }
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

export const createBlogPost = (payload: { title: string; slug: string; excerpt?: string; content: string; cover_image?: string; published?: boolean }) =>
  request<BlogPost>('/api/blog', { method: 'POST', body: JSON.stringify(payload) });

export const updateBlogPost = (id: string, payload: { title: string; slug: string; excerpt?: string; content: string; cover_image?: string; published?: boolean }) =>
  request<BlogPost>(`/api/blog/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const deleteBlogPost = (id: string) => request<{ message: string }>(`/api/blog/${id}`, { method: 'DELETE' });

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

// ---- Admin: login ----
export const adminLogin = async (email: string, password: string): Promise<string> => {
  const { access_token } = await request<{ access_token: string; token_type: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAdminToken(access_token);
  return access_token;
};

export const adminLogout = (): void => clearAdminToken();

export const adminMe = () => authRequest<{ authenticated: boolean; email?: string }>('/api/auth/me');

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
  authRequest<Announcement>('/api/admin/announcements', { method: 'POST', body: JSON.stringify(payload) });
export const deleteAnnouncement = (id: string) =>
  authRequest<{ message: string }>(`/api/admin/announcements/${id}`, { method: 'DELETE' });

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
  return authRequest<DocumentItem>('/api/admin/documents', { method: 'POST', body: fd });
};
export const deleteDocument = (id: string) =>
  authRequest<{ message: string }>(`/api/admin/documents/${id}`, { method: 'DELETE' });

// ---- Site settings (live stream / timings / festivals / under-construction) ----
export interface SiteSettings {
  live_stream: string;
  timings: { name: string; time: string }[];
  festivals: { name: string; date: string }[];
  under_construction: boolean;
  donate_banner: string;
  logo_url: string;
}

export const getSiteSettings = () => request<SiteSettings>('/api/site/settings');
export const updateSiteSettings = (payload: Partial<SiteSettings>) =>
  authRequest<SiteSettings>('/api/admin/site/settings', { method: 'PUT', body: JSON.stringify(payload) });

// ---- Admin logo upload ----
export const uploadLogo = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return authRequest<{ logo_url: string; stored_name: string }>('/api/admin/logo', { method: 'POST', body: fd });
};

// ---- Admin gallery upload ----
export const uploadGalleryItem = (title: string, category: string, file: File) => {
  const fd = new FormData();
  fd.append('title', title);
  fd.append('category', category);
  fd.append('file', file);
  return authRequest<{ id: string; title: string; image_url: string; category: string }>('/api/admin/gallery', {
    method: 'POST',
    body: fd,
  });
};
export const deleteGalleryItem = (id: string) =>
  authRequest<{ message: string }>(`/api/gallery/${id}`, { method: 'DELETE' });

// ---- Admin: Society Membership submissions ----
export interface SocietyMembershipRow {
  id: string;
  membership_type: string;
  name: string;
  mobile: string;
  email: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}
export const getSocietySubmissions = () => authRequest<SocietyMembershipRow[]>('/api/forms/society');

// ---- Admin: Dainik Sewa submissions ----
export interface DainikSewaRow {
  id: string;
  name: string;
  mobile: string;
  email: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}
export const getDainikSubmissions = () => authRequest<DainikSewaRow[]>('/api/forms/dainik');

export const getAdminMemberships = () => authRequest<Record<string, unknown>[]>('/api/admin/members');
export const getAdminSeva = () => authRequest<Record<string, unknown>[]>('/api/admin/seva');
export const getAdminUploads = () => authRequest<Record<string, unknown>[]>('/api/admin/uploads');

// ---- Admin: Donations ----
export interface DonationRow {
  id: string;
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  cause: string;
  amount: number;
  status: string;
  created_at: string;
  [key: string]: unknown;
}
export const getDonations = () => authRequest<DonationRow[]>('/api/donations');

/** Fetch a stored upload (photo/ID doc) as a blob URL — the endpoint requires
 * an admin Bearer token, so it can't be used directly as an <img src>. */
export const getUploadUrl = async (filename: string): Promise<string> => {
  const token = getAdminToken();
  if (!token) throw new ApiError('Not authenticated', 401);
  const res = await fetch(`${API_BASE}/api/uploads/${filename}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError('Could not load file', res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export { ApiError };