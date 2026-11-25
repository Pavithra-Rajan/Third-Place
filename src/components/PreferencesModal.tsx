import { useEffect, useRef, useState } from 'react';
import { Info, Plus, Search, X } from 'lucide-react';
import { INTEREST_SUGGESTIONS } from '../data/mockData';
import type { UserPreferences } from '../types/thirdPlace';
import {
  COST_SLIDER_STOPS,
  DISTANCE_SLIDER_MIN_MILES,
  DISTANCE_SLIDER_OVER_10_VALUE,
  formatCostPreference,
  formatDistancePreference,
  getNearestCostSliderIndex,
  milesToDistanceSliderValue,
  parseCustomCostInput,
  resolveDistanceSliderChange,
} from '../utils/thirdPlaceLogic';

interface PreferencesModalProps {
  currentPreferences: UserPreferences;
  onSave: (nextPreferences: UserPreferences) => void;
  onClose: () => void;
}

export function PreferencesModal({
  currentPreferences,
  onSave,
  onClose,
}: PreferencesModalProps) {
  const [draft, setDraft] = useState<UserPreferences>(currentPreferences);
  const [interestInput, setInterestInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [customCostText, setCustomCostText] = useState(
    String(currentPreferences.maxCostDollars)
  );
  const [costError, setCostError] = useState<string | null>(null);

  const interestsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDropdown) return;

    const handlePointerOutside = (event: MouseEvent | TouchEvent) => {
      if (
        interestsContainerRef.current &&
        !interestsContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handlePointerOutside);
    document.addEventListener('touchstart', handlePointerOutside);
    return () => {
      document.removeEventListener('mousedown', handlePointerOutside);
      document.removeEventListener('touchstart', handlePointerOutside);
    };
  }, [showDropdown]);

  const filteredSuggestions = INTEREST_SUGGESTIONS.filter((topic) => {
    const alreadyAdded = draft.interests.some(
      (existing) => existing.toLowerCase() === topic.toLowerCase()
    );
    if (alreadyAdded) return false;
    if (!interestInput.trim()) return true;
    return topic.toLowerCase().includes(interestInput.trim().toLowerCase());
  });

  const addInterest = (topic: string) => {
    const clean = topic.trim();
    if (!clean) return;
    const exists = draft.interests.some(
      (item) => item.toLowerCase() === clean.toLowerCase()
    );
    if (!exists) {
      setDraft((prev) => ({ ...prev, interests: [...prev.interests, clean] }));
    }
    setInterestInput('');
    setShowDropdown(false);
  };

  const removeInterest = (topic: string) => {
    setDraft((prev) => ({
      ...prev,
      interests: prev.interests.filter((item) => item !== topic),
    }));
  };

  const handleCostSliderChange = (value: number) => {
    setDraft((prev) => ({ ...prev, maxCostDollars: value }));
    setCustomCostText(String(value));
    setCostError(null);
  };

  const handleCustomCostChange = (raw: string) => {
    setCustomCostText(raw);
    if (!raw.trim()) {
      setCostError(null);
      return;
    }
    const parsed = parseCustomCostInput(raw);
    if (parsed.valid && parsed.value !== null) {
      setDraft((prev) => ({ ...prev, maxCostDollars: parsed.value! }));
      setCostError(null);
    } else {
      setCostError(parsed.error ?? 'Enter a valid dollar amount.');
    }
  };

  const handleCustomCostBlur = () => {
    if (!customCostText.trim()) {
      setCustomCostText(String(draft.maxCostDollars));
      setCostError(null);
      return;
    }
    const parsed = parseCustomCostInput(customCostText);
    if (parsed.valid && parsed.value !== null) {
      setDraft((prev) => ({ ...prev, maxCostDollars: parsed.value! }));
      setCustomCostText(String(parsed.value));
      setCostError(null);
    } else {
      setCostError(parsed.error ?? 'Enter a valid dollar amount.');
    }
  };

  const handleSave = () => {
    const parsed = parseCustomCostInput(customCostText);
    if (!parsed.valid || parsed.value === null) {
      setCostError(parsed.error ?? 'Enter a valid dollar amount.');
      return;
    }
    onSave({ ...draft, maxCostDollars: parsed.value });
  };

  const distanceSliderValue = milesToDistanceSliderValue(draft.maxDistanceMiles);
  const isOverTenMiles = draft.maxDistanceMiles === null;
  const costSliderIndex = getNearestCostSliderIndex(draft.maxCostDollars);

  return (
    <div
      className="absolute inset-0 z-40 bg-[#131515]/55 flex items-center justify-center p-3.5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preferences-modal-title"
    >
      <div className="w-full max-h-[88%] rounded-2xl bg-[#FFFAFB] border border-[#2B2C28]/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-[#2B2C28]/12 flex items-center justify-between shrink-0">
          <div>
            <h2
              id="preferences-modal-title"
              className="text-[17px] font-bold text-[#131515]"
            >
              Preferences
            </h2>
            <div className="relative inline-flex items-center gap-1 mt-0.5">
              <span className="text-[12px] text-[#2B2C28]/75">How it works?</span>
              <button
                type="button"
                onClick={() => setShowTooltip((prev) => !prev)}
                aria-label="How it works info"
                aria-expanded={showTooltip}
                className="w-6 h-6 rounded-full inline-flex items-center justify-center text-[#339989] hover:bg-[#7DE2D1]/30 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preferences"
            className="w-10 h-10 -mr-1.5 rounded-full flex items-center justify-center text-[#2B2C28] hover:bg-[#2B2C28]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {showTooltip && (
            <div
              role="tooltip"
              className="rounded-xl bg-[#131515] text-[#FFFAFB] px-3.5 py-2.5 text-[12.5px] leading-snug flex items-start justify-between gap-2"
            >
              <span>Add topics about which you want to see more of</span>
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                aria-label="Dismiss info tooltip"
                className="text-[#7DE2D1] shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Interests Autocomplete Search */}
          <div className="space-y-2">
            <div>
              <span
                id="preferences-interests-label"
                className="inline-block text-[13.5px] font-bold text-[#131515]"
              >
                Interests
              </span>
            </div>

            <div
              ref={interestsContainerRef}
              onBlur={(e) => {
                if (
                  !interestsContainerRef.current?.contains(
                    e.relatedTarget as Node | null
                  )
                ) {
                  setShowDropdown(false);
                }
              }}
              className="space-y-1.5"
            >
              {/* Keep Search icon anchored solely to the input container so opening the dropdown never shifts it */}
              <div className="relative">
                <Search
                  data-testid="interests-search-icon"
                  className="w-4 h-4 text-[#2B2C28]/55 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  id="preferences-interests-input"
                  aria-labelledby="preferences-interests-label"
                  type="text"
                  value={interestInput}
                  onFocus={() => setShowDropdown(true)}
                  onClick={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setInterestInput(e.target.value);
                    setShowDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowDropdown(false);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredSuggestions.length > 0 && interestInput.trim()) {
                        addInterest(filteredSuggestions[0]);
                      } else if (interestInput.trim()) {
                        addInterest(interestInput);
                      }
                    }
                  }}
                  placeholder="Search topics (e.g. Gardening, Pottery)"
                  className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-[#2B2C28]/25 bg-[#FFFAFB] text-[13.5px] text-[#131515] placeholder:text-[#2B2C28]/45 focus:outline-none focus:border-[#339989]"
                />
              </div>

              {showDropdown && filteredSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  aria-label="Interest suggestions"
                  className="max-h-[150px] overflow-y-auto rounded-xl border border-[#2B2C28]/20 bg-[#FFFAFB] shadow-md divide-y divide-[#2B2C28]/8"
                >
                  {filteredSuggestions.slice(0, 6).map((topic) => (
                    <li key={topic}>
                      <button
                        type="button"
                        onClick={() => addInterest(topic)}
                        className="w-full px-3 py-2.5 text-left text-[13px] font-medium text-[#131515] hover:bg-[#7DE2D1]/25 flex items-center justify-between"
                      >
                        <span>{topic}</span>
                        <Plus className="w-3.5 h-3.5 text-[#339989]" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Selected Interests Removable Chips */}
            {draft.interests.length > 0 ? (
              <div
                className="flex flex-wrap gap-1.5 pt-1"
                data-testid="selected-interests-chips"
              >
                {draft.interests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => removeInterest(interest)}
                    aria-label={`Remove interest ${interest}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#7DE2D1]/45 border border-[#339989]/50 text-[#131515] text-[12.5px] font-semibold hover:bg-[#7DE2D1]/70 transition-colors"
                  >
                    <span>{interest}</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#2B2C28]/60">
                No topics selected yet. Try Gardening or Pottery.
              </p>
            )}
          </div>

          {/* Accessibility Radio Buttons */}
          <fieldset className="space-y-2">
            <legend className="text-[13.5px] font-bold text-[#131515]">
              Accessibility
            </legend>
            <div className="grid grid-cols-2 gap-2.5">
              <label
                className={`min-h-[44px] px-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer ${
                  draft.accessibleOnly
                    ? 'border-[#339989] bg-[#7DE2D1]/25 text-[#131515]'
                    : 'border-[#2B2C28]/20 bg-[#FFFAFB] text-[#2B2C28]'
                }`}
              >
                <input
                  type="radio"
                  name="accessibility-pref"
                  value="yes"
                  checked={draft.accessibleOnly === true}
                  onChange={() =>
                    setDraft((prev) => ({ ...prev, accessibleOnly: true }))
                  }
                  className="accent-[#339989] w-4 h-4"
                />
                <span className="text-[13.5px] font-semibold">Yes</span>
              </label>

              <label
                className={`min-h-[44px] px-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer ${
                  !draft.accessibleOnly
                    ? 'border-[#339989] bg-[#7DE2D1]/25 text-[#131515]'
                    : 'border-[#2B2C28]/20 bg-[#FFFAFB] text-[#2B2C28]'
                }`}
              >
                <input
                  type="radio"
                  name="accessibility-pref"
                  value="no"
                  checked={draft.accessibleOnly === false}
                  onChange={() =>
                    setDraft((prev) => ({ ...prev, accessibleOnly: false }))
                  }
                  className="accent-[#339989] w-4 h-4"
                />
                <span className="text-[13.5px] font-semibold">No</span>
              </label>
            </div>
          </fieldset>

          {/* Distance Slider (1 to 10 mi, plus > 10 mi) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="preferences-distance-slider"
                className="text-[13.5px] font-bold text-[#131515]"
              >
                Distance
              </label>
              <span
                data-testid="distance-value-label"
                className="text-[13px] font-bold text-[#339989] tabular-nums"
              >
                {formatDistancePreference(draft.maxDistanceMiles)}
              </span>
            </div>
            <input
              id="preferences-distance-slider"
              type="range"
              min={DISTANCE_SLIDER_MIN_MILES}
              max={DISTANCE_SLIDER_OVER_10_VALUE}
              step={1}
              value={distanceSliderValue}
              aria-valuetext={formatDistancePreference(draft.maxDistanceMiles)}
              onChange={(e) => {
                const rawVal = Number(e.target.value);
                setDraft((prev) => ({
                  ...prev,
                  maxDistanceMiles: resolveDistanceSliderChange(
                    rawVal,
                    prev.maxDistanceMiles
                  ),
                }));
              }}
              className="w-full tp-slider"
            />
            {/* Tick labels positioned at the exact thumb center for 1 (0%), 5 (4/12), 10 (9/12), and >10 (100%) */}
            <div className="relative h-4 text-[11px] text-[#2B2C28]/60 tabular-nums select-none">
              <span
                data-testid="distance-tick-1"
                className={`absolute left-0 ${
                  draft.maxDistanceMiles === 1 ? 'font-bold text-[#339989]' : ''
                }`}
              >
                1 mi
              </span>
              <span
                data-testid="distance-tick-5"
                className={`absolute left-[calc(11px+(100%-22px)*0.333333)] -translate-x-1/2 ${
                  draft.maxDistanceMiles === 5 ? 'font-bold text-[#339989]' : ''
                }`}
              >
                5 mi
              </span>
              <span
                data-testid="distance-tick-10"
                className={`absolute left-[calc(11px+(100%-22px)*0.75)] -translate-x-1/2 ${
                  draft.maxDistanceMiles === 10 ? 'font-bold text-[#339989]' : ''
                }`}
              >
                10 mi
              </span>
              <span
                data-testid="distance-tick-over10"
                className={`absolute right-0 ${
                  isOverTenMiles ? 'font-bold text-[#339989]' : ''
                }`}
              >
                &gt; 10 mi
              </span>
            </div>
          </div>

          {/* Cost Slider ($0, $10, $30, $50) + Custom Dollar Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="preferences-cost-slider"
                className="text-[13.5px] font-bold text-[#131515]"
              >
                Cost
              </label>
              <span
                data-testid="cost-value-label"
                className="text-[13px] font-bold text-[#339989] tabular-nums"
              >
                {formatCostPreference(draft.maxCostDollars)}
              </span>
            </div>
            <input
              id="preferences-cost-slider"
              type="range"
              min={0}
              max={COST_SLIDER_STOPS.length - 1}
              step={1}
              value={costSliderIndex}
              aria-valuetext={formatCostPreference(draft.maxCostDollars)}
              onChange={(e) => {
                const idx = Number(e.target.value);
                handleCostSliderChange(COST_SLIDER_STOPS[idx]);
              }}
              className="w-full tp-slider"
            />
            <div className="relative h-4 text-[11px] font-medium text-[#2B2C28]/65 tabular-nums select-none">
              <span
                data-testid="cost-tick-0"
                className={`absolute left-0 ${
                  draft.maxCostDollars === 0 ? 'font-bold text-[#339989]' : ''
                }`}
              >
                $0
              </span>
              <span
                data-testid="cost-tick-10"
                className={`absolute left-[calc(11px+(100%-22px)*0.333333)] -translate-x-1/2 ${
                  draft.maxCostDollars === 10 ? 'font-bold text-[#339989]' : ''
                }`}
              >
                $10
              </span>
              <span
                data-testid="cost-tick-30"
                className={`absolute left-[calc(11px+(100%-22px)*0.666667)] -translate-x-1/2 ${
                  draft.maxCostDollars === 30 ? 'font-bold text-[#339989]' : ''
                }`}
              >
                $30
              </span>
              <span
                data-testid="cost-tick-50"
                className={`absolute right-0 ${
                  draft.maxCostDollars === 50 ? 'font-bold text-[#339989]' : ''
                }`}
              >
                $50
              </span>
            </div>

            <div className="pt-1 flex items-center justify-between gap-2.5">
              <label
                htmlFor="preferences-cost-custom"
                className="text-[12.5px] font-semibold text-[#2B2C28]/80 whitespace-nowrap"
              >
                Custom max ($)
              </label>
              <div className="relative w-32">
                <span
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#2B2C28]/65 pointer-events-none"
                >
                  $
                </span>
                <input
                  id="preferences-cost-custom"
                  type="text"
                  inputMode="decimal"
                  value={customCostText}
                  onChange={(e) => handleCustomCostChange(e.target.value)}
                  onBlur={handleCustomCostBlur}
                  placeholder="e.g. 75"
                  aria-invalid={Boolean(costError)}
                  aria-describedby={costError ? 'preferences-cost-error' : undefined}
                  className={`w-full min-h-[38px] pl-7 pr-3 rounded-xl border bg-[#FFFAFB] text-[13.5px] font-semibold text-[#131515] tabular-nums focus:outline-none ${
                    costError
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-[#2B2C28]/25 focus:border-[#339989]'
                  }`}
                />
              </div>
            </div>
            {costError && (
              <p
                id="preferences-cost-error"
                role="alert"
                className="text-[12px] text-red-600 font-medium"
              >
                {costError}
              </p>
            )}
          </div>
        </div>

        {/* Footer Customize CTA */}
        <div className="px-4 py-3.5 border-t border-[#2B2C28]/12 bg-[#FFFAFB] shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="w-full min-h-[46px] rounded-xl bg-[#339989] hover:bg-[#2B7F71] text-[#FFFAFB] text-[14.5px] font-bold transition-colors"
          >
            Customize
          </button>
        </div>
      </div>
    </div>
  );
}
