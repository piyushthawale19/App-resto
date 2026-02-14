// ─── Premium Header (Swiggy-style) ───
import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    StatusBar,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
    locationLabel: string;       // "Home" / "Work" / area name
    locationAddress: string;     // Full address line
    addressLoading?: boolean;
    onLocationPress: () => void;
    onAvatarPress?: () => void;
    onWalletPress?: () => void;
}

const HeaderComponent = ({
    locationLabel,
    locationAddress,
    addressLoading,
    onLocationPress,
    onAvatarPress,
    onWalletPress,
}: HeaderProps) => {
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundWhite} />

            {/* Location row */}
            <View style={styles.row}>
                <Pressable style={styles.locationBtn} onPress={onLocationPress}>
                    <Ionicons name="location-sharp" size={22} color={Colors.primary} />
                    <View style={styles.locationTextWrap}>
                        <View style={styles.labelRow}>
                            <Text style={styles.locationLabel} numberOfLines={1}>
                                {addressLoading ? 'Getting location...' : locationLabel}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={Colors.textPrimary} style={{ marginLeft: 2 }} />
                        </View>
                        <Text style={styles.locationAddress} numberOfLines={1}>
                            {addressLoading ? '' : locationAddress}
                        </Text>
                    </View>
                </Pressable>

                <View style={styles.rightIcons}>
                    {/* Wallet */}
                    {onWalletPress && (
                        <Pressable style={styles.iconBtn} onPress={onWalletPress}>
                            <Ionicons name="wallet-outline" size={22} color={Colors.textPrimary} />
                        </Pressable>
                    )}

                    {/* Avatar */}
                    <Pressable style={styles.avatarBtn} onPress={onAvatarPress}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {user?.displayName?.[0]?.toUpperCase() || 'P'}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export const HomeHeader = memo(HeaderComponent);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundWhite,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 8,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: Spacing.md,
    },
    locationTextWrap: {
        marginLeft: Spacing.xs,
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        maxWidth: '85%',
    },
    locationAddress: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 1,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.textWhite,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
});
