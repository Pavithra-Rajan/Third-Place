import { useEffect, useRef } from 'react';
import { Calendar, Loader2, MapPin, SlidersHorizontal, Users } from 'lucide-react';
import type { EventItem, RecommendationItem } from '../types/thirdPlace';
import { ImagePlaceholder } from './ImagePlaceholder';
import { SearchBar } from './SearchBar';

interface HomeScreenProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSubmitSearch: (overrideQuery?: string, initialTab?: 'all' | 'events' | 'places') => void;
  onOpenVoice: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  upcomingEvents: EventItem[];
  myEvents: EventItem[];
  recommendations: RecommendationItem[];
  isRefreshingForYou: boolean;
  onOpenCustomize: () => void;
  onSelectEvent: (eventId: string) => void;
  onSelectPlace: (placeId: string) => void;
}

export function HomeScreen({
  searchQuery,
  onSearchQueryChange,
  onSubmitSearch,
  onOpenVoice,
  onOpenFilters,
  activeFilterCount,
  upcomingEvents,
  myEvents,
  recommendations,
  isRefreshingForYou,
  onOpenCustomize,
  onSelectEvent,
  onSelectPlace,
}: HomeScreenProps) {
  const forYouSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isRefreshingForYou) {
      forYouSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isRefreshingForYou]);
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-6">
      {/* Search Bar & Quick Browse Triggers */}
      <div className="space-y-2.5">
        <SearchBar
          query={searchQuery}
          onQueryChange={onSearchQueryChange}
          onSubmitSearch={() => onSubmitSearch()}
          onOpenVoice={onOpenVoice}
          onOpenFilters={onOpenFilters}
          activeFilterCount={activeFilterCount}
        />

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSubmitSearch('WFH friendly cafe', 'places')}
            className="text-[12px] font-medium px-2.5 py-2 rounded-lg bg-[#2B2C28]/8 text-[#2B2C28] hover:bg-[#7DE2D1]/30 hover:text-[#131515] transition-colors whitespace-nowrap text-center"
          >
            WFH Cafes
          </button>
          <button
            type="button"
            onClick={() => onSubmitSearch('chess', 'events')}
            className="text-[12px] font-medium px-2.5 py-2 rounded-lg bg-[#2B2C28]/8 text-[#2B2C28] hover:bg-[#7DE2D1]/30 hover:text-[#131515] transition-colors whitespace-nowrap text-center"
          >
            Chess Events
          </button>
          <button
            type="button"
            onClick={() => onSubmitSearch('', 'all')}
            className="text-[12px] font-medium px-2.5 py-2 rounded-lg bg-[#2B2C28]/8 text-[#2B2C28] hover:bg-[#7DE2D1]/30 hover:text-[#131515] transition-colors whitespace-nowrap text-center"
          >
            Browse All
          </button>
        </div>
      </div>

      {/* Upcoming Section (Horizontal Cards) */}
      <section aria-labelledby="upcoming-heading" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 id="upcoming-heading" className="text-[16px] font-bold text-[#131515] tracking-tight">
            Upcoming
          </h2>
          {upcomingEvents.length > 0 && (
            <span className="text-[12px] font-medium text-[#2B2C28]/65 tabular-nums">
              {upcomingEvents.length} attending
            </span>
          )}
        </div>

        {upcomingEvents.length === 0 ? (
          <div
            className="rounded-xl border border-dashed border-[#2B2C28]/25 bg-[#2B2C28]/[0.03] px-4 py-4 text-[13px] text-[#2B2C28]/70"
            data-testid="upcoming-empty"
          >
            None yet. RSVP to an event to see it here.
          </div>
        ) : (
          <div
            className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4"
            data-testid="upcoming-list"
          >
            {upcomingEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event.id)}
                className="w-[228px] shrink-0 text-left rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] p-2.5 shadow-[0_1px_3px_rgba(19,21,21,0.06)] hover:border-[#339989] transition-colors focus-visible:outline-2 focus-visible:outline-[#339989]"
              >
                <ImagePlaceholder className="w-full h-[92px] rounded-lg mb-2.5" label={event.imageLabel} />
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[14px] font-semibold text-[#131515] leading-snug line-clamp-1">
                    {event.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#131515] bg-[#7DE2D1]/45 px-1.5 py-0.5 rounded shrink-0">
                    ✓ Going
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[#2B2C28]/75 flex items-center gap-1 truncate">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-[#339989]" />
                  <span>
                    {event.date} · {event.time.split('–')[0].trim()}
                  </span>
                </p>
                <p className="mt-0.5 text-[12px] text-[#2B2C28]/65 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#2B2C28]/50" />
                  <span className="truncate">{event.location}</span>
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* My Events Section */}
      <section aria-labelledby="my-events-heading" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 id="my-events-heading" className="text-[16px] font-bold text-[#131515] tracking-tight">
            My Events
          </h2>
          {myEvents.length > 0 && (
            <span className="text-[12px] font-medium text-[#2B2C28]/65 tabular-nums">
              {myEvents.length} hosted
            </span>
          )}
        </div>

        {myEvents.length === 0 ? (
          <div
            className="rounded-xl border border-dashed border-[#2B2C28]/25 bg-[#2B2C28]/[0.03] px-4 py-4 text-[13px] text-[#2B2C28]/70"
            data-testid="my-events-empty"
          >
            None yet. Tap &ldquo;Create Event +&rdquo; below to host one.
          </div>
        ) : (
          <div className="space-y-2.5" data-testid="my-events-list">
            {myEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event.id)}
                className="w-full text-left flex items-center gap-3 rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] p-2.5 hover:border-[#339989] transition-colors"
              >
                <ImagePlaceholder className="w-16 h-16 rounded-lg shrink-0" compact />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[14px] font-semibold text-[#131515] truncate">
                      {event.name}
                    </h3>
                    <span className="text-[12px] font-semibold text-[#339989] tabular-nums shrink-0">
                      {event.price}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#2B2C28]/70 truncate mt-0.5">
                    {event.date} · {event.time.split('–')[0].trim()} · {event.location}
                  </p>
                  <p className="text-[12px] font-semibold text-[#131515] flex items-center gap-1 mt-1 tabular-nums">
                    <Users className="w-3.5 h-3.5 text-[#339989]" />
                    <span>
                      {event.rsvpCount} {event.rsvpCount === 1 ? 'RSVP' : 'RSVPs'}
                    </span>
                    <span className="text-[#2B2C28]/50 font-normal">
                      · Cap: {event.capacity}
                    </span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* For You Section */}
      <section
        ref={forYouSectionRef}
        aria-labelledby="for-you-heading"
        className="space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="for-you-heading" className="text-[16px] font-bold text-[#131515] tracking-tight">
            For You
          </h2>

          <button
            type="button"
            onClick={onOpenCustomize}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border border-[#339989] text-[#131515] bg-[#7DE2D1]/25 hover:bg-[#7DE2D1]/45 text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#339989]" />
            <span>Customize</span>
          </button>
        </div>

        {isRefreshingForYou && (
          <div
            role="status"
            aria-live="polite"
            data-testid="for-you-loading"
            className="flex items-center justify-center gap-2 py-2 text-[12.5px] font-medium text-[#339989]"
          >
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>Refreshing...</span>
          </div>
        )}

        {recommendations.length === 0 && !isRefreshingForYou ? (
          <div className="rounded-xl border border-dashed border-[#2B2C28]/25 bg-[#2B2C28]/[0.03] px-4 py-5 text-center space-y-2">
            <p className="text-[13px] text-[#2B2C28]/75">
              No places or events match your current preferences.
            </p>
            <button
              type="button"
              onClick={onOpenCustomize}
              className="text-[12.5px] font-semibold text-[#339989] underline"
            >
              Adjust preferences
            </button>
          </div>
        ) : (
          <div
            className={`space-y-2.5 transition-opacity duration-200 ${
              isRefreshingForYou ? 'opacity-45 pointer-events-none' : 'opacity-100'
            }`}
            data-testid="for-you-list"
          >
            {recommendations.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() =>
                  item.kind === 'event' ? onSelectEvent(item.id) : onSelectPlace(item.id)
                }
                className="w-full text-left flex items-center gap-3 rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] p-2.5 shadow-[0_1px_2px_rgba(19,21,21,0.04)] hover:border-[#339989] transition-colors"
              >
                <ImagePlaceholder className="w-[72px] h-[72px] rounded-lg shrink-0" compact />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[14px] font-semibold text-[#131515] leading-snug truncate">
                      {item.title}
                    </h3>
                    <span className="text-[12px] font-bold text-[#131515] tabular-nums shrink-0">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#2B2C28]/75 truncate mt-1">{item.subtitle}</p>
                  <p className="text-[11.5px] text-[#2B2C28]/60 truncate mt-0.5 tabular-nums">
                    {item.meta}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
