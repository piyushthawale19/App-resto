import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { AdminRole, AdminUser } from '../types';

interface AuthContextType {
    user: User | null;
    adminUser: AdminUser | null;
    loading: boolean;
    isAdmin: boolean;
    role: AdminRole | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin emails from env
const ADMIN_EMAILS = [
    import.meta.env.VITE_ADMIN_EMAIL_1,
    import.meta.env.VITE_ADMIN_EMAIL_2,
    import.meta.env.VITE_ADMIN_EMAIL_3,
].filter(Boolean);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser && ADMIN_EMAILS.includes(firebaseUser.email || '')) {
                // Check Firestore for admin role
                try {
                    const adminDocRef = doc(db, 'admins', firebaseUser.uid);
                    const adminDoc = await getDoc(adminDocRef);
                    
                    if (adminDoc.exists()) {
                        setAdminUser(adminDoc.data() as AdminUser);
                    } else {
                        // Auto-create admin document for whitelisted emails
                        const newAdminUser: AdminUser = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            role: 'super_admin',
                            name: firebaseUser.displayName || 'Admin',
                        };
                        
                        // Write to Firestore
                        await setDoc(adminDocRef, {
                            ...newAdminUser,
                            createdAt: serverTimestamp(),
                        });
                        
                        setAdminUser(newAdminUser);
                        console.log('✅ Admin document created automatically');
                    }
                } catch (error) {
                    console.error('Error setting up admin:', error);
                    // Fallback to local state if Firestore write fails
                    setAdminUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        role: 'super_admin',
                        name: firebaseUser.displayName || 'Admin',
                    });
                }
            } else {
                setAdminUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        if (!ADMIN_EMAILS.includes(result.user.email || '')) {
            await fbSignOut(auth);
            throw new Error('NOT_ADMIN');
        }
    };

    const signOut = async () => {
        await fbSignOut(auth);
        setAdminUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                adminUser,
                loading,
                isAdmin: !!adminUser,
                role: adminUser?.role || null,
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
