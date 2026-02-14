// ─── Premium Category Strip (Real food images, horizontal scroll) ───
import React, { memo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import type { FoodCategory } from '../../types/restaurant';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SIZE = 72;

interface CategoryStripProps {
    categories: FoodCategory[];
    onCategorySelect: (categoryId: string) => void;
    selectedCategory?: string;
}

const CategoryItem = memo(({
    item,
    isSelected,
    onPress,
}: {
    item: FoodCategory;
    isSelected: boolean;
    onPress: () => void;
}) => (
    <Pressable style={styles.categoryItem} onPress={onPress}>
        <View style={[styles.imageWrap, isSelected && styles.imageWrapActive]}>
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.categoryImage}
                contentFit="cover"
                transition={300}
            />
        </View>
        <Text style={[styles.categoryName, isSelected && styles.categoryNameActive]} numberOfLines={1}>
            {item.name}
        </Text>
        {isSelected && <View style={styles.activeIndicator} />}
    </Pressable>
));

const CategoryStripComponent = ({
    categories,
    onCategorySelect,
    selectedCategory = 'all',
}: CategoryStripProps) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <CategoryItem
                        item={item}
                        isSelected={selectedCategory === item.id}
                        onPress={() => onCategorySelect(item.id)}
                    />
                )}
            />
        </View>
    );
};

export const CategoryStrip = memo(CategoryStripComponent);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundWhite,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xs,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: Spacing.xl,
        width: ITEM_SIZE,
    },
    imageWrap: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: ITEM_SIZE / 2,
        overflow: 'hidden',
        backgroundColor: Colors.background,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    imageWrapActive: {
        borderColor: Colors.secondary,
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryName: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: FontWeight.medium,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    categoryNameActive: {
        color: Colors.textPrimary,
        fontWeight: FontWeight.bold,
    },
    activeIndicator: {
        width: 28,
        height: 3,
        backgroundColor: Colors.secondary,
        borderRadius: 2,
        marginTop: Spacing.xs,
    },
});
