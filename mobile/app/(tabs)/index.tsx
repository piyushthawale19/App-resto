// ─── Premium Home Screen (Swiggy/Zomato-style) ───
// Production-quality UI matching reference screenshots

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Platform,
    FlatList,
    Text,
    Pressable,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useApp } from '../../src/context/AppContext';
import { useAuth } from '../../src/context/AuthContext';

// Premium home components
import { HomeHeader } from '../../src/components/home/Header';
import { SearchBar } from '../../src/components/home/SearchBar';
import { CategoryStrip } from '../../src/components/home/CategoryStrip';
import { DeliveryTabs } from '../../src/components/home/DeliveryTabs';
import { OfferBanner } from '../../src/components/home/OfferBanner';
import { FilterChips } from '../../src/components/home/FilterChips';
import { RestaurantCard } from '../../src/components/home/RestaurantCard';
import { VegToggle } from '../../src/components/home/VegToggle';
import { ExploreMore } from '../../src/components/home/ExploreMore';
import { FloatingCartBar } from '../../src/components/home/FloatingCartBar';
import { HomeScreenSkeleton } from '../../src/components/home/SkeletonLoader';

// Services
import { getFullLocationData } from '../../src/services/locationService';

// Constants
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/spacing';
import { FontSize, FontWeight } from '../../src/constants/typography';

// Data
import {
    DUMMY_CATEGORIES,
    DUMMY_FILTERS,
    DUMMY_BANNERS,
    DUMMY_RESTAURANTS,
    DUMMY_EXPLORE_ITEMS,
} from '../../src/data/dummyData';

