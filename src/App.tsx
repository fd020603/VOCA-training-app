import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  ClipboardList,
  Flame,
  Headphones,
  HelpCircle,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import { HistorySidebar } from './components/HistorySidebar';
import { EbbinghausBanner } from './components/EbbinghausBanner';
import { WordInputPanel } from './components/WordInputPanel';
import { PassageReader } from './components/PassageReader';
import { VocabularyTable } from './components/VocabularyTable';
import { QuizSection } from './components/QuizSection';
import { MockExamPanel } from './components/MockExamPanel';
import { WeakWordFlashcards } from './components/WeakWordFlashcards';
import { LearningReportDashboard } from './components/LearningReportDashboard';
import {
  PASSAGE_STYLES,
  type ContinuationContext,
  type GeneratedStudyResponse,
  type LengthMode,
  type MockExamData,
  type PassageStyleId,
  type StudySession,
  type WordMasteryRecord,
} from './types/study';
import type { AutocompleteVocabEntry } from './data/toeicVocab';
import {
  createStudyBackupJson,
  getEbbinghausDueSessions,
  getRecentAccumulatedWrongWords,
  getSessionEpisodeNumber,
  loadStudyHistory,
  loadThemePreference,
  loadWordMastery,
  parseAndMergeBackupJson,
  saveStudyHistory,
  saveThemePreference,
  saveWordMastery,
} from './utils/storage';
import { parseVocabularyInput } from './utils/wordParser';

