import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { ToastProvider } from './src/context/ToastContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastOverlay } from './src/components/Toast';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    React.useEffect(() => {
        // Cleanup any legacy first-launch flag left from previous experiments
        (async () => {
            try {
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                await AsyncStorage.removeItem('hasSeenSignInPrompt');
            } catch (e) {
                // ignore
            }
        })();
    }, []);
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ToastProvider>
                    <AuthProvider>
                        <AppProvider>
                            <StatusBar style="light" />
                            <AppNavigator />
                            <ToastOverlay />
                        </AppProvider>
                    </AuthProvider>
                </ToastProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
