import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '../theme';
import { useAuth } from '../context/AuthContext';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';

// Customer Screens
import {
    HomeScreen,
    DiningScreen,
    OrdersScreen,
    ProfileScreen,
    MoreScreen,
    ProductDetailScreen,
    CartScreen,
    LiveTrackingScreen,
    SearchScreen,
    OrderDetailScreen,
    AddressScreen,
    PaymentScreen,
} from '../screens';

// Delivery Partner Screens
import DeliveryOrdersScreen from '../screens/delivery/DeliveryOrdersScreen';
import DeliveryEarningsScreen from '../screens/delivery/DeliveryEarningsScreen';
import DeliveryProfileScreen from '../screens/delivery/DeliveryProfileScreen';

export type RootStackParamList = {
    MainTabs: undefined;
    ProductDetail: { productId: string };
    Cart: undefined;
    LiveTracking: { orderId: string };
    Search: undefined;
    OrderDetail: { orderId: string };
    Address: undefined;
    Payment: { orderId?: string };
};

export type TabParamList = {
    Home: undefined;
    Dining: undefined;
    Orders: undefined;
    Profile: undefined;
    More: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof TabParamList, { outline: string; filled: string }> = {
    Home: { outline: 'home-outline', filled: 'home' },
    Dining: { outline: 'restaurant-outline', filled: 'restaurant' },
    Orders: { outline: 'receipt-outline', filled: 'receipt' },
    Profile: { outline: 'person-outline', filled: 'person' },
    More: { outline: 'grid-outline', filled: 'grid' },
};

// Customer Tab Navigator
const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }: { focused: boolean }) => {
                const icons = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
                return (
                    <Ionicons
                        name={(focused ? icons.filled : icons.outline) as any}
                        size={22}
                        color={focused ? Colors.primary.maroon : Colors.text.light}
                    />
                );
            },
            tabBarActiveTintColor: Colors.primary.maroon,
            tabBarInactiveTintColor: Colors.text.light,
            tabBarStyle: {
                height: 60,
                paddingBottom: 8,
                paddingTop: 4,
                borderTopWidth: 0.5,
                borderTopColor: Colors.border,
                backgroundColor: Colors.background.white,
            },
            tabBarLabelStyle: {
                fontSize: FontSize.xs,
                fontWeight: '600',
            },
        })}
    >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Dining" component={DiningScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
);

// Delivery Partner Tab Navigator
const DeliveryTabNavigator = () => {
    const DeliveryTab = createBottomTabNavigator();
    return (
        <DeliveryTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary.maroon,
                tabBarInactiveTintColor: Colors.text.light,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                    borderTopWidth: 0.5,
                    borderTopColor: Colors.border,
                    backgroundColor: Colors.background.white,
                },
                tabBarLabelStyle: {
                    fontSize: FontSize.xs,
                    fontWeight: '600',
                },
            }}
        >
            <DeliveryTab.Screen 
                name="DeliveryOrders" 
                component={DeliveryOrdersScreen}
                options={{
                    tabBarLabel: 'Orders',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                }}
            />
            <DeliveryTab.Screen 
                name="DeliveryEarnings" 
                component={DeliveryEarningsScreen}
                options={{
                    tabBarLabel: 'Earnings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet" size={size} color={color} />
                    ),
                }}
            />
            <DeliveryTab.Screen 
                name="DeliveryProfile" 
                component={DeliveryProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </DeliveryTab.Navigator>
    );
};

export const AppNavigator = () => {
    const { loading, isAuthenticated, appUser, needsRoleSelection, setUserRole } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary.maroon} />
            </View>
        );
    }

    // If user is not authenticated, show login screen
    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    // If user needs to select role, show role selection screen
    if (needsRoleSelection) {
        return (
            <RoleSelectionScreen 
                onSelectRole={(role) => {
                    setUserRole(role);
                }}
            />
        );
    }

    // Route based on user role
    const MainComponent = appUser?.role === 'delivery_partner' ? DeliveryTabNavigator : TabNavigator;

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="MainTabs" component={MainComponent} />
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
                <Stack.Screen name="Address" component={AddressScreen} />
                <Stack.Screen name="Payment" component={PaymentScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background.white,
    },
});
