// ─── Explore More section ───
import React, { memo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import type { ExploreItem } from '../../types/restaurant';

interface ExploreMoreProps {
    items: ExploreItem[];
    onItemPress?: (item: ExploreItem) => void;
}

const ExploreMoreComponent = ({ items, onItemPress }: ExploreMoreProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>EXPLORE MORE</Text>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => onItemPress?.(item)}
                    >
                        <View style={styles.imageWrap}>
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.image}
                                contentFit="cover"
                                transition={300}
                            />
                        </View>
                        <Text style={styles.label}>{item.title}</Text>
                    </Pressable>
                )}
            />
        </View>
    );
};

export const ExploreMore = memo(ExploreMoreComponent);

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.xxl,
    },
    title: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
        letterSpacing: 1.5,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    list: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    card: {
        alignItems: 'center',
        width: 90,
    },
    imageWrap: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        backgroundColor: Colors.background,
        ...Shadow.sm,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    label: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
});
