// ─── Veg/Non-Veg Toggle (Swiggy-style ON/OFF icons) ───
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';

interface VegToggleProps {
    isVeg: boolean;
    isNonVeg: boolean;
    onToggleVeg: () => void;
    onToggleNonVeg: () => void;
}

const VegToggleComponent = ({ isVeg, isNonVeg, onToggleVeg, onToggleNonVeg }: VegToggleProps) => {
    return (
        <View style={styles.container}>
            {/* Veg toggle */}
            <Pressable
                style={[styles.toggleBtn, isVeg && styles.vegActive]}
                onPress={onToggleVeg}
            >
                <View style={[styles.vegIcon, { borderColor: Colors.veg }]}>
                    <View style={[styles.vegDot, { backgroundColor: Colors.veg }]} />
                </View>
                <Text style={[styles.label, isVeg && styles.labelActive]}>
                    {isVeg ? 'ON' : 'OFF'}
                </Text>
            </Pressable>

            {/* Non-Veg toggle */}
            <Pressable
                style={[styles.toggleBtn, isNonVeg && styles.nonVegActive]}
                onPress={onToggleNonVeg}
            >
                <View style={[styles.vegIcon, { borderColor: Colors.nonVeg }]}>
                    <View style={[styles.vegDot, { backgroundColor: Colors.nonVeg }]} />
                </View>
                <Text style={[styles.label, isNonVeg && styles.labelActiveRed]}>
                    {isNonVeg ? 'ON' : 'OFF'}
                </Text>
            </Pressable>
        </View>
    );
};

export const VegToggle = memo(VegToggleComponent);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.backgroundWhite,
        gap: 6,
    },
    vegActive: {
        backgroundColor: Colors.secondaryLight,
        borderColor: Colors.secondary,
    },
    nonVegActive: {
        backgroundColor: Colors.accentLight,
        borderColor: Colors.accent,
    },
    vegIcon: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
    },
    vegDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
    },
    label: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.textTertiary,
    },
    labelActive: {
        color: Colors.secondary,
    },
    labelActiveRed: {
        color: Colors.accent,
    },
});
