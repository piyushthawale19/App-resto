import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product, CartItem, Order, Offer, Category, AppSettings, Coupon } from '../types';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
    // Products
    products: Product[];
    productsLoading: boolean;
    // Categories
    categories: Category[];
    // Offers
    offers: Offer[];
    // Cart
    cart: CartItem[];
    cartTotal: number;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    // Orders
    orders: Order[];
    ordersLoading: boolean;
    placeOrder: (orderData: Partial<Order>) => Promise<string | null>;
    cancelOrder: (orderId: string) => Promise<void>;
    // Favorites
    favorites: string[];
    toggleFavorite: (productId: string) => void;
    // Filters
    vegFilter: 'all' | 'veg' | 'nonveg';
    setVegFilter: (f: 'all' | 'veg' | 'nonveg') => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filteredProducts: Product[];
    // Settings
    settings: AppSettings | null;
    // Coupons
    coupons: Coupon[];
    validateCoupon: (code: string) => Promise<Coupon | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@yummyfi_cart';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { user, appUser, updateUserProfile } = useAuth();

    // Products
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    // Categories
    const [categories, setCategories] = useState<Category[]>([]);

    // Offers
    const [offers, setOffers] = useState<Offer[]>([]);

    // Cart
    const [cart, setCart] = useState<CartItem[]>([]);

    // Orders
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Favorites
    const [favorites, setFavorites] = useState<string[]>([]);

    // Filters
    const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Settings
    const [settings, setSettings] = useState<AppSettings | null>(null);
    
    // Coupons
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    // ─── Load Cart from AsyncStorage ───
    useEffect(() => {
        const loadCart = async () => {
            try {
                const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (stored) setCart(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading cart:', e);
            }
        };
        loadCart();
    }, []);

    // ─── Persist Cart ───
    useEffect(() => {
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    // ─── Load favorites from user profile ───
    useEffect(() => {
        if (appUser) {
            setFavorites(appUser.favorites || []);
        }
    }, [appUser]);

    // ─── Subscribe to Products (filter available products) ───
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'products'),
            (snapshot) => {
                const loaded: Product[] = snapshot.docs.map((d) => ({
                    ...(d.data() as Omit<Product, 'id'>),
                    id: d.id,
                }));
                // Filter out unavailable products (isAvailable === false)
                // Products without isAvailable field are considered available
                const availableProducts = loaded.filter(p => p.isAvailable !== false);
                setProducts(availableProducts);
                setProductsLoading(false);
            },
            (error) => {
                console.error('Error loading products:', error);
                setProducts([]);
                setProductsLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // ─── Subscribe to Categories ───
    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'categories'), orderBy('order', 'asc')),
            (snapshot) => {
                const loaded: Category[] = snapshot.docs.map((d) => ({
                    ...(d.data() as Omit<Category, 'id'>),
                    id: d.id,
                }));
                setCategories(loaded);
            },
            () => setCategories([])
        );
        return () => unsubscribe();
    }, []);

    // ─── Subscribe to Active Offers ───
    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'offers'), where('isActive', '==', true)),
            (snapshot) => {
                const loaded: Offer[] = snapshot.docs.map((d) => ({
                    ...(d.data() as Omit<Offer, 'id'>),
                    id: d.id,
                }));
                setOffers(loaded);
            },
            () => setOffers([])
        );
        return () => unsubscribe();
    }, []);

    // ─── Subscribe to User Orders ───
    useEffect(() => {
        if (!user) {
            setOrders([]);
            setOrdersLoading(false);
            return;
        }
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const loaded: Order[] = snapshot.docs.map((d) => ({
                    ...(d.data() as Omit<Order, 'id'>),
                    id: d.id,
                }));
                setOrders(loaded);
                setOrdersLoading(false);
            },
            (error) => {
                console.error('Error loading orders:', error);
                setOrders([]);
                setOrdersLoading(false);
            }
        );
        return () => unsubscribe();
    }, [user]);

    // ─── Subscribe to Settings ───
    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, 'settings', 'app'),
            (snapshot) => {
                if (snapshot.exists()) {
                    setSettings(snapshot.data() as AppSettings);
                }
            }
        );
        return () => unsubscribe();
    }, []);

    // ─── Subscribe to Active Coupons ───
    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'coupons'), where('isActive', '==', true)),
            (snapshot) => {
                const loaded: Coupon[] = snapshot.docs.map((d) => ({
                    ...(d.data() as Omit<Coupon, 'id'>),
                    id: d.id,
                }));
                setCoupons(loaded);
            },
            () => setCoupons([])
        );
        return () => unsubscribe();
    }, []);

    // ─── Filtered Products ───
    const filteredProducts = products.filter((p) => {
        if (vegFilter === 'veg' && !p.isVeg) return false;
        if (vegFilter === 'nonveg' && p.isVeg) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
            );
        }
        return true;
    });

    // ─── Cart Helpers ───
    const cartTotal = cart.reduce(
        (sum, item) => sum + (item.offerPrice || item.price) * item.quantity,
        0
    );

    const addToCart = useCallback((product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id === productId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[]
        );
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    // ─── Validate Coupon ───
    const validateCoupon = async (code: string): Promise<Coupon | null> => {
        if (!code.trim()) return null;
        
        const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        if (!coupon) return null;
        
        // Check if coupon is valid
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validTo = new Date(coupon.validTo);
        
        if (now < validFrom || now > validTo) return null;
        if (!coupon.isActive) return null;
        if (coupon.usedCount >= coupon.usageLimit) return null;
        if (cartTotal < coupon.minOrderAmount) return null;
        
        return coupon;
    };

    // ─── Place Order ───
    const placeOrder = async (orderData: Partial<Order>): Promise<string | null> => {
        if (!user || cart.length === 0) return null;

        const deliveryFee = settings?.deliveryFee ?? 0;
        const freeDeliveryAbove = settings?.freeDeliveryAbove ?? 0;
        const isFreeDelivery = cartTotal >= freeDeliveryAbove;
        const total = cartTotal;
        const finalAmount = total + (isFreeDelivery ? 0 : deliveryFee) - (orderData.discount || 0);

        const newOrder: Omit<Order, 'id'> = {
            userId: user.uid,
            items: [...cart],
            totalAmount: total,
            deliveryFee: isFreeDelivery ? 0 : deliveryFee,
            discount: orderData.discount || 0,
            finalAmount,
            status: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
            paymentMethod: orderData.paymentMethod || 'cod',
            paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
            deliveryAddress: orderData.deliveryAddress!,
            customerName: appUser?.displayName || 'Guest',
            customerEmail: appUser?.email || '',
            customerPhone: orderData.customerPhone || '',
            couponCode: orderData.couponCode,
            razorpayPaymentId: orderData.razorpayPaymentId,
            razorpayOrderId: orderData.razorpayOrderId,
            createdAt: new Date().toISOString(),
        };

        try {
            const docRef = await addDoc(collection(db, 'orders'), newOrder);
            clearCart();
            return docRef.id;
        } catch (error) {
            console.error('Error placing order:', error);
            return null;
        }
    };

    // ─── Cancel Order ───
    const cancelOrder = async (orderId: string) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        // Can only cancel if not yet picked up
        if (['picked_up', 'on_the_way', 'delivered'].includes(order.status)) {
            throw new Error('Cannot cancel order at this stage. Please contact support.');
        }

        await updateDoc(doc(db, 'orders', orderId), {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancelledBy: 'user',
        });
    };

    // ─── Toggle Favorite ───
    const toggleFavorite = async (productId: string) => {
        const newFavorites = favorites.includes(productId)
            ? favorites.filter((id) => id !== productId)
            : [...favorites, productId];
        setFavorites(newFavorites);
        if (user) {
            await updateUserProfile({ favorites: newFavorites });
        }
    };

    return (
        <AppContext.Provider
            value={{
                products,
                productsLoading,
                categories,
                offers,
                cart,
                cartTotal,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                orders,
                ordersLoading,
                placeOrder,
                cancelOrder,
                favorites,
                toggleFavorite,
                vegFilter,
                setVegFilter,
                searchQuery,
                setSearchQuery,
                filteredProducts,
                settings,
                coupons,
                validateCoupon,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
};
