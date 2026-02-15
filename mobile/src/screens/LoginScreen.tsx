import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../theme';

// Complete web browser authentication
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const { signInWithGoogleToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const { continueAsGuest } = useAuth();

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.idToken) {
                handleGoogleSignIn(authentication.idToken);
            }
        } else if (response?.type === 'error') {
            setLoading(false);
            Alert.alert('Sign In Error', 'Failed to sign in with Google. Please try again.');
        }
    }, [response]);

    const handleGoogleSignIn = async (idToken: string) => {
        try {
            setLoading(true);
            await signInWithGoogleToken(idToken);
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            Alert.alert(
                'Sign In Failed',
                error?.message || 'An error occurred during sign in. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSignInPress = async () => {
        try {
            setLoading(true);
            const result = await promptAsync();
            if (result.type !== 'success') {
                setLoading(false);
            }
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Error', 'Failed to start sign in process. Please try again.');
        }
    };

    const handleSkip = () => {
        continueAsGuest();
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[Colors.primary.maroon, Colors.primary.darkRed || '#5A0808']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {/* Logo/App Name */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>🍽️</Text>
                        <Text style={styles.appName}>Yummyfi</Text>
                        <Text style={styles.tagline}>Delicious food, delivered fresh</Text>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresContainer}>
                        <View style={styles.feature}>
                            <Ionicons name="restaurant" size={24} color="#fff" />
                            <Text style={styles.featureText}>Browse Menu</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="flash" size={24} color="#fff" />
                            <Text style={styles.featureText}>Fast Delivery</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="star" size={24} color="#fff" />
                            <Text style={styles.featureText}>Best Quality</Text>
                        </View>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                        onPress={handleSignInPress}
                        disabled={loading || !request}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                                <ActivityIndicator color={Colors.primary.maroon} />
                            ) : (
                            <>
                                <Ionicons name="logo-google" size={24} color="#fff" />
                                <Text style={styles.signInButtonText}>Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSkip}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.skipButtonText}>Skip for now</Text>
                    </TouchableOpacity>

                    {/* Terms */}
                    <Text style={styles.termsText}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl * 2,
    },
    logoEmoji: {
        fontSize: 80,
        marginBottom: Spacing.md,
    },
    appName: {
        fontSize: 42,
        fontWeight: '800',
        color: '#fff',
        marginBottom: Spacing.xs,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: Spacing.xxl * 2,
        paddingHorizontal: Spacing.lg,
    },
    feature: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    featureText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
        textAlign: 'center',
    },
    signInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: 12,
        width: '100%',
        maxWidth: 320,
        gap: Spacing.sm,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    signInButtonDisabled: {
        opacity: 0.6,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary.maroon,
    },
    termsText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        lineHeight: 18,
    },
    skipButton: {
        marginTop: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    skipButtonText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
