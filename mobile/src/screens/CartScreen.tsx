import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    Platform,
    StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PaymentMethod } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CartScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { cart, cartTotal, removeFromCart, updateQuantity, placeOrder, clearCart, settings, validateCoupon } = useApp();
    const { isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();

    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
    const [loading, setLoading] = useState(false);

    const deliveryFee = settings?.deliveryFee ?? 0;
    const freeDeliveryAbove = settings?.freeDeliveryAbove ?? 0;
    const isFreeDelivery = cartTotal >= freeDeliveryAbove;
    const finalAmount = cartTotal + (isFreeDelivery ? 0 : deliveryFee) - discount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            showError('Please enter a coupon code');
            return;
        }
        
        try {
            const coupon = await validateCoupon(couponCode);
            if (!coupon) {
                showError('Invalid or expired coupon code');
                return;
            }
            
            // Calculate discount
            let calculatedDiscount = 0;
            if (coupon.discountPercent) {
                calculatedDiscount = (cartTotal * coupon.discountPercent) / 100;
                if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
                    calculatedDiscount = coupon.maxDiscount;
                }
            } else if (coupon.discountFlat) {
                calculatedDiscount = coupon.discountFlat;
            }
            
            setDiscount(calculatedDiscount);
            setCouponApplied(true);
            setAppliedCoupon({ code: coupon.code, discount: calculatedDiscount });
            showSuccess(`Coupon applied! ₹${Math.round(calculatedDiscount)} off`);
        } catch (error) {
            showError('Failed to validate coupon. Please try again.');
        }
    };

    const handleRemoveCoupon = () => {
        setCouponApplied(false);
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponCode('');
    };

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            Alert.alert('Login Required', 'Please login to place an order.');
            return;
        }
        if (cart.length === 0) return;

        setLoading(true);
        try {
            if (paymentMethod === 'upi') {
                // Navigate to Razorpay payment screen
                navigation.navigate('Payment');
            } else {
                // COD order
                const orderId = await placeOrder({
                    paymentMethod: 'cod',
                    paymentStatus: 'pending',
                    discount: Math.round(discount),
                    couponCode: appliedCoupon?.code,
                    deliveryAddress: {
                        label: 'Home',
                        fullAddress: 'Select delivery address',
                        lat: 0,
                        lng: 0,
                    },
                });
                if (orderId) {
                    showSuccess('Order placed successfully!');
                    navigation.navigate('MainTabs', { screen: 'Orders' } as any);
                }
            }
        } catch {
            showError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color={Colors.text.light} />
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtitle}>Add items from the menu to get started</Text>
                <Pressable style={styles.browseBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.browseBtnText}>Browse Menu</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Cart ({cart.length})</Text>
                <Pressable onPress={clearCart}>
                    <Text style={styles.clearText}>Clear</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Cart Items */}
                {cart.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        entering={FadeInDown.delay(index * 60)}
                        layout={Layout.springify()}
                        style={styles.cartItem}
                    >
                        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} contentFit="cover" />
                        <View style={styles.itemContent}>
                            <View style={styles.itemHeader}>
                                <View style={[styles.vegIcon, { borderColor: item.isVeg ? Colors.veg : Colors.nonVeg }]}>
                                    <View style={[styles.vegDot, { backgroundColor: item.isVeg ? Colors.veg : Colors.nonVeg }]} />
                                </View>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                            </View>
                            <Text style={styles.itemPrice}>₹{(item.offerPrice || item.price) * item.quantity}</Text>
                            <View style={styles.quantityRow}>
                                <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                                    <Ionicons name="remove" size={18} color={Colors.primary.maroon} />
                                </Pressable>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                                    <Ionicons name="add" size={18} color={Colors.primary.maroon} />
                                </Pressable>
                                <Pressable style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                                    <Ionicons name="trash-outline" size={16} color={Colors.status.error} />
                                </Pressable>
                            </View>
                        </View>
                    </Animated.View>
                ))}

                {/* Coupon */}
                <View style={styles.couponSection}>
                    <Text style={styles.sectionLabel}>Apply Coupon</Text>
                    <View style={styles.couponRow}>
                        <TextInput
                            style={styles.couponInput}
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChangeText={setCouponCode}
                            editable={!couponApplied}
                        />
                        <Pressable
                            style={[styles.couponBtn, couponApplied && styles.couponBtnApplied]}
                            onPress={couponApplied ? handleRemoveCoupon : handleApplyCoupon}
                        >
                            <Text style={styles.couponBtnText}>{couponApplied ? 'Remove' : 'Apply'}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.paymentSection}>
                    <Text style={styles.sectionLabel}>Payment Method</Text>
                    <Pressable
                        style={[styles.paymentOption, paymentMethod === 'upi' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('upi')}
                    >
                        <Ionicons name="phone-portrait" size={20} color={paymentMethod === 'upi' ? Colors.primary.maroon : Colors.text.secondary} />
                        <Text style={[styles.paymentOptionText, paymentMethod === 'upi' && styles.paymentOptionTextActive]}>UPI (Razorpay)</Text>
                        <View style={[styles.radio, paymentMethod === 'upi' && styles.radioActive]} />
                    </Pressable>
                    <Pressable
                        style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <Ionicons name="cash" size={20} color={paymentMethod === 'cod' ? Colors.primary.maroon : Colors.text.secondary} />
                        <Text style={[styles.paymentOptionText, paymentMethod === 'cod' && styles.paymentOptionTextActive]}>Cash on Delivery</Text>
                        <View style={[styles.radio, paymentMethod === 'cod' && styles.radioActive]} />
                    </Pressable>
                </View>

                {/* Bill Summary */}
                <View style={styles.billSection}>
                    <Text style={styles.sectionLabel}>Bill Summary</Text>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>₹{cartTotal}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={[styles.billValue, isFreeDelivery && { color: Colors.status.success }]}>
                            {isFreeDelivery ? 'FREE' : `₹${deliveryFee}`}
                        </Text>
                    </View>
                    {discount > 0 && appliedCoupon && (
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Discount ({appliedCoupon.code})</Text>
                            <Text style={[styles.billValue, { color: Colors.status.success }]}>-₹{Math.round(discount)}</Text>
                        </View>
                    )}
                    <View style={[styles.billRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>To Pay</Text>
                        <Text style={styles.totalValue}>₹{finalAmount}</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.bottomTotal}>₹{finalAmount}</Text>
                    <Text style={styles.bottomSubtext}>Inclusive of taxes</Text>
                </View>
                <Pressable
                    style={[styles.placeOrderBtn, loading && { opacity: 0.7 }]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    <Text style={styles.placeOrderText}>
                        {loading ? 'Placing...' : paymentMethod === 'upi' ? 'Pay Now' : 'Place Order'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background.offWhite },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
    emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text.primary, marginTop: Spacing.lg },
    emptySubtitle: { fontSize: FontSize.md, color: Colors.text.secondary, marginTop: Spacing.sm, textAlign: 'center' },
    browseBtn: {
        backgroundColor: Colors.primary.maroon,
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.xl,
    },
    browseBtnText: { color: Colors.text.white, fontSize: FontSize.lg, fontWeight: '700' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text.primary },
    clearText: { fontSize: FontSize.md, color: Colors.status.error, fontWeight: '600' },
    scrollView: { flex: 1 },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: Colors.background.white,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        ...Shadow.small,
    },
    itemImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
    itemContent: { flex: 1, marginLeft: Spacing.md },
    itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    vegIcon: { width: 14, height: 14, borderWidth: 2, borderRadius: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    vegDot: { width: 6, height: 6, borderRadius: 3 },
    itemName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary, flex: 1 },
    itemPrice: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.primary, marginTop: 4 },
    quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.primary.maroon,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text.primary, minWidth: 24, textAlign: 'center' },
    removeBtn: { marginLeft: 'auto' },
    couponSection: { padding: Spacing.lg },
    sectionLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.md },
    couponRow: { flexDirection: 'row', gap: Spacing.sm },
    couponInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        backgroundColor: Colors.background.white,
    },
    couponBtn: {
        backgroundColor: Colors.primary.maroon,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
    },
    couponBtnApplied: { backgroundColor: Colors.status.error },
    couponBtnText: { color: Colors.text.white, fontWeight: '700', fontSize: FontSize.md },
    paymentSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.white,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.md,
    },
    paymentOptionActive: { borderColor: Colors.primary.maroon, backgroundColor: '#FEF2F2' },
    paymentOptionText: { flex: 1, fontSize: FontSize.md, color: Colors.text.secondary, fontWeight: '500' },
    paymentOptionTextActive: { color: Colors.primary.maroon, fontWeight: '600' },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    radioActive: { borderColor: Colors.primary.maroon, borderWidth: 6 },
    billSection: {
        backgroundColor: Colors.background.white,
        marginHorizontal: Spacing.lg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...Shadow.small,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    billLabel: { fontSize: FontSize.md, color: Colors.text.secondary },
    billValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.md,
        marginTop: Spacing.sm,
        marginBottom: 0,
    },
    totalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.primary },
    totalValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary.maroon },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.lg,
    },
    bottomTotal: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text.primary },
    bottomSubtext: { fontSize: FontSize.xs, color: Colors.text.light },
    placeOrderBtn: {
        backgroundColor: Colors.primary.maroon,
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    placeOrderText: { color: Colors.text.white, fontSize: FontSize.lg, fontWeight: '700' },
});
