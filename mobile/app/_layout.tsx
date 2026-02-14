import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/context/AuthContext';
import { AppProvider } from '../src/context/AppContext';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <AppProvider>
                    <StatusBar style="light" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen
                            name="location"
                            options={{
                                headerShown: false,
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                            }}
                        />
                        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                        <Stack.Screen name="tracking/[id]" options={{ headerShown: false }} />
                    </Stack>
                </AppProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