type StudyTab = 'passage' | 'vocabulary' | 'quiz' | 'mock_exam';
type WorkspaceView = 'study' | 'flashcards' | 'report';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadThemePreference());
  const [sessions, setSessions] = useState<StudySession[]>(() => loadStudyHistory());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const initial = loadStudyHistory();
    return initial.length > 0 ? initial[0].id : null;
  });

  const [rawInput, setRawInput] = useState<string>(() => {
    const initial = loadStudyHistory();
    return initial.length > 0 ? initial[0].inputWords.join(', ') : '';
  });
  const [selectedStyle, setSelectedStyle] = useState<PassageStyleId>('toeic_business');
  const [selectedLength, setSelectedLength] = useState<LengthMode>('short');
  const [isContinuationEnabled, setIsContinuationEnabled] = useState(false);
  const [continuationSourceId, setContinuationSourceId] = useState<string | null>(() => {
    const initial = loadStudyHistory();
    return initial.length > 0 ? initial[0].id : null;
  });

  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('study');
  const [activeTab, setActiveTab] = useState<StudyTab>('passage');
  const [masteryMap, setMasteryMap] = useState<Record<string, WordMasteryRecord>>(() =>
    loadWordMastery()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingMockExam, setIsGeneratingMockExam] = useState(false);
  const [mockExamError, setMockExamError] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemePreference(theme);
  }, [theme]);

  // Persist sessions whenever updated
  useEffect(() => {
    saveStudyHistory(sessions);
  }, [sessions]);

  // Persist mastery records whenever updated
  useEffect(() => {
    saveWordMastery(masteryMap);
  }, [masteryMap]);

  // Keep continuation source ID valid if sessions are deleted
  useEffect(() => {
    if (sessions.length === 0) {
      setContinuationSourceId(null);
      setIsContinuationEnabled(false);
      return;
    }
    if (!continuationSourceId || !sessions.some((s) => s.id === continuationSourceId)) {
      setContinuationSourceId(sessions[0].id);
    }
  }, [sessions, continuationSourceId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  const dueItems = useMemo(() => getEbbinghausDueSessions(sessions), [sessions]);
  const recent7DaysWrongWords = useMemo(
    () => getRecentAccumulatedWrongWords(sessions, 7),
    [sessions]
  );

  const activeWeakWordsCount = useMemo(() => {
    const keys = new Set<string>();
    for (const s of sessions) {
      for (const w of s.wrongWords) {
        const key = w.trim().toLowerCase();
        if (!key) continue;
        if (!masteryMap[key]?.mastered) {
          keys.add(key);
        }
      }
    }
    return keys.size;
  }, [sessions, masteryMap]);

  const resetWordsInMastery = (words: string[]) => {
    const cleaned = words.map((w) => w.trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    const now = new Date().toISOString();
    setMasteryMap((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const raw of cleaned) {
        const key = raw.toLowerCase();
        const existing = next[key];
        if (!existing || existing.streak !== 0 || existing.mastered) {
          next[key] = {
            word: existing?.word || raw,
            streak: 0,
            mastered: false,
            lastReviewedAt: now,
          };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  };

  const historyAutocompleteEntries = useMemo<AutocompleteVocabEntry[]>(() => {
    const map = new Map<string, AutocompleteVocabEntry>();
    for (const s of sessions) {
      const vocabLookup = new Map(
        (s.result?.vocabulary_table ?? []).map((v) => [v.word.trim().toLowerCase(), v])
      );
      for (const word of s.inputWords) {
        const key = word.trim().toLowerCase();
        if (!key || map.has(key)) continue;
        const vocab = vocabLookup.get(key);
        map.set(key, {
          word,
          partOfSpeech: vocab?.partOfSpeech || '-',
          meaning: vocab?.coreMeaning || '이전 입력 단어',
          fromHistory: true,
        });
      }
    }
    return Array.from(map.values());
  }, [sessions]);

  const handleContinuationToggle = (enabled: boolean) => {
    setIsContinuationEnabled(enabled);
    if (enabled && sessions.length > 0) {
      const target = sessions.find((s) => s.id === continuationSourceId) ?? sessions[0];
      setContinuationSourceId(target.id);
      setSelectedStyle(target.style);
    }
  };

  const handleContinuationSourceChange = (id: string) => {
    setContinuationSourceId(id);
    const target = sessions.find((s) => s.id === id);
    if (target) {
      setSelectedStyle(target.style);
    }
  };

  const handleGenerate = async () => {
    const { words } = parseVocabularyInput(rawInput);
    if (words.length === 0) {
      setErrorMessage('최소 1개 이상의 영단어를 입력해 주세요.');
      return;
    }

    const continuationSource =
      isContinuationEnabled && sessions.length > 0
        ? sessions.find((s) => s.id === continuationSourceId) ?? sessions[0]
        : null;

    let continuationPayload: ContinuationContext | undefined;
    if (continuationSource) {
      const nextEpisodeNumber = getSessionEpisodeNumber(continuationSource) + 1;
      const previousPassagesPlainText = continuationSource.result.passages
        .map((p) => {
          const plain = p.englishTaggedText.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$1');
          return p.docTitle ? `${p.docTitle}\n${plain}` : plain;
        })
        .join('\n\n')
        .slice(0, 3200);

      const todayWordSet = new Set(words.map((w) => w.trim().toLowerCase()));
      const seenCallbacks = new Set<string>();
      const callbackWords: string[] = [];
      for (const candidate of [
        ...continuationSource.wrongWords,
        ...continuationSource.inputWords,
      ]) {
        const lower = candidate.trim().toLowerCase();
        if (!lower || todayWordSet.has(lower) || seenCallbacks.has(lower)) continue;
        seenCallbacks.add(lower);
        callbackWords.push(candidate);
        if (callbackWords.length >= 3) break;
      }

      continuationPayload = {
        episodeNumber: nextEpisodeNumber,
        previousTitle: continuationSource.result.title,
        previousPassagesPlainText,
        callbackWords,
      };
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setProgressStep(
      continuationPayload
        ? `연재 #${continuationPayload.episodeNumber}화 세계관 연결 중...`
        : '영단어 문맥 분석 중...'
    );

    const t1 = window.setTimeout(() => {
      setProgressStep('맞춤형 영어 지문 작성 중...');
    }, 2200);
    const t2 = window.setTimeout(() => {
      setProgressStep('단어 누락 검수 및 퀴즈 생성 중...');
    }, 5200);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words,
          style: selectedStyle,
          lengthMode: selectedLength,
          continuation: continuationPayload,
        }),
      });

      const payload = (await response.json()) as GeneratedStudyResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || '지문 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }

      const newSession: StudySession = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        inputWords: words,
        style: selectedStyle,
        lengthMode: selectedLength,
        result: payload,
        quizAnswers: {},
        wrongWords: [],
        reviewCount: 0,
        episodeNumber: continuationPayload ? continuationPayload.episodeNumber : 1,
        parentSessionId: continuationSource ? continuationSource.id : undefined,
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      if (continuationPayload) {
        setContinuationSourceId(newSession.id);
      }
      setActiveTab('passage');

      window.setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '요청 처리 중 문제가 발생했습니다.'
      );
    } finally {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      setIsGenerating(false);
      setProgressStep('');
    }
  };

  const handleSelectSession = (session: StudySession) => {
    setActiveSessionId(session.id);
    setRawInput(session.inputWords.join(', '));
    setSelectedStyle(session.style);
    setSelectedLength(session.lengthMode);
    setActiveTab('passage');
    setWorkspaceView('study');
    setErrorMessage(null);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  const handleNewStudy = () => {
    setRawInput('');
    setActiveSessionId(null);
    setWorkspaceView('study');
    setErrorMessage(null);
    window.setTimeout(() => {
      document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleSelectQuizAnswer = (questionId: number, optionIndex: number) => {
    if (!activeSession) return;
    const question = activeSession.result.quizzes.find((q) => q.id === questionId);
    const isWrong = Boolean(question && question.correctIndex !== optionIndex);
    if (isWrong && question?.targetWord) {
      resetWordsInMastery([question.targetWord]);
    }
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        let nextWrongWords = s.wrongWords;
        if (isWrong && question?.targetWord) {
          const exists = nextWrongWords.some(
            (w) => w.trim().toLowerCase() === question.targetWord.trim().toLowerCase()
          );
          if (!exists) {
            nextWrongWords = [...nextWrongWords, question.targetWord];
          }
        }
        return {
          ...s,
          quizAnswers: {
            ...(s.quizAnswers ?? {}),
            [questionId]: optionIndex,
          },
          wrongWords: nextWrongWords,
        };
      })
    );
  };

  const handleToggleStarWord = (word: string) => {
    if (!activeSession) return;
    const normalized = word.trim().toLowerCase();
    const currentlyExists = activeSession.wrongWords.some(
      (w) => w.trim().toLowerCase() === normalized
    );
    if (!currentlyExists) {
      resetWordsInMastery([word]);
    }
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        const exists = s.wrongWords.some((w) => w.trim().toLowerCase() === normalized);
        const nextWrongWords = exists
          ? s.wrongWords.filter((w) => w.trim().toLowerCase() !== normalized)
          : [...s.wrongWords, word];
        return {
          ...s,
          wrongWords: nextWrongWords,
        };
      })
    );
  };

  const handleResetQuiz = () => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, quizAnswers: {} } : s))
    );
  };

  const handleRetryWrongWords = (wrongWords: string[]) => {
    setRawInput(wrongWords.join(', '));
    setSelectedLength(wrongWords.length >= 24 ? 'long_triple' : 'short');
    setWorkspaceView('study');
    setErrorMessage(null);
    window.setTimeout(() => {
      document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleEbbinghausReadExisting = (session: StudySession) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === session.id ? { ...s, reviewCount: (s.reviewCount ?? 0) + 1 } : s
      )
    );
    setActiveSessionId(session.id);
    setRawInput(session.inputWords.join(', '));
    setSelectedStyle(session.style);
    setSelectedLength(session.lengthMode);
    setActiveTab('passage');
    setWorkspaceView('study');
    setErrorMessage(null);
    window.setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleEbbinghausGenerateFromWrongWords = (
    words: string[],
    sourceSession: StudySession
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sourceSession.id
          ? { ...s, reviewCount: (s.reviewCount ?? 0) + 1 }
          : s
      )
    );
    setRawInput(words.join(', '));
    setSelectedStyle('web_novel');
    setSelectedLength(words.length >= 24 ? 'long_triple' : 'short');
    setWorkspaceView('study');
    setErrorMessage(null);
    window.setTimeout(() => {
      document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleMarkWordConfused = (word: string) => {
    const key = word.trim().toLowerCase();
    if (!key) return;
    const now = new Date().toISOString();
    setMasteryMap((prev) => ({
      ...prev,
      [key]: {
        word: prev[key]?.word || word.trim(),
        streak: 0,
        mastered: false,
        lastReviewedAt: now,
      },
    }));
  };

  const handleMarkWordMasteredStep = (
    word: string
  ): { graduated: boolean; newStreak: number } => {
    const key = word.trim().toLowerCase();
    if (!key) return { graduated: false, newStreak: 0 };
    const prevStreak = masteryMap[key]?.streak ?? 0;
    const newStreak = prevStreak + 1;
    const graduated = newStreak >= 3;
    const now = new Date().toISOString();

    setMasteryMap((prev) => ({
      ...prev,
      [key]: {
        word: prev[key]?.word || word.trim(),
        streak: newStreak,
        mastered: graduated,
        masteredAt: graduated ? now : undefined,
        lastReviewedAt: now,
      },
    }));

    if (graduated) {
      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          wrongWords: s.wrongWords.filter((w) => w.trim().toLowerCase() !== key),
        }))
      );
    }

    return { graduated, newStreak };
  };

  const handleUnmasterWord = (word: string) => {
    const key = word.trim().toLowerCase();
    if (!key) return;
    const now = new Date().toISOString();
    setMasteryMap((prev) => ({
      ...prev,
      [key]: {
        word: prev[key]?.word || word.trim(),
        streak: 0,
        mastered: false,
        lastReviewedAt: now,
      },
    }));

    setSessions((prev) => {
      if (prev.length === 0) return prev;
      const alreadyInWrongWords = prev.some((s) =>
        s.wrongWords.some((w) => w.trim().toLowerCase() === key)
      );
      if (alreadyInWrongWords) return prev;
      return prev.map((s, idx) =>
        idx === 0 ? { ...s, wrongWords: [...s.wrongWords, word.trim()] } : s
      );
    });
  };

  const handleSendTopWordsToInput = (topWords: string[]) => {
    if (topWords.length === 0) return;
    setRawInput(topWords.join(', '));
    setSelectedLength(topWords.length >= 24 ? 'long_triple' : 'short');
    setWorkspaceView('study');
    setErrorMessage(null);
    window.setTimeout(() => {
      document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleExportBackup = () => {
    try {
      const json = createStudyBackupJson(sessions, theme, masteryMap);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const todayStr = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vocastory-backup-${todayStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupStatus({
        type: 'success',
        message: `백업 완료: 총 ${sessions.length}개 학습 세트를 다운로드했습니다.`,
      });
    } catch {
      setBackupStatus({
        type: 'error',
        message: '백업 파일 생성 중 오류가 발생했습니다.',
      });
    }
  };

  const handleImportBackup = (jsonText: string) => {
    try {
      const result = parseAndMergeBackupJson(jsonText, sessions, masteryMap);
      setSessions(result.sessions);
      if (result.restoredMastery) {
        setMasteryMap(result.restoredMastery);
      }
      if (!activeSessionId && result.sessions.length > 0) {
        setActiveSessionId(result.sessions[0].id);
        setRawInput(result.sessions[0].inputWords.join(', '));
      }
      if (sessions.length === 0 && result.restoredTheme) {
        setTheme(result.restoredTheme);
      }
      setBackupStatus({
        type: 'success',
        message: `복원 완료 (신규 ${result.addedCount}건 · 병합 ${result.mergedCount}건)`,
      });
    } catch (err) {
      setBackupStatus({
        type: 'error',
        message: err instanceof Error ? err.message : '데이터 복원에 실패했습니다.',
      });
    }
  };

  const handleLaunchMockExam = async (
    targetSession?: StudySession,
    forceRegenerate: boolean = false
  ) => {
    const session = targetSession ?? activeSession;
    if (!session) return;

    setActiveSessionId(session.id);
    setRawInput(session.inputWords.join(', '));
    setSelectedStyle(session.style);
    setSelectedLength(session.lengthMode);
    setActiveTab('mock_exam');
    setWorkspaceView('study');
    setMockExamError(null);

    if (session.mockExam && !forceRegenerate) {
      window.setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return;
    }

    setIsGeneratingMockExam(true);
    window.setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);

    try {
      const response = await fetch('/api/generate-mock-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: session.inputWords,
          sessionTitle: session.result.title,
        }),
      });

      const payload = (await response.json()) as MockExamData & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || '실전 모의고사 생성에 실패했습니다.');
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id
            ? {
                ...s,
                mockExam: payload,
                mockExamAnswers: {},
                mockExamSubmitted: false,
              }
            : s
        )
      );
    } catch (err) {
      setMockExamError(
        err instanceof Error ? err.message : '모의고사 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setIsGeneratingMockExam(false);
    }
  };

  const handleSelectMockExamAnswer = (questionId: number, optionIndex: number) => {
    if (!activeSession || activeSession.mockExamSubmitted) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              mockExamAnswers: {
                ...(s.mockExamAnswers ?? {}),
                [questionId]: optionIndex,
              },
            }
          : s
      )
    );
  };

  const handleSubmitMockExam = () => {
    if (!activeSession || !activeSession.mockExam) return;
    const answers = activeSession.mockExamAnswers ?? {};
    const newlyWrongWords: string[] = [];

    for (const q of activeSession.mockExam.questions) {
      if (answers[q.id] !== q.correctIndex && q.targetWord) {
        newlyWrongWords.push(q.targetWord);
      }
    }

    if (newlyWrongWords.length > 0) {
      resetWordsInMastery(newlyWrongWords);
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        const existingLower = new Set(s.wrongWords.map((w) => w.trim().toLowerCase()));
        const mergedWrong = [...s.wrongWords];
        for (const w of newlyWrongWords) {
          const k = w.trim().toLowerCase();
          if (k && !existingLower.has(k)) {
            existingLower.add(k);
            mergedWrong.push(w);
          }
        }
        return {
          ...s,
          mockExamSubmitted: true,
          wrongWords: mergedWrong,
        };
      })
    );
  };

  const handleResetMockExam = () => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, mockExamAnswers: {}, mockExamSubmitted: false }
          : s
      )
    );
  };

  const totalInputWords = activeSession?.inputWords.length ?? 0;
  const includedCount = activeSession?.result.included_words.length ?? 0;
  const missingWords = activeSession?.result.missing_words ?? [];
  const isAllIncluded = totalInputWords > 0 && missingWords.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-slate-100 transition-colors">
      {/* Top Bar (3-zone clean header) */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileHistoryOpen(true)}
            aria-label="학습 히스토리 열기"
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setWorkspaceView('study');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            VocaStory Studio
          </button>
        </div>

        <nav
          aria-label="주요 학습 모드"
          className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <button
            type="button"
            onClick={() => setWorkspaceView('study')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              workspaceView === 'study'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpenText className="w-3.5 h-3.5 shrink-0" />
            <span>스토리 학습</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceView('flashcards')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              workspaceView === 'flashcards'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span>🔥 취약 단어 벼락치기</span>
            <span
              className={`font-mono-tabular text-[11px] px-1.5 py-0.5 rounded ${
                workspaceView === 'flashcards'
                  ? 'bg-slate-950/15 text-slate-950'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              }`}
            >
              {activeWeakWordsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceView('report')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              workspaceView === 'report'
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>📊 학습 리포트</span>
          </button>

          {workspaceView === 'study' && activeSession && (
            <>
              <span
                aria-hidden="true"
                className="hidden xl:inline-block h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1.5"
              />
              <button
                type="button"
                onClick={() => {
                  setActiveTab('passage');
                  document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden xl:inline-flex px-2 py-1 rounded text-xs text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                지문
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('vocabulary');
                  document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden xl:inline-flex px-2 py-1 rounded text-xs text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                단어표
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quiz');
                  document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden xl:inline-flex px-2 py-1 rounded text-xs text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                퀴즈
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('mock_exam');
                  document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden xl:inline-flex px-2 py-1 rounded text-xs text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                모의고사
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>라이트 모드</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span>다크 모드</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Workspace Switcher (< md) */}
      <nav
        aria-label="모바일 학습 메뉴"
        className="md:hidden sticky top-16 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm px-3 py-2 flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() => setWorkspaceView('study')}
          className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            workspaceView === 'study'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70'
          }`}
        >
          <span>스토리 학습</span>
        </button>
        <button
          type="button"
          onClick={() => setWorkspaceView('flashcards')}
          className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            workspaceView === 'flashcards'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70'
          }`}
        >
          <span>🔥 벼락치기</span>
          <span className="font-mono-tabular text-[11px] opacity-80">
            ({activeWeakWordsCount})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setWorkspaceView('report')}
          className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            workspaceView === 'report'
              ? 'bg-indigo-600 text-white dark:bg-indigo-500'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70'
          }`}
        >
          <span>📊 리포트</span>
        </button>
      </nav>

      {/* Main Workspace Layout: Left History Sidebar + Content Stage */}
      <div className="flex-1 flex min-w-0">
        <HistorySidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewStudy={handleNewStudy}
          onLaunchMockExam={(s) => handleLaunchMockExam(s, false)}
          isGeneratingMockExam={isGeneratingMockExam}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          backupStatus={backupStatus}
          isMobileOpen={isMobileHistoryOpen}
          onCloseMobile={() => setIsMobileHistoryOpen(false)}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            {workspaceView === 'flashcards' ? (
              <WeakWordFlashcards
                sessions={sessions}
                masteryMap={masteryMap}
                onMarkConfused={handleMarkWordConfused}
                onMarkMasteredStep={handleMarkWordMasteredStep}
                onUnmasterWord={handleUnmasterWord}
                onGoToStudy={() => setWorkspaceView('study')}
              />
            ) : workspaceView === 'report' ? (
              <LearningReportDashboard
                sessions={sessions}
                masteryMap={masteryMap}
                onSendTopWordsToInput={handleSendTopWordsToInput}
                onGoToStudy={() => setWorkspaceView('study')}
              />
            ) : (
              <>
                <EbbinghausBanner
                  dueItems={dueItems}
                  recent7DaysWrongWords={recent7DaysWrongWords}
                  onReadExisting={handleEbbinghausReadExisting}
                  onGenerateFromWrongWords={handleEbbinghausGenerateFromWrongWords}
                />

                <WordInputPanel
                  rawInput={rawInput}
                  onRawInputChange={setRawInput}
                  historyEntries={historyAutocompleteEntries}
                  recentWrongWords={recent7DaysWrongWords}
                  selectedStyle={selectedStyle}
                  onStyleChange={setSelectedStyle}
                  selectedLength={selectedLength}
                  onLengthChange={setSelectedLength}
                  sessions={sessions}
                  isContinuationEnabled={isContinuationEnabled}
                  onContinuationToggle={handleContinuationToggle}
                  continuationSourceId={continuationSourceId}
                  onContinuationSourceChange={handleContinuationSourceChange}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  progressStep={progressStep}
                  errorMessage={errorMessage}
                />

                {/* Generated Result Workspace */}
                {activeSession ? (
              <section id="result-section" className="space-y-5">
                {/* Inclusion Coverage Banner & Metadata */}
                <div className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 px-5 py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 text-balance">
                        {activeSession.result.title}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          {PASSAGE_STYLES.find((s) => s.id === activeSession.style)?.shortLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {activeSession.lengthMode === 'long_triple'
                            ? '장편 삼중 연계 지문 ([문서 1~3])'
                            : '단편 지문'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          목표 단어 {totalInputWords}개
                        </span>
                      </div>
                    </div>

                    {/* Word Inclusion Coverage Indicator & Mock Exam CTA */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        disabled={isGeneratingMockExam}
                        onClick={() =>
                          handleLaunchMockExam(activeSession, !activeSession.mockExam)
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        <Headphones className="w-4 h-4 shrink-0" />
                        <span>
                          {activeSession.mockExam
                            ? '실전 모의고사(20문제) 보기'
                            : '이 날의 단어로 실전 모의고사(20문제) 생성'}
                        </span>
                      </button>

                      <div
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold shrink-0 ${
                          isAllIncluded
                            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                        }`}
                      >
                        {isAllIncluded ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span className="font-mono-tabular">
                              입력 단어 반영률: {includedCount}/{totalInputWords}개 모두 포함됨
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span className="font-mono-tabular">
                              입력 단어 반영률: {includedCount}/{totalInputWords}개 (누락 {missingWords.length}개)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isAllIncluded && missingWords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-amber-700 dark:text-amber-300">
                      <span className="font-semibold">미포함 단어 안내: </span>
                      <span>{missingWords.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Focused Study Tabs */}
                <div
                  role="tablist"
                  aria-label="학습 메뉴"
                  className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 overflow-x-auto"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'passage'}
                    onClick={() => setActiveTab('passage')}
                    className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'passage'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <BookOpenText className="w-4 h-4 shrink-0" />
                    <span>지문 학습</span>
                    <span className="font-mono-tabular text-xs opacity-75">
                      ({activeSession.result.passages.length})
                    </span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'vocabulary'}
                    onClick={() => setActiveTab('vocabulary')}
                    className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'vocabulary'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    <span>핵심 단어표</span>
                    <span className="font-mono-tabular text-xs opacity-75">
                      ({activeSession.result.vocabulary_table.length})
                    </span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'quiz'}
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'quiz'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>실전 퀴즈</span>
                    <span className="font-mono-tabular text-xs opacity-75">
                      ({activeSession.result.quizzes.length})
                    </span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'mock_exam'}
                    onClick={() => setActiveTab('mock_exam')}
                    className={`flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'mock_exam'
                        ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Headphones className="w-4 h-4 shrink-0" />
                    <span>모의고사 (20)</span>
                  </button>
                </div>

                {/* Active Tab Content */}
                {activeTab === 'passage' && (
                  <PassageReader
                    passages={activeSession.result.passages}
                    vocabularyTable={activeSession.result.vocabulary_table}
                    wordMeanings={activeSession.result.word_meanings}
                    sessionKey={activeSession.id}
                  />
                )}

                {activeTab === 'vocabulary' && (
                  <VocabularyTable
                    entries={activeSession.result.vocabulary_table}
                    wrongWords={activeSession.wrongWords}
                    onToggleStarWord={handleToggleStarWord}
                  />
                )}

                {activeTab === 'quiz' && (
                  <QuizSection
                    quizzes={activeSession.result.quizzes}
                    answers={activeSession.quizAnswers ?? {}}
                    onSelectAnswer={handleSelectQuizAnswer}
                    onResetQuiz={handleResetQuiz}
                    onRetryWrongWords={handleRetryWrongWords}
                  />
                )}

                {activeTab === 'mock_exam' && (
                  <MockExamPanel
                    sessionTitle={activeSession.result.title}
                    exam={activeSession.mockExam}
                    answers={activeSession.mockExamAnswers ?? {}}
                    isSubmitted={Boolean(activeSession.mockExamSubmitted)}
                    isGenerating={isGeneratingMockExam}
                    errorMessage={mockExamError}
                    onGenerateExam={() => handleLaunchMockExam(activeSession, true)}
                    onSelectAnswer={handleSelectMockExamAnswer}
                    onSubmitExam={handleSubmitMockExam}
                    onResetExam={handleResetMockExam}
                    onRetryWrongWords={handleRetryWrongWords}
                  />
                )}
              </section>
            ) : (
              /* Clean Empty / Onboarding Guide */
              <section className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-[#0E1625]/60 px-6 py-10">
                <div className="max-w-2xl mx-auto text-center">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                    단어를 입력해 첫 번째 맞춤형 복습 스토리를 만들어 보세요
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    위 입력창에 오늘 암기한 영단어들을 붙여넣거나 상단{' '}
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      단편 예시(18단어) / 장편 예시(36단어)
                    </span>{' '}
                    버튼을 눌러 바로 체험할 수 있습니다.
                  </p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-slate-600 dark:text-slate-400">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        01. 단어 누락 제로
                      </div>
                      <p className="leading-relaxed">
                        시제·복수형·파생어로 변형되어도 노란색 하이라이트와 클릭 뜻 미리보기로 정확히 확인할 수 있습니다.
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        02. 원어민 TTS & 해석
                      </div>
                      <p className="leading-relaxed">
                        0.8x~1.2x 배속 조절 원어민 음성을 들으며 독해한 뒤, 필요할 때만 한국어 해석을 펼쳐 확인하세요.
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        03. 오답 단어 재학습
                      </div>
                      <p className="leading-relaxed">
                        토익 RC 실전 퀴즈(Part 5·6·7)에서 틀린 단어들만 버튼 한 번으로 다시 입력창에 모아 새 지문으로 복습합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
