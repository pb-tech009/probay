// Colors - Same as mobile app
export const Colors = {
  background: '#0A0A0C',
  surface: '#141418',
  card: '#1A1A1F',
  cardHover: '#222228',
  border: '#2A2A32',
  borderLight: '#3A3A44',

  gold: '#D4AF37',
  goldLight: '#E8C84A',
  goldDark: '#B8941F',
  goldMuted: 'rgba(212, 175, 55, 0.12)',

  teal: '#0D9488',
  tealLight: '#14B8A6',
  tealMuted: 'rgba(13, 148, 136, 0.12)',

  green: '#22C55E',
  greenMuted: 'rgba(34, 197, 94, 0.12)',

  orange: '#F59E0B',
  orangeMuted: 'rgba(245, 158, 11, 0.12)',

  red: '#EF4444',
  redMuted: 'rgba(239, 68, 68, 0.12)',

  blue: '#3B82F6',
  blueMuted: 'rgba(59, 130, 246, 0.12)',

  white: '#FFFFFF',
  textPrimary: '#F5F5F7',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textDark: '#4B5563',

  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// API Configuration
export const API_BASE_URL = 'http://13.126.96.223:5000/api';

export const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Remove /api from image URLs since uploads are served from root
  return `http://13.126.96.223:5000${path}`;
};
