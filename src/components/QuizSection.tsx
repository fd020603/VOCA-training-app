import type { ReactNode } from 'react';
import { CheckCircle2, RotateCcw, RefreshCw, XCircle } from 'lucide-react';
import type { QuizDistractorNote, QuizQuestion, ToeicQuizType } from '../types/study';

interface QuizSectionProps {
  quizzes: QuizQuestion[];
  answers: Record<number, number>;
  onSelectAnswer: (questionId: number, optionIndex: number) => void;
  onResetQuiz: () => void;
  onRetryWrongWords: (wrongWords: string[]) => void;
}

function getBadgeLabel(q: QuizQuestion): string {
  if (q.typeBadge && q.typeBadge.trim().length > 0) {
    return q.typeBadge.trim();
  }
  switch (q.quizType) {
    case 'part5_word_family':
      return 'Part 5 - 품사 변형';
    case 'part5_synonym_vocab':
      return 'Part 5 - 유의어 어휘';
    case 'part6_context_insertion':
      return 'Part 6 - 문맥 추론/삽입';
    case 'part7_synonym_in_context':
      return 'Part 7 - 문맥상 동의어';
    case 'part7_reading_inference':
      return 'Part 7 - 세부 내용 추론';
    default:
      return '어휘 빈칸 추론';
  }
}

function getBadgeToneClass(quizType?: ToeicQuizType): string {
  switch (quizType) {
    case 'part5_word_family':
    case 'part5_synonym_vocab':
      return 'border-sky-300/80 dark:border-sky-500/35 bg-sky-50/90 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300';
    case 'part6_context_insertion':
      return 'border-violet-300/80 dark:border-violet-500/35 bg-violet-50/90 dark:bg-violet-500/10 text-violet-800 dark:text-violet-300';
    case 'part7_synonym_in_context':
    case 'part7_reading_inference':
      return 'border-amber-300/80 dark:border-amber-500/35 bg-amber-50/90 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300';
    default:
      return 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  }
}

