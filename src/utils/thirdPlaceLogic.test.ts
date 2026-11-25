import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PLACE_FILTERS,
  DEFAULT_PREFERENCES,
  INITIAL_EVENTS,
  INITIAL_PLACES,
} from '../data/mockData';
import {
  buildNewEvent,
  COST_SLIDER_STOPS,
  DISTANCE_SLIDER_OVER_10_VALUE,
  filterAndSortPlaces,
  filterEvents,
  formatCostPreference,
  formatDistancePreference,
  getActiveFilterChips,
  getNearestCostSliderIndex,
  getRecommendedItems,
  milesToDistanceSliderValue,
  parseCustomCostInput,
  removeFilterChip,
  resolveDistanceSliderChange,
  validateCreateEventForm,
} from './thirdPlaceLogic';

test('filterAndSortPlaces applies WiFi, power supply, noise, open till, and distance sorting', () => {
  const filtered = filterAndSortPlaces(INITIAL_PLACES, '', {
    ...DEFAULT_PLACE_FILTERS,
    wifiOnly: true,
    powerSupply: true,
    laptopFriendly: true,
    openTill: '9 PM',
    sortBy: 'Distance',
  });

  assert.ok(filtered.length >= 2);
  for (const place of filtered) {
    assert.equal(place.hasWifi, true);
    assert.equal(place.powerSupply, true);
    assert.equal(place.laptopFriendly, true);
    assert.ok(place.openTillHour >= 21);
  }
  for (let i = 1; i < filtered.length; i += 1) {
    assert.ok(filtered[i - 1].distanceMiles <= filtered[i].distanceMiles);
  }
});

test('getActiveFilterChips and removeFilterChip produce expected compact labels and removals', () => {
  const activeFilters = {
    ...DEFAULT_PLACE_FILTERS,
    wifiOnly: true,
    powerSupply: true,
    laptopFriendly: true,
  };

  const chips = getActiveFilterChips(activeFilters);
  assert.deepEqual(
    chips.map((c) => c.label),
    ['WiFi Only', 'Power Sup.', 'Laptop OK']
  );

  const afterRemove = removeFilterChip(activeFilters, 'powerSupply');
  assert.equal(afterRemove.powerSupply, false);
  assert.equal(afterRemove.wifiOnly, true);
  assert.equal(getActiveFilterChips(afterRemove).length, 2);
});

test('filterEvents matches chess voice query to Open Chess, NYPL Friday Night, and Chess Game Night', () => {
  const results = filterEvents(INITIAL_EVENTS, 'Find chess events near me');
  const names = results.map((e) => e.name);
  assert.ok(names.includes('Open Chess'));
  assert.ok(names.includes('NYPL Friday Night'));
  assert.ok(names.includes('Chess Game Night'));
  assert.equal(results.length, 3);
});

test('getRecommendedItems surfaces gardening and bonsai events when Gardening interest is saved', () => {
  const recs = getRecommendedItems(INITIAL_EVENTS, INITIAL_PLACES, {
    ...DEFAULT_PREFERENCES,
    interests: ['Gardening', 'Pottery'],
    accessibleOnly: true,
    maxDistanceMiles: 5,
    maxCostDollars: 30,
  });

  const titles = recs.map((r) => r.title);
  assert.ok(titles.includes('Urban Rooftop Gardening'));
  assert.ok(titles.includes('Brooklyn Bonsai Workshop'));
  assert.ok(titles.includes('East Village Clay & Pottery'));
  assert.ok(!titles.includes('Wave Hill Botanical Walk'));
});

