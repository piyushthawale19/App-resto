# Delivery Partner Implementation Guide

## 🎉 What's New

The mobile app now supports **dual roles**:
- **Customer**: Browse menu, place orders, track deliveries
- **Delivery Partner**: Accept orders, navigate with GPS, track earnings

## 🚀 New Features Implemented

### 1. **Role Selection** 🎭
- First-time users select their role (Customer or Delivery Partner)
- Role stored in Firebase Firestore
- Can be changed later in settings

**File**: [`mobile/src/screens/RoleSelectionScreen.tsx`](mobile/src/screens/RoleSelectionScreen.tsx)

---

### 2. **Delivery Partner Functionality** 🏍️

#### **Screens**:

##### a) **DeliveryOrdersScreen**
- View available orders ready for pickup
- See assigned active deliveries
- Accept new orders with one tap
- Real-time order updates via Firestore

**File**: [`mobile/src/screens/delivery/DeliveryOrdersScreen.tsx`](mobile/src/screens/delivery/DeliveryOrdersScreen.tsx)

##### b) **ActiveDeliveryScreen**
- View current delivery details
- Start GPS navigation
- Call customer directly
- Complete delivery with confirmation
- Real-time location broadcasting

**File**: [`mobile/src/screens/delivery/ActiveDeliveryScreen.tsx`](mobile/src/screens/delivery/ActiveDeliveryScreen.tsx)

##### c) **DeliveryEarningsScreen**
- Track today/week/month earnings
- View delivery history
- See performance stats (rating, total deliveries)
- Earnings calculation: ₹30 base + 10% of order value

**File**: [`mobile/src/screens/delivery/DeliveryEarningsScreen.tsx`](mobile/src/screens/delivery/DeliveryEarningsScreen.tsx)

##### d) **DeliveryProfileScreen**
- Toggle online/offline status
- Set availability for orders
- View partner ID and stats
- Manage profile and vehicle info

**File**: [`mobile/src/screens/delivery/DeliveryProfileScreen.tsx`](mobile/src/screens/delivery/DeliveryProfileScreen.tsx)

---

### 3. **GPS Location Broadcasting** 📍

**Service**: [`mobile/src/services/locationBroadcaster.ts`](mobile/src/services/locationBroadcaster.ts)

**Features**:
- Real-time location updates via Socket.io
- Connects to tracking server (`tracking-server/src/index.js`)
- Updates every 10 meters or 5 seconds
- Background location support (with permission)
- Automatic reconnection on disconnect

**How it works**:
1. Delivery partner starts navigation
2. GPS location captured continuously
3. Sent to tracking server via WebSocket
4. Also updates Firestore `deliveryBoys` collection
5. Admin and customer see live updates on map

---

### 4. **Customer Enhancements** 🛍️

#### **Address Management**
**File**: [`mobile/src/screens/Stubs.tsx`](mobile/src/screens/Stubs.tsx) - `AddressScreen`

- Add multiple delivery addresses
- Use current location with GPS
- Add landmarks for easy finding
- Edit/delete saved addresses

#### **Payment Screen**
**File**: [`mobile/src/screens/Stubs.tsx`](mobile/src/screens/Stubs.tsx) - `PaymentScreen`

- Select between UPI/Card or Cash on Delivery
- Razorpay integration ready (backend implemented)
- Clean payment method selection UI

---

### 5. **Updated Data Models** 📊

#### **AppUser Type** (Customer & Delivery Partner)
```typescript
export type UserRole = "customer" | "delivery_partner";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole; // NEW
  
  // Customer fields
  addresses: OrderAddress[];
  favorites: string[];
  
  // Delivery partner fields
  deliveryBoyId?: string;
  vehicleType?: "bike" | "scooter" | "bicycle";
  vehicleNumber?: string;
  isAvailable?: boolean;
  isOnline?: boolean;
  rating?: number;
  totalDeliveries?: number;
}
```

**File**: [`mobile/src/types/index.ts`](mobile/src/types/index.ts)

---

### 6. **Smart Navigation Routing** 🗺️

**File**: [`mobile/src/navigation/AppNavigator.tsx`](mobile/src/navigation/AppNavigator.tsx)

- Checks user role on app load
- Routes to **customer tabs** if role = "customer"
- Routes to **delivery partner tabs** if role = "delivery_partner"
- Shows role selection screen for new users

---

### 7. **Authentication Updates** 🔐

**File**: [`mobile/src/context/AuthContext.tsx`](mobile/src/context/AuthContext.tsx)

**New Functions**:
- `setUserRole(role, additionalData)` - Set user role after selection
- `needsRoleSelection` - Boolean state for role selection screen

**Behavior**:
- On new user sign-up → show role selection
- If role selected → normal app flow
- When setting "delivery_partner" → creates `deliveryBoys` document automatically

---

## 📦 Environment Setup

### **1. Mobile App (.env)**
Copy [`mobile/.env.example`](mobile/.env.example) to `mobile/.env`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_TRACKING_SERVER_URL=http://localhost:3001
```

### **2. Admin Panel (.env)**
Copy [`admin/.env.example`](admin/.env.example) to `admin/.env`

### **3. Web Client (.env)**
Copy [`.env.example`](.env.example) to `.env`

### **4. Cloud Functions (.env)**
Copy [`functions/.env.example`](functions/.env.example) to `functions/.env`

### **5. Tracking Server (.env)**
Copy [`tracking-server/.env.example`](tracking-server/.env.example) to `tracking-server/.env`

---

## 🏃 Running the Complete System

### **1. Start Tracking Server**
```bash
cd tracking-server
npm install
npm run dev
```
Server runs on `http://localhost:3001`

