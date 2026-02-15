import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useApp } from '../context/AppContext';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../theme';

// Provide a safe fallback in case `Colors` is not yet initialized (circular import/runtime edge-case)
const SafeColors = (typeof Colors !== 'undefined' && Colors) ? Colors : {
    primary: { maroon: '#7A0C0C' },
    background: { offWhite: '#F5F5F5', white: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#6B7280', light: '#9CA3AF', white: '#FFFFFF' },
    status: { warning: '#F59E0B', info: '#3B82F6', success: '#10B981', error: '#EF4444' },
    border: '#E5E7EB',
};

const C = SafeColors;
import { Order, OrderStatus } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
    pending: { label: 'Pending', color: C.status.warning, icon: 'time-outline' },
    confirmed: { label: 'Confirmed', color: C.status.info, icon: 'checkmark-circle-outline' },
    preparing: { label: 'Preparing', color: '#8B5CF6', icon: 'flame-outline' },
    ready: { label: 'Ready', color: C.status.info, icon: 'checkmark-done-outline' },
    picked_up: { label: 'Picked Up', color: '#F97316', icon: 'bicycle-outline' },
    on_the_way: { label: 'On the Way', color: C.status.info, icon: 'navigate-outline' },
    delivered: { label: 'Delivered', color: C.status.success, icon: 'checkmark-circle' },
    cancelled: { label: 'Cancelled', color: C.status.error, icon: 'close-circle' },
};

const OrderCard = ({ order, index }: { order: Order; index: number }) => {
    const navigation = useNavigation<NavigationProp>();
    const config = STATUS_CONFIG[order.status];
    const canTrack = ['picked_up', 'on_the_way'].includes(order.status);

    return (
        <Animated.View entering={FadeInDown.delay(index * 60)}>
            <Pressable
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                        <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.orderDate}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
                        <Ionicons name={config.icon as any} size={14} color={config.color} />
                        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                    </View>
                </View>

                <View style={styles.itemsList}>
                    {order.items.slice(0, 3).map((item, i) => (
                        <Text key={i} style={styles.itemText}>
                            {item.quantity}x {item.name}
                        </Text>
                    ))}
                    {order.items.length > 3 && (
                        <Text style={styles.moreItems}>+{order.items.length - 3} more items</Text>
                    )}
                </View>

                <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>₹{order.finalAmount || order.totalAmount}</Text>
                    <View style={styles.footerActions}>
                        {order.paymentMethod && (
                            <View style={styles.paymentBadge}>
                                <Text style={styles.paymentText}>
                                    {order.paymentMethod === 'upi' ? 'UPI' : 'COD'}
                                </Text>
                            </View>
                        )}
                        {canTrack && (
                            <Pressable
                                style={styles.trackBtn}
                                onPress={() => navigation.navigate('LiveTracking', { orderId: order.id })}
                            >
                                <Ionicons name="navigate" size={14} color={C.text.white} />
                                <Text style={styles.trackBtnText}>Track</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
};

export const OrdersScreen = () => {
    const { orders } = useApp();

    const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
    const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Orders</Text>
            </View>

            <FlatList
                data={[...activeOrders, ...pastOrders]}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <OrderCard order={item} index={index} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    activeOrders.length > 0 ? (
                        <Text style={styles.sectionTitle}>Active Orders ({activeOrders.length})</Text>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={80} color={C.text.light} />
                        <Text style={styles.emptyTitle}>No orders yet</Text>
                        <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background.offWhite },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: Spacing.md,
        backgroundColor: C.background.white,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    headerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: C.text.primary },
    listContent: { padding: Spacing.lg, paddingBottom: 100 },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: C.text.primary,
        marginBottom: Spacing.md,
    },
    orderCard: {
        backgroundColor: C.background.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        ...Shadow.small,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    orderIdContainer: {},
    orderId: { fontSize: FontSize.md, fontWeight: '700', color: C.text.primary },
    orderDate: { fontSize: FontSize.xs, color: C.text.light, marginTop: 2 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    statusText: { fontSize: FontSize.xs, fontWeight: '700' },
    itemsList: { marginBottom: Spacing.md },
    itemText: { fontSize: FontSize.sm, color: C.text.secondary, marginBottom: 2 },
    moreItems: { fontSize: FontSize.sm, color: C.text.light, fontStyle: 'italic' },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: Spacing.md,
    },
    orderTotal: { fontSize: FontSize.lg, fontWeight: '700', color: C.text.primary },
    footerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    paymentBadge: {
        backgroundColor: C.background.offWhite,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
    },
    paymentText: { fontSize: FontSize.xs, fontWeight: '600', color: C.text.secondary },
    trackBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.primary.maroon,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
        gap: 4,
    },
    trackBtnText: { color: C.text.white, fontSize: FontSize.sm, fontWeight: '700' },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: C.text.primary, marginTop: Spacing.lg },
    emptySubtitle: { fontSize: FontSize.md, color: C.text.secondary, marginTop: Spacing.sm },
});
