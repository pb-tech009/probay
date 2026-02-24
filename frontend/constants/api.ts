export const API_BASE_URL = 'http://10.32.8.253:5000/api';
export const SERVER_URL = 'http://10.32.8.253:5000';

export function getImageUrl(path: string): string {
  if (!path) return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=600&auto=format&fit=crop';
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path}`;
}
