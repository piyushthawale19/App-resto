import { Tabs } from 'expo-router';
import { Home, Search, Utensils, ShoppingCart, Menu } from 'lucide-react-native';

const PRIMARY = '#FC8019'; // Swiggy orange
const GRAY = '#93959F';

type TabIconProps = { color: string; size: number };

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: PRIMARY,
                tabBarInactiveTintColor: GRAY,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E8E8E8',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }: TabIconProps) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, size }: TabIconProps) => <Search color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="dining"
                options={{
                    title: 'Dining',
                    tabBarIcon: ({ color, size }: TabIconProps) => <Utensils color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    tabBarIcon: ({ color, size }: TabIconProps) => <ShoppingCart color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ color, size }: TabIconProps) => <Menu color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
