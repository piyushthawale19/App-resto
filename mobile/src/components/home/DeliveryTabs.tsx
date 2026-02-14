// ─── Premium Delivery Tabs (Delivery / Takeaway / Dine-in) ───
import React, { memo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';

type DeliveryMode = 'delivery' | 'takeaway' | 'dinein';

interface DeliveryTabsProps {
    selected: DeliveryMode;
    onSelect: (mode: DeliveryMode) => void;
}

const TAB_DATA: { key: DeliveryMode; label: string; subtitle: string; icon: string }[] = [
    { key: 'delivery', label: 'Delivery', subtitle: '30 Mins', icon: 'bicycle-outline' },
    { key: 'takeaway', label: 'Takeaway', subtitle: 'Select Store', icon: 'bag-handle-outline' },
    { key: 'dinein', label: 'Dine-in', subtitle: 'Select Store', icon: 'restaurant-outline' },
];

const DeliveryTabsComponent = ({ selected, onSelect }: DeliveryTabsProps) => {
    const [tabWidths, setTabWidths] = useState<number[]>([]);
    const [tabPositions, setTabPositions] = useState<number[]>([]);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const selectedIndex = TAB_DATA.findIndex((t) => t.key === selected);

    useEffect(() => {
        if (tabPositions.length > 0 && selectedIndex >= 0) {
            Animated.spring(slideAnim, {
                toValue: tabPositions[selectedIndex] || 0,
                useNativeDriver: true,
                damping: 18,
                stiffness: 150,
            }).start();
        }
    }, [selectedIndex, tabPositions]);

    const handleLayout = (index: number, event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;
        setTabWidths((prev) => {
            const copy = [...prev];
            copy[index] = width;
            return copy;
        });
        setTabPositions((prev) => {
            const copy = [...prev];
            copy[index] = x;
            return copy;
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabRow}>
                {TAB_DATA.map((tab, index) => {
                    const isActive = selected === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            style={[styles.tab, isActive && styles.tabActive]}
                            onPress={() => onSelect(tab.key)}
                            onLayout={(e) => handleLayout(index, e)}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={16}
                                color={isActive ? Colors.textWhite : Colors.textSecondary}
                                style={{ marginRight: 4 }}
                            />
                            <View>
                                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                    {tab.label}
                                </Text>
                                <Text style={[styles.tabSubtitle, isActive && styles.tabSubtitleActive]}>
                                    {tab.subtitle}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

export const DeliveryTabs = memo(DeliveryTabsComponent);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.backgroundWhite,
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg,
        padding: 3,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md + 2,
    },
    tabActive: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    tabLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semiBold,
        color: Colors.textSecondary,
    },
    tabLabelActive: {
        color: Colors.textWhite,
    },
    tabSubtitle: {
        fontSize: FontSize.xxs,
        color: Colors.textTertiary,
        marginTop: 1,
    },
    tabSubtitleActive: {
        color: 'rgba(255,255,255,0.8)',
    },
});
