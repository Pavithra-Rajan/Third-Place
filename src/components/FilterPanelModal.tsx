import { useState } from 'react';
import { X } from 'lucide-react';
import {
  DEFAULT_PLACE_FILTERS,
  NOISE_LEVEL_OPTIONS,
  OPEN_TILL_OPTIONS,
  SEATING_OPTIONS,
} from '../data/mockData';
import type { PlaceFilters, SeatingType, SortOption } from '../types/thirdPlace';

interface FilterPanelModalProps {
  currentFilters: PlaceFilters;
  onApply: (nextFilters: PlaceFilters) => void;
  onClose: () => void;
}

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ id, label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <label htmlFor={id} className="text-[13.5px] font-semibold text-[#131515] cursor-pointer">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#339989] ${
          checked ? 'bg-[#339989]' : 'bg-[#2B2C28]/25'
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-[#FFFAFB] shadow-xs transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function FilterPanelModal({
  currentFilters,
  onApply,
  onClose,
}: FilterPanelModalProps) {
  const [draft, setDraft] = useState<PlaceFilters>(currentFilters);

  const handleReset = () => {
    setDraft(DEFAULT_PLACE_FILTERS);
  };

  return (
    <div
      className="absolute inset-0 z-40 bg-[#131515]/55 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-panel-title"
    >
      <div className="w-full max-h-[86%] rounded-t-3xl bg-[#FFFAFB] flex flex-col overflow-hidden shadow-2xl border-t border-[#2B2C28]/15">
        {/* Grab handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-[#2B2C28]/25" />
        </div>

        {/* Header */}
        <div className="px-5 py-2.5 border-b border-[#2B2C28]/12 flex items-center justify-between shrink-0">
          <h2 id="filter-panel-title" className="text-[17px] font-bold text-[#131515]">
            Filter Places
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter panel"
            className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-[#2B2C28] hover:bg-[#2B2C28]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Controls */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Seating Type */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-seating-type"
              className="block text-[13px] font-semibold text-[#131515]"
            >
              Seating Type
            </label>
            <select
              id="filter-seating-type"
              value={draft.seatingType}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  seatingType: e.target.value as SeatingType,
                }))
              }
              className="w-full min-h-[44px] px-3 rounded-xl border border-[#2B2C28]/25 bg-[#FFFAFB] text-[13.5px] text-[#131515] focus:outline-none focus:border-[#339989]"
            >
              {SEATING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* WiFi Only Toggle */}
          <div className="border-y border-[#2B2C28]/10 py-1">
            <ToggleRow
              id="filter-wifi-only"
              label="WiFi Only"
              checked={draft.wifiOnly}
              onChange={(wifiOnly) => setDraft((prev) => ({ ...prev, wifiOnly }))}
            />
          </div>

          {/* Open Till Dropdown (6 PM to 11 PM) */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-open-till"
              className="block text-[13px] font-semibold text-[#131515]"
            >
              Open Till
            </label>
            <select
              id="filter-open-till"
              value={draft.openTill}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, openTill: e.target.value }))
              }
              className="w-full min-h-[44px] px-3 rounded-xl border border-[#2B2C28]/25 bg-[#FFFAFB] text-[13.5px] text-[#131515] focus:outline-none focus:border-[#339989]"
            >
              {OPEN_TILL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Noise Level Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-noise-level"
              className="block text-[13px] font-semibold text-[#131515]"
            >
              Noise Level
            </label>
            <select
              id="filter-noise-level"
              value={draft.noiseLevel}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  noiseLevel: e.target.value as PlaceFilters['noiseLevel'],
                }))
              }
              className="w-full min-h-[44px] px-3 rounded-xl border border-[#2B2C28]/25 bg-[#FFFAFB] text-[13.5px] text-[#131515] focus:outline-none focus:border-[#339989]"
            >
              {NOISE_LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Power Supply & Laptop Friendly Toggles */}
          <div className="border-y border-[#2B2C28]/10 divide-y divide-[#2B2C28]/10">
            <ToggleRow
              id="filter-power-supply"
              label="Power Supply Included"
              checked={draft.powerSupply}
              onChange={(powerSupply) =>
                setDraft((prev) => ({ ...prev, powerSupply }))
              }
            />
            <ToggleRow
              id="filter-laptop-friendly"
              label="Laptop Friendly"
              checked={draft.laptopFriendly}
              onChange={(laptopFriendly) =>
                setDraft((prev) => ({ ...prev, laptopFriendly }))
              }
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-sort-by"
              className="block text-[13px] font-semibold text-[#131515]"
            >
              Sort By
            </label>
            <select
              id="filter-sort-by"
              value={draft.sortBy}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  sortBy: e.target.value as SortOption,
                }))
              }
              className="w-full min-h-[44px] px-3 rounded-xl border border-[#2B2C28]/25 bg-[#FFFAFB] text-[13.5px] text-[#131515] focus:outline-none focus:border-[#339989]"
            >
              <option value="Distance">Distance</option>
              <option value="Relevance">Relevance</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#2B2C28]/12 bg-[#FFFAFB] flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 min-h-[44px] rounded-xl border border-[#2B2C28]/25 text-[#131515] text-[14px] font-semibold hover:bg-[#2B2C28]/5 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="flex-1 min-h-[44px] rounded-xl bg-[#339989] hover:bg-[#2B7F71] text-[#FFFAFB] text-[14px] font-bold transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
