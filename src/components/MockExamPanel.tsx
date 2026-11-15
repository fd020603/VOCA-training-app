import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Headphones,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react';
import type {
  MockExamData,
  MockExamLcPassage,
  MockExamQuestion,
} from '../types/study';

interface MockExamPanelProps {
  sessionTitle: string;
  exam: MockExamData | undefined;
  answers: Record<number, number>;
  isSubmitted: boolean;
  isGenerating: boolean;
  errorMessage: string | null;
  onGenerateExam: () => void;
  onSelectAnswer: (questionId: number, optionIndex: number) => void;
  onSubmitExam: () => void;
  onResetExam: () => void;
  onRetryWrongWords: (words: string[]) => void;
}

type PlaybackSpeed = 0.8 | 1.0 | 1.2;

function scaleToeicSectionScore(correct: number, total: number): number {
  if (total <= 0) return 5;
  const raw = 5 + (correct / total) * 490;
  return Math.max(5, Math.min(495, Math.round(raw / 5) * 5));
}

function pickVoicesForSpeakers(): {
  male: SpeechSynthesisVoice | null;
  female: SpeechSynthesisVoice | null;
  neutral: SpeechSynthesisVoice | null;
} {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { male: null, female: null, neutral: null };
  }
  const voices = window.speechSynthesis.getVoices();
  const enVoices = voices.filter((v) => v.lang.startsWith('en'));
  if (enVoices.length === 0) return { male: null, female: null, neutral: null };

  const male =
    enVoices.find((v) => /daniel|david|mark|guy|alex|aaron|fred|ryan|male/i.test(v.name)) ||
    enVoices[0] ||
    null;
  const female =
    enVoices.find(
      (v) =>
        /samantha|victoria|zira|karen|ava|allison|jenny|aria|female|google us english/i.test(
          v.name
        ) && v.name !== male?.name
    ) ||
    enVoices.find((v) => v.name !== male?.name) ||
    enVoices[0] ||
    null;
  const neutral =
    enVoices.find((v) => v.lang === 'en-US' && /natural|google|samantha/i.test(v.name)) ||
    enVoices.find((v) => v.lang === 'en-US') ||
    enVoices[0] ||
    null;

  return { male, female, neutral };
}