function highlightBlanksAndQuotes(text: string): ReactNode {
  const parts = text.split(/(\[\s*_{2,}\s*\]|_{3,}|"[^"]+")/g);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^(?:\[\s*_{2,}\s*\]|_{3,})$/.test(part)) {
      return (
        <span
          key={idx}
          className="inline-block mx-0.5 px-2 py-0.5 rounded bg-amber-500/15 dark:bg-amber-400/20 border border-dashed border-amber-500/70 dark:border-amber-400/70 font-mono-tabular text-sm font-semibold text-amber-800 dark:text-amber-300 align-baseline"
        >
          [ ______ ]
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

function findDistractorNote(
  optionText: string,
  wrongSlotIdx: number,
  notes: QuizDistractorNote[] | undefined
): QuizDistractorNote | undefined {
  if (!notes || notes.length === 0) return undefined;
  const normalized = optionText.trim().toLowerCase();
  const exact = notes.find((n) => n.option.trim().toLowerCase() === normalized);
  if (exact) return exact;
  return notes[wrongSlotIdx];
}

export function QuizSection({
  quizzes,
  answers,
  onSelectAnswer,
  onResetQuiz,
  onRetryWrongWords,
}: QuizSectionProps) {
  const totalCount = quizzes.length;
  const answeredCount = quizzes.filter((q) => answers[q.id] !== undefined).length;
  const correctCount = quizzes.filter((q) => answers[q.id] === q.correctIndex).length;

  const wrongQuestions = quizzes.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex
  );
  const wrongWords = Array.from(new Set(wrongQuestions.map((q) => q.targetWord).filter(Boolean)));

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const part5Count = quizzes.filter(
    (q) => q.quizType === 'part5_word_family' || q.quizType === 'part5_synonym_vocab'
  ).length;
  const part6Count = quizzes.filter((q) => q.quizType === 'part6_context_insertion').length;
  const part7Count = quizzes.filter(
    (q) => q.quizType === 'part7_synonym_in_context' || q.quizType === 'part7_reading_inference'
  ).length;
  const hasToeicBreakdown = part5Count + part6Count + part7Count > 0;

  return (
    <div className="space-y-5">
      {/* Live Scoreboard Header */}
      <div className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 px-5 py-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              실전 토익(TOEIC) RC 모의 퀴즈
            </h3>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <div className="text-sm text-slate-700 dark:text-slate-200 font-mono-tabular">
              현재 점수:{' '}
              <strong className="text-amber-600 dark:text-amber-400">
                {correctCount} / {totalCount}
              </strong>
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                (풀이 {answeredCount}/{totalCount} · 정답률 {accuracy}%)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onResetQuiz}
            disabled={answeredCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 whitespace-nowrap cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            다시 풀기
          </button>
        </div>

        {hasToeicBreakdown && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            출제 구성: Part 5 품사·유의어 {part5Count}문항 · Part 6 문맥·삽입 {part6Count}문항 · Part 7 동의어·추론 {part7Count}문항
          </p>
        )}
      </div>

      {/* Wrong-words Re-study Callout */}
      {wrongWords.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-5 py-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-amber-200">
              틀린 핵심 단어 {wrongWords.length}개가 오답 노트에 자동 기록되었습니다
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              오답 어휘: <span className="font-semibold">{wrongWords.join(', ')}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRetryWrongWords(wrongWords)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            오답 단어만 다시 지문 만들기
          </button>
        </div>
      )}

      {/* Question Cards */}
      <div className="space-y-4">
        {quizzes.map((q, index) => {
          const selectedIdx = answers[q.id];
          const isAnswered = selectedIdx !== undefined;
          const isCorrect = selectedIdx === q.correctIndex;
          const badgeLabel = getBadgeLabel(q);
          const badgeToneClass = getBadgeToneClass(q.quizType);
          const hasLongOptions =
            q.options.some((opt) => opt.length > 26) ||
            q.quizType === 'part7_reading_inference';

          const wrongOptionIndices = q.options
            .map((_, i) => i)
            .filter((i) => i !== q.correctIndex);

          const hasStructuredExplanation = Boolean(
            q.koreanTranslation ||
              q.answerReason ||
              (q.distractorNotes && q.distractorNotes.length > 0)
          );

          return (
            <article
              key={q.id}
              className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5 sm:p-6"
            >
              {/* Card Header: Question Number + Type Badge + Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold font-mono-tabular text-slate-500 dark:text-slate-400">
                    문제 {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${badgeToneClass}`}
                  >
                    [{badgeLabel}]
                  </span>
                </div>

                {isAnswered && (
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
                        정답입니다 ({String.fromCharCode(65 + q.correctIndex)})
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        오답입니다 (정답: {String.fromCharCode(65 + q.correctIndex)})
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Optional Part 6 Excerpt Paragraph */}
              {q.excerptParagraph && q.excerptParagraph.trim().length > 0 && (
                <div className="mb-3.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/90 dark:bg-[#0B1120] px-4 py-3.5">
                  <div className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                    지문 발췌 문단
                  </div>
                  <p className="font-passage text-[15px] sm:text-base leading-[1.8] text-slate-800 dark:text-slate-100">
                    {highlightBlanksAndQuotes(q.excerptParagraph)}
                  </p>
                </div>
              )}

              {/* Question Stem */}
              <p className="font-passage text-base sm:text-[17px] leading-relaxed text-slate-900 dark:text-slate-100 mb-4">
                {highlightBlanksAndQuotes(q.questionSentence)}
              </p>

              {/* 4-Choice Options */}
              <div
                className={`grid gap-2.5 ${
                  hasLongOptions ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selectedIdx === optIdx;
                  const isThisCorrect = optIdx === q.correctIndex;

                  let buttonClass =
                    'border-slate-200 dark:border-slate-700/90 bg-slate-50/70 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 hover:border-amber-500/60 dark:hover:border-amber-400/60';

                  if (isAnswered) {
                    if (isThisCorrect) {
                      buttonClass =
                        'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isThisSelected && !isThisCorrect) {
                      buttonClass =
                        'border-rose-500 dark:border-rose-400 bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-200';
                    } else {
                      buttonClass =
                        'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0B1120]/50 text-slate-400 dark:text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => onSelectAnswer(q.id, optIdx)}
                      className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-left text-sm leading-snug transition-colors ${
                        isAnswered ? 'cursor-default' : 'cursor-pointer'
                      } ${buttonClass}`}
                    >
                      <span className="font-mono-tabular text-xs font-semibold opacity-75 shrink-0 mt-0.5">
                        ({String.fromCharCode(65 + optIdx)})
                      </span>
                      <span className="break-words">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Systematic TOEIC Answer Key & Explanation */}
              {isAnswered && (
                <div className="mt-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs sm:text-sm leading-relaxed">
                  {hasStructuredExplanation ? (
                    <>
                      {q.koreanTranslation && (
                        <div>
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            1. 문제 문장 해석
                          </div>
                          <p className="text-slate-800 dark:text-slate-200">
                            {q.koreanTranslation}
                          </p>
                        </div>
                      )}

                      {(q.answerReason || q.koreanExplanation) && (
                        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              2. 정답 ({String.fromCharCode(65 + q.correctIndex)}) {q.options[q.correctIndex]} — 정답 이유
                            </span>
                            {q.targetWord && (
                              <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                                목표 단어: <strong className="text-slate-700 dark:text-slate-200">{q.targetWord}</strong>
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            {q.answerReason || q.koreanExplanation}
                          </p>
                        </div>
                      )}

                      {wrongOptionIndices.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
                          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1.5">
                            3. 오답 보기 분석
                          </div>
                          <ul className="space-y-1.5">
                            {wrongOptionIndices.map((optIdx, slotIdx) => {
                              const optText = q.options[optIdx];
                              const note = findDistractorNote(
                                optText,
                                slotIdx,
                                q.distractorNotes
                              );
                              return (
                                <li
                                  key={optIdx}
                                  className="text-slate-700 dark:text-slate-300 flex items-start gap-2"
                                >
                                  <span className="font-mono-tabular font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                                    ({String.fromCharCode(65 + optIdx)})
                                  </span>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                      {optText}
                                    </span>
                                    {note ? (
                                      <>
                                        <span className="text-amber-700 dark:text-amber-300 font-medium">
                                          {' '}
                                          [{note.meaningKo}]
                                        </span>
                                        <span className="text-slate-600 dark:text-slate-400">
                                          {' '}
                                          — {note.reasonKo}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-slate-500 dark:text-slate-400">
                                        {' '}
                                        — 문맥 또는 문법 구조상 적합하지 않습니다.
                                      </span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">해설: </span>
                      {q.koreanExplanation}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
