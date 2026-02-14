// ─── Location Selection Screen ───
// Full-featured location picker with GPS, search, and saved addresses

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TextInput,
    Pressable,
    Alert,
    Platform,
    ActivityIndicator,
    Dimensions,
    Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';

import { Colors } from '../src/constants/colors';
import { Spacing } from '../src/constants/spacing';
import { FontSize, FontWeight } from '../src/constants/typography';

import {
    requestLocationPermission,
    getCurrentPosition,
    reverseGeocode,
    getFullLocationData,
    searchPlaceSuggestions,
} from '../src/services/locationService';
import type { SavedAddress, PlaceSuggestion } from '../src/types/address';
import { subscribeToAddresses } from '../src/services/firestoreService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LocationScreen() {
    const router = useRouter();
    const searchInputRef = useRef<TextInput>(null);

    // ─── State ───
    const [searchQuery, setSearchQuery] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches] = useState<string[]>([]);

    // ─── Load saved addresses from Firebase ───
    useEffect(() => {
        const unsubscribe = subscribeToAddresses((addresses) => {
            setSavedAddresses(addresses);
        });
        return () => unsubscribe();
    }, []);

    // ─── Detect GPS Location ───
    const detectCurrentLocation = useCallback(async () => {
        setIsDetecting(true);
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                Alert.alert(
                    'Location Permission',
                    'Please enable location permissions in your device settings to use this feature.',
                    [{ text: 'OK' }]
                );
                setIsDetecting(false);
                return;
            }

            const locationData = await getFullLocationData();
            if (!locationData.error) {
                // Auto-select detected location and go back
                router.back();
            } else {
                Alert.alert('Detection Failed', 'Could not detect your location. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while detecting location.');
            console.error('Location detection error:', error);
        }
        setIsDetecting(false);
    }, [router]);

    // ─── Search ───
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchPlaceSuggestions(query);
            setSuggestions(results);
        } catch (error) {
            console.error('Search error:', error);
        }
        setIsSearching(false);
    }, []);

    // ─── Select Address ───
    const selectAddress = useCallback((address: SavedAddress) => {
        Keyboard.dismiss();
        // In a real app, save selected address to context/AsyncStorage
        router.back();
    }, [router]);

    // ─── Select Suggestion ───
    const selectSuggestion = useCallback((suggestion: PlaceSuggestion) => {
        Keyboard.dismiss();
        // In a real app, forward geocode and save
        router.back();
    }, [router]);

    // ─── Address type icon ───
    const getAddressIcon = (type?: string) => {
        switch (type) {
            case 'home': return 'home';
            case 'work': return 'briefcase';
            default: return 'location';
        }
    };

    const getAddressIconColor = (type?: string) => {
        switch (type) {
            case 'home': return Colors.primary;
            case 'work': return Colors.info;
            default: return Colors.textTertiary;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundWhite} />

            {/* ─── Top Bar ─── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </Pressable>
                <Text style={styles.topBarTitle}>Select delivery location</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ─── Search Input ─── */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrap}>
                    <Ionicons name="search" size={20} color={Colors.textTertiary} style={styles.searchIcon} />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder='Search for area, street, landmark...'
                        placeholderTextColor={Colors.textTertiary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoFocus={false}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => { setSearchQuery(''); setSuggestions([]); }} hitSlop={8}>
                            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* ─── Search Suggestions ─── */}
            {searchQuery.length >= 3 && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.suggestionsContainer}>
                    {isSearching ? (
                        <View style={styles.searchingRow}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.searchingText}>Searching...</Text>
                        </View>
                    ) : suggestions.length === 0 ? (
                        <View style={styles.noResultsRow}>
                            <Ionicons name="search" size={24} color={Colors.textTertiary} />
                            <Text style={styles.noResultsText}>No results found</Text>
                            <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                        </View>
                    ) : (
                        <ScrollView keyboardShouldPersistTaps="handled">
                            {suggestions.map((s, i) => (
                                <Pressable
                                    key={s.id}
                                    style={styles.suggestionRow}
                                    onPress={() => selectSuggestion(s)}
                                >
                                    <Ionicons name="location-outline" size={22} color={Colors.textSecondary} />
                                    <View style={styles.suggestionText}>
                                        <Text style={styles.suggestionTitle}>{s.title}</Text>
                                        <Text style={styles.suggestionDesc} numberOfLines={1}>{s.description}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}
                </Animated.View>
            )}

            {/* ─── Main Scrollable Content ─── */}
            {searchQuery.length < 3 && (
                <ScrollView
                    style={styles.mainScroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ─── Use Current Location Button ─── */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <Pressable
                            style={styles.detectBtn}
                            onPress={detectCurrentLocation}
                            disabled={isDetecting}
                        >
                            <View style={styles.detectIconWrap}>
                                {isDetecting ? (
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                ) : (
                                    <Ionicons name="locate" size={22} color={Colors.primary} />
                                )}
                            </View>
                            <View style={styles.detectTextWrap}>
                                <Text style={styles.detectTitle}>Use current location</Text>
                                <Text style={styles.detectSubtitle}>Using GPS</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                        </Pressable>
                    </Animated.View>

                    {/* ─── Saved Addresses ─── */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <Text style={styles.sectionLabel}>SAVED ADDRESSES</Text>
                        {savedAddresses.map((addr, i) => (
                            <Pressable
                                key={addr.id}
                                style={[
                                    styles.addressRow,
                                    i === savedAddresses.length - 1 && styles.addressRowLast,
                                ]}
                                onPress={() => selectAddress(addr)}
                            >
                                <View style={[styles.addressIconWrap, { backgroundColor: getAddressIconColor(addr.type) + '15' }]}>
                                    <Ionicons
                                        name={getAddressIcon(addr.type) as any}
                                        size={20}
                                        color={getAddressIconColor(addr.type)}
                                    />
                                </View>
                                <View style={styles.addressInfo}>
                                    <View style={styles.addressLabelRow}>
                                        <Text style={styles.addressLabel}>{addr.label}</Text>
                                        {addr.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.addressFull} numberOfLines={2}>
                                        {addr.fullAddress}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                            </Pressable>
                        ))}
                    </Animated.View>

                    {/* ─── Recent Searches ─── */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                        <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
                        {recentSearches.map((query, i) => (
                            <Pressable
                                key={i}
                                style={styles.recentRow}
                                onPress={() => handleSearch(query)}
                            >
                                <Ionicons name="time-outline" size={20} color={Colors.textTertiary} />
                                <Text style={styles.recentText}>{query}</Text>
                            </Pressable>
                        ))}
                    </Animated.View>

                    {/* ─── Add New Address ─── */}
                    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                        <Pressable style={styles.addNewBtn}>
                            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                            <Text style={styles.addNewText}>Add new address</Text>
                        </Pressable>
                    </Animated.View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    // ─── Top Bar ───
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.backgroundWhite,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBarTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semiBold,
        color: Colors.textPrimary,
    },

    // ─── Search ───
    searchContainer: {
        backgroundColor: Colors.backgroundWhite,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    searchInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSize.base,
        color: Colors.textPrimary,
        padding: 0,
    },

    // ─── Suggestions ───
    suggestionsContainer: {
        flex: 1,
        backgroundColor: Colors.backgroundWhite,
    },
    searchingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    searchingText: {
        fontSize: FontSize.base,
        color: Colors.textSecondary,
    },
    noResultsRow: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    noResultsText: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semiBold,
        color: Colors.textPrimary,
        marginTop: 12,
    },
    noResultsSubtext: {
        fontSize: FontSize.sm,
        color: Colors.textTertiary,
        marginTop: 4,
    },
    suggestionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.divider,
        gap: 12,
    },
    suggestionText: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.medium,
        color: Colors.textPrimary,
    },
    suggestionDesc: {
        fontSize: FontSize.sm,
        color: Colors.textTertiary,
        marginTop: 2,
    },

    // ─── Main ───
    mainScroll: {
        flex: 1,
    },

    // ─── Detect Location ───
    detectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        padding: Spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.divider,
    },
    detectIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    detectTextWrap: {
        flex: 1,
    },
    detectTitle: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.semiBold,
        color: Colors.primary,
    },
    detectSubtitle: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        marginTop: 2,
    },

    // ─── Section Label ───
    sectionLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.textTertiary,
        letterSpacing: 1.2,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
        marginHorizontal: Spacing.lg,
    },

    // ─── Address Row ───
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.divider,
    },
    addressRowLast: {
        borderBottomWidth: 0,
    },
    addressIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    addressInfo: {
        flex: 1,
    },
    addressLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addressLabel: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.semiBold,
        color: Colors.textPrimary,
    },
    defaultBadge: {
        backgroundColor: Colors.primaryLight,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    defaultBadgeText: {
        fontSize: 9,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
        letterSpacing: 0.5,
    },
    addressFull: {
        fontSize: FontSize.sm,
        color: Colors.textTertiary,
        marginTop: 3,
        lineHeight: 18,
    },

    // ─── Recent Searches ───
    recentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.divider,
        gap: 12,
    },
    recentText: {
        fontSize: FontSize.base,
        color: Colors.textPrimary,
    },

    // ─── Add New ───
    addNewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        padding: Spacing.lg,
        marginTop: Spacing.xl,
        gap: 12,
    },
    addNewText: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.semiBold,
        color: Colors.primary,
    },
});
