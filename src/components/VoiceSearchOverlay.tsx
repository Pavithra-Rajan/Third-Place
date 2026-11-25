import { useEffect, useState } from 'react';
import { ArrowRight, Mic, X } from 'lucide-react';

interface VoiceSearchOverlayProps {
  onClose: () => void;
  onCompleteVoiceSearch: (query: string, tab: 'events' | 'places') => void;
}

interface VoiceScenario {
  utterance: string;
  reply: string;
  searchQuery: string;
  resultTab: 'events' | 'places';
}

const VOICE_SCENARIOS: VoiceScenario[] = [
  {
    utterance: 'Find chess events near me',
    reply:
      'Found 3 chess events near you: Open Chess, NYPL Friday Night, and Chess Game Night.',
    searchQuery: 'chess',
    resultTab: 'events',
  },
  {
    utterance: 'Show WFH cafes open late',
    reply: 'Here are laptop-friendly NYC cafes with WiFi open into the evening.',
    searchQuery: 'WFH friendly cafe',
    resultTab: 'places',
  },
  {
    utterance: 'Find gardening workshops this weekend',
    reply: 'Showing nearby NYC gardening and bonsai events for you.',
    searchQuery: 'gardening',
    resultTab: 'events',
  },
];

export function VoiceSearchOverlay({
  onClose,
  onCompleteVoiceSearch,
}: VoiceSearchOverlayProps) {
  const [scenario, setScenario] = useState<VoiceScenario>(VOICE_SCENARIOS[0]);
  const [step, setStep] = useState<'listening' | 'user-spoke' | 'assistant-replied'>(
    'listening'
  );

  useEffect(() => {
    setStep('listening');
    const t1 = window.setTimeout(() => {
      setStep('user-spoke');
    }, 450);
    const t2 = window.setTimeout(() => {
      setStep('assistant-replied');
    }, 1150);
    const t3 = window.setTimeout(() => {
      onCompleteVoiceSearch(scenario.searchQuery, scenario.resultTab);
    }, 3400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [scenario, onCompleteVoiceSearch]);

  const handleSelectScenario = (next: VoiceScenario) => {
    setScenario(next);
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-[#131515] text-[#FFFAFB] flex flex-col justify-between p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Voice Search"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tracking-wider text-[#7DE2D1]">
          VOICE SEARCH
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close voice search"
          className="w-10 h-10 -mr-2 rounded-full bg-[#2B2C28] text-[#FFFAFB] flex items-center justify-center hover:bg-[#339989] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Speech Bubbles Conversation Area */}
      <div className="flex-1 flex flex-col justify-center gap-3.5 py-6">
        {step === 'listening' && (
          <p className="text-center text-[15px] font-medium text-[#FFFAFB]/80">
            Listening for NYC places or events...
          </p>
        )}

        {(step === 'user-spoke' || step === 'assistant-replied') && (
          <div className="flex justify-end" data-testid="voice-user-bubble">
            <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#339989] text-[#FFFAFB] px-4 py-3 text-[14.5px] font-semibold shadow-sm">
              &ldquo;{scenario.utterance}&rdquo;
            </div>
          </div>
        )}

        {step === 'assistant-replied' && (
          <div className="flex justify-start" data-testid="voice-assistant-bubble">
            <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-[#2B2C28] border border-[#7DE2D1]/30 text-[#FFFAFB] px-4 py-3 text-[13.5px] leading-relaxed">
              {scenario.reply}
            </div>
          </div>
        )}

        {step === 'assistant-replied' && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() =>
                onCompleteVoiceSearch(scenario.searchQuery, scenario.resultTab)
              }
              className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl bg-[#7DE2D1] text-[#131515] text-[14px] font-bold hover:bg-[#FFFAFB] transition-colors"
            >
              <span>View Matching Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Large Center Mic & Quick Voice Prompts */}
      <div className="space-y-4 pb-2">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (step === 'assistant-replied') {
                onCompleteVoiceSearch(scenario.searchQuery, scenario.resultTab);
              } else {
                setStep('assistant-replied');
              }
            }}
            aria-label="Activate microphone or view results"
            className="w-20 h-20 rounded-full bg-[#339989] text-[#FFFAFB] flex items-center justify-center shadow-[0_0_0_12px_rgba(125,226,209,0.18)] hover:bg-[#7DE2D1] hover:text-[#131515] transition-colors"
          >
            <Mic className="w-9 h-9" strokeWidth={2} />
          </button>
          <span className="text-[12px] text-[#FFFAFB]/65">
            {step === 'assistant-replied'
              ? 'Tap mic or button above to see results'
              : 'Tap a sample prompt below'}
          </span>
        </div>

        {/* Sample Voice Prompts */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-[#FFFAFB]/55 text-center">
            Try saying
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {VOICE_SCENARIOS.map((item) => {
              const isSelected = item.utterance === scenario.utterance;
              return (
                <button
                  key={item.utterance}
                  type="button"
                  onClick={() => handleSelectScenario(item)}
                  className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium border transition-colors ${
                    isSelected
                      ? 'border-[#7DE2D1] bg-[#7DE2D1]/20 text-[#7DE2D1]'
                      : 'border-[#FFFAFB]/20 bg-[#2B2C28] text-[#FFFAFB]/80 hover:border-[#7DE2D1]/60'
                  }`}
                >
                  {item.utterance}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