function highlightExamPlaceholders(text: string) {
  const parts = text.split(/(\[\s*\d+\s*\]|\[\s*_{2,}\s*\]|_{3,}|"[^"]+")/g);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^(?:\[\s*\d+\s*\]|\[\s*_{2,}\s*\]|_{3,})$/.test(part)) {
      return (
        <span
          key={idx}
          className="inline-block mx-0.5 px-2 py-0.5 rounded bg-amber-500/15 dark:bg-amber-400/20 border border-dashed border-amber-500/75 dark:border-amber-400/75 font-mono-tabular text-sm font-semibold text-amber-800 dark:text-amber-300 align-baseline"
        >
          {part.startsWith('[') ? part : '[ ______ ]'}
        </span>
      );
    }
    if (/^"[^"]+"$/.test(part)) {
      return (
        <span
          key={idx}
          className="font-semibold text-amber-700 dark:text-amber-300 underline decoration-amber-500/60 underline-offset-4"
        >
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function MockExamPanel({
  sessionTitle,
  exam,
  answers,
  isSubmitted,
  isGenerating,
  errorMessage,
  onGenerateExam,
  onSelectAnswer,
  onSubmitExam,
  onResetExam,
  onRetryWrongWords,
}: MockExamPanelProps) {
  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
  const [playingTarget, setPlayingTarget] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number | null>(null);

  const [revealedScripts, setRevealedScripts] = useState<Record<string, boolean>>({});
  const [revealedRcTranslations, setRevealedRcTranslations] = useState<Record<string, boolean>>({});

  const playbackSessionRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stopAudio = () => {
    playbackSessionRef.current += 1;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (ttsSupported) {
      window.speechSynthesis.cancel();
    }
    setPlayingTarget(null);
    setIsPaused(false);
    setActiveTurnIdx(null);
  };

  useEffect(() => {
    setRevealedScripts({});
    setRevealedRcTranslations({});
    stopAudio();
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam?.generatedAt]);

  const speakQueue = (
    targetId: string,
    segments: Array<{
      text: string;
      speaker?: 'Man' | 'Woman' | 'Narrator';
      pauseAfterMs?: number;
      turnIndex?: number;
    }>,
    overrideSpeed?: PlaybackSpeed
  ) => {
    if (!ttsSupported || segments.length === 0) return;

    stopAudio();
    const runId = playbackSessionRef.current;
    const rate = overrideSpeed ?? speed;
    const voices = pickVoicesForSpeakers();

    setPlayingTarget(targetId);
    setIsPaused(false);

    let index = 0;

    const playNext = () => {
      if (playbackSessionRef.current !== runId) return;
      if (index >= segments.length) {
        setPlayingTarget(null);
        setIsPaused(false);
        setActiveTurnIdx(null);
        return;
      }

      const seg = segments[index];
      setActiveTurnIdx(seg.turnIndex ?? null);

      const u = new SpeechSynthesisUtterance(seg.text);
      u.lang = 'en-US';

      if (seg.speaker === 'Man') {
        if (voices.male) u.voice = voices.male;
        u.pitch = 0.92;
        u.rate = Math.max(0.7, Math.min(1.4, rate * 0.98));
      } else if (seg.speaker === 'Woman') {
        if (voices.female) u.voice = voices.female;
        u.pitch = 1.1;
        u.rate = Math.max(0.7, Math.min(1.4, rate * 1.02));
      } else {
        if (voices.neutral) u.voice = voices.neutral;
        u.pitch = 1.0;
        u.rate = rate;
      }

      u.onend = () => {
        if (playbackSessionRef.current !== runId) return;
        index += 1;
        const pauseMs = seg.pauseAfterMs ?? 350;
        if (pauseMs > 0 && index < segments.length) {
          timeoutRef.current = window.setTimeout(playNext, pauseMs);
        } else {
          playNext();
        }
      };

      u.onerror = () => {
        if (playbackSessionRef.current !== runId) return;
        setPlayingTarget(null);
        setIsPaused(false);
        setActiveTurnIdx(null);
      };

      window.speechSynthesis.speak(u);
    };

    playNext();
  };

  const handleTogglePlayPart2 = (q: MockExamQuestion) => {
    const targetId = `part2-${q.id}`;
    if (playingTarget === targetId) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    const segments: Array<{
      text: string;
      speaker?: 'Man' | 'Woman' | 'Narrator';
      pauseAfterMs?: number;
    }> = [
      {
        text: `Number ${q.id}. ${q.spokenPrompt || q.questionText}`,
        speaker: 'Narrator',
        pauseAfterMs: 600,
      },
      ...q.options.map((opt, idx) => ({
        text: `${String.fromCharCode(65 + idx)}. ${opt}`,
        speaker: (idx % 2 === 0 ? 'Woman' : 'Man') as 'Woman' | 'Man',
        pauseAfterMs: 480,
      })),
    ];

    speakQueue(targetId, segments);
  };

  const handleTogglePlayLcPassage = (passage: MockExamLcPassage) => {
    const targetId = `lc-${passage.id}`;
    if (playingTarget === targetId) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    const segments = passage.turns.map((turn, idx) => ({
      text: turn.line,
      speaker: turn.speaker,
      pauseAfterMs: 380,
      turnIndex: idx,
    }));

    speakQueue(targetId, segments);
  };

  const toggleScript = (key: string) => {
    setRevealedScripts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const questions = exam?.questions ?? [];
  const lcQuestions = useMemo(() => questions.filter((q) => q.section === 'LC'), [questions]);
  const rcQuestions = useMemo(() => questions.filter((q) => q.section === 'RC'), [questions]);

  const part2Questions = useMemo(
    () => lcQuestions.filter((q) => q.part === 'Part 2'),
    [lcQuestions]
  );
  const part5Questions = useMemo(
    () => rcQuestions.filter((q) => q.part === 'Part 5'),
    [rcQuestions]
  );

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const lcCorrect = lcQuestions.filter((q) => answers[q.id] === q.correctIndex).length;
  const rcCorrect = rcQuestions.filter((q) => answers[q.id] === q.correctIndex).length;
  const totalCorrect = lcCorrect + rcCorrect;

  const lcScore = scaleToeicSectionScore(lcCorrect, lcQuestions.length || 10);
  const rcScore = scaleToeicSectionScore(rcCorrect, rcQuestions.length || 10);
  const totalScore = lcScore + rcScore;

  const wrongWords = useMemo(() => {
    if (!isSubmitted) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    for (const q of questions) {
      if (answers[q.id] !== q.correctIndex && q.targetWord) {
        const lower = q.targetWord.trim().toLowerCase();
        if (lower && !seen.has(lower)) {
          seen.add(lower);
          list.push(q.targetWord);
        }
      }
    }
    return list;
  }, [isSubmitted, questions, answers]);

  if (isGenerating) {
    return (
      <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 px-6 py-14 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-amber-500" />
        <h3 className="mt-4 text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
          이 날의 단어로 토익 LC + RC 20문항 실전 모의고사를 출제하고 있습니다...
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          LC Part 2·3·4 듣기 대본과 RC Part 5·6·7 독해 문항을 구성 중입니다.
        </p>
      </section>
    );
  }

  if (!exam) {
    return (
      <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 px-6 py-12 text-center space-y-4">
        <Headphones className="w-8 h-8 mx-auto text-amber-500" />
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
            이 날의 단어로 실전 모의고사 (LC 10 + RC 10)
          </h3>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            선택하신 학습 세트의 단어들로 실제 토익 시험 형식의 듣기(Part 2·3·4) 10문제와 독해(Part 5·6·7) 10문제 모의고사를 생성합니다.
          </p>
        </div>

        {errorMessage && (
          <div className="max-w-lg mx-auto rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-xs sm:text-sm text-rose-800 dark:text-rose-200">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={onGenerateExam}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-sm"
        >
          <Headphones className="w-4 h-4" />
          이 날의 단어로 실전 모의고사(20문제) 생성
        </button>
      </section>
    );
  }

  const renderQuestionOptions = (
    q: MockExamQuestion,
    hideOptionText: boolean
  ) => {
    const selectedIdx = answers[q.id];
    const hasLongOptions =
      !hideOptionText && q.options.some((opt) => opt.length > 26);

    return (
      <div
        className={`grid gap-2.5 ${
          hideOptionText
            ? 'grid-cols-3'
            : hasLongOptions
              ? 'grid-cols-1'
              : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {q.options.map((opt, optIdx) => {
          const label = `(${String.fromCharCode(65 + optIdx)})`;
          const isSelected = selectedIdx === optIdx;
          const isCorrect = optIdx === q.correctIndex;

          let btnClass =
            'border-slate-200 dark:border-slate-700/90 bg-slate-50/80 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 hover:border-amber-500/60 dark:hover:border-amber-400/60';

          if (!isSubmitted && isSelected) {
            btnClass =
              'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-500/15 text-amber-950 dark:text-amber-100 font-semibold ring-1 ring-amber-500/40';
          } else if (isSubmitted) {
            if (isCorrect) {
              btnClass =
                'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-semibold';
            } else if (isSelected && !isCorrect) {
              btnClass =
                'border-rose-500 dark:border-rose-400 bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-200';
            } else {
              btnClass =
                'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0B1120]/50 text-slate-400 dark:text-slate-500';
            }
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={isSubmitted}
              onClick={() => onSelectAnswer(q.id, optIdx)}
              className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border text-left text-sm leading-snug transition-colors ${
                isSubmitted ? 'cursor-default' : 'cursor-pointer'
              } ${btnClass} ${hideOptionText ? 'justify-center items-center' : ''}`}
            >
              <span className="font-mono-tabular text-xs font-semibold opacity-80 shrink-0 mt-0.5">
                {label}
              </span>
              {!hideOptionText ? (
                <span className="break-words">{opt}</span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  응답 {String.fromCharCode(65 + optIdx)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderPostSubmitExplanation = (q: MockExamQuestion) => {
    if (!isSubmitted) return null;
    return (
      <div className="mt-4 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs sm:text-sm leading-relaxed">
        {q.koreanTranslation && (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">해석: </span>
            <span className="text-slate-600 dark:text-slate-300">{q.koreanTranslation}</span>
          </div>
        )}
        <div>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            정답 ({String.fromCharCode(65 + q.correctIndex)}) 해설:{' '}
          </span>
          <span className="text-slate-700 dark:text-slate-300">{q.koreanExplanation}</span>
        </div>
        {q.paraphrasePoint && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
            <span className="text-amber-700 dark:text-amber-300 font-medium">
              패러프레이징 / 포인트: {q.paraphrasePoint}
            </span>
            {q.targetWord && (
              <span className="font-mono-tabular text-slate-500 dark:text-slate-400">
                목표 단어: <strong className="text-slate-700 dark:text-slate-200">{q.targetWord}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mock Exam Top Control Header */}
      <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 px-5 py-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
                실전 토익 모의고사 (LC 10 + RC 10)
              </h3>
              <span className="text-xs font-mono-tabular text-amber-600 dark:text-amber-400 font-semibold">
                {answeredCount} / {questions.length}문항 응답
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
              기반 학습 세트: {sessionTitle} · 출제 어휘 {exam.sourceWords.length}개 활용
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {ttsSupported && (
              <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">
                  LC 배속
                </span>
                {([0.8, 1.0, 1.2] as PlaybackSpeed[]).map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setSpeed(rate)}
                    className={`px-2 py-0.5 rounded text-xs font-mono-tabular cursor-pointer transition-colors ${
                      speed === rate
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {rate.toFixed(1)}x
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onGenerateExam}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              새 모의고사 출제
            </button>

            {isSubmitted && (
              <button
                type="button"
                onClick={() => {
                  stopAudio();
                  onResetExam();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                다시 풀기
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-xs text-rose-800 dark:text-rose-200">
            {errorMessage}
          </div>
        )}

        {/* Score Report after Submission */}
        {isSubmitted && (
          <div className="rounded-xl border border-emerald-300/80 dark:border-emerald-500/35 bg-emerald-50/70 dark:bg-emerald-500/10 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  LC 예상 점수 (듣기)
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono-tabular text-sky-600 dark:text-sky-400">
                    {lcScore}점
                  </span>
                  <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                    ({lcCorrect}/{lcQuestions.length} 정답)
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  RC 예상 점수 (독해)
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono-tabular text-amber-600 dark:text-amber-400">
                    {rcScore}점
                  </span>
                  <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                    ({rcCorrect}/{rcQuestions.length} 정답)
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  총점 환산 / 전체 정답
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400">
                    {totalScore} / 990
                  </span>
                  <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                    ({totalCorrect}/{questions.length}문항)
                  </span>
                </div>
              </div>
            </div>

            {wrongWords.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-emerald-200/70 dark:border-emerald-500/20">
                <p className="text-xs text-slate-700 dark:text-slate-200">
                  틀린 문제의 핵심 단어 <strong>{wrongWords.length}개</strong> ({wrongWords.join(', ')})가 이 날짜의 오답 노트에 자동 누적되었습니다.
                </p>
                <button
                  type="button"
                  onClick={() => onRetryWrongWords(wrongWords)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  오답 단어만 다시 지문 만들기
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 1: LC (Questions 1~10) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-50">
              PART 1 · LC 듣기 영역 (1~10번)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              영어 스크립트는 기본적으로 숨겨져 있습니다. 먼저 음성 재생 버튼을 눌러 귀로 듣고 문제를 풀어보세요.
            </p>
          </div>
        </div>

        {/* Part 2 (Q1~Q4) */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            Part 2 · 질의응답 (1~4번)
          </div>
          {part2Questions.map((q) => {
            const targetId = `part2-${q.id}`;
            const isPlayingThis = playingTarget === targetId;
            const scriptVisible = isSubmitted || Boolean(revealedScripts[targetId]);
            const isAnswered = answers[q.id] !== undefined;
            const isCorrect = answers[q.id] === q.correctIndex;

            return (
              <article
                key={q.id}
                className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold font-mono-tabular text-slate-500 dark:text-slate-400">
                      문제 {String(q.id).padStart(2, '0')}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-sky-300/80 dark:border-sky-500/35 bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 text-xs font-semibold">
                      [{q.typeBadge}]
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ttsSupported && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleTogglePlayPart2(q)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isPlayingThis
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 hover:opacity-90'
                          }`}
                        >
                          {isPlayingThis && !isPaused ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              일시정지
                            </>
                          ) : isPlayingThis && isPaused ? (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              계속 듣기
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              음성 재생
                            </>
                          )}
                        </button>
                        {isPlayingThis && (
                          <button
                            type="button"
                            onClick={stopAudio}
                            aria-label="음성 정지"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleScript(targetId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {scriptVisible ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          스크립트 숨기기
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          스크립트 보기
                        </>
                      )}
                    </button>

                    {isSubmitted && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          isCorrect
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            정답
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            {isAnswered
                              ? `오답 (정답 ${String.fromCharCode(65 + q.correctIndex)})`
                              : `미응답 (정답 ${String.fromCharCode(65 + q.correctIndex)})`}
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {!scriptVisible ? (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {q.questionText || '질문과 보기 (A), (B), (C) 음성을 듣고 가장 적절한 응답을 선택하세요.'}
                  </p>
                ) : (
                  <div className="mb-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] px-4 py-3 text-sm">
                    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 mr-2">
                      질문 대본:
                    </span>
                    <span className="font-passage text-slate-900 dark:text-slate-100">
                      {q.spokenPrompt}
                    </span>
                  </div>
                )}

                {renderQuestionOptions(q, !scriptVisible)}
                {renderPostSubmitExplanation(q)}
              </article>
            );
          })}
        </div>

        {/* Part 3 & Part 4 Passages + Questions 5~10 */}
        {exam.lcPassages.map((passage) => {
          const targetId = `lc-${passage.id}`;
          const isPlayingThis = playingTarget === targetId;
          const scriptVisible = isSubmitted || Boolean(revealedScripts[targetId]);
          const linkedQuestions = lcQuestions.filter(
            (q) => q.passageId === passage.id || (passage.part === 'Part 3' ? q.part === 'Part 3' : q.part === 'Part 4')
          );

          return (
            <div key={passage.id} className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                {passage.part} · {passage.titleKo} ({passage.contextLabel})
              </div>

              {/* Audio Passage Player & Hidden Script Card */}
              <div className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {passage.part === 'Part 3' ? '대화 지문 듣기' : '담화/안내문 듣기'}
                  </div>

                  <div className="flex items-center gap-2">
                    {ttsSupported && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleTogglePlayLcPassage(passage)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isPlayingThis
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 hover:opacity-90'
                          }`}
                        >
                          {isPlayingThis && !isPaused ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              일시정지
                            </>
                          ) : isPlayingThis && isPaused ? (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              이어 듣기
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              지문 음성 재생
                            </>
                          )}
                        </button>
                        {isPlayingThis && (
                          <button
                            type="button"
                            onClick={stopAudio}
                            aria-label="지문 음성 정지"
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleScript(targetId)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {scriptVisible ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          스크립트 숨기기
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          스크립트 보기
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {!scriptVisible ? (
                  <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120]/70 px-4 py-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center">
                    영어 대본이 숨겨져 있습니다. 먼저 <strong className="text-slate-700 dark:text-slate-200">지문 음성 재생</strong>을 눌러 듣고 아래 문제를 풀어보세요.
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] p-4">
                    <div className="space-y-2 font-passage text-[15px] leading-relaxed">
                      {passage.turns.map((turn, tIdx) => {
                        const isTurnActive = isPlayingThis && activeTurnIdx === tIdx;
                        return (
                          <div
                            key={tIdx}
                            className={`rounded px-2 py-1 transition-colors ${
                              isTurnActive
                                ? 'bg-amber-500/15 dark:bg-amber-400/15'
                                : ''
                            }`}
                          >
                            <span className="font-sans text-xs font-bold mr-2 text-sky-700 dark:text-sky-400">
                              {turn.speaker === 'Man'
                                ? '남성(M):'
                                : turn.speaker === 'Woman'
                                  ? '여성(W):'
                                  : '안내:'}
                            </span>
                            <span className="text-slate-800 dark:text-slate-100">
                              {turn.line}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                      <div className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                        한국어 해석
                      </div>
                      {passage.koreanTranslation}
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Part 3 / 4 Questions */}
              {linkedQuestions.map((q) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCorrect = answers[q.id] === q.correctIndex;
                return (
                  <article
                    key={q.id}
                    className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-mono-tabular text-slate-500 dark:text-slate-400">
                          문제 {String(q.id).padStart(2, '0')}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-sky-300/80 dark:border-sky-500/35 bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 text-xs font-semibold">
                          [{q.typeBadge}]
                        </span>
                      </div>
                      {isSubmitted && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              정답
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              {isAnswered
                                ? `오답 (정답 ${String.fromCharCode(65 + q.correctIndex)})`
                                : `미응답 (정답 ${String.fromCharCode(65 + q.correctIndex)})`}
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <p className="font-passage text-base leading-relaxed text-slate-900 dark:text-slate-100 mb-3.5">
                      {q.questionText}
                    </p>

                    {renderQuestionOptions(q, false)}
                    {renderPostSubmitExplanation(q)}
                  </article>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* SECTION 2: RC (Questions 11~20) */}
      <section className="space-y-4 pt-2">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-50">
            PART 2 · RC 독해 영역 (11~20번)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Part 5 단문 빈칸(5문항) · Part 6 장문 빈칸(2문항) · Part 7 비즈니스 독해/동의어(3문항)
          </p>
        </div>

        {/* Part 5 (Q11~15) */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Part 5 · 단문 빈칸 채우기 (11~15번)
          </div>
          {part5Questions.map((q) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCorrect = answers[q.id] === q.correctIndex;
            return (
              <article
                key={q.id}
                className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold font-mono-tabular text-slate-500 dark:text-slate-400">
                      문제 {String(q.id).padStart(2, '0')}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-500/35 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                      [{q.typeBadge}]
                    </span>
                  </div>
                  {isSubmitted && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        isCorrect
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          정답
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          {isAnswered
                            ? `오답 (정답 ${String.fromCharCode(65 + q.correctIndex)})`
                            : `미응답 (정답 ${String.fromCharCode(65 + q.correctIndex)})`}
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="font-passage text-base leading-relaxed text-slate-900 dark:text-slate-100 mb-3.5">
                  {highlightExamPlaceholders(q.questionText)}
                </p>

                {renderQuestionOptions(q, false)}
                {renderPostSubmitExplanation(q)}
              </article>
            );
          })}
        </div>

        {/* Part 6 & Part 7 Passages + Q16~20 */}
        {exam.rcPassages.map((passage) => {
          const linkedQuestions = rcQuestions.filter(
            (q) =>
              q.passageId === passage.id ||
              (passage.part === 'Part 6' ? q.part === 'Part 6' : q.part === 'Part 7')
          );
          const showTrans = isSubmitted || Boolean(revealedRcTranslations[passage.id]);

          return (
            <div key={passage.id} className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {passage.part} · {passage.docTypeLabel}
              </div>

              <article className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <h5 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50">
                    {passage.docTitle || `${passage.part} 지문`}
                  </h5>
                  {isSubmitted && (
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedRcTranslations((prev) => ({
                          ...prev,
                          [passage.id]: !prev[passage.id],
                        }))
                      }
                      className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                    >
                      {showTrans ? '지문 해석 접기' : '지문 해석 보기'}
                    </button>
                  )}
                </div>

                <div className="px-5 py-5 font-passage text-[16px] leading-[1.85] text-slate-800 dark:text-slate-100 whitespace-pre-line">
                  {highlightExamPlaceholders(passage.englishText)}
                </div>

                {showTrans && passage.koreanTranslation && (
                  <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      지문 한국어 해석
                    </div>
                    {passage.koreanTranslation}
                  </div>
                )}
              </article>

              {linkedQuestions.map((q) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCorrect = answers[q.id] === q.correctIndex;
                return (
                  <article
                    key={q.id}
                    className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-mono-tabular text-slate-500 dark:text-slate-400">
                          문제 {String(q.id).padStart(2, '0')}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-violet-300/80 dark:border-violet-500/35 bg-violet-50 dark:bg-violet-500/10 text-violet-800 dark:text-violet-300 text-xs font-semibold">
                          [{q.typeBadge}]
                        </span>
                      </div>
                      {isSubmitted && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              정답
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              {isAnswered
                                ? `오답 (정답 ${String.fromCharCode(65 + q.correctIndex)})`
                                : `미응답 (정답 ${String.fromCharCode(65 + q.correctIndex)})`}
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <p className="font-passage text-base leading-relaxed text-slate-900 dark:text-slate-100 mb-3.5">
                      {highlightExamPlaceholders(q.questionText)}
                    </p>

                    {renderQuestionOptions(q, false)}
                    {renderPostSubmitExplanation(q)}
                  </article>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* Bottom Submit Action Bar */}
      {!isSubmitted && (
        <div className="sticky bottom-4 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm px-5 py-4 shadow-lg">
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            응시 진행률:{' '}
            <strong className="font-mono-tabular text-amber-600 dark:text-amber-400">
              {answeredCount} / {questions.length}문항
            </strong>
            {answeredCount < questions.length && (
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                (미응답 {questions.length - answeredCount}문항 남음)
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={answeredCount === 0}
            onClick={() => {
              stopAudio();
              onSubmitExam();
              window.setTimeout(() => {
                document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 80);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            모의고사 제출 및 채점
          </button>
        </div>
      )}
    </div>
  );
}
