import React, { memo } from 'react';
import { FlatList, FlatListProps } from 'react-native';

/**
 * Optimized FlatList Component
 * - Pre-configured with performance optimizations
 * - Smooth scrolling at 60 FPS
 * - Memory efficient
 */
function OptimizedList<T>(props: FlatListProps<T>) {
  return (
    <FlatList
      {...props}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={5}
      
      // Improve scroll performance
      scrollEventThrottle={16}
      
      // Memory optimization
      getItemLayout={
        props.getItemLayout ||
        (props.itemHeight
          ? (data, index) => ({
              length: props.itemHeight!,
              offset: props.itemHeight! * index,
              index,
            })
          : undefined)
      }
    />
  );
}

export default memo(OptimizedList) as typeof OptimizedList;

/**
 * Usage Example:
 * 
 * <OptimizedList
 *   data={properties}
 *   renderItem={({ item }) => <PropertyCard property={item} />}
 *   keyExtractor={(item) => item._id}
 *   itemHeight={200}  // Optional: for better performance
 * />
 */
