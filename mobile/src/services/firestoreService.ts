// ─── Firestore Service: Address & Preferences CRUD ───

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import type { SavedAddress, UserPreferences } from "../types/address";

// ─────────────────────────────────────────────
// ADDRESS CRUD
// ─────────────────────────────────────────────

/** Get the current user's UID or throw */
const getUid = (): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");
  return uid;
};

/** Reference to user's addresses sub-collection */
const addressesCol = () => collection(db, "users", getUid(), "addresses");

/** Add a new saved address */
export const addAddress = async (
  address: Omit<SavedAddress, "id">,
): Promise<string> => {
  const docRef = await addDoc(addressesCol(), {
    ...address,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

/** Update an existing address */
export const updateAddress = async (
  addressId: string,
  data: Partial<SavedAddress>,
): Promise<void> => {
  const ref = doc(db, "users", getUid(), "addresses", addressId);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

/** Delete an address */
export const deleteAddress = async (addressId: string): Promise<void> => {
  const ref = doc(db, "users", getUid(), "addresses", addressId);
  await deleteDoc(ref);
};

/** Load all saved addresses (one-time) */
export const loadAddresses = async (): Promise<SavedAddress[]> => {
  try {
    const q = query(addressesCol(), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      ...(d.data() as Omit<SavedAddress, "id">),
      id: d.id,
    }));
  } catch (error) {
    console.error("Error loading addresses:", error);
    return [];
  }
};

/** Subscribe to addresses in real-time */
export const subscribeToAddresses = (
  callback: (addresses: SavedAddress[]) => void,
): Unsubscribe => {
  try {
    const q = query(addressesCol(), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const addresses: SavedAddress[] = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<SavedAddress, "id">),
        id: d.id,
      }));
      callback(addresses);
    });
  } catch (error) {
    console.error("Error subscribing to addresses:", error);
    return () => {};
  }
};

// ─────────────────────────────────────────────
// SELECTED ADDRESS
// ─────────────────────────────────────────────

/** Save the currently selected address ID to preferences */
export const setSelectedAddress = async (addressId: string): Promise<void> => {
  const ref = doc(db, "users", getUid(), "preferences", "delivery");
  await setDoc(ref, { selectedAddressId: addressId }, { merge: true });
};

/** Get the currently selected address ID */
export const getSelectedAddressId = async (): Promise<string | null> => {
  try {
    const ref = doc(db, "users", getUid(), "preferences", "delivery");
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data()?.selectedAddressId || null : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// USER PREFERENCES
// ─────────────────────────────────────────────

/** Save user preferences */
export const saveUserPreferences = async (
  prefs: Partial<UserPreferences>,
): Promise<void> => {
  const ref = doc(db, "users", getUid(), "preferences", "app");
  await setDoc(ref, prefs, { merge: true });
};

/** Load user preferences */
export const loadUserPreferences =
  async (): Promise<UserPreferences | null> => {
    try {
      const ref = doc(db, "users", getUid(), "preferences", "app");
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as UserPreferences) : null;
    } catch {
      return null;
    }
  };

/** Subscribe to user preferences */
export const subscribeToPreferences = (
  callback: (prefs: UserPreferences | null) => void,
): Unsubscribe => {
  try {
    const ref = doc(db, "users", getUid(), "preferences", "app");
    return onSnapshot(ref, (snap) => {
      callback(snap.exists() ? (snap.data() as UserPreferences) : null);
    });
  } catch {
    callback(null);
    return () => {};
  }
};

// ─────────────────────────────────────────────
// QUICK SAVE (for location screen)
// ─────────────────────────────────────────────

/** Quick-save GPS address and set as selected */
export const saveAndSelectGPSAddress = async (
  lat: number,
  lng: number,
  fullAddress: string,
  shortLabel: string,
): Promise<string> => {
  const addressId = await addAddress({
    label: shortLabel || "Current Location",
    fullAddress,
    area: shortLabel,
    city: "",
    lat,
    lng,
    type: "other",
    isDefault: false,
  });
  await setSelectedAddress(addressId);
  return addressId;
};