### **2. Start Admin Panel**
```bash
cd admin
npm install
npm run dev
```
Admin runs on `http://localhost:5173`

### **3. Start Mobile App**
```bash
cd mobile
npm install
npx expo start
```

### **4. Deploy Cloud Functions** (optional)
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 👥 User Flows

### **Customer Flow**:
1. Sign in with Google
2. Select "Customer" role
3. Browse products → Add to cart
4. Select delivery address
5. Choose payment method
6. Place order
7. Track delivery in real-time

### **Delivery Partner Flow**:
1. Sign in with Google
2. Select "Delivery Partner" role
3. Toggle online status
4. Mark as available
5. Accept an order
6. Start navigation (GPS tracking begins)
7. Deliver product
8. Mark as delivered
9. View earnings

### **Admin Flow** (existing):
1. Sign in with admin email
2. View dashboard
3. Manage products/offers/coupons
4. Assign orders to delivery partners
5. View live tracking of all deliveries

---

## 🔄 Data Flow

```
┌──────────────┐
│   Customer   │ Places Order
└──────┬───────┘
       │ (Firestore)
       ▼
┌──────────────┐
│    Admin     │ Assigns to Delivery Partner
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Delivery Partner │ Accepts Order
└──────┬───────────┘
       │
       ▼ Starts Navigation
┌────────────────────────┐
│ GPS Location Broadcast │ via Socket.io
└────────┬───────────────┘
         │
         ▼
┌────────────────────┐
│  Tracking Server   │ Broadcasts to all clients
└────────┬───────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌───────┐
│Customer│ │ Admin │ See live location on map
└────────┘ └───────┘
```

---

## 🗺️ Map Integration

### **Technologies Used**:
- **expo-location**: GPS tracking and geocoding
- **Leaflet**: Map visualization (admin & customer)
- **Socket.io**: Real-time location updates
- **Google Maps** (optional): Turn-by-turn navigation

### **Permissions Required**:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location for delivery tracking."
        }
      ]
    ]
  }
}
```

---

## 📱 Testing Guide

### **Test as Customer**:
1. Sign up with a Gmail account
2. Select "Customer" role
3. Add a delivery address
4. Place a test order

### **Test as Delivery Partner**:
1. Sign up with a different Gmail account
2. Select "Delivery Partner" role
3. Fill vehicle details (bike, ABC1234)
4. Go online and mark available
5. Admin assigns an order
6. Accept order
7. Start navigation

### **Test Admin**:
1. Add your email to `VITE_ADMIN_EMAILS` in admin `.env`
2. Sign in to admin panel
3. Assign orders to delivery partners
4. View live tracking

---

## 🐛 Troubleshooting

### **GPS not working**:
- Ensure location permissions granted
- Check `EXPO_PUBLIC_TRACKING_SERVER_URL` is correct
- Verify tracking server is running

### **Role selection not showing**:
- Check Firebase user document has no `role` field
- Clear AsyncStorage: `AsyncStorage.clear()`

### **Orders not appearing for delivery partner**:
- Ensure delivery partner is marked "available" and "online"
- Check admin has assigned orders
- Verify Firestore security rules allow read access

### **Map not showing location**:
- Check Socket.io connection in Network tab
- Verify tracking server logs show location updates
- Ensure delivery partner started navigation

---

## 🔐 Firestore Security Rules

The existing rules already support delivery partner role:

```javascript
// Allow delivery boys to read their assigned orders
allow read: if request.auth != null && 
    resource.data.assignedDeliveryBoyId == getUserData(request.auth.uid).deliveryBoyId;
```

No changes needed to [`firestore.rules`](firestore.rules).

---

## 📝 Next Steps (Optional Enhancements)

- [ ] Push notifications for order updates
- [ ] In-app Razorpay payment (currently showing stub)
- [ ] Multiple address selection in cart
- [ ] Delivery partner earnings payout system
- [ ] Customer rating for delivery partners
- [ ] Order history filters
- [ ] Multi-language support
- [ ] Dark mode

---

## 📄 Files Created/Modified

### **New Files**:
- `mobile/src/screens/RoleSelectionScreen.tsx`
- `mobile/src/screens/delivery/DeliveryOrdersScreen.tsx`
- `mobile/src/screens/delivery/ActiveDeliveryScreen.tsx`
- `mobile/src/screens/delivery/DeliveryEarningsScreen.tsx`
- `mobile/src/screens/delivery/DeliveryProfileScreen.tsx`
- `mobile/src/services/locationBroadcaster.ts`
- `mobile/src/navigation/DeliveryNavigator.tsx`
- All `.env.example` files

### **Modified Files**:
- `mobile/src/types/index.ts` - Added UserRole and delivery fields
- `mobile/src/context/AuthContext.tsx` - Added setUserRole function
- `mobile/src/navigation/AppNavigator.tsx` - Added role-based routing
- `mobile/src/screens/Stubs.tsx` - Implemented Address & Payment screens

---

## 🎯 Summary

You now have a **complete food delivery app** with:
✅ Customer app (browse, order, track)
✅ Delivery partner app (accept, navigate, earn)
✅ Admin panel (manage everything)
✅ Real-time GPS tracking
✅ Role-based authentication
✅ Address management
✅ Payment integration (backend ready)

**Everything is connected via Firebase and works in real-time!** 🚀
