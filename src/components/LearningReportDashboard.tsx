import { useMemo } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Flame,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import type { StudySession, WordMasteryRecord } from '../types/study';
import { TOEIC_VOCAB_LIST } from '../data/toeicVocab';
import { computeStudyStreakDays } from '../utils/storage';

interface LearningReportDashboardProps {
  sessions: StudySession[];
  masteryMap: Record<string, WordMasteryRecord>;
  onSendTopWordsToInput: (words: string[]) => void;
  onGoToStudy: () => void;
}

interface PartAccuracyRow {
  key: 'lc_part2' | 'lc_part34' | 'rc_part5' | 'rc_part6' | 'rc_part7';
  label: string;
  sectionLabel: string;
  correct: number;
  total: number;
  accuracy: number;
  feedbackTip: string;
}

interface RankedWeakWord {
  key: string;
  word: string;
  meaning: string;
  totalScore: number;
  missedCount: number;
  starCount: number;
  isMastered: boolean;
}

export function LearningReportDashboard({
  sessions,
  masteryMap,
  onSendTopWordsToInput,
  onGoToStudy,
}: LearningReportDashboardProps) {
  const builtInMeaningMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of TOEIC_VOCAB_LIST) {
      map.set(item.word.toLowerCase(), item.meaning);
    }
    return map;
  }, []);

  // 1. Cumulative KPIs
  const summaryStats = useMemo(() => {
    const uniqueWords = new Set<string>();
    let totalWordEntries = 0;
    let serializedCount = 0;

    for (const s of sessions) {
      totalWordEntries += s.inputWords.length;
      if ((s.episodeNumber ?? 1) >= 2 || s.parentSessionId) {
        serializedCount += 1;
      }
      for (const w of s.inputWords) {
        const k = w.trim().toLowerCase();
        if (k) uniqueWords.add(k);
      }
    }

    const masteredCount = Object.values(masteryMap).filter((m) => m.mastered).length;
    const activeWeakSet = new Set<string>();
    for (const s of sessions) {
      for (const w of s.wrongWords) {
        const k = w.trim().toLowerCase();
        if (k && !masteryMap[k]?.mastered) {
          activeWeakSet.add(k);
        }
      }
    }

    const streakDays = computeStudyStreakDays(sessions);

    return {
      uniqueWordCount: uniqueWords.size,
      totalWordEntries,
      storyCount: sessions.length,
      serializedCount,
      streakDays,
      masteredCount,
      activeWeakCount: activeWeakSet.size,
    };
  }, [sessions, masteryMap]);

  // 2. TOEIC Mock Exam Part-by-Part Accuracy
  const mockExamAnalysis = useMemo(() => {
    const submittedSessions = sessions.filter(
      (s) => s.mockExam && s.mockExamSubmitted && s.mockExam.questions.length > 0
    );

    const buckets: Record<
      PartAccuracyRow['key'],
      { correct: number; total: number }
    > = {
      lc_part2: { correct: 0, total: 0 },
      lc_part34: { correct: 0, total: 0 },
      rc_part5: { correct: 0, total: 0 },
      rc_part6: { correct: 0, total: 0 },
      rc_part7: { correct: 0, total: 0 },
    };

    for (const s of submittedSessions) {
      const answers = s.mockExamAnswers ?? {};
      for (const q of s.mockExam!.questions) {
        const isCorrect = answers[q.id] === q.correctIndex;
        let bucketKey: PartAccuracyRow['key'] = 'rc_part5';
        if (q.part === 'Part 2') bucketKey = 'lc_part2';
        else if (q.part === 'Part 3' || q.part === 'Part 4') bucketKey = 'lc_part34';
        else if (q.part === 'Part 5') bucketKey = 'rc_part5';
        else if (q.part === 'Part 6') bucketKey = 'rc_part6';
        else if (q.part === 'Part 7') bucketKey = 'rc_part7';

        buckets[bucketKey].total += 1;
        if (isCorrect) buckets[bucketKey].correct += 1;
      }
    }

    const rows: PartAccuracyRow[] = [
      {
        key: 'lc_part2',
        label: 'LC Part 2',
        sectionLabel: '질의응답',
        correct: buckets.lc_part2.correct,
        total: buckets.lc_part2.total,
        accuracy:
          buckets.lc_part2.total > 0
            ? Math.round((buckets.lc_part2.correct / buckets.lc_part2.total) * 100)
            : 0,
        feedbackTip:
          '가장 취약한 파트는 LC Part 2입니다. 의문사(Who·When·Where) 핵심어 청취와 우회적 정답 패턴, 유사 발음 오답 함정을 집중 훈련해 보세요.',
      },
      {
        key: 'lc_part34',
        label: 'LC Part 3·4',
        sectionLabel: '대화/담화',
        correct: buckets.lc_part34.correct,
        total: buckets.lc_part34.total,
        accuracy:
          buckets.lc_part34.total > 0
            ? Math.round((buckets.lc_part34.correct / buckets.lc_part34.total) * 100)
            : 0,
        feedbackTip:
          '가장 취약한 파트는 LC Part 3·4입니다. 핵심 단어 요약표의 "LC 패러프레이징" 동의어 쌍을 소리 내어 읽으며 질문 선독 속도를 높여 보세요.',
      },
      {
        key: 'rc_part5',
        label: 'RC Part 5',
        sectionLabel: '단문 빈칸',
        correct: buckets.rc_part5.correct,
        total: buckets.rc_part5.total,
        accuracy:
          buckets.rc_part5.total > 0
            ? Math.round((buckets.rc_part5.correct / buckets.rc_part5.total) * 100)
            : 0,
        feedbackTip:
          '가장 취약한 파트는 RC Part 5입니다. 빈칸 앞뒤 문장 구조로 품사를 먼저 판별하고, 전치사·동사 짝꿍(Collocation) 구분을 집중 복습하세요.',
      },
      {
        key: 'rc_part6',
        label: 'RC Part 6',
        sectionLabel: '문맥/문장 삽입',
        correct: buckets.rc_part6.correct,
        total: buckets.rc_part6.total,
        accuracy:
          buckets.rc_part6.total > 0
            ? Math.round((buckets.rc_part6.correct / buckets.rc_part6.total) * 100)
            : 0,
        feedbackTip:
          '가장 취약한 파트는 RC Part 6입니다. 빈칸이 포함된 문장만 보지 말고 앞뒤 문장의 연결 부사(However·Consequently 등)와 지시어 흐름을 함께 확인하세요.',
      },
      {
        key: 'rc_part7',
        label: 'RC Part 7',
        sectionLabel: '독해/동의어',
        correct: buckets.rc_part7.correct,
        total: buckets.rc_part7.total,
        accuracy:
          buckets.rc_part7.total > 0
            ? Math.round((buckets.rc_part7.correct / buckets.rc_part7.total) * 100)
            : 0,
        feedbackTip:
          '가장 취약한 파트는 RC Part 7입니다. 지문 속 문맥상 동의어 치환 감각을 익히고, NOT 문제의 세부 근거 문장을 대조하는 연습을 강화해 보세요.',
      },
    ];

    const populatedRows = rows.filter((r) => r.total > 0);
    const weakestPart =
      populatedRows.length > 0
        ? [...populatedRows].sort((a, b) => a.accuracy - b.accuracy)[0]
        : null;

    return {
      submittedCount: submittedSessions.length,
      rows,
      weakestPart,
    };
  }, [sessions]);

  // 3. Chronic Wrong/Starred Top 10 Ranking
  const top10WeakWords = useMemo<RankedWeakWord[]>(() => {
    const stats = new Map<
      string,
      { word: string; meaning: string; missedCount: number; starCount: number }
    >();

    const ensureEntry = (rawWord: string, meaningHint?: string) => {
      const clean = rawWord.trim();
      const key = clean.toLowerCase();
      if (!key) return null;
      let rec = stats.get(key);
      if (!rec) {
        rec = {
          word: clean,
          meaning: meaningHint || builtInMeaningMap.get(key) || '',
          missedCount: 0,
          starCount: 0,
        };
        stats.set(key, rec);
      } else if (!rec.meaning && meaningHint) {
        rec.meaning = meaningHint;
      }
      return rec;
    };

    for (const s of sessions) {
      const vocabMap = new Map(
        (s.result.vocabulary_table ?? []).map((v) => [
          v.word.trim().toLowerCase(),
          v.coreMeaning,
        ])
      );

      for (const w of s.wrongWords) {
        const key = w.trim().toLowerCase();
        const rec = ensureEntry(w, vocabMap.get(key));
        if (rec) rec.starCount += 1;
      }

      if (s.quizAnswers) {
        for (const q of s.result.quizzes) {
          const ans = s.quizAnswers[q.id];
          if (ans !== undefined && ans !== q.correctIndex && q.targetWord) {
            const key = q.targetWord.trim().toLowerCase();
            const rec = ensureEntry(q.targetWord, vocabMap.get(key));
            if (rec) rec.missedCount += 1;
          }
        }
      }

      if (s.mockExam && s.mockExamSubmitted && s.mockExamAnswers) {
        for (const q of s.mockExam.questions) {
          const ans = s.mockExamAnswers[q.id];
          if (ans !== q.correctIndex && q.targetWord) {
            const key = q.targetWord.trim().toLowerCase();
            const rec = ensureEntry(q.targetWord, vocabMap.get(key));
            if (rec) rec.missedCount += 1;
          }
        }
      }
    }

    const ranked: RankedWeakWord[] = Array.from(stats.entries()).map(([key, v]) => ({
      key,
      word: v.word,
      meaning: v.meaning || '사전 뜻 참고',
      missedCount: v.missedCount,
      starCount: v.starCount,
      totalScore: v.missedCount * 2 + v.starCount,
      isMastered: Boolean(masteryMap[key]?.mastered),
    }));

    ranked.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.missedCount !== a.missedCount) return b.missedCount - a.missedCount;
      return b.starCount - a.starCount;
    });

    return ranked.slice(0, 10);
  }, [sessions, masteryMap, builtInMeaningMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
              전체 학습 통계 &amp; 파트별 약점 리포트
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              지금까지 누적된 스토리 학습 기록, 토익 20문항 모의고사 성적, 고질병 오답 단어를 한눈에 분석합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 1. Cumulative KPI Summary Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>총 학습 영단어</span>
            <BookOpen className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono-tabular text-slate-900 dark:text-slate-50">
            {summaryStats.uniqueWordCount}개
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            누적 입력 {summaryStats.totalWordEntries}단어
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>생성한 스토리 / 에피소드</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono-tabular text-slate-900 dark:text-slate-50">
            {summaryStats.storyCount}편
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            연재 후속 에피소드 {summaryStats.serializedCount}편 포함
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>연속 학습일 (Streak)</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono-tabular text-slate-900 dark:text-slate-50">
            {summaryStats.streakDays}일
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {summaryStats.streakDays > 0
              ? '꾸준한 연속 학습이 이어지고 있습니다'
              : '오늘 첫 학습으로 스트릭을 시작해 보세요'}
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>졸업(Master) 취약 단어</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400">
            {summaryStats.masteredCount}개
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            남은 취약 단어 {summaryStats.activeWeakCount}개
          </p>
        </div>
      </section>

      {/* 2. TOEIC Mock Exam Part-by-Part Accuracy Chart */}
      <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
              실전 모의고사 파트별 정답률 분석
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              제출 완료된 20문항 실전 모의고사 ({mockExamAnalysis.submittedCount}회 응시) 기준 파트별 평균 정답률입니다.
            </p>
          </div>
        </div>

        {mockExamAnalysis.submittedCount === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120]/60 px-5 py-8 text-center space-y-2.5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              아직 채점을 완료한 20문제 실전 모의고사가 없습니다.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              학습 세트를 선택한 뒤 &apos;이 날의 단어로 실전 모의고사(20문제) 생성&apos;으로 시험을 풀고 제출하면 파트별 약점이 자동 분석됩니다.
            </p>
            <button
              type="button"
              onClick={onGoToStudy}
              className="mt-1 inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
            >
              스토리 학습에서 모의고사 풀러 가기
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3.5">
              {mockExamAnalysis.rows.map((row) => {
                const isWeakest = mockExamAnalysis.weakestPart?.key === row.key;
                const barColor = isWeakest
                  ? 'bg-rose-500 dark:bg-rose-400'
                  : row.accuracy >= 80
                    ? 'bg-emerald-500 dark:bg-emerald-400'
                    : row.key.startsWith('lc_')
                      ? 'bg-sky-500 dark:bg-sky-400'
                      : 'bg-amber-500 dark:bg-amber-400';

                return (
                  <div key={row.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {row.label}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {row.sectionLabel}
                        </span>
                        {isWeakest && (
                          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            · 집중 보완 필요
                          </span>
                        )}
                      </div>
                      <div className="font-mono-tabular text-xs sm:text-sm">
                        <strong
                          className={
                            isWeakest
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }
                        >
                          {row.accuracy}%
                        </strong>
                        <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                          ({row.correct}/{row.total})
                        </span>
                      </div>
                    </div>

                    <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${row.accuracy}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {mockExamAnalysis.weakestPart && (
              <div className="rounded-xl border border-amber-300/70 dark:border-amber-500/35 bg-amber-50/75 dark:bg-amber-500/10 px-4 py-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                <TrendingDown className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{mockExamAnalysis.weakestPart.feedbackTip}</span>
              </div>
            )}
          </>
        )}
      </section>

      {/* 3. Chronic Wrong/Starred Top 10 Ranking */}
      <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
              고질병 오답 단어 Top 10 랭킹
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              퀴즈·모의고사 오답 횟수와 별표(⭐) 취약 빈도가 가장 높은 단어 순위입니다.
            </p>
          </div>

          {top10WeakWords.length > 0 && (
            <button
              type="button"
              onClick={() =>
                onSendTopWordsToInput(top10WeakWords.map((item) => item.word))
              }
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Top {top10WeakWords.length} 단어로 즉시 복습 스토리 생성
            </button>
          )}
        </div>

        {top10WeakWords.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            아직 누적된 오답 또는 별표 단어가 없습니다. 퀴즈나 모의고사를 풀면 취약 단어가 자동 집계됩니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1625] text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 pl-5 pr-2 w-14">순위</th>
                  <th className="py-3 px-3 min-w-[140px]">영단어</th>
                  <th className="py-3 px-3 min-w-[180px]">핵심 뜻</th>
                  <th className="py-3 px-3 min-w-[160px]">오답 · 별표 빈도</th>
                  <th className="py-3 pl-3 pr-5 w-24 text-right">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-sm">
                {top10WeakWords.map((item, idx) => (
                  <tr
                    key={item.key}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 pl-5 pr-2 font-mono-tabular text-xs font-bold text-amber-600 dark:text-amber-400">
                      #{String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {item.word}
                    </td>
                    <td className="py-3 px-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {item.meaning}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono-tabular text-slate-600 dark:text-slate-300">
                      오답 {item.missedCount}회 · 별표 세트 {item.starCount}회
                    </td>
                    <td className="py-3 pl-3 pr-5 text-right text-xs font-semibold">
                      {item.isMastered ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          졸업 완료
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">
                          집중 복습
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
