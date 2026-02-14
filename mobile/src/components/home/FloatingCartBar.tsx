// ─── Floating Cart Bar (Swiggy-style bottom bar) ───
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FloatingCartBarProps {
    restaurantName: string;
    restaurantImage?: string;
    itemCount: number;
    onViewCart: () => void;
    onDismiss?: () => void;
}

const FloatingCartBarComponent = ({
    restaurantName,
    restaurantImage,
    itemCount,
    onViewCart,
    onDismiss,
}: FloatingCartBarProps) => {
    if (itemCount <= 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.bar}>
                {/* Left: restaurant info */}
                <View style={styles.restInfo}>
                    {restaurantImage && (
                        <Image
                            source={{ uri: restaurantImage }}
                            style={styles.restImage}
                            contentFit="cover"
                        />
                    )}
                    <View style={styles.restTextWrap}>
                        <Text style={styles.restName} numberOfLines={1}>{restaurantName}</Text>
                        <Pressable>
                            <Text style={styles.viewMenu}>View Menu ▸</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Right: view cart button */}
                <Pressable style={styles.viewCartBtn} onPress={onViewCart}>
                    <Text style={styles.viewCartText}>View Cart</Text>
                    <Text style={styles.itemCountText}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
                </Pressable>

                {/* Dismiss */}
                {onDismiss && (
                    <Pressable style={styles.dismissBtn} onPress={onDismiss} hitSlop={10}>
                        <Ionicons name="close" size={18} color={Colors.textSecondary} />
                    </Pressable>
                )}
            </View>
        </View>
    );
};

export const FloatingCartBar = memo(FloatingCartBarComponent);

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.md,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        ...Shadow.xl,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    restInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    restImage: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.skeletonBase,
    },
    restTextWrap: {
        marginLeft: Spacing.sm,
        flex: 1,
    },
    restName: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    viewMenu: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: FontWeight.semiBold,
        marginTop: 1,
    },
    viewCartBtn: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
    viewCartText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textWhite,
    },
    itemCountText: {
        fontSize: FontSize.xxs,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 1,
    },
    dismissBtn: {
        marginLeft: Spacing.sm,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
