import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CornerDownLeft,
  Eraser,
  FileText,
  History,
  Link2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  LENGTH_MODES,
  PASSAGE_STYLES,
  type LengthMode,
  type PassageStyleId,
  type StudySession,
} from '../types/study';
import {
  TOEIC_VOCAB_LIST,
  type AutocompleteVocabEntry,
} from '../data/toeicVocab';
import {
  formatKoreanDateGroup,
  getSessionEpisodeNumber,
} from '../utils/storage';
import {
  parseVocabularyInput,
  SAMPLE_LONG_WORDS,
  SAMPLE_SHORT_WORDS,
} from '../utils/wordParser';

interface WordInputPanelProps {
  rawInput: string;
  onRawInputChange: (val: string) => void;
  historyEntries: AutocompleteVocabEntry[];
  recentWrongWords?: string[];
  selectedStyle: PassageStyleId;
  onStyleChange: (style: PassageStyleId) => void;
  selectedLength: LengthMode;
  onLengthChange: (mode: LengthMode) => void;
  sessions: StudySession[];
  isContinuationEnabled: boolean;
  onContinuationToggle: (enabled: boolean) => void;
  continuationSourceId: string | null;
  onContinuationSourceChange: (id: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  progressStep: string;
  errorMessage: string | null;
}

interface ActivePrefix {
  query: string;
  start: number;
  end: number;
}

function getActivePrefixAtCaret(value: string, caretPos: number): ActivePrefix | null {
  const before = value.slice(0, caretPos);
  const after = value.slice(caretPos);

  // Only trigger when caret is at the end of a word (followed by EOF or separator/punctuation)
  if (!/^(?:$|[\s,;\n\r\t])/.test(after)) {
    return null;
  }

  const match = before.match(/(?:^|[\s,;\n\r\t])([a-zA-Z]{2,})$/);
  if (!match || !match[1]) return null;

  const query = match[1];
  const start = caretPos - query.length;
  return { query, start, end: caretPos };
}

export function WordInputPanel({
  rawInput,
  onRawInputChange,
  historyEntries,
  recentWrongWords = [],
  selectedStyle,
  onStyleChange,
  selectedLength,
  onLengthChange,
  sessions,
  isContinuationEnabled,
  onContinuationToggle,
  continuationSourceId,
  onContinuationSourceChange,
  onGenerate,
  isGenerating,
  progressStep,
  errorMessage,
}: WordInputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [caretPos, setCaretPos] = useState<number>(0);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const { words, duplicateCount } = parseVocabularyInput(rawInput);
  const wordCount = words.length;
  const recommendedMode: LengthMode = wordCount >= 24 ? 'long_triple' : 'short';

  const selectedSourceSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions.find((s) => s.id === continuationSourceId) ?? sessions[0];
  }, [sessions, continuationSourceId]);

  const nextEpisodeNumber = selectedSourceSession
    ? getSessionEpisodeNumber(selectedSourceSession) + 1
    : 2;

  // Merge built-in TOEIC vocabulary (~4,200+ words) + user localStorage history
  const mergedDictionary = useMemo(() => {
    const map = new Map<string, AutocompleteVocabEntry>();
    for (const item of TOEIC_VOCAB_LIST) {
      map.set(item.word.toLowerCase(), item);
    }
    for (const hist of historyEntries) {
      const key = hist.word.trim().toLowerCase();
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          word: existing.word,
          partOfSpeech:
            hist.partOfSpeech && hist.partOfSpeech !== '-'
              ? hist.partOfSpeech
              : existing.partOfSpeech,
          meaning:
            hist.meaning && hist.meaning !== '이전 입력 단어'
              ? hist.meaning
              : existing.meaning,
          fromHistory: true,
        });
      } else {
        map.set(key, {
          word: hist.word,
          partOfSpeech: hist.partOfSpeech || '-',
          meaning: hist.meaning || '이전 입력 단어',
          fromHistory: true,
        });
      }
    }
    return Array.from(map.values());
  }, [historyEntries]);

  const activePrefix = useMemo(() => {
    if (!isFocused || isGenerating) return null;
    return getActivePrefixAtCaret(rawInput, caretPos);
  }, [rawInput, caretPos, isFocused, isGenerating]);

  const prefixDismissKey = activePrefix
    ? `${activePrefix.start}:${activePrefix.query.toLowerCase()}`
    : null;

  // Exclude words already present in input outside the active token
  const alreadyEnteredOutsideToken = useMemo(() => {
    if (!activePrefix) return new Set<string>();
    const outsideText =
      rawInput.slice(0, activePrefix.start) + ' ' + rawInput.slice(activePrefix.end);
    const parsed = parseVocabularyInput(outsideText);
    return new Set(parsed.words.map((w) => w.toLowerCase()));
  }, [rawInput, activePrefix]);

  const suggestions = useMemo(() => {
    if (!activePrefix || dismissedKey === prefixDismissKey) return [];
    const q = activePrefix.query.toLowerCase();

    const matches: AutocompleteVocabEntry[] = [];
    for (const entry of mergedDictionary) {
      const lower = entry.word.toLowerCase();
      if (lower.startsWith(q) && !alreadyEnteredOutsideToken.has(lower)) {
        matches.push(entry);
      }
    }

    matches.sort((a, b) => {
      const aLower = a.word.toLowerCase();
      const bLower = b.word.toLowerCase();
      // Exact match first
      if (aLower === q && bLower !== q) return -1;
      if (bLower === q && aLower !== q) return 1;
      // History words next
      if (a.fromHistory && !b.fromHistory) return -1;
      if (!a.fromHistory && b.fromHistory) return 1;
      // Shorter/more common prefix matches, then alphabetical
      if (a.word.length !== b.word.length) return a.word.length - b.word.length;
      return aLower.localeCompare(bLower);
    });

    return matches.slice(0, 7);
  }, [activePrefix, dismissedKey, prefixDismissKey, mergedDictionary, alreadyEnteredOutsideToken]);

  const isDropdownOpen = suggestions.length > 0;

  // Reset highlighted row when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [prefixDismissKey]);

  const applySuggestion = (entry: AutocompleteVocabEntry) => {
    if (!activePrefix) return;

    const before = rawInput.slice(0, activePrefix.start);
    const after = rawInput.slice(activePrefix.end);

    // Avoid duplicating a comma if one immediately follows the caret
    const trimmedAfter = after.replace(/^\s*,\s*/, '');
    const insertion = `${entry.word}, `;
    const nextValue = before + insertion + trimmedAfter;
    const nextCaret = before.length + insertion.length;

    onRawInputChange(nextValue);
    setCaretPos(nextCaret);
    setDismissedKey(null);
    setActiveIndex(0);

    window.requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const syncCaretFromTarget = (el: HTMLTextAreaElement) => {
    setCaretPos(el.selectionStart ?? el.value.length);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isDropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      const chosen = suggestions[activeIndex] ?? suggestions[0];
      if (chosen) {
        e.preventDefault();
        applySuggestion(chosen);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setDismissedKey(prefixDismissKey);
    }
  };

  const handleLoadSample = (type: 'short' | 'long') => {
    const sample = type === 'long' ? SAMPLE_LONG_WORDS : SAMPLE_SHORT_WORDS;
    onRawInputChange(sample.join(', '));
    onLengthChange(type === 'long' ? 'long_triple' : 'short');
    setDismissedKey(null);
  };

  return (
    <section
      id="input-section"
      className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
            오늘 암기한 영단어 스토리 복습
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            단어들을 입력하면 모든 단어가 빠짐없이 포함된 맞춤형 영어 지문, 해석, 단어표, 토익 RC 퀴즈를 한 번에 만들어 드립니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => handleLoadSample('short')}
            disabled={isGenerating}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            단편 예시 (18단어)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('long')}
            disabled={isGenerating}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            장편 예시 (36단어)
          </button>
          {recentWrongWords.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onRawInputChange(recentWrongWords.join(', '));
                onStyleChange('web_novel');
                onLengthChange(recentWrongWords.length >= 24 ? 'long_triple' : 'short');
                setDismissedKey(null);
              }}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-amber-300 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              최근 7일 오답·취약 ({recentWrongWords.length})
            </button>
          )}
          {rawInput.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                onRawInputChange('');
                setCaretPos(0);
              }}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <Eraser className="w-3.5 h-3.5" />
              지우기
            </button>
          )}
        </div>
      </div>

      {/* Vocabulary Input Textarea + Local Autocomplete Dropdown */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="vocab-input"
            className="text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            영단어 목록 입력
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>
              입력된 단어:{' '}
              <strong className="font-mono-tabular text-sm text-amber-600 dark:text-amber-400">
                {wordCount}개
              </strong>
            </span>
            {duplicateCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                  중복 {duplicateCount}개 제외됨
                </span>
              </>
            )}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          id="vocab-input"
          rows={4}
          value={rawInput}
          onChange={(e) => {
            onRawInputChange(e.target.value);
            syncCaretFromTarget(e.currentTarget);
            setDismissedKey(null);
          }}
          onClick={(e) => syncCaretFromTarget(e.currentTarget)}
          onKeyUp={(e) => {
            if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
              syncCaretFromTarget(e.currentTarget);
            }
          }}
          onKeyDown={handleTextareaKeyDown}
          onFocus={(e) => {
            setIsFocused(true);
            syncCaretFromTarget(e.currentTarget);
          }}
          onBlur={() => {
            // Delay slightly so mousedown/click on dropdown registers cleanly
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          disabled={isGenerating}
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={isDropdownOpen}
          aria-controls="vocab-autocomplete-list"
          placeholder="예: allocate, bottleneck, consensus, streamline, mandatory, discrepancy...&#10;알파벳 2글자 이상 입력 시 내장 토익·비즈니스 단어 및 과거 학습 단어가 즉시 자동완성됩니다."
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-4 py-3 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-400/50 focus:border-amber-500 dark:focus:border-amber-400 transition-colors leading-relaxed resize-y"
        />

        {/* Local Zero-API Autocomplete Dropdown */}
        {isDropdownOpen && activePrefix && (
          <div
            ref={dropdownRef}
            id="vocab-autocomplete-list"
            role="listbox"
            aria-label="영단어 추천 목록"
            className="absolute left-0 right-0 mt-1.5 z-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1625] shadow-2xl shadow-slate-950/30 overflow-hidden"
          >
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
              {suggestions.map((entry, idx) => {
                const isActive = idx === activeIndex;
                const qLen = activePrefix.query.length;
                const matchedPart = entry.word.slice(0, qLen);
                const restPart = entry.word.slice(qLen);

                return (
                  <li key={entry.word} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applySuggestion(entry);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/12 dark:bg-amber-400/15'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-baseline gap-2.5 min-w-0">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 shrink-0">
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {matchedPart}
                          </span>
                          <span>{restPart}</span>
                        </span>
                        <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400 shrink-0">
                          {entry.partOfSpeech}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate">
                          {entry.meaning}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {entry.fromHistory && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 whitespace-nowrap">
                            <History className="w-3 h-3" />
                            이전 입력
                          </span>
                        )}
                        {isActive && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between gap-2 px-4 py-2 bg-slate-50 dark:bg-[#0A101D] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <span>↑↓ 이동 · Enter 또는 Tab 완성 (쉼표 자동 입력) · Esc 닫기</span>
              <span className="font-mono-tabular hidden sm:inline">
                로컬 어휘 {mergedDictionary.length.toLocaleString()}개 연결됨
              </span>
            </div>
          </div>
        )}

        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            쉼표(,), 공백, 줄바꿈 자동 인식 · 2글자 이상 입력 시 로컬 자동완성 지원 · 최대 80단어
          </span>
          {wordCount > 80 && (
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              한 번에 최대 80단어 이하로 입력해 주세요.
            </span>
          )}
        </div>
      </div>

      {/* Options Grid: Style Dropdown + Length Radio Buttons */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5 border-t border-slate-200 dark:border-slate-800">
        {/* Passage Style Dropdown */}
        <div className="lg:col-span-5">
          <label
            htmlFor="style-select"
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
          >
            지문 스타일 선택
          </label>
          <select
            id="style-select"
            value={selectedStyle}
            onChange={(e) => onStyleChange(e.target.value as PassageStyleId)}
            disabled={isGenerating}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-400/50 focus:border-amber-500 dark:focus:border-amber-400 transition-colors cursor-pointer"
          >
            {PASSAGE_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {PASSAGE_STYLES.find((s) => s.id === selectedStyle)?.description}
          </p>

          {/* Serialized Story Continuation Option */}
          <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80">
            <label
              htmlFor="continuation-mode-toggle"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold select-none ${
                sessions.length === 0
                  ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'text-slate-800 dark:text-slate-200 cursor-pointer'
              }`}
            >
              <input
                id="continuation-mode-toggle"
                type="checkbox"
                checked={isContinuationEnabled && sessions.length > 0}
                disabled={isGenerating || sessions.length === 0}
                onChange={(e) => onContinuationToggle(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <Link2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>이전 학습 스토리 이어쓰기(연재 모드)</span>
            </label>

            {sessions.length === 0 ? (
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                이전 학습 기록이 저장되면 지난 스토리에 이어서 다음 에피소드를 연재할 수 있습니다.
              </p>
            ) : (
              isContinuationEnabled &&
              selectedSourceSession && (
                <div className="mt-2.5 space-y-2">
                  <label htmlFor="continuation-source-select" className="sr-only">
                    이어쓸 과거 학습 스토리 선택
                  </label>
                  <select
                    id="continuation-source-select"
                    value={selectedSourceSession.id}
                    onChange={(e) => onContinuationSourceChange(e.target.value)}
                    disabled={isGenerating}
                    className="w-full rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50/50 dark:bg-[#0B1120] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-400/50 cursor-pointer"
                  >
                    {sessions.map((s) => {
                      const styleLabel =
                        PASSAGE_STYLES.find((st) => st.id === s.style)?.shortLabel ?? '';
                      const dateLabel = formatKoreanDateGroup(s.createdAt);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.result.title} ({styleLabel} · {dateLabel} · {s.inputWords.length}단어)
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    다음 회차: <strong className="font-semibold">[연재 #{nextEpisodeNumber}화]</strong> · 직전 사건과 등장인물, 과거 핵심 단어가 자연스럽게 이어집니다.
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Passage Length & Structure Radio Options */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              지문 길이 및 구성
            </span>
            {wordCount > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {wordCount}단어 기준{' '}
                {recommendedMode === 'long_triple' ? '장편(삼중 연계)' : '단편 지문'} 추천
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LENGTH_MODES.map((mode) => {
              const isSelected = selectedLength === mode.id;
              const isRecommended = wordCount > 0 && recommendedMode === mode.id;
              return (
                <label
                  key={mode.id}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 dark:border-amber-400 bg-amber-50/70 dark:bg-amber-400/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1120]/70 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="lengthMode"
                    value={mode.id}
                    checked={isSelected}
                    onChange={() => onLengthChange(mode.id)}
                    disabled={isGenerating}
                    className="mt-0.5 h-4 w-4 accent-amber-500 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {mode.title}
                      </span>
                      {isRecommended && (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          추천
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-snug">
                      {mode.subtitle}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <FileText className="w-4 h-4 shrink-0" />
          <span>
            {selectedLength === 'long_triple'
              ? '서로 연결되는 [문서 1~3] 삼중 연계 지문 및 토익 RC(Part 5·6·7) 10문항이 생성됩니다.'
              : '단일 집중 지문 및 토익 RC(Part 5·6·7) 10문항이 생성됩니다.'}
          </span>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || wordCount === 0 || wordCount > 80}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{progressStep || '복습 지문 생성 중...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>복습 지문 생성하기</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
