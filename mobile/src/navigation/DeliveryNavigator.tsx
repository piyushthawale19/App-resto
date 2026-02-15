import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

// Delivery Partner Screens
import DeliveryOrdersScreen from '../../screens/delivery/DeliveryOrdersScreen';
import DeliveryEarningsScreen from '../../screens/delivery/DeliveryEarningsScreen';
import DeliveryProfileScreen from '../../screens/delivery/DeliveryProfileScreen';

const Tab = createBottomTabNavigator();

export default function DeliveryNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary.maroon,
                tabBarInactiveTintColor: Colors.text.secondary,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Orders"
                component={DeliveryOrdersScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Earnings"
                component={DeliveryEarningsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={DeliveryProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
