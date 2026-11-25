import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  MapPin,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';
import type { EventItem } from '../types/thirdPlace';
import { ImagePlaceholder } from './ImagePlaceholder';

interface EventDetailScreenProps {
  event: EventItem;
  isAttending: boolean;
  onBack: () => void;
  onRsvp: (eventId: string) => void;
  onCancelRsvp: (eventId: string) => void;
  onGoHome: () => void;
}

export function EventDetailScreen({
  event,
  isAttending,
  onBack,
  onRsvp,
  onCancelRsvp,
  onGoHome,
}: EventDetailScreenProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleRsvpClick = () => {
    if (!isAttending) {
      onRsvp(event.id);
      setShowConfirmModal(true);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-4">
        {/* Back navigation row */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="inline-flex items-center gap-1.5 min-h-[40px] pr-3 text-[13.5px] font-semibold text-[#131515] hover:text-[#339989] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <span className="text-[12px] font-semibold text-[#2B2C28]/65 tabular-nums">
            {event.rsvpCount} attending
          </span>
        </div>

        {/* Cover Image Placeholder */}
        <ImagePlaceholder
          className="w-full h-[176px] rounded-2xl"
          label={event.imageLabel || 'Event Cover Image'}
        />

        {/* Title & Price */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[20px] font-bold text-[#131515] leading-tight">
              {event.name}
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-[#7DE2D1]/45 text-[#131515] text-[13px] font-bold tabular-nums shrink-0">
              {event.price}
            </span>
          </div>
          <p className="text-[13px] text-[#2B2C28]/75 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#339989] shrink-0" />
            <span>Hosted by {event.host}</span>
          </p>
        </div>

        {/* Key Details Block */}
        <div className="rounded-xl border border-[#2B2C28]/15 bg-[#2B2C28]/[0.03] p-3.5 space-y-2.5 text-[13px] text-[#131515]">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#339989] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold leading-snug">{event.location}</p>
              <p className="text-[12px] text-[#2B2C28]/65 tabular-nums">
                {event.distanceMiles.toFixed(1)} miles away
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-[#339989] mt-0.5 shrink-0" />
            <p className="font-medium">{event.date}</p>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#339989] mt-0.5 shrink-0" />
            <p className="font-medium tabular-nums">{event.time}</p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#2B2C28]/10 text-[12.5px] text-[#2B2C28]/80">
            <span className="inline-flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-[#339989]" />
              Price: <strong className="text-[#131515]">{event.price}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Users className="w-4 h-4 text-[#339989]" />
              Capacity: <strong className="text-[#131515]">{event.capacity}</strong>
            </span>
          </div>
        </div>

        {/* Description */}
        <section className="space-y-1.5">
          <h2 className="text-[14px] font-bold text-[#131515]">About this event</h2>
          <p className="text-[13.5px] leading-relaxed text-[#2B2C28]/90">
            {event.description}
          </p>
        </section>

        {/* Event Tags (e.g., Accessible, 18+) */}
        {event.tags.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-[13px] font-bold text-[#2B2C28]/75">Event Tags</h2>
            <div className="flex flex-wrap gap-2" data-testid="event-tags">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md border border-[#2B2C28]/20 bg-[#FFFAFB] text-[12px] font-semibold text-[#2B2C28]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Primary RSVP Action */}
        <div className="pt-2 space-y-2">
          {!isAttending ? (
            <button
              type="button"
              onClick={handleRsvpClick}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#339989] hover:bg-[#2B7F71] text-[#FFFAFB] text-[14.5px] font-bold transition-colors shadow-xs"
            >
              RSVP, I&apos;m attending
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                disabled
                aria-label="You are attending"
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#7DE2D1]/45 border border-[#339989] text-[#131515] text-[14.5px] font-bold flex items-center justify-center"
              >
                <span>✓ You are attending</span>
              </button>
              <button
                type="button"
                onClick={() => onCancelRsvp(event.id)}
                className="w-full py-2 text-[12.5px] font-medium text-[#2B2C28]/70 hover:text-[#131515] underline underline-offset-2"
              >
                Cancel RSVP
              </button>
            </div>
          )}
        </div>
      </main>

      {/* RSVP Confirmation Popup */}
      {showConfirmModal && (
        <div
          className="absolute inset-0 z-50 bg-[#131515]/55 flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-confirm-title"
        >
          <div className="w-full max-w-[320px] rounded-2xl bg-[#FFFAFB] border border-[#2B2C28]/15 p-5 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#7DE2D1]/45 text-[#131515] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" strokeWidth={2.5} />
            </div>

            <div className="space-y-1.5">
              <h2 id="rsvp-confirm-title" className="text-[17px] font-bold text-[#131515]">
                You&apos;re in!
              </h2>
              <p className="text-[13.5px] text-[#2B2C28]/85 leading-relaxed">
                A confirmation has been sent to your registered email
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full min-h-[44px] rounded-xl bg-[#339989] hover:bg-[#2B7F71] text-[#FFFAFB] text-[14px] font-semibold transition-colors"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onGoHome();
                }}
                className="w-full min-h-[40px] rounded-xl border border-[#2B2C28]/20 text-[#131515] text-[13px] font-semibold hover:bg-[#2B2C28]/5 transition-colors"
              >
                View in Upcoming
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
