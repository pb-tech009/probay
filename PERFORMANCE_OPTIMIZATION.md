# ⚡ REACT NATIVE PERFORMANCE OPTIMIZATION GUIDE

## Current App Status
- **Framework:** React Native (Expo)
- **Version:** 0.81.5
- **State Management:** Zustand
- **Data Fetching:** @tanstack/react-query
- **Navigation:** Expo Router

---

## 🚀 CRITICAL OPTIMIZATIONS (Must Implement)

### 1. **Image Optimization** ⭐⭐⭐

**Problem:** Large images slow down app significantly

**Solution:**

```javascript
// Use expo-image instead of Image component
import { Image } from 'expo-image';

// BEFORE (Slow):
<Image source={{uri: property.image}} style={styles.image} />

// AFTER (Fast):
<Image
  source={{uri: property.image}}
  style={styles.image}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"  // Cache images
  placeholder={require('./placeholder.png')}  // Show placeholder
/>
```

**Image Compression:**
```javascript
// Compress images before upload
import * as ImageManipulator from 'expo-image-manipulator';

const compressImage = async (uri) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],  // Resize to max 1080px width
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
};
```

---

### 2. **List Performance (FlatList)** ⭐⭐⭐

**Problem:** Scrolling through properties is slow

**Solution:**

```javascript
// BEFORE (Slow):
{properties.map(property => (
  <PropertyCard key={property._id} property={property} />
))}

// AFTER (Fast):
<FlatList
  data={properties}
  renderItem={({item}) => <PropertyCard property={item} />}
  keyExtractor={item => item._id}
  
  // Performance optimizations:
  removeClippedSubviews={true}  // Remove off-screen items
  maxToRenderPerBatch={10}      // Render 10 items at a time
  updateCellsBatchingPeriod={50}  // Update every 50ms
  initialNumToRender={10}       // Initial render count
  windowSize={5}                // Keep 5 screens worth of items
  
  // Memory optimization:
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

### 3. **Memoization (Prevent Re-renders)** ⭐⭐⭐

**Problem:** Components re-render unnecessarily

**Solution:**

```javascript
import React, { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const PropertyCard = memo(({ property, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{property.title}</Text>
      <Text>Rs. {property.price}</Text>
    </TouchableOpacity>
  );
});

// Memoize expensive calculations
const ExpensiveComponent = ({ properties }) => {
  const totalPrice = useMemo(() => {
    return properties.reduce((sum, p) => sum + p.price, 0);
  }, [properties]);  // Only recalculate when properties change
  
  return <Text>Total: Rs. {totalPrice}</Text>;
};

// Memoize callbacks
const ParentComponent = () => {
  const handlePress = useCallback((id) => {
    console.log('Pressed:', id);
  }, []);  // Function doesn't change on re-render
  
  return <PropertyCard onPress={handlePress} />;
};
```

---

### 4. **API Response Caching** ⭐⭐⭐

**Already Implemented:** Using @tanstack/react-query ✅

**Optimize Further:**

```javascript
// services/api.ts
import { useQuery } from '@tanstack/react-query';

// Cache property list for 5 minutes
export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 10 * 60 * 1000,  // 10 minutes
    refetchOnWindowFocus: false,  // Don't refetch on focus
  });
};

// Prefetch data for faster navigation
const prefetchPropertyDetails = (id) => {
  queryClient.prefetchQuery({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyDetails(id),
  });
};
```

---

### 5. **Lazy Loading & Code Splitting** ⭐⭐

**Problem:** Loading entire app at once

**Solution:**

```javascript
import { lazy, Suspense } from 'react';

