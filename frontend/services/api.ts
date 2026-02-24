import { API_BASE_URL } from '@/constants/api';
import { PropertiesResponse, PropertyFilters, User, Chat } from '@/types';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.log(`[API] Error ${response.status}:`, data);
    throw new Error(data.msg || data.message || 'Request failed');
  }

  console.log(`[API] Success:`, typeof data === 'object' ? JSON.stringify(data).slice(0, 200) : data);
  return data as T;
}

export const authAPI = {
  requestOtp: (phoneNumber: string) =>
    apiRequest<{ msg: string; isTest: boolean }>('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    }),

  verifyOtp: (phoneNumber: string, otp: string) =>
    apiRequest<{ token: string; user: User }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    }),

  selectRole: (userId: string, role: string) =>
    apiRequest<User>('/auth/select-role', {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),

  getProfile: (token: string) =>
    apiRequest<User>('/auth/profile', {}, token),

  updateProfile: (token: string, data: { name?: string; profileImage?: string }) =>
    apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  saveProperty: (token: string, propertyId: string) =>
    apiRequest<string[]>(`/auth/save-property/${propertyId}`, {
      method: 'POST',
    }, token),
};

export const propertyAPI = {
  getProperties: (filters: PropertyFilters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return apiRequest<PropertiesResponse>(`/property?${params.toString()}`);
  },

  getFeatured: (city?: string) => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    return apiRequest<PropertiesResponse>(`/property/featured?${params.toString()}`);
  },

  likeProperty: (token: string, propertyId: string) =>
    apiRequest<string[]>(`/property/like/${propertyId}`, {
      method: 'POST',
    }, token),

  trackView: (token: string, propertyId: string) =>
    apiRequest<{ viewCount: number }>(`/property/track-view/${propertyId}`, {
      method: 'POST',
    }, token),

  addReview: (token: string, propertyId: string, review: {
    safetyRating: number;
    waterRating: number;
    trafficRating: number;
    comment: string;
  }) =>
    apiRequest(`/property/review/${propertyId}`, {
      method: 'POST',
      body: JSON.stringify(review),
    }, token),
};

export const chatAPI = {
  getMyChats: (token: string) =>
    apiRequest<Chat[]>('/chat/my-chats', {}, token),

  startChat: (token: string, receiverId: string) =>
    apiRequest<Chat>('/chat/start-chat', {
      method: 'POST',
      body: JSON.stringify({ receiverId }),
    }, token),

  getMessages: (token: string, chatId: string) =>
    apiRequest(`/chat/messages/${chatId}`, {}, token),
};

export const notificationAPI = {
  getNotifications: (token: string, page = 1, limit = 20, unreadOnly = false) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (unreadOnly) params.append('unreadOnly', 'true');
    return apiRequest(`/notifications?${params.toString()}`, {}, token);
  },

  getUnreadCount: (token: string) =>
    apiRequest<{ count: number }>('/notifications/unread-count', {}, token),

  markAsRead: (token: string, notificationId: string) =>
    apiRequest(`/notifications/read/${notificationId}`, {
      method: 'PUT',
    }, token),

  markAllAsRead: (token: string) =>
    apiRequest('/notifications/read-all', {
      method: 'PUT',
    }, token),

  deleteNotification: (token: string, notificationId: string) =>
    apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    }, token),
};

export const socialAPI = {
  followUser: (token: string, userId: string) =>
    apiRequest(`/social/follow/${userId}`, {
      method: 'POST',
    }, token),

  getSocialStats: (token: string) =>
    apiRequest<{ followers: User[]; following: User[] }>('/social/social-stats', {}, token),
};

export const brokerAPI = {
  getDashboardStats: (token: string) =>
    apiRequest('/broker/dashboard/stats', {}, token),

  getTrends: (token: string) =>
    apiRequest('/broker/dashboard/trends', {}, token),

  getMissedLeads: (token: string) =>
    apiRequest('/broker/dashboard/missed-leads', {}, token),

  updateProfile: (token: string, data: { name?: string; profileImage?: string }) =>
    apiRequest('/broker/profile/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),
};

export const leadAPI = {
  createLead: (token: string, data: {
    propertyId: string;
    budget: number;
    moveInDate: string;
    familyType: 'bachelor' | 'family' | 'couple';
    jobType: 'student' | 'working' | 'business' | 'other';
    tenantNotes?: string;
  }) =>
    apiRequest('/lead/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  checkLeadStatus: (token: string, propertyId: string) =>
    apiRequest<{ hasLead: boolean; lead?: any }>(`/lead/check-status/${propertyId}`, {}, token),

  getMyInterests: (token: string, page = 1, limit = 20) =>
    apiRequest(`/lead/tenant/my-interests?page=${page}&limit=${limit}`, {}, token),
};
