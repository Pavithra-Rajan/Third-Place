import { DEFAULT_PLACE_FILTERS } from '../data/mockData';
import type {
  ActiveFilterChip,
  CreateEventInput,
  EventItem,
  PlaceFilters,
  PlaceItem,
  RecommendationItem,
  UserPreferences,
} from '../types/thirdPlace';

export const DISTANCE_SLIDER_MIN_MILES = 1;
export const DISTANCE_SLIDER_MAX_MILES = 10;
export const DISTANCE_SLIDER_OVER_10_VALUE = 13;
export const COST_SLIDER_STOPS = [0, 10, 30, 50] as const;
export const COST_SLIDER_MAX_DOLLARS = 50;

export function parseOpenTillHour(label: string): number | null {
  if (!label || label === 'Any') return null;
  const match = label.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const meridiem = match[2].toUpperCase();
  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return hour;
}

export function filterAndSortPlaces(
  places: PlaceItem[],
  query: string,
  filters: PlaceFilters
): PlaceItem[] {
  const trimmed = query.trim().toLowerCase();
  const minOpenHour = parseOpenTillHour(filters.openTill);

  const filtered = places.filter((place) => {
    if (filters.wifiOnly && !place.hasWifi) return false;
    if (filters.powerSupply && !place.powerSupply) return false;
    if (filters.laptopFriendly && !place.laptopFriendly) return false;
    if (filters.seatingType !== 'Any' && place.seatingType !== filters.seatingType) {
      return false;
    }
    if (filters.noiseLevel !== 'Any' && place.noiseLevel !== filters.noiseLevel) {
      return false;
    }
    if (minOpenHour !== null && place.openTillHour < minOpenHour) {
      return false;
    }

    if (!trimmed) return true;

    // Support broad natural queries like "WFH friendly cafe", "cafe", "study"
    const haystack = [
      place.name,
      place.address,
      place.neighborhood,
      place.noiseLevel,
      place.wifiInfo,
      place.seatingType,
      place.description,
      place.topics.join(' '),
      place.laptopFriendly ? 'wfh laptop friendly cafe study spot' : 'cafe',
    ]
      .join(' ')
      .toLowerCase();

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    return tokens.every((token) => haystack.includes(token));
  });

  return [...filtered].sort((a, b) => {
    if (filters.sortBy === 'Distance') {
      return a.distanceMiles - b.distanceMiles;
    }
    return b.relevanceScore - a.relevanceScore;
  });
}

export function getActiveFilterChips(filters: PlaceFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.wifiOnly) {
    chips.push({ key: 'wifiOnly', label: 'WiFi Only', fullLabel: 'WiFi Only' });
  }
  if (filters.powerSupply) {
    chips.push({
      key: 'powerSupply',
      label: 'Power Sup.',
      fullLabel: 'Power Supply Included',
    });
  }
  if (filters.laptopFriendly) {
    chips.push({
      key: 'laptopFriendly',
      label: 'Laptop OK',
      fullLabel: 'Laptop Friendly',
    });
  }
  if (filters.seatingType !== 'Any') {
    chips.push({
      key: 'seatingType',
      label: filters.seatingType.split(' ')[0],
      fullLabel: `Seating: ${filters.seatingType}`,
    });
  }
  if (filters.openTill !== 'Any') {
    chips.push({
      key: 'openTill',
      label: `Till ${filters.openTill}`,
      fullLabel: `Open Till ${filters.openTill}`,
    });
  }
  if (filters.noiseLevel !== 'Any') {
    chips.push({
      key: 'noiseLevel',
      label: `${filters.noiseLevel} Noise`,
      fullLabel: `Noise: ${filters.noiseLevel}`,
    });
  }
  if (filters.sortBy !== DEFAULT_PLACE_FILTERS.sortBy) {
    chips.push({
      key: 'sortBy',
      label: `Sort: ${filters.sortBy}`,
      fullLabel: `Sort By ${filters.sortBy}`,
    });
  }

  return chips;
}

