// ─── Restaurant Types ───

export interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  coverImages?: string[];
  cuisines: string[];
  rating: number;
  ratingCount: string; // "300+", "1K+"
  deliveryTime: string; // "25-30 mins"
  distance: string; // "1.8 km"
  priceForOne: number; // ₹300
  offer?: RestaurantOffer;
  isVeg?: boolean;
  isPureVeg?: boolean;
  isFeatured?: boolean;
  isPromoted?: boolean;
  isBookmarked?: boolean;
  tags?: string[]; // "Chinese", "North Indian"
}

export interface RestaurantOffer {
  text: string; // "Flat ₹100 OFF above ₹249"
  type: "flat" | "percent" | "freeDelivery" | "bogo";
  value?: number;
  minOrder?: number;
  badgeColor?: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  imageUrl: string;
  isActive?: boolean;
}

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
  isActive?: boolean;
}

export interface OfferBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  backgroundColor?: string;
  link?: string;
}

export interface ExploreItem {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
}
