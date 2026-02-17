import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, Pressable,
    ActivityIndicator, TextInput, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SIZES } from '../../src/constants/theme';

const STATUS_FILTERS = ['All', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
    pending: COLORS.warning,
    confirmed: COLORS.blue,
    preparing: COLORS.orange,
    ready: COLORS.success,
    picked_up: COLORS.blue,
    on_the_way: COLORS.blue,
    delivered: COLORS.green,
    cancelled: COLORS.red,
};

export default function OrdersScreen() {
    const router = useRouter();
    const { orders, ordersLoading } = useApp();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Last 30 days only
    const thirtyDaysAgo = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString();
    }, []);

    const filtered = useMemo(() => {
        return orders.filter(o => {
            if (o.createdAt < thirtyDaysAgo) return false;
            if (filter !== 'All' && o.status !== filter) return false;
            if (search) {
                const q = search.toLowerCase();
                return o.id.toLowerCase().includes(q) ||
                    o.customerName?.toLowerCase().includes(q);
            }
            return true;
        });
    }, [orders, filter, search, thirtyDaysAgo]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <Pressable onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </Pressable>
                <Text style={s.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View style={[s.searchWrap, isFocused && s.searchWrapFocused]}>
                <Ionicons
                    name="search"
                    size={20}
                    color={isFocused ? COLORS.maroon : COLORS.gray400}
                />
                <TextInput
                    style={s.searchInput}
                    placeholder="Search orders..."
                    placeholderTextColor={COLORS.gray400}
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={COLORS.maroon}
                    underlineColorAndroid="transparent"
                />
                {search.length > 0 && (
                    <Pressable onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
                    </Pressable>
                )}
            </View>

            {/* Status Chips — using ScrollView to avoid vertical stretch */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.chipRow}
                style={s.chipScroll}
            >
                {STATUS_FILTERS.map(item => (
                    <Pressable
                        key={item}
                        style={[s.chip, filter === item && s.chipActive]}
                        onPress={() => setFilter(item)}
                    >
                        <Text style={[s.chipText, filter === item && s.chipTextActive]}>
                            {item === 'All' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Orders List */}
            {ordersLoading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={COLORS.maroon} />
                </View>
            ) : filtered.length === 0 ? (
                <View style={s.center}>
                    <Ionicons name="receipt-outline" size={64} color={COLORS.gray300} />
                    <Text style={s.emptyText}>No orders found</Text>
                    <Text style={s.emptySubtext}>Orders from the last 30 days will appear here</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={o => o.id}
                    contentContainerStyle={{ padding: SIZES.padding }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={s.card}>
                            <View style={s.cardTop}>
                                <View>
                                    <Text style={s.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                                    <Text style={s.orderDate}>{formatDate(item.createdAt)} • {formatTime(item.createdAt)}</Text>
                                </View>
                                <View style={[s.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || COLORS.gray400) + '20' }]}>
                                    <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[item.status] || COLORS.gray400 }]} />
                                    <Text style={[s.statusText, { color: STATUS_COLORS[item.status] || COLORS.gray400 }]}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
                                    </Text>
                                </View>
                            </View>
                            <View style={s.divider} />
                            <View style={s.cardBottom}>
                                <View style={s.infoRow}>
                                    <Ionicons name="fast-food-outline" size={16} color={COLORS.gray500} />
                                    <Text style={s.infoText}>{item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
                                </View>
                                <View style={s.infoRow}>
                                    <Ionicons name="card-outline" size={16} color={COLORS.gray500} />
                                    <Text style={s.infoText}>{item.paymentMethod === 'cod' ? 'Cash' : 'UPI'}</Text>
                                </View>
                                <Text style={s.amount}>₹{item.finalAmount?.toFixed(0) || item.totalAmount?.toFixed(0)}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.cream },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.maroon, paddingHorizontal: 16, paddingVertical: 14, paddingTop: 8,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 8,
        backgroundColor: '#F4F5F7', borderRadius: 16, paddingHorizontal: 16, height: 52,
        borderWidth: 1, borderColor: '#E5E7EB', gap: 12,
    },
    searchWrapFocused: {
        backgroundColor: COLORS.white,
        borderColor: '#D1D5DB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    searchInput: {
        flex: 1, fontSize: 16, color: COLORS.black, height: '100%',
        paddingVertical: 0,
        // @ts-ignore
        outlineStyle: 'none',
    },
    chipScroll: { flexGrow: 0, marginBottom: 4 },
    chipRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200,
    },
    chipActive: { backgroundColor: COLORS.maroon, borderColor: COLORS.maroon },
    chipText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
    chipTextActive: { color: COLORS.white },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
    emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.gray500, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: COLORS.gray400, marginTop: 4 },
    card: {
        backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: COLORS.gray100,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderId: { fontSize: 16, fontWeight: '700', color: COLORS.black },
    orderDate: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 5,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: '600' },
    divider: { height: 1, backgroundColor: COLORS.gray100, marginVertical: 12 },
    cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoText: { fontSize: 13, color: COLORS.gray600 },
    amount: { fontSize: 18, fontWeight: '700', color: COLORS.maroon },
});
