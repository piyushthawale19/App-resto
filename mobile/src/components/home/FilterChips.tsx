// ─── Premium Filter Chips (Swiggy-style horizontal scroll) ───
import React, { memo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import type { FilterOption } from '../../types/restaurant';

interface FilterChipsProps {
    filters: FilterOption[];
    activeFilters: string[];
    onFilterToggle: (filterId: string) => void;
}

const FilterChipItem = memo(({
    item,
    isActive,
    onPress,
}: {
    item: FilterOption;
    isActive: boolean;
    onPress: () => void;
}) => (
    <Pressable
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={onPress}
    >
        {item.icon && (
            <Ionicons
                name={item.icon as any}
                size={14}
                color={isActive ? Colors.textWhite : Colors.textSecondary}
                style={{ marginRight: 4 }}
            />
        )}
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
            {item.label}
        </Text>
        {item.id === 'filters' && (
            <Ionicons
                name="chevron-down"
                size={12}
                color={isActive ? Colors.textWhite : Colors.textSecondary}
                style={{ marginLeft: 2 }}
            />
        )}
    </Pressable>
));

const FilterChipsComponent = ({ filters, activeFilters, onFilterToggle }: FilterChipsProps) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={filters}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <FilterChipItem
                        item={item}
                        isActive={activeFilters.includes(item.id)}
                        onPress={() => onFilterToggle(item.id)}
                    />
                )}
            />
        </View>
    );
};

export const FilterChips = memo(FilterChipsComponent);

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md + 2,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.pill,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.backgroundWhite,
        ...Shadow.xs,
    },
    chipActive: {
        backgroundColor: Colors.textPrimary,
        borderColor: Colors.textPrimary,
    },
    chipText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: Colors.textSecondary,
    },
    chipTextActive: {
        color: Colors.textWhite,
    },
});
