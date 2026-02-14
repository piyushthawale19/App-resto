import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing } from '../../theme';

export default function DeliveryEarningsScreen() {
    const { appUser } = useAuth();
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [weekEarnings, setWeekEarnings] = useState(0);
    const [monthEarnings, setMonthEarnings] = useState(0);
    const [totalDeliveries, setTotalDeliveries] = useState(0);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [baseDeliveryFee, setBaseDeliveryFee] = useState(30);
    const [bonusPercent, setBonusPercent] = useState(10);

    useEffect(() => {
        if (!appUser?.deliveryBoyId) return;

        loadEarnings();
    }, [appUser?.deliveryBoyId]);

    const loadEarnings = async () => {
        if (!appUser?.deliveryBoyId) return;

        try {
            // Load settings first
            const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
            const settings = settingsDoc.exists() ? settingsDoc.data() : null;
            const fee = settings?.deliveryFee ?? 30;
            const bonus = settings?.deliveryPartnerBonusPercent ?? 10;
            setBaseDeliveryFee(fee);
            setBonusPercent(bonus);
            
            // Store in closure for use in onSnapshot
            const currentFee = fee;
            const currentBonus = bonus;

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
                const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));

                // Calculate earnings using current state values
                let today = 0;
                let week = 0;
                let month = 0;
                
                // Use closure values from loadEarnings
                const currentFee = fee;
                const currentBonus = bonus;
                
                orders.forEach(order => {
                    const deliveryFee = currentFee;
                    const bonusAmount = order.finalAmount * (currentBonus / 100);
                    const earning = deliveryFee + bonusAmount;

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
                                    +₹{(baseDeliveryFee + order.finalAmount * (bonusPercent / 100)).toFixed(0)}
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
                    <Text style={styles.infoText}>• Base fee: ₹{baseDeliveryFee} per delivery</Text>
                    <Text style={styles.infoText}>• Bonus: {bonusPercent}% of order value</Text>
                    <Text style={styles.infoText}>• Payments processed weekly</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.offWhite,
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.primary.maroon,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    cardsContainer: {
        flexDirection: 'row',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    earningCard: {
        flex: 1,
        padding: Spacing.lg,
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
        marginBottom: Spacing.xs,
    },
    earningAmount: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: Spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    section: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    orderCard: {
        backgroundColor: '#fff',
        padding: Spacing.lg,
        borderRadius: 12,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    orderEarning: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.status.success,
    },
    orderCustomer: {
        fontSize: 14,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    orderDate: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
    },
    emptyText: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    infoCard: {
        margin: Spacing.md,
        padding: Spacing.lg,
        backgroundColor: '#FFF3E8',
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    infoText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },
});
