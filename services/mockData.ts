export interface HelpOffer {
  id: string;
  familyName: string;
  serviceCategory: 'childcare' | 'tutoring' | 'transport' | 'elder-support' | 'household';
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  familyName: string;
  type: 'childcare' | 'tutoring' | 'transport' | 'elder-support' | 'household';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  neededBy: string;
  createdAt: string;
  status?: 'open' | 'matched' | 'closed';
}

export interface TaskTransaction {
  id: string;
  offerId: string;
  requestId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  fromFamilyName: string;
  toFamilyName: string;
  taskId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Family {
  id: string;
  familyName: string;
  email: string;
  address: string;
  reputationScore: number;
  completedInteractions: number;
}

export interface User {
  id: string;
  familyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
}

export const mockFamilies: Family[] = [
  { id: '1', familyName: 'Smith Family', email: 'smith@example.com', address: 'Dubai Marina, Dubai', reputationScore: 4.5, completedInteractions: 12 },
  { id: '2', familyName: 'Ahmed Family', email: 'ahmed@example.com', address: 'Al Barsha, Dubai', reputationScore: 4.8, completedInteractions: 18 },
  { id: '3', familyName: 'Johnson Family', email: 'johnson@example.com', address: 'Jumeirah, Dubai', reputationScore: 4.3, completedInteractions: 9 },
  { id: '4', familyName: 'Khan Family', email: 'khan@example.com', address: 'Downtown Dubai, Dubai', reputationScore: 4.9, completedInteractions: 25 }
];

export const mockOffers: HelpOffer[] = [
  { id: '1', familyName: 'Ahmed Family', serviceCategory: 'childcare', title: 'After-school childcare', description: 'Can watch children ages 5-10 after school hours (3-6 PM). Have experience with multiple kids.', status: 'available', createdAt: '2026-04-20T10:00:00Z' },
  { id: '2', familyName: 'Johnson Family', serviceCategory: 'tutoring', title: 'Math and Science tutoring', description: 'Professional teacher offering tutoring for grades 6-12 in Mathematics and Science subjects.', status: 'available', createdAt: '2026-04-22T14:30:00Z' },
  { id: '3', familyName: 'Khan Family', serviceCategory: 'transport', title: 'School pickup and drop-off', description: 'Can provide rides to/from school in Downtown and Marina areas. Safe driver with family car.', status: 'available', createdAt: '2026-04-23T08:15:00Z' },
  { id: '4', familyName: 'Ahmed Family', serviceCategory: 'elder-support', title: 'Companion for elderly parents', description: 'Can spend time with elderly family members, help with daily activities, and provide companionship.', status: 'available', createdAt: '2026-04-24T11:00:00Z' },
  { id: '5', familyName: 'Johnson Family', serviceCategory: 'household', title: 'Home organization help', description: 'Professional organizer willing to help with decluttering, organizing spaces, and home projects.', status: 'available', createdAt: '2026-04-25T16:45:00Z' }
];

export const mockRequests: TaskTransaction[] = [
  { id: '1', offerId: '1', requestId: '1', status: 'accepted', createdAt: '2026-04-21T09:00:00Z', updatedAt: '2026-04-22T12:00:00Z' },
  { id: '2', offerId: '2', requestId: '2', status: 'accepted', createdAt: '2026-04-15T13:00:00Z', updatedAt: '2026-04-26T18:00:00Z' },
  { id: '3', offerId: '3', requestId: '3', status: 'accepted', createdAt: '2026-04-26T14:20:00Z', updatedAt: '2026-04-26T14:20:00Z' }
];

export const mockFeedback: Feedback[] = [
  { id: '1', fromFamilyName: 'Smith Family', toFamilyName: 'Johnson Family', taskId: '1', rating: 5, comment: 'Excellent tutoring! My son improved his grades significantly. Very professional and patient.', createdAt: '2026-04-26T19:00:00Z' },
  { id: '2', fromFamilyName: 'Smith Family', toFamilyName: 'Ahmed Family', taskId: '2', rating: 5, comment: 'Very reliable and caring. My daughter loves spending time with them!', createdAt: '2026-04-23T17:30:00Z' }
];

export const mockHelpRequestPosts: HelpRequest[] = [
  { id: '1', familyName: 'Smith Family', type: 'childcare', title: 'Need childcare for weekend event', description: 'Looking for someone to watch our 6-year-old twins this Saturday from 2-8 PM while we attend a family wedding.', urgency: 'high', neededBy: 'April 30, 2026', createdAt: '2026-04-26T10:00:00Z' },
  { id: '2', familyName: 'Johnson Family', type: 'transport', title: 'School pickup help needed', description: 'Need someone to pick up my daughter from school on May 2nd and 3rd. School is in Dubai Marina area.', urgency: 'medium', neededBy: 'May 2, 2026', createdAt: '2026-04-25T14:30:00Z' },
  { id: '3', familyName: 'Ahmed Family', type: 'household', title: 'Moving help required', description: 'Moving to a new apartment next week. Need help with packing and organizing. Heavy lifting not required, just assistance with boxes.', urgency: 'medium', neededBy: 'May 5, 2026', createdAt: '2026-04-24T09:15:00Z' },
  { id: '4', familyName: 'Khan Family', type: 'elder-support', title: 'Companion for elderly mother', description: 'My mother needs companionship while I am at work next Tuesday and Wednesday. Just someone to sit with her, chat, and ensure she takes her medication.', urgency: 'low', neededBy: 'May 6, 2026', createdAt: '2026-04-23T16:45:00Z' },
  { id: '5', familyName: 'Smith Family', type: 'tutoring', title: 'Urgent: English essay help', description: 'My daughter has an important English essay due Friday. Need someone experienced to help review and provide feedback.', urgency: 'high', neededBy: 'April 28, 2026', createdAt: '2026-04-27T08:00:00Z' }
];