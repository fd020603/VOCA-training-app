import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pause,
  Play,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import type { PassageItem, VocabularyEntry, WordMeaningEntry } from '../types/study';
import { COMMON_ENGLISH_DICT } from '../utils/commonDictionary';

interface PassageReaderProps {
  passages: PassageItem[];
  vocabularyTable: VocabularyEntry[];
  wordMeanings?: Record<string, WordMeaningEntry>;
  sessionKey: string;
}

type PlaybackSpeed = 0.8 | 1.0 | 1.2;

interface TooltipData {
  tokenKey: string;
  surface: string;
  baseWord?: string;
  partOfSpeech: string;
  coreMeaning?: string;
  contextMeaning: string;
  isTarget: boolean;
  anchorRect: {
    top: number;
    bottom: number;
    left: number;
    width: number;
  };
}

function stripTagsToPlainText(taggedText: string): string {
  return taggedText.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$1');
}

function countEnglishWords(text: string): number {
  const plain = stripTagsToPlainText(text).trim();
  if (!plain) return 0;
  return plain.split(/\s+/).length;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang === 'en-US' && /natural|google|samantha|daniel/i.test(v.name)) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en-')) ||
    null
  );
}

export function PassageReader({
  passages,
  vocabularyTable,
  wordMeanings,
  sessionKey,
}: PassageReaderProps) {
  const [expandedTranslations, setExpandedTranslations] = useState<Record<number, boolean>>({});
  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
  const [speakingDocNumber, setSpeakingDocNumber] = useState<number | 'all' | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const [hoveredTooltip, setHoveredTooltip] = useState<TooltipData | null>(null);
  const [pinnedTooltip, setPinnedTooltip] = useState<TooltipData | null>(null);
  const [isBlankMode, setIsBlankMode] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(() => new Set());

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const hoverClearTimerRef = useRef<number | null>(null);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const vocabByLower = useMemo(() => {
    const map = new Map<string, VocabularyEntry>();
    for (const item of vocabularyTable) {
      map.set(item.word.trim().toLowerCase(), item);
      if (item.matchedForm) {
        map.set(item.matchedForm.trim().toLowerCase(), item);
      }
    }
    return map;
  }, [vocabularyTable]);

  // Combined fast 0ms dictionary lookup
  const lookupWord = (surface: string, explicitBase?: string): Omit<TooltipData, 'tokenKey' | 'anchorRect'> => {
    const lowerSurface = surface.trim().toLowerCase();
    const lowerBase = explicitBase?.trim().toLowerCase();

    const vocabEntry =
      (lowerBase ? vocabByLower.get(lowerBase) : undefined) ?? vocabByLower.get(lowerSurface);

    if (vocabEntry) {
      return {
        surface,
        baseWord: vocabEntry.word,
        partOfSpeech: vocabEntry.partOfSpeech || '-',
        coreMeaning: vocabEntry.coreMeaning,
        contextMeaning: vocabEntry.contextMeaning || vocabEntry.coreMeaning,
        isTarget: true,
      };
    }

    const dictEntry =
      wordMeanings?.[lowerSurface] ??
      (lowerBase ? wordMeanings?.[lowerBase] : undefined) ??
      COMMON_ENGLISH_DICT[lowerSurface] ??
      (lowerSurface.endsWith("'s") ? COMMON_ENGLISH_DICT[lowerSurface.slice(0, -2)] : undefined);

    if (dictEntry) {
      return {
        surface,
        baseWord: dictEntry.baseWord,
        partOfSpeech: dictEntry.partOfSpeech || '-',
        contextMeaning: dictEntry.meaning,
        isTarget: Boolean(explicitBase),
      };
    }

    return {
      surface,
      baseWord: explicitBase,
      partOfSpeech: '-',
      contextMeaning: '지문 문맥 속 어휘 (새 지문 생성 시 전체 사전 매핑 지원)',
      isTarget: Boolean(explicitBase),
    };
  };

  const allTargetTokenKeys = useMemo(() => {
    const keys: string[] = [];
    for (const passage of passages) {
      const paragraphs = passage.englishTaggedText
        .split(/\n{2,}|\n/)
        .filter((p) => p.trim().length > 0);
      paragraphs.forEach((para, pIdx) => {
        const segments = para.split(/(\[\[[^\]]+\]\])/g);
        segments.forEach((seg, sIdx) => {
          if (/^\[\[([^|\]]+)\|([^\]]+)\]\]$/.test(seg)) {
            keys.push(`target-${passage.docNumber}-${pIdx}-${sIdx}`);
          }
        });
      });
    }
    return keys;
  }, [passages]);

  // Reset states & cancel speech on session switch
  useEffect(() => {
    setExpandedTranslations({});
    setHoveredTooltip(null);
    setPinnedTooltip(null);
    setRevealedTokens(new Set());
    if (ttsSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeakingDocNumber(null);
    setIsPaused(false);
  }, [sessionKey, ttsSupported]);

  useEffect(() => {
    return () => {
      if (hoverClearTimerRef.current) window.clearTimeout(hoverClearTimerRef.current);
      if (ttsSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [ttsSupported]);

  // Dismiss pinned/hovered tooltip on Escape, outside click, or scroll
  useEffect(() => {
    if (!pinnedTooltip && !hoveredTooltip) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPinnedTooltip(null);
        setHoveredTooltip(null);
      }
    };
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-vocab-token="true"]')) return;
      if (tooltipRef.current && !tooltipRef.current.contains(target)) {
        setPinnedTooltip(null);
        setHoveredTooltip(null);
      }
    };
    const handleScroll = () => {
      setHoveredTooltip(null);
      setPinnedTooltip(null);
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [pinnedTooltip, hoveredTooltip]);

  const stopSpeech = () => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingDocNumber(null);
    setIsPaused(false);
  };

  const speakText = (text: string, target: number | 'all', overrideSpeed?: PlaybackSpeed) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickEnglishVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = 'en-US';
    utterance.rate = overrideSpeed ?? speed;
    utterance.onend = () => {
      setSpeakingDocNumber(null);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setSpeakingDocNumber(null);
      setIsPaused(false);
    };
    setSpeakingDocNumber(target);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlayDoc = (passage: PassageItem) => {
    if (!ttsSupported) return;
    if (speakingDocNumber === passage.docNumber) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }
    speakText(stripTagsToPlainText(passage.englishTaggedText), passage.docNumber);
  };

  const handlePlayAll = () => {
    if (!ttsSupported) return;
    if (speakingDocNumber === 'all') {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }
    const combined = passages
      .map((p) => `${p.docTitle}. ${stripTagsToPlainText(p.englishTaggedText)}`)
      .join(' ... ');
    speakText(combined, 'all');
  };

  const handleSpeedChange = (newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed);
    if (!ttsSupported || speakingDocNumber === null) return;
    if (speakingDocNumber === 'all') {
      const combined = passages
        .map((p) => `${p.docTitle}. ${stripTagsToPlainText(p.englishTaggedText)}`)
        .join(' ... ');
      speakText(combined, 'all', newSpeed);
    } else {
      const found = passages.find((p) => p.docNumber === speakingDocNumber);
      if (found) {
        speakText(stripTagsToPlainText(found.englishTaggedText), found.docNumber, newSpeed);
      }
    }
  };

  const speakSingleWord = (word: string) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingDocNumber(null);
    setIsPaused(false);
    const u = new SpeechSynthesisUtterance(word);
    const voice = pickEnglishVoice();
    if (voice) u.voice = voice;
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  const toggleTranslation = (docNumber: number) => {
    setExpandedTranslations((prev) => ({
      ...prev,
      [docNumber]: !prev[docNumber],
    }));
  };

  const buildTooltipPayload = (
    el: HTMLElement,
    tokenKey: string,
    surface: string,
    explicitBase?: string
  ): TooltipData => {
    const rect = el.getBoundingClientRect();
    const info = lookupWord(surface, explicitBase);
    return {
      ...info,
      tokenKey,
      anchorRect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
      },
    };
  };

  const handleWordHover = (
    el: HTMLElement,
    tokenKey: string,
    surface: string,
    explicitBase?: string
  ) => {
    if (hoverClearTimerRef.current) {
      window.clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = null;
    }
    if (pinnedTooltip) return;
    setHoveredTooltip(buildTooltipPayload(el, tokenKey, surface, explicitBase));
  };

  const handleWordHoverLeave = () => {
    if (pinnedTooltip) return;
    hoverClearTimerRef.current = window.setTimeout(() => {
      setHoveredTooltip(null);
    }, 80);
  };

  const handleWordClick = (
    el: HTMLElement,
    tokenKey: string,
    surface: string,
    explicitBase?: string
  ) => {
    if (pinnedTooltip?.tokenKey === tokenKey) {
      setPinnedTooltip(null);
      return;
    }
    const payload = buildTooltipPayload(el, tokenKey, surface, explicitBase);
    setPinnedTooltip(payload);
    setHoveredTooltip(null);
  };

  const activeTooltip = pinnedTooltip ?? hoveredTooltip;

  // Compute safe fixed viewport position for the floating tooltip
  const getTooltipStyle = (tooltip: TooltipData): React.CSSProperties => {
    const tooltipWidth = 264;
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const centerX = tooltip.anchorRect.left + tooltip.anchorRect.width / 2;
    const clampedLeft = Math.max(
      12,
      Math.min(centerX - tooltipWidth / 2, viewportW - tooltipWidth - 12)
    );

    const showAbove = tooltip.anchorRect.top > 170;
    if (showAbove) {
      return {
        position: 'fixed',
        left: `${clampedLeft}px`,
        bottom: `${(typeof window !== 'undefined' ? window.innerHeight : 768) - tooltip.anchorRect.top + 8}px`,
        width: `${tooltipWidth}px`,
      };
    }

    return {
      position: 'fixed',
      left: `${clampedLeft}px`,
      top: `${tooltip.anchorRect.bottom + 8}px`,
      width: `${tooltipWidth}px`,
    };
  };

  const renderPlainSegmentTokens = (segment: string, docNumber: number, pIdx: number, sIdx: number) => {
    const parts = segment.split(/([a-zA-Z]+(?:'[a-zA-Z]+)?)/g);
    return parts.map((part, wIdx) => {
      if (!part) return null;
      if (!/^[a-zA-Z]+(?:'[a-zA-Z]+)?$/.test(part)) {
        return <span key={`${sIdx}-${wIdx}`}>{part}</span>;
      }

      const tokenKey = `plain-${docNumber}-${pIdx}-${sIdx}-${wIdx}`;
      const isHighlighted = activeTooltip?.tokenKey === tokenKey;

      return (
        <span
          key={`${sIdx}-${wIdx}`}
          data-vocab-token="true"
          role="button"
          tabIndex={0}
          onMouseEnter={(e) => handleWordHover(e.currentTarget, tokenKey, part)}
          onMouseLeave={handleWordHoverLeave}
          onFocus={(e) => handleWordHover(e.currentTarget, tokenKey, part)}
          onBlur={handleWordHoverLeave}
          onClick={(e) => handleWordClick(e.currentTarget, tokenKey, part)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleWordClick(e.currentTarget, tokenKey, part);
            }
          }}
          className={`inline cursor-pointer rounded-[3px] px-[1px] transition-colors duration-75 underline-offset-4 ${
            isHighlighted
              ? 'bg-sky-500/20 dark:bg-slate-700 underline decoration-amber-500 dark:decoration-amber-400'
              : 'hover:bg-sky-500/15 dark:hover:bg-slate-700/75 hover:underline hover:decoration-amber-500/80 dark:hover:decoration-amber-400/80'
          }`}
        >
          {part}
        </span>
      );
    });
  };

  const renderTaggedParagraphs = (passage: PassageItem) => {
    const paragraphs = passage.englishTaggedText
      .split(/\n{2,}|\n/)
      .filter((p) => p.trim().length > 0);

    return paragraphs.map((para, pIdx) => {
      const segments = para.split(/(\[\[[^\]]+\]\])/g);
      return (
        <p
          key={pIdx}
          className="font-passage text-[17px] sm:text-[18px] leading-[1.9] text-slate-800 dark:text-slate-100"
        >
          {segments.map((seg, sIdx) => {
            const match = seg.match(/^\[\[([^|\]]+)\|([^\]]+)\]\]$/);
            if (!match) {
              return (
                <span key={sIdx}>
                  {renderPlainSegmentTokens(seg, passage.docNumber, pIdx, sIdx)}
                </span>
              );
            }

            const surface = match[1];
            const baseWord = match[2];
            const tokenKey = `target-${passage.docNumber}-${pIdx}-${sIdx}`;
            const isSelected = activeTooltip?.tokenKey === tokenKey;
            const isRevealed = revealedTokens.has(tokenKey);

            // Active Recall Mode: hidden dashed blank box
            if (isBlankMode && !isRevealed) {
              return (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => {
                    setHoveredTooltip(null);
                    setPinnedTooltip(null);
                    setRevealedTokens((prev) => {
                      const next = new Set(prev);
                      next.add(tokenKey);
                      return next;
                    });
                  }}
                  title="클릭하여 원래 단어 열기"
                  aria-label="빈칸 단어 열기"
                  className="inline-flex items-center justify-center mx-0.5 px-2 py-0.5 rounded-sm border border-dashed border-amber-500/85 dark:border-amber-400/85 bg-amber-500/10 dark:bg-amber-400/12 text-amber-700 dark:text-amber-300 font-mono-tabular text-[13px] sm:text-sm font-medium hover:bg-amber-500/20 dark:hover:bg-amber-400/20 transition-colors cursor-pointer align-baseline"
                >
                  [ ______ ]
                </button>
              );
            }

            // Active Recall Mode: revealed word (click again to re-hide, hover allowed)
            if (isBlankMode && isRevealed) {
              return (
                <button
                  key={sIdx}
                  type="button"
                  data-vocab-token="true"
                  onMouseEnter={(e) => handleWordHover(e.currentTarget, tokenKey, surface, baseWord)}
                  onMouseLeave={handleWordHoverLeave}
                  onFocus={(e) => handleWordHover(e.currentTarget, tokenKey, surface, baseWord)}
                  onBlur={handleWordHoverLeave}
                  onClick={() => {
                    if (hoveredTooltip?.tokenKey === tokenKey) setHoveredTooltip(null);
                    if (pinnedTooltip?.tokenKey === tokenKey) setPinnedTooltip(null);
                    setRevealedTokens((prev) => {
                      const next = new Set(prev);
                      next.delete(tokenKey);
                      return next;
                    });
                  }}
                  title="클릭하여 다시 빈칸으로 가리기"
                  className="inline font-bold px-1.5 py-0.2 rounded-sm border border-emerald-500/50 dark:border-emerald-400/50 bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                >
                  {surface}
                </button>
              );
            }

            return (
              <button
                key={sIdx}
                type="button"
                data-vocab-token="true"
                onMouseEnter={(e) => handleWordHover(e.currentTarget, tokenKey, surface, baseWord)}
                onMouseLeave={handleWordHoverLeave}
                onFocus={(e) => handleWordHover(e.currentTarget, tokenKey, surface, baseWord)}
                onBlur={handleWordHoverLeave}
                onClick={(e) => handleWordClick(e.currentTarget, tokenKey, surface, baseWord)}
                className={`inline font-bold px-1 py-0.2 rounded-sm transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500 dark:ring-amber-300'
                    : 'bg-amber-300/95 dark:bg-amber-300 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {surface}
              </button>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div className="space-y-5">
      {/* Global TTS Audio & Active Recall Reading Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {ttsSupported ? (
              <>
                <button
                  type="button"
                  onClick={handlePlayAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  {speakingDocNumber === 'all' && !isPaused ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      전체 일시정지
                    </>
                  ) : speakingDocNumber === 'all' && isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      이어 듣기
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      원어민 전체 듣기
                    </>
                  )}
                </button>

                {speakingDocNumber !== null && (
                  <button
                    type="button"
                    onClick={stopSpeech}
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Square className="w-3 h-3" />
                    정지
                  </button>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                현재 브라우저에서 음성 합성을 지원하지 않습니다.
              </span>
            )}

            {/* Active Recall Mode Toggle Switch */}
            <div
              role="group"
              aria-label="빈칸 독해 모드 전환"
              className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800"
            >
              <button
                type="button"
                onClick={() => {
                  setIsBlankMode(false);
                  setRevealedTokens(new Set());
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  !isBlankMode
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                하이라이트 보기
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBlankMode(true);
                  setRevealedTokens(new Set());
                  setHoveredTooltip(null);
                  setPinnedTooltip(null);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isBlankMode
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                빈칸으로 가리기
              </button>
            </div>

            {isBlankMode && allTargetTokenKeys.length > 0 && (
              <div className="flex items-center gap-2">
                {revealedTokens.size < allTargetTokenKeys.length ? (
                  <button
                    type="button"
                    onClick={() => setRevealedTokens(new Set(allTargetTokenKeys))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    전체 정답 열기
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRevealedTokens(new Set());
                      setHoveredTooltip(null);
                      setPinnedTooltip(null);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    전체 다시 가리기
                  </button>
                )}
                <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  열린 빈칸 {revealedTokens.size}/{allTargetTokenKeys.length}
                </span>
              </div>
            )}
          </div>

          {ttsSupported && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 whitespace-nowrap">
                재생 배속
              </span>
              {([0.8, 1.0, 1.2] as PlaybackSpeed[]).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono-tabular font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    speed === rate
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {rate.toFixed(1)}x
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {isBlankMode
            ? '빈칸 독해 모드: [ ______ ] 빈칸을 클릭하면 단어가 열리고, 열린 단어를 다시 클릭하면 가려집니다.'
            : '지문의 모든 단어에 마우스를 올리면 뜻을 바로 볼 수 있습니다.'}
        </div>
      </div>

      {/* Passage Cards */}
      {passages.map((passage) => {
        const isTriple = passages.length > 1;
        const isSpeakingThis = speakingDocNumber === passage.docNumber;
        const isTranslated = Boolean(expandedTranslations[passage.docNumber]);
        const approxWords = countEnglishWords(passage.englishTaggedText);

        return (
          <article
            key={passage.docNumber}
            className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Passage Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-7 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {isTriple && (
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      [문서 {passage.docNumber}]
                    </span>
                  )}
                  <span>{passage.docTypeLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{approxWords}단어</span>
                </div>
                <h3 className="mt-1 text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {passage.docTitle}
                </h3>
              </div>

              {ttsSupported && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePlayDoc(passage)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                      isSpeakingThis
                        ? 'border-amber-500 dark:border-amber-400 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSpeakingThis && !isPaused ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        일시정지
                      </>
                    ) : isSpeakingThis && isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        계속 듣기
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        음성 듣기
                      </>
                    )}
                  </button>
                  {isSpeakingThis && (
                    <button
                      type="button"
                      onClick={stopSpeech}
                      aria-label="읽기 정지"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* English Passage Body */}
            <div className="px-5 sm:px-7 py-6 space-y-4 max-w-[74ch]">
              {renderTaggedParagraphs(passage)}
            </div>

            {/* Korean Translation Accordion */}
            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0E1625]">
              <button
                type="button"
                onClick={() => toggleTranslation(passage.docNumber)}
                aria-expanded={isTranslated}
                className="w-full flex items-center justify-between px-5 sm:px-7 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <span>
                  {isTranslated
                    ? isTriple
                      ? `[문서 ${passage.docNumber}] 한국어 해석 숨기기`
                      : '한국어 해석 숨기기'
                    : isTriple
                      ? `[문서 ${passage.docNumber}] 한국어 해석 보기`
                      : '한국어 해석 보기'}
                </span>
                {isTranslated ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {isTranslated && (
                <div className="px-5 sm:px-7 pb-5 pt-1 text-sm sm:text-[15px] leading-[1.8] text-slate-700 dark:text-slate-300 whitespace-pre-line border-t border-slate-200/70 dark:border-slate-800/70">
                  {passage.koreanTranslation}
                </div>
              )}
            </div>
          </article>
        );
      })}

      {/* Single Viewport-Clamped Instant Hover/Click Dictionary Tooltip */}
      {activeTooltip && (
        <div
          ref={tooltipRef}
          role="dialog"
          aria-label={`${activeTooltip.surface} 단어 사전 툴팁`}
          style={getTooltipStyle(activeTooltip)}
          onMouseEnter={() => {
            if (hoverClearTimerRef.current) {
              window.clearTimeout(hoverClearTimerRef.current);
              hoverClearTimerRef.current = null;
            }
          }}
          onMouseLeave={handleWordHoverLeave}
          className={`z-50 rounded-xl border bg-slate-900 dark:bg-[#0A101E] text-slate-50 border-slate-700 dark:border-slate-600/90 p-3.5 shadow-2xl shadow-slate-950/60 font-sans ${
            pinnedTooltip ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">
                  {activeTooltip.baseWord ?? activeTooltip.surface}
                </span>
                <span className="text-xs font-mono-tabular font-semibold text-amber-400">
                  {activeTooltip.partOfSpeech}
                </span>
                {activeTooltip.isTarget && (
                  <span className="text-[11px] font-medium text-amber-300">
                    · 목표 어휘
                  </span>
                )}
              </div>
              {activeTooltip.baseWord &&
                activeTooltip.surface.toLowerCase() !== activeTooltip.baseWord.toLowerCase() && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    지문 형태: <span className="text-slate-200 font-medium">{activeTooltip.surface}</span>
                  </div>
                )}
            </div>

            {pinnedTooltip && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => speakSingleWord(activeTooltip.surface)}
                  aria-label="단어 발음 듣기"
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPinnedTooltip(null)}
                  aria-label="툴팁 닫기"
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 text-xs leading-relaxed">
            {activeTooltip.coreMeaning &&
              activeTooltip.coreMeaning !== activeTooltip.contextMeaning && (
                <div>
                  <span className="text-slate-400">기본 뜻: </span>
                  <span className="text-slate-200">{activeTooltip.coreMeaning}</span>
                </div>
              )}
            <div>
              <span className="text-slate-400">문맥 뜻: </span>
              <span className="font-medium text-white">{activeTooltip.contextMeaning}</span>
            </div>
          </div>

          {!pinnedTooltip && (
            <div className="mt-2 text-[11px] text-slate-400">
              클릭 시 고정 및 발음 듣기 가능
            </div>
          )}
        </div>
      )}
    </div>
  );
}
