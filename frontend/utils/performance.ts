// Performance Utilities

/**
 * Debounce function - delays execution until user stops typing
 * Use for search inputs to reduce API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function - limits execution frequency
 * Use for scroll events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Measure performance of a function
 */
export const measurePerformance = (name: string, fn: () => any) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (__DEV__) {
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
};

/**
 * Memory cache for frequently accessed data
 */
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes default

  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.ttl),
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();

/**
 * Compress image before upload
 */
export const compressImageUri = async (uri: string): Promise<string> => {
  // This would use expo-image-manipulator in real implementation
  // For now, return as-is
  return uri;
};

/**
 * Check if device is low-end
 */
export const isLowEndDevice = (): boolean => {
  // Simple heuristic - can be improved
  const { width, height } = require('react-native').Dimensions.get('window');
  return width < 720 || height < 1280;
};

/**
 * Get optimized image quality based on device
 */
export const getImageQuality = (): number => {
  return isLowEndDevice() ? 0.5 : 0.8;
};