import type { Restaurant } from '../../src/types/restaurant';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { cart, vegFilter, setVegFilter, productsLoading } = useApp();
    const { user } = useAuth();

    // ─── State ───
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [locationLabel, setLocationLabel] = useState('Home');
    const [locationAddress, setLocationAddress] = useState('flat no 2 near Samsung, Ra...');
    const [locationLoading, setLocationLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'takeaway' | 'dinein'>('delivery');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>(DUMMY_RESTAURANTS);
    const [showCartBar, setShowCartBar] = useState(true);

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // ─── Load Location ───
    useEffect(() => {
        loadLocation();
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const loadLocation = async () => {
        setLocationLoading(true);
        try {
            const loc = await getFullLocationData();
            if (loc.hasPermission && !loc.error) {
                setLocationLabel(loc.shortAddress || 'Home');
                setLocationAddress(loc.fullAddress || loc.address);
            }
        } catch (e) {
            console.log('Location load error:', e);
        }
        setLocationLoading(false);
    };

    // ─── Refresh ───
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadLocation();
        setTimeout(() => setRefreshing(false), 1200);
    }, []);

    // ─── Filter restaurants ───
    const filteredRestaurants = useMemo(() => {
        let result = [...restaurants];
        if (selectedCategory !== 'all') {
            result = result.filter((r) =>
                r.tags?.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
                r.cuisines.some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase()))
            );
        }
        if (activeFilters.includes('pureveg')) {
            result = result.filter((r) => r.isPureVeg);
        }
        if (activeFilters.includes('rating4')) {
            result = result.filter((r) => r.rating >= 4.0);
        }
        if (activeFilters.includes('under200')) {
            result = result.filter((r) => r.priceForOne <= 200);
        }
        if (activeFilters.includes('near_fast')) {
            result = result.sort((a, b) => {
                const aTime = parseInt(a.deliveryTime) || 30;
                const bTime = parseInt(b.deliveryTime) || 30;
                return aTime - bTime;
            });
        }
        return result;
    }, [restaurants, selectedCategory, activeFilters]);

    const featuredRestaurants = useMemo(() =>
        restaurants.filter((r) => r.isFeatured),
        [restaurants]
    );

    // ─── Handlers ───
    const handleFilterToggle = useCallback((filterId: string) => {
        setActiveFilters((prev) =>
            prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
        );
    }, []);

    const handleRestaurantPress = useCallback((restaurant: Restaurant) => {
        // TODO: Navigate to restaurant detail
    }, []);

    const handleBookmark = useCallback((restaurant: Restaurant) => {
        setRestaurants((prev) =>
            prev.map((r) => r.id === restaurant.id ? { ...r, isBookmarked: !r.isBookmarked } : r)
        );
    }, []);

    const handleVegToggle = useCallback(() => {
        setVegFilter(vegFilter === 'veg' ? 'all' : 'veg');
    }, [vegFilter, setVegFilter]);

    const handleNonVegToggle = useCallback(() => {
        setVegFilter(vegFilter === 'nonveg' ? 'all' : 'nonveg');
    }, [vegFilter, setVegFilter]);

    // ─── Skeleton loading state ───
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundWhite} />
                <HomeScreenSkeleton />
            </SafeAreaView>
        );
    }

    // ─── Grid item renderer ───
    const renderGridItem = ({ item, index }: { item: Restaurant; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={styles.gridItem}>
            <RestaurantCard
                restaurant={item}
                onPress={handleRestaurantPress}
                onBookmark={handleBookmark}
                variant="grid"
            />
        </Animated.View>
    );

    // ─── List header (all content above grid) ───
    const ListHeader = () => (
        <View>
            {/* Delivery Tabs */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <DeliveryTabs selected={deliveryMode} onSelect={setDeliveryMode} />
            </Animated.View>

            {/* Offer Banners */}
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                <OfferBanner banners={DUMMY_BANNERS} />
            </Animated.View>

            {/* Category Strip */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <CategoryStrip
                    categories={DUMMY_CATEGORIES}
                    onCategorySelect={setSelectedCategory}
                    selectedCategory={selectedCategory}
                />
            </Animated.View>

            {/* Filter Chips */}
            <Animated.View entering={FadeInDown.delay(250).duration(400)}>
                <FilterChips
                    filters={DUMMY_FILTERS}
                    activeFilters={activeFilters}
                    onFilterToggle={handleFilterToggle}
                />
            </Animated.View>

            {/* Featured Restaurants Slider */}
            {featuredRestaurants.length > 0 && (
                <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                    <Text style={styles.sectionTitle}>RECOMMENDED FOR YOU</Text>
                    <FlatList
                        data={featuredRestaurants}
                        keyExtractor={(item) => `featured-${item.id}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredList}
                        renderItem={({ item }) => (
                            <RestaurantCard
                                restaurant={item}
                                onPress={handleRestaurantPress}
                                onBookmark={handleBookmark}
                                variant="featured"
                            />
                        )}
                    />
                </Animated.View>
            )}

            {/* Explore More */}
            <Animated.View entering={FadeInDown.delay(350).duration(400)}>
                <ExploreMore items={DUMMY_EXPLORE_ITEMS} />
            </Animated.View>

            {/* All Restaurants label */}
            <Text style={styles.allRestaurantsTitle}>ALL RESTAURANTS</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundWhite} />

            {/* Fixed Header */}
            <HomeHeader
                locationLabel={locationLabel}
                locationAddress={locationAddress}
                addressLoading={locationLoading}
                onLocationPress={() => router.push('/location' as any)}
                onAvatarPress={() => router.push('/more' as any)}
            />

            {/* Search Bar + Veg Toggle */}
            <View style={styles.searchRow}>
                <View style={styles.searchBarWrap}>
                    <SearchBar onPress={() => router.push('/search')} placeholder='Search "burger"' />
                </View>
                <View style={styles.vegToggleWrap}>
                    <VegToggle
                        isVeg={vegFilter === 'veg'}
                        isNonVeg={vegFilter === 'nonveg'}
                        onToggleVeg={handleVegToggle}
                        onToggleNonVeg={handleNonVegToggle}
                    />
                </View>
            </View>

            {/* Scrollable Content with 2-column grid */}
            <FlatList
                data={filteredRestaurants}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.gridContent}
                ListHeaderComponent={<ListHeader />}
                ListFooterComponent={<View style={{ height: 120 }} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No restaurants found</Text>
                        <Text style={styles.emptySubtext}>Try changing your filters</Text>
                    </View>
                }
                renderItem={renderGridItem}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                maxToRenderPerBatch={6}
                windowSize={5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
                }
            />

            {/* Floating Cart Bar */}
            {showCartBar && cartItemCount > 0 && (
                <FloatingCartBar
                    restaurantName="Yummyfi Kitchen"
                    itemCount={cartItemCount}
                    onViewCart={() => router.push('/cart')}
                    onDismiss={() => setShowCartBar(false)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        paddingRight: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    searchBarWrap: {
        flex: 1,
    },
    vegToggleWrap: {
        marginLeft: -Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
        letterSpacing: 1.5,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    allRestaurantsTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
        letterSpacing: 1.5,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        marginTop: Spacing.md,
    },
    featuredList: {
        paddingHorizontal: Spacing.lg,
    },
    gridContent: {
        paddingBottom: Spacing.xxl,
    },
    columnWrapper: {
        paddingHorizontal: Spacing.lg,
        justifyContent: 'space-between',
    },
    gridItem: {
        width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.semiBold,
        color: Colors.textPrimary,
    },
    emptySubtext: {
        fontSize: FontSize.base,
        color: Colors.textTertiary,
        marginTop: 4,
    },
});
