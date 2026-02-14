import type { User } from "firebase/auth";

// ─── Product ───
export interface Product {
  id: string;
  name: string;
  price: number;
  offerPrice?: number;
  description: string;
  category: string;
  imageUrl: string;
  images?: string[]; // Multiple images for carousel
  imageFocus?: number;
  isVeg: boolean;
  rating?: number;
  reviewCount?: number;
  preparationTime?: number; // in minutes
  isAvailable?: boolean;
  tags?: string[];
}

// ─── Cart ───
export interface CartItem extends Product {
  quantity: number;
  customizations?: string[];
}

// ─── Order ───
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled"
  | "ready";

export type PaymentMethod = "upi" | "cod";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface OrderAddress {
  label: string;
  fullAddress: string;
  lat: number;
  lng: number;
  landmark?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  deliveryAddress: OrderAddress;
  assignedDeliveryBoyId?: string;
  couponCode?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  confirmedAt?: string;
  preparingAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelledBy?: "user" | "admin";
  estimatedDeliveryTime?: number; // minutes
}

// ─── Category ───
export interface Category {
  id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  order?: number;
}

export const DEFAULT_CATEGORIES = [
  "All",
  "Main Course",
  "Rice & Biryani",
  "Starters",
  "Breads",
  "Desserts",
  "Beverages",
  "Snacks",
];

// ─── Offer ───
export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercent?: number;
  discountFlat?: number;
  minOrderAmount?: number;
  couponCode?: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

// ─── Coupon ───
export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

// ─── Delivery Boy ───
export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoUrl?: string;
  vehicleType: "bike" | "scooter" | "bicycle";
  vehicleNumber: string;
  isAvailable: boolean;
  isOnline: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalDeliveries: number;
  userId?: string; // Links to AppUser document
}

// ─── Tracking ───
export interface TrackingData {
  orderId: string;
  deliveryBoyId: string;
  deliveryBoyLatLng: { lat: number; lng: number };
  userLatLng: { lat: number; lng: number };
  kitchenLatLng: { lat: number; lng: number };
  routePolyline?: [number, number][];
  etaMinutes: number;
  distanceKm: number;
  status: OrderStatus;
  updatedAt: string;
}

// ─── User ───
export type UserRole = "customer" | "delivery_partner";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  role: UserRole;
  addresses: OrderAddress[];
  favorites: string[];
  createdAt: string;
  // Delivery partner specific fields
  deliveryBoyId?: string; // Links to DeliveryBoy document
  vehicleType?: "bike" | "scooter" | "bicycle";
  vehicleNumber?: string;
  isAvailable?: boolean;
  isOnline?: boolean;
  rating?: number;
  totalDeliveries?: number;
}

// ─── Admin Roles ───
export type AdminRole = "super_admin" | "order_admin" | "delivery_admin";

export interface AdminUser {
  uid: string;
  email: string;
  role: AdminRole;
  name: string;
}

// ─── Settings ───
export interface AppSettings {
  deliveryFee: number;
  freeDeliveryAbove: number;
  taxPercent: number;
  minOrderAmount: number;
  kitchenLat: number;
  kitchenLng: number;
  kitchenAddress: string;
  isOpen: boolean;
  supportPhone: string;
  supportEmail: string;
}

export type AuthUser = User | null;