export function removeFilterChip(
  filters: PlaceFilters,
  key: keyof PlaceFilters
): PlaceFilters {
  return {
    ...filters,
    [key]: DEFAULT_PLACE_FILTERS[key],
  };
}

export function filterEvents(events: EventItem[], query: string): EventItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return events;

  const stopWords = new Set(['find', 'near', 'me', 'in', 'nyc', 'events', 'event', 'the', 'a']);
  const rawTokens = trimmed.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter((token) => !stopWords.has(token));
  const tokensToMatch = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  return events.filter((event) => {
    const haystack = [
      event.name,
      event.location,
      event.neighborhood,
      event.host,
      event.description,
      event.price,
      event.tags.join(' '),
      event.topics.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return tokensToMatch.every((token) => haystack.includes(token));
  });
}

export function inferPreferredResultTab(query: string): 'all' | 'events' | 'places' {
  const q = query.trim().toLowerCase();
  if (!q) return 'all';
  const placeHints = ['cafe', 'coffee', 'wfh', 'study', 'wifi', 'library', 'quiet', 'work', 'bakery'];
  const eventHints = ['chess', 'event', 'night', 'workshop', 'club', 'gardening', 'bonsai', 'pottery', 'jazz', 'reading', 'sketch'];
  if (eventHints.some((hint) => q.includes(hint))) return 'events';
  if (placeHints.some((hint) => q.includes(hint))) return 'places';
  return 'all';
}

export function getRecommendedItems(
  events: EventItem[],
  places: PlaceItem[],
  preferences: UserPreferences
): RecommendationItem[] {
  const normalizedInterests = preferences.interests.map((item) => item.trim().toLowerCase());
  const hasInterests = normalizedInterests.length > 0;

  const matchesInterest = (topics: string[], text: string): string | undefined => {
    if (!hasInterests) return undefined;
    for (const interest of normalizedInterests) {
      const exactTopic = topics.find((t) => t.toLowerCase().includes(interest) || interest.includes(t.toLowerCase()));
      if (exactTopic) return exactTopic;
      if (text.toLowerCase().includes(interest)) {
        return preferences.interests.find((i) => i.toLowerCase() === interest);
      }
      // Link Gardening <-> Bonsai naturally so Gardening preference surfaces Bonsai events too
      if (interest === 'gardening' && topics.some((t) => t.toLowerCase() === 'bonsai')) {
        return 'Gardening';
      }
    }
    return undefined;
  };

  const eventCandidates = events
    .filter((evt) => {
      if (preferences.accessibleOnly && !evt.accessible) return false;
      if (
        preferences.maxDistanceMiles !== null &&
        evt.distanceMiles > preferences.maxDistanceMiles
      ) {
        return false;
      }
      if (evt.priceNumeric > preferences.maxCostDollars) return false;
      return true;
    })
    .map((evt) => {
      const matched = matchesInterest(evt.topics, `${evt.name} ${evt.description}`);
      return {
        score: (matched ? 100 : 10) - evt.distanceMiles,
        matchedTopic: matched,
        item: {
          kind: 'event' as const,
          id: evt.id,
          title: evt.name,
          subtitle: `${evt.date} · ${evt.neighborhood}`,
          meta: `${evt.distanceMiles.toFixed(1)} mi · ${evt.time.split('–')[0].trim()}`,
          price: evt.price,
          imageLabel: evt.imageLabel,
          matchedTopic: matched,
        },
      };
    });

  const placeCandidates = places
    .filter((plc) => {
      if (preferences.accessibleOnly && !plc.accessible) return false;
      if (
        preferences.maxDistanceMiles !== null &&
        plc.distanceMiles > preferences.maxDistanceMiles
      ) {
        return false;
      }
      if (plc.priceNumeric > preferences.maxCostDollars) return false;
      return true;
    })
    .map((plc) => {
      const matched = matchesInterest(plc.topics, `${plc.name} ${plc.description}`);
      return {
        score: (matched ? 80 : 12) - plc.distanceMiles,
        matchedTopic: matched,
        item: {
          kind: 'place' as const,
          id: plc.id,
          title: plc.name,
          subtitle: `${plc.neighborhood} · ${plc.noiseLevel} noise`,
          meta: `${plc.distanceMiles.toFixed(1)} mi · ${plc.wifiInfo}`,
          price: plc.priceTag,
          imageLabel: plc.imageLabel,
          matchedTopic: matched,
        },
      };
    });

  if (hasInterests) {
    const matchedEvents = eventCandidates.filter((c) => Boolean(c.matchedTopic));
    const matchedPlaces = placeCandidates.filter((c) => Boolean(c.matchedTopic));
    const combinedMatched = [...matchedEvents, ...matchedPlaces].sort((a, b) => b.score - a.score);
    if (combinedMatched.length > 0) {
      return combinedMatched.slice(0, 6).map((c) => c.item);
    }
  }

  // Default curated mix of places and events
  const sortedEvents = [...eventCandidates].sort((a, b) => b.score - a.score);
  const sortedPlaces = [...placeCandidates].sort((a, b) => b.score - a.score);
  const interleaved: RecommendationItem[] = [];
  for (let i = 0; i < 3; i += 1) {
    if (sortedPlaces[i]) interleaved.push(sortedPlaces[i].item);
    if (sortedEvents[i]) interleaved.push(sortedEvents[i].item);
  }
  return interleaved;
}

