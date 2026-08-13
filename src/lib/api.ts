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
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
}

export const getLiveStatus = () => request<LiveStatus>('/api/live/status');

export { ApiError };
