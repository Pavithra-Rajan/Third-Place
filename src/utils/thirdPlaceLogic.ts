import { DEFAULT_PLACE_FILTERS } from '../data/mockData';
import type {
  ActiveFilterChip,
  CostTier,
  CreateEventInput,
  EventItem,
  PlaceFilters,
  PlaceItem,
  RecommendationItem,
  UserPreferences,
} from '../types/thirdPlace';

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
      if (evt.distanceMiles > preferences.maxDistanceMiles) return false;
      if (evt.costTier > preferences.maxCostTier) return false;
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
      if (plc.distanceMiles > preferences.maxDistanceMiles) return false;
      if (plc.costTier > preferences.maxCostTier) return false;
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
  costTier: CostTier;
} {
  const trimmed = rawPrice.trim();
  if (!trimmed || trimmed.toLowerCase() === 'free') {
    return { display: 'Free', numeric: 0, costTier: 1 };
  }
  const numeric = Number(trimmed.replace(/^\$/, ''));
  if (Number.isNaN(numeric) || numeric <= 0) {
    return { display: 'Free', numeric: 0, costTier: 1 };
  }
  const display = `$${Number.isInteger(numeric) ? numeric : numeric.toFixed(2)}`;
  const costTier: CostTier = numeric <= 15 ? 1 : numeric <= 35 ? 2 : 3;
  return { display, numeric, costTier };
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
    costTier: priceMeta.costTier,
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

export function costTierToLabel(tier: CostTier): string {
  return tier === 1 ? '$' : tier === 2 ? '$$' : '$$$';
}