export interface CreateEventValidationErrors {
  name?: string;
  location?: string;
  dates?: string;
  ticketPrice?: string;
  capacity?: string;
}

export function validateCreateEventForm(input: CreateEventInput): CreateEventValidationErrors {
  const errors: CreateEventValidationErrors = {};

  if (!input.name.trim()) {
    errors.name = 'Event name is required.';
  }
  if (!input.location.trim()) {
    errors.location = 'Event location is required.';
  }
  if (!input.startDate || !input.endDate) {
    errors.dates = 'Start and end dates are required.';
  } else if (input.endDate < input.startDate) {
    errors.dates = 'End date cannot be earlier than start date.';
  }

  const trimmedPrice = input.ticketPrice.trim();
  if (
    trimmedPrice.toLowerCase() !== 'free' &&
    !/^\$?\d+(\.\d{1,2})?$/.test(trimmedPrice)
  ) {
    errors.ticketPrice = 'Enter "Free" or a valid dollar amount (e.g. $10).';
  }

  const trimmedCapacity = input.capacity.trim();
  if (
    trimmedCapacity.toLowerCase() !== 'unlimited' &&
    (!/^\d+$/.test(trimmedCapacity) || Number(trimmedCapacity) <= 0)
  ) {
    errors.capacity = 'Enter "Unlimited" or a positive number.';
  }

  return errors;
}

