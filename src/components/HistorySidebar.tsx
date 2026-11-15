import { useRef } from 'react';
import {
  BookOpen,
  Calendar,
  Download,
  Headphones,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { PASSAGE_STYLES, type StudySession } from '../types/study';
import { formatKoreanDateGroup, formatTimeShort } from '../utils/storage';

interface HistorySidebarProps {
  sessions: StudySession[];
  activeSessionId: string | null;
  onSelectSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
  onNewStudy: () => void;
  onLaunchMockExam: (session: StudySession) => void;
  isGeneratingMockExam: boolean;
  onExportBackup: () => void;
  onImportBackup: (jsonText: string) => void;
  backupStatus: { type: 'success' | 'error'; message: string } | null;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function HistorySidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewStudy,
  onLaunchMockExam,
  isGeneratingMockExam,
  onExportBackup,
  onImportBackup,
  backupStatus,
  isMobileOpen,
  onCloseMobile,
}: HistorySidebarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Group sessions by date label preserving order
  const groups: Array<{ dateLabel: string; items: StudySession[] }> = [];
  for (const session of sessions) {
    const label = formatKoreanDateGroup(session.createdAt);
    const existing = groups.find((g) => g.dateLabel === label);
    if (existing) {
      existing.items.push(session);
    } else {
      groups.push({ dateLabel: label, items: [session] });
    }
  }

  const getStyleShortLabel = (styleId: string) =>
    PASSAGE_STYLES.find((s) => s.id === styleId)?.shortLabel ?? '학습 지문';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      onImportBackup(text);
    } finally {
      e.target.value = '';
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800/90">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800/90">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            학습 히스토리
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
            {sessions.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              onNewStudy();
              onCloseMobile();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            새 학습
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="히스토리 닫기"
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <BookOpen className="w-7 h-7 mx-auto mb-2.5 text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              아직 저장된 학습 기록이 없습니다.
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              영단어를 입력하고 지문을 생성하면 날짜별로 자동 저장됩니다.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.dateLabel}>
              <h3 className="px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {group.dateLabel}
              </h3>
              <ul className="space-y-1">
                {group.items.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const answeredCount = session.quizAnswers
                    ? Object.keys(session.quizAnswers).length
                    : 0;
                  const correctCount = session.quizAnswers
                    ? session.result.quizzes.filter(
                        (q) => session.quizAnswers?.[q.id] === q.correctIndex
                      ).length
                    : 0;

                  return (
                    <li key={session.id} className="group relative">
                      <div
                        className={`rounded-lg transition-colors ${
                          isActive
                            ? 'bg-amber-500/10 dark:bg-amber-400/12 ring-1 ring-amber-500/30 dark:ring-amber-400/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSession(session);
                            onCloseMobile();
                          }}
                          className={`w-full text-left px-3 py-2.5 pr-9 cursor-pointer ${
                            isActive
                              ? 'text-slate-900 dark:text-slate-50'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="text-sm font-medium truncate">
                            {session.result.title || session.inputWords.slice(0, 3).join(', ')}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                            <span className="truncate">{getStyleShortLabel(session.style)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums shrink-0">{session.inputWords.length}단어</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums shrink-0">{formatTimeShort(session.createdAt)}</span>
                          </div>
                          {(answeredCount > 0 || session.wrongWords.length > 0 || session.reviewCount > 0) && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                              {answeredCount > 0 && (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  퀴즈 {correctCount}/{session.result.quizzes.length}
                                </span>
                              )}
                              {session.wrongWords.length > 0 && (
                                <>
                                  {answeredCount > 0 && <span aria-hidden="true">·</span>}
                                  <span className="text-amber-600 dark:text-amber-400">
                                    취약 {session.wrongWords.length}
                                  </span>
                                </>
                              )}
                              {session.reviewCount > 0 && (
                                <>
                                  {(answeredCount > 0 || session.wrongWords.length > 0) && (
                                    <span aria-hidden="true">·</span>
                                  )}
                                  <span>복습 {session.reviewCount}회</span>
                                </>
                              )}
                            </div>
                          )}
                        </button>

                        {isActive && (
                          <div className="px-3 pb-2.5">
                            <button
                              type="button"
                              disabled={isGeneratingMockExam}
                              onClick={() => {
                                onLaunchMockExam(session);
                                onCloseMobile();
                              }}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/35 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Headphones className="w-3 h-3 shrink-0" />
                              <span>
                                {session.mockExam
                                  ? '실전 모의고사(20문제) 열기'
                                  : '이 날의 단어로 실전 모의고사(20문제)'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        aria-label={`${session.result.title} 기록 삭제`}
                        title="기록 삭제"
                        className="absolute right-2 top-2.5 p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-70 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      {/* Backup & Restore Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800/90 px-3 py-3 space-y-2 bg-slate-50/70 dark:bg-[#0B1120]/60">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onExportBackup}
            disabled={sessions.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>학습 기록 백업(.json)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C2E] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span>데이터 복원</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="학습 데이터 JSON 백업 파일 선택"
          />
        </div>

        {backupStatus && (
          <p
            className={`text-[11px] leading-snug px-1 ${
              backupStatus.type === 'success'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {backupStatus.message}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile & tablet slide-over drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-80 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
