// ─── Address Types ───

export interface SavedAddress {
  id: string;
  label: string; // "Home", "Work", "Shahu Colony"
  fullAddress: string; // Full formatted address
  area: string; // Area/locality
  city: string; // City
  pincode?: string;
  lat: number;
  lng: number;
  landmark?: string;
  isDefault?: boolean;
  type?: "home" | "work" | "other";
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationState {
  latitude: number;
  longitude: number;
  address: string;
  shortAddress: string; // "Home" or area name
  fullAddress: string; // Full text
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export interface PlaceSuggestion {
  id: string;
  title: string;
  description: string;
  lat?: number;
  lng?: number;
}

export interface UserPreferences {
  isVeg: boolean;
  isNonVeg: boolean;
  selectedAddressId?: string;
  defaultDeliveryMode: "delivery" | "takeaway" | "dinein";
  notificationsEnabled: boolean;
}
