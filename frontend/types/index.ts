export interface User {
  _id: string;
  phoneNumber: string;
  role: 'owner' | 'tenant' | 'none';
  name: string;
  profileImage: string;
  followers: string[];
  following: string[];
  savedProperties: string[];
  avgResponseTime: number;
  totalResponses: number;
  fastResponseCount: number;
  trustScore: number;
  fcmToken: string;
  createdAt: string;
}

export interface PropertyOwner {
  _id: string;
  phoneNumber: string;
  name: string;
  profileImage: string;
  avgResponseTime?: number;
  fastResponseCount?: number;
  totalResponses?: number;
}

export interface Review {
  user: string;
  safetyRating: number;
  waterRating: number;
  trafficRating: number;
  comment: string;
  createdAt: string;
}

export interface Property {
  _id: string;
  title: string;
  type: string;
  isDirectOwner: boolean;
  brokerageAmount: number;
  owner: PropertyOwner;
  images: string[];
  price: number;
  bhkType: string;
  furnishingStatus: string;
  amenities: string[];
  city: string;
  area: string;
  societyName: string;
  nearbyColleges: string[];
  pgRating: number;
  videoUrl?: string;
  isVerified: boolean;
  areaAverageRent: number;
  negotiationEnabled: boolean;
  genderPreference: string;
  professionPreference?: string;
  reviews: Review[];
  status: 'Rent' | 'Sell';
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  description?: string;
  features: string[];
  likes: string[];
  isAvailable: boolean;
  isStudentFriendly: boolean;
  roommateNeeded: boolean;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  viewCount: number;
  uniqueViewers: string[];
  isFeatured: boolean;
  featuredUntil?: string;
  featuredPriority: number;
}

export interface Chat {
  _id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
}

export interface Message {
  _id?: string;
  sender: string | { _id: string; name: string; profileImage: string };
  receiver: string | { _id: string; name: string; profileImage: string };
  text: string;
  createdAt?: string;
}

export interface PropertyFilters {
  type?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
  bhkType?: string;
  furnishingStatus?: string;
  city?: string;
  area?: string;
  search?: string;
  isStudentFriendly?: string;
  roommateNeeded?: string;
}

export interface PropertiesResponse {
  properties: Property[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}

export interface Lead {
  _id: string;
  property: string | Property;
  tenant: string | User;
  owner: string | User;
  budget: number;
  moveInDate: string;
  familyType: 'bachelor' | 'family' | 'couple';
  jobType: 'student' | 'working' | 'business' | 'other';
  priority: 'hot' | 'warm' | 'casual';
  status: 'new' | 'contacted' | 'interested' | 'not_interested' | 'closed' | 'expired';
  contactUnlocked: boolean;
  unlockedAt?: string;
  ownerResponded: boolean;
  responseTime?: number;
  respondedAt?: string;
  ownerNotes: string;
  tenantNotes: string;
  finalRent?: number;
  deposit?: number;
  daysToClose?: number;
  createdAt: string;
  updatedAt: string;
}
