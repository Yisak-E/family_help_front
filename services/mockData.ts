export interface HelpOffer {
  id: string;
  familyId: string;
  familyName: string;
  type: 'childcare' | 'tutoring' | 'transport' | 'elder-support' | 'household';
  title: string;
  description: string;
  availability: string;
  createdAt: string;
}

export interface HelpRequestPost {
  id: string;
  familyId: string;
  familyName: string;
  type: 'childcare' | 'tutoring' | 'transport' | 'elder-support' | 'household';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  neededBy: string;
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  offerId: string;
  offerTitle: string;
  providerId: string;
  providerName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  fromFamilyId: string;
  fromFamilyName: string;
  toFamilyId: string;
  toFamilyName: string;
  requestId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Family {
  id: string;
  familyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  reputationScore: number;
  totalFeedback: number;
}

export const mockFamilies: Family[] = [
  {
    id: '1',
    familyName: 'Smith Family',
    contactPerson: 'John Smith',
    email: 'smith@example.com',
    phone: '+971-50-123-4567',
    address: 'Dubai Marina, Dubai',
    reputationScore: 4.5,
    totalFeedback: 12
  },
  {
    id: '2',
    familyName: 'Ahmed Family',
    contactPerson: 'Sara Ahmed',
    email: 'ahmed@example.com',
    phone: '+971-50-234-5678',
    address: 'Al Barsha, Dubai',
    reputationScore: 4.8,
    totalFeedback: 18
  },
  {
    id: '3',
    familyName: 'Johnson Family',
    contactPerson: 'Emily Johnson',
    email: 'johnson@example.com',
    phone: '+971-50-345-6789',
    address: 'Jumeirah, Dubai',
    reputationScore: 4.3,
    totalFeedback: 9
  },
  {
    id: '4',
    familyName: 'Khan Family',
    contactPerson: 'Ali Khan',
    email: 'khan@example.com',
    phone: '+971-50-456-7890',
    address: 'Downtown Dubai, Dubai',
    reputationScore: 4.9,
    totalFeedback: 25
  }
];

export const mockOffers: HelpOffer[] = [
  {
    id: '1',
    familyId: '2',
    familyName: 'Ahmed Family',
    type: 'childcare',
    title: 'After-school childcare',
    description: 'Can watch children ages 5-10 after school hours (3-6 PM). Have experience with multiple kids.',
    availability: 'Monday to Friday, 3-6 PM',
    createdAt: '2026-04-20T10:00:00Z'
  },
  {
    id: '2',
    familyId: '3',
    familyName: 'Johnson Family',
    type: 'tutoring',
    title: 'Math and Science tutoring',
    description: 'Professional teacher offering tutoring for grades 6-12 in Mathematics and Science subjects.',
    availability: 'Weekends, flexible hours',
    createdAt: '2026-04-22T14:30:00Z'
  },
  {
    id: '3',
    familyId: '4',
    familyName: 'Khan Family',
    type: 'transport',
    title: 'School pickup and drop-off',
    description: 'Can provide rides to/from school in Downtown and Marina areas. Safe driver with family car.',
    availability: 'Morning (7-9 AM) and Afternoon (2-4 PM)',
    createdAt: '2026-04-23T08:15:00Z'
  },
  {
    id: '4',
    familyId: '2',
    familyName: 'Ahmed Family',
    type: 'elder-support',
    title: 'Companion for elderly parents',
    description: 'Can spend time with elderly family members, help with daily activities, and provide companionship.',
    availability: 'Weekday mornings, 9 AM - 12 PM',
    createdAt: '2026-04-24T11:00:00Z'
  },
  {
    id: '5',
    familyId: '3',
    familyName: 'Johnson Family',
    type: 'household',
    title: 'Home organization help',
    description: 'Professional organizer willing to help with decluttering, organizing spaces, and home projects.',
    availability: 'Flexible schedule, weekdays preferred',
    createdAt: '2026-04-25T16:45:00Z'
  }
];

export const mockRequests: HelpRequest[] = [
  {
    id: '1',
    requesterId: '1',
    requesterName: 'Smith Family',
    offerId: '1',
    offerTitle: 'After-school childcare',
    providerId: '2',
    providerName: 'Ahmed Family',
    status: 'accepted',
    message: 'Would love help with after-school care for my 7-year-old daughter this week.',
    createdAt: '2026-04-21T09:00:00Z',
    updatedAt: '2026-04-21T10:30:00Z'
  },
  {
    id: '2',
    requesterId: '1',
    requesterName: 'Smith Family',
    offerId: '2',
    offerTitle: 'Math and Science tutoring',
    providerId: '3',
    providerName: 'Johnson Family',
    status: 'completed',
    message: 'My son needs help preparing for his final exams in Math.',
    createdAt: '2026-04-15T13:00:00Z',
    updatedAt: '2026-04-26T18:00:00Z'
  },
  {
    id: '3',
    requesterId: '4',
    requesterName: 'Khan Family',
    offerId: '5',
    offerTitle: 'Home organization help',
    providerId: '3',
    providerName: 'Johnson Family',
    status: 'pending',
    message: 'Need help organizing our storage room this weekend.',
    createdAt: '2026-04-26T14:20:00Z',
    updatedAt: '2026-04-26T14:20:00Z'
  }
];

export const mockFeedback: Feedback[] = [
  {
    id: '1',
    fromFamilyId: '1',
    fromFamilyName: 'Smith Family',
    toFamilyId: '3',
    toFamilyName: 'Johnson Family',
    requestId: '2',
    rating: 5,
    comment: 'Excellent tutoring! My son improved his grades significantly. Very professional and patient.',
    createdAt: '2026-04-26T19:00:00Z'
  },
  {
    id: '2',
    fromFamilyId: '1',
    fromFamilyName: 'Smith Family',
    toFamilyId: '2',
    toFamilyName: 'Ahmed Family',
    requestId: '1',
    rating: 5,
    comment: 'Very reliable and caring. My daughter loves spending time with them!',
    createdAt: '2026-04-23T17:30:00Z'
  }
];

export const mockHelpRequestPosts: HelpRequestPost[] = [
  {
    id: '1',
    familyId: '1',
    familyName: 'Smith Family',
    type: 'childcare',
    title: 'Need childcare for weekend event',
    description: 'Looking for someone to watch our 6-year-old twins this Saturday from 2-8 PM while we attend a family wedding.',
    urgency: 'high',
    neededBy: 'April 30, 2026',
    createdAt: '2026-04-26T10:00:00Z'
  },
  {
    id: '2',
    familyId: '3',
    familyName: 'Johnson Family',
    type: 'transport',
    title: 'School pickup help needed',
    description: 'Need someone to pick up my daughter from school on May 2nd and 3rd. School is in Dubai Marina area.',
    urgency: 'medium',
    neededBy: 'May 2, 2026',
    createdAt: '2026-04-25T14:30:00Z'
  },
  {
    id: '3',
    familyId: '2',
    familyName: 'Ahmed Family',
    type: 'household',
    title: 'Moving help required',
    description: 'Moving to a new apartment next week. Need help with packing and organizing. Heavy lifting not required, just assistance with boxes.',
    urgency: 'medium',
    neededBy: 'May 5, 2026',
    createdAt: '2026-04-24T09:15:00Z'
  },
  {
    id: '4',
    familyId: '4',
    familyName: 'Khan Family',
    type: 'elder-support',
    title: 'Companion for elderly mother',
    description: 'My mother needs companionship while I am at work next Tuesday and Wednesday. Just someone to sit with her, chat, and ensure she takes her medication.',
    urgency: 'low',
    neededBy: 'May 6, 2026',
    createdAt: '2026-04-23T16:45:00Z'
  },
  {
    id: '5',
    familyId: '1',
    familyName: 'Smith Family',
    type: 'tutoring',
    title: 'Urgent: English essay help',
    description: 'My daughter has an important English essay due Friday. Need someone experienced to help review and provide feedback.',
    urgency: 'high',
    neededBy: 'April 28, 2026',
    createdAt: '2026-04-27T08:00:00Z'
  }
];