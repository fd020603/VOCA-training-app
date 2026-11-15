export type PassageStyleId =
  | 'toeic_business'
  | 'economy_it_news'
  | 'daily_story'
  | 'web_novel';

export type LengthMode = 'short' | 'long_triple';

export interface PassageItem {
  docNumber: number;
  docTypeLabel: string;
  docTitle: string;
  englishTaggedText: string;
  koreanTranslation: string;
}

export interface VocabularyEntry {
  word: string;
  matchedForm: string;
  partOfSpeech: string;
  coreMeaning: string;
  contextMeaning: string;
  pronunciationStressKo?: string;
  lcParaphrases?: string[];
  collocations?: string[];
  synonymNuance?: string;
}

export interface WordMeaningEntry {
  partOfSpeech: string;
  meaning: string;
  baseWord?: string;
}

export type ToeicQuizType =
  | 'part5_word_family'
  | 'part5_synonym_vocab'
  | 'part6_context_insertion'
  | 'part7_synonym_in_context'
  | 'part7_reading_inference';

export interface QuizDistractorNote {
  option: string;
  meaningKo: string;
  reasonKo: string;
}

export interface QuizQuestion {
  id: number;
  quizType?: ToeicQuizType;
  typeBadge?: string;
  targetWord: string;
  excerptParagraph?: string;
  questionSentence: string;
  options: string[];
  correctIndex: number;
  koreanTranslation?: string;
  answerReason?: string;
  distractorNotes?: QuizDistractorNote[];
  koreanExplanation: string;
}

export interface MockExamDialogueTurn {
  speaker: 'Man' | 'Woman' | 'Narrator';
  line: string;
}

export interface MockExamLcPassage {
  id: string; // e.g., 'lc_part3', 'lc_part4'
  part: 'Part 3' | 'Part 4';
  titleKo: string;
  contextLabel: string;
  turns: MockExamDialogueTurn[];
  koreanTranslation: string;
}

export interface MockExamRcPassage {
  id: string; // e.g., 'rc_part6', 'rc_part7'
  part: 'Part 6' | 'Part 7';
  docTypeLabel: string;
  docTitle: string;
  englishText: string;
  koreanTranslation: string;
}

export interface MockExamQuestion {
  id: number; // 1..20
  section: 'LC' | 'RC';
  part: 'Part 2' | 'Part 3' | 'Part 4' | 'Part 5' | 'Part 6' | 'Part 7';
  typeBadge: string;
  passageId?: string;
  targetWord: string;
  spokenPrompt?: string; // For Part 2 spoken question
  questionText: string; // For Part 3/4/5/6/7 visible stem (Part 2 shows generic instruction until script revealed)
  options: string[]; // 3 for Part 2, 4 for Part 3/4/5/6/7
  correctIndex: number;
  koreanTranslation: string;
  koreanExplanation: string;
  paraphrasePoint: string;
}

export interface MockExamData {
  generatedAt: string;
  sourceWords: string[];
  lcPassages: MockExamLcPassage[];
  rcPassages: MockExamRcPassage[];
  questions: MockExamQuestion[];
}

export interface GeneratedStudyResponse {
  title: string;
  passages: PassageItem[];
  included_words: string[];
  missing_words: string[];
  vocabulary_table: VocabularyEntry[];
  word_meanings?: Record<string, WordMeaningEntry>;
  quizzes: QuizQuestion[];
}

export interface ContinuationContext {
  episodeNumber: number;
  previousTitle: string;
  previousPassagesPlainText: string;
  callbackWords: string[];
}

export interface StudySession {
  id: string;
  createdAt: string;
  inputWords: string[];
  style: PassageStyleId;
  lengthMode: LengthMode;
  result: GeneratedStudyResponse;
  quizAnswers?: Record<number, number>;
  wrongWords: string[];
  reviewCount: number;
  episodeNumber?: number;
  parentSessionId?: string;
  mockExam?: MockExamData;
  mockExamAnswers?: Record<number, number>;
  mockExamSubmitted?: boolean;
}

export interface WordMasteryRecord {
  word: string;
  streak: number;
  mastered: boolean;
  masteredAt?: string;
  lastReviewedAt?: string;
}

export const PASSAGE_STYLES: Array<{
  id: PassageStyleId;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: 'toeic_business',
    label: '토익 Part 7 비즈니스 문서 (이메일/사내 공지/기사)',
    shortLabel: '토익 Part 7 비즈니스',
    description: '실전 비즈니스 이메일, 사내 공지사항, 보도자료 형식',
  },
  {
    id: 'economy_it_news',
    label: '경제/IT 최신 뉴스 기사',
    shortLabel: '경제/IT 뉴스',
    description: '글로벌 테크 산업, 시장 동향, 스타트업 분석 기사',
  },
  {
    id: 'daily_story',
    label: '일상 대화 및 짧은 스토리',
    shortLabel: '일상 대화/스토리',
    description: '자연스러운 구어체 대화와 일상의 에피소드',
  },
  {
    id: 'web_novel',
    label: '남성향 웹소설',
    shortLabel: '남성향 웹소설',
    description: '헌터/회귀/기업물/액션 판타지 스타일의 몰입형 스토리',
  },
];

export const LENGTH_MODES: Array<{
  id: LengthMode;
  title: string;
  subtitle: string;
  wordRange: string;
  quizCount: number;
}> = [
  {
    id: 'short',
    title: '단편 지문',
    subtitle: '약 250~300단어 · 단어 15~20개용',
    wordRange: '250~300단어',
    quizCount: 10,
  },
  {
    id: 'long_triple',
    title: '장편 지문 (삼중 연계)',
    subtitle: '약 550~650단어 · 단어 35~40개용 · [문서 1~3] 연계 구성',
    wordRange: '550~650단어',
    quizCount: 10,
  },
];
