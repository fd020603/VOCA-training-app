import type { StudySession, WordMasteryRecord } from '../types/study';

const HISTORY_STORAGE_KEY = 'vocastory_study_history_v1';
const THEME_STORAGE_KEY = 'vocastory_theme_v1';
const MASTERY_STORAGE_KEY = 'vocastory_word_mastery_v1';

export const EBBINGHAUS_INTERVAL_DAYS = [1, 3, 7, 14] as const;

export interface EbbinghausDueItem {
  session: StudySession;
  daysAgo: number;
}

export function getSessionEpisodeNumber(session: StudySession): number {
  if (typeof session.episodeNumber === 'number' && session.episodeNumber >= 1) {
    return session.episodeNumber;
  }
  const match = session.result?.title?.match(/\[연재\s*#(\d+)화\]/);
  if (match && match[1]) {
    const parsed = Number.parseInt(match[1], 10);
    if (!Number.isNaN(parsed) && parsed >= 1) return parsed;
  }
  return 1;
}

function mergeUniqueWords(a: string[], b: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const w of [...a, ...b]) {
    const clean = typeof w === 'string' ? w.trim() : '';
    const key = clean.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(clean);
  }
  return merged;
}

function normalizeSession(raw: unknown): StudySession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<StudySession>;
  if (!s.id || !s.createdAt || !Array.isArray(s.inputWords) || !s.result) return null;

  return {
    id: String(s.id),
    createdAt: String(s.createdAt),
    inputWords: s.inputWords.map((w) => String(w)),
    style: s.style ?? 'toeic_business',
    lengthMode: s.lengthMode ?? 'short',
    result: s.result,
    quizAnswers: s.quizAnswers ?? {},
    wrongWords: Array.isArray(s.wrongWords) ? s.wrongWords.map((w) => String(w)) : [],
    reviewCount: typeof s.reviewCount === 'number' ? s.reviewCount : 0,
    episodeNumber: typeof s.episodeNumber === 'number' ? s.episodeNumber : undefined,
    parentSessionId: typeof s.parentSessionId === 'string' ? s.parentSessionId : undefined,
    mockExam: s.mockExam && Array.isArray(s.mockExam.questions) ? s.mockExam : undefined,
    mockExamAnswers: s.mockExamAnswers ?? undefined,
    mockExamSubmitted: typeof s.mockExamSubmitted === 'boolean' ? s.mockExamSubmitted : undefined,
  };
}

export function loadStudyHistory(): StudySession[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeSession)
      .filter((s): s is StudySession => s !== null);
  } catch {
    return [];
  }
}

export function saveStudyHistory(sessions: StudySession[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessions.slice(0, 100)));
  } catch {
    // Ignore quota errors gracefully
  }
}

export interface StudyBackupPayload {
  app: 'VocaStory Studio';
  version: number;
  exportedAt: string;
  theme: 'dark' | 'light';
  sessions: StudySession[];
  wordMastery?: Record<string, WordMasteryRecord>;
}

export function loadWordMastery(): Record<string, WordMasteryRecord> {
  try {
    const raw = localStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const clean: Record<string, WordMasteryRecord> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!v || typeof v !== 'object') continue;
      const rec = v as Partial<WordMasteryRecord>;
      if (typeof rec.word !== 'string' || !rec.word.trim()) continue;
      clean[k.trim().toLowerCase()] = {
        word: rec.word.trim(),
        streak: typeof rec.streak === 'number' ? Math.max(0, rec.streak) : 0,
        mastered: Boolean(rec.mastered),
        masteredAt: typeof rec.masteredAt === 'string' ? rec.masteredAt : undefined,
        lastReviewedAt:
          typeof rec.lastReviewedAt === 'string' ? rec.lastReviewedAt : undefined,
      };
    }
    return clean;
  } catch {
    return {};
  }
}

export function saveWordMastery(map: Record<string, WordMasteryRecord>): void {
  try {
    localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota errors
  }
}

export function createStudyBackupJson(
  sessions: StudySession[],
  theme: 'dark' | 'light',
  wordMastery?: Record<string, WordMasteryRecord>
): string {
  const payload: StudyBackupPayload = {
    app: 'VocaStory Studio',
    version: 1,
    exportedAt: new Date().toISOString(),
    theme,
    sessions,
    wordMastery: wordMastery ?? loadWordMastery(),
  };
  return JSON.stringify(payload, null, 2);
}

export interface BackupRestoreResult {
  sessions: StudySession[];
  addedCount: number;
  mergedCount: number;
  restoredTheme?: 'dark' | 'light';
  restoredMastery?: Record<string, WordMasteryRecord>;
}

