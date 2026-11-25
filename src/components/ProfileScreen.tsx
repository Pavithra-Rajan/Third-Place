import { ArrowLeft, Calendar, SlidersHorizontal, User, Users } from 'lucide-react';
import type { EventItem, UserPreferences } from '../types/thirdPlace';
import {
  formatCostPreference,
  formatDistancePreference,
} from '../utils/thirdPlaceLogic';

interface ProfileScreenProps {
  upcomingEvents: EventItem[];
  myEvents: EventItem[];
  preferences: UserPreferences;
  onBack: () => void;
  onOpenCustomize: () => void;
  onSelectEvent: (eventId: string) => void;
}

export function ProfileScreen({
  upcomingEvents,
  myEvents,
  preferences,
  onBack,
  onOpenCustomize,
  onSelectEvent,
}: ProfileScreenProps) {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Home"
          className="inline-flex items-center gap-1.5 min-h-[40px] pr-3 text-[13.5px] font-semibold text-[#131515] hover:text-[#339989] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-[16px] font-bold text-[#131515]">Profile</h1>
        <div className="w-12" aria-hidden="true" />
      </div>

      {/* User Summary */}
      <div className="rounded-2xl border border-[#2B2C28]/15 bg-[#2B2C28]/[0.04] p-4 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-[#131515] text-[#7DE2D1] flex items-center justify-center shrink-0">
          <User className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-[#131515]">Alex Rivera</p>
          <p className="text-[12.5px] text-[#2B2C28]/70 truncate">
            alex.rivera@thirdplace.nyc · NYC Member
          </p>
        </div>
      </div>

      {/* Saved Preferences Summary */}
      <section className="rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-[#131515]">Recommendation Preferences</h2>
          <button
            type="button"
            onClick={onOpenCustomize}
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#339989] hover:underline"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
        <div className="text-[12.5px] text-[#2B2C28]/80 space-y-1">
          <p>
            <strong>Interests:</strong>{' '}
            {preferences.interests.length > 0
              ? preferences.interests.join(', ')
              : 'All topics'}
          </p>
          <p>
            <strong>Accessible Only:</strong> {preferences.accessibleOnly ? 'Yes' : 'No'}
          </p>
          <p className="tabular-nums">
            <strong>Distance:</strong>{' '}
            {formatDistancePreference(preferences.maxDistanceMiles, true)} ·{' '}
            <strong>Cost:</strong> {formatCostPreference(preferences.maxCostDollars)}
          </p>
        </div>
      </section>

      {/* Attending */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-bold text-[#131515] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#339989]" />
          <span>Upcoming RSVPs ({upcomingEvents.length})</span>
        </h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-[13px] text-[#2B2C28]/65">No upcoming RSVPs yet.</p>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event.id)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] hover:border-[#339989] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-[#131515] truncate">
                    {event.name}
                  </p>
                  <p className="text-[12px] text-[#2B2C28]/70 truncate">
                    {event.date} · {event.location}
                  </p>
                </div>
                <span className="text-[11.5px] font-semibold text-[#339989] shrink-0">
                  ✓ Going
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Created Events */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-bold text-[#131515] flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#339989]" />
          <span>Hosted by Me ({myEvents.length})</span>
        </h2>
        {myEvents.length === 0 ? (
          <p className="text-[13px] text-[#2B2C28]/65">No created events yet.</p>
        ) : (
          <div className="space-y-2">
            {myEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event.id)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] hover:border-[#339989] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-[#131515] truncate">
                    {event.name}
                  </p>
                  <p className="text-[12px] text-[#2B2C28]/70 truncate">
                    {event.date} · {event.rsvpCount} RSVPs
                  </p>
                </div>
                <span className="text-[12px] font-semibold text-[#131515] shrink-0">
                  {event.price}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
