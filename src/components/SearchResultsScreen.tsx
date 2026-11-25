import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Volume2, Wifi, X } from 'lucide-react';
import type { ActiveFilterChip, EventItem, PlaceItem } from '../types/thirdPlace';
import { ImagePlaceholder } from './ImagePlaceholder';
import { SearchBar } from './SearchBar';

interface SearchResultsScreenProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onBack: () => void;
  onOpenVoice: () => void;
  onOpenFilters: () => void;
  activeTab: 'all' | 'events' | 'places';
  onTabChange: (tab: 'all' | 'events' | 'places') => void;
  events: EventItem[];
  places: PlaceItem[];
  rsvpEventIds: string[];
  activeFilterChips: ActiveFilterChip[];
  onRemoveFilterChip: (key: ActiveFilterChip['key']) => void;
  onResetFilters: () => void;
  onSelectEvent: (eventId: string) => void;
  onSelectPlace: (placeId: string) => void;
}

export function SearchResultsScreen({
  query,
  onQueryChange,
  onSubmitSearch,
  onBack,
  onOpenVoice,
  onOpenFilters,
  activeTab,
  onTabChange,
  events,
  places,
  rsvpEventIds,
  activeFilterChips,
  onRemoveFilterChip,
  onResetFilters,
  onSelectEvent,
  onSelectPlace,
}: SearchResultsScreenProps) {
  const [chipsExpanded, setChipsExpanded] = useState(false);

  const visibleChips =
    chipsExpanded || activeFilterChips.length <= 2
      ? activeFilterChips
      : activeFilterChips.slice(0, 2);
  const hiddenCount = activeFilterChips.length - visibleChips.length;

  const showEvents = activeTab === 'all' || activeTab === 'events';
  const showPlaces = activeTab === 'all' || activeTab === 'places';

  const totalShown =
    (showEvents ? events.length : 0) + (showPlaces ? places.length : 0);

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-3.5">
      {/* Top Back + Search */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Home"
          className="w-10 h-10 rounded-xl border border-[#2B2C28]/15 flex items-center justify-center text-[#131515] hover:bg-[#2B2C28]/8 shrink-0 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <SearchBar
            query={query}
            onQueryChange={onQueryChange}
            onSubmitSearch={onSubmitSearch}
            onOpenVoice={onOpenVoice}
            onOpenFilters={onOpenFilters}
            activeFilterCount={activeFilterChips.length}
            compact
          />
        </div>
      </div>

      {/* Result Type Segmented Tabs */}
      <div
        className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#2B2C28]/8"
        role="tablist"
        aria-label="Search result categories"
      >
        {(
          [
            { id: 'all', label: `All (${events.length + places.length})` },
            { id: 'events', label: `Events (${events.length})` },
            { id: 'places', label: `Places (${places.length})` },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-2 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap tabular-nums ${
                isActive
                  ? 'bg-[#131515] text-[#FFFAFB] shadow-xs'
                  : 'text-[#2B2C28] hover:text-[#131515]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Removable Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div
          className="flex items-center flex-wrap gap-1.5"
          data-testid="active-filter-chips"
        >
          {visibleChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onRemoveFilterChip(chip.key)}
              aria-label={`Remove filter ${chip.fullLabel}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#7DE2D1]/40 border border-[#339989]/50 text-[#131515] text-[12px] font-semibold hover:bg-[#7DE2D1]/65 transition-colors whitespace-nowrap"
            >
              <span>{chip.label}</span>
              <X className="w-3 h-3 text-[#131515]/80" />
            </button>
          ))}

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setChipsExpanded(true)}
              aria-label={`Show ${hiddenCount} more active filters`}
              className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-[#2B2C28] text-[#FFFAFB] text-[12px] font-semibold hover:bg-[#131515] transition-colors tabular-nums"
            >
              +{hiddenCount}
            </button>
          )}

          {chipsExpanded && activeFilterChips.length > 2 && (
            <button
              type="button"
              onClick={() => setChipsExpanded(false)}
              className="text-[11.5px] font-semibold text-[#2B2C28]/70 px-2 py-1 hover:text-[#131515]"
            >
              Collapse
            </button>
          )}
        </div>
      )}

      {/* Results List */}
      {totalShown === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2B2C28]/25 bg-[#2B2C28]/[0.03] px-4 py-8 text-center space-y-2.5">
          <p className="text-[14px] font-semibold text-[#131515]">No matching results</p>
          <p className="text-[12.5px] text-[#2B2C28]/70">
            Try clearing a filter or searching another NYC neighborhood or activity.
          </p>
          {activeFilterChips.length > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3.5 py-2 rounded-lg bg-[#339989] text-[#FFFAFB] text-[12.5px] font-semibold"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {showEvents && events.length > 0 && (
            <section aria-label="Matching events" className="space-y-2.5">
              {activeTab === 'all' && (
                <h2 className="text-[13px] font-bold text-[#2B2C28]/75">
                  Events ({events.length})
                </h2>
              )}
              <div className="space-y-2.5" data-testid="event-results-list">
                {events.map((event) => {
                  const isAttending = rsvpEventIds.includes(event.id);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onSelectEvent(event.id)}
                      className="w-full text-left flex items-center gap-3 rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] p-2.5 shadow-[0_1px_2px_rgba(19,21,21,0.04)] hover:border-[#339989] transition-colors"
                    >
                      <ImagePlaceholder
                        className="w-[76px] h-[76px] rounded-lg shrink-0"
                        compact
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[14px] font-bold text-[#131515] leading-snug truncate">
                            {event.name}
                          </h3>
                          <span className="text-[12px] font-bold text-[#131515] bg-[#7DE2D1]/45 px-2 py-0.5 rounded-md tabular-nums shrink-0">
                            {event.price}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] text-[#2B2C28]/80 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#339989]" />
                          <span className="truncate">{event.location}</span>
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#2B2C28]/70 flex items-center gap-1 truncate tabular-nums">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-[#2B2C28]/55" />
                          <span>
                            {event.date} · {event.time}
                          </span>
                        </p>
                        {isAttending && (
                          <p className="mt-1 text-[11.5px] font-semibold text-[#339989]">
                            ✓ You are attending
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {showPlaces && places.length > 0 && (
            <section aria-label="Matching places" className="space-y-2.5">
              {activeTab === 'all' && (
                <h2 className="text-[13px] font-bold text-[#2B2C28]/75">
                  Places ({places.length})
                </h2>
              )}
              <div className="space-y-2.5" data-testid="place-results-list">
                {places.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => onSelectPlace(place.id)}
                    className="w-full text-left flex items-center gap-3 rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] p-2.5 shadow-[0_1px_2px_rgba(19,21,21,0.04)] hover:border-[#339989] transition-colors"
                  >
                    <ImagePlaceholder
                      className="w-[76px] h-[84px] rounded-lg shrink-0"
                      compact
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[14px] font-bold text-[#131515] leading-snug truncate">
                          {place.name}
                        </h3>
                        <span className="text-[12px] font-bold text-[#131515] bg-[#2B2C28]/10 px-2 py-0.5 rounded-md tabular-nums shrink-0">
                          {place.priceTag}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-[#2B2C28]/80 truncate tabular-nums">
                        {place.address} · {place.distanceMiles.toFixed(1)} mi
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11.5px] text-[#2B2C28]/70">
                        <span className="inline-flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-[#339989]" />
                          {place.noiseLevel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <Wifi className="w-3.5 h-3.5 text-[#339989]" />
                          {place.wifiInfo}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#2B2C28]/60 truncate">
                        Open till {place.openTillLabel}
                        {place.powerSupply ? ' · Power' : ''}
                        {place.laptopFriendly ? ' · Laptop OK' : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
