// ─── Premium Search Bar (Swiggy-style) ───
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';

interface SearchBarProps {
    onPress: () => void;
    placeholder?: string;
}

const SearchBarComponent = ({ onPress, placeholder = 'Search for dishes, restaurants...' }: SearchBarProps) => {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <View style={styles.searchRow}>
                <Ionicons name="search" size={22} color={Colors.textTertiary} />
                <Text style={styles.placeholder}>{placeholder}</Text>
            </View>
        </Pressable>
    );
};

export const SearchBar = memo(SearchBarComponent);

const styles = StyleSheet.create({
    container: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.xs,
        marginBottom: Spacing.md,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md + 2,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    placeholder: {
        flex: 1,
        marginLeft: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.textTertiary,
        fontWeight: FontWeight.regular,
    },
});
