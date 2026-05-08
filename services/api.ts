import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8443/api';
const REQUEST_TIMEOUT_MS = 12000;
import { 
  AuthResponse, LoginRequest, RegisterRequest, LeaderboardResponse,
  CommunityPost, CreateHelpRequest, HelpFeedQuery, PostApplication,
  CreateApplicationRequest, FeedbackResponse, SubmitFeedbackRequest,
  UserDetail, FamilyDetail, CalendarEventDto, FamilyProfile,
  UpdateProfileRequest, ServiceCategory, Offer, CreateOfferRequest,
  CreatePostRequest, RequestStatus, HelpRequest,
  CreateRequestRequest, Feedback, CreateFeedbackRequest, HistoryEntry,
  My_ActivityEntry, PagedResponse
} from './types';
export type {
  AuthResponse, LoginRequest, RegisterRequest, LeaderboardResponse,
  CommunityPost, CreateHelpRequest, HelpFeedQuery, PostApplication,
  CreateApplicationRequest, FeedbackResponse, SubmitFeedbackRequest,
  UserDetail, FamilyDetail, CalendarEventDto,
  FamilyProfile, UpdateProfileRequest, ServiceCategory, Offer,
  CreateOfferRequest, CreatePostRequest, RequestStatus, HelpRequest,
  CreateRequestRequest, Feedback, CreateFeedbackRequest, HistoryEntry,
  My_ActivityEntry, PagedResponse
};

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: REQUEST_TIMEOUT_MS,
});

function getMessageFromError(error: AxiosError): string {
  if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
    return `Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`;
  }
  const data = error.response?.data as { message?: string } | undefined;
  return data?.message || error.message || 'Something went wrong';
}

function resolveRefreshedTokens(payload: unknown): { access?: string; refresh?: string } {
  const direct = payload as { accessToken?: string; refreshToken?: string } | undefined;
  if (direct?.accessToken || direct?.refreshToken) {
    return { access: direct.accessToken, refresh: direct.refreshToken };
  }

  const wrapped = payload as { data?: { accessToken?: string; refreshToken?: string } } | undefined;
  return {
    access: wrapped?.data?.accessToken,
    refresh: wrapped?.data?.refreshToken,
  };
}

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post<AuthResponse>(
            `${BASE_URL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const tokens = resolveRefreshedTokens(refreshResponse.data);
          if (!tokens.access) throw new Error('Missing access token in refresh response');

          localStorage.setItem('accessToken', tokens.access);
          if (tokens.refresh) localStorage.setItem('refreshToken', tokens.refresh);

          original.headers.Authorization = `Bearer ${tokens.access}`;
          return api(original);
        } catch {
          clearTokens();
          if (typeof window !== 'undefined') window.location.href = '/';
        }
      } else {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/';
      }
    }

    if (error.response?.status !== 401) {
      toast.error(getMessageFromError(error));
    }
    return Promise.reject(error);
  }
);
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
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('familyId');
}

export function getFamilyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('familyId');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const axiosConfig = {
    url: path,
    method,
    headers: options.headers as Record<string, string> | undefined,
    data: options.body,
    timeout: REQUEST_TIMEOUT_MS,
  };
  return api.request<T>(axiosConfig) as unknown as T;
}

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
  getAllUsers: () =>
    request<UserDetail[]>('/auth/allUser'),
  getAllFamilies: () =>
    request<FamilyDetail[]>('/auth/allFamily'),
};

export const familiesApi = {
  getProfile: (id: string | number) =>
    request<FamilyProfile>(`/families/${id}`),
  updateProfile: (id: string, body: UpdateProfileRequest) =>
    request<FamilyProfile>(`/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  getHistory: () =>
    request<HistoryEntry[]>(`/help/my-activity`),
};

export const rewardsApi = {
  getLeaderboard: () =>
    request<LeaderboardResponse[]>('/rewards/leaderboard'),
  getMine: (familyId: string | number) =>
    request<LeaderboardResponse>(`/rewards/mine/${familyId}`),
};

export const calendarApi = {
  getWeekly: () =>
    request<CalendarEventDto[]>('/calendar/weekly'),
};

export const helpApi = {
  createRequest: (body: CreateHelpRequest) =>
    request<CommunityPost>('/help', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  completeTask: (taskId: number) =>
    request<string>(`/help/${taskId}/complete`, { method: 'PATCH' }),
  getTaskById: (taskId: number) =>
    request<CommunityPost>(`/help/${taskId}`),
  getFeed: (query?: HelpFeedQuery) => {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.category) params.append('category', query.category);
    if (query?.status) params.append('status', query.status);
    if (query?.page !== undefined) params.append('page', String(query.page));
    if (query?.size !== undefined) params.append('size', String(query.size));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<PagedResponse<CommunityPost>>(`/help/posts/ranged${qs}`);
  },
  getPosts: (type?: string) => {
    const qs = type ? `?type=${type}` : '';
    return request<CommunityPost[]>(`/help/posts${qs}`);
  },
  createPost: (body: CreateHelpRequest) =>
    request<CommunityPost>('/help/posts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getMyActivity: () =>
    request<CommunityPost[]>('/help/my-activity'),
  deletePost: (postId: number) =>
    request<void>(`/help/${postId}`, {
      method: 'DELETE',
    }),
};

export const applicationsApi = {
  applyToPost: (postId: number, message?: string) =>
    request<PostApplication>(`/applications/apply/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  acceptApplication: (applicationId: number) =>
    request<PostApplication>(`/applications/${applicationId}/accept`, {
      method: 'PATCH',
    }),
  getApplicationsForPost: (postId: number) =>
    request<PostApplication[]>(`/applications/post/${postId}`),
  cancelApplication: (applicationId: number) =>
    request<void>(`/applications/${applicationId}/cancel`, {
      method: 'DELETE',
    }),
};

export const feedbackApi = {
  submitFeedback: (postId: number, rating: number, comment?: string) =>
    request<FeedbackResponse>(`/feedback/submit/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),
};

export default api;
