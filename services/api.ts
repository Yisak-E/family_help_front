// services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8443';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- Offers ---
  async getOffers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/help/search?type=OFFER`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch offers');
    return response.json();
  },

  async createOffer(offer: { familyName: string, serviceCategory: string, description: string, status: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/help/offer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(offer),
    });
    if (!response.ok) throw new Error('Failed to create offer');
    return response.json();
  },

  // --- Help Requests ---
  async getHelpRequests(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/help/search?type=REQUEST`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch help requests');
    return response.json();
  },

  async createHelpRequest(request: { familyName: string, category: string, details: string, urgent: string, status: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/help/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to create help request');
    return response.json();
  },

  // --- My Activity (Combined Offers & Requests) ---
  async getMyActivities(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/help/my-activity`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  // --- Tasks / Interactions ---
  async acceptTask(helpId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/accept/${helpId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to accept task');
    return response.json();
  },

  async completeTask(taskId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  },

  async cancelTask(taskId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/cancel`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to cancel task');
    return response.json();
  },

  // --- Feedback ---
  async getFeedbackForFamily(familyId: string | number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/feedback/family/${familyId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  async createFeedback(feedback: { taskId: string, reviewerFamilyName: string, rating: number, comment: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/feedback/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feedback),
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  },

  // --- Rewards & Leaderboard ---
  async getLeaderboard(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/rewards/leaderboard`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  // ==========================================
  // FAMILIES & PROFILES
  // ==========================================
  
  // Uses /api/families/{familyId}
  async getFamilyProfile(familyId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/families/${familyId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch family profile');
    return response.json();
  }
};