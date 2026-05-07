
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
  type?: 'OFFER' | 'SEEK' | string;
  category?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | string;
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