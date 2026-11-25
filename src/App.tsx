import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { AppHeader } from './components/AppHeader';
import { CreateEventScreen } from './components/CreateEventScreen';
import { EventDetailScreen } from './components/EventDetailScreen';
import { FilterPanelModal } from './components/FilterPanelModal';
import { HomeScreen } from './components/HomeScreen';
import { PhoneFrame } from './components/PhoneFrame';
import { PlaceDetailScreen } from './components/PlaceDetailScreen';
import { PreferencesModal } from './components/PreferencesModal';
import { ProfileScreen } from './components/ProfileScreen';
import { SearchResultsScreen } from './components/SearchResultsScreen';
import { VoiceSearchOverlay } from './components/VoiceSearchOverlay';
import {
  DEFAULT_PLACE_FILTERS,
  DEFAULT_PREFERENCES,
  INITIAL_EVENTS,
  INITIAL_PLACES,
} from './data/mockData';
import type {
  ActiveFilterChip,
  CreateEventInput,
  EventItem,
  PlaceFilters,
  ScreenRoute,
  UserPreferences,
} from './types/thirdPlace';
import {
  buildNewEvent,
  filterAndSortPlaces,
  filterEvents,
  getActiveFilterChips,
  getRecommendedItems,
  inferPreferredResultTab,
  removeFilterChip,
} from './utils/thirdPlaceLogic';

