import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import OptimizedImage from './OptimizedImage';

interface Property {
  _id: string;
  title: string;
  price: number;
  city: string;
  area: string;
  images: string[];
  type: string;
  status: string;
  bhkType?: string;
}

interface PropertyCardProps {
  property: Property;
  onPress: (id: string) => void;
}

/**
 * Memoized Property Card Component
 * - Only re-renders when property data changes
 * - Optimized image loading
 * - Fast touch response
 */
const PropertyCard: React.FC<PropertyCardProps> = memo(
  ({ property, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(property._id)}
        activeOpacity={0.7}
      >
        <OptimizedImage
          source={{ uri: property.images[0] }}
          style={styles.image}
          contentFit="cover"
          priority="normal"
        />
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {property.title}
          </Text>
          
          <View style={styles.row}>
            <Text style={styles.price}>
              ₹{property.price.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.status}>{property.status}</Text>
          </View>
          
          <Text style={styles.location} numberOfLines={1}>
            📍 {property.area}, {property.city}
          </Text>
          
          <View style={styles.tags}>
            <Text style={styles.tag}>{property.type}</Text>
            {property.bhkType && (
              <Text style={styles.tag}>{property.bhkType}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  // Custom comparison function - only re-render if these change
  (prevProps, nextProps) => {
    return (
      prevProps.property._id === nextProps.property._id &&
      prevProps.property.price === nextProps.property.price &&
      prevProps.property.title === nextProps.property.title
    );
  }
);

PropertyCard.displayName = 'PropertyCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  status: {
    fontSize: 12,
    color: '#FFA500',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  location: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});

export default PropertyCard;