export function parseAndMergeBackupJson(
  rawJson: string,
  existingSessions: StudySession[],
  existingMastery: Record<string, WordMasteryRecord> = {}
): BackupRestoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('올바른 JSON 파일 형식이 아닙니다.');
  }

  let candidateArray: unknown[] | null = null;
  let restoredTheme: 'dark' | 'light' | undefined;
  let incomingMastery: Record<string, WordMasteryRecord> = {};

  if (Array.isArray(parsed)) {
    candidateArray = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Partial<StudyBackupPayload>;
    if (Array.isArray(obj.sessions)) {
      candidateArray = obj.sessions;
    }
    if (obj.theme === 'dark' || obj.theme === 'light') {
      restoredTheme = obj.theme;
    }
    if (obj.wordMastery && typeof obj.wordMastery === 'object') {
      incomingMastery = obj.wordMastery;
    }
  }

  if (!candidateArray) {
    throw new Error('백업 파일에서 학습 기록(sessions) 배열을 찾을 수 없습니다.');
  }

  const normalizedIncoming = candidateArray
    .map(normalizeSession)
    .filter((s): s is StudySession => s !== null);

  if (normalizedIncoming.length === 0 && candidateArray.length > 0) {
    throw new Error('복원할 수 있는 유효한 학습 기록이 없습니다.');
  }

  const map = new Map<string, StudySession>();
  for (const existing of existingSessions) {
    map.set(existing.id, existing);
  }

  let addedCount = 0;
  let mergedCount = 0;

  for (const incoming of normalizedIncoming) {
    const current = map.get(incoming.id);
    if (!current) {
      map.set(incoming.id, incoming);
      addedCount += 1;
    } else {
      map.set(incoming.id, {
        ...current,
        wrongWords: mergeUniqueWords(current.wrongWords, incoming.wrongWords),
        reviewCount: Math.max(current.reviewCount ?? 0, incoming.reviewCount ?? 0),
        quizAnswers: {
          ...(incoming.quizAnswers ?? {}),
          ...(current.quizAnswers ?? {}),
        },
        episodeNumber: current.episodeNumber ?? incoming.episodeNumber,
        parentSessionId: current.parentSessionId ?? incoming.parentSessionId,
        mockExam: current.mockExam ?? incoming.mockExam,
        mockExamAnswers: {
          ...(incoming.mockExamAnswers ?? {}),
          ...(current.mockExamAnswers ?? {}),
        },
        mockExamSubmitted: current.mockExamSubmitted || incoming.mockExamSubmitted,
      });
      mergedCount += 1;
    }
  }

  const mergedSessions = Array.from(map.values()).sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return tb - ta;
  });

  const mergedMastery: Record<string, WordMasteryRecord> = { ...existingMastery };
  for (const [key, rec] of Object.entries(incomingMastery)) {
    if (!rec || typeof rec.word !== 'string') continue;
    const normKey = key.trim().toLowerCase();
    const cur = mergedMastery[normKey];
    if (!cur) {
      mergedMastery[normKey] = rec;
    } else {
      mergedMastery[normKey] = {
        word: cur.word || rec.word,
        streak: Math.max(cur.streak ?? 0, rec.streak ?? 0),
        mastered: cur.mastered || rec.mastered,
        masteredAt: cur.masteredAt ?? rec.masteredAt,
        lastReviewedAt: cur.lastReviewedAt ?? rec.lastReviewedAt,
      };
    }
  }

  return {
    sessions: mergedSessions.slice(0, 100),
    addedCount,
    mergedCount,
    restoredTheme,
    restoredMastery: mergedMastery,
  };
}

export function computeStudyStreakDays(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;

  const dayKeys = new Set<string>();
  const toLocalDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  for (const s of sessions) {
    const d = new Date(s.createdAt);
    if (!Number.isNaN(d.getTime())) {
      dayKeys.add(toLocalDateKey(d));
    }
  }

  if (dayKeys.size === 0) return 0;

  const now = new Date();
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!dayKeys.has(toLocalDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.has(toLocalDateKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (dayKeys.has(toLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function loadThemePreference(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Fallback to default dark mode
  }
  return 'dark';
}

export function saveThemePreference(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage error
  }
}

export function getCalendarDaysAgo(isoDate: string, now: Date = new Date()): number {
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return -1;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((todayStart.getTime() - targetStart.getTime()) / (1000 * 60 * 60 * 24));
}

export function getEbbinghausDueSessions(sessions: StudySession[]): EbbinghausDueItem[] {
  const now = new Date();
  const due: EbbinghausDueItem[] = [];

  for (const session of sessions) {
    const daysAgo = getCalendarDaysAgo(session.createdAt, now);
    if ((EBBINGHAUS_INTERVAL_DAYS as readonly number[]).includes(daysAgo)) {
      due.push({ session, daysAgo });
    }
  }

  // Sort by most urgent/recent interval (1d -> 3d -> 7d -> 14d), then most wrong words
  due.sort((a, b) => {
    if (a.daysAgo !== b.daysAgo) return a.daysAgo - b.daysAgo;
    return b.session.wrongWords.length - a.session.wrongWords.length;
  });

  return due;
}

export function getRecentAccumulatedWrongWords(
  sessions: StudySession[],
  withinDays: number = 7
): string[] {
  const now = new Date();
  const seen = new Set<string>();
  const collected: string[] = [];

  for (const session of sessions) {
    const daysAgo = getCalendarDaysAgo(session.createdAt, now);
    if (daysAgo >= 0 && daysAgo <= withinDays) {
      for (const word of session.wrongWords) {
        const key = word.trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          collected.push(word);
        }
      }
    }
  }

  return collected;
}

export function formatKoreanDateGroup(isoDate: string): string {
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return '날짜 미상';

  const diffDays = getCalendarDaysAgo(isoDate);

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';

  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function formatTimeShort(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
