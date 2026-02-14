import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    SafeAreaView 
} from 'react-native';
import { Colors, FontSize, Spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { OrderAddress } from '../types';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export const OrderDetailScreen = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Order Details</Text>
        <Text style={styles.subtitle}>Full order detail view</Text>
    </View>
);

export const AddressScreen = () => {
    const { appUser, updateUserProfile } = useAuth();
    const [addresses, setAddresses] = useState<OrderAddress[]>(appUser?.addresses || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newAddress, setNewAddress] = useState<Partial<OrderAddress>>({
        label: '',
        fullAddress: '',
        landmark: '',
    });

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Reverse geocode to get address
            const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (addresses.length > 0) {
                const addr = addresses[0];
                const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`.trim();
                
                setNewAddress(prev => ({
                    ...prev,
                    fullAddress,
                    lat: latitude,
                    lng: longitude,
                }));
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get current location');
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.label || !newAddress.fullAddress) {
            Alert.alert('Missing Info', 'Please fill in label and address');
            return;
        }

        const addressToAdd: OrderAddress = {
            label: newAddress.label,
            fullAddress: newAddress.fullAddress,
            lat: newAddress.lat || 0,
            lng: newAddress.lng || 0,
            landmark: newAddress.landmark,
        };

        const updatedAddresses = [...addresses, addressToAdd];
        setAddresses(updatedAddresses);
        
        await updateUserProfile({ addresses: updatedAddresses });
        
        setNewAddress({ label: '', fullAddress: '', landmark: '' });
        setIsAdding(false);
        Alert.alert('Success', 'Address added successfully');
    };

    const handleDeleteAddress = async (index: number) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedAddresses = addresses.filter((_, i) => i !== index);
                        setAddresses(updatedAddresses);
                        await updateUserProfile({ addresses: updatedAddresses });
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.addressContainer}>
            <View style={styles.addressHeader}>
                <Text style={styles.addressTitle}>My Addresses</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsAdding(!isAdding)}
                >
                    <Ionicons name={isAdding ? 'close' : 'add'} size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.addressContent}>
                {isAdding && (
                    <View style={styles.addForm}>
                        <Text style={styles.formTitle}>Add New Address</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Label (e.g., Home, Work)"
                            value={newAddress.label}
                            onChangeText={(text) => setNewAddress(prev => ({ ...prev, label: text }))}
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Full Address"
                            value={newAddress.fullAddress}
                            onChangeText={(text) => setNewAddress(prev => ({ ...prev, fullAddress: text }))}
                            multiline
                            numberOfLines={3}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Landmark (optional)"
                            value={newAddress.landmark}
                            onChangeText={(text) => setNewAddress(prev => ({ ...prev, landmark: text }))}
                        />

                        <TouchableOpacity
                            style={styles.locationButton}
                            onPress={getCurrentLocation}
                        >
                            <Ionicons name="location" size={20} color={Colors.primary.maroon} />
                            <Text style={styles.locationButtonText}>Use Current Location</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleAddAddress}
                        >
                            <Text style={styles.saveButtonText}>Save Address</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {addresses.map((address, index) => (
                    <View key={index} style={styles.addressCard}>
                        <View style={styles.addressCardHeader}>
                            <Text style={styles.addressLabel}>{address.label}</Text>
                            <TouchableOpacity
                                onPress={() => handleDeleteAddress(index)}
                            >
                                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.addressText}>{address.fullAddress}</Text>
                        {address.landmark && (
                            <Text style={styles.landmarkText}>📍 {address.landmark}</Text>
                        )}
                    </View>
                ))}

                {addresses.length === 0 && !isAdding && (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={64} color={Colors.text.light} />
                        <Text style={styles.emptyTitle}>No addresses saved</Text>
                        <Text style={styles.emptySubtitle}>Add your delivery addresses</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export const PaymentScreen = ({ route }: any) => {
    const orderId = route?.params?.orderId;
    const [selectedMethod, setSelectedMethod] = useState<'upi' | 'cod'>('upi');
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        if (selectedMethod === 'cod') {
            Alert.alert('Success', 'Order placed with Cash on Delivery');
            return;
        }

        // Razorpay integration would go here
        Alert.alert(
            'Payment',
            'Razorpay payment integration in progress. For now, order will be placed with COD.',
            [
                { text: 'OK', onPress: () => {
                    // Navigate back or complete order
                }}
            ]
        );
    };

    return (
        <SafeAreaView style={styles.paymentContainer}>
            <View style={styles.paymentHeader}>
                <Text style={styles.paymentTitle}>Payment</Text>
            </View>

            <ScrollView style={styles.paymentContent}>
                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                <TouchableOpacity
                    style={[
                        styles.paymentMethod,
                        selectedMethod === 'upi' && styles.paymentMethodSelected
                    ]}
                    onPress={() => setSelectedMethod('upi')}
                >
                    <View style={styles.paymentMethodInfo}>
                        <Ionicons name="card-outline" size={24} color={Colors.primary.maroon} />
                        <View style={styles.paymentMethodText}>
                            <Text style={styles.paymentMethodTitle}>UPI / Card</Text>
                            <Text style={styles.paymentMethodSubtitle}>Pay using Razorpay</Text>
                        </View>
                    </View>
                    <Ionicons 
                        name={selectedMethod === 'upi' ? 'radio-button-on' : 'radio-button-off'} 
                        size={24} 
                        color={Colors.primary.maroon} 
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.paymentMethod,
                        selectedMethod === 'cod' && styles.paymentMethodSelected
                    ]}
                    onPress={() => setSelectedMethod('cod')}
                >
                    <View style={styles.paymentMethodInfo}>
                        <Ionicons name="cash-outline" size={24} color={Colors.primary.maroon} />
                        <View style={styles.paymentMethodText}>
                            <Text style={styles.paymentMethodTitle}>Cash on Delivery</Text>
                            <Text style={styles.paymentMethodSubtitle}>Pay when you receive</Text>
                        </View>
                    </View>
                    <Ionicons 
                        name={selectedMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'} 
                        size={24} 
                        color={Colors.primary.maroon} 
                    />
                </TouchableOpacity>

                <View style={styles.paymentNote}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.text.secondary} />
                    <Text style={styles.paymentNoteText}>
                        {selectedMethod === 'upi' 
                            ? 'You will be redirected to Razorpay secure payment gateway'
                            : 'Please keep exact change ready for contactless delivery'
                        }
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.paymentFooter}>
                <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={handlePayment}
                    disabled={processing}
                >
                    <Text style={styles.proceedButtonText}>
                        {processing ? 'Processing...' : 'Proceed to Pay'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.background.offWhite 
    },
    title: { 
        fontSize: FontSize.xxl, 
        fontWeight: '700', 
        color: Colors.text.primary 
    },
    subtitle: { 
        fontSize: FontSize.md, 
        color: Colors.text.secondary, 
        marginTop: Spacing.sm 
    },
    
    // Address Screen Styles
    addressContainer: {
        flex: 1,
        backgroundColor: Colors.background.offWhite,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    addressTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    addButton: {
        backgroundColor: Colors.primary.maroon,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressContent: {
        flex: 1,
        padding: Spacing.md,
    },
    addForm: {
        backgroundColor: '#fff',
        padding: Spacing.lg,
        borderRadius: 12,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    formTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: Spacing.md,
        fontSize: FontSize.md,
        marginBottom: Spacing.md,
        backgroundColor: Colors.background.offWhite,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary.maroon,
        marginBottom: Spacing.md,
    },
    locationButtonText: {
        color: Colors.primary.maroon,
        fontSize: FontSize.md,
        fontWeight: '600',
        marginLeft: Spacing.xs,
    },
    saveButton: {
        backgroundColor: Colors.primary.maroon,
        padding: Spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    addressCard: {
        backgroundColor: '#fff',
        padding: Spacing.lg,
        borderRadius: 12,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    addressCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    addressLabel: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    addressText: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        lineHeight: 20,
    },
    landmarkText: {
        fontSize: FontSize.sm,
        color: Colors.text.light,
        marginTop: Spacing.xs,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xl * 3,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text.primary,
        marginTop: Spacing.md,
    },
    emptySubtitle: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        marginTop: Spacing.xs,
    },
    
    // Payment Screen Styles
    paymentContainer: {
        flex: 1,
        backgroundColor: Colors.background.offWhite,
    },
    paymentHeader: {
        padding: Spacing.lg,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    paymentTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    paymentContent: {
        flex: 1,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    paymentMethod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: Spacing.lg,
        borderRadius: 12,
        marginBottom: Spacing.md,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    paymentMethodSelected: {
        borderColor: Colors.primary.maroon,
        backgroundColor: Colors.primary.maroon + '10',
    },
    paymentMethodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentMethodText: {
        marginLeft: Spacing.md,
    },
    paymentMethodTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    paymentMethodSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    paymentNote: {
        flexDirection: 'row',
        backgroundColor: Colors.background.white,
        padding: Spacing.md,
        borderRadius: 8,
        marginTop: Spacing.md,
    },
    paymentNoteText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginLeft: Spacing.xs,
        lineHeight: 18,
    },
    paymentFooter: {
        padding: Spacing.lg,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    proceedButton: {
        backgroundColor: Colors.primary.maroon,
        padding: Spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
    },
    proceedButtonText: {
        color: '#fff',
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
});
