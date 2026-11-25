import {
  ArrowLeft,
  Armchair,
  Clock,
  Laptop,
  MapPin,
  Plug,
  Volume2,
  Wifi,
} from 'lucide-react';
import type { PlaceItem } from '../types/thirdPlace';
import { ImagePlaceholder } from './ImagePlaceholder';

interface PlaceDetailScreenProps {
  place: PlaceItem;
  onBack: () => void;
}

export function PlaceDetailScreen({ place, onBack }: PlaceDetailScreenProps) {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-4">
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
        <span className="text-[12px] font-semibold text-[#2B2C28]/65">
          {place.neighborhood}
        </span>
      </div>

      <ImagePlaceholder
        className="w-full h-[176px] rounded-2xl"
        label={place.imageLabel || 'Place Photo'}
      />

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-[20px] font-bold text-[#131515] leading-tight">
            {place.name}
          </h1>
          <span className="px-2.5 py-1 rounded-lg bg-[#2B2C28]/10 text-[#131515] text-[13px] font-bold shrink-0">
            {place.priceTag}
          </span>
        </div>
        <p className="text-[13px] text-[#2B2C28]/75 flex items-center gap-1.5 tabular-nums">
          <MapPin className="w-4 h-4 text-[#339989] shrink-0" />
          <span>
            {place.address} · {place.distanceMiles.toFixed(1)} mi
          </span>
        </p>
      </div>

      {/* Study & WFH Specs Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-[#2B2C28]/15 p-3 bg-[#FFFAFB]">
          <p className="text-[11px] font-semibold text-[#2B2C28]/65 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-[#339989]" />
            WiFi
          </p>
          <p className="text-[13px] font-semibold text-[#131515] mt-1">{place.wifiInfo}</p>
        </div>

        <div className="rounded-xl border border-[#2B2C28]/15 p-3 bg-[#FFFAFB]">
          <p className="text-[11px] font-semibold text-[#2B2C28]/65 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-[#339989]" />
            Noise Level
          </p>
          <p className="text-[13px] font-semibold text-[#131515] mt-1">{place.noiseLevel}</p>
        </div>

        <div className="rounded-xl border border-[#2B2C28]/15 p-3 bg-[#FFFAFB]">
          <p className="text-[11px] font-semibold text-[#2B2C28]/65 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#339989]" />
            Open Till
          </p>
          <p className="text-[13px] font-semibold text-[#131515] mt-1">{place.openTillLabel}</p>
        </div>

        <div className="rounded-xl border border-[#2B2C28]/15 p-3 bg-[#FFFAFB]">
          <p className="text-[11px] font-semibold text-[#2B2C28]/65 flex items-center gap-1">
            <Armchair className="w-3.5 h-3.5 text-[#339989]" />
            Seating
          </p>
          <p className="text-[13px] font-semibold text-[#131515] mt-1">{place.seatingType}</p>
        </div>
      </div>

      {/* Amenities summary */}
      <div className="rounded-xl border border-[#2B2C28]/15 bg-[#2B2C28]/[0.03] p-3.5 flex items-center justify-between text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-[#131515]">
          <Plug className="w-4 h-4 text-[#339989]" />
          Power: {place.powerSupply ? 'Included' : 'Limited'}
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-[#131515]">
          <Laptop className="w-4 h-4 text-[#339989]" />
          Laptop: {place.laptopFriendly ? 'Friendly' : 'No Laptops'}
        </span>
      </div>

      <section className="space-y-1.5">
        <h2 className="text-[14px] font-bold text-[#131515]">Overview</h2>
        <p className="text-[13.5px] leading-relaxed text-[#2B2C28]/90">
          {place.description}
        </p>
      </section>
    </main>
  );
}
