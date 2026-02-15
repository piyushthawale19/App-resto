import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Animated,
    Easing,
    Dimensions,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';

const { width, height } = Dimensions.get('window');

// Safely check for Google client ID
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_CONFIGURED = !!GOOGLE_WEB_CLIENT_ID;

// Only initialize Google auth when client ID exists (prevents crash)
let useGoogleAuth: () => { request: any; response: any; promptAsync: () => void };

if (GOOGLE_CONFIGURED) {
    const Google = require('expo-auth-session/providers/google');
    const WebBrowser = require('expo-web-browser');
    WebBrowser.maybeCompleteAuthSession();

    useGoogleAuth = () => {
        const [request, response, promptAsync] = Google.useAuthRequest({
            webClientId: GOOGLE_WEB_CLIENT_ID,
            androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        });
        return { request, response, promptAsync };
    };
} else {
    useGoogleAuth = () => ({ request: null, response: null, promptAsync: () => { } });
}

// Floating food emoji component
function FloatingEmoji({ emoji, delay, startX, duration }: { emoji: string; delay: number; startX: number; duration: number }) {
    const translateY = useRef(new Animated.Value(height + 50)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            translateY.setValue(height + 50);
            opacity.setValue(0);

            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: duration,
                    delay: delay,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 0.15,
                        duration: 1000,
                        delay: delay,
                        useNativeDriver: false,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.15,
                        duration: duration - 2000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.timing(rotate, {
                    toValue: 1,
                    duration: duration,
                    delay: delay,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
            ]).start(() => startAnimation());
        };
        startAnimation();
    }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.Text
            style={[
                styles.floatingEmoji,
                {
                    left: startX,
                    transform: [{ translateY }, { rotate: spin }],
                    opacity,
                },
            ]}
        >
            {emoji}
        </Animated.Text>
    );
}

