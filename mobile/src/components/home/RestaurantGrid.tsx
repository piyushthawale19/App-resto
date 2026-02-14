// ─── Premium Restaurant Grid (2-column FlatList + Featured Slider) ───
import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import { RestaurantCard } from './RestaurantCard';
import type { Restaurant } from '../../types/restaurant';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RestaurantGridProps {
    restaurants: Restaurant[];
    featuredRestaurants?: Restaurant[];
    onRestaurantPress: (restaurant: Restaurant) => void;
    onBookmark?: (restaurant: Restaurant) => void;
    ListHeaderComponent?: React.ReactElement;
}

const RestaurantGridComponent = ({
    restaurants,
    featuredRestaurants,
    onRestaurantPress,
    onBookmark,
    ListHeaderComponent,
}: RestaurantGridProps) => {

    const renderFeaturedSection = useCallback(() => {
        if (!featuredRestaurants || featuredRestaurants.length === 0) return null;
        return (
            <View style={styles.featuredSection}>
                <Text style={styles.sectionTitle}>RECOMMENDED FOR YOU</Text>
                <FlatList
                    data={featuredRestaurants}
                    keyExtractor={(item) => `featured-${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredList}
                    renderItem={({ item }) => (
                        <RestaurantCard
                            restaurant={item}
                            onPress={onRestaurantPress}
                            onBookmark={onBookmark}
                            variant="featured"
                        />
                    )}
                />
            </View>
        );
    }, [featuredRestaurants, onRestaurantPress, onBookmark]);

    const renderItem = useCallback(({ item }: { item: Restaurant }) => (
        <View style={styles.gridItem}>
            <RestaurantCard
                restaurant={item}
                onPress={onRestaurantPress}
                onBookmark={onBookmark}
                variant="grid"
            />
        </View>
    ), [onRestaurantPress, onBookmark]);

    const keyExtractor = useCallback((item: Restaurant) => item.id, []);

    const ListHeader = useCallback(() => (
        <View>
            {ListHeaderComponent}
            {renderFeaturedSection()}
            <Text style={styles.allTitle}>ALL RESTAURANTS</Text>
        </View>
    ), [ListHeaderComponent, renderFeaturedSection]);

    return (
        <FlatList
            data={restaurants}
            keyExtractor={keyExtractor}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContent}
            ListHeaderComponent={<ListHeader />}
            ListFooterComponent={<View style={{ height: 100 }} />}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={6}
            windowSize={5}
        />
    );
};

export const RestaurantGrid = memo(RestaurantGridComponent);

const styles = StyleSheet.create({
    featuredSection: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
        letterSpacing: 1.5,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    allTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
        letterSpacing: 1.5,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        marginTop: Spacing.sm,
    },
    featuredList: {
        paddingHorizontal: Spacing.lg,
    },
    gridContent: {
        paddingBottom: Spacing.xxl,
    },
    columnWrapper: {
        paddingHorizontal: Spacing.lg,
        justifyContent: 'space-between',
    },
    gridItem: {
        width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
    },
});
