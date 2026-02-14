import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserRole } from '../types';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

const { width } = Dimensions.get('window');

interface Props {
    onSelectRole: (role: UserRole) => void;
}

export default function RoleSelectionScreen({ onSelectRole }: Props) {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const handleSelectRole = (role: UserRole) => {
        setSelectedRole(role);
        // Delay to show selection animation
        setTimeout(() => {
            onSelectRole(role);
        }, 300);
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome! 👋</Text>
                    <Text style={styles.subtitle}>Choose how you want to use the app</Text>

                    <View style={styles.rolesContainer}>
                        {/* Customer Role */}
                        <TouchableOpacity
                            style={[
                                styles.roleCard,
                                selectedRole === 'customer' && styles.roleCardSelected
                            ]}
                            onPress={() => handleSelectRole('customer')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconEmoji}>🍽️</Text>
                            </View>
                            <Text style={styles.roleTitle}>I'm a Customer</Text>
                            <Text style={styles.roleDescription}>
                                Order delicious food and track deliveries
                            </Text>
                            <View style={styles.features}>
                                <Text style={styles.featureText}>• Browse menu</Text>
                                <Text style={styles.featureText}>• Place orders</Text>
                                <Text style={styles.featureText}>• Track delivery</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Delivery Partner Role */}
                        <TouchableOpacity
                            style={[
                                styles.roleCard,
                                selectedRole === 'delivery_partner' && styles.roleCardSelected
                            ]}
                            onPress={() => handleSelectRole('delivery_partner')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconEmoji}>🏍️</Text>
                            </View>
                            <Text style={styles.roleTitle}>I'm a Delivery Partner</Text>
                            <Text style={styles.roleDescription}>
                                Deliver orders and earn money
                            </Text>
                            <View style={styles.features}>
                                <Text style={styles.featureText}>• Accept orders</Text>
                                <Text style={styles.featureText}>• Navigate with GPS</Text>
                                <Text style={styles.featureText}>• Track earnings</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.note}>
                        You can change this later in settings
                    </Text>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
        marginBottom: SPACING.xl * 2,
    },
    rolesContainer: {
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    roleCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: SPACING.lg,
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    roleCardSelected: {
        borderColor: COLORS.secondary,
        backgroundColor: '#fff',
        transform: [{ scale: 0.98 }],
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    iconEmoji: {
        fontSize: 40,
    },
    roleTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    roleDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    features: {
        alignItems: 'flex-start',
        gap: SPACING.xs,
    },
    featureText: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    note: {
        fontSize: 12,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.7,
    },
});