test('getRecommendedItems includes >10 mile events when maxDistanceMiles is null and filters strictly by maxCostDollars', () => {
  const overTenRecs = getRecommendedItems(INITIAL_EVENTS, INITIAL_PLACES, {
    ...DEFAULT_PREFERENCES,
    interests: ['Gardening'],
    accessibleOnly: true,
    maxDistanceMiles: null,
    maxCostDollars: 12,
  });

  const titles = overTenRecs.map((r) => r.title);
  assert.ok(titles.includes('Wave Hill Botanical Walk'));
  assert.ok(titles.includes('Urban Rooftop Gardening'));
  assert.ok(titles.includes('Community Herb Swap'));
  assert.ok(!titles.includes('Brooklyn Bonsai Workshop')); // $25 > $12
  assert.ok(!titles.includes('East Village Clay & Pottery')); // $30 > $12
});

test('distance and cost formatting and custom cost parsing handle edge cases', () => {
  assert.equal(formatDistancePreference(1), 'Within 1 mile');
  assert.equal(formatDistancePreference(5), 'Within 5 miles');
  assert.equal(formatDistancePreference(null), '> 10 miles');
  assert.equal(formatDistancePreference(null, true), '> 10 mi');

  assert.equal(formatCostPreference(0), 'Free ($0)');
  assert.equal(formatCostPreference(25), 'Up to $25');
  assert.equal(formatCostPreference(75), 'Up to $75');

  assert.deepEqual(parseCustomCostInput('75'), { valid: true, value: 75 });
  assert.deepEqual(parseCustomCostInput('$12.50'), { valid: true, value: 12.5 });
  assert.deepEqual(parseCustomCostInput('0'), { valid: true, value: 0 });
  assert.equal(parseCustomCostInput('-10').valid, false);
  assert.equal(parseCustomCostInput('abc').valid, false);
  assert.equal(parseCustomCostInput('').valid, false);

  assert.deepEqual([...COST_SLIDER_STOPS], [0, 10, 30, 50]);
  assert.equal(getNearestCostSliderIndex(0), 0);
  assert.equal(getNearestCostSliderIndex(10), 1);
  assert.equal(getNearestCostSliderIndex(12), 1);
  assert.equal(getNearestCostSliderIndex(25), 2);
  assert.equal(getNearestCostSliderIndex(30), 2);
  assert.equal(getNearestCostSliderIndex(50), 3);
  assert.equal(getNearestCostSliderIndex(75), 3);

  assert.equal(milesToDistanceSliderValue(5), 5);
  assert.equal(milesToDistanceSliderValue(10), 10);
  assert.equal(milesToDistanceSliderValue(null), DISTANCE_SLIDER_OVER_10_VALUE);
  assert.equal(resolveDistanceSliderChange(10, 5), 10);
  assert.equal(resolveDistanceSliderChange(11, 10), null);
  assert.equal(resolveDistanceSliderChange(12, null), 10);
  assert.equal(resolveDistanceSliderChange(7, null), 7);
});

test('validateCreateEventForm enforces required fields and valid options', () => {
  const invalid = validateCreateEventForm({
    name: '',
    startDate: '2026-12-10',
    startTime: '6:00 PM',
    endDate: '2026-12-09',
    endTime: '8:00 PM',
    location: '',
    description: '',
    ticketPrice: 'abc',
    capacity: '0',
    imageLabel: 'Cover',
  });

  assert.ok(invalid.name);
  assert.ok(invalid.location);
  assert.ok(invalid.dates);
  assert.ok(invalid.ticketPrice);
  assert.ok(invalid.capacity);

  const validInput = {
    name: 'Bryant Park Sketch Night',
    startDate: '2026-12-10',
    startTime: '6:00 PM',
    endDate: '2026-12-10',
    endTime: '8:00 PM',
    location: 'Bryant Park, Midtown',
    description: 'Bring a sketchbook and warm coat.',
    ticketPrice: '10',
    capacity: '25',
    imageLabel: 'Cover Photo',
  };

  assert.deepEqual(validateCreateEventForm(validInput), {});
  const created = buildNewEvent(validInput, 'evt-new-1');
  assert.equal(created.price, '$10');
  assert.equal(created.capacity, '25');
  assert.equal(created.rsvpCount, 0);
  assert.equal(created.isUserCreated, true);
});
