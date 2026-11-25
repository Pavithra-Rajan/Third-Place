import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  className?: string;
  label?: string;
  compact?: boolean;
}

export function ImagePlaceholder({
  className = '',
  label,
  compact = false,
}: ImagePlaceholderProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#2B2C28]/10 border border-[#2B2C28]/20 flex flex-col items-center justify-center text-[#2B2C28]/55 select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          stroke="#2B2C28"
          strokeOpacity="0.12"
          strokeWidth="0.75"
        />
        <line
          x1="100"
          y1="0"
          x2="0"
          y2="100"
          stroke="#2B2C28"
          strokeOpacity="0.12"
          strokeWidth="0.75"
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-1 px-2 text-center">
        <ImageIcon className={compact ? 'w-4 h-4' : 'w-6 h-6'} strokeWidth={1.75} />
        {!compact && label && (
          <span className="text-[11px] font-medium tracking-tight text-[#2B2C28]/65">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
