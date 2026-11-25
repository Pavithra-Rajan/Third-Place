import type { FormEvent } from 'react';
import { Mic, Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onOpenVoice: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  compact?: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  onSubmitSearch,
  onOpenVoice,
  onOpenFilters,
  activeFilterCount,
  compact = false,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmitSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center ${
        compact ? 'gap-0.5 pl-2.5 pr-1' : 'gap-1.5 pl-3 pr-1.5'
      } bg-[#FFFAFB] border border-[#2B2C28]/25 rounded-xl py-1 shadow-[0_1px_2px_rgba(19,21,21,0.05)] focus-within:border-[#339989] focus-within:ring-2 focus-within:ring-[#7DE2D1]/40 transition-all`}
      role="search"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search 'WFH friendly cafe'"
        aria-label="Search cafes, study spots, and events"
        className={`flex-1 min-w-0 bg-transparent ${
          compact ? 'text-[12.5px]' : 'text-[13.5px]'
        } text-[#131515] placeholder:text-[#2B2C28]/50 focus:outline-none py-2`}
      />

      {query.length > 0 && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          aria-label="Clear search"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#2B2C28]/60 hover:text-[#131515] hover:bg-[#2B2C28]/8 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={onOpenVoice}
        aria-label="Voice search"
        className={`${
          compact ? 'w-8 h-8' : 'w-9 h-9'
        } flex items-center justify-center rounded-lg text-[#2B2C28] hover:bg-[#7DE2D1]/25 hover:text-[#131515] transition-colors shrink-0`}
      >
        <Mic className="w-4 h-4" strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={onOpenFilters}
        aria-label="Filter places"
        className={`relative ${
          compact ? 'w-8 h-8' : 'w-9 h-9'
        } flex items-center justify-center rounded-lg transition-colors shrink-0 ${
          activeFilterCount > 0
            ? 'bg-[#7DE2D1]/35 text-[#131515]'
            : 'text-[#2B2C28] hover:bg-[#7DE2D1]/25 hover:text-[#131515]'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#339989] text-[#FFFAFB] text-[10px] font-bold flex items-center justify-center tabular-nums">
            {activeFilterCount}
          </span>
        )}
      </button>

      <button
        type="submit"
        aria-label="Search"
        className={`${
          compact ? 'w-8 h-8' : 'w-9 h-9'
        } flex items-center justify-center rounded-lg bg-[#339989] text-[#FFFAFB] hover:bg-[#2B7F71] transition-colors shrink-0`}
      >
        <Search className="w-4 h-4" strokeWidth={2.2} />
      </button>
    </form>
  );
}