export function formatIsoDateShort(isoDate: string): string {
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return isoDate;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function parsePriceMetadata(rawPrice: string): {
  display: string;
  numeric: number;
} {
  const trimmed = rawPrice.trim();
  if (!trimmed || trimmed.toLowerCase() === 'free') {
    return { display: 'Free', numeric: 0 };
  }
  const numeric = Number(trimmed.replace(/^\$/, ''));
  if (Number.isNaN(numeric) || numeric <= 0) {
    return { display: 'Free', numeric: 0 };
  }
  const display = `$${Number.isInteger(numeric) ? numeric : numeric.toFixed(2)}`;
  return { display, numeric };
}

export function buildNewEvent(input: CreateEventInput, id: string): EventItem {
  const priceMeta = parsePriceMetadata(input.ticketPrice);
  const cleanCapacity =
    input.capacity.trim().toLowerCase() === 'unlimited' || !input.capacity.trim()
      ? 'Unlimited'
      : String(Number(input.capacity.trim()));

  return {
    id,
    name: input.name.trim(),
    location: input.location.trim(),
    neighborhood: input.location.includes(',')
      ? input.location.split(',').slice(-1)[0].trim()
      : 'NYC',
    distanceMiles: 0.8,
    host: 'You (Host)',
    date: formatIsoDateShort(input.startDate),
    isoDate: input.startDate,
    time: `${input.startTime} – ${input.endTime}`,
    price: priceMeta.display,
    priceNumeric: priceMeta.numeric,
    description:
      input.description.trim() ||
      'Community gathering created on Third Place. Everyone is welcome to join.',
    tags: ['Accessible', 'Community'],
    accessible: true,
    topics: ['Community'],
    imageLabel: input.imageLabel || 'Uploaded Cover',
    capacity: cleanCapacity,
    rsvpCount: 0,
    isUserCreated: true,
  };
}

export function formatDistancePreference(
  maxDistanceMiles: number | null,
  compact = false
): string {
  if (maxDistanceMiles === null) {
    return compact ? '> 10 mi' : '> 10 miles';
  }
  if (compact) {
    return `Within ${maxDistanceMiles} mi`;
  }
  return `Within ${maxDistanceMiles} ${maxDistanceMiles === 1 ? 'mile' : 'miles'}`;
}

export function formatCostPreference(maxCostDollars: number): string {
  if (maxCostDollars <= 0) {
    return 'Free ($0)';
  }
  const formatted = Number.isInteger(maxCostDollars)
    ? String(maxCostDollars)
    : maxCostDollars.toFixed(2);
  return `Up to $${formatted}`;
}

export function milesToDistanceSliderValue(maxDistanceMiles: number | null): number {
  if (maxDistanceMiles === null) {
    return DISTANCE_SLIDER_OVER_10_VALUE;
  }
  return Math.max(
    DISTANCE_SLIDER_MIN_MILES,
    Math.min(DISTANCE_SLIDER_MAX_MILES, Math.round(maxDistanceMiles))
  );
}

export function resolveDistanceSliderChange(
  rawSliderValue: number,
  previousMiles: number | null
): number | null {
  if (previousMiles === null && rawSliderValue < DISTANCE_SLIDER_OVER_10_VALUE) {
    return Math.min(DISTANCE_SLIDER_MAX_MILES, Math.max(DISTANCE_SLIDER_MIN_MILES, rawSliderValue));
  }
  if (rawSliderValue > DISTANCE_SLIDER_MAX_MILES) {
    return null;
  }
  return Math.max(DISTANCE_SLIDER_MIN_MILES, rawSliderValue);
}

export function getNearestCostSliderIndex(dollars: number): number {
  if (dollars <= COST_SLIDER_STOPS[0]) return 0;
  if (dollars >= COST_SLIDER_STOPS[COST_SLIDER_STOPS.length - 1]) {
    return COST_SLIDER_STOPS.length - 1;
  }
  let nearestIdx = 0;
  let smallestDiff = Math.abs(dollars - COST_SLIDER_STOPS[0]);
  for (let i = 1; i < COST_SLIDER_STOPS.length; i += 1) {
    const diff = Math.abs(dollars - COST_SLIDER_STOPS[i]);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nearestIdx = i;
    }
  }
  return nearestIdx;
}

export function parseCustomCostInput(raw: string): {
  valid: boolean;
  value: number | null;
  error?: string;
} {
  const trimmed = raw.trim().replace(/^\$/, '');
  if (!trimmed) {
    return { valid: false, value: null, error: 'Enter a dollar amount (0 or more).' };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { valid: false, value: null, error: 'Enter a valid amount (e.g. 15 or 75).' };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10000) {
    return { valid: false, value: null, error: 'Enter an amount between $0 and $10,000.' };
  }
  return { valid: true, value: Math.round(parsed * 100) / 100 };
}
