// ─── Dummy Data for Premium UI Testing ───
// Replace placeholder URLs with real images when ready

import type {
  Restaurant,
  FoodCategory,
  FilterOption,
  OfferBanner,
  ExploreItem,
} from "../types/restaurant";
import type { SavedAddress } from "../types/address";

// ─── Placeholder Image URLs (Unsplash food images) ───
const FOOD_IMAGES = {
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
  pizza:
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  biryani:
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
  rolls:
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop",
  dessert:
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop",
  chinese:
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=400&fit=crop",
  thali:
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop",
  dosa: "https://images.unsplash.com/photo-1668236543090-82eb5eadfeec?w=600&h=400&fit=crop",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop",
};

const RESTAURANT_COVERS = {
  r1: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop",
  r2: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
  r3: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  r4: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
  r5: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop",
  r6: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=400&fit=crop",
};

// ─── CATEGORIES ───
export const DUMMY_CATEGORIES: FoodCategory[] = [
  { id: "all", name: "All", imageUrl: FOOD_IMAGES.thali, isActive: true },
  { id: "pizza", name: "Pizza", imageUrl: FOOD_IMAGES.pizza },
  { id: "rolls", name: "Rolls", imageUrl: FOOD_IMAGES.rolls },
  { id: "biryani", name: "Biryani", imageUrl: FOOD_IMAGES.biryani },
  { id: "burger", name: "Burger", imageUrl: FOOD_IMAGES.burger },
  { id: "desserts", name: "Desserts", imageUrl: FOOD_IMAGES.dessert },
  { id: "chinese", name: "Chinese", imageUrl: FOOD_IMAGES.chinese },
  { id: "dosa", name: "Dosa", imageUrl: FOOD_IMAGES.dosa },
];

// ─── FILTER OPTIONS ───
export const DUMMY_FILTERS: FilterOption[] = [
  { id: "filters", label: "Filters", icon: "options-outline" },
  { id: "near_fast", label: "Near & Fast", icon: "flash" },
  { id: "under200", label: "Under ₹200" },
  { id: "rating4", label: "Rating 4.0+" },
  { id: "pureveg", label: "Pure Veg" },
  { id: "offers", label: "Offers" },
  { id: "new", label: "New on Yummyfi" },
];

// ─── OFFER BANNERS ───
export const DUMMY_BANNERS: OfferBanner[] = [
  {
    id: "b1",
    imageUrl: FOOD_IMAGES.cake,
    title: "Valentine's Special",
    subtitle: "Buy Large, Get Medium FREE!",
    ctaText: "ORDER NOW →",
    backgroundColor: "#C41E3A",
  },
  {
    id: "b2",
    imageUrl: FOOD_IMAGES.pizza,
    title: "Cakes, Desserts & Hampers",
    subtitle: "Sweetest deals for your loved ones",
    backgroundColor: "#FF6B35",
  },
  {
    id: "b3",
    imageUrl: FOOD_IMAGES.burger,
    title: "Min ₹200 OFF",
    subtitle: "On orders above ₹499",
    backgroundColor: "#FFB347",
  },
  {
    id: "b4",
    imageUrl: FOOD_IMAGES.biryani,
    title: "Flat 50% OFF",
    subtitle: "On your first order",
    backgroundColor: "#E23744",
  },
];