export default function App() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [rsvpEventIds, setRsvpEventIds] = useState<string[]>([]);
  const [placeFilters, setPlaceFilters] = useState<PlaceFilters>(DEFAULT_PLACE_FILTERS);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'all' | 'events' | 'places'>('all');
  const [route, setRoute] = useState<ScreenRoute>({ name: 'home' });

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [isRefreshingForYou, setIsRefreshingForYou] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const upcomingEvents = useMemo(
    () => events.filter((event) => rsvpEventIds.includes(event.id)),
    [events, rsvpEventIds]
  );

  const myEvents = useMemo(
    () => events.filter((event) => event.isUserCreated),
    [events]
  );

  const recommendations = useMemo(
    () => getRecommendedItems(events, INITIAL_PLACES, preferences),
    [events, preferences]
  );

  const filteredEvents = useMemo(
    () => filterEvents(events, searchQuery),
    [events, searchQuery]
  );

  const filteredPlaces = useMemo(
    () => filterAndSortPlaces(INITIAL_PLACES, searchQuery, placeFilters),
    [searchQuery, placeFilters]
  );

  const activeFilterChips = useMemo(
    () => getActiveFilterChips(placeFilters),
    [placeFilters]
  );

  const handleSubmitSearch = useCallback(
    (overrideQuery?: string, explicitTab?: 'all' | 'events' | 'places') => {
      const nextQuery = overrideQuery !== undefined ? overrideQuery : searchQuery;
      if (overrideQuery !== undefined) {
        setSearchQuery(overrideQuery);
      }
      const nextTab = explicitTab ?? inferPreferredResultTab(nextQuery);
      setSearchTab(nextTab);
      setRoute({ name: 'search', initialTab: nextTab });
    },
    [searchQuery]
  );

  const handleApplyFilters = useCallback((nextFilters: PlaceFilters) => {
    setPlaceFilters(nextFilters);
    setShowFilterPanel(false);
    setSearchTab('places');
    setRoute({ name: 'search', initialTab: 'places' });
  }, []);

  const handleRemoveFilterChip = useCallback((key: ActiveFilterChip['key']) => {
    setPlaceFilters((prev) => removeFilterChip(prev, key));
  }, []);

  const handleResetFilters = useCallback(() => {
    setPlaceFilters(DEFAULT_PLACE_FILTERS);
  }, []);

  const handleRsvp = useCallback((eventId: string) => {
    setRsvpEventIds((prev) => (prev.includes(eventId) ? prev : [eventId, ...prev]));
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId ? { ...evt, rsvpCount: evt.rsvpCount + 1 } : evt
      )
    );
  }, []);

  const handleCancelRsvp = useCallback((eventId: string) => {
    setRsvpEventIds((prev) => prev.filter((id) => id !== eventId));
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId
          ? { ...evt, rsvpCount: Math.max(0, evt.rsvpCount - 1) }
          : evt
      )
    );
  }, []);

  const handleCreateEvent = useCallback((input: CreateEventInput) => {
    const newId = `evt-user-${Date.now()}`;
    const created = buildNewEvent(input, newId);
    setEvents((prev) => [created, ...prev]);
  }, []);

  const handleSavePreferences = useCallback(
    (nextPreferences: UserPreferences) => {
      setShowPreferencesModal(false);
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (route.name !== 'home') {
        setPreferences(nextPreferences);
        setIsRefreshingForYou(false);
        return;
      }

      setIsRefreshingForYou(true);
      refreshTimerRef.current = window.setTimeout(() => {
        setPreferences(nextPreferences);
        setIsRefreshingForYou(false);
        refreshTimerRef.current = null;
      }, 750);
    },
    [route.name]
  );

  const handleCompleteVoiceSearch = useCallback(
    (voiceQuery: string, tab: 'events' | 'places') => {
      setShowVoiceOverlay(false);
      setSearchQuery(voiceQuery);
      setSearchTab(tab);
      setRoute({ name: 'search', initialTab: tab });
    },
    []
  );

  const selectedEvent =
    route.name === 'event-detail'
      ? events.find((e) => e.id === route.eventId)
      : undefined;

  const selectedPlace =
    route.name === 'place-detail'
      ? INITIAL_PLACES.find((p) => p.id === route.placeId)
      : undefined;

  const showFloatingCreateButton =
    route.name !== 'create-event' &&
    !showFilterPanel &&
    !showPreferencesModal &&
    !showVoiceOverlay;

  return (
    <PhoneFrame isDarkOverlay={showVoiceOverlay}>
      {/* Consistent Top Header across every screen */}
      <AppHeader
        onLogoClick={() => setRoute({ name: 'home' })}
        onProfileClick={() =>
          setRoute((prev) =>
            prev.name === 'profile' ? { name: 'home' } : { name: 'profile' }
          )
        }
        isProfileActive={route.name === 'profile'}
      />

      {/* Active Screen */}
      {route.name === 'home' && (
        <HomeScreen
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSubmitSearch={handleSubmitSearch}
          onOpenVoice={() => setShowVoiceOverlay(true)}
          onOpenFilters={() => setShowFilterPanel(true)}
          activeFilterCount={activeFilterChips.length}
          upcomingEvents={upcomingEvents}
          myEvents={myEvents}
          recommendations={recommendations}
          isRefreshingForYou={isRefreshingForYou}
          onOpenCustomize={() => setShowPreferencesModal(true)}
          onSelectEvent={(eventId) =>
            setRoute({ name: 'event-detail', eventId, returnTo: 'home' })
          }
          onSelectPlace={(placeId) =>
            setRoute({ name: 'place-detail', placeId, returnTo: 'home' })
          }
        />
      )}

      {route.name === 'search' && (
        <SearchResultsScreen
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSubmitSearch={() => handleSubmitSearch()}
          onBack={() => setRoute({ name: 'home' })}
          onOpenVoice={() => setShowVoiceOverlay(true)}
          onOpenFilters={() => setShowFilterPanel(true)}
          activeTab={searchTab}
          onTabChange={setSearchTab}
          events={filteredEvents}
          places={filteredPlaces}
          rsvpEventIds={rsvpEventIds}
          activeFilterChips={activeFilterChips}
          onRemoveFilterChip={handleRemoveFilterChip}
          onResetFilters={handleResetFilters}
          onSelectEvent={(eventId) =>
            setRoute({ name: 'event-detail', eventId, returnTo: 'search' })
          }
          onSelectPlace={(placeId) =>
            setRoute({ name: 'place-detail', placeId, returnTo: 'search' })
          }
        />
      )}

      {route.name === 'event-detail' && selectedEvent && (
        <EventDetailScreen
          event={selectedEvent}
          isAttending={rsvpEventIds.includes(selectedEvent.id)}
          onBack={() =>
            setRoute(
              route.returnTo === 'search'
                ? { name: 'search' }
                : route.returnTo === 'profile'
                  ? { name: 'profile' }
                  : { name: 'home' }
            )
          }
          onRsvp={handleRsvp}
          onCancelRsvp={handleCancelRsvp}
          onGoHome={() => setRoute({ name: 'home' })}
        />
      )}

      {route.name === 'place-detail' && selectedPlace && (
        <PlaceDetailScreen
          place={selectedPlace}
          onBack={() =>
            setRoute(
              route.returnTo === 'search' ? { name: 'search' } : { name: 'home' }
            )
          }
        />
      )}

      {route.name === 'create-event' && (
        <CreateEventScreen
          onBack={() => setRoute({ name: 'home' })}
          onCreateEvent={handleCreateEvent}
        />
      )}

      {route.name === 'profile' && (
        <ProfileScreen
          upcomingEvents={upcomingEvents}
          myEvents={myEvents}
          preferences={preferences}
          onBack={() => setRoute({ name: 'home' })}
          onOpenCustomize={() => setShowPreferencesModal(true)}
          onSelectEvent={(eventId) =>
            setRoute({ name: 'event-detail', eventId, returnTo: 'profile' })
          }
        />
      )}

      {/* Consistent Floating Create Event + Button on Bottom */}
      {showFloatingCreateButton && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex justify-center px-4 pt-6 pb-3 bg-gradient-to-t from-[#FFFAFB] via-[#FFFAFB]/92 to-transparent">
          <button
            type="button"
            onClick={() =>
              setRoute({
                name: 'create-event',
                returnTo: route.name === 'search' ? 'search' : 'home',
              })
            }
            className="pointer-events-auto inline-flex items-center gap-2 min-h-[46px] px-5 rounded-full bg-[#131515] hover:bg-[#2B2C28] text-[#FFFAFB] text-[14px] font-bold shadow-[0_8px_22px_rgba(19,21,21,0.32)] border border-[#7DE2D1]/50 transition-transform active:scale-[0.98]"
          >
            <span>Create Event</span>
            <span className="w-5 h-5 rounded-full bg-[#339989] text-[#FFFAFB] flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.8} />
            </span>
          </button>
        </div>
      )}

      {/* Filter Places Bottom Sheet (Task 2) */}
      {showFilterPanel && (
        <FilterPanelModal
          currentFilters={placeFilters}
          onApply={handleApplyFilters}
          onClose={() => setShowFilterPanel(false)}
        />
      )}

      {/* Customize Preferences Modal (Task 4) */}
      {showPreferencesModal && (
        <PreferencesModal
          currentPreferences={preferences}
          onSave={handleSavePreferences}
          onClose={() => setShowPreferencesModal(false)}
        />
      )}

      {/* Full-Screen Voice Search Overlay (Task 5) */}
      {showVoiceOverlay && (
        <VoiceSearchOverlay
          onClose={() => setShowVoiceOverlay(false)}
          onCompleteVoiceSearch={handleCompleteVoiceSearch}
        />
      )}
    </PhoneFrame>
  );
}
