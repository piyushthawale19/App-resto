import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
    SafeAreaView
} from 'react-native';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order, OrderStatus } from '../../types';
import { locationBroadcaster } from '../../services/locationBroadcaster';
import { COLORS, SPACING } from '../../constants';
import * as Location from 'expo-location';

interface Props {
    orderId: string;
    onComplete: () => void;
}

export default function ActiveDeliveryScreen({ orderId, onComplete }: Props) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [broadcasting, setBroadcasting] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
            if (snapshot.exists()) {
                setOrder({ id: snapshot.id, ...snapshot.data() } as Order);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [orderId]);

    const startNavigation = async () => {
        if (!order) return;

        try {
            // Start broadcasting location
            const started = await locationBroadcaster.startBroadcasting(
                orderId,
                order.assignedDeliveryBoyId!,
                'http://localhost:3001' // Replace with actual tracking server URL
            );

            if (started) {
                setBroadcasting(true);

                // Update order status to on_the_way
                await updateDoc(doc(db, 'orders', orderId), {
                    status: 'on_the_way',
                });

                // Open Google Maps for navigation
                const destination = `${order.deliveryAddress.lat},${order.deliveryAddress.lng}`;
                const url = Platform.select({
                    ios: `maps:0,0?q=${destination}`,
                    android: `google.navigation:q=${destination}`,
                });

                if (url) {
                    const supported = await Linking.canOpenURL(url);
                    if (supported) {
                        await Linking.openURL(url);
                    } else {
                        // Fallback to web Google Maps
                        await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
                    }
                }
            } else {
                Alert.alert('Error', 'Failed to start location tracking');
            }
        } catch (error) {
            console.error('Error starting navigation:', error);
            Alert.alert('Error', 'Failed to start navigation');
        }
    };

    const stopNavigation = async () => {
        await locationBroadcaster.stopBroadcasting();
        setBroadcasting(false);
    };

    const handleCompleteDelivery = async () => {
        Alert.alert(
            'Complete Delivery',
            'Have you delivered the order to the customer?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Complete',
                    style: 'default',
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, 'orders', orderId), {
                                status: 'delivered',
                                deliveredAt: new Date().toISOString(),
                            });

                            await stopNavigation();
                            Alert.alert('Success', 'Order marked as delivered!', [
                                { text: 'OK', onPress: onComplete }
                            ]);
                        } catch (error) {
                            console.error('Error completing delivery:', error);
                            Alert.alert('Error', 'Failed to complete delivery');
                        }
                    }
                }
            ]
        );
    };

    const callCustomer = () => {
        if (order?.customerPhone) {
            Linking.openURL(`tel:${order.customerPhone}`);
        }
    };

    if (loading || !order) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Active Delivery</Text>
                    <View style={[styles.statusBadge, broadcasting && styles.broadcastingBadge]}>
                        <View style={broadcasting ? styles.pulseDot : undefined} />
                        <Text style={styles.statusText}>
                            {broadcasting ? 'Live Tracking' : 'Tracking Off'}
                        </Text>
                    </View>
                </View>

                {/* Order Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order #{order.id.slice(-6)}</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={styles.value}>{order.status}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Amount:</Text>
                        <Text style={styles.value}>₹{order.finalAmount}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Payment:</Text>
                        <Text style={styles.value}>{order.paymentMethod.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Customer Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Customer Details</Text>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    {order.customerPhone && (
                        <TouchableOpacity style={styles.phoneButton} onPress={callCustomer}>
                            <Text style={styles.phoneText}>📞 {order.customerPhone}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Delivery Address */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Delivery Address</Text>
                    <Text style={styles.address}>{order.deliveryAddress.fullAddress}</Text>
                    {order.deliveryAddress.landmark && (
                        <Text style={styles.landmark}>🏷️ {order.deliveryAddress.landmark}</Text>
                    )}
                </View>

                {/* Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Items ({order.items.length})</Text>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <Text style={styles.itemName}>
                                {item.isVeg ? '🟢' : '🔴'} {item.name} x{item.quantity}
                            </Text>
                            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                {!broadcasting ? (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={startNavigation}
                    >
                        <Text style={styles.primaryButtonText}>🧭 Start Navigation</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={stopNavigation}
                        >
                            <Text style={styles.secondaryButtonText}>⏸️ Stop Tracking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.completeButton}
                            onPress={handleCompleteDelivery}
                        >
                            <Text style={styles.completeButtonText}>✅ Complete Delivery</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error + '20',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
    },
    broadcastingBadge: {
        backgroundColor: COLORS.success + '20',
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: SPACING.xs,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
    },
    card: {
        backgroundColor: '#fff',
        margin: SPACING.md,
        padding: SPACING.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        textTransform: 'capitalize',
    },
    customerName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    phoneButton: {
        backgroundColor: COLORS.primary + '10',
        padding: SPACING.md,
        borderRadius: 12,
        marginTop: SPACING.sm,
    },
    phoneText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    address: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
    },
    landmark: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.text,
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: SPACING.md,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.lg,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: COLORS.warning,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    completeButton: {
        backgroundColor: COLORS.success,
        paddingVertical: SPACING.lg,
        borderRadius: 12,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
