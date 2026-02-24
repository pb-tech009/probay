import React, { memo } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: any;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: any;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Optimized Image Component
 * - Uses expo-image for better performance
 * - Automatic caching (memory + disk)
 * - Smooth transitions
 * - Placeholder support
 */
const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  priority = 'normal',
}) => {
  return (
    <ExpoImage
      source={source}
      style={style}
      contentFit={contentFit}
      transition={200}
      cachePolicy="memory-disk"
      priority={priority}
      placeholder={placeholder}
      placeholderContentFit="cover"
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

/**
 * Usage Example:
 * 
 * <OptimizedImage
 *   source={{ uri: property.images[0] }}
 *   style={styles.propertyImage}
 *   contentFit="cover"
 *   priority="high"
 * />
 */
