import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface User {
  _id: string;
  phoneNumber: string;
  name: string;
  role: 'tenant' | 'owner' | 'none';
  profileImage?: string;
  trustScore?: number;
  avgResponseTime?: number;
}

export interface Property {
  _id: string;
  title: string;
  type: string;
  owner: User;
  images: string[];
  videoUrl?: string;
  price: number;
  status: 'Rent' | 'Sell';
  address: string;
  description?: string;
  bhkType?: string;
  furnishingStatus?: string;
  amenities: string[];
  city: string;
  area: string;
  societyName?: string;
  likes: string[];
  reviews: any[];
  isVerified: boolean;
  isFeatured: boolean;
  isExpired: boolean;
  createdAt: string;
}

export const authAPI = {
  requestOtp: async (phoneNumber: string) => {
    const { data } = await api.post('/auth/request-otp', { phoneNumber });
    return data;
  },
  verifyOtp: async (phoneNumber: string, otp: string) => {
    const { data } = await api.post('/auth/verify-otp', { phoneNumber, otp });
    return data;
  },
  selectRole: async (token: string, userId: string, role: string) => {
    const { data } = await api.post(
      '/auth/select-role',
      { userId, role },
      { headers: { 'x-auth-token': token } }
    );
    return data;
  },
};

export const propertyAPI = {
  getProperties: async (filters: any = {}, page = 1, limit = 10) => {
    const { data } = await api.get('/property', {
      params: { ...filters, page, limit },
    });
    return data;
  },
  getFeatured: async () => {
    const { data } = await api.get('/property/featured');
    return data;
  },
  getPropertyById: async (id: string) => {
    const { data } = await api.get(`/property/${id}`);
    return data;
  },
  likeProperty: async (token: string, id: string) => {
    const { data } = await api.post(
      `/property/like/${id}`,
      {},
      { headers: { 'x-auth-token': token } }
    );
    return data;
  },
  trackView: async (token: string, id: string) => {
    const { data } = await api.post(
      `/property/track-view/${id}`,
      {},
      { headers: { 'x-auth-token': token } }
    );
    return data;
  },
  createProperty: async (token: string, formData: FormData) => {
    const { data } = await api.post('/property/create', formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

export const leadAPI = {
  submitLead: async (token: string, propertyId: string, leadData: any) => {
    const { data } = await api.post(`/lead/submit/${propertyId}`, leadData, {
      headers: { 'x-auth-token': token },
    });
    return data;
  },
  checkLeadStatus: async (token: string, propertyId: string) => {
    const { data } = await api.get(`/lead/status/${propertyId}`, {
      headers: { 'x-auth-token': token },
    });
    return data;
  },
};

export const brokerAPI = {
  getDashboardStats: async (token: string) => {
    const { data } = await api.get('/broker/dashboard', {
      headers: { 'x-auth-token': token },
    });
    return data;
  },
};

export default api;
