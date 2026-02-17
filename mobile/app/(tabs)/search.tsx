import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    Pressable,
    SafeAreaView,
    Dimensions,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAROON = '#7A0C0C';
const CREAM = '#FFF8F3';

export default function SearchScreen() {
    const router = useRouter();
    const { products, addToCart, favorites, toggleFavorite } = useApp();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Search Header */}
            <View style={styles.header}>
                <View style={[styles.searchBox, isFocused && styles.searchBoxFocused]}>
                    <Ionicons
                        name="search"
                        size={20}
                        color={isFocused ? MAROON : "#9CA3AF"}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for dishes, restaurants..."
                        placeholderTextColor="#9CA3AF"
                        value={query}
                        onChangeText={setQuery}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        autoFocus
                        selectionColor={MAROON}
                        underlineColorAndroid="transparent"
                        inputMode="search"
                    />
                    {query.length > 0 && (
                        <Pressable onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </Pressable>
                    )}
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Recent Searches */}
                {query.length === 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Popular Searches</Text>
                        <View style={styles.popularTags}>
                            {['Biryani', 'Pizza', 'Burger', 'Momos', 'Pasta', 'Ice Cream'].map((tag) => (
                                <Pressable key={tag} style={styles.tag} onPress={() => setQuery(tag)}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Search Results */}
                {query.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.resultsText}>
                            {filteredProducts.length} results for "{query}"
                        </Text>
                        <View style={styles.productsGrid}>
                            {filteredProducts.map((product) => (
                                <Pressable
                                    key={product.id}
                                    style={styles.productCard}
                                    onPress={() => router.push(`/product/${product.id}`)}
                                >
                                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                                    <View style={styles.productInfo}>
                                        <View style={styles.vegBadge}>
                                            <View
                                                style={[
                                                    styles.vegDot,
                                                    { backgroundColor: product.isVeg ? '#22C55E' : '#EF4444' },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.productName} numberOfLines={1}>
                                            {product.name}
                                        </Text>
                                        <Text style={styles.productPrice}>₹{product.price}</Text>
                                        <Pressable style={styles.addBtn} onPress={() => addToCart(product)}>
                                            <Text style={styles.addBtnText}>ADD</Text>
                                        </Pressable>
                                    </View>
                                    <Pressable
                                        style={styles.favoriteBtn}
                                        onPress={() => toggleFavorite(product.id)}
                                    >
                                        <Ionicons
                                            name={favorites.includes(product.id) ? 'heart' : 'heart-outline'}
                                            size={20}
                                            color={favorites.includes(product.id) ? '#EF4444' : '#9CA3AF'}
                                        />
                                    </Pressable>
                                </Pressable>
                            ))}
                        </View>
                        {filteredProducts.length === 0 && (
                            <View style={styles.noResults}>
                                <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                                <Text style={styles.noResultsText}>No items found</Text>
                                <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CREAM,
    },
    header: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingTop: Platform.OS === 'android' ? 40 : 12, // Handle safe area properly
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F5F7',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        gap: 12,
    },
    searchBoxFocused: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        height: '100%',
        paddingVertical: 0, // Remove default padding
        // @ts-ignore
        outlineStyle: 'none',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    popularTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tagText: {
        fontSize: 14,
        color: '#374151',
    },
    resultsText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    productCard: {
        width: (SCREEN_WIDTH - 44) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 6,
        marginBottom: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#F3F4F6',
    },
    productInfo: {
        padding: 12,
    },
    vegBadge: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: MAROON,
        marginBottom: 8,
    },
    addBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: MAROON,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    addBtnText: {
        color: MAROON,
        fontWeight: '700',
        fontSize: 12,
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        padding: 6,
        borderRadius: 20,
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    noResultsSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
});
