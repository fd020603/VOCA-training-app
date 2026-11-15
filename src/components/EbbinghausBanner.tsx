import { useState } from 'react';
import { Bell, BookOpenCheck, Sparkles } from 'lucide-react';
import type { StudySession } from '../types/study';
import type { EbbinghausDueItem } from '../utils/storage';

interface EbbinghausBannerProps {
  dueItems: EbbinghausDueItem[];
  recent7DaysWrongWords: string[];
  onReadExisting: (session: StudySession) => void;
  onGenerateFromWrongWords: (words: string[], sourceSession: StudySession) => void;
}

export function EbbinghausBanner({
  dueItems,
  recent7DaysWrongWords,
  onReadExisting,
  onGenerateFromWrongWords,
}: EbbinghausBannerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (dueItems.length === 0) return null;

  const safeIndex = selectedIndex < dueItems.length ? selectedIndex : 0;
  const activeDue = dueItems[safeIndex];
  const { session, daysAgo } = activeDue;

  const sessionWrongCount = session.wrongWords.length;
  const targetWrongWords =
    sessionWrongCount > 0 ? session.wrongWords : recent7DaysWrongWords;
  const usingRecent7DaysFallback =
    sessionWrongCount === 0 && recent7DaysWrongWords.length > 0;

  return (
    <section
      aria-label="오늘의 에빙하우스 복습 알리미"
      className="rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/85 dark:bg-amber-500/10 px-5 py-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-amber-100">
              오늘의 에빙하우스 복습 알리미
            </h2>
            {dueItems.length > 1 && (
              <div className="flex items-center gap-1 ml-1">
                {dueItems.map((item, idx) => (
                  <button
                    key={item.session.id}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-2 py-0.5 rounded text-xs font-mono-tabular font-medium transition-colors cursor-pointer ${
                      idx === safeIndex
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'bg-white/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.daysAgo}일 전
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <span className="font-semibold">
              오늘 복습 권장: {daysAgo}일 전 학습 세트
            </span>{' '}
            <span className="text-slate-600 dark:text-slate-300 font-mono-tabular">
              ({session.inputWords.length}단어 중 오답·취약 {sessionWrongCount}개 · 누적 복습 {session.reviewCount}회)
            </span>
          </p>

          <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
            세트 제목: <span className="font-medium text-slate-800 dark:text-slate-200">{session.result.title}</span>
            {usingRecent7DaysFallback && (
              <span> · 최근 7일 누적 취약 단어 {recent7DaysWrongWords.length}개로 재학습 가능</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onReadExisting(session)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131C2E] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            <BookOpenCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>기존 지문 다시 읽기</span>
          </button>

          <button
            type="button"
            disabled={targetWrongWords.length === 0}
            onClick={() => onGenerateFromWrongWords(targetWrongWords, session)}
            title={
              targetWrongWords.length === 0
                ? '퀴즈 오답 또는 단어표 ⭐ 북마크 단어가 없습니다'
                : '취약/오답 단어들로 남성향 웹소설 복습 지문 준비'
            }
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              취약/오답 단어만 모아서 새 스토리 생성
              {targetWrongWords.length > 0 ? ` (${targetWrongWords.length})` : ''}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
