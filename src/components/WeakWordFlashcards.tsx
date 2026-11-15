import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Flame,
  RotateCw,
  Volume2,
  XCircle,
} from 'lucide-react';
import type { StudySession, VocabularyEntry, WordMasteryRecord } from '../types/study';
import { TOEIC_VOCAB_LIST } from '../data/toeicVocab';
import { COMMON_ENGLISH_DICT } from '../utils/commonDictionary';
import { getCalendarDaysAgo } from '../utils/storage';

interface WeakWordFlashcardsProps {
  sessions: StudySession[];
  masteryMap: Record<string, WordMasteryRecord>;
  onMarkConfused: (word: string) => void;
  onMarkMasteredStep: (word: string) => { graduated: boolean; newStreak: number };
  onUnmasterWord: (word: string) => void;
  onGoToStudy: () => void;
}

interface FlashcardItem {
  key: string;
  word: string;
  partOfSpeech: string;
  pronunciationStressKo: string;
  exampleSentence: string;
  coreMeaning: string;
  contextMeaning: string;
  collocations: string[];
  synonymNuance: string;
  lcParaphrases: string[];
  streak: number;
  occurrenceCount: number;
}

function renderStressedKorean(pron: string) {
  const parts = pron.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong
          key={idx}
          className="font-bold text-amber-600 dark:text-amber-300 underline decoration-amber-500/60 underline-offset-2"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractExampleSentence(word: string, sessions: StudySession[]): string {
  const lowerWord = word.trim().toLowerCase();
  const tagRegex = new RegExp(`\\[\\[([^|\\]]+)\\|${escapeRegExp(lowerWord)}\\]\\]`, 'i');
  const wordRegex = new RegExp(`\\b${escapeRegExp(lowerWord)}[a-zA-Z]{0,4}\\b`, 'i');

  for (const s of sessions) {
    for (const p of s.result.passages) {
      const plain = p.englishTaggedText.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$1');
      const sentences = plain
        .split(/(?<=[.!?])\s+/)
        .map((st) => st.trim())
        .filter((st) => st.length >= 16 && st.length <= 240);

      // Prefer tagged sentence match
      const taggedSentences = p.englishTaggedText.split(/(?<=[.!?])\s+/);
      for (const ts of taggedSentences) {
        if (tagRegex.test(ts)) {
          const clean = ts.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$1').trim();
          if (clean.length >= 12) return clean;
        }
      }

      for (const st of sentences) {
        if (wordRegex.test(st)) return st;
      }
    }

    for (const q of s.result.quizzes) {
      if (q.targetWord?.trim().toLowerCase() === lowerWord && q.questionSentence) {
        return q.questionSentence;
      }
    }
  }

  return `Please review "${word}" carefully in business and TOEIC contexts.`;
}

function highlightTargetInSentence(sentence: string, word: string) {
  const stem = word.length >= 5 ? word.slice(0, word.length - 1) : word;
  const regex = new RegExp(`(\\b(?:${escapeRegExp(word)}|${escapeRegExp(stem)}[a-zA-Z]{0,5})\\b)`, 'gi');
  const parts = sentence.split(regex);
  return parts.map((part, idx) => {
    if (regex.test(part)) {
      regex.lastIndex = 0;
      return (
        <span
          key={idx}
          className="font-bold text-amber-700 dark:text-amber-300 underline decoration-amber-500/70 underline-offset-4"
        >
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function WeakWordFlashcards({
  sessions,
  masteryMap,
  onMarkConfused,
  onMarkMasteredStep,
  onUnmasterWord,
  onGoToStudy,
}: WeakWordFlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [showMasteredList, setShowMasteredList] = useState(false);

  const builtInVocabMap = useMemo(() => {
    const map = new Map<string, { partOfSpeech: string; meaning: string }>();
    for (const item of TOEIC_VOCAB_LIST) {
      map.set(item.word.toLowerCase(), {
        partOfSpeech: item.partOfSpeech,
        meaning: item.meaning,
      });
    }
    return map;
  }, []);

  const activeCards = useMemo<FlashcardItem[]>(() => {
    const aggregated = new Map<
      string,
      { word: string; count: number; vocab?: VocabularyEntry }
    >();

    for (const s of sessions) {
      const tableMap = new Map(
        (s.result.vocabulary_table ?? []).map((v) => [v.word.trim().toLowerCase(), v])
      );
      for (const rawW of s.wrongWords) {
        const clean = rawW.trim();
        const key = clean.toLowerCase();
        if (!key) continue;
        const existing = aggregated.get(key);
        const foundVocab = tableMap.get(key);
        if (!existing) {
          aggregated.set(key, {
            word: foundVocab?.word ?? clean,
            count: 1,
            vocab: foundVocab,
          });
        } else {
          existing.count += 1;
          if (!existing.vocab && foundVocab) {
            existing.vocab = foundVocab;
          }
        }
      }
    }

    const cards: FlashcardItem[] = [];
    for (const [key, item] of aggregated.entries()) {
      const mastery = masteryMap[key];
      if (mastery?.mastered) continue;

      const builtIn = builtInVocabMap.get(key);
      const common = COMMON_ENGLISH_DICT[key];
      const v = item.vocab;

      cards.push({
        key,
        word: item.word,
        partOfSpeech: v?.partOfSpeech && v.partOfSpeech !== '-' ? v.partOfSpeech : builtIn?.partOfSpeech ?? common?.partOfSpeech ?? '-',
        pronunciationStressKo: v?.pronunciationStressKo && v.pronunciationStressKo !== '-' ? v.pronunciationStressKo : '',
        exampleSentence: extractExampleSentence(item.word, sessions),
        coreMeaning: v?.coreMeaning && v.coreMeaning !== '사전 뜻 참고' ? v.coreMeaning : builtIn?.meaning ?? common?.meaning ?? '사전 뜻 참고',
        contextMeaning: v?.contextMeaning && v.contextMeaning !== '지문 문맥 참고' ? v.contextMeaning : '',
        collocations: v?.collocations ?? [],
        synonymNuance: v?.synonymNuance && v.synonymNuance !== '-' ? v.synonymNuance : '',
        lcParaphrases: v?.lcParaphrases ?? [],
        streak: mastery?.streak ?? 0,
        occurrenceCount: item.count,
      });
    }

    // Sort highest occurrence / lowest streak first for smart cramming
    cards.sort((a, b) => {
      if (b.occurrenceCount !== a.occurrenceCount) {
        return b.occurrenceCount - a.occurrenceCount;
      }
      return a.streak - b.streak;
    });

    return cards;
  }, [sessions, masteryMap, builtInVocabMap]);

  const masteredRecords = useMemo(() => {
    return Object.values(masteryMap)
      .filter((r) => r.mastered)
      .sort((a, b) => {
        const ta = a.masteredAt ? new Date(a.masteredAt).getTime() : 0;
        const tb = b.masteredAt ? new Date(b.masteredAt).getTime() : 0;
        return tb - ta;
      });
  }, [masteryMap]);

  const todayMasteredCount = useMemo(
    () =>
      masteredRecords.filter(
        (r) => r.masteredAt && getCalendarDaysAgo(r.masteredAt) === 0
      ).length,
    [masteredRecords]
  );

  const todayTotalPool = activeCards.length + todayMasteredCount;
  const todayGraduationRate =
    todayTotalPool > 0 ? Math.round((todayMasteredCount / todayTotalPool) * 100) : 0;

  useEffect(() => {
    if (activeCards.length === 0) {
      setCurrentIndex(0);
      setIsFlipped(false);
    } else if (currentIndex >= activeCards.length) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [activeCards.length, currentIndex]);

  const currentCard = activeCards[currentIndex] ?? null;

  const speakWord = useCallback((word: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  }, []);

  const handleConfused = useCallback(() => {
    if (!currentCard) return;
    onMarkConfused(currentCard.word);
    setLastFeedback(`"${currentCard.word}" 연속 암기 카운트가 0/3으로 초기화되었습니다.`);
    setIsFlipped(false);
    if (activeCards.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % activeCards.length);
    }
  }, [currentCard, onMarkConfused, activeCards.length]);

  const handleMasterStep = useCallback(() => {
    if (!currentCard) return;
    const { graduated, newStreak } = onMarkMasteredStep(currentCard.word);
    if (graduated) {
      setLastFeedback(
        `"${currentCard.word}" 3회 연속 완벽 암기! 취약 단어 목록에서 마스터 졸업했습니다.`
      );
    } else {
      setLastFeedback(
        `"${currentCard.word}" 완벽 암기 (${newStreak}/3회) · ${3 - newStreak}회 더 맞히면 졸업!`
      );
      if (activeCards.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % activeCards.length);
      }
    }
    setIsFlipped(false);
  }, [currentCard, onMarkMasteredStep, activeCards.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!currentCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleConfused();
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleMasterStep();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentCard, handleConfused, handleMasterStep]);

  return (
    <div className="space-y-6">
      {/* Top Graduation Gauge & Summary */}
      <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                취약 단어 벼락치기 플래시카드
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                API 호출 없이 누적된 오답·별표 단어를 즉시 복습하고, 3회 연속 완벽 암기 시 졸업 처리됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-tabular shrink-0">
            <span className="text-slate-600 dark:text-slate-300">
              남은 취약 단어:{' '}
              <strong className="text-amber-600 dark:text-amber-400">
                {activeCards.length}개
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              누적 졸업:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {masteredRecords.length}개
              </strong>
            </span>
          </div>
        </div>

        {/* Today's Graduation Rate Progress Gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              오늘의 암기 졸업률
            </span>
            <span className="font-mono-tabular font-bold text-emerald-600 dark:text-emerald-400">
              {todayGraduationRate}% ({todayMasteredCount} / {todayTotalPool}단어 졸업)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
              style={{ width: `${todayGraduationRate}%` }}
            />
          </div>
        </div>

        {lastFeedback && (
          <div className="rounded-lg border border-amber-300/70 dark:border-amber-500/35 bg-amber-50/70 dark:bg-amber-500/10 px-4 py-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
            {lastFeedback}
          </div>
        )}
      </section>

      {/* Flashcard Stage */}
      {currentCard ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-mono-tabular font-semibold">
              카드 {currentIndex + 1} / {activeCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span>연속 완벽 암기:</span>
              <div className="inline-flex items-center gap-1 font-mono-tabular font-bold text-amber-600 dark:text-amber-400">
                {[0, 1, 2].map((step) => (
                  <span
                    key={step}
                    className={`inline-block w-2.5 h-2.5 rounded-full border ${
                      step < currentCard.streak
                        ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                ))}
                <span className="ml-1">{currentCard.streak}/3</span>
              </div>
            </div>
          </div>

          {/* Clickable Flip Flashcard */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setIsFlipped((f) => !f);
              }
            }}
            aria-label={isFlipped ? '카드 앞면 보기' : '카드 뒷면 뜻 보기'}
            className="rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-700/90 p-6 sm:p-9 min-h-[340px] flex flex-col justify-between cursor-pointer select-none hover:border-amber-500/60 dark:hover:border-amber-400/60 transition-colors shadow-sm"
          >
            {!isFlipped ? (
              /* FRONT FACE */
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    FRONT · 앞면 (뜻 가림)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentCard.word);
                    }}
                    aria-label={`${currentCard.word} 원어민 발음 듣기`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-200 hover:border-amber-500/60 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                    발음 듣기
                  </button>
                </div>

                <div className="my-6 text-center space-y-3">
                  <div className="flex items-baseline justify-center gap-2.5 flex-wrap">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {currentCard.word}
                    </h2>
                    {currentCard.partOfSpeech !== '-' && (
                      <span className="text-sm font-mono-tabular text-slate-500 dark:text-slate-400">
                        {currentCard.partOfSpeech}
                      </span>
                    )}
                  </div>

                  {currentCard.pronunciationStressKo && (
                    <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                      [{renderStressedKorean(currentCard.pronunciationStressKo)}]
                    </div>
                  )}

                  <div className="pt-4 max-w-2xl mx-auto">
                    <p className="font-passage text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-xl px-5 py-4">
                      {highlightTargetInSentence(
                        currentCard.exampleSentence,
                        currentCard.word
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>카드를 클릭하거나 Space 키를 누르면 뒷면(뜻·콜로케이션·유의어)이 열립니다</span>
                </div>
              </>
            ) : (
              /* BACK FACE */
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    BACK · 뒷면 ({currentCard.word})
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentCard.word);
                    }}
                    aria-label={`${currentCard.word} 원어민 발음 듣기`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-200 hover:border-amber-500/60 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                    발음 듣기
                  </button>
                </div>

                <div className="my-5 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
                      핵심 한국어 뜻
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {currentCard.coreMeaning}
                    </div>
                    {currentCard.contextMeaning &&
                      currentCard.contextMeaning !== currentCard.coreMeaning && (
                        <div className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          지문 문맥 의미: {currentCard.contextMeaning}
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-3.5">
                      <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-1.5">
                        토익 콜로케이션 (짝꿍)
                      </div>
                      {currentCard.collocations.length > 0 ? (
                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200">
                          {currentCard.collocations.map((c, i) => (
                            <li key={i}>· {c}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs text-slate-400">저장된 콜로케이션 없음</div>
                      )}
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-3.5">
                      <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
                        유의어 뉘앙스 차이
                      </div>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                        {currentCard.synonymNuance || '저장된 유의어 비교 없음'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-3.5">
                      <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
                        토익 LC 패러프레이징
                      </div>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                        {currentCard.lcParaphrases.length > 0
                          ? currentCard.lcParaphrases.join(' · ')
                          : '저장된 패러프레이징 없음'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>클릭 또는 Space 키로 앞면 보기 · 아래 버튼(단축키 1 / 2)으로 암기 체크</span>
                </div>
              </>
            )}
          </div>

          {/* Mastery Control Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleConfused}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border border-rose-300 dark:border-rose-500/40 bg-rose-50/80 dark:bg-rose-500/10 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              <span>아직 헷갈림 (초기화)</span>
              <span className="ml-1 text-[11px] font-mono-tabular opacity-70">[1 / ←]</span>
            </button>

            <button
              type="button"
              onClick={handleMasterStep}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>완벽 암기 (+1회)</span>
              <span className="ml-1 text-[11px] font-mono-tabular opacity-85">[2 / →]</span>
            </button>
          </div>

          {/* Card Navigation */}
          {activeCards.length > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(
                    (prev) => (prev - 1 + activeCards.length) % activeCards.length
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                이전 카드
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((prev) => (prev + 1) % activeCards.length);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                다음 카드
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-dashed border-slate-300 dark:border-slate-700 px-6 py-12 text-center space-y-3">
          <Award className="w-10 h-10 mx-auto text-emerald-500" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
            {masteredRecords.length > 0
              ? '모든 취약 단어를 마스터 졸업했습니다!'
              : '복습할 취약/오답 단어가 아직 없습니다'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            퀴즈나 실전 모의고사에서 틀린 단어 또는 핵심 단어 요약표에서 ⭐ 별표 체크한 단어들이 이곳에 자동으로 모입니다.
          </p>
          <button
            type="button"
            onClick={onGoToStudy}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
          >
            스토리 학습으로 돌아가기
          </button>
        </section>
      )}

      {/* Graduated (Mastered) Words Archive */}
      {masteredRecords.length > 0 && (
        <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowMasteredList((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
          >
            <span>졸업 완료 단어 아카이브 ({masteredRecords.length}개)</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {showMasteredList ? '접기' : '펼쳐보기'}
            </span>
          </button>

          {showMasteredList && (
            <div className="px-5 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
              {masteredRecords.map((rec) => (
                <div
                  key={rec.word}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-200"
                >
                  <span className="font-semibold">{rec.word}</span>
                  <button
                    type="button"
                    onClick={() => onUnmasterWord(rec.word)}
                    className="text-[11px] text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300 underline cursor-pointer"
                  >
                    복습 재추가
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
