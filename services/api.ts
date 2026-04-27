import { mockOffers, mockRequests, mockFeedback, mockFamilies, mockHelpRequestPosts, HelpOffer, HelpRequest, Feedback, Family, HelpRequestPost } from './mockData';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for simulated data
let offers: HelpOffer[] = [...mockOffers];
let requests: HelpRequest[] = [...mockRequests];
let feedback: Feedback[] = [...mockFeedback];
let families: Family[] = [...mockFamilies];
let helpRequestPosts: HelpRequestPost[] = [...mockHelpRequestPosts];

export const api = {
  // Offers
  async getOffers(): Promise<HelpOffer[]> {
    await delay(300);
    return [...offers];
  },

  async createOffer(offer: Omit<HelpOffer, 'id' | 'createdAt'>): Promise<HelpOffer> {
    await delay(400);
    const newOffer: HelpOffer = {
      ...offer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    offers.push(newOffer);
    return newOffer;
  },

  // Requests
  async getMyRequests(familyId: string): Promise<HelpRequest[]> {
    await delay(300);
    return requests.filter(r => r.requesterId === familyId || r.providerId === familyId);
  },

  async createRequest(request: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<HelpRequest> {
    await delay(400);
    const newRequest: HelpRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    requests.push(newRequest);
    return newRequest;
  },

  async acceptRequest(requestId: string): Promise<HelpRequest> {
    await delay(400);
    const request = requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    request.status = 'accepted';
    request.updatedAt = new Date().toISOString();
    return request;
  },

  async rejectRequest(requestId: string): Promise<HelpRequest> {
    await delay(400);
    const request = requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    request.status = 'rejected';
    request.updatedAt = new Date().toISOString();
    return request;
  },

  async completeRequest(requestId: string): Promise<HelpRequest> {
    await delay(400);
    const request = requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    request.status = 'completed';
    request.updatedAt = new Date().toISOString();
    return request;
  },

  // Feedback
  async getFeedbackForFamily(familyId: string): Promise<Feedback[]> {
    await delay(300);
    return feedback.filter(f => f.toFamilyId === familyId);
  },

  async createFeedback(newFeedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    await delay(400);
    const feedbackItem: Feedback = {
      ...newFeedback,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    feedback.push(feedbackItem);

    // Update reputation score
    const family = families.find(f => f.id === newFeedback.toFamilyId);
    if (family) {
      const familyFeedback = feedback.filter(f => f.toFamilyId === family.id);
      const avgRating = familyFeedback.reduce((sum, f) => sum + f.rating, 0) / familyFeedback.length;
      family.reputationScore = Math.round(avgRating * 10) / 10;
      family.totalFeedback = familyFeedback.length;
    }

    return feedbackItem;
  },

  // Families
  async getFamily(id: string): Promise<Family | undefined> {
    await delay(300);
    return families.find(f => f.id === id);
  },

  async updateFamily(id: string, updates: Partial<Family>): Promise<Family> {
    await delay(400);
    const family = families.find(f => f.id === id);
    if (!family) throw new Error('Family not found');
    Object.assign(family, updates);
    return family;
  },

  // History
  async getHistory(familyId: string): Promise<HelpRequest[]> {
    await delay(300);
    return requests.filter(
      r => (r.requesterId === familyId || r.providerId === familyId) && r.status === 'completed'
    );
  },

  // Help Request Posts
  async getHelpRequestPosts(): Promise<HelpRequestPost[]> {
    await delay(300);
    return [...helpRequestPosts];
  },

  async createHelpRequestPost(post: Omit<HelpRequestPost, 'id' | 'createdAt'>): Promise<HelpRequestPost> {
    await delay(400);
    const newPost: HelpRequestPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    helpRequestPosts.push(newPost);
    return newPost;
  }
};