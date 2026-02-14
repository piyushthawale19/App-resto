// ─── Premium Restaurant Card (Swiggy/Zomato style) ───
import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import type { Restaurant } from '../../types/restaurant';
import type { Product } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP) / 2;
const CARD_IMAGE_HEIGHT = 140;

interface RestaurantCardProps {
    restaurant: Restaurant & { products?: Product[] };
    onPress: (restaurant: Restaurant) => void;
    onBookmark?: (restaurant: Restaurant) => void;
    onAddToCart?: (product: Product) => void;
    variant?: 'grid' | 'featured';
}

const RestaurantCardComponent = ({
    restaurant,
    onPress,
    onBookmark,
    onAddToCart,
    variant = 'grid',
}: RestaurantCardProps) => {
    const isFeatured = variant === 'featured';
    const cardWidth = isFeatured ? SCREEN_WIDTH * 0.72 : CARD_WIDTH;
    const imageHeight = isFeatured ? 180 : CARD_IMAGE_HEIGHT;

    return (
        <Pressable
            style={[
                styles.card,
                { width: cardWidth },
                isFeatured && styles.featuredCard,
            ]}
            onPress={() => onPress(restaurant)}
        >
            {/* Image */}
            <View style={[styles.imageWrap, { height: imageHeight }]}>
                <Image
                    source={{ uri: restaurant.imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                />

                {/* Offer Badge */}
                {restaurant.offer && (
                    <View style={styles.offerBadge}>
                        <Text style={styles.offerText} numberOfLines={1}>
                            {restaurant.offer.text}
                        </Text>
                    </View>
                )}

                {/* Bookmark */}
                {onBookmark && (
                    <Pressable
                        style={styles.bookmarkBtn}
                        onPress={() => onBookmark(restaurant)}
                        hitSlop={8}
                    >
                        <Ionicons
                            name={restaurant.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={20}
                            color={Colors.textWhite}
                        />
                    </Pressable>
                )}

                {/* Rating on image (featured variant) */}
                {isFeatured && (
                    <View style={styles.ratingOnImage}>
                        <View style={styles.ratingBadgeLarge}>
                            <Ionicons name="star" size={12} color={Colors.textWhite} />
                            <Text style={styles.ratingTextLarge}>{restaurant.rating}</Text>
                        </View>
                        <Text style={styles.ratingCountLarge}>By {restaurant.ratingCount}</Text>
                    </View>
                )}

                {/* Delivery time on image bottom */}
                {isFeatured && (
                    <View style={styles.deliveryTimeOnImage}>
                        <Ionicons name="flash" size={12} color={Colors.primary} />
                        <Text style={styles.deliveryTimeImageText}>
                            {restaurant.deliveryTime} | {restaurant.distance}
                        </Text>
                    </View>
                )}
            </View>

            {/* Info section */}
            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={[styles.name, isFeatured && styles.nameFeatured]} numberOfLines={1}>
                        {restaurant.name}
                    </Text>
                    {/* Rating badge (grid variant) */}
                    {!isFeatured && (
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={10} color={Colors.textWhite} />
                            <Text style={styles.ratingText}>{restaurant.rating}</Text>
                        </View>
                    )}
                </View>

                {/* Cuisines */}
                {!isFeatured && (
                    <Text style={styles.cuisines} numberOfLines={1}>
                        {restaurant.cuisines.join(', ')}
                    </Text>
                )}

                {/* Delivery info */}
                {!isFeatured && (
                    <View style={styles.deliveryRow}>
                        <Ionicons name="flash" size={12} color={Colors.primary} />
                        <Text style={styles.deliveryText}>{restaurant.deliveryTime}</Text>
                    </View>
                )}

                {/* Featured: extra info */}
                {isFeatured && restaurant.offer && (
                    <View style={styles.offerRowFeatured}>
                        <Ionicons name="pricetag" size={12} color={Colors.offerBlue} />
                        <Text style={styles.offerTextFeatured}>{restaurant.offer.text}</Text>
                    </View>
                )}

                {/* Add to Cart Button - Show if restaurant has products */}
                {!isFeatured && restaurant.products && restaurant.products.length > 0 && onAddToCart && (
                    <Pressable
                        style={styles.addToCartBtn}
                                onPress={(e) => {
                                    e.stopPropagation?.();
                                    // Add first product or show product selection
                                    if (restaurant.products && restaurant.products.length === 1) {
                                        onAddToCart && onAddToCart(restaurant.products[0]);
                                    } else if (restaurant.products && restaurant.products.length > 1) {
                                        // If multiple products, navigate to restaurant detail or show menu
                                        onPress(restaurant);
                                    }
                                }}
                    >
                        <Ionicons name="add" size={16} color={Colors.textWhite} />
                        <Text style={styles.addToCartText}>Add</Text>
                    </Pressable>
                )}
            </View>
        </Pressable>
    );
};

export const RestaurantCard = memo(RestaurantCardComponent);

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundWhite,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
        ...Shadow.card,
    },
    featuredCard: {
        marginRight: Spacing.md,
    },
    imageWrap: {
        width: '100%',
        backgroundColor: Colors.skeletonBase,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    offerBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: Colors.textPrimary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.xs,
    },
    offerText: {
        fontSize: FontSize.xxs,
        fontWeight: FontWeight.bold,
        color: Colors.textWhite,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    bookmarkBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingOnImage: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        alignItems: 'flex-end',
    },
    ratingBadgeLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.ratingGreen,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
        gap: 3,
    },
    ratingTextLarge: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textWhite,
    },
    ratingCountLarge: {
        fontSize: FontSize.xxs,
        color: Colors.textWhite,
        marginTop: 2,
        // @ts-ignore - textShadow shorthand for web compatibility
        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
    },
    deliveryTimeOnImage: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        gap: 4,
    },
    deliveryTimeImageText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semiBold,
        color: Colors.textPrimary,
    },

    // Info section
    info: {
        padding: Spacing.md,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 6,
    },
    nameFeatured: {
        fontSize: FontSize.xxl,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.ratingGreen,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
        gap: 2,
    },
    ratingText: {
        fontSize: FontSize.xxs,
        fontWeight: FontWeight.bold,
        color: Colors.textWhite,
    },
    cuisines: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        marginTop: 3,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 3,
    },
    deliveryText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
        color: Colors.textSecondary,
    },
    offerRowFeatured: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    offerTextFeatured: {
        fontSize: FontSize.sm,
        color: Colors.offerBlue,
        fontWeight: FontWeight.medium,
    },
    addToCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.sm,
        gap: 4,
    },
    addToCartText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textWhite,
    },
});