// ─── RESTAURANTS ───
export const DUMMY_RESTAURANTS: Restaurant[] = [
  {
    id: "rest1",
    name: "Henster Burger",
    imageUrl: RESTAURANT_COVERS.r1,
    cuisines: ["Burgers", "American", "Fast Food"],
    rating: 4.1,
    ratingCount: "300+",
    deliveryTime: "25-30 mins",
    distance: "1.8 km",
    priceForOne: 250,
    offer: {
      text: "Flat ₹100 OFF above ₹249",
      type: "flat",
      value: 100,
      minOrder: 249,
    },
    isFeatured: true,
    tags: ["Burgers", "American"],
  },
  {
    id: "rest2",
    name: "Chicago Delight",
    imageUrl: RESTAURANT_COVERS.r2,
    cuisines: ["North Indian", "Chinese", "Biryani"],
    rating: 3.8,
    ratingCount: "200+",
    deliveryTime: "15-20 mins",
    distance: "1.2 km",
    priceForOne: 300,
    offer: {
      text: "Flat ₹100 OFF",
      type: "flat",
      value: 100,
    },
    isFeatured: true,
    tags: ["North Indian", "Chinese"],
  },
  {
    id: "rest3",
    name: "Amruta Pure Veg",
    imageUrl: RESTAURANT_COVERS.r3,
    cuisines: ["South Indian", "North Indian", "Thali"],
    rating: 4.0,
    ratingCount: "500+",
    deliveryTime: "15-20 mins",
    distance: "0.8 km",
    priceForOne: 200,
    isPureVeg: true,
    offer: {
      text: "Flat ₹100 OFF",
      type: "flat",
      value: 100,
    },
    isFeatured: true,
    tags: ["Pure Veg", "Thali"],
  },
  {
    id: "rest4",
    name: "Hotel Bageecha",
    imageUrl: RESTAURANT_COVERS.r4,
    cuisines: ["Chinese", "North Indian", "Biryani"],
    rating: 4.0,
    ratingCount: "400+",
    deliveryTime: "20-25 mins",
    distance: "2.1 km",
    priceForOne: 300,
    offer: {
      text: "Flat ₹100 OFF",
      type: "flat",
      value: 100,
    },
    tags: ["Chinese", "North Indian"],
  },
  {
    id: "rest5",
    name: "Cafe Delight",
    imageUrl: RESTAURANT_COVERS.r5,
    cuisines: ["Cafe", "Beverages", "Snacks"],
    rating: 4.2,
    ratingCount: "150+",
    deliveryTime: "10-15 mins",
    distance: "0.5 km",
    priceForOne: 200,
    offer: {
      text: "60% OFF up to ₹120",
      type: "percent",
      value: 60,
    },
    tags: ["Cafe", "Beverages"],
  },
  {
    id: "rest6",
    name: "Chai Coffee Chronicles",
    imageUrl: RESTAURANT_COVERS.r6,
    cuisines: ["Cafe", "Snacks", "Beverages"],
    rating: 4.1,
    ratingCount: "100+",
    deliveryTime: "10-15 mins",
    distance: "0.7 km",
    priceForOne: 150,
    offer: {
      text: "40% OFF up to ₹80",
      type: "percent",
      value: 40,
    },
    tags: ["Cafe", "Chai"],
  },
  {
    id: "rest7",
    name: "Spice Villa",
    imageUrl: FOOD_IMAGES.biryani,
    cuisines: ["Biryani", "Mughlai", "Kebabs"],
    rating: 4.3,
    ratingCount: "600+",
    deliveryTime: "30-35 mins",
    distance: "3.2 km",
    priceForOne: 350,
    offer: {
      text: "Free delivery above ₹199",
      type: "freeDelivery",
      minOrder: 199,
    },
    tags: ["Biryani", "Mughlai"],
  },
  {
    id: "rest8",
    name: "Pizza Paradise",
    imageUrl: FOOD_IMAGES.pizza,
    cuisines: ["Pizza", "Italian", "Pasta"],
    rating: 4.4,
    ratingCount: "800+",
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    priceForOne: 300,
    offer: {
      text: "Buy 1 Get 1 Free",
      type: "bogo",
    },
    isFeatured: true,
    tags: ["Pizza", "Italian"],
  },
];

// ─── FEATURED RESTAURANTS (top slider) ───
export const DUMMY_FEATURED_RESTAURANTS = DUMMY_RESTAURANTS.filter(
  (r) => r.isFeatured,
);

// ─── EXPLORE MORE ITEMS ───
export const DUMMY_EXPLORE_ITEMS: ExploreItem[] = [
  {
    id: "e1",
    title: "Offers",
    imageUrl:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=200&h=200&fit=crop",
  },
  {
    id: "e2",
    title: "Food\non train",
    imageUrl:
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=200&h=200&fit=crop",
  },
  {
    id: "e3",
    title: "Plan\na party",
    imageUrl:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=200&fit=crop",
  },
  {
    id: "e4",
    title: "Collections",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
  },
];

// ─── SAVED ADDRESSES ───
export const DUMMY_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "addr1",
    label: "Shahu Colony",
    fullAddress:
      "Prathamesh Appartment Dr Babasaheb Ambedkar Niwasthan, 49-B, Shahu Colony, Talegaon Dabhade, Maharashtra 410507, India",
    area: "Shahu Colony",
    city: "Talegaon Dabhade",
    lat: 18.7337,
    lng: 73.6756,
    type: "home",
    isDefault: true,
  },
  {
    id: "addr2",
    label: "Shahu Colony",
    fullAddress:
      "Flat 401, 49-B, Shahu Colony, Talegaon Dabhade, Maharashtra 410507, India",
    area: "Shahu Colony",
    city: "Talegaon Dabhade",
    lat: 18.7337,
    lng: 73.6756,
    type: "other",
  },
  {
    id: "addr3",
    label: "Shahu Colony",
    fullAddress:
      "2 Floor, 49-B, Shahu Colony, Talegaon Dabhade, Maharashtra 410507, India",
    area: "Shahu Colony",
    city: "Talegaon Dabhade",
    lat: 18.7337,
    lng: 73.6756,
    type: "other",
  },
  {
    id: "addr4",
    label: "Rajgurav Colony",
    fullAddress: "Near Samsung Galaxy Service Center, Talegaon Dabhade",
    area: "Rajgurav Colony",
    city: "Talegaon Dabhade",
    lat: 18.7351,
    lng: 73.6742,
    type: "work",
  },
  {
    id: "addr5",
    label: "Nutan College",
    fullAddress:
      "Boyes Hostal Nutan College Of Engineering, Talegaon Dabhade, 410506, India",
    area: "TALEGAON DABHADE",
    city: "PUNE",
    lat: 18.7367,
    lng: 73.6801,
    type: "other",
  },
];
