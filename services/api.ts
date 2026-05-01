// services/api.ts
// Central API client for FamilyHelpUAE Spring Boot backend

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8443/api';

// ─────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('familyId');
}

export function getFamilyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('familyId');
}

// ─────────────────────────────────────────────
// HTTP client with auto JWT injection & refresh
// ─────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const data: AuthResponse = await request<AuthResponse>(
      '/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refreshToken }) },
      false
    );
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  familyName: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  role:string;
  familyName: string;
  email: string;
  password: string;
  address?: string;
  familySize: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface FamilyProfile {
  id: string;
  familyName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  reputationScore?: number;
  createdAt?: string;
}

export interface UpdateProfileRequest {
  familyName?: string;
  phoneNumber?: string;
  address?: string;
}

export type ServiceCategory =
  | 'CHILDCARE'
  | 'TUTORING'
  | 'TRANSPORTATION'
  | 'ELDER_CARE'
  | 'HOUSEHOLD';

export interface Offer {
  id: string;
  familyId: string;
  familyName?: string;
  category: ServiceCategory;
  title: string;
  description: string;
  urgency?: string;
  createdAt?: string;
}

export interface CreateOfferRequest {
  postType: string;
  category: ServiceCategory;
  title: string;
  description: string;
  urgency?: string;
}

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface HelpRequest {
  id: string;
  requesterFamilyId: string;
  requesterFamilyName?: string;
  offerId: string;
  offerTitle?: string;
  category?: ServiceCategory;
  message?: string;
  status: RequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequestRequest {
  offerId: string;
  message?: string;
}

export interface Feedback {
  id: string;
  fromFamilyId: string;
  fromFamilyName?: string;
  toFamilyId: string;
  requestId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface CreateFeedbackRequest {
  toFamilyId: string;
  requestId: string;
  rating: number;
  comment?: string;
}

export interface ReputationResponse {
  familyId: string;
  familyName: string;
  reputationScore: number;
  totalFeedbacks: number;
  averageRating: number;
}

export interface HistoryEntry {
  id: string;
  type: 'OFFERED' | 'REQUESTED';
  category: ServiceCategory;
  title: string;
  status: RequestStatus;
  partnerFamilyName?: string;
  createdAt?: string;
  completedAt?: string;
}

// ─────────────────────────────────────────────
// Auth API  –  POST /api/auth/*
// ─────────────────────────────────────────────
export const authApi = {
  register: (body: RegisterRequest) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: LoginRequest) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  refresh: (refreshToken: string) =>
    request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

// ─────────────────────────────────────────────
// Family Profiles API  –  /api/families/{id}
// ─────────────────────────────────────────────
export const familiesApi = {
  getProfile: (id: string) =>
    request<FamilyProfile>(`/families/${id}`),

  updateProfile: (id: string, body: UpdateProfileRequest) =>
    request<FamilyProfile>(`/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  getReputation: (id: string) =>
    request<ReputationResponse>(`/families/${id}/reputation`),

  getHistory: (id: string) =>
    request<HistoryEntry[]>(`/families/${id}/history`),
};

// ─────────────────────────────────────────────
// Offers API  –  /api/offers
// ─────────────────────────────────────────────
export const offersApi = {
  list: (category?: ServiceCategory) => {
    const qs = category ? `?category=${category}` : '';
    return request<Offer[]>(`/offers${qs}`);
  },

  create: (body: CreateOfferRequest) =>
    request<Offer>('/help/posts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// ─────────────────────────────────────────────
// Requests API  –  /api/requests
// ─────────────────────────────────────────────
export const requestsApi = {
  create: (body: CreateRequestRequest) =>
    request<HelpRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  accept: (id: string) =>
    request<HelpRequest>(`/requests/${id}/accept`, { method: 'POST' }),

  reject: (id: string) =>
    request<HelpRequest>(`/requests/${id}/reject`, { method: 'POST' }),

  complete: (id: string) =>
    request<HelpRequest>(`/requests/${id}/complete`, { method: 'POST' }),
};

// ─────────────────────────────────────────────
// Feedback API  –  /api/feedback
// ─────────────────────────────────────────────
export const feedbackApi = {
  submit: (body: CreateFeedbackRequest) =>
    request<Feedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
