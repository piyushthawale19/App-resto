import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    SafeAreaView
} from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING } from '../../constants';

export default function DeliveryOrdersScreen() {
    const { appUser } = useAuth();
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!appUser?.deliveryBoyId) return;

        // Listen to orders ready for pickup
        const availableQuery = query(
            collection(db, 'orders'),
            where('status', 'in', ['ready', 'confirmed'])
        );

        const unsubAvailable = onSnapshot(availableQuery, (snapshot) => {
            const orders = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Order))
                .filter(order => !order.assignedDeliveryBoyId);
            setAvailableOrders(orders);
            setLoading(false);
            setRefreshing(false);
        });

        // Listen to my assigned orders
        const assignedQuery = query(
            collection(db, 'orders'),
            where('assignedDeliveryBoyId', '==', appUser.deliveryBoyId),
            where('status', 'in', ['picked_up', 'on_the_way'])
        );

        const unsubAssigned = onSnapshot(assignedQuery, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setAssignedOrders(orders);
        });

        return () => {
            unsubAvailable();
            unsubAssigned();
        };
    }, [appUser?.deliveryBoyId]);

    const handleAcceptOrder = async (orderId: string) => {
        if (!appUser?.deliveryBoyId) return;

        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderRef);

            if (!orderDoc.exists()) {
                Alert.alert('Error', 'Order not found');
                return;
            }

            const orderData = orderDoc.data() as Order;

            // Check if already assigned
            if (orderData.assignedDeliveryBoyId) {
                Alert.alert('Order Taken', 'This order was just accepted by another partner');
                return;
            }

            // Assign order to this delivery partner
            await updateDoc(orderRef, {
                assignedDeliveryBoyId: appUser.deliveryBoyId,
                status: 'picked_up',
                pickedUpAt: new Date().toISOString()
            });

            Alert.alert('Success', 'Order accepted! Start navigation to begin delivery.');
        } catch (error) {
            console.error('Error accepting order:', error);
            Alert.alert('Error', 'Failed to accept order. Please try again.');
        }
    };

    const renderAvailableOrder = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
                <View style={[styles.statusBadge, styles.statusReady]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.address} numberOfLines={2}>
                📍 {item.deliveryAddress.fullAddress}
            </Text>

            <View style={styles.orderDetails}>
                <Text style={styles.detailText}>💰 ₹{item.finalAmount}</Text>
                <Text style={styles.detailText}>📦 {item.items.length} items</Text>
                <Text style={styles.detailText}>🕐 {item.estimatedDeliveryTime || 30} min</Text>
            </View>

            <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(item.id)}
            >
                <Text style={styles.acceptButtonText}>Accept Order</Text>
            </TouchableOpacity>
        </View>
    );

    const renderAssignedOrder = ({ item }: { item: Order }) => (
        <View style={[styles.orderCard, styles.assignedCard]}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
                <View style={[styles.statusBadge, styles.statusActive]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.address} numberOfLines={2}>
                📍 {item.deliveryAddress.fullAddress}
            </Text>

            <View style={styles.orderDetails}>
                <Text style={styles.detailText}>💰 ₹{item.finalAmount}</Text>
                <Text style={styles.detailText}>📦 {item.items.length} items</Text>
            </View>

            <TouchableOpacity
                style={styles.navigateButton}
                onPress={() => {
                    // Navigation will be handled in ActiveDeliveryScreen
                    Alert.alert('Navigate', 'Opening navigation...', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Start', onPress: () => { /* Navigate to ActiveDeliveryScreen */ } }
                    ]);
                }}
            >
                <Text style={styles.navigateButtonText}>🧭 Start Navigation</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Delivery Orders</Text>
                {appUser?.isAvailable ? (
                    <View style={styles.onlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Online</Text>
                    </View>
                ) : (
                    <View style={styles.offlineBadge}>
                        <Text style={styles.offlineText}>Offline</Text>
                    </View>
                )}
            </View>

            {assignedOrders.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active Deliveries ({assignedOrders.length})</Text>
                    <FlatList
                        data={assignedOrders}
                        renderItem={renderAssignedOrder}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    />
                </View>
            )}

            <Text style={styles.sectionTitle}>Available Orders ({availableOrders.length})</Text>
            <FlatList
                data={availableOrders}
                renderItem={renderAvailableOrder}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>🏍️</Text>
                        <Text style={styles.emptyTitle}>No orders available</Text>
                        <Text style={styles.emptySubtitle}>
                            Pull down to refresh or wait for new orders
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success + '20',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: SPACING.xs,
    },
    onlineText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '600',
    },
    offlineBadge: {
        backgroundColor: COLORS.error + '20',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
    },
    offlineText: {
        color: COLORS.error,
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    list: {
        padding: SPACING.md,
    },
    horizontalList: {
        paddingHorizontal: SPACING.lg,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    assignedCard: {
        borderColor: COLORS.primary,
        borderWidth: 2,
        marginRight: SPACING.md,
        width: 300,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    statusBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
    },
    statusReady: {
        backgroundColor: COLORS.warning + '20',
    },
    statusActive: {
        backgroundColor: COLORS.primary + '20',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
        color: COLORS.text,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    address: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    acceptButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    navigateButton: {
        backgroundColor: COLORS.success,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    navigateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl * 3,
    },
    emptyText: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
