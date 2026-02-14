import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { useApp } from '../context/AppContext';
import { useLocation } from '../hooks/useLocation';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Filters are now dynamic based on available products and offers

export const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const {
        productsLoading,
        filteredProducts,
        offers,
        vegFilter,
        setVegFilter,
        favorites,
        toggleFavorite,
        addToCart,
        cart,
    } = useApp();
    const location = useLocation();
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header
                address={location.address}
                addressLoading={location.loading}
                onLocationPress={() => { }}
                onSearchPress={() => navigation.navigate('Search')}
                onAvatarPress={() => navigation.navigate('MainTabs', { screen: 'Profile' } as any)}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.maroon]} />
                }
            >
                {/* Veg / Non-Veg Toggle */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.vegToggleContainer}>
                    <Pressable
                        style={[styles.vegToggle, vegFilter === 'veg' && styles.vegToggleActive]}
                        onPress={() => setVegFilter(vegFilter === 'veg' ? 'all' : 'veg')}
                    >
                        <View style={[styles.vegIcon, { borderColor: Colors.veg }]}>
                            <View style={[styles.vegIconDot, { backgroundColor: Colors.veg }]} />
                        </View>
                        <Text style={[styles.vegToggleText, vegFilter === 'veg' && styles.vegToggleTextActive]}>
                            Veg
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.vegToggle, vegFilter === 'nonveg' && styles.nonVegToggleActive]}
                        onPress={() => setVegFilter(vegFilter === 'nonveg' ? 'all' : 'nonveg')}
                    >
                        <View style={[styles.vegIcon, { borderColor: Colors.nonVeg }]}>
                            <View style={[styles.vegIconDot, { backgroundColor: Colors.nonVeg }]} />
                        </View>
                        <Text style={[styles.vegToggleText, vegFilter === 'nonveg' && styles.vegToggleTextActive]}>
                            Non-veg
                        </Text>
                    </Pressable>
                </Animated.View>

                {/* Offers Section - Only show if offers exist */}
                {offers.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <Text style={styles.sectionTitle}>Today's Offers</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersScroll}>
                            {offers.map((offer) => (
                                <Pressable key={offer.id} style={styles.offerCard}>
                                    <Image source={{ uri: offer.imageUrl }} style={styles.offerImage} contentFit="cover" />
                                    <View style={styles.offerOverlay}>
                                        <Text style={styles.offerTitle}>{offer.title}</Text>
                                        <Text style={styles.offerDesc}>{offer.description}</Text>
                                        {offer.couponCode && (
                                            <View style={styles.couponBadge}>
                                                <Text style={styles.couponText}>{offer.couponCode}</Text>
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* Filters Row - Dynamic based on offers */}
                {offers.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(300)}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                            <Pressable
                                style={[styles.filterChip, activeFilter === 'offers' && styles.filterChipActive]}
                                onPress={() => setActiveFilter(activeFilter === 'offers' ? null : 'offers')}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        activeFilter === 'offers' && styles.filterChipTextActive,
                                    ]}
                                >
                                    Great Offers
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.filterChip, activeFilter === 'rating' && styles.filterChipActive]}
                                onPress={() => setActiveFilter(activeFilter === 'rating' ? null : 'rating')}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        activeFilter === 'rating' && styles.filterChipTextActive,
                                    ]}
                                >
                                    Top Rated
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </Animated.View>
                )}

                {/* Products Grid */}
                <Text style={styles.sectionTitle}>
                    {vegFilter === 'veg'
                        ? 'Vegetarian Dishes'
                        : vegFilter === 'nonveg'
                            ? 'Non-Vegetarian Dishes'
                            : 'All Dishes'}
                </Text>

                {productsLoading ? (
                    <View style={styles.productsGrid}>
                        {[1, 2, 3, 4].map((i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </View>
                ) : (
                    <View style={styles.productsGrid}>
                        {filteredProducts.map((product, index) => (
                            <Animated.View key={product.id} entering={FadeInRight.delay(index * 80)}>
                                <ProductCard
                                    product={product}
                                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                                    onAddToCart={() => addToCart(product)}
                                    isFavorite={favorites.includes(product.id)}
                                    onToggleFavorite={() => toggleFavorite(product.id)}
                                />
                            </Animated.View>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Cart Button */}
            {cartItemCount > 0 && (
                <Pressable style={styles.floatingCart} onPress={() => navigation.navigate('Cart')}>
                    <Ionicons name="cart" size={22} color={Colors.text.white} />
                    <Text style={styles.floatingCartText}>
                        {cartItemCount} item{cartItemCount > 1 ? 's' : ''} in cart
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.text.white} />
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background.offWhite },
    scrollView: { flex: 1 },
    vegToggleContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    vegToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.background.white,
        gap: 6,
    },
    vegToggleActive: {
        backgroundColor: '#DCFCE7',
        borderColor: Colors.veg,
    },
    nonVegToggleActive: {
        backgroundColor: '#FEE2E2',
        borderColor: Colors.nonVeg,
    },
    vegIcon: {
        width: 16,
        height: 16,
        borderWidth: 2,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background.white,
    },
    vegIconDot: { width: 7, height: 7, borderRadius: 4 },
    vegToggleText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    vegToggleTextActive: { color: Colors.text.primary },
    sectionTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.text.primary,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    offersScroll: { paddingLeft: Spacing.lg },
    offerCard: {
        width: SCREEN_WIDTH * 0.75,
        height: 150,
        marginRight: Spacing.md,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadow.medium,
    },
    offerImage: { width: '100%', height: '100%' },
    offerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        padding: Spacing.md,
    },
    offerTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text.white,
    },
    offerDesc: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    couponBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.accent.yellow,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
        marginTop: 6,
    },
    couponText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.primary.darkRed,
    },
    filtersScroll: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.sm,
    },
    filterChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.background.white,
        marginRight: Spacing.sm,
    },
    filterChipActive: {
        backgroundColor: Colors.primary.maroon,
        borderColor: Colors.primary.maroon,
    },
    filterChipText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
    filterChipTextActive: { color: Colors.text.white },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: Spacing.lg,
        justifyContent: 'space-between',
    },
    floatingCart: {
        position: 'absolute',
        bottom: 20,
        left: Spacing.lg,
        right: Spacing.lg,
        backgroundColor: Colors.primary.maroon,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Shadow.large,
    },
    floatingCartText: {
        color: Colors.text.white,
        fontSize: FontSize.md,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
});
