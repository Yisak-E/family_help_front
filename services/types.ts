
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