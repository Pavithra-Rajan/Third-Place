export type NoiseLevel = 'Silent' | 'Light' | 'Medium' | 'Noisy';

export type SeatingType =
  | 'Any'
  | 'Communal Tables'
  | 'Individual Desks'
  | 'Booths & Couches'
  | 'Outdoor Patio'
  | 'Counter Seating';

export type SortOption = 'Distance' | 'Relevance';

export interface EventItem {
  id: string;
  name: string;
  location: string;
  neighborhood: string;
  distanceMiles: number;
  host: string;
  date: string; // Display date e.g. "Fri, Nov 27"
  isoDate: string; // YYYY-MM-DD
  time: string; // e.g. "6:30 PM – 9:00 PM"
  price: string; // "Free", "$10", "$15", etc.
  priceNumeric: number;
  description: string;
  tags: string[]; // e.g. ["Accessible", "18+"]
  accessible: boolean;
  topics: string[]; // e.g. ["Chess", "Board Games"]
  imageLabel: string;
  capacity: string; // "Unlimited" or "25"
  rsvpCount: number;
  isUserCreated?: boolean;
}

export interface PlaceItem {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  distanceMiles: number;
  noiseLevel: NoiseLevel;
  wifiInfo: string;
  hasWifi: boolean;
  seatingType: Exclude<SeatingType, 'Any'>;
  openTillHour: number; // 24-hour e.g. 18 = 6 PM, 23 = 11 PM
  openTillLabel: string; // e.g. "9 PM"
  powerSupply: boolean;
  laptopFriendly: boolean;
  priceTag: string; // "Free", "~$8", "~$15", "~$25"
  priceNumeric: number;
  accessible: boolean;
  topics: string[];
  description: string;
  imageLabel: string;
  relevanceScore: number;
}

export interface PlaceFilters {
  seatingType: SeatingType;
  wifiOnly: boolean;
  openTill: string; // "Any" | "6 PM" | "7 PM" | "8 PM" | "9 PM" | "10 PM" | "11 PM"
  noiseLevel: 'Any' | NoiseLevel;
  powerSupply: boolean;
  laptopFriendly: boolean;
  sortBy: SortOption;
}

export interface ActiveFilterChip {
  key: keyof PlaceFilters;
  label: string;
  fullLabel: string;
}

export interface UserPreferences {
  interests: string[];
  accessibleOnly: boolean;
  maxDistanceMiles: number | null; // 1–10 miles, or null for > 10 miles (any distance)
  maxCostDollars: number;
}

export interface CreateEventInput {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  description: string;
  ticketPrice: string;
  capacity: string;
  imageLabel: string;
}

export interface RecommendationItem {
  kind: 'event' | 'place';
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  price: string;
  imageLabel: string;
  matchedTopic?: string;
}

export type ScreenRoute =
  | { name: 'home' }
  | { name: 'search'; initialTab?: 'all' | 'events' | 'places' }
  | { name: 'event-detail'; eventId: string; returnTo: 'home' | 'search' | 'profile' }
  | { name: 'place-detail'; placeId: string; returnTo: 'home' | 'search' }
  | { name: 'create-event'; returnTo: 'home' | 'search' }
  | { name: 'profile' };
