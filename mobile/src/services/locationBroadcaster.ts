import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

class LocationBroadcaster {
    private socket: Socket | null = null;
    private watchSubscription: Location.LocationSubscription | null = null;
    private isActive = false;
    private orderId: string | null = null;
    private deliveryBoyId: string | null = null;

    async startBroadcasting(
        orderId: string,
        deliveryBoyId: string,
        trackingServerUrl: string = 'http://localhost:3001'
    ): Promise<boolean> {
        if (this.isActive) {
            console.warn('Location broadcasting already active');
            return false;
        }

        try {
            // Request location permissions
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            if (foregroundStatus !== 'granted') {
                console.error('Location permission not granted');
                return false;
            }

            // Request background location permissions for continuous tracking
            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus !== 'granted') {
                console.warn('Background location permission not granted, will work in foreground only');
            }

            this.orderId = orderId;
            this.deliveryBoyId = deliveryBoyId;

            // Connect to tracking server via Socket.io
            this.socket = io(trackingServerUrl, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('Connected to tracking server');
                // Join the tracking room for this order
                this.socket?.emit('join-tracking', { orderId });
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from tracking server');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            // Start watching location with high accuracy
            this.watchSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    distanceInterval: 10, // Update every 10 meters
                    timeInterval: 5000, // Or every 5 seconds
                },
                async (location) => {
                    await this.handleLocationUpdate(location);
                }
            );

            this.isActive = true;
            console.log('Location broadcasting started for order:', orderId);
            return true;
        } catch (error) {
            console.error('Error starting location broadcasting:', error);
            return false;
        }
    }

    private async handleLocationUpdate(location: Location.LocationObject) {
        if (!this.orderId || !this.deliveryBoyId || !this.socket) return;

        const { latitude, longitude } = location.coords;

        try {
            // Emit location to tracking server via Socket.io
            this.socket.emit('update-location', {
                orderId: this.orderId,
                deliveryBoyId: this.deliveryBoyId,
                lat: latitude,
                lng: longitude,
            });

            // Also update Firestore delivery boy document
            const deliveryBoyRef = doc(db, 'deliveryBoys', this.deliveryBoyId);
            await updateDoc(deliveryBoyRef, {
                currentLocation: {
                    lat: latitude,
                    lng: longitude,
                },
                lastLocationUpdate: new Date().toISOString(),
            });

            console.log(`Location updated: ${latitude}, ${longitude}`);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    }

    async stopBroadcasting() {
        if (!this.isActive) return;

        try {
            // Stop watching location
            if (this.watchSubscription) {
                this.watchSubscription.remove();
                this.watchSubscription = null;
            }

            // Disconnect socket
            if (this.socket) {
                this.socket.emit('tracking-ended', { orderId: this.orderId });
                this.socket.disconnect();
                this.socket = null;
            }

            this.isActive = false;
            this.orderId = null;
            this.deliveryBoyId = null;

            console.log('Location broadcasting stopped');
        } catch (error) {
            console.error('Error stopping location broadcasting:', error);
        }
    }

    async updateDeliveryStatus(newStatus: string) {
        if (!this.socket || !this.orderId) return;

        try {
            this.socket.emit('status-update', {
                orderId: this.orderId,
                status: newStatus,
            });
        } catch (error) {
            console.error('Error updating delivery status:', error);
        }
    }

    isCurrentlyActive(): boolean {
        return this.isActive;
    }

    getCurrentOrderId(): string | null {
        return this.orderId;
    }
}

// Singleton instance
export const locationBroadcaster = new LocationBroadcaster();
