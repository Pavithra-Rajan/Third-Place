import { User } from 'lucide-react';

interface AppHeaderProps {
  onLogoClick: () => void;
  onProfileClick: () => void;
  isProfileActive?: boolean;
}

export function AppHeader({
  onLogoClick,
  onProfileClick,
  isProfileActive = false,
}: AppHeaderProps) {
  return (
    <header className="h-[52px] shrink-0 bg-[#131515] text-[#FFFAFB] px-4 flex items-center justify-between border-b border-[#2B2C28] z-20">
      <button
        type="button"
        onClick={onLogoClick}
        aria-label="THIRD PLACE Home"
        className="flex items-center gap-2 text-left min-h-[44px] pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DE2D1] rounded-md"
      >
        <span className="w-2.5 h-2.5 rounded-xs bg-[#7DE2D1] shrink-0" aria-hidden="true" />
        <span className="text-[15px] font-bold tracking-[0.12em] text-[#FFFAFB] whitespace-nowrap">
          THIRD PLACE
        </span>
      </button>

      <button
        type="button"
        onClick={onProfileClick}
        aria-label="Open Profile"
        aria-pressed={isProfileActive}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DE2D1] ${
          isProfileActive
            ? 'bg-[#339989] text-[#FFFAFB]'
            : 'bg-[#2B2C28] text-[#FFFAFB] hover:bg-[#339989]/80'
        }`}
      >
        <User className="w-[18px] h-[18px]" strokeWidth={2} />
      </button>
    </header>
  );
}
