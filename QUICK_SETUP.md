# Quick Setup Guide

## 🚀 Get Started in 5 Steps

### Step 1: Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable **Authentication** (Google Sign-In)
   - Enable **Firestore Database**
   - Enable **Storage**

2. **Get Configuration**
   - Project Settings → General → Your apps
   - Add Web app, Android app, iOS app
   - Copy configuration values

3. **Download Service Account**
   - Project Settings → Service Accounts
   - Generate new private key
   - Save as `functions/service-account-key.json`
   - Save another copy as `tracking-server/service-account-key.json`

### Step 2: Environment Files

Create `.env` files from `.env.example` templates:

```bash
# Mobile
cp mobile/.env.example mobile/.env

# Admin
cp admin/.env.example admin/.env

# Web Client
cp .env.example .env

# Functions
cp functions/.env.example functions/.env

# Tracking Server
cp tracking-server/.env.example tracking-server/.env
```

**Fill in your Firebase config in each `.env` file**

### Step 3: Install Dependencies

```bash
# Admin Panel
cd admin
npm install

# Mobile App
cd ../mobile
npm install

# Web Client (optional)
cd ..
npm install

# Cloud Functions
cd functions
npm install

# Tracking Server
cd ../tracking-server
npm install
```

### Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Your [`firestore.rules`](firestore.rules) file is already configured.

### Step 5: Run Everything

**Terminal 1 - Tracking Server:**
```bash
cd tracking-server
npm run dev
```

**Terminal 2 - Admin Panel:**
```bash
cd admin
npm run dev
```
Open http://localhost:5173

**Terminal 3 - Mobile App:**
```bash
cd mobile
npx expo start
```
Scan QR code with Expo Go app

---

## 📱 First Run

### Create Admin User
1. Add your Gmail to `admin/.env`:
   ```
   VITE_ADMIN_EMAILS=your.email@gmail.com
   ```
2. Sign in to admin panel
3. You now have admin access

### Create Customer Account
1. Open mobile app
2. Sign in with Google
3. Select **"I'm a Customer"**
4. Browse and order food

### Create Delivery Partner Account
1. Sign in with **different** Gmail account
2. Select **"I'm a Delivery Partner"**
3. Enter vehicle details
4. Toggle online status

---

## 🗺️ Configure Maps (Optional)

### For Admin Panel Live Tracking:
Already configured! Uses Leaflet (no API key needed).

### For Mobile Navigation:
Uses device's default maps app (Google Maps/Apple Maps).

---

## 💳 Razorpay Setup (Optional)

1. Sign up at [Razorpay](https://razorpay.com)
2. Get Test API keys from Dashboard
3. Add to `functions/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret
   ```
4. Deploy functions:
   ```bash
   cd functions
   firebase deploy --only functions
   ```

---

## 🧪 Test the Complete Flow

### 1. Admin adds products
```
Admin Panel → Products → Add Product
- Add name, price, image URL, category
```

### 2. Customer places order
```
Mobile (Customer) → Browse → Add to Cart → Checkout
- Add delivery address
- Select payment method
- Place Order
```

### 3. Admin assigns delivery
```
Admin Panel → Orders → Assign to delivery partner
```

### 4. Partner delivers
```
Mobile (Partner) → Orders → Accept Order → Start Navigation
- GPS tracking starts automatically
- Complete delivery when done
```

### 5. View live tracking
```
Admin Panel → Live Tracking
- See delivery partner location in real-time
```

---

## 📊 Firestore Collections Structure

After first run, your Firestore will have:

```
users/
  {userId}
    - email, displayName, role, addresses, etc.

deliveryBoys/
  {deliveryBoyId}
    - name, phone, vehicleType, isOnline, currentLocation

products/
  {productId}
    - name, price, category, imageUrl, isAvailable

orders/
  {orderId}
    - userId, items, status, assignedDeliveryBoyId
    - deliveryAddress, paymentMethod

offers/
  {offerId}
    - title, imageUrl, discountPercent, validTo

coupons/
  {couponId}
    - code, discountPercent, usageLimit

settings/
  app
    - deliveryFee, kitchenLat, kitchenLng, isOpen
```

---

## 🔧 Troubleshooting

### "Firebase not configured" error
- Check all Firebase config values in `.env`
- Ensure values don't have quotes
- Restart dev server after changing `.env`

### Role selection not appearing
- Sign out completely
- Clear app data
- Sign in again

### GPS tracking not working
- Grant location permissions
- Check tracking server is running on port 3001
- Verify `EXPO_PUBLIC_TRACKING_SERVER_URL` in mobile/.env

### Admin panel not loading
- Check `VITE_ADMIN_EMAILS` includes your email
- Sign out and sign in again
- Check browser console for errors

---

## 📱 App Permissions

### Mobile App Needs:
- **Location** (always) - For delivery partner GPS tracking
- **Camera** (optional) - For profile photo upload
- **Notifications** (optional) - For order updates

### Grant in app.json:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow tracking during deliveries"
        }
      ]
    ]
  }
}
```

---

## 🚢 Deployment

### Admin Panel → Vercel
```bash
cd admin
npm run build
vercel --prod
```

Add environment variables in Vercel dashboard.

### Mobile App → EAS Build
```bash
cd mobile
eas build --platform android
eas build --platform ios
```

### Cloud Functions → Firebase
```bash
cd functions
firebase deploy --only functions
```

### Tracking Server → Railway/Render
Create new service, connect GitHub repo, set environment variables.

---

## 📚 Documentation

- [Full Implementation Guide](DELIVERY_PARTNER_IMPLEMENTATION.md)
- [Architecture Overview](ECOSYSTEM_README.md)
- [Firebase Rules](firestore.rules)
- [Auth Flow Diagram](AUTH_FLOW_DIAGRAM.md)

---

## 🎉 You're All Set!

Your restaurant delivery platform is ready with:
- ✅ Customer mobile app
- ✅ Delivery partner mobile app
- ✅ Admin web panel
- ✅ Real-time GPS tracking
- ✅ Payment integration
- ✅ Role-based access control

**Happy coding! 🚀**
