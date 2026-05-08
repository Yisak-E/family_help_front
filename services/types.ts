
// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  familyName: string;
  trustScore?: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  role:string;
  familyName: string;
  email: string;
  password: string;
  address: string;
  familySize: number;
}



export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token?: string;

  familyId: String;
  familyName: string;
  trustScore: number;
}



// Leaderboard / trust score
export interface LeaderboardResponse {
  familyName: string;
  trustScore: number;
  completedInteractions: number;
  lastActive?: string;
}

// ─────────────────────────────────────────────
// Help & Task Related Types
// ─────────────────────────────────────────────
export interface CommunityPost {
  id: number;
  postType: 'OFFER' | 'SEEK' | string;
  title: string;
  category: string;
  description: string;
  urgency?: string;
  neededBy?: string; // ISO datetime
  availability?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | string;
  family: {
    id: number;
    familyName: string;
    address?: string;
    familySize?: number;
    trustScore?: number;
    completedInteractions?: number;
    cancelledInteractions?: number;
    email?: string;
    lastActive?: string;
  };
  trustScore?: number;
  applicationCount?: number;
  createdAt?: string;
}

export interface CreateHelpRequest {
  postType: 'OFFER' | 'SEEK' | string;
  title: string;
  category: string;
  description: string;
  urgency?: string;
  neededBy?: string; // ISO datetime
  availability?: string;
}

export interface HelpFeedQuery {
  type?: string;
  category?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface PageSortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableInfo {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
  sort: PageSortInfo;
}

export interface PagedResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableInfo;
  size: number;
  sort: PageSortInfo;
  totalElements: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// Application Types
// ─────────────────────────────────────────────
export interface PostApplication {
  id: number;
  post: CommunityPost;
  applicantFamily: {
    id: number;
    familyName: string;
    address?: string;
    familySize?: number;
    trustScore?: number;
    email?: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
  applicationMessage?: string;
  createdAt?: string;
}

export interface CreateApplicationRequest {
  postId: number;
  message?: string;
}

// ─────────────────────────────────────────────
// Feedback Types
// ─────────────────────────────────────────────
export interface FeedbackResponse {
  id: number;
  postId: number;
  fromFamilyId: number;
  fromFamilyName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface SubmitFeedbackRequest {
  postId: number;
  rating: number;
  comment: string;
}

// ─────────────────────────────────────────────
// User & Family Admin Types
// ─────────────────────────────────────────────
export interface UserDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  family: {
    id: number;
    familyName: string;
    address?: string;
    familySize?: number;
    trustScore?: number;
  };
  enabled: boolean;
  locked: boolean;
  createdAt?: string;
}

export interface FamilyDetail {
  id: number;
  familyName: string;
  address?: string;
  familySize?: number;
  trustScore?: number;
  completedInteractions?: number;
  cancelledInteractions?: number;
  email?: string;
  lastActive?: string;
}

// ─────────────────────────────────────────────
// Calendar Event Types
// ─────────────────────────────────────────────
export interface CalendarEventDto {
  postId: number;
  title: string;
  category: string;
  scheduledTime: string; // ISO datetime
  status: string;
  otherFamilyName?: string;
}

// ─────────────────────────────────────────────
// API Model Types (moved from api.ts)
// ─────────────────────────────────────────────
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
  status: string;
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