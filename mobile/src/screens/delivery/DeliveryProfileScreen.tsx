import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Image,
    Alert,
    SafeAreaView
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING } from '../../constants';

export default function DeliveryProfileScreen() {
    const { appUser, signOut, updateUserProfile } = useAuth();
    const [isOnline, setIsOnline] = useState(appUser?.isOnline || false);
    const [isAvailable, setIsAvailable] = useState(appUser?.isAvailable || false);

    const toggleOnline = async (value: boolean) => {
        if (!appUser?.deliveryBoyId) return;

        try {
            setIsOnline(value);
            
            // Update both user and delivery boy records
            await updateUserProfile({ isOnline: value });
            await updateDoc(doc(db, 'deliveryBoys', appUser.deliveryBoyId), {
                isOnline: value,
            });

            if (!value) {
                // If going offline, also set as unavailable
                setIsAvailable(false);
                await updateUserProfile({ isAvailable: false });
                await updateDoc(doc(db, 'deliveryBoys', appUser.deliveryBoyId), {
                    isAvailable: false,
                });
            }
        } catch (error) {
            console.error('Error toggling online status:', error);
            Alert.alert('Error', 'Failed to update online status');
        }
    };

    const toggleAvailable = async (value: boolean) => {
        if (!appUser?.deliveryBoyId) return;

        if (value && !isOnline) {
            Alert.alert('Go Online First', 'You need to be online to accept orders');
            return;
        }

        try {
            setIsAvailable(value);

            await updateUserProfile({ isAvailable: value });
            await updateDoc(doc(db, 'deliveryBoys', appUser.deliveryBoyId), {
                isAvailable: value,
            });
        } catch (error) {
            console.error('Error toggling availability:', error);
            Alert.alert('Error', 'Failed to update availability');
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        {appUser?.photoURL ? (
                            <Image
                                source={{ uri: appUser.photoURL }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>
                                    {appUser?.displayName?.[0]?.toUpperCase() || 'D'}
                                </Text>
                            </View>
                        )}
                        <Text style={styles.name}>{appUser?.displayName}</Text>
                        <Text style={styles.email}>{appUser?.email}</Text>
                        
                        {appUser?.vehicleType && (
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehicleText}>
                                    🏍️ {appUser.vehicleType.toUpperCase()}
                                    {appUser.vehicleNumber ? ` - ${appUser.vehicleNumber}` : ''}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{appUser?.rating?.toFixed(1) || '5.0'}</Text>
                        <Text style={styles.statLabel}>⭐ Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{appUser?.totalDeliveries || 0}</Text>
                        <Text style={styles.statLabel}>📦 Deliveries</Text>
                    </View>
                </View>

                {/* Status Toggles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Online Status</Text>
                            <Text style={styles.settingDesc}>
                                You must be online to receive orders
                            </Text>
                        </View>
                        <Switch
                            value={isOnline}
                            onValueChange={toggleOnline}
                            trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Available for Orders</Text>
                            <Text style={styles.settingDesc}>
                                Accept new delivery assignments
                            </Text>
                        </View>
                        <Switch
                            value={isAvailable}
                            onValueChange={toggleAvailable}
                            trackColor={{ false: COLORS.border, true: COLORS.success }}
                            thumbColor="#fff"
                            disabled={!isOnline}
                        />
                    </View>
                </View>

                {/* Quick Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Info</Text>
                    
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Partner ID</Text>
                            <Text style={styles.infoValue}>
                                {appUser?.deliveryBoyId?.slice(0, 8) || 'N/A'}
                            </Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{appUser?.phone || 'Not set'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Joined</Text>
                            <Text style={styles.infoValue}>
                                {appUser?.createdAt 
                                    ? new Date(appUser.createdAt).toLocaleDateString()
                                    : 'N/A'
                                }
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>📝 Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>🚗 Update Vehicle Info</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>💬 Help & Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.signOutButton]}
                        onPress={handleSignOut}
                    >
                        <Text style={[styles.actionButtonText, styles.signOutText]}>
                            🚪 Sign Out
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.xl * 2,
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: SPACING.md,
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: SPACING.xs,
    },
    email: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    vehicleInfo: {
        marginTop: SPACING.md,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
    },
    vehicleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        margin: SPACING.lg,
        padding: SPACING.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },
    section: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: SPACING.lg,
        borderRadius: 12,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    settingInfo: {
        flex: 1,
        marginRight: SPACING.md,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    settingDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    actionButton: {
        backgroundColor: '#fff',
        padding: SPACING.lg,
        borderRadius: 12,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    signOutButton: {
        backgroundColor: COLORS.error + '10',
        borderColor: COLORS.error,
    },
    signOutText: {
        color: COLORS.error,
    },
});
