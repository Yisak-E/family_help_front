// services/api.ts
// Central API client for FamilyHelpUAE Spring Boot backend

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8443/api';
import { AuthResponse, LoginRequest, RegisterRequest, LeaderboardResponse } from './types';
// ─────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────
export function getAccessToken(): string | null {
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
    window.location.href = '/';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  // Some endpoints may return an empty body with 200 OK (dev servers, health checks, etc.).
  // Safely read text first and only parse JSON when content exists.
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // Fall back to res.json() to preserve original behavior if parsing fails
    return res.json();
  }
}

async function tryRefresh(): Promise<boolean> {
  // Refresh endpoint not available on backend — skip refresh and force login
  return false;
}


export interface FamilyProfile {
  id: string;
  familyName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  trustScore?: number;
  createdAt?: string;
}

export interface UpdateProfileRequest {
  familyName?: string;
  phoneNumber?: string;
  address?: string;
}

export type ServiceCategory =
  | 'SHOPPING'
  | 'PETTING'
  | 'CHILDCARE'
  | 'TUTORING'
  | 'TRANSPORTATION'
  | 'ELDER_CARE'
  | 'HOUSEHOLD';

export interface Offer {
  id: string;
  family: FamilyProfile;
  category: ServiceCategory | string;
  title: string;
  description: string;
  urgency?: string;
  createdAt?: string;
}

export interface CreateOfferRequest {
  postType: string;
  category: ServiceCategory | string;
  title: string;
  description: string;
  urgency?: string;
}

// CreatePostDto (backend) mapping — frontend should send ISO datetime for `neededBy`
export interface CreatePostRequest {
  postType: 'OFFER' | 'SEEK' | string;
  title: string;
  category: ServiceCategory | string;
  description: string;
  urgency?: string;
  neededBy?: string; // ISO datetime string
}

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface HelpRequest {
  id: string;
  requesterFamilyId: string;
  requesterFamilyName?: string;
  offerId: string;
  offerTitle?: string;
  category?: ServiceCategory | string;
  message?: string;
  status:  string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequestRequest {
  offerId: string;
  message?: string;
}

export interface Feedback {
  id: string;
  fromFamilyId?: string;
  fromFamilyName?: string;
  postId?: number;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface CreateFeedbackRequest {
  postId: number;
  rating: number;
  comment: string;
}



export interface HistoryEntry {
  id: number;
  postType: string;
  category: string;
  title: string;
  description?: string;
  status: string;
  urgency?: string;
  createdAt: string;
  availableAt?: string;
  neededBy?: string;
  family: FamilyProfile;
}

/**
 * {
        "applicationCount": 0,
        "availability": null,
        "category": "tutoring",
        "createdAt": "2026-05-02T05:41:24.186655",
        "description": "math tutoring for university students",
        "family": {
            "id": 1,
            "familyName": "Metaferiya Family",
            "address": "Dubai",
            "familySize": 4,
            "trustScore": 5.0,
            "completedInteractions": 0,
            "cancelledInteractions": 0,
            "email": "yisakdemelash7@gmail.com",
            "lastActive": "2026-05-01T19:32:50.30108"
        },
        "id": 9,
        "neededBy": null,
        "postType": "OFFER",
        "status": "OPEN",
        "title": "math tutoring",
        "urgency": null
    }
 */
export interface My_ActivityEntry {
  id: number;
  postType: string;
  category: string;
  title: string;
  description?: string;
  status: string;
  urgency?: string;
  createdAt: string;
  availableAt?: string;
  neededBy?: string;
  family: FamilyProfile;
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

  // Backend uses a misspelled 'refress' endpoint
  refresh: (refreshToken: string) =>
    request<AuthResponse>('/auth/refress', {
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



  // Backend provides a user-scoped activity endpoint
  getHistory: (_id?: string) =>
    request<HistoryEntry[]>(`/help/my-activity`),
};

// ─────────────────────────────────────────────
// Rewards / Leaderboard API – /api/rewards
// ─────────────────────────────────────────────
export const rewardsApi = {
  getLeaderboard: () =>
    request<LeaderboardResponse[]>('/rewards/leaderboard'),

  getMine: (id: string | number) =>
    request<LeaderboardResponse>(`/rewards/mine/${id}`),
};

// ─────────────────────────────────────────────
// Calendar API
// ─────────────────────────────────────────────
export interface CalendarEvent {
  postId: number;
  title: string;
  category: string;
  scheduledTime: string; // ISO datetime
  status: string;
  role: 'HELPER' | 'RECEIVER' | string;
  otherFamilyName?: string;
}

export const calendarApi = {
  getWeekly: () => request<CalendarEvent[]>('/calendar/weekly'),
};

// ─────────────────────────────────────────────
// Tasks API
// ─────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  completed?: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export const tasksApi = {
  createTask: (body: CreateTaskRequest) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  getCommunityFeed: () => request<Task[]>('/tasks/feed'),
  getTaskById: (taskId: string) => request<Task>(`/tasks/${taskId}`),
  completeTask: (taskId: string) => request<void>(`/tasks/${taskId}/complete`, { method: 'PATCH' }),
};

// ─────────────────────────────────────────────
// Offers API  –  /api/help/posts
// ─────────────────────────────────────────────
export const offersApi = {
  list: (category?: ServiceCategory | string ) => {
    const qs = category ? `?category=${category}` : '';
    return request<Offer[]>(`/help/posts${qs}`);
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
  // Apply to a post (creates an application)
  create: (body: CreateRequestRequest) =>
    request<HelpRequest>(`/applications/apply/${body.offerId}`, {
      method: 'POST',
      body: JSON.stringify({ message: body.message }),
    }),

  // Accept an application
  accept: (id: string) =>
    request<HelpRequest>(`/applications/${id}/accept`, { method: 'PATCH' }),

  // Reject / cancel an application
  reject: (id: string) =>
    request<void>(`/applications/${id}/cancel`, { method: 'DELETE' }),

  // Complete action — backend has no explicit applications/complete endpoint in the list;
  // map to accept as a placeholder (adjust if you have a dedicated complete endpoint).
  complete: (id: string) =>
    request<HelpRequest>(`/applications/${id}/accept`, { method: 'PATCH' }),

  // Utility: list applicants for a post
  getApplicantsForPost: (postId: string) =>
    request<HelpRequest[]>(`/applications/post/${postId}`),
};

// ─────────────────────────────────────────────
// Feedback API  –  /api/feedback
// ─────────────────────────────────────────────
export const feedbackApi = {
  // Backend expects postId in path: /api/feedback/submit/{postId}
  submit: (body: CreateFeedbackRequest) =>
    request<Feedback>(`/feedback/submit/${body.postId}`, {
      method: 'POST',
      body: JSON.stringify({ rating: body.rating, comment: body.comment }),
    }),
};
