// ─── Premium Offer Banner Carousel ───
import React, { memo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import type { OfferBanner as OfferBannerType } from '../../types/restaurant';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const BANNER_HEIGHT = 180;
const MINI_BANNER_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2.3;
const MINI_BANNER_HEIGHT = 120;

interface OfferBannerProps {
    banners: OfferBannerType[];
    onBannerPress?: (banner: OfferBannerType) => void;
}

const OfferBannerComponent = ({ banners, onBannerPress }: OfferBannerProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (BANNER_WIDTH + Spacing.md));
        setActiveIndex(index);
    };

    // Main hero banner (first item)
    const heroBanner = banners[0];
    // Mini banners (remaining)
    const miniBanners = banners.slice(1);

    return (
        <View style={styles.container}>
            {/* Hero Banner */}
            {heroBanner && (
                <Pressable
                    style={styles.heroBanner}
                    onPress={() => onBannerPress?.(heroBanner)}
                >
                    <Image
                        source={{ uri: heroBanner.imageUrl }}
                        style={styles.heroImage}
                        contentFit="cover"
                        transition={400}
                    />
                    <LinearGradient
                        colors={[
                            'transparent',
                            heroBanner.backgroundColor || 'rgba(196, 30, 58, 0.85)',
                        ]}
                        style={styles.heroGradient}
                    >
                        <Text style={styles.heroTitle}>{heroBanner.title}</Text>
                        {heroBanner.subtitle && (
                            <Text style={styles.heroSubtitle}>{heroBanner.subtitle}</Text>
                        )}
                        {heroBanner.ctaText && (
                            <View style={styles.ctaBtn}>
                                <Text style={styles.ctaText}>{heroBanner.ctaText}</Text>
                            </View>
                        )}
                    </LinearGradient>
                </Pressable>
            )}

            {/* Mini Offer Banners */}
            {miniBanners.length > 0 && (
                <FlatList
                    data={miniBanners}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.miniList}
                    renderItem={({ item }) => (
                        <Pressable
                            style={[
                                styles.miniBanner,
                                { backgroundColor: item.backgroundColor || '#FF6B35' },
                            ]}
                            onPress={() => onBannerPress?.(item)}
                        >
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.miniBannerImage}
                                contentFit="cover"
                                transition={300}
                            />
                            <LinearGradient
                                colors={['transparent', item.backgroundColor || 'rgba(0,0,0,0.7)']}
                                style={styles.miniGradient}
                            >
                                <Text style={styles.miniTitle} numberOfLines={2}>{item.title}</Text>
                                {item.subtitle && (
                                    <Text style={styles.miniSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                                )}
                            </LinearGradient>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
};

export const OfferBanner = memo(OfferBannerComponent);

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.md,
    },
    heroBanner: {
        marginHorizontal: Spacing.lg,
        height: BANNER_HEIGHT,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...Shadow.md,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
        paddingTop: Spacing.huge,
    },
    heroTitle: {
        fontSize: FontSize.h2,
        fontWeight: FontWeight.bold,
        color: Colors.textWhite,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: FontSize.base,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        fontWeight: FontWeight.medium,
    },
    ctaBtn: {
        backgroundColor: Colors.backgroundWhite,
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
    },
    ctaText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    miniList: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        gap: Spacing.md,
    },
    miniBanner: {
        width: MINI_BANNER_WIDTH,
        height: MINI_BANNER_HEIGHT,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    miniBannerImage: {
        width: '100%',
        height: '100%',
    },
    miniGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        paddingTop: Spacing.xxl,
    },
    miniTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textWhite,
    },
    miniSubtitle: {
        fontSize: FontSize.xxs,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
});
