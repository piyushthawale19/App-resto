import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Dimensions,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAROON = '#7A0C0C';
const CREAM = '#FFF8F3';

export default function HomeScreen() {
    const router = useRouter();
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

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="location" size={24} color={MAROON} />
                    <View style={styles.locationInfo}>
                        <Text style={styles.deliverTo}>Deliver to</Text>
                        <Text style={styles.address}>Current Location</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Pressable style={styles.iconBtn} onPress={() => router.push('/search')}>
                        <Ionicons name="search" size={24} color="#333" />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => router.push('/cart')}>
                        <Ionicons name="cart" size={24} color="#333" />
                        {cartItemCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[MAROON]} />
                }
            >
                {/* Veg / Non-Veg Toggle */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.vegToggleContainer}>
                    <Pressable
                        style={[styles.vegToggle, vegFilter === 'veg' && styles.vegToggleActive]}
                        onPress={() => setVegFilter(vegFilter === 'veg' ? 'all' : 'veg')}
                    >
                        <View style={[styles.vegIcon, { borderColor: '#22C55E' }]}>
                            <View style={[styles.vegIconDot, { backgroundColor: '#22C55E' }]} />
                        </View>
                        <Text style={[styles.vegToggleText, vegFilter === 'veg' && styles.vegToggleTextActive]}>
                            Veg
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.vegToggle, vegFilter === 'nonveg' && styles.nonVegToggleActive]}
                        onPress={() => setVegFilter(vegFilter === 'nonveg' ? 'all' : 'nonveg')}
                    >
                        <View style={[styles.vegIcon, { borderColor: '#EF4444' }]}>
                            <View style={[styles.vegIconDot, { backgroundColor: '#EF4444' }]} />
                        </View>
                        <Text style={[styles.vegToggleText, vegFilter === 'nonveg' && styles.vegToggleTextActive]}>
                            Non-veg
                        </Text>
                    </Pressable>
                </Animated.View>

                {/* Banner */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.banner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>Fresh & Delicious</Text>
                        <Text style={styles.bannerSubtitle}>Order now and get 20% off on first order!</Text>
                        <Pressable style={styles.bannerBtn}>
                            <Text style={styles.bannerBtnText}>Order Now</Text>
                        </Pressable>
                    </View>
                </Animated.View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What's on your mind?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        {['🍔 Burgers', '🍕 Pizza', '🍜 Noodles', '🍛 Biryani', '🥗 Healthy', '🍰 Desserts'].map(
                            (cat, idx) => (
                                <Pressable key={idx} style={styles.categoryCard}>
                                    <Text style={styles.categoryEmoji}>{cat.split(' ')[0]}</Text>
                                    <Text style={styles.categoryName}>{cat.split(' ')[1]}</Text>
                                </Pressable>
                            )
                        )}
                    </ScrollView>
                </View>

                {/* Products */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Popular Items</Text>
                    {productsLoading ? (
                        <Text style={styles.loadingText}>Loading products...</Text>
                    ) : filteredProducts.length === 0 ? (
                        <Text style={styles.emptyText}>No products found</Text>
                    ) : (
                        <View style={styles.productsGrid}>
                            {filteredProducts.slice(0, 6).map((product) => (
                                <Pressable
                                    key={product.id}
                                    style={styles.productCard}
                                    onPress={() => router.push(`/product/${product.id}`)}
                                >
                                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                                    <View style={styles.productInfo}>
                                        <View style={styles.vegBadge}>
                                            <View
                                                style={[
                                                    styles.vegDot,
                                                    { backgroundColor: product.isVeg ? '#22C55E' : '#EF4444' },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.productName} numberOfLines={1}>
                                            {product.name}
                                        </Text>
                                        <Text style={styles.productPrice}>₹{product.price}</Text>
                                        <Pressable
                                            style={styles.addBtn}
                                            onPress={(e) => {
                                                e.stopPropagation?.();
                                                addToCart(product);
                                            }}
                                        >
                                            <Text style={styles.addBtnText}>ADD</Text>
                                        </Pressable>
                                    </View>
                                    <Pressable
                                        style={styles.favoriteBtn}
                                        onPress={() => toggleFavorite(product.id)}
                                    >
                                        <Ionicons
                                            name={favorites.includes(product.id) ? 'heart' : 'heart-outline'}
                                            size={20}
                                            color={favorites.includes(product.id) ? '#EF4444' : '#9CA3AF'}
                                        />
                                    </Pressable>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CREAM,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationInfo: {
        marginLeft: 4,
    },
    deliverTo: {
        fontSize: 12,
        color: '#6B7280',
    },
    address: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        padding: 8,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: MAROON,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    vegToggleContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    vegToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    vegToggleActive: {
        backgroundColor: '#DCFCE7',
        borderColor: '#22C55E',
    },
    nonVegToggleActive: {
        backgroundColor: '#FEE2E2',
        borderColor: '#EF4444',
    },
    vegIcon: {
        width: 16,
        height: 16,
        borderWidth: 2,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vegIconDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    vegToggleText: {
        fontSize: 14,
        color: '#6B7280',
    },
    vegToggleTextActive: {
        fontWeight: '600',
        color: '#111827',
    },
    banner: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: MAROON,
        borderRadius: 16,
        overflow: 'hidden',
    },
    bannerContent: {
        padding: 20,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: '#FFF8F3',
        marginBottom: 12,
    },
    bannerBtn: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    bannerBtnText: {
        color: MAROON,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    categoriesScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    categoryCard: {
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        minWidth: 80,
    },
    categoryEmoji: {
        fontSize: 32,
    },
    categoryName: {
        fontSize: 12,
        color: '#374151',
        marginTop: 4,
    },
    loadingText: {
        textAlign: 'center',
        color: '#6B7280',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        padding: 40,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    productCard: {
        width: (SCREEN_WIDTH - 44) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 6,
        marginBottom: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#F3F4F6',
    },
    productInfo: {
        padding: 12,
    },
    vegBadge: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: MAROON,
        marginBottom: 8,
    },
    addBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: MAROON,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    addBtnText: {
        color: MAROON,
        fontWeight: '700',
        fontSize: 12,
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        padding: 6,
        borderRadius: 20,
    },
});
