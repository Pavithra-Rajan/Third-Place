import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  ImagePlus,
  MapPin,
  Pencil,
  Ticket,
  Users,
} from 'lucide-react';
import { TIME_DROPDOWN_OPTIONS } from '../data/mockData';
import type { CreateEventInput } from '../types/thirdPlace';
import {
  validateCreateEventForm,
  type CreateEventValidationErrors,
} from '../utils/thirdPlaceLogic';

interface CreateEventScreenProps {
  onBack: () => void;
  onCreateEvent: (input: CreateEventInput) => void;
}

export function CreateEventScreen({
  onBack,
  onCreateEvent,
}: CreateEventScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateEventInput>({
    name: '',
    startDate: '2026-12-04',
    startTime: '6:00 PM',
    endDate: '2026-12-04',
    endTime: '8:30 PM',
    location: '',
    description: '',
    ticketPrice: 'Free',
    capacity: 'Unlimited',
    imageLabel: '',
  });

  const [editingPrice, setEditingPrice] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [errors, setErrors] = useState<CreateEventValidationErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageLabel: file.name }));
    }
  };

  const handlePlaceholderUploadClick = () => {
    if (!form.imageLabel) {
      setForm((prev) => ({ ...prev, imageLabel: 'event-cover-placeholder.png' }));
    }
    fileInputRef.current?.click();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateCreateEventForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.ticketPrice) setEditingPrice(true);
      if (validationErrors.capacity) setEditingCapacity(true);
      return;
    }

    setErrors({});
    onCreateEvent(form);
    setShowSuccessModal(true);
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-8">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="inline-flex items-center gap-1.5 min-h-[40px] pr-3 text-[13.5px] font-semibold text-[#131515] hover:text-[#339989] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-[16px] font-bold text-[#131515]">Create Event</h1>
          <div className="w-12" aria-hidden="true" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Image Upload Placeholder */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="sr-only"
              aria-label="Upload event cover image"
            />
            <button
              type="button"
              onClick={handlePlaceholderUploadClick}
              className="w-full h-[120px] rounded-2xl border-2 border-dashed border-[#2B2C28]/25 bg-[#2B2C28]/[0.04] hover:border-[#339989] hover:bg-[#7DE2D1]/15 transition-colors flex flex-col items-center justify-center gap-1.5 text-[#2B2C28]/75"
            >
              <ImagePlus className="w-6 h-6 text-[#339989]" />
              <span className="text-[13px] font-semibold text-[#131515]">
                {form.imageLabel ? `Selected: ${form.imageLabel}` : 'Add Event Cover Image'}
              </span>
              <span className="text-[11.5px] text-[#2B2C28]/60">
                Tap to select placeholder image
              </span>
            </button>
          </div>

          {/* Event Name */}
          <div className="space-y-1">
            <label
              htmlFor="create-event-name"
              className="block text-[13px] font-semibold text-[#131515]"
            >
              Event Name
            </label>
            <input
              id="create-event-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. SoHo Sketch & Coffee"
              className={`w-full min-h-[44px] px-3.5 rounded-xl border bg-[#FFFAFB] text-[14px] text-[#131515] placeholder:text-[#2B2C28]/45 focus:outline-none focus:border-[#339989] ${
                errors.name ? 'border-red-600' : 'border-[#2B2C28]/25'
              }`}
            />
            {errors.name && (
              <p className="text-[12px] font-medium text-red-700" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Start & End Date/Time */}
          <div className="rounded-xl border border-[#2B2C28]/15 bg-[#2B2C28]/[0.03] p-3 space-y-3">
            <div className="space-y-1.5">
              <span className="text-[12.5px] font-bold text-[#131515] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#339989]" />
                Start Date &amp; Time
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  aria-label="Start Date"
                  value={form.startDate}
                  onChange={(e) => {
                    const nextStart = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      startDate: nextStart,
                      endDate: prev.endDate < nextStart ? nextStart : prev.endDate,
                    }));
                    if (errors.dates) setErrors((prev) => ({ ...prev, dates: undefined }));
                  }}
                  className="min-h-[42px] px-2.5 rounded-lg border border-[#2B2C28]/20 bg-[#FFFAFB] text-[12.5px] text-[#131515] tabular-nums"
                />
                <select
                  aria-label="Start Time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                  className="min-h-[42px] px-2.5 rounded-lg border border-[#2B2C28]/20 bg-[#FFFAFB] text-[12.5px] text-[#131515] tabular-nums"
                >
                  {TIME_DROPDOWN_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#2B2C28]/10">
              <span className="text-[12.5px] font-bold text-[#131515] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#339989]" />
                End Date &amp; Time
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  aria-label="End Date"
                  value={form.endDate}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, endDate: e.target.value }));
                    if (errors.dates) setErrors((prev) => ({ ...prev, dates: undefined }));
                  }}
                  className="min-h-[42px] px-2.5 rounded-lg border border-[#2B2C28]/20 bg-[#FFFAFB] text-[12.5px] text-[#131515] tabular-nums"
                />
                <select
                  aria-label="End Time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="min-h-[42px] px-2.5 rounded-lg border border-[#2B2C28]/20 bg-[#FFFAFB] text-[12.5px] text-[#131515] tabular-nums"
                >
                  {TIME_DROPDOWN_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errors.dates && (
              <p className="text-[12px] font-medium text-red-700" role="alert">
                {errors.dates}
              </p>
            )}
          </div>

          {/* Add Event Location */}
          <div className="space-y-1">
            <label
              htmlFor="create-event-location"
              className="block text-[13px] font-semibold text-[#131515]"
            >
              Add Event Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#339989] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="create-event-location"
                type="text"
                value={form.location}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, location: e.target.value }));
                  if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
                }}
                placeholder="e.g. Bryant Park, Midtown"
                className={`w-full min-h-[44px] pl-9 pr-3.5 rounded-xl border bg-[#FFFAFB] text-[13.5px] text-[#131515] placeholder:text-[#2B2C28]/45 focus:outline-none focus:border-[#339989] ${
                  errors.location ? 'border-red-600' : 'border-[#2B2C28]/25'
                }`}
              />
            </div>
            {errors.location && (
              <p className="text-[12px] font-medium text-red-700" role="alert">
                {errors.location}
              </p>
            )}
          </div>

          {/* Add Description */}
          <div className="space-y-1">
            <label
              htmlFor="create-event-description"
              className="block text-[13px] font-semibold text-[#131515]"
            >
              Add Description
            </label>
            <textarea
              id="create-event-description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Share what to expect, what to bring, or accessibility details..."
              className="w-full p-3 rounded-xl border border-[#2B2C28]/25 bg-[#FFFAFB] text-[13.5px] text-[#131515] placeholder:text-[#2B2C28]/45 focus:outline-none focus:border-[#339989] resize-none"
            />
          </div>

          {/* Event Options: Ticket Price & Capacity */}
          <div className="rounded-xl border border-[#2B2C28]/15 bg-[#FFFAFB] divide-y divide-[#2B2C28]/12">
            <div className="px-3.5 py-2.5 bg-[#2B2C28]/[0.04]">
              <h2 className="text-[12.5px] font-bold text-[#131515]">Event Options</h2>
            </div>

            {/* Ticket Price */}
            <div className="px-3.5 py-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-medium text-[#131515] flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#339989]" />
                  Ticket Price
                </span>

                {!editingPrice ? (
                  <button
                    type="button"
                    onClick={() => setEditingPrice(true)}
                    aria-label="Edit Ticket Price"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2B2C28]/8 text-[13px] font-semibold text-[#131515] hover:bg-[#7DE2D1]/35 transition-colors"
                  >
                    <span>{form.ticketPrice}</span>
                    <Pencil className="w-3 h-3 text-[#2B2C28]/65" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      aria-label="Ticket Price value"
                      value={form.ticketPrice}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, ticketPrice: e.target.value }));
                        if (errors.ticketPrice)
                          setErrors((prev) => ({ ...prev, ticketPrice: undefined }));
                      }}
                      className="w-24 px-2.5 py-1.5 rounded-lg border border-[#339989] text-[13px] text-[#131515] bg-[#FFFAFB]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.ticketPrice.trim()) {
                          setForm((prev) => ({ ...prev, ticketPrice: 'Free' }));
                        }
                        setEditingPrice(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#131515] text-[#FFFAFB] text-[12px] font-semibold"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              {errors.ticketPrice && (
                <p className="text-[12px] font-medium text-red-700" role="alert">
                  {errors.ticketPrice}
                </p>
              )}
            </div>

            {/* Capacity */}
            <div className="px-3.5 py-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-medium text-[#131515] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#339989]" />
                  Capacity
                </span>

                {!editingCapacity ? (
                  <button
                    type="button"
                    onClick={() => setEditingCapacity(true)}
                    aria-label="Edit Capacity"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2B2C28]/8 text-[13px] font-semibold text-[#131515] hover:bg-[#7DE2D1]/35 transition-colors"
                  >
                    <span>{form.capacity}</span>
                    <Pencil className="w-3 h-3 text-[#2B2C28]/65" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      aria-label="Capacity value"
                      value={form.capacity}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, capacity: e.target.value }));
                        if (errors.capacity)
                          setErrors((prev) => ({ ...prev, capacity: undefined }));
                      }}
                      className="w-24 px-2.5 py-1.5 rounded-lg border border-[#339989] text-[13px] text-[#131515] bg-[#FFFAFB]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.capacity.trim()) {
                          setForm((prev) => ({ ...prev, capacity: 'Unlimited' }));
                        }
                        setEditingCapacity(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#131515] text-[#FFFAFB] text-[12px] font-semibold"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              {errors.capacity && (
                <p className="text-[12px] font-medium text-red-700" role="alert">
                  {errors.capacity}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full min-h-[48px] rounded-xl bg-[#339989] hover:bg-[#2B7F71] text-[#FFFAFB] text-[15px] font-bold transition-colors shadow-xs"
          >
            Create Event
          </button>
        </form>
      </main>

      {/* Success Popup */}
      {showSuccessModal && (
        <div
          className="absolute inset-0 z-50 bg-[#131515]/55 flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-success-title"
        >
          <div className="w-full max-w-[320px] rounded-2xl bg-[#FFFAFB] border border-[#2B2C28]/15 p-5 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#7DE2D1]/45 text-[#131515] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h2 id="create-success-title" className="text-[17px] font-bold text-[#131515]">
                Event created successfully!
              </h2>
              <p className="text-[13px] text-[#2B2C28]/75">
                &ldquo;{form.name.trim()}&rdquo; is now listed under My Events on Home.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                onBack();
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#339989] hover:bg-[#2B7F71] text-[#FFFAFB] text-[14px] font-bold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
