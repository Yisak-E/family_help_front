// services/api.ts
// Central API client for FamilyHelpUAE Spring Boot backend

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8443/api';
import { 
  AuthResponse, LoginRequest, RegisterRequest, LeaderboardResponse,
  CommunityPost, CreateHelpRequest, HelpFeedQuery, PostApplication,
  CreateApplicationRequest, FeedbackResponse, SubmitFeedbackRequest,
  UserDetail, FamilyDetail, CalendarEventDto
} from './types';

// Re-export types for convenience
export type {
  AuthResponse, LoginRequest, RegisterRequest, LeaderboardResponse,
  CommunityPost, CreateHelpRequest, HelpFeedQuery, PostApplication,
  CreateApplicationRequest, FeedbackResponse, SubmitFeedbackRequest,
  UserDetail, FamilyDetail, CalendarEventDto
};
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
  postType?: 'OFFER' | 'SEEK' | string;
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
/**
 * Auth Controller
 * Handles user registration, login, and administrative user/family lookups.
 */
export const authApi = {
  /**
   * POST /api/auth/signup
   * Register a new user with family details
   */
  register: (body: RegisterRequest) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * POST /api/auth/login
   * Authenticate a user with email and password
   */
  login: (body: LoginRequest) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * POST /api/auth/refress (note: backend spelling is 'refress')
   * Refresh the authentication token
   */
  refresh: (refreshToken: string) =>
    request<AuthResponse>('/auth/refress', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  /**
   * GET /api/auth/allUser
   * (Admin) Retrieve all registered users with roles, family details, and account status
   */
  getAllUsers: () =>
    request<UserDetail[]>('/auth/allUser'),

  /**
   * GET /api/auth/allFamily
   * (Admin) Retrieve all registered families
   */
  getAllFamilies: () =>
    request<FamilyDetail[]>('/auth/allFamily'),
};

// ─────────────────────────────────────────────
// Family Controller API  –  /api/families
// ─────────────────────────────────────────────
/**
 * Family Controller
 * Manages family profiles and information
 */
export const familiesApi = {
  /**
   * GET /api/families/{id}
   * Get a family's profile by ID
   */
  getProfile: (id: string | number) =>
    request<FamilyProfile>(`/families/${id}`),

  /**
   * PUT /api/families/{id}
   * Update a family's profile
   */
  updateProfile: (id: string, body: UpdateProfileRequest) =>
    request<FamilyProfile>(`/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  /**
   * GET /api/help/my-activity
   * Get the current user/family's activity history
   */
  getHistory: () =>
    request<HistoryEntry[]>(`/help/my-activity`),
};

// ─────────────────────────────────────────────
// Rewards API  –  /api/rewards
// ─────────────────────────────────────────────
/**
 * Reward Controller
 * Handles gamification and trust score leaderboards
 */
export const rewardsApi = {
  /**
   * GET /api/rewards/leaderboard
   * Get the global trust score leaderboard
   */
  getLeaderboard: () =>
    request<LeaderboardResponse[]>('/rewards/leaderboard'),

  /**
   * GET /api/rewards/mine/{familyId}
   * Get rewards/trust score for a specific family
   */
  getMine: (familyId: string | number) =>
    request<LeaderboardResponse>(`/rewards/mine/${familyId}`),
};

// ─────────────────────────────────────────────
// Calendar API  –  /api/calendar
// ─────────────────────────────────────────────
/**
 * Calendar Controller
 * Manages scheduled events and interactions
 */
export const calendarApi = {
  /**
   * GET /api/calendar/weekly
   * Get weekly scheduled events for the current family
   */
  getWeekly: () =>
    request<CalendarEventDto[]>('/calendar/weekly'),
};

// ─────────────────────────────────────────────
// Help & Tasks API  –  /api/help
// ─────────────────────────────────────────────
/**
 * Task & Help Controller
 * Used for managing help requests, viewing feeds, and tracking personal activity.
 * Endpoints for SEEK (help needed) and OFFER (willing to help) posts.
 */
export const helpApi = {
  /**
   * POST /api/help
   * Create a new help request (SEEK or OFFER)
   */
  createRequest: (body: CreateHelpRequest) =>
    request<CommunityPost>('/help', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * PATCH /api/help/{taskId}/complete
   * Mark a task as complete
   */
  completeTask: (taskId: number) =>
    request<string>(`/help/${taskId}/complete`, { method: 'PATCH' }),

  /**
   * GET /api/help/{taskId}
   * Get full task/post details by ID
   */
  getTaskById: (taskId: number) =>
    request<CommunityPost>(`/help/${taskId}`),

  /**
   * GET /api/help/feed
   * View the help feed with optional filters
   * @param query - Optional filters: type, category, status
   */
  getFeed: (query?: HelpFeedQuery) => {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.category) params.append('category', query.category);
    if (query?.status) params.append('status', query.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<CommunityPost[]>(`/help/feed${qs}`);
  },

  /**
   * GET /api/help/posts
   * Get help posts (SEEK/OFFER) with optional type filter
   */
  getPosts: (type?: string) => {
    const qs = type ? `?type=${type}` : '';
    return request<CommunityPost[]>(`/help/posts${qs}`);
  },

  /**
   * POST /api/help/posts
   * Create a help post (SEEK or OFFER)
   */
  createPost: (body: CreateHelpRequest) =>
    request<CommunityPost>('/help/posts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * GET /api/help/my-activity
   * Get the current user's activity/interaction history
   */
  getMyActivity: () =>
    request<CommunityPost[]>('/help/my-activity'),

  /**
   * DELETE /api/help/{taskId}
   * Delete a help post owned by the current family
   */
  deletePost: (postId: number) =>
    request<void>(`/help/${postId}`, {
      method: 'DELETE',
    }),
};

// ─────────────────────────────────────────────
// Legacy Exports (maintain backward compatibility)
// ─────────────────────────────────────────────

/** @deprecated Use helpApi.createPost() and helpApi.getPosts() for modern usage */
export const offersApi = {
  list: (category?: ServiceCategory | string) => {
    const qs = category ? `?category=${category}` : '';
    return request<Offer[]>(`/help/posts${qs}`);
  },

  create: (body: CreateOfferRequest) =>
    request<Offer>('/help/posts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

/** @deprecated Use applicationsApi instead */
export const requestsApi = {
  /**
   * Legacy: Apply to a post via offerId
   * Maps to: POST /api/applications/apply/{postId}
   */
  create: (body: { offerId: string | number; message?: string }) =>
    request<PostApplication>(`/applications/apply/${body.offerId}`, {
      method: 'POST',
      body: JSON.stringify({ message: body.message }),
    }),

  /**
   * Legacy: Accept an application
   * Maps to: PATCH /api/applications/{applicationId}/accept
   */
  accept: (id: string | number) =>
    request<PostApplication>(`/applications/${id}/accept`, { method: 'PATCH' }),

  /**
   * Legacy: Reject/cancel an application
   * Maps to: DELETE /api/applications/{applicationId}/cancel
   */
  reject: (id: string | number) =>
    request<void>(`/applications/${id}/cancel`, { method: 'DELETE' }),

  /**
   * Legacy: Get applications for a post
   * Maps to: GET /api/applications/post/{postId}
   */
  getApplicantsForPost: (postId: string | number) =>
    request<PostApplication[]>(`/applications/post/${postId}`),
};

// ─────────────────────────────────────────────
// Applications API  –  /api/applications
// ─────────────────────────────────────────────
/**
 * Application Controller
 * Manages the application process where families apply to help each other.
 */
export const applicationsApi = {
  /**
   * POST /api/applications/apply/{postId}
   * Apply to a specific post (become a helper/provider)
   */
  applyToPost: (postId: number, message?: string) =>
    request<PostApplication>(`/applications/apply/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  /**
   * PATCH /api/applications/{applicationId}/accept
   * Accept a help application
   */
  acceptApplication: (applicationId: number) =>
    request<PostApplication>(`/applications/${applicationId}/accept`, {
      method: 'PATCH',
    }),

  /**
   * GET /api/applications/post/{postId}
   * View all applications for a specific post
   */
  getApplicationsForPost: (postId: number) =>
    request<PostApplication[]>(`/applications/post/${postId}`),

  /**
   * DELETE /api/applications/{applicationId}/cancel
   * Cancel/reject an application
   */
  cancelApplication: (applicationId: number) =>
    request<void>(`/applications/${applicationId}/cancel`, {
      method: 'DELETE',
    }),
};

// ─────────────────────────────────────────────
// Feedback API  –  /api/feedback
// ─────────────────────────────────────────────
/**
 * Feedback Controller
 * Manages ratings and feedback for completed interactions
 */
export const feedbackApi = {
  /**
   * POST /api/feedback/submit/{postId}
   * Submit a rating/feedback for a completed post
   * @param postId - The post ID to rate
   * @param rating - Numeric rating (1-5 typically)
   * @param comment - Optional text feedback
   */
  submitFeedback: (postId: number, rating: number, comment?: string) =>
    request<FeedbackResponse>(`/feedback/submit/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),
};
