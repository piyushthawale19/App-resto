// ─── Location Service: GPS + Permissions + Reverse Geocode ───

import * as Location from "expo-location";
import type { LocationState, PlaceSuggestion } from "../types/address";

// Default location (Talegaon Dabhade, Pune based on user's screenshots)
const DEFAULT_LAT = 18.7337;
const DEFAULT_LNG = 73.6756;

/** Request foreground location permission */
export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
};

/** Check current permission status */
export const checkLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === "granted";
};

/** Get current GPS coordinates */
export const getCurrentPosition = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

/** Reverse geocode coordinates to address */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<{
  fullAddress: string;
  shortAddress: string;
  area: string;
  city: string;
}> => {
  try {
    const [geocode] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    if (geocode) {
      const parts = [
        geocode.name,
        geocode.street,
        geocode.district,
        geocode.city || geocode.subregion,
        geocode.region,
        geocode.postalCode,
      ].filter(Boolean);

      const shortAddress =
        geocode.name ||
        geocode.street ||
        geocode.district ||
        "Current Location";
      const area = geocode.district || geocode.subregion || geocode.name || "";
      const city = geocode.city || geocode.subregion || geocode.region || "";
      const fullAddress = parts.join(", ");

      return { fullAddress, shortAddress, area, city };
    }
    return {
      fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      shortAddress: "Current Location",
      area: "",
      city: "",
    };
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return {
      fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      shortAddress: "Current Location",
      area: "",
      city: "",
    };
  }
};

/** Full flow: permission → GPS → reverse geocode */
export const getFullLocationData = async (): Promise<LocationState> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return {
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        address: "Select Location",
        shortAddress: "Select Location",
        fullAddress: "",
        loading: false,
        error: "Location permission denied",
        hasPermission: false,
      };
    }

    const coords = await getCurrentPosition();
    const geo = await reverseGeocode(coords.latitude, coords.longitude);

    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      address: geo.shortAddress,
      shortAddress: geo.shortAddress,
      fullAddress: geo.fullAddress,
      loading: false,
      error: null,
      hasPermission: true,
    };
  } catch (error) {
    console.error("Location error:", error);
    return {
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LNG,
      address: "Select Location",
      shortAddress: "Select Location",
      fullAddress: "",
      loading: false,
      error: "Failed to get location",
      hasPermission: false,
    };
  }
};

/** Forward geocode an address string to coordinates */
export const forwardGeocode = async (
  address: string,
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const results = await Location.geocodeAsync(address);
    if (results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }
    return null;
  } catch {
    return null;
  }
};

/** Mock place suggestions for search (until Google Places is connected) */
export const searchPlaceSuggestions = async (
  queryText: string,
): Promise<PlaceSuggestion[]> => {
  // Mock suggestions - replace with Google Places API later
  const mockPlaces: PlaceSuggestion[] = [
    {
      id: "1",
      title: "Shahu Colony",
      description:
        "Prathamesh Appartment, Dr Babasaheb Ambedkar Niwasthan, 49-B, Shahu Colony, Talegaon Dabhade",
      lat: 18.7337,
      lng: 73.6756,
    },
    {
      id: "2",
      title: "Rajgurav Colony",
      description: "Near Samsung Galaxy Service Center, Talegaon Dabhade",
      lat: 18.7351,
      lng: 73.6742,
    },
    {
      id: "3",
      title: "Talegaon Dabhade Station",
      description: "Railway Station Road, Talegaon Dabhade, Pune",
      lat: 18.7353,
      lng: 73.6758,
    },
    {
      id: "4",
      title: "Nutan College of Engineering",
      description:
        "Boys Hostal, Nutan College Of Engineering, Talegaon Dabhade",
      lat: 18.7367,
      lng: 73.6801,
    },
    {
      id: "5",
      title: "City Center Mall",
      description: "Main Road, Talegaon Dabhade, Pune, Maharashtra",
      lat: 18.734,
      lng: 73.677,
    },
  ];

  if (!queryText.trim()) return mockPlaces;

  const q = queryText.toLowerCase();
  return mockPlaces.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
};