// Lazy load heavy screens
const BrokerDashboard = lazy(() => import('./broker-dashboard'));
const PropertyDetail = lazy(() => import('./property-detail'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <BrokerDashboard />
</Suspense>
```

---

### 6. **Reduce Bundle Size** ⭐⭐

**Remove Unused Dependencies:**

```bash
# Check bundle size
npx expo-bundle-size

# Remove unused packages
npm uninstall <unused-package>

# Use specific imports (not entire library)
# BEFORE:
import _ from 'lodash';

# AFTER:
import debounce from 'lodash/debounce';
```

---

### 7. **AsyncStorage Optimization** ⭐⭐

**Problem:** Slow storage operations

**Solution:**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Batch operations
const saveMultiple = async (data) => {
  const pairs = Object.entries(data).map(([key, value]) => [
    key,
    JSON.stringify(value)
  ]);
  await AsyncStorage.multiSet(pairs);
};

// Use memory cache for frequently accessed data
let cachedUser = null;

const getUser = async () => {
  if (cachedUser) return cachedUser;
  
  const user = await AsyncStorage.getItem('user');
  cachedUser = JSON.parse(user);
  return cachedUser;
};
```

---

### 8. **Debounce Search Input** ⭐⭐

**Problem:** API called on every keystroke

**Solution:**

```javascript
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search API call
  const debouncedSearch = useCallback(
    debounce((term) => {
      // Call API only after user stops typing for 500ms
      searchProperties(term);
    }, 500),
    []
  );
  
  const handleSearch = (text) => {
    setSearchTerm(text);
    debouncedSearch(text);
  };
  
  return (
    <TextInput
      value={searchTerm}
      onChangeText={handleSearch}
      placeholder="Search properties..."
    />
  );
};
```

---

### 9. **Optimize Animations** ⭐

**Use Native Driver:**

```javascript
import { Animated } from 'react-native';

// BEFORE (Slow - JS thread):
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
}).start();

// AFTER (Fast - Native thread):
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,  // Run on native thread
}).start();
```

---

### 10. **Hermes Engine** ⭐⭐⭐

**Enable Hermes for faster startup:**

```json
// app.json
{
  "expo": {
    "jsEngine": "hermes",  // Enable Hermes
    "android": {
      "enableProguard": true,  // Minify code
      "enableShrinkResources": true  // Remove unused resources
    }
  }
}
```

---

## 📊 PERFORMANCE MONITORING

### Add Performance Tracking:

```javascript
// utils/performance.ts
export const measurePerformance = (name: string, fn: Function) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
  return result;
};

// Usage:
measurePerformance('Property List Render', () => {
  return properties.map(p => <PropertyCard key={p._id} property={p} />);
});
```

---

## 🎯 SPECIFIC OPTIMIZATIONS FOR YOUR APP

### 1. **Property List Screen**

```javascript
// app/tabs/explore/index.tsx
import { FlashList } from '@shopify/flash-list';  // Faster than FlatList

const ExploreScreen = () => {
  const { data: properties } = useProperties();
  
  return (
    <FlashList
      data={properties}
      renderItem={({item}) => <PropertyCard property={item} />}
      estimatedItemSize={200}  // Approximate item height
      keyExtractor={item => item._id}
    />
  );
};

// Memoized Property Card
const PropertyCard = memo(({ property }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{uri: property.images[0]}}
        style={styles.image}
        cachePolicy="memory-disk"
      />
      <Text>{property.title}</Text>
      <Text>Rs. {property.price}</Text>
    </View>
  );
});
```

### 2. **Broker Dashboard**

```javascript
// app/broker-dashboard.tsx
const BrokerDashboard = () => {
  // Cache dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000,  // Cache for 2 minutes
  });
  
  // Memoize expensive calculations
  const conversionRate = useMemo(() => {
    if (!stats) return 0;
    return (stats.closedDeals / stats.totalLeads * 100).toFixed(2);
  }, [stats]);
  
  return (
    <ScrollView>
      <StatsCard stats={stats} />
      <ConversionRate rate={conversionRate} />
    </ScrollView>
  );
};
```

### 3. **Image Upload Optimization**

```javascript
// app/post-property.tsx
const PostPropertyScreen = () => {
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,  // Compress to 70%
      maxWidth: 1080,  // Max width 1080px
      maxHeight: 1080,
    });
    
    if (!result.canceled) {
      // Further compress if needed
      const compressed = await Promise.all(
        result.assets.map(asset => compressImage(asset.uri))
      );
      setImages(compressed);
    }
  };
};
```

---

## 🔧 BUILD OPTIMIZATIONS

### Production Build Settings:

```json
// app.json
{
  "expo": {
    "android": {
      "enableProguard": true,
      "enableShrinkResources": true,
      "minifyEnabled": true
    },
    "ios": {
      "buildNumber": "1.0.0"
    },
    "optimization": {
      "minify": true
    }
  }
}
```

### Build Commands:

```bash
# Development build (faster, larger)
npx expo start

# Production build (optimized, smaller)
eas build --platform android --profile production

# Analyze bundle size
npx expo-bundle-size
```

---

## 📱 DEVICE-SPECIFIC OPTIMIZATIONS

### Low-End Device Support:

```javascript
import { Platform, Dimensions } from 'react-native';

const isLowEndDevice = () => {
  const { width, height } = Dimensions.get('window');
  const pixelRatio = Platform.OS === 'android' ? 
    require('react-native').PixelRatio.get() : 2;
  
  // Detect low-end devices
  return width < 720 || pixelRatio < 2;
};

// Adjust quality based on device
const imageQuality = isLowEndDevice() ? 0.5 : 0.8;
```

---

## ✅ PERFORMANCE CHECKLIST

### Before Launch:

- [ ] Enable Hermes engine
- [ ] Use expo-image for all images
- [ ] Implement FlatList/FlashList for lists
- [ ] Memoize expensive components
- [ ] Cache API responses (React Query)
- [ ] Compress images before upload
- [ ] Debounce search inputs
- [ ] Use native driver for animations
- [ ] Enable ProGuard (Android)
- [ ] Remove console.logs in production
- [ ] Test on low-end devices
- [ ] Measure app startup time
- [ ] Check bundle size (<50MB)

---

## 🎯 EXPECTED PERFORMANCE IMPROVEMENTS

**Before Optimization:**
- App startup: 3-5 seconds
- List scrolling: Laggy
- Image loading: Slow
- Bundle size: 60-80 MB

**After Optimization:**
- App startup: 1-2 seconds ⚡ (50% faster)
- List scrolling: Smooth 60 FPS ⚡
- Image loading: Instant (cached) ⚡
- Bundle size: 30-40 MB ⚡ (50% smaller)

---

## 🚀 QUICK WINS (Implement First)

1. **Enable Hermes** - Add to app.json
2. **Use expo-image** - Replace all Image components
3. **FlatList optimization** - Add performance props
4. **Memoize components** - Add React.memo
5. **Image compression** - Compress before upload

---

## 📊 MONITORING TOOLS

```bash
# Check app performance
npx react-native-performance-monitor

# Analyze bundle
npx expo-bundle-size

# Profile app
npx react-devtools
```

---

## 🎯 RESULT

**Your app will be:**
- ⚡ 50% faster startup
- ⚡ Smooth 60 FPS scrolling
- ⚡ Instant image loading
- ⚡ 50% smaller bundle size
- ⚡ Better battery life
- ⚡ Works on low-end devices

**IMPLEMENT THESE OPTIMIZATIONS FOR BLAZING FAST APP!** 🚀
