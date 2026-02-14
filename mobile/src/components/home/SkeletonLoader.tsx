// ─── Premium Skeleton Loaders ───
import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonBoxProps {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
}

export const SkeletonBox = memo(({ width, height, borderRadius = BorderRadius.md, style }: SkeletonBoxProps) => {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmer, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ).start();
    }, []);

    const opacity = shimmer.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.6, 0.3],
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: Colors.skeletonBase,
                    opacity,
                },
                style,
            ]}
        />
    );
});

// ─── Category Skeleton ───
export const CategorySkeleton = memo(() => (
    <View style={skStyles.categoryContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={skStyles.categoryItem}>
                <SkeletonBox width={64} height={64} borderRadius={32} />
                <SkeletonBox width={50} height={10} style={{ marginTop: 6 }} />
            </View>
        ))}
    </View>
));

// ─── Banner Skeleton ───
export const BannerSkeleton = memo(() => (
    <View style={skStyles.bannerContainer}>
        <SkeletonBox width={SCREEN_WIDTH - 32} height={180} borderRadius={BorderRadius.xl} />
        <View style={skStyles.minis}>
            <SkeletonBox width={140} height={100} borderRadius={BorderRadius.lg} />
            <SkeletonBox width={140} height={100} borderRadius={BorderRadius.lg} />
        </View>
    </View>
));

// ─── Restaurant Card Skeleton ───
export const RestaurantCardSkeleton = memo(() => {
    const cardWidth = (SCREEN_WIDTH - 32 - 12) / 2;
    return (
        <View style={[skStyles.restCard, { width: cardWidth }]}>
            <SkeletonBox width="100%" height={140} borderRadius={0} />
            <View style={{ padding: 12 }}>
                <SkeletonBox width="75%" height={14} style={{ marginBottom: 6 }} />
                <SkeletonBox width="50%" height={11} style={{ marginBottom: 6 }} />
                <SkeletonBox width="40%" height={11} />
            </View>
        </View>
    );
});

// ─── Full Home Skeleton ───
export const HomeScreenSkeleton = memo(() => (
    <View style={skStyles.fullContainer}>
        {/* Header skeleton */}
        <View style={skStyles.headerSk}>
            <SkeletonBox width={24} height={24} borderRadius={12} />
            <View style={{ marginLeft: 8, flex: 1 }}>
                <SkeletonBox width={100} height={16} style={{ marginBottom: 4 }} />
                <SkeletonBox width={200} height={12} />
            </View>
            <SkeletonBox width={36} height={36} borderRadius={18} />
        </View>

        {/* Search skeleton */}
        <View style={{ paddingHorizontal: 16, marginVertical: 8 }}>
            <SkeletonBox width="100%" height={48} borderRadius={BorderRadius.lg} />
        </View>

        {/* Categories */}
        <CategorySkeleton />

        {/* Banner */}
        <BannerSkeleton />

        {/* Filter chips */}
        <View style={skStyles.filterRow}>
            {[80, 100, 90, 70].map((w, i) => (
                <SkeletonBox key={i} width={w} height={32} borderRadius={BorderRadius.pill} style={{ marginRight: 8 }} />
            ))}
        </View>

        {/* Restaurant cards grid */}
        <View style={skStyles.restGrid}>
            <RestaurantCardSkeleton />
            <RestaurantCardSkeleton />
            <RestaurantCardSkeleton />
            <RestaurantCardSkeleton />
        </View>
    </View>
));

const skStyles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerSk: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.backgroundWhite,
    },
    categoryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.backgroundWhite,
        gap: 20,
    },
    categoryItem: {
        alignItems: 'center',
    },
    bannerContainer: {
        paddingHorizontal: 16,
        marginTop: 12,
    },
    minis: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 12,
    },
    restGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginTop: 16,
        justifyContent: 'space-between',
    },
    restCard: {
        backgroundColor: Colors.backgroundWhite,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: 16,
    },
});