export default function SignIn() {
    const [loading, setLoading] = useState(false);
    const { signInWithGoogleToken } = useAuth();
    const { request, response, promptAsync } = useGoogleAuth();

    // Animations
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const cardTranslateY = useRef(new Animated.Value(60)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(0.8)).current;
    const btnOpacity = useRef(new Animated.Value(0)).current;
    const footerOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 4,
                tension: 60,
                useNativeDriver: false,
            }),
            Animated.sequence([
                Animated.timing(logoRotate, { toValue: 0.02, duration: 100, useNativeDriver: false }),
                Animated.timing(logoRotate, { toValue: -0.02, duration: 100, useNativeDriver: false }),
                Animated.timing(logoRotate, { toValue: 0, duration: 100, useNativeDriver: false }),
            ]),
        ]).start();

        Animated.parallel([
            Animated.timing(cardTranslateY, {
                toValue: 0,
                duration: 700,
                delay: 300,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: false,
            }),
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 600,
                delay: 300,
                useNativeDriver: false,
            }),
        ]).start();

        Animated.timing(titleOpacity, {
            toValue: 1, duration: 500, delay: 500, useNativeDriver: false,
        }).start();

        Animated.timing(subtitleOpacity, {
            toValue: 1, duration: 500, delay: 650, useNativeDriver: false,
        }).start();

        Animated.parallel([
            Animated.spring(btnScale, {
                toValue: 1, friction: 5, tension: 80, delay: 800, useNativeDriver: false,
            }),
            Animated.timing(btnOpacity, {
                toValue: 1, duration: 400, delay: 800, useNativeDriver: false,
            }),
        ]).start();

        Animated.timing(footerOpacity, {
            toValue: 1, duration: 500, delay: 1000, useNativeDriver: false,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: false }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
            ])
        ).start();

        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: false,
            })
        ).start();
    }, []);

    useEffect(() => {
        if (response?.type === 'success') {
            const token = response.params?.id_token || response.authentication?.idToken || response.authentication?.accessToken;
            if (token) {
                handleGoogleSignIn(token);
            } else {
                Alert.alert('Error', 'No authentication token received from Google');
            }
        } else if (response?.type === 'error') {
            Alert.alert('Google Auth Error', response.error?.message || 'Something went wrong');
        }
    }, [response]);

    const handleGoogleSignIn = async (token: string) => {
        setLoading(true);
        try {
            await signInWithGoogleToken(token);
            router.replace('/(tabs)');
        } catch (err: any) {
            Alert.alert('Sign In Error', err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGooglePress = () => {
        if (!GOOGLE_CONFIGURED) {
            Alert.alert(
                'Setup Required',
                'Google Sign-In needs a Web Client ID.\n\nAdd this line to your mobile/.env file:\n\nEXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id\n\nThen restart the Expo server.',
            );
            return;
        }
        promptAsync();
    };

    const logoSpin = logoRotate.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-30deg', '30deg'],
    });

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#4E0A0A', '#2D0606', '#1A0303']}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <FloatingEmoji emoji="🍛" delay={0} startX={width * 0.1} duration={8000} />
            <FloatingEmoji emoji="🍕" delay={2000} startX={width * 0.7} duration={10000} />
            <FloatingEmoji emoji="🍔" delay={4000} startX={width * 0.4} duration={9000} />
            <FloatingEmoji emoji="🌮" delay={1000} startX={width * 0.85} duration={11000} />
            <FloatingEmoji emoji="🍜" delay={3000} startX={width * 0.25} duration={7500} />
            <FloatingEmoji emoji="🧁" delay={5000} startX={width * 0.55} duration={9500} />

            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            transform: [
                                { scale: logoScale },
                                { rotate: logoSpin },
                            ],
                        },
                    ]}
                >
                    <View style={styles.logoGlow} />
                    <View style={styles.logoBorder}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.card,
                        {
                            transform: [{ translateY: cardTranslateY }],
                            opacity: cardOpacity,
                        },
                    ]}
                >
                    <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
                        Welcome
                    </Animated.Text>
                    <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
                        Sign in to continue to Yummyfi
                    </Animated.Text>

                    <View style={styles.decorDivider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerIcon}>🍽️</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Animated.View
                        style={{
                            transform: [{ scale: Animated.multiply(btnScale, pulseAnim) }],
                            opacity: btnOpacity,
                        }}
                    >
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGooglePress}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#4E0A0A" size="small" />
                            ) : (
                                <>
                                    <View style={styles.googleIconContainer}>
                                        <Text style={styles.googleIconG}>G</Text>
                                    </View>
                                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.shimmerContainer}>
                        <Animated.View
                            style={[
                                styles.shimmerBar,
                                { transform: [{ translateX: shimmerTranslate }] },
                            ]}
                        />
                    </View>

                    <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>

                <Animated.Text style={[styles.tagline, { opacity: footerOpacity }]}>
                    Food Like Home Style 🏠
                </Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    floatingEmoji: {
        position: 'absolute',
        fontSize: 36,
        zIndex: 0,
    },
    decorCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(244, 180, 0, 0.04)',
        top: -80,
        right: -100,
    },
    decorCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(244, 180, 0, 0.03)',
        bottom: -50,
        left: -60,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
        zIndex: 1,
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoGlow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(244, 180, 0, 0.15)',
    },
    logoBorder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#F4B400',
        overflow: 'hidden',
        backgroundColor: '#4E0A0A',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        paddingVertical: 36,
        paddingHorizontal: 28,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1A0303',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    decorDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 28,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerIcon: {
        marginHorizontal: 12,
        fontSize: 18,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        height: 58,
        paddingHorizontal: 28,
        width: '100%',
        minWidth: 280,
        gap: 14,
    },
    googleIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleIconG: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4285F4',
    },
    googleButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    shimmerContainer: {
        width: '80%',
        height: 2,
        backgroundColor: '#F3F4F6',
        borderRadius: 1,
        overflow: 'hidden',
        marginTop: 24,
        marginBottom: 20,
    },
    shimmerBar: {
        width: 60,
        height: '100%',
        backgroundColor: '#F4B400',
        borderRadius: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    linkText: {
        color: '#4E0A0A',
        fontSize: 14,
        fontWeight: '700',
    },
    tagline: {
        marginTop: 28,
        color: 'rgba(244, 180, 0, 0.6)',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1,
    },
});
