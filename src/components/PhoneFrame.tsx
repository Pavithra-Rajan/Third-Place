import type { ReactNode } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: ReactNode;
  isDarkOverlay?: boolean;
}

export function PhoneFrame({ children, isDarkOverlay = false }: PhoneFrameProps) {
  return (
    <div className="min-h-screen w-full bg-[#2B2C28] sm:py-6 sm:px-4 flex items-center justify-center">
      {/* iPhone 14/15 frame: 390x844 on desktop, full-bleed on narrow mobile screens */}
      <div
        className="relative w-full h-screen sm:w-[390px] sm:h-[844px] sm:max-h-[calc(100vh-3rem)] bg-[#FFFAFB] sm:rounded-[44px] sm:border-[10px] sm:border-[#131515] sm:shadow-[0_24px_60px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden"
        data-testid="phone-frame"
      >
        {/* Minimal iOS Status Bar (visible inside frame on desktop, subtle on mobile) */}
        <div
          className="hidden sm:flex items-center justify-between px-6 pt-2.5 pb-1 bg-[#131515] text-[#FFFAFB] text-[11px] font-semibold shrink-0 select-none"
          aria-hidden="true"
        >
          <span className="tabular-nums tracking-tight">9:41</span>
          <div className="w-24 h-4 rounded-full bg-[#2B2C28]" />
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* App viewport */}
        <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden bg-[#FFFAFB] text-[#131515]">
          {children}
        </div>

        {/* Home indicator */}
        <div
          className={`hidden sm:flex justify-center py-2 shrink-0 ${
            isDarkOverlay ? 'bg-[#131515]' : 'bg-[#FFFAFB]'
          }`}
          aria-hidden="true"
        >
          <div
            className={`w-32 h-1 rounded-full ${
              isDarkOverlay ? 'bg-[#FFFAFB]/35' : 'bg-[#131515]/25'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
