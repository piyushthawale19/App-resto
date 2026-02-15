import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithCredential,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthUser, AppUser, UserRole } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Admin emails (optional) - mirror admin app pattern
const ADMIN_EMAILS = [
    process.env.EXPO_PUBLIC_ADMIN_EMAIL_1,
    process.env.EXPO_PUBLIC_ADMIN_EMAIL_2,
    process.env.EXPO_PUBLIC_ADMIN_EMAIL_3,
].filter(Boolean) as string[];

interface AuthContextType {
    user: AuthUser;
    appUser: AppUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    needsRoleSelection: boolean;
    signInWithGoogleToken: (idToken: string) => Promise<User>;
    signOut: () => Promise<void>;
    updateUserProfile: (data: Partial<AppUser>) => Promise<void>;
    setUserRole: (role: UserRole, additionalData?: Partial<AppUser>) => Promise<void>;
    isAdmin: boolean;
    guest: boolean;
    continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [guest, setGuest] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await loadUserProfile(firebaseUser);
                // Admin check: if email is whitelisted, ensure admin doc exists
                try {
                    const email = firebaseUser.email || '';
                    if (email && ADMIN_EMAILS.includes(email)) {
                        const adminRef = doc(db, 'admins', firebaseUser.uid);
                        const adminDoc = await getDoc(adminRef);
                        if (!adminDoc.exists()) {
                            await setDoc(adminRef, {
                                uid: firebaseUser.uid,
                                email,
                                role: 'super_admin',
                                name: firebaseUser.displayName || 'Admin',
                                createdAt: new Date().toISOString(),
                            });
                        }
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (err) {
                    console.warn('Admin-check failed', err);
                    setIsAdmin(false);
                }
            } else {
                setAppUser(null);
                setNeedsRoleSelection(false);
                setIsAdmin(false);
                // Preserve guest state across sign-outs? keep as-is
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loadUserProfile = async (firebaseUser: User) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data() as AppUser;
                setAppUser(userData);
                // Check if role is set
                if (!userData.role) {
                    setNeedsRoleSelection(true);
                } else {
                    setNeedsRoleSelection(false);
                }
            } else {
                // New user - needs role selection
                setNeedsRoleSelection(true);
                const newUser: Partial<AppUser> = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || 'User',
                    photoURL: firebaseUser.photoURL || undefined,
                    addresses: [],
                    favorites: [],
                    createdAt: new Date().toISOString(),
                    // role will be set after selection
                };
                await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
                setAppUser(newUser as AppUser);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    const signInWithGoogleToken = async (idToken: string): Promise<User> => {
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        await loadUserProfile(result.user);
        return result.user;
    };

    const signOut = async () => {
        try {
            console.log('AuthContext: signing out...');
            await firebaseSignOut(auth);
            // Avoid clearing entire AsyncStorage (may include Firebase persistence keys).
            // Remove only known app keys if needed in future.
            setAppUser(null);
            setGuest(false);
            setIsAdmin(false);
            console.log('AuthContext: sign out complete');
        } catch (err) {
            console.warn('AuthContext: signOut failed', err);
        }
    };

    const updateUserProfile = async (data: Partial<AppUser>) => {
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        setAppUser(prev => prev ? { ...prev, ...data } : null);
    };

    const setUserRole = async (role: UserRole, additionalData?: Partial<AppUser>) => {
        if (!user) return;

        const updates: Partial<AppUser> = {
            role,
            ...additionalData,
        };

        // If delivery partner, create a delivery boy document
        if (role === 'delivery_partner') {
            const deliveryBoyData = {
                id: user.uid,
                name: appUser?.displayName || 'Delivery Partner',
                phone: appUser?.phone || '',
                email: user.email || '',
                photoUrl: appUser?.photoURL || '',
                vehicleType: additionalData?.vehicleType || 'bike',
                vehicleNumber: additionalData?.vehicleNumber || '',
                isAvailable: false,
                isOnline: false,
                rating: 5.0,
                totalDeliveries: 0,
                userId: user.uid,
            };

            await setDoc(doc(db, 'deliveryBoys', user.uid), deliveryBoyData);
            updates.deliveryBoyId = user.uid;
            updates.vehicleType = deliveryBoyData.vehicleType;
            updates.vehicleNumber = deliveryBoyData.vehicleNumber;
            updates.isAvailable = false;
            updates.isOnline = false;
            updates.rating = 5.0;
            updates.totalDeliveries = 0;
        }

        await updateUserProfile(updates);
        setNeedsRoleSelection(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                appUser,
                loading,
                isAuthenticated: !!user,
                needsRoleSelection,
                signInWithGoogleToken,
                signOut,
                updateUserProfile,
                setUserRole,
                isAdmin,
                guest,
                continueAsGuest: () => setGuest(true),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
