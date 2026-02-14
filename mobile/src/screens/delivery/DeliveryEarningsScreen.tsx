import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING } from '../../constants';

export default function DeliveryEarningsScreen() {
    const { appUser } = useAuth();
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [weekEarnings, setWeekEarnings] = useState(0);
    const [monthEarnings, setMonthEarnings] = useState(0);
    const [totalDeliveries, setTotalDeliveries] = useState(0);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!appUser?.deliveryBoyId) return;

        loadEarnings();
    }, [appUser?.deliveryBoyId]);

    const loadEarnings = async () => {
        if (!appUser?.deliveryBoyId) return;

        try {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            // Query delivered orders
            const q = query(
                collection(db, 'orders'),
                where('assignedDeliveryBoyId', '==', appUser.deliveryBoyId),
                where('status', '==', 'delivered')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

                // Calculate earnings (assume ₹30 per delivery + 10% of order value)
                let today = 0;
                let week = 0;
                let month = 0;

                orders.forEach(order => {
                    const deliveryFee = 30; // Base delivery fee
                    const bonus = order.finalAmount * 0.1; // 10% of order value
                    const earning = deliveryFee + bonus;

                    const deliveredDate = new Date(order.deliveredAt || order.createdAt);

                    if (deliveredDate >= todayStart) {
                        today += earning;
                    }
                    if (deliveredDate >= weekStart) {
                        week += earning;
                    }
                    if (deliveredDate >= monthStart) {
                        month += earning;
                    }
                });

                setTodayEarnings(today);
                setWeekEarnings(week);
                setMonthEarnings(month);
                setTotalDeliveries(orders.length);
                setRecentOrders(orders.slice(0, 10));
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Error loading earnings:', error);
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>Your Earnings</Text>
                    <Text style={styles.subtitle}>Track your delivery income</Text>
                </View>

                {/* Earnings Cards */}
                <View style={styles.cardsContainer}>
                    <View style={[styles.earningCard, styles.todayCard]}>
                        <Text style={styles.earningLabel}>Today</Text>
                        <Text style={styles.earningAmount}>₹{todayEarnings.toFixed(0)}</Text>
                    </View>

                    <View style={[styles.earningCard, styles.weekCard]}>
                        <Text style={styles.earningLabel}>This Week</Text>
                        <Text style={styles.earningAmount}>₹{weekEarnings.toFixed(0)}</Text>
                    </View>

                    <View style={[styles.earningCard, styles.monthCard]}>
                        <Text style={styles.earningLabel}>This Month</Text>
                        <Text style={styles.earningAmount}>₹{monthEarnings.toFixed(0)}</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{totalDeliveries}</Text>
                        <Text style={styles.statLabel}>Total Deliveries</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{appUser?.rating?.toFixed(1) || 'N/A'}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            {totalDeliveries > 0 ? (monthEarnings / totalDeliveries).toFixed(0) : '0'}
                        </Text>
                        <Text style={styles.statLabel}>Avg/Delivery</Text>
                    </View>
                </View>

                {/* Recent Deliveries */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Deliveries</Text>
                    {recentOrders.map((order) => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
                                <Text style={styles.orderEarning}>
                                    +₹{(30 + order.finalAmount * 0.1).toFixed(0)}
                                </Text>
                            </View>
                            <Text style={styles.orderCustomer}>{order.customerName}</Text>
                            <Text style={styles.orderDate}>
                                {new Date(order.deliveredAt || order.createdAt).toLocaleDateString()} at{' '}
                                {new Date(order.deliveredAt || order.createdAt).toLocaleTimeString()}
                            </Text>
                        </View>
                    ))}

                    {recentOrders.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>📦</Text>
                            <Text style={styles.emptyTitle}>No deliveries yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Complete orders to see your earnings
                            </Text>
                        </View>
                    )}
                </View>

                {/* Earnings Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>💡 How earnings work</Text>
                    <Text style={styles.infoText}>• Base fee: ₹30 per delivery</Text>
                    <Text style={styles.infoText}>• Bonus: 10% of order value</Text>
                    <Text style={styles.infoText}>• Payments processed weekly</Text>
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
        padding: SPACING.lg,
        backgroundColor: COLORS.primary,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    cardsContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        gap: SPACING.md,
    },
    earningCard: {
        flex: 1,
        padding: SPACING.lg,
        borderRadius: 16,
        alignItems: 'center',
    },
    todayCard: {
        backgroundColor: '#4CAF50',
    },
    weekCard: {
        backgroundColor: '#2196F3',
    },
    monthCard: {
        backgroundColor: '#FF9800',
    },
    earningLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    earningAmount: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        gap: SPACING.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: SPACING.lg,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    section: {
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    orderCard: {
        backgroundColor: '#fff',
        padding: SPACING.lg,
        borderRadius: 12,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    orderEarning: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.success,
    },
    orderCustomer: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    infoCard: {
        margin: SPACING.md,
        padding: SPACING.lg,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
});
