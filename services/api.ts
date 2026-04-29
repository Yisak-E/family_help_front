const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8443';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- Community Posts ---
  async getPosts(postType?: string): Promise<any[]> {
    const url = postType && postType !== 'ALL'
      ? `${API_BASE_URL}/api/help/posts?type=${postType}`
      : `${API_BASE_URL}/api/help/posts`;
      
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  async createPost(postData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/help/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  async getMyActivities(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/help/my-activity`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  // --- Tasks / Interactions ---
  async acceptTask(postId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/accept/${postId}`, { method: 'POST', headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to accept task');
    return response.json();
  },

  async completeTask(taskId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/complete`, { method: 'PATCH', headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  },

  async cancelTask(taskId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/cancel`, { method: 'PATCH', headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to cancel task');
    return response.json();
  },

  // --- Feedback ---
  async getFeedbackForFamily(familyId: string | number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/feedback/family/${familyId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  async createFeedback(feedback: { postId: number; rating: number; comment: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/feedback/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feedback),
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  }
};